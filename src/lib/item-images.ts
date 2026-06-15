import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export class ImageUploadError extends Error {
  constructor(public readonly code: "image-invalid" | "image-too-large" | "upload") {
    super(code);
    this.name = "ImageUploadError";
  }
}

export function imageUrlsFrom(formData: FormData) {
  return String(formData.get("imageUrls") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function imageFilesFrom(formData: FormData) {
  return formData
    .getAll("imageFiles")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function validateImageFiles(files: File[]) {
  for (const file of files) {
    const extension = extensionFrom(file.name);

    if (!extension || !ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_TYPES.has(file.type)) {
      throw new ImageUploadError("image-invalid");
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new ImageUploadError("image-too-large");
    }
  }
}

export async function saveImageFiles(itemId: string, files: File[]) {
  if (!files.length) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "items", itemId);
  await mkdir(uploadDir, { recursive: true });

  try {
    const savedUrls: string[] = [];

    for (const [index, file] of files.entries()) {
      const extension = extensionFrom(file.name);
      if (!extension) {
        throw new ImageUploadError("image-invalid");
      }

      const fileName = `${Date.now()}-${index + 1}.${extension}`;
      const targetPath = path.join(uploadDir, fileName);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(targetPath, bytes);
      savedUrls.push(`/uploads/items/${itemId}/${fileName}`);
    }

    return savedUrls;
  } catch (error) {
    if (error instanceof ImageUploadError) {
      throw error;
    }

    throw new ImageUploadError("upload");
  }
}

function extensionFrom(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension !== fileName.toLowerCase() ? extension : null;
}
