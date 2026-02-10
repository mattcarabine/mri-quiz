interface ImageDisplayProps {
  src: string;
  alt: string;
  loading: boolean;
}

export function ImageDisplay({ src, alt, loading }: ImageDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-900 rounded-lg p-8 min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading MRI image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-900 rounded-lg p-8">
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[500px] object-contain rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-family="sans-serif" font-size="16"%3EImage failed to load%3C/text%3E%3C/svg%3E';
        }}
      />
    </div>
  );
}
