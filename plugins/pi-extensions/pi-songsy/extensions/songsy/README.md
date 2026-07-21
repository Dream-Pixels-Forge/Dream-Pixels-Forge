# Songsy - MiniMax Music Generation Extension

A Pi agent extension that provides music generation capabilities using the MiniMax API.

## Features

- **Song Generation**: Create songs from lyrics with customizable style and mood
- **Instrumental Generation**: Generate instrumental tracks without vocals
- **Cover Creation**: Produce cover versions from reference audio
- **Multiple Models**: Support for music-3.0, music-2.6, and music-cover models
- **Audio Settings**: Configurable sample rate, bitrate, and format

## Setup

1. Get a MiniMax API key from [platform.minimax.io](https://platform.minimax.io)
2. Set the environment variable: `MINIMAX_API_KEY=your_api_key`
3. Place this extension in `~/.pi/agent/extensions/songsy/` or `.pi/extensions/songsy/`

## Usage

### Tool: `minimax_music`

Generate music with the `minimax_music` tool:

```typescript
// Generate a song with lyrics
minimax_music({
  model: "music-3.0",
  prompt: "Pop, upbeat, summer vibes",
  lyrics: "[Verse]\nSunshine feels so good\n[Chorus]\nLet's dance all night"
})

// Generate instrumental
minimax_music({
  model: "music-3.0",
  prompt: "Epic orchestral, cinematic",
  is_instrumental: true
})

// Create a cover
minimax_music({
  model: "music-cover",
  audio_url: "https://example.com/song.mp3",
  prompt: "Acoustic guitar version"
})
```

### Command: `/music`

Quick music generation:
```
/music upbeat electronic dance track
```

## Parameters

### Required
- `model`: Model name (music-3.0, music-2.6, music-cover, or free variants)

### Optional
- `prompt`: Music description (style, mood, scenario)
- `lyrics`: Song lyrics with structure tags
- `is_instrumental`: Generate instrumental (no vocals)
- `lyrics_optimizer`: Auto-generate lyrics from prompt
- `audio_setting`: Audio configuration
- `output_format`: url or hex (default: hex)
- `stream`: Streaming output (default: false)

### Cover-specific
- `audio_url`: Reference audio URL
- `audio_base64`: Base64-encoded reference audio
- `cover_feature_id`: Preprocessed audio features

## Lyrics Structure Tags

Use these tags to structure lyrics:
- `[Intro]`, `[Verse]`, `[Pre Chorus]`, `[Chorus]`
- `[Interlude]`, `[Bridge]`, `[Outro]`, `[Post Chorus]`
- `[Transition]`, `[Break]`, `[Hook]`, `[Build Up]`
- `[Inst]`, `[Solo]`

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

## Error Handling

Check `base_resp.status_code` in response:
- `0`: Success
- `1002`: Rate limit, retry later
- `1004`: Authentication failed
- `1008`: Insufficient balance
- `1026`: Content flagged
- `2013`: Invalid parameters
- `2049`: Invalid API Key

## Notes

- URL links expire after 24 hours
- Reference audio: 6 seconds to 6 minutes, max 50 MB
- Free tier has lower RPM limits
- Set `MINIMAX_API_KEY` environment variable for authentication