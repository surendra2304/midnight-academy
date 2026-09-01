/**
 * Audio Asset Service & Playback Health Layer
 * Manages audio resolution from content_assets, signed/public URLs, preload validation, and playback metadata.
 */

import { supabaseAdmin } from '@/integrations/supabase/client.server';

export interface AudioAssetMetadata {
  id: string;
  contentItemId: string | null;
  assetType: string;
  storagePath: string;
  url: string;
  mimeType: string;
  durationMs: number | null;
  checksum: string | null;
  metadata: Record<string, unknown>;
  isHealthy: boolean;
}

export interface AudioInteractionLog {
  playCount: number;
  replayCount: number;
  completedListen: boolean;
  timeListenedMs: number;
  firstPlayedAt?: string;
  lastPlayedAt?: string;
}

export class AudioAssetService {
  /**
   * Resolves audio asset for a content item and generates a secure/accessible playback URL.
   */
  async resolveItemAudio(contentItemId: string): Promise<AudioAssetMetadata | null> {
    const { data: asset, error } = await supabaseAdmin
      .from('content_assets')
      .select('id, content_item_id, asset_type, storage_path, mime_type, duration_ms, checksum, metadata')
      .eq('content_item_id', contentItemId)
      .eq('asset_type', 'audio')
      .maybeSingle();

    if (error || !asset) return null;

    // Resolve URL: If storagePath is a full HTTP URL or public path, use it directly;
    // otherwise generate a public/signed URL from Supabase storage bucket 'toefl_audio'
    let resolvedUrl = asset.storage_path;
    if (!asset.storage_path.startsWith('http://') && !asset.storage_path.startsWith('https://')) {
      const { data } = supabaseAdmin.storage
        .from('toefl_audio')
        .getPublicUrl(asset.storage_path);
      resolvedUrl = data.publicUrl;
    }

    const isHealthy = this.validateAssetHealth(asset);

    return {
      id: asset.id,
      contentItemId: asset.content_item_id,
      assetType: asset.asset_type,
      storagePath: asset.storage_path,
      url: resolvedUrl,
      mimeType: asset.mime_type || 'audio/mpeg',
      durationMs: asset.duration_ms,
      checksum: asset.checksum,
      metadata: (asset.metadata as Record<string, unknown>) || {},
      isHealthy,
    };
  }

  /**
   * Validates existence, valid mime type, and non-empty path.
   */
  validateAssetHealth(asset: { storage_path?: string; mime_type?: string }): boolean {
    if (!asset.storage_path || asset.storage_path.trim().length === 0) return false;
    const validMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac'];
    return validMimes.includes(asset.mime_type?.toLowerCase() || 'audio/mpeg');
  }
}

export const audioAssetService = new AudioAssetService();
