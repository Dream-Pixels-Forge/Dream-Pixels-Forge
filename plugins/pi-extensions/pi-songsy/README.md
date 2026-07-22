# Pi Songsy - MiniMax Music Generation Extension

A Pi agent extension for generating music using the **mmx CLI**. Create songs from lyrics, instrumental tracks, or covers from reference audio.

## Features

- **Song Generation**: Create songs from lyrics with customizable style and mood
- **Instrumental Generation**: Generate instrumental tracks without vocals
- **Cover Creation**: Produce cover versions from reference audio (auto-preprocessed)
- **mmx CLI Powered**: All music generation via mmx CLI
- **Multiple Models**: Support for music-3.0, music-2.6, and music-cover models
- **Advanced Parameters**: Vocals, genre, mood, instruments, BPM, key, references
- **Direct to File**: Save generated music directly to disk with `--out`

## Prerequisites

Install the mmx CLI:
```bash
npm install -g mmx
```

## Installation

### Option 1: Install from GitHub (recommended)

Clone the repo and copy the extension:

```bash
# Clone the repository
git clone https://github.com/Dream-Pixels-Forge/Dream-Pixels-Forge.git

# Copy to Pi's global extensions
cp -r Dream-Pixels-Forge/plugins/pi-extensions/pi-songsy/extensions/songsy ~/.pi/agent/extensions/

# Or copy to project-local extensions (from project root)
mkdir -p .pi/extensions
cp -r Dream-Pixels-Forge/plugins/pi-extensions/pi-songsy/extensions/songsy .pi/extensions/
```

Or install directly via GitHub URL without cloning:

```bash
# One-liner: download and install to Pi global extensions
cd /tmp && git clone --depth 1 https://github.com/Dream-Pixels-Forge/Dream-Pixels-Forge.git && cp -r Dream-Pixels-Forge/plugins/pi-extensions/pi-songsy/extensions/songsy ~/.pi/agent/extensions/ && rm -rf /tmp/Dream-Pixels-Forge
```

### Option 2: Copy from local clone

```bash
# Copy the extension to Pi's global extensions
cp -r extensions/songsy ~/.pi/agent/extensions/

# Or copy to project-local extensions
cp -r extensions/songsy .pi/extensions/
```

### Option 3: Symlink

```bash
# Create symlink in Pi's global extensions
ln -s /path/to/pi-songsy/extensions/songsy ~/.pi/agent/extensions/songsy

# Or in project-local extensions
ln -s /path/to/pi-songsy/extensions/songsy .pi/extensions/songsy
```

## Usage

### Tool: `mmx_music`

Generate music using the mmx CLI:

```typescript
// Generate a song with lyrics
mmx_music({
  command: "generate",
  prompt: "Pop, upbeat, summer vibes",
  lyrics: "[Verse]\nSunshine feels so good\n[Chorus]\nLet's dance all night",
  out: "./music/summer.mp3"
})

// Generate with advanced parameters
mmx_music({
  command: "generate",
  prompt: "Warm morning folk",
  vocals: "male and female duet, harmonies in chorus",
  instruments: "acoustic guitar, piano",
  bpm: 95,
  genre: "folk",
  mood: "warm",
  lyrics: "[Verse]\n...",
  out: "./music/duet.mp3"
})

// Generate instrumental
mmx_music({
  command: "generate",
  prompt: "Epic orchestral, cinematic",
  instrumental: true,
  out: "./music/bgm.mp3"
})

// Auto-generate lyrics from prompt
mmx_music({
  command: "generate",
  prompt: "Upbeat pop about summer",
  lyrics_optimizer: true,
  out: "./music/summer.mp3"
})

// Create a cover (preprocessing handled automatically)
mmx_music({
  command: "cover",
  prompt: "Indie folk, acoustic guitar",
  audio: "https://example.com/song.mp3",
  out: "./music/cover.mp3"
})

// Create a cover from local file
mmx_music({
  command: "cover",
  prompt: "Jazz, piano, slow",
  audio_file: "./original.mp3",
  out: "./music/jazz_cover.mp3"
})

// Reproducible output with seed
mmx_music({
  command: "cover",
  prompt: "Pop, upbeat",
  audio: "https://example.com/ref.mp3",
  seed: 42,
  out: "./music/reproducible.mp3"
})
```

### Command: `/music`

Quick music generation:
```
/music upbeat electronic dance track
```

## Advanced Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `vocals` | Vocal style | "warm male baritone", "duet with harmonies" |
| `genre` | Music genre | folk, pop, jazz, electronic |
| `mood` | Mood/emotion | warm, melancholic, uplifting |
| `instruments` | Instruments to feature | "acoustic guitar, piano, strings" |
| `tempo` | Tempo description | fast, slow, moderate |
| `bpm` | Exact tempo (BPM) | 95, 120 |
| `key` | Musical key | "C major", "A minor" |
| `avoid` | Elements to avoid | "heavy drums, distortion" |
| `references` | Reference artists | "similar to Ed Sheeran" |
| `structure` | Song structure | "verse-chorus-verse-bridge-chorus" |
| `seed` | Reproducibility seed | 0-1000000 |
| `out` | Save directly to file | "./music/song.mp3" |

## Model Options

| Model | Description | Rate Limit |
|-------|-------------|------------|
| `music-3.0` | Text-to-music (recommended) | 120 RPM |
| `music-2.6` | Previous-gen | 120 RPM |
| `music-cover` | Cover generation | 120 RPM |
| `music-3.0-free` | Free tier | 3 RPM |
| `music-2.6-free` | Free tier | 3 RPM |
| `music-cover-free` | Free tier | 3 RPM |

## Lyrics Structure Tags

Use these tags to structure lyrics:
- `[Intro]`, `[Verse]`, `[Pre Chorus]`, `[Chorus]`
- `[Interlude]`, `[Bridge]`, `[Outro]`, `[Post Chorus]`
- `[Transition]`, `[Break]`, `[Hook]`, `[Build Up]`
- `[Inst]`, `[Solo]`

## Project Structure

```
pi-songsy/
├── README.md                    # This file
├── extensions/
│   └── songsy/
│       ├── index.ts             # Extension entry point
│       ├── package.json         # Dependencies
│       ├── tsconfig.json        # TypeScript config
│       ├── .gitignore           # Git ignore
│       └── README.md            # Extension documentation
└── skills/
    └── songsy/
        ├── SKILL.md             # Skill instructions
        ├── REFERENCE.md         # API reference
        └── EXAMPLES.md          # Usage examples
```

## Notes

- mmx CLI handles all API authentication via `MINIMAX_API_KEY` environment variable
- URL links expire after 24 hours
- Reference audio: 6 seconds to 6 minutes, max 50 MB
- Free tier has lower RPM limits

## License

MIT
