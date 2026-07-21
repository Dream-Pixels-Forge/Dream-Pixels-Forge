# Pi Songsy - MiniMax Music Generation Extension

A Pi agent extension for generating music using the MiniMax API. Create songs from lyrics, instrumental tracks, or covers from reference audio.

## Features

- **Song Generation**: Create songs from lyrics with customizable style and mood
- **Instrumental Generation**: Generate instrumental tracks without vocals
- **Cover Creation**: Produce cover versions from reference audio
- **Multiple Models**: Support for music-3.0, music-2.6, and music-cover models
- **Audio Settings**: Configurable sample rate, bitrate, and format
- **Cover Preprocessing**: Extract lyrics and audio features for advanced cover workflows
- **Download to Disk**: Save generated music files locally

## Installation

### Option 1: Copy to Pi extensions directory

```bash
# Copy the extension to Pi's global extensions
cp -r extensions/songsy ~/.pi/agent/extensions/

# Or copy to project-local extensions
cp -r extensions/songsy .pi/extensions/
```

### Option 2: Symlink

```bash
# Create symlink in Pi's global extensions
ln -s /path/to/pi-songsy/extensions/songsy ~/.pi/agent/extensions/songsy

# Or in project-local extensions
ln -s /path/to/pi-songsy/extensions/songsy .pi/extensions/songsy
```

## Setup

1. Get a MiniMax API key from [platform.minimax.io](https://platform.minimax.io)
2. Set the environment variable:
   ```bash
   export MINIMAX_API_KEY=your_api_key
   ```
   Or add to your `.env` file:
   ```
   MINIMAX_API_KEY=your_api_key
   ```

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

### Tool: `minimax_music_cover_preprocess`

Preprocess reference audio for cover generation:

```typescript
minimax_music_cover_preprocess({
  audio_url: "https://example.com/song.mp3"
})
// Returns: cover_feature_id, formatted_lyrics, structure_result
```

### Command: `/music`

Quick music generation:
```
/music upbeat electronic dance track
```

## Model Options

- `music-3.0` (recommended): Text-to-music, RPM 120
- `music-2.6`: Previous-gen, RPM 120
- `music-cover`: Cover generation, RPM 120
- `music-3.0-free`: Free tier, RPM 3
- `music-2.6-free`: Free tier, RPM 3
- `music-cover-free`: Free tier, RPM 3

## Lyrics Structure Tags

Use these tags to structure lyrics:
- `[Intro]`, `[Verse]`, `[Pre Chorus]`, `[Chorus]`
- `[Interlude]`, `[Bridge]`, `[Outro]`, `[Post Chorus]`
- `[Transition]`, `[Break]`, `[Hook]`, `[Build Up]`
- `[Inst]`, `[Solo]`

## Audio Settings

- `sample_rate`: 16000, 24000, 32000, 44100
- `bitrate`: 32000, 64000, 128000, 256000
- `format`: mp3, wav, pcm

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

## Development

### Prerequisites

- Node.js 18+
- Pi agent installed

### Testing

1. Install dependencies:
   ```bash
   cd extensions/songsy
   npm install
   ```

2. Test with Pi:
   ```bash
   pi -e ./extensions/songsy
   ```

### Building

The extension uses TypeScript but runs directly via Pi's jiti loader. No build step required.

## API Reference

See [REFERENCE.md](skills/songsy/REFERENCE.md) for detailed API documentation.

## Examples

See [EXAMPLES.md](skills/songsy/EXAMPLES.md) for usage examples.

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

## License

MIT