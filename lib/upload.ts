import path from "node:path";
import { ANEXOS_BUCKET, supabaseAdmin } from "@/lib/supabase";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_CHAMADO = 5;
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadAnexoChamado(chamadoId: number, file: File) {
  const extension = path.extname(file.name).toLowerCase();
  const baseName = sanitizeFileName(path.basename(file.name, extension));
  const storedFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${extension}`;
  const storagePath = `chamados/${chamadoId}/${storedFileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(ANEXOS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha ao enviar anexo: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(ANEXOS_BUCKET).getPublicUrl(storagePath);

  return {
    nome_original: file.name,
    mime_type: file.type,
    tamanho_bytes: file.size,
    url: data.publicUrl,
  };
}
