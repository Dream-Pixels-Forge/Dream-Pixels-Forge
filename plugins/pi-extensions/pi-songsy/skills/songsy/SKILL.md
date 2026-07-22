---
name: songsy
description: Generate music using MiniMax mmx CLI. Create songs from lyrics, instrumental tracks, or covers from reference audio. Use when user wants to generate music, create songs, make instrumentals, or produce music covers.
---

# Songsy - MiniMax Music Generation

## Overview
Generate music using MiniMax's mmx CLI. Supports text-to-music, instrumental generation, and cover creation from reference audio.

## Prerequisites
Install the mmx CLI:
```bash
npm install -g mmx
```

## Tools
This extension provides one tool:
1. `mmx_music` - Generate music via mmx CLI (requires mmx installed)

## Quick Start

1. Generate a song: `mmx_music` with `command: "generate"`, `prompt: "Pop, upbeat"`, `lyrics: "[Verse]..."`, `out: "./song.mp3"`
2. Generate instrumental: `mmx_music` with `command: "generate"`, `prompt: "Epic orchestral"`, `instrumental: true`, `out: "./bgm.mp3"`
3. Create a cover: `mmx_music` with `command: "cover"`, `prompt: "Acoustic version"`, `audio: "https://example.com/song.mp3"`, `out: "./cover.mp3"`
4. Advanced: add `vocals`, `genre`, `mood`, `instruments`, `bpm`, `key`, `references`

## Workflows

### Song Generation
1. Write prompt describing style/mood/scenario
2. Write lyrics with structure tags: `[Verse]`, `[Chorus]`, etc.
3. Optionally add advanced params: `vocals`, `genre`, `mood`, `instruments`, `bpm`, `key`
4. Call `mmx_music` with `command: "generate"` and `out` path

### Instrumental Generation
1. Write descriptive prompt
2. Set `instrumental: true`
3. Call `mmx_music` with `command: "generate"`

### Cover Generation
1. Provide reference audio via `audio` (URL) or `audio_file` (local)
2. mmx handles preprocessing automatically
3. Call `mmx_music` with `command: "cover"`

## Parameters Reference

### Required
- `command`: "generate" or "cover"
- `prompt`: Music description (style, mood, scenario)

### Optional - Generate
- `lyrics`: Song lyrics with structure tags
- `lyrics_file`: Path to lyrics file (use - for stdin)
- `instrumental`: Generate instrumental (no vocals)
- `lyrics_optimizer`: Auto-generate lyrics from prompt

### Optional - Advanced (Generate only)
- `vocals`: Vocal style
- `genre`: Music genre
- `mood`: Mood/emotion
- `instruments`: Instruments to feature
- `tempo`: Tempo description
- `bpm`: Exact tempo (BPM)
- `key`: Musical key
- `avoid`: Elements to avoid
- `references`: Reference artists
- `structure`: Song structure

### Optional - Cover
- `audio`: Reference audio URL
- `audio_file`: Local reference audio path
- `seed`: Reproducibility seed (0-1000000)

### Optional - Output
- `model`: Model name (music-3.0, music-2.6, music-cover, or free variants)
- `out`: Save directly to file path
- `format`: Audio format (mp3, wav, pcm)
- `sample_rate`: Sample rate (16000, 24000, 32000, 44100)
- `bitrate`: Bitrate (32000, 64000, 128000, 256000)
- `output_format`: url (24h expiry) or hex (saved to file)
- `stream`: Stream raw audio to stdout

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
- `music-3.0` (recommended): Text-to-music, RPM 120
- `music-2.6`: Previous-gen, RPM 120
- `music-cover`: Cover generation, RPM 120
- `music-3.0-free`: Free tier, RPM 3
- `music-2.6-free`: Free tier, RPM 3
- `music-cover-free`: Free tier, RPM 3

## Official MiniMax Lyrics Structure Tags

**IMPORTANT**: Only use these 14 officially supported tags for MiniMax:

| Tag | Purpose | Musical Function |
|-----|---------|------------------|
| `[Intro]` | Introduction | Sets the mood, often instrumental or minimal vocals |
| `[Verse]` | Verse section | Main storytelling, builds narrative |
| `[Pre Chorus]` | Pre-chorus build-up | Creates tension before the chorus |
| `[Chorus]` | Main chorus | The hook, memorable and repeatable |
| `[Interlude]` | Instrumental break | Musical passage between sections |
| `[Bridge]` | Bridge section | Contrasting section, adds variety |
| `[Outro]` | Ending | Fades out or concludes the song |
| `[Post Chorus]` | After chorus | Extends the chorus energy |
| `[Transition]` | Transition between sections | Smooth connector |
| `[Break]` | Break section | Pause or rhythmic break |
| `[Hook]` | Catchy hook | Short, memorable musical phrase |
| `[Build Up]` | Build-up section | Rising energy or tension |
| `[Inst]` | Instrumental section | Full instrumental passage |
| `[Solo]` | Solo section | Featured instrumental or vocal solo |

### Tags NOT Supported by MiniMax

⚠️ **Do NOT use these tags** (they may work on other platforms):
- `[Drop]` - NOT supported
- `[Build]` - NOT supported (use `[Build Up]` instead)
- `[Breakdown]` - NOT supported
- `[Outro Chorus]` - NOT supported
- `[Ad Lib]` - NOT supported
- `[Call and Response]` - NOT supported
- `[Vamp]` - NOT supported
- `[Coda]` - NOT supported

## Error Handling
- mmx CLI errors will be reported with the error message
- Common issues: mmx not installed, API key not set, rate limits

## Notes
- mmx CLI handles all API authentication via `MINIMAX_API_KEY`
- URL links expire after 24 hours
- Reference audio: 6 seconds to 6 minutes, max 50 MB
- Free tier has lower RPM limits
