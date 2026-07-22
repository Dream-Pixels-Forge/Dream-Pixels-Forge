# Songsy - MiniMax Music Generation Extension

A Pi agent extension that provides music generation capabilities using the **mmx CLI**.

## Prerequisites

Install the mmx CLI:
```bash
npm install -g mmx
```

## Features

- **Song Generation**: Create songs from lyrics with customizable style and mood
- **Instrumental Generation**: Generate instrumental tracks without vocals
- **Cover Creation**: Produce cover versions from reference audio (auto-preprocessed)
- **Multiple Models**: Support for music-3.0, music-2.6, and music-cover models
- **Advanced Parameters**: Vocals, genre, mood, instruments, BPM, key, references

## Setup

1. Install mmx CLI: `npm install -g mmx`
2. Set the environment variable: `MINIMAX_API_KEY=your_api_key`
3. Place this extension in `~/.pi/agent/extensions/songsy/` or `.pi/extensions/songsy/`

## Usage

### Tool: `mmx_music`

Generate music with the `mmx_music` tool:

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
  vocals: "male and female duet",
  instruments: "acoustic guitar, piano",
  bpm: 95,
  out: "./music/duet.mp3"
})

// Generate instrumental
mmx_music({
  command: "generate",
  prompt: "Epic orchestral, cinematic",
  instrumental: true,
  out: "./music/bgm.mp3"
})

// Create a cover (preprocessing handled automatically)
mmx_music({
  command: "cover",
  prompt: "Indie folk, acoustic guitar",
  audio: "https://example.com/song.mp3",
  out: "./music/cover.mp3"
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

## Notes

- mmx CLI handles all API authentication via `MINIMAX_API_KEY`
- URL links expire after 24 hours
- Reference audio: 6 seconds to 6 minutes, max 50 MB
- Free tier has lower RPM limits
