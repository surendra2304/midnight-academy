import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const uploadSpeakingAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        attemptId: z.string().uuid().optional(),
        contentItemId: z.string().uuid(),
        audioBase64: z.string().min(10),
        mimeType: z.string().default("audio/webm"),
        durationSeconds: z.number().nonnegative().default(0),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { attemptId, contentItemId, audioBase64, mimeType, durationSeconds } = data;
    const userId = context.userId;

    const base64Data = audioBase64.includes(",") ? audioBase64.split(",", 2)[1]! : audioBase64;
    const buffer = Buffer.from(base64Data, "base64");

    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const storagePath = `${userId}/${attemptId || "practice"}/${contentItemId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("speaking-recordings")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadSpeakingAudio] Upload error:", uploadError);
      throw new Error(`Failed to upload audio recording: ${uploadError.message}`);
    }

    return {
      storagePath,
      mimeType,
      durationSeconds,
      uploadedAt: new Date().toISOString(),
    };
  });
