#!/usr/bin/env python3
"""
IXI Dataset Image Preparation Pipeline
Downloads T1 and T2 MRI volumes, extracts middle axial slices, and converts to PNG.
"""

import argparse
import json
import logging
import os
import tarfile
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple

import nibabel as nib
import numpy as np
import requests
from PIL import Image
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

IXI_URLS = {
    't1': 'http://biomedic.doc.ic.ac.uk/brain-development/downloads/IXI/IXI-T1.tar',
    't2': 'http://biomedic.doc.ic.ac.uk/brain-development/downloads/IXI/IXI-T2.tar'
}


def download_file(url: str, output_path: Path) -> None:
    """Download a file with progress bar."""
    logger.info(f"Downloading {url} to {output_path}")
    response = requests.get(url, stream=True)
    response.raise_for_status()

    total_size = int(response.headers.get('content-length', 0))

    with open(output_path, 'wb') as f, tqdm(
        desc=output_path.name,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as pbar:
        for chunk in response.iter_content(chunk_size=8192):
            size = f.write(chunk)
            pbar.update(size)


def process_nifti_to_png(nifti_path: Path, output_path: Path) -> bool:
    """
    Process a single NIfTI file: extract middle axial slice, window, normalize, save as PNG.

    Args:
        nifti_path: Path to .nii.gz file
        output_path: Path to save PNG

    Returns:
        True if successful, False otherwise
    """
    try:
        # Load NIfTI
        img = nib.load(str(nifti_path))
        data = img.get_fdata()

        # Extract middle axial slice (z dimension)
        middle_slice = data.shape[2] // 2
        slice_data = data[:, :, middle_slice]

        # Apply percentile-based windowing (2nd to 98th percentile)
        p2, p98 = np.percentile(slice_data, [2, 98])
        slice_data = np.clip(slice_data, p2, p98)

        # Normalize to 0-255 uint8
        if p98 > p2:
            slice_data = ((slice_data - p2) / (p98 - p2) * 255).astype(np.uint8)
        else:
            slice_data = np.zeros_like(slice_data, dtype=np.uint8)

        # Save as PNG
        img_pil = Image.fromarray(slice_data.T)  # Transpose for correct orientation
        img_pil = img_pil.rotate(-90, expand=True)  # Adjust orientation
        img_pil.save(output_path)

        return True
    except Exception as e:
        logger.warning(f"Failed to process {nifti_path}: {e}")
        return False


def extract_and_process_tar(
    tar_path: Path,
    output_dir: Path,
    image_type: str,
    max_count: int
) -> List[Dict[str, str]]:
    """
    Extract NIfTI files from tar and process to PNG.

    Args:
        tar_path: Path to .tar file
        output_dir: Directory to save PNG files
        image_type: 'T1' or 'T2'
        max_count: Maximum number of images to process

    Returns:
        List of metadata dicts for processed images
    """
    metadata = []
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"Extracting and processing {tar_path} ({image_type})")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)

        # Extract tar
        logger.info("Extracting tar file...")
        with tarfile.open(tar_path, 'r') as tar:
            tar.extractall(tmpdir_path)

        # Find all .nii.gz files
        nifti_files = sorted(tmpdir_path.rglob('*.nii.gz'))[:max_count]

        logger.info(f"Processing {len(nifti_files)} NIfTI files...")
        for nifti_file in tqdm(nifti_files, desc=f"Processing {image_type}"):
            # Extract subject ID and create filename
            # Example: IXI001-Guys-0001-T1.nii.gz -> IXI001-Guys-0001-T1.png
            stem = nifti_file.stem
            if stem.endswith('.nii'):
                stem = stem[:-4]

            png_filename = f"{stem}.png"
            png_path = output_dir / png_filename

            # Process
            if process_nifti_to_png(nifti_file, png_path):
                # Extract subject ID (e.g., IXI001 from IXI001-Guys-0001-T1)
                parts = stem.split('-')
                subject_id = parts[0] if parts else stem

                # Generate unique ID
                image_id = f"{subject_id}-{image_type}"

                metadata.append({
                    'id': image_id,
                    'filename': png_filename,
                    'type': image_type,
                    'subject': subject_id
                })

    logger.info(f"Successfully processed {len(metadata)} {image_type} images")
    return metadata


def main():
    parser = argparse.ArgumentParser(description='Prepare IXI dataset images for quiz')
    parser.add_argument('--output-dir', type=str, default='public/images',
                        help='Output directory for images')
    parser.add_argument('--metadata-output', type=str, default='src/data/metadata.json',
                        help='Output path for metadata JSON')
    parser.add_argument('--max-per-type', type=int, default=500,
                        help='Maximum images per type (T1/T2)')
    parser.add_argument('--skip-download', action='store_true',
                        help='Skip download step (use existing tar files)')
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    metadata_output = Path(args.metadata_output)

    # Create output directories
    output_dir.mkdir(parents=True, exist_ok=True)
    metadata_output.parent.mkdir(parents=True, exist_ok=True)

    # Download tar files if needed
    tar_dir = Path('data/raw')
    tar_dir.mkdir(parents=True, exist_ok=True)

    tar_files = {}
    for image_type, url in IXI_URLS.items():
        tar_path = tar_dir / f"IXI-{image_type.upper()}.tar"
        tar_files[image_type] = tar_path

        if not args.skip_download or not tar_path.exists():
            download_file(url, tar_path)
        else:
            logger.info(f"Using existing tar file: {tar_path}")

    # Process each type
    all_metadata = []

    for image_type in ['t1', 't2']:
        tar_path = tar_files[image_type]
        type_output_dir = output_dir / image_type

        metadata = extract_and_process_tar(
            tar_path,
            type_output_dir,
            image_type.upper(),
            args.max_per_type
        )
        all_metadata.extend(metadata)

    # Generate metadata JSON
    metadata_json = {
        'images': all_metadata,
        'stats': {
            'total': len(all_metadata),
            't1Count': sum(1 for img in all_metadata if img['type'] == 'T1'),
            't2Count': sum(1 for img in all_metadata if img['type'] == 'T2')
        }
    }

    with open(metadata_output, 'w') as f:
        json.dump(metadata_json, f, indent=2)

    logger.info(f"Metadata written to {metadata_output}")
    logger.info(f"Total images: {metadata_json['stats']['total']}")
    logger.info(f"T1: {metadata_json['stats']['t1Count']}, T2: {metadata_json['stats']['t2Count']}")


if __name__ == '__main__':
    main()
