import { useState } from 'react';

interface ImageDisplayProps {
  src: string;
  alt: string;
  loading: boolean;
}

export function ImageDisplay({ src, alt, loading }: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);

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

  return (
    <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 sm:p-8">
      <img
        src={src}
        alt={alt}
        className="max-w-full w-full sm:max-w-lg max-h-[400px] sm:max-h-[500px] object-contain rounded"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
