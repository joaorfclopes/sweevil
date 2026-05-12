const HEIC_TYPES = ["image/heic", "image/heif"];

export async function convertIfHeic(file) {
  if (!HEIC_TYPES.includes(file.type)) return file;
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const converted = Array.isArray(blob) ? blob[0] : blob;
  const name = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([converted], name, { type: "image/jpeg" });
}
