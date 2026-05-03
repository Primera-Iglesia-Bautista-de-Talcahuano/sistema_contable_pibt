import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { ATTACHMENT_SIGNED_URL_TTL_SECONDS, isAttachmentBucket } from "@/lib/storage/attachments"

type Params = { params: Promise<{ bucket: string; path: string[] }> }

export async function GET(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { bucket, path } = await params
  if (!isAttachmentBucket(bucket)) {
    return NextResponse.json({ message: "Bucket no permitido" }, { status: 400 })
  }

  const objectPath = path.map(decodeURIComponent).join("/")
  if (!objectPath || objectPath.includes("..")) {
    return NextResponse.json({ message: "Ruta inválida" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(objectPath, ATTACHMENT_SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) {
    return NextResponse.json({ message: "Adjunto no encontrado" }, { status: 404 })
  }

  return NextResponse.redirect(data.signedUrl, 302)
}
