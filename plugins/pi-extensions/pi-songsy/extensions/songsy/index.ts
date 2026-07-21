import { Type } from "typebox";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

// API Response types
interface BaseResp {
  status_code: number;
  status_msg: string;
}

interface MusicData {
  status: number;
  audio?: string;
}

interface ExtraInfo {
  music_duration?: number;
  music_sample_rate?: number;
  music_channel?: number;
  bitrate?: number;
  music_size?: number;
}

interface MusicGenerationResponse {
  data?: MusicData;
  trace_id?: string;
  extra_info?: ExtraInfo;
  base_resp?: BaseResp;
}

interface CoverPreprocessResponse {
  cover_feature_id?: string;
  formatted_lyrics?: string;
  structure_result?: string;
  audio_duration?: number;
  trace_id?: string;
  base_resp?: BaseResp;
}

// Define the music generation tool
const minimaxMusicTool = defineTool({
  name: "minimax_music",
  label: "MiniMax Music",
  description:
    "Generate music using MiniMax API. Create songs from lyrics, instrumental tracks, or covers from reference audio.",
  promptSnippet:
    "Generate music with MiniMax API - songs, instrumentals, or covers",
  promptGuidelines: [
    "Use minimax_music when the user wants to generate music, create songs, make instrumentals, or produce music covers.",
    "For song generation, provide both prompt (style/mood) and lyrics with structure tags.",
    "For instrumental generation, set is_instrumental to true and provide a descriptive prompt.",
    "For cover generation, provide reference audio via audio_url or audio_base64.",
  ],
  parameters: Type.Object({
    model: Type.String({
      description:
        "Model name: music-3.0 (recommended), music-2.6, music-cover, music-3.0-free, music-2.6-free, music-cover-free",
      enum: [
        "music-3.0",
        "music-2.6",
        "music-cover",
        "music-3.0-free",
        "music-2.6-free",
        "music-cover-free",
      ],
    }),
    prompt: Type.Optional(
      Type.String({
        description:
          "Music description: style, mood, scenario. Required for instrumental generation.",
        maxLength: 2000,
      })
    ),
    lyrics: Type.Optional(
      Type.String({
        description:
          "Song lyrics with structure tags: [Intro], [Verse], [Chorus], [Bridge], etc.",
        minLength: 1,
        maxLength: 3500,
      })
    ),
    is_instrumental: Type.Optional(
      Type.Boolean({
        description:
          "Generate instrumental music (no vocals). Only for music-3.0/music-2.6 models.",
        default: false,
      })
    ),
    lyrics_optimizer: Type.Optional(
      Type.Boolean({
        description:
          "Auto-generate lyrics from prompt. Only for music-3.0/music-2.6 models.",
        default: false,
      })
    ),
    audio_setting: Type.Optional(
      Type.Object({
        sample_rate: Type.Optional(
          Type.Number({
            description: "Sampling rate: 16000, 24000, 32000, 44100",
            enum: [16000, 24000, 32000, 44100],
          })
        ),
        bitrate: Type.Optional(
          Type.Number({
            description: "Bitrate: 32000, 64000, 128000, 256000",
            enum: [32000, 64000, 128000, 256000],
          })
        ),
        format: Type.Optional(
          Type.String({
            description: "Audio format: mp3, wav, pcm",
            enum: ["mp3", "wav", "pcm"],
          })
        ),
      })
    ),
    output_format: Type.Optional(
      Type.String({
        description: "Output format: url or hex. URL links expire after 24 hours.",
        enum: ["url", "hex"],
        default: "hex",
      })
    ),
    stream: Type.Optional(
      Type.Boolean({
        description: "Use streaming output. Only hex format supported when true.",
        default: false,
      })
    ),
    audio_url: Type.Optional(
      Type.String({
        description:
          "Reference audio URL for cover generation. Mutually exclusive with audio_base64 and cover_feature_id.",
      })
    ),
    audio_base64: Type.Optional(
      Type.String({
        description:
          "Base64-encoded reference audio for cover generation. Mutually exclusive with audio_url and cover_feature_id.",
      })
    ),
    cover_feature_id: Type.Optional(
      Type.String({
        description:
          "Feature ID from cover preprocessing. Mutually exclusive with audio_url and audio_base64.",
      })
    ),
  }),

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    // Show working status
    ctx.ui.setStatus("minimax_music", "Generating music...");

    try {
      // Build request body
      const requestBody: Record<string, any> = {
        model: params.model,
      };

      if (params.prompt) requestBody.prompt = params.prompt;
      if (params.lyrics) requestBody.lyrics = params.lyrics;
      if (params.is_instrumental !== undefined)
        requestBody.is_instrumental = params.is_instrumental;
      if (params.lyrics_optimizer !== undefined)
        requestBody.lyrics_optimizer = params.lyrics_optimizer;
      if (params.audio_setting) requestBody.audio_setting = params.audio_setting;
      if (params.output_format) requestBody.output_format = params.output_format;
      if (params.stream !== undefined) requestBody.stream = params.stream;
      if (params.audio_url) requestBody.audio_url = params.audio_url;
      if (params.audio_base64) requestBody.audio_base64 = params.audio_base64;
      if (params.cover_feature_id)
        requestBody.cover_feature_id = params.cover_feature_id;

      // Make API request
      const response = await fetch("https://api.minimax.io/v1/music_generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MINIMAX_API_KEY || ""}`,
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json() as MusicGenerationResponse;

      // Check for API errors
      if (data.base_resp?.status_code !== 0) {
        const errorMsg =
          data.base_resp?.status_msg || "Unknown error";
        throw new Error(`MiniMax API error: ${errorMsg} (code: ${data.base_resp?.status_code})`);
      }

      // Format response
      const result: Record<string, any> = {
        status: data.data?.status === 2 ? "completed" : "in_progress",
        trace_id: data.trace_id,
        extra_info: data.extra_info,
      };

      if (params.output_format === "url" && data.data?.audio) {
        result.audio_url = data.data.audio;
      } else if (data.data?.audio) {
        result.audio_hex_length = data.data.audio.length;
        result.audio_preview = data.data.audio.substring(0, 100) + "...";
      }

      ctx.ui.setStatus("minimax_music", "Music generated");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        details: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.ui.setStatus("minimax_music", "Error");
      return {
        content: [
          {
            type: "text",
            text: `Error generating music: ${errorMessage}`,
          },
        ],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// Cover preprocessing tool
const minimaxMusicCoverPreprocessTool = defineTool({
  name: "minimax_music_cover_preprocess",
  label: "MiniMax Cover Preprocess",
  description:
    "Preprocess reference audio for cover generation. Extracts lyrics and audio features.",
  promptSnippet:
    "Preprocess audio for MiniMax cover generation",
  promptGuidelines: [
    "Use minimax_music_cover_preprocess when preparing reference audio for cover generation.",
    "This extracts lyrics and audio features for two-step cover workflow.",
  ],
  parameters: Type.Object({
    audio_url: Type.Optional(
      Type.String({
        description:
          "Reference audio URL. Mutually exclusive with audio_base64.",
      })
    ),
    audio_base64: Type.Optional(
      Type.String({
        description:
          "Base64-encoded reference audio. Mutually exclusive with audio_url.",
      })
    ),
  }),

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    ctx.ui.setStatus("minimax_music_cover_preprocess", "Preprocessing audio...");

    try {
      const requestBody: Record<string, any> = {
        model: "music-cover",
      };

      if (params.audio_url) requestBody.audio_url = params.audio_url;
      if (params.audio_base64) requestBody.audio_base64 = params.audio_base64;

      const response = await fetch(
        "https://api.minimax.io/v1/music_cover_preprocess",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MINIMAX_API_KEY || ""}`,
          },
          body: JSON.stringify(requestBody),
          signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json() as CoverPreprocessResponse;

      if (data.base_resp?.status_code !== 0) {
        const errorMsg = data.base_resp?.status_msg || "Unknown error";
        throw new Error(
          `MiniMax API error: ${errorMsg} (code: ${data.base_resp?.status_code})`
        );
      }

      const result = {
        cover_feature_id: data.cover_feature_id,
        formatted_lyrics: data.formatted_lyrics,
        structure_result: data.structure_result,
        audio_duration: data.audio_duration,
        trace_id: data.trace_id,
      };

      ctx.ui.setStatus("minimax_music_cover_preprocess", "Preprocessed");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        details: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.ui.setStatus("minimax_music_cover_preprocess", "Error");
      return {
        content: [
          {
            type: "text",
            text: `Error preprocessing audio: ${errorMessage}`,
          },
        ],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// Download tool
const minimaxMusicDownloadTool = defineTool({
  name: "minimax_music_download",
  label: "MiniMax Music Download",
  description:
    "Download generated music to disk. Save audio from URL or hex-encoded data.",
  promptSnippet:
    "Download generated music to disk",
  promptGuidelines: [
    "Use minimax_music_download when the user wants to save generated music to a file.",
    "This tool downloads audio from URL or decodes hex-encoded data and saves to disk.",
  ],
  parameters: Type.Object({
    audio_url: Type.Optional(
      Type.String({
        description:
          "Audio URL to download. Mutually exclusive with audio_hex.",
      })
    ),
    audio_hex: Type.Optional(
      Type.String({
        description:
          "Hex-encoded audio data. Mutually exclusive with audio_url.",
      })
    ),
    output_path: Type.String({
      description:
        "Output file path. Directory will be created if it doesn't exist.",
    }),
    format: Type.Optional(
      Type.String({
        description:
          "Audio format: mp3, wav, pcm. Used to set file extension if not provided.",
        enum: ["mp3", "wav", "pcm"],
      })
    ),
  }),

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    ctx.ui.setStatus("minimax_music_download", "Downloading music...");

    try {
      let audioBuffer: Buffer;

      if (params.audio_url) {
        // Download from URL
        const response = await fetch(params.audio_url, { signal });
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
      } else if (params.audio_hex) {
        // Decode hex data
        audioBuffer = Buffer.from(params.audio_hex, "hex");
      } else {
        throw new Error("Either audio_url or audio_hex must be provided");
      }

      // Ensure output directory exists
      const outputDir = dirname(params.output_path);
      await mkdir(outputDir, { recursive: true });

      // Write file
      await writeFile(params.output_path, audioBuffer);

      const fileSizeKB = (audioBuffer.length / 1024).toFixed(2);
      const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);

      ctx.ui.setStatus("minimax_music_download", "Downloaded");

      const result = {
        success: true,
        output_path: params.output_path,
        file_size: `${fileSizeKB} KB (${fileSizeMB} MB)`,
        source: params.audio_url ? "url" : "hex",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        details: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.ui.setStatus("minimax_music_download", "Error");
      return {
        content: [
          {
            type: "text",
            text: `Error downloading music: ${errorMessage}`,
          },
        ],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// Extension factory
export default function (pi: ExtensionAPI) {
  // Register tools
  pi.registerTool(minimaxMusicTool);
  pi.registerTool(minimaxMusicCoverPreprocessTool);
  pi.registerTool(minimaxMusicDownloadTool);

  // Register a command for quick music generation
  pi.registerCommand("music", {
    description: "Generate music using MiniMax API",
    handler: async (args, ctx) => {
      if (!args) {
        ctx.ui.notify("Usage: /music <prompt>", "info");
        return;
      }

      // Simple wrapper - the LLM will use the tool directly
      ctx.ui.notify(`Use the minimax_music tool with prompt: "${args}"`, "info");
    },
  });

  // Show status on session start
  pi.on("session_start", async (_event, ctx) => {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (apiKey) {
      ctx.ui.setStatus("minimax_music", "Ready (API key found)");
    } else {
      ctx.ui.setStatus("minimax_music", "No API key");
      ctx.ui.notify(
        "MiniMax API key not found. Set MINIMAX_API_KEY environment variable.",
        "warning"
      );
    }
  });
}