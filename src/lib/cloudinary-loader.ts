/** Rewrites a Cloudinary URL to request a resized, auto-format/quality variant at the edge,
 * instead of proxying the original through Next's own image optimizer. */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const transform = `w_${width},q_${quality ?? 'auto'},f_auto,c_limit`;
  return src.replace('/upload/', `/upload/${transform}/`);
}
