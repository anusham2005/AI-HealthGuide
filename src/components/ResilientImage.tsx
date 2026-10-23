import React, { useState } from "react";
import { HeartPulse } from "lucide-react";

interface ResilientImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  className?: string;
  containerClassName?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackTitle,
  fallbackSubtitle,
  className = "w-full h-full object-cover",
  containerClassName = "relative overflow-hidden bg-slate-100",
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={containerClassName}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasError(true)}
          className={className}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex flex-col items-center justify-center w-full h-full min-h-[240px] p-8 text-center bg-gradient-to-br from-blue-50 via-white to-slate-100"
        >
          <HeartPulse className="w-10 h-10 text-blue-700 mb-3" aria-hidden="true" />
          <p className="font-display font-semibold text-slate-900 text-base">
            {fallbackTitle}
          </p>
          {fallbackSubtitle && (
            <p className="text-sm text-slate-600 mt-1 max-w-sm">
              {fallbackSubtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
