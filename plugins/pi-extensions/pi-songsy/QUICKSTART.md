# Quick Start Guide

## 1. Install the Extension

### Option A: Install from GitHub (recommended)

```bash
cd /tmp && git clone --depth 1 https://github.com/Dream-Pixels-Forge/Dream-Pixels-Forge.git && cp -r Dream-Pixels-Forge/plugins/pi-extensions/pi-songsy/extensions/songsy ~/.pi/agent/extensions/ && rm -rf /tmp/Dream-Pixels-Forge
```

### Option B: Copy to Pi extensions directory

```bash
cd /path/to/pi-songsy
cp -r extensions/songsy ~/.pi/agent/extensions/
```

### Option C: Symlink

```bash
ln -s /path/to/pi-songsy/extensions/songsy ~/.pi/agent/extensions/songsy
```

## 2. Install mmx CLI

```bash
npm install -g mmx
```

## 3. Set Up API Key

1. Get a MiniMax API key from [platform.minimax.io](https://platform.minimax.io)
2. Set the environment variable:

```bash
export MINIMAX_API_KEY=your_api_key_here
```

Or add to your `.env` file:

```
MINIMAX_API_KEY=your_api_key_here
```

## 4. Test the Extension

```bash
# Start Pi with the extension
pi -e ./extensions/songsy

# Or if installed in ~/.pi/agent/extensions/
pi

# Ask Pi about available tools
"What tools are available?"
```

## 5. Generate Music

### Generate a Song with Lyrics

```typescript
mmx_music({
  command: "generate",
  prompt: "Pop, upbeat, summer vibes",
  lyrics: `[Verse]
Sunshine feels so good
[Chorus]
Let's dance all night`,
  out: "./music/summer.mp3"
})
```

### Generate with Advanced Parameters

```typescript
mmx_music({
  command: "generate",
  prompt: "Warm morning folk",
  vocals: "male and female duet, harmonies in chorus",
  instruments: "acoustic guitar, piano",
  bpm: 95,
  genre: "folk",
  mood: "warm",
  out: "./music/duet.mp3"
})
```

### Generate Instrumental Music

```typescript
mmx_music({
  command: "generate",
  prompt: "Epic orchestral, cinematic",
  instrumental: true,
  out: "./music/bgm.mp3"
})
```

### Auto-Generate Lyrics

```typescript
mmx_music({
  command: "generate",
  prompt: "Upbeat pop about summer",
  lyrics_optimizer: true,
  out: "./music/summer.mp3"
})
```

### Create a Cover

```typescript
// From URL (preprocessing handled automatically)
mmx_music({
  command: "cover",
  prompt: "Indie folk, acoustic guitar",
  audio: "https://example.com/song.mp3",
  out: "./music/cover.mp3"
})

// From local file
mmx_music({
  command: "cover",
  prompt: "Jazz, piano, slow",
  audio_file: "./original.mp3",
  out: "./music/jazz_cover.mp3"
})
```

### Reproducible Output

```typescript
mmx_music({
  command: "cover",
  prompt: "Pop, upbeat",
  audio: "https://example.com/ref.mp3",
  seed: 42,
  out: "./music/reproducible.mp3"
})
```

## 6. Use the Command

```bash
# Quick music generation
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

## Troubleshooting

### "mmx CLI not found"
- Install with: `npm install -g mmx`
- Ensure npm global bin is in your PATH

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
