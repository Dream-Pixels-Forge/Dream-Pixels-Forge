# MiniMax Music Generation API Reference

## Endpoints

### POST /v1/music_generation
Generate music from lyrics and prompt.

### POST /v1/music_cover_preprocess
Preprocess reference audio for cover generation. Returns `cover_feature_id` and extracted lyrics.

## Tools

### minimax_music
Main tool for music generation. Supports all models and parameters.

### minimax_music_cover_preprocess
Preprocessing tool for cover generation. Use before generating covers with modified lyrics.

### minimax_music_download
Download generated music to disk. Save audio from URL or hex-encoded data.

## Authentication
- Bearer token authentication
- Set `MINIMAX_API_KEY` environment variable
- API key from [platform.minimax.io](https://platform.minimax.io)

## Request Body (Music Generation)

```json
{
  "model": "music-3.0",
  "prompt": "Pop, melancholic, perfect for a rainy night",
  "lyrics": "[verse]\nStreetlights flicker, the night breeze sighs\n[chorus]\nPushing the wooden door, the aroma spreads",
  "is_instrumental": false,
  "lyrics_optimizer": false,
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  },
  "output_format": "hex",
  "stream": false
}
```

## Response Body

```json
{
  "data": {
    "status": 2,
    "audio": "hex-encoded audio data"
  },
  "trace_id": "04ede0ab069fb1ba8be5156a24b1e081",
  "extra_info": {
    "music_duration": 25364,
    "music_sample_rate": 44100,
    "music_channel": 2,
    "bitrate": 256000,
    "music_size": 813651
  },
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

## Cover Preprocessing

### Request
```json
{
  "model": "music-cover",
  "audio_url": "https://example.com/song.mp3"
}
```

### Response
```json
{
  "cover_feature_id": "a1b2c3d4e5f67890abcdef1234567890",
  "formatted_lyrics": "[Verse 1]\nFirst line of the song\n[Chorus]\nThis is the chorus",
  "structure_result": "{\"num_segments\":4,\"segments\":[...]}",
  "audio_duration": 90,
  "trace_id": "061e5f144eb7f10b1fdde81126e24f91",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

## Two-Step Cover Workflow

1. Call `/v1/music_cover_preprocess` with reference audio
2. Receive `cover_feature_id` and `formatted_lyrics`
3. Optionally modify lyrics
4. Call `/v1/music_generation` with `cover_feature_id` and modified lyrics

## Model Specifications

### music-3.0 (Recommended)
- Text-to-music generation
- Available to Token Plan and paid users
- RPM: 120
- Supports lyrics optimization
- Supports instrumental generation

### music-2.6
- Previous-generation text-to-music model
- Available to Token Plan and paid users
- RPM: 120

### music-cover
- Cover generation from reference audio
- Available to Token Plan and paid users
- RPM: 120
- Reference audio: 6 seconds to 6 minutes, max 50 MB

### Free Tier Models
- `music-3.0-free`, `music-2.6-free`, `music-cover-free`
- Available to all users via API Key
- RPM: 3

## Audio Settings Details

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

## Error Codes

- `0`: Success
- `1002`: Rate limit triggered, retry later
- `1004`: Authentication failed, check API Key
- `1008`: Insufficient balance
- `1026`: Content flagged for sensitive material
- `2013`: Invalid parameters, check input
- `2049`: Invalid API Key

## Rate Limits

- Paid models: 120 RPM
- Free models: 3 RPM
- Monitor `base_resp.status_code` for rate limit errors

## Best Practices

1. Use `music-3.0` for best quality
2. Provide descriptive prompts for better results
3. Use structure tags in lyrics for better arrangement
4. Set appropriate audio settings for your use case
5. Download URL outputs within 24 hours
6. Handle rate limits with exponential backoff
7. Use cover preprocessing for complex cover workflows