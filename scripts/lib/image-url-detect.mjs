/** Detect image-like URLs for audit-all-images.mjs (all MORE niche sites). */
export function isImageUrl(url) {
  if (!url?.startsWith('http')) return false;
  // Template literals lifted out of source code are not deliverable URLs:
  // `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${publicId}`
  // and the bare host constant both 404 and are not images.
  if (url.includes('${') || url.includes('{{')) return false;
  try {
    const u = new URL(url);
    if (!u.pathname || u.pathname === '/') return false;
  } catch {
    return false;
  }
  return (
    url.includes('cloudinary.com') ||
    // upload.wikimedia.org serves files; commons.wikimedia.org/wiki/File:… is a
    // description PAGE and must not be probed as an image.
    url.includes('upload.wikimedia.org') ||
    url.includes('unsplash') ||
    url.includes('images.unsplash') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(url)
  );
}
