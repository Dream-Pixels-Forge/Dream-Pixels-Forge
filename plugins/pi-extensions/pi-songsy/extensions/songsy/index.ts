import { Type } from "typebox";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// ─── mmx CLI helpers ───────────────────────────────────────────────────────

let mmxAvailable: boolean | null = null;

async function checkMmxAvailable(): Promise<boolean> {
  if (mmxAvailable !== null) return mmxAvailable;
  try {
    await execFileAsync("mmx", ["--version"]);
    mmxAvailable = true;
  } catch {
    mmxAvailable = false;
  }
  return mmxAvailable;
}

async function runMmx(
  args: string[],
  signal?: AbortSignal
): Promise<{ stdout: string; stderr: string }> {
  // Create abort controller for child process
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000); // 5 min timeout

  // Link external abort signal
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const result = await execFileAsync("mmx", args, {
      signal: controller.signal as any,
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer for hex output
      encoding: "utf-8",
    });
    return { stdout: result.stdout, stderr: result.stderr };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── API Response types (for direct API fallback) ──────────────────────────

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

// ─── Tool: mmx music (CLI-based) ──────────────────────────────────────────

const mmxMusicTool = defineTool({
  name: "mmx_music",
  label: "MMX Music",
  description:
    "Generate music using MiniMax mmx CLI. Supports song generation, instrumentals, covers, and advanced options like vocals, genre, mood, BPM, key.",
  promptSnippet:
    "Generate music with mmx CLI - songs, instrumentals, covers with rich parameters",
  promptGuidelines: [
    "Use mmx_music for music generation when mmx CLI is installed.",
    "Supports advanced parameters: --vocals, --genre, --mood, --instruments, --tempo, --bpm, --key, --references.",
    "For covers, mmx CLI handles preprocessing automatically.",
    "Use --out to save directly to disk.",
  ],
  parameters: Type.Object({
    command: Type.Union([Type.Literal("generate"), Type.Literal("cover")], {
      description:
        "generate = create new music, cover = create cover from reference audio",
    }),
    prompt: Type.String({
      description:
        "Music style description (e.g. 'cinematic orchestral, building tension'). Max 2000 chars.",
      maxLength: 2000,
    }),
    // Generate options
    lyrics: Type.Optional(
      Type.String({
        description:
          "Song lyrics with structure tags: [Verse], [Chorus], etc. Max 3500 chars.",
        maxLength: 3500,
      })
    ),
    lyrics_file: Type.Optional(
      Type.String({
        description: "Path to lyrics file (use - for stdin).",
      })
    ),
    instrumental: Type.Optional(
      Type.Boolean({
        description: "Generate instrumental music (no vocals).",
        default: false,
      })
    ),
    lyrics_optimizer: Type.Optional(
      Type.Boolean({
        description: "Auto-generate lyrics from prompt.",
        default: false,
      })
    ),
    // Advanced music parameters
    vocals: Type.Optional(
      Type.String({
        description:
          'Vocal style, e.g. "warm male baritone", "bright female soprano", "duet with harmonies"',
      })
    ),
    genre: Type.Optional(
      Type.String({ description: 'Music genre, e.g. folk, pop, jazz, electronic' })
    ),
    mood: Type.Optional(
      Type.String({
        description: 'Mood or emotion, e.g. warm, melancholic, uplifting',
      })
    ),
    instruments: Type.Optional(
      Type.String({
        description:
          'Instruments to feature, e.g. "acoustic guitar, piano, strings"',
      })
    ),
    tempo: Type.Optional(
      Type.String({ description: 'Tempo description, e.g. fast, slow, moderate' })
    ),
    bpm: Type.Optional(
      Type.Number({ description: "Exact tempo in beats per minute" })
    ),
    key: Type.Optional(
      Type.String({ description: 'Musical key, e.g. C major, A minor' })
    ),
    avoid: Type.Optional(
      Type.String({ description: "Elements to avoid in the generated music" })
    ),
    references: Type.Optional(
      Type.String({
        description: 'Reference tracks or artists, e.g. "similar to Ed Sheeran"',
      })
    ),
    structure: Type.Optional(
      Type.String({
        description: 'Song structure, e.g. "verse-chorus-verse-bridge-chorus"',
      })
    ),
    // Cover-specific
    audio: Type.Optional(
      Type.String({
        description:
          "Reference audio URL for cover generation. Mutually exclusive with audio_file.",
      })
    ),
    audio_file: Type.Optional(
      Type.String({
        description:
          "Local reference audio file path for cover. Mutually exclusive with audio.",
      })
    ),
    seed: Type.Optional(
      Type.Number({
        description: "Random seed 0-1000000 for reproducible results",
        minimum: 0,
        maximum: 1000000,
      })
    ),
    // Output options
    model: Type.Optional(
      Type.String({
        description:
          "Model: music-3.0 (default), music-2.6, music-2.6-free, music-cover, music-cover-free",
        enum: [
          "music-3.0",
          "music-2.6",
          "music-2.6-free",
          "music-cover",
          "music-cover-free",
        ],
      })
    ),
    out: Type.Optional(
      Type.String({
        description:
          "Output file path to save audio directly (e.g. ./music/song.mp3)",
      })
    ),
    format: Type.Optional(
      Type.String({
        description: "Audio format: mp3, wav, pcm",
        enum: ["mp3", "wav", "pcm"],
      })
    ),
    sample_rate: Type.Optional(
      Type.Number({
        description: "Sample rate: 16000, 24000, 32000, 44100",
        enum: [16000, 24000, 32000, 44100],
      })
    ),
    bitrate: Type.Optional(
      Type.Number({
        description: "Bitrate: 32000, 64000, 128000, 256000",
        enum: [32000, 64000, 128000, 256000],
      })
    ),
    output_format: Type.Optional(
      Type.String({
        description:
          "Output format: url (24h expiry) or hex (saved to file). Default: hex with --out.",
        enum: ["url", "hex"],
      })
    ),
    stream: Type.Optional(
      Type.Boolean({
        description: "Stream raw audio to stdout.",
        default: false,
      })
    ),
  }),

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    ctx.ui.setStatus("mmx_music", "Building mmx command...");

    try {
      // Check mmx availability
      const available = await checkMmxAvailable();
      if (!available) {
        throw new Error(
          "mmx CLI not found. Install with: npm install -g mmx"
        );
      }

      // Build args
      const args: string[] = ["music", params.command];

      // Prompt is required for both generate and cover
      args.push("--prompt", params.prompt);

      // Generate options
      if (params.command === "generate") {
        if (params.lyrics) args.push("--lyrics", params.lyrics);
        if (params.lyrics_file) args.push("--lyrics-file", params.lyrics_file);
        if (params.instrumental) args.push("--instrumental");
        if (params.lyrics_optimizer) args.push("--lyrics-optimizer");
      }

      // Cover options
      if (params.command === "cover") {
        if (params.audio) args.push("--audio", params.audio);
        if (params.audio_file) args.push("--audio-file", params.audio_file);
        if (params.lyrics) args.push("--lyrics", params.lyrics);
        if (params.lyrics_file) args.push("--lyrics-file", params.lyrics_file);
        if (params.seed !== undefined) args.push("--seed", String(params.seed));
      }

      // Advanced music parameters (generate only)
      if (params.command === "generate") {
        if (params.vocals) args.push("--vocals", params.vocals);
        if (params.genre) args.push("--genre", params.genre);
        if (params.mood) args.push("--mood", params.mood);
        if (params.instruments) args.push("--instruments", params.instruments);
        if (params.tempo) args.push("--tempo", params.tempo);
        if (params.bpm !== undefined) args.push("--bpm", String(params.bpm));
        if (params.key) args.push("--key", params.key);
        if (params.avoid) args.push("--avoid", params.avoid);
        if (params.references) args.push("--references", params.references);
        if (params.structure) args.push("--structure", params.structure);
      }

      // Output options
      if (params.model) args.push("--model", params.model);
      if (params.out) args.push("--out", params.out);
      if (params.format) args.push("--format", params.format);
      if (params.sample_rate) args.push("--sample-rate", String(params.sample_rate));
      if (params.bitrate) args.push("--bitrate", String(params.bitrate));
      if (params.output_format) args.push("--output-format", params.output_format);
      if (params.stream) args.push("--stream");

      ctx.ui.setStatus("mmx_music", `Running: mmx ${args.join(" ")}`);

      // Execute mmx
      const { stdout, stderr } = await runMmx(args, signal);

      ctx.ui.setStatus("mmx_music", "Music generated");

      // Parse output
      let result: Record<string, any> = {};
      try {
        // mmx outputs JSON with --output-format json or plain text
        result = JSON.parse(stdout);
      } catch {
        // If not JSON, return raw output
        result = {
          output: stdout.trim(),
          command: `mmx ${args.join(" ")}`,
        };
      }

      // If --out was used, the file is saved directly
      if (params.out) {
        result.saved_to = params.out;
        result.note = "Audio saved directly to file by mmx CLI";
      }

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
      ctx.ui.setStatus("mmx_music", "Error");
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// ─── Tool: minimax_music (direct API) ─────────────────────────────────────

const minimaxMusicTool = defineTool({
  name: "minimax_music",
  label: "MiniMax Music",
  description:
    "Generate music using MiniMax API directly. Create songs from lyrics, instrumental tracks, or covers from reference audio.",
  promptSnippet:
    "Generate music with MiniMax API - songs, instrumentals, or covers",
  promptGuidelines: [
    "Use minimax_music for direct API access (no mmx CLI required).",
    "For song generation, provide both prompt (style/mood) and lyrics with structure tags.",
    "For instrumental generation, set is_instrumental to true.",
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
    ctx.ui.setStatus("minimax_music", "Generating music...");

    try {
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

      const data = (await response.json()) as MusicGenerationResponse;

      if (data.base_resp?.status_code !== 0) {
        const errorMsg = data.base_resp?.status_msg || "Unknown error";
        throw new Error(
          `MiniMax API error: ${errorMsg} (code: ${data.base_resp?.status_code})`
        );
      }

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
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.ui.setStatus("minimax_music", "Error");
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// ─── Tool: cover preprocess ───────────────────────────────────────────────

const minimaxMusicCoverPreprocessTool = defineTool({
  name: "minimax_music_cover_preprocess",
  label: "MiniMax Cover Preprocess",
  description:
    "Preprocess reference audio for cover generation. Extracts lyrics and audio features.",
  promptSnippet: "Preprocess audio for MiniMax cover generation",
  promptGuidelines: [
    "Use minimax_music_cover_preprocess when preparing reference audio for two-step cover workflow.",
    "mmx_music cover handles this automatically, so prefer mmx_music for covers.",
  ],
  parameters: Type.Object({
    audio_url: Type.Optional(
      Type.String({
        description: "Reference audio URL. Mutually exclusive with audio_base64.",
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
    ctx.ui.setStatus("minimax_music_cover_preprocess", "Preprocessing...");

    try {
      const requestBody: Record<string, any> = { model: "music-cover" };
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

      const data = (await response.json()) as CoverPreprocessResponse;

      if (data.base_resp?.status_code !== 0) {
        throw new Error(
          `MiniMax API error: ${data.base_resp?.status_msg} (code: ${data.base_resp?.status_code})`
        );
      }

      const result = {
        cover_feature_id: data.cover_feature_id,
        formatted_lyrics: data.formatted_lyrics,
        structure_result: data.structure_result,
        audio_duration: data.audio_duration,
        trace_id: data.trace_id,
      };

      ctx.ui.setStatus("minimax_music_cover_preprocess", "Done");

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      ctx.ui.setStatus("minimax_music_cover_preprocess", "Error");
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// ─── Tool: download ───────────────────────────────────────────────────────

const minimaxMusicDownloadTool = defineTool({
  name: "minimax_music_download",
  label: "MiniMax Music Download",
  description:
    "Download generated music to disk. Save audio from URL or hex-encoded data.",
  promptSnippet: "Download generated music to disk",
  promptGuidelines: [
    "Use minimax_music_download when saving generated music to a file.",
    "mmx_music with --out saves directly, so prefer that when using mmx.",
  ],
  parameters: Type.Object({
    audio_url: Type.Optional(
      Type.String({
        description: "Audio URL to download. Mutually exclusive with audio_hex.",
      })
    ),
    audio_hex: Type.Optional(
      Type.String({
        description: "Hex-encoded audio data. Mutually exclusive with audio_url.",
      })
    ),
    output_path: Type.String({
      description: "Output file path. Directory will be created if needed.",
    }),
    format: Type.Optional(
      Type.String({
        description: "Audio format: mp3, wav, pcm.",
        enum: ["mp3", "wav", "pcm"],
      })
    ),
  }),

  async execute(toolCallId, params, signal, onUpdate, ctx) {
    ctx.ui.setStatus("minimax_music_download", "Downloading...");

    try {
      let audioBuffer: Buffer;

      if (params.audio_url) {
        const response = await fetch(params.audio_url, { signal });
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        audioBuffer = Buffer.from(await response.arrayBuffer());
      } else if (params.audio_hex) {
        audioBuffer = Buffer.from(params.audio_hex, "hex");
      } else {
        throw new Error("Either audio_url or audio_hex required");
      }

      await mkdir(dirname(params.output_path), { recursive: true });
      await writeFile(params.output_path, audioBuffer);

      const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
      ctx.ui.setStatus("minimax_music_download", "Done");

      const result = {
        success: true,
        output_path: params.output_path,
        file_size: `${sizeMB} MB`,
      };

      return {
        content: [
          {
            type: "text" as const,
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
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        details: { error: errorMessage },
        isError: true,
      };
    }
  },
});

// ─── Extension factory ────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  // Register all tools
  pi.registerTool(mmxMusicTool);
  pi.registerTool(minimaxMusicTool);
  pi.registerTool(minimaxMusicCoverPreprocessTool);
  pi.registerTool(minimaxMusicDownloadTool);

  // Register /music command
  pi.registerCommand("music", {
    description: "Generate music with MiniMax (mmx or API)",
    handler: async (args, ctx) => {
      if (!args) {
        ctx.ui.notify("Usage: /music <prompt>", "info");
        return;
      }
      ctx.ui.notify(
        `Use mmx_music or minimax_music with prompt: "${args}"`,
        "info"
      );
    },
  });

  // Session start: check capabilities
  pi.on("session_start", async (_event, ctx) => {
    const hasApiKey = !!process.env.MINIMAX_API_KEY;
    const hasMmx = await checkMmxAvailable();

    if (hasMmx) {
      ctx.ui.setStatus("mmx_music", "Ready (mmx CLI found)");
    } else {
      ctx.ui.setStatus("mmx_music", "mmx not found");
    }

    if (hasApiKey) {
      ctx.ui.setStatus("minimax_music", "Ready (API key found)");
    } else {
      ctx.ui.setStatus("minimax_music", hasMmx ? "No API key (use mmx)" : "No API key");
    }
  });
}
