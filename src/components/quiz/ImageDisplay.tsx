import { useState } from 'react';
import { ImageViewer } from './ImageViewer';

interface ImageDisplayProps {
  src: string;
  alt: string;
  loading: boolean;
  isTablet?: boolean;
  variant?: 'question' | 'explanation';
}

export function ImageDisplay({ src, alt, loading, isTablet = false, variant = 'question' }: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 sm:p-8 min-h-[300px] sm:min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading MRI image...</p>
        </div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 sm:p-8 min-h-[300px] sm:min-h-[500px]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-red-400 text-5xl">⚠️</div>
          <p className="text-gray-300 font-semibold text-lg">Image Unavailable</p>
          <p className="text-gray-400 text-sm">
            This image failed to load. Please check your connection or try a different question.
          </p>
        </div>
      </div>
    );
  }

  // On tablet, constrain image height to viewport minus fixed elements
  // Question phase: Header (~100px) + Buttons (~140px) + Margins (~60px) = ~300px
  // Explanation phase: More conservative to leave room for explanation content
  const imageMaxHeight = isTablet
    ? variant === 'explanation'
      ? 'max-h-[calc(100vh-500px)] min-h-[200px]'
      : 'max-h-[calc(100vh-300px)] min-h-[250px]'
    : 'max-h-[400px] sm:max-h-[500px]';

  return (
    <>
      <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 sm:p-8">
        <img
          src={src}
          alt={alt}
          className={`max-w-full w-full sm:max-w-lg ${imageMaxHeight} object-contain rounded cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={() => setIsViewerOpen(true)}
          onError={() => setImageError(true)}
        />
      </div>
      <ImageViewer
        src={src}
        alt={alt}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
