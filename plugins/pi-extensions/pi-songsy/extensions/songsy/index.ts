import { Type } from "typebox";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000); // 5 min timeout

  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const result = await execFileAsync("mmx", args, {
      signal: controller.signal as any,
      maxBuffer: 50 * 1024 * 1024,
      encoding: "utf-8",
    });
    return { stdout: result.stdout, stderr: result.stderr };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Tool: mmx_music (CLI-based) ──────────────────────────────────────────

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
      Type.String({ description: "Music genre, e.g. folk, pop, jazz, electronic" })
    ),
    mood: Type.Optional(
      Type.String({
        description: "Mood or emotion, e.g. warm, melancholic, uplifting",
      })
    ),
    instruments: Type.Optional(
      Type.String({
        description:
          'Instruments to feature, e.g. "acoustic guitar, piano, strings"',
      })
    ),
    tempo: Type.Optional(
      Type.String({ description: "Tempo description, e.g. fast, slow, moderate" })
    ),
    bpm: Type.Optional(
      Type.Number({ description: "Exact tempo in beats per minute" })
    ),
    key: Type.Optional(
      Type.String({ description: "Musical key, e.g. C major, A minor" })
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

      const { stdout, stderr } = await runMmx(args, signal);

      ctx.ui.setStatus("mmx_music", "Music generated");

      // Parse output
      let result: Record<string, any> = {};
      try {
        result = JSON.parse(stdout);
      } catch {
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

// ─── Extension factory ────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  // Register mmx music tool
  pi.registerTool(mmxMusicTool);

  // Register /music command
  pi.registerCommand("music", {
    description: "Generate music with MiniMax (mmx CLI)",
    handler: async (args, ctx) => {
      if (!args) {
        ctx.ui.notify("Usage: /music <prompt>", "info");
        return;
      }
      ctx.ui.notify(
        `Use mmx_music with prompt: "${args}"`,
        "info"
      );
    },
  });

  // Session start: check mmx availability
  pi.on("session_start", async (_event, ctx) => {
    const hasMmx = await checkMmxAvailable();

    if (hasMmx) {
      ctx.ui.setStatus("mmx_music", "Ready (mmx CLI found)");
    } else {
      ctx.ui.setStatus("mmx_music", "mmx not found - install with: npm install -g mmx");
    }
  });
}
