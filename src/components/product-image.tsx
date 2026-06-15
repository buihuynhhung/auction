"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ProductImage({
  src,
  alt,
  className = "aspect-[4/3]",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-muted text-muted-foreground ${className}`}
      >
        <div className="text-center">
          <ImageIcon className="mx-auto h-6 w-6" />
          <p className="mt-2 text-sm">Chưa có ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-surface-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
