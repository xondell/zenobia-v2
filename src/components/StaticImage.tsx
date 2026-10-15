import Image, { type ImageProps } from 'next/image';
import { assetPath } from '@/lib/asset-path';

export default function StaticImage({ src, ...props }: ImageProps) {
  return <Image {...props} src={typeof src === 'string' ? assetPath(src) : src} />;
}
