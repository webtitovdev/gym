import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

const parseHash = () => location.hash.slice(1) || '/';

export function useHashRoute(): string {
  const [path, setPath] = useState(parseHash());
  useEffect(() => {
    const onHash = () => setPath(parseHash());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  return path;
}

export function navigate(path: string): void {
  location.hash = path;
}

interface LinkProps {
  href: string;
  children?: ComponentChildren;
  class?: string;
  onClick?: (e: MouseEvent) => void;
}

export function Link({ href, children, class: className, onClick }: LinkProps) {
  return (
    <a href={`#${href}`} class={className} onClick={onClick}>
      {children}
    </a>
  );
}
