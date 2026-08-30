import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage, ALLOWED_TYPES, MAX_SIZE, sanitizeFilename, MEDIA_FOLDERS } from "@/lib/storage";

// Uploads now go to Supabase Storage instead of the local filesystem — required for
// serverless hosts (Netlify/Vercel), whose functions don't have persistent disk.
// See PART 5/51 of the CMS spec: /public/uploads is no longer the production path.

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folderInput = (formData.get("folder") as string) || "general";
  const folder = (MEDIA_FOLDERS as readonly string[]).includes(folderInput) ? folderInput : "general";
  const altText = (formData.get("altText") as string) || null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const kind = ALLOWED_TYPES[file.type];
  if (!kind) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeFilename(file.name);

  try {
    const uploaded = await storage.upload({
      buffer,
      filename,
      folder,
      contentType: file.type,
      isDocument: kind === "pdf" || kind === "document",
    });

    // Best-effort image dimensions (skipped for non-images / if it fails — never blocks upload)
    let width: number | null = null;
    let height: number | null = null;
    if (kind === "image" && file.type !== "image/svg+xml") {
      try {
        const dims = await getImageDimensions(buffer);
        width = dims.width;
        height = dims.height;
      } catch {
        // dimensions are a nice-to-have, not worth failing the upload over
      }
    }

    const media = await prisma.media.create({
      data: {
        url: uploaded.url,
        filename,
        originalFilename: file.name,
        type: kind,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        altText,
        provider: uploaded.provider,
        bucket: uploaded.bucket,
        storagePath: uploaded.storagePath,
        folder,
      },
    });

    return NextResponse.json(media);
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

// Reads PNG/JPEG/WebP/GIF dimensions straight from file headers — no extra dependency needed.
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  // PNG
  if (buffer.length > 24 && buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // GIF
  if (buffer.toString("ascii", 0, 3) === "GIF") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  // JPEG (scan markers for SOF frame)
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const size = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + size;
    }
  }
  // WebP (simple VP8 header)
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  throw new Error("Unrecognized image format");
}
