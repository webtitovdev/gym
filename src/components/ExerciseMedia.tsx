import { useEffect, useState } from 'preact/hooks';

interface Props {
  imageUrl?: string;
  imageUrlEnd?: string;
  altText: string;
}

export function ExerciseMedia({ imageUrl, imageUrlEnd, altText }: Props) {
  const [frame, setFrame] = useState<0 | 1>(0);

  useEffect(() => {
    if (!imageUrlEnd) return;
    const id = window.setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, 1200);
    return () => clearInterval(id);
  }, [imageUrlEnd]);

  if (!imageUrl) return null;

  return (
    <div class="px-4 pt-4">
      <div class="relative aspect-square max-w-sm mx-auto bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={altText}
          loading="lazy"
          class={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            frame === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {imageUrlEnd && (
          <img
            src={imageUrlEnd}
            alt={altText}
            loading="lazy"
            class={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              frame === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>
    </div>
  );
}
