---
name: songsy
description: Generate music using MiniMax API. Create songs from lyrics, instrumental tracks, or covers from reference audio. Use when user wants to generate music, create songs, make instrumentals, or produce music covers.
---

# Songsy - MiniMax Music Generation

## Overview
Generate music using MiniMax's music generation API. Supports text-to-music, instrumental generation, and cover creation from reference audio.

## Tools
This extension provides four tools:
1. `mmx_music` - Generate music via mmx CLI (recommended, requires mmx installed)
2. `minimax_music` - Generate music via direct API (no mmx required)
3. `minimax_music_cover_preprocess` - Preprocess reference audio for cover generation
4. `minimax_music_download` - Download generated music to disk

## Quick Start

### With mmx CLI (recommended)
1. Generate a song: `mmx_music` with `command: "generate"`, `prompt: "Pop, upbeat"`, `lyrics: "[Verse]..."`, `out: "./song.mp3"`
2. Generate instrumental: `mmx_music` with `command: "generate"`, `prompt: "Epic orchestral"`, `instrumental: true`, `out: "./bgm.mp3"`
3. Create a cover: `mmx_music` with `command: "cover"`, `prompt: "Acoustic version"`, `audio: "https://example.com/song.mp3"`, `out: "./cover.mp3"`
4. Advanced: add `vocals`, `genre`, `mood`, `instruments`, `bpm`, `key`, `references`

### Without mmx CLI (direct API)
1. Generate a song: `minimax_music` with `model: "music-3.0"`, `prompt: "Pop, upbeat"`, `lyrics: "[Verse]..."`
2. Generate instrumental: `minimax_music` with `model: "music-3.0"`, `prompt: "Epic orchestral"`, `is_instrumental: true`
3. Create a cover: `minimax_music` with `model: "music-cover"`, `audio_url: "https://example.com/song.mp3"`, `prompt: "Acoustic version"`

## Workflows

### Song Generation (mmx)
1. Write prompt describing style/mood/scenario
2. Write lyrics with structure tags: `[Verse]`, `[Chorus]`, etc.
3. Optionally add advanced params: `vocals`, `genre`, `mood`, `instruments`, `bpm`, `key`
4. Call `mmx_music` with `command: "generate"` and `out` path

### Song Generation (API)
1. Choose model: `music-3.0` (recommended), `music-2.6`, or free variants
2. Write prompt describing style/mood/scenario
3. Write lyrics with structure tags
4. Call `minimax_music`

### Instrumental Generation (mmx)
1. Write descriptive prompt
2. Set `instrumental: true`
3. Call `mmx_music` with `command: "generate"`

### Instrumental Generation (API)
1. Choose model: `music-3.0` or `music-2.6`
2. Write descriptive prompt
3. Set `is_instrumental: true`
4. Call `minimax_music`

### Cover Generation (mmx)
1. Provide reference audio via `audio` (URL) or `audio_file` (local)
2. mmx handles preprocessing automatically
3. Call `mmx_music` with `command: "cover"`

### Cover Generation (API)
1. Choose model: `music-cover` or `music-cover-free`
2. Provide reference audio via `audio_url` or `audio_base64`
3. Call `minimax_music`

## Parameters Reference

### Required
- `model`: Model name (see options below)

### Optional
- `prompt`: Music description (style, mood, scenario)
- `lyrics`: Song lyrics with structure tags
- `is_instrumental`: Generate instrumental (no vocals)
- `lyrics_optimizer`: Auto-generate lyrics from prompt
- `audio_setting`: Audio configuration (sample_rate, bitrate, format)
- `output_format`: `url` or `hex` (default: `hex`)
- `stream`: Streaming output (default: false)

### Cover-specific
- `audio_url`: Reference audio URL
- `audio_base64`: Base64-encoded reference audio
- `cover_feature_id`: Preprocessed audio features

## mmx Advanced Parameters

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

## Audio Settings
- `sample_rate`: 16000, 24000, 32000, 44100
- `bitrate`: 32000, 64000, 128000, 256000
- `format`: mp3, wav, pcm

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
Check `base_resp.status_code` in response:
- `0`: Success
- `1002`: Rate limit, retry later
- `1004`: Authentication failed
- `1008`: Insufficient balance
- `1026`: Content flagged
- `2013`: Invalid parameters
- `2049`: Invalid API Key

## Advanced Features
- Two-step cover workflow with `cover_feature_id`
- Lyrics optimization from prompt
- Streaming output for real-time generation
- Multiple output formats

## Notes
- URL links expire after 24 hours
- Reference audio: 6 seconds to 6 minutes, max 50 MB
- Free tier has lower RPM limits