#!/usr/bin/env python3
"""
Test pipeline processing logic without requiring IXI dataset download.
Creates synthetic NIfTI files and verifies processing.
"""

import json
import os
import shutil
import tempfile
from pathlib import Path

import nibabel as nib
import numpy as np
from PIL import Image


def create_synthetic_nifti(output_path: Path, shape: tuple = (64, 64, 64)) -> None:
    """Create a synthetic 3D NIfTI file with random data."""
    data = np.random.rand(*shape) * 1000
    img = nib.Nifti1Image(data, affine=np.eye(4))
    nib.save(img, str(output_path))


def process_nifti_to_png(nifti_path: Path, output_path: Path) -> bool:
    """
    Process a single NIfTI file: extract middle axial slice, window, normalize, save as PNG.
    (Same function as in prepare_images.py)
    """
    try:
        img = nib.load(str(nifti_path))
        data = img.get_fdata()

        middle_slice = data.shape[2] // 2
        slice_data = data[:, :, middle_slice]

        p2, p98 = np.percentile(slice_data, [2, 98])
        slice_data = np.clip(slice_data, p2, p98)

        if p98 > p2:
            slice_data = ((slice_data - p2) / (p98 - p2) * 255).astype(np.uint8)
        else:
            slice_data = np.zeros_like(slice_data, dtype=np.uint8)

        img_pil = Image.fromarray(slice_data.T)
        img_pil = img_pil.rotate(-90, expand=True)
        img_pil.save(output_path)

        return True
    except Exception as e:
        print(f"Failed to process {nifti_path}: {e}")
        return False


def generate_metadata(image_list: list, source_type: str) -> dict:
    """Generate metadata for images."""
    metadata = []
    for filename in image_list:
        stem = Path(filename).stem
        parts = stem.split('-')
        subject_id = parts[0] if parts else stem
        image_type = source_type.upper()

        metadata.append({
            'id': f"{subject_id}-{image_type}",
            'filename': filename,
            'type': image_type,
            'subject': subject_id
        })

    return {
        'images': metadata,
        'stats': {
            'total': len(metadata),
            't1Count': sum(1 for img in metadata if img['type'] == 'T1'),
            't2Count': sum(1 for img in metadata if img['type'] == 'T2')
        }
    }


def test_processing():
    """Test the complete processing pipeline."""
    print("Testing NIfTI processing pipeline...")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)

        # Test 1: Create synthetic NIfTI
        print("✓ Test 1: Creating synthetic NIfTI file...")
        nifti_path = tmpdir_path / "test-subject-001-T1.nii.gz"
        create_synthetic_nifti(nifti_path, shape=(64, 64, 64))
        assert nifti_path.exists(), "Failed to create NIfTI file"
        print("  ✓ Synthetic NIfTI created successfully")

        # Test 2: Process to PNG
        print("✓ Test 2: Processing NIfTI to PNG...")
        png_path = tmpdir_path / "test-subject-001-T1.png"
        success = process_nifti_to_png(nifti_path, png_path)
        assert success, "Failed to process NIfTI"
        assert png_path.exists(), "PNG output not created"
        print("  ✓ PNG created successfully")

        # Test 3: Verify PNG dimensions
        print("✓ Test 3: Verifying PNG dimensions...")
        img = Image.open(png_path)
        assert img.size[0] > 0 and img.size[1] > 0, "Invalid PNG dimensions"
        print(f"  ✓ PNG dimensions: {img.size}")

        # Test 4: Test metadata generation
        print("✓ Test 4: Testing metadata generation...")
        test_files_t1 = ["IXI001-Guys-001-T1.png", "IXI002-Guys-002-T1.png"]
        test_files_t2 = ["IXI001-Guys-001-T2.png", "IXI002-Guys-002-T2.png"]

        metadata_t1 = generate_metadata(test_files_t1, 't1')
        metadata_t2 = generate_metadata(test_files_t2, 't2')

        assert len(metadata_t1['images']) == 2, "Wrong T1 count"
        assert len(metadata_t2['images']) == 2, "Wrong T2 count"
        assert all(img['type'] == 'T1' for img in metadata_t1['images']), "T1 label incorrect"
        assert all(img['type'] == 'T2' for img in metadata_t2['images']), "T2 label incorrect"
        print("  ✓ Metadata format correct")

        # Test 5: Verify label assignment
        print("✓ Test 5: Verifying label assignment from source...")
        assert metadata_t1['images'][0]['type'] == 'T1', "T1 label not from t1 source"
        assert metadata_t2['images'][0]['type'] == 'T2', "T2 label not from t2 source"
        assert metadata_t1['stats']['t1Count'] == 2, "T1 count incorrect"
        assert metadata_t2['stats']['t2Count'] == 2, "T2 count incorrect"
        print("  ✓ Labels correctly derived from source type")

        # Test 6: Combined metadata
        print("✓ Test 6: Testing combined metadata...")
        combined = {
            'images': metadata_t1['images'] + metadata_t2['images'],
            'stats': {
                'total': len(metadata_t1['images']) + len(metadata_t2['images']),
                't1Count': metadata_t1['stats']['t1Count'],
                't2Count': metadata_t2['stats']['t2Count']
            }
        }
        assert combined['stats']['total'] == 4, "Combined count incorrect"
        assert combined['stats']['t1Count'] == 2, "Combined T1 count incorrect"
        assert combined['stats']['t2Count'] == 2, "Combined T2 count incorrect"
        print("  ✓ Combined metadata correct")

        # Test 7: Metadata structure
        print("✓ Test 7: Verifying metadata structure...")
        sample_img = combined['images'][0]
        assert 'id' in sample_img, "Missing 'id' field"
        assert 'filename' in sample_img, "Missing 'filename' field"
        assert 'type' in sample_img, "Missing 'type' field"
        assert 'subject' in sample_img, "Missing 'subject' field"
        print("  ✓ Metadata structure valid")

    print("\n✓ All tests passed!")
    return True


if __name__ == '__main__':
    try:
        test_processing()
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        raise
