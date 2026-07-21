---
name: songsy
description: Generate music using MiniMax API. Create songs from lyrics, instrumental tracks, or covers from reference audio. Use when user wants to generate music, create songs, make instrumentals, or produce music covers.
---

# Songsy - MiniMax Music Generation

## Overview
Generate music using MiniMax's music generation API. Supports text-to-music, instrumental generation, and cover creation from reference audio.

## Tools
This extension provides three tools:
1. `minimax_music` - Generate music from lyrics, instrumentals, or covers
2. `minimax_music_cover_preprocess` - Preprocess reference audio for cover generation
3. `minimax_music_download` - Download generated music to disk

## Quick Start
1. Generate a song with lyrics: `minimax_music` with `model: "music-3.0"`, `prompt: "Pop, upbeat"`, `lyrics: "[Verse]..."`
2. Generate instrumental: `minimax_music` with `model: "music-3.0"`, `prompt: "Epic orchestral"`, `is_instrumental: true`
3. Create a cover: `minimax_music` with `model: "music-cover"`, `audio_url: "https://example.com/song.mp3"`, `prompt: "Acoustic version"`

## Workflows

### Song Generation
1. Choose model: `music-3.0` (recommended), `music-2.6`, or free variants
2. Write prompt describing style/mood/scenario
3. Write lyrics with structure tags: `[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]`, etc.
4. Configure audio settings (optional)
5. Call `minimax_music`

### Instrumental Generation
1. Choose model: `music-3.0` or `music-2.6`
2. Write descriptive prompt
3. Set `is_instrumental: true`
4. Call `minimax_music`

### Cover Generation
1. Choose model: `music-cover` or `music-cover-free`
2. Provide reference audio via `audio_url` or `audio_base64`
3. Optionally modify lyrics
4. Call `minimax_music`

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