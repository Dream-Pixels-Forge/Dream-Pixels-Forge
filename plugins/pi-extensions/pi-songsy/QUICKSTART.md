# Quick Start Guide

## 1. Install the Extension

### Option A: Copy to Pi extensions directory (recommended)

```bash
# Navigate to the extension directory
cd /path/to/pi-songsy

# Copy to Pi's global extensions
cp -r extensions/songsy ~/.pi/agent/extensions/
```

### Option B: Symlink

```bash
# Create symlink in Pi's global extensions
ln -s /path/to/pi-songsy/extensions/songsy ~/.pi/agent/extensions/songsy
```

## 2. Set Up API Key

1. Get a MiniMax API key from [platform.minimax.io](https://platform.minimax.io)
2. Set the environment variable:

```bash
export MINIMAX_API_KEY=your_api_key_here
```

Or add to your `.env` file:

```
MINIMAX_API_KEY=your_api_key_here
```

## 3. Test the Extension

```bash
# Start Pi with the extension
pi -e ./extensions/songsy

# Or if installed in ~/.pi/agent/extensions/
pi

# Ask Pi about available tools
"What tools are available?"
```

## 4. Generate Music

### Generate a Song with Lyrics

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Pop, upbeat, summer vibes",
  lyrics: `[Verse]
Sunshine feels so good
[Chorus]
Let's dance all night`
})
```

### Generate Instrumental Music

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Epic orchestral, cinematic",
  is_instrumental: true
})
```

### Create a Cover

```typescript
// Step 1: Preprocess reference audio
const preprocess = await minimax_music_cover_preprocess({
  audio_url: "https://example.com/song.mp3"
});

// Step 2: Generate cover
minimax_music({
  model: "music-cover",
  cover_feature_id: preprocess.cover_feature_id,
  prompt: "Acoustic guitar version"
})
```

### Download Music to Disk

```typescript
// Generate music first
const result = await minimax_music({
  model: "music-3.0",
  prompt: "Pop, upbeat",
  output_format: "hex"
});

// Download to file
minimax_music_download({
  audio_hex: result.audio_hex,
  output_path: "./music/my-song.mp3"
});

// Or download from URL
minimax_music_download({
  audio_url: result.audio_url,
  output_path: "./music/my-song.mp3"
});
```

## 5. Use the Command

```bash
# Quick music generation
/music upbeat electronic dance track
```

## Model Options

- `music-3.0` (recommended): Best quality, RPM 120
- `music-2.6`: Previous gen, RPM 120
- `music-cover`: Cover generation, RPM 120
- `music-3.0-free`: Free tier, RPM 3
- `music-2.6-free`: Free tier, RPM 3
- `music-cover-free`: Free tier, RPM 3

## Lyrics Structure Tags

Use these tags in your lyrics:

- `[Intro]` - Introduction
- `[Verse]` - Verse section
- `[Pre Chorus]` - Pre-chorus build-up
- `[Chorus]` - Main chorus
- `[Interlude]` - Instrumental break
- `[Bridge]` - Bridge section
- `[Outro]` - Ending
- `[Post Chorus]` - After chorus
- `[Transition]` - Transition between sections
- `[Break]` - Break section
- `[Hook]` - Catchy hook
- `[Build Up]` - Build-up section
- `[Inst]` - Instrumental section
- `[Solo]` - Solo section

## Audio Settings

```typescript
audio_setting: {
  sample_rate: 44100,  // 16000, 24000, 32000, 44100
  bitrate: 256000,     // 32000, 64000, 128000, 256000
  format: "mp3"        // mp3, wav, pcm
}
```

## Troubleshooting

### "MiniMax API key not found"
- Set the `MINIMAX_API_KEY` environment variable
- Check that the API key is valid

### "Rate limit triggered"
- Wait a moment and retry
- Use a free tier model for testing

### "Invalid parameters"
- Check lyrics length (1-3500 characters)
- Check prompt length (0-2000 characters)
- Ensure required fields are provided

## Next Steps

- Read [README.md](README.md) for full documentation
- See [REFERENCE.md](skills/songsy/REFERENCE.md) for API details
- Check [EXAMPLES.md](skills/songsy/EXAMPLES.md) for more examples