# MiniMax Music Generation Reference

## Overview

This extension uses the **mmx CLI** for all music generation. The mmx CLI handles API authentication and all API calls internally.

## Prerequisites

Install mmx CLI:
```bash
npm install -g mmx
```

Set API key:
```bash
export MINIMAX_API_KEY=your_api_key_here
```

## Tool: mmx_music

### Command

`mmx_music`

### Parameters

#### Required
- `command`: "generate" or "cover"
- `prompt`: Music description (style, mood, scenario)

#### Generate Options
- `lyrics`: Song lyrics with structure tags (max 3500 chars)
- `lyrics_file`: Path to lyrics file (use - for stdin)
- `instrumental`: Generate instrumental (no vocals)
- `lyrics_optimizer`: Auto-generate lyrics from prompt

#### Cover Options
- `audio`: Reference audio URL
- `audio_file`: Local reference audio file path
- `seed`: Random seed 0-1000000 for reproducible results

#### Advanced Parameters (Generate only)
- `vocals`: Vocal style (e.g., "warm male baritone", "duet with harmonies")
- `genre`: Music genre (e.g., folk, pop, jazz, electronic)
- `mood`: Mood/emotion (e.g., warm, melancholic, uplifting)
- `instruments`: Instruments to feature (e.g., "acoustic guitar, piano, strings")
- `tempo`: Tempo description (e.g., fast, slow, moderate)
- `bpm`: Exact tempo in BPM (e.g., 95, 120)
- `key`: Musical key (e.g., "C major", "A minor")
- `avoid`: Elements to avoid (e.g., "heavy drums, distortion")
- `references`: Reference artists (e.g., "similar to Ed Sheeran")
- `structure`: Song structure (e.g., "verse-chorus-verse-bridge-chorus")

#### Output Options
- `model`: Model name (music-3.0, music-2.6, music-cover, or free variants)
- `out`: Save directly to file path (e.g., "./music/song.mp3")
- `format`: Audio format (mp3, wav, pcm)
- `sample_rate`: Sample rate (16000, 24000, 32000, 44100)
- `bitrate`: Bitrate (32000, 64000, 128000, 256000)
- `output_format`: Output format (url for 24h expiry, hex for saved to file)
- `stream`: Stream raw audio to stdout (boolean)

## Model Options

| Model | Description | Rate Limit |
|-------|-------------|------------|
| `music-3.0` | Text-to-music (recommended) | 120 RPM |
| `music-2.6` | Previous-gen text-to-music | 120 RPM |
| `music-cover` | Cover generation | 120 RPM |
| `music-3.0-free` | Free tier | 3 RPM |
| `music-2.6-free` | Free tier | 3 RPM |
| `music-cover-free` | Free tier | 3 RPM |

## Official MiniMax Lyrics Structure Tags

**IMPORTANT**: Only use these 14 officially supported tags:

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

## Audio Settings

### Sample Rate
- 16000 Hz (low quality, small size)
- 24000 Hz (medium quality)
- 32000 Hz (good quality)
- 44100 Hz (high quality, CD standard)

### Bitrate
- 32000 bps (low quality)
- 64000 bps (medium quality)
- 128000 bps (good quality)
- 256000 bps (high quality)

### Format
- `mp3`: Compressed, small file size
- `wav`: Uncompressed, large file size
- `pcm`: Raw audio data

## Error Handling

mmx CLI errors will be reported with the error message. Common issues:
- mmx not installed: Run `npm install -g mmx`
- API key not set: Set `MINIMAX_API_KEY` environment variable
- Rate limits: Wait and retry, or use free tier models
- Invalid parameters: Check lyrics length, prompt length, etc.

## Notes

- mmx CLI handles all API authentication internally
- URL outputs expire after 24 hours
- Reference audio: 6 seconds to 6 minutes, max 50 MB
- Free tier has lower RPM limits
