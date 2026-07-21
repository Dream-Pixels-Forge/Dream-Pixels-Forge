# Changelog

## [1.0.0] - 2026-07-21

### Added
- Initial release of songsy extension
- `minimax_music` tool for music generation
  - Song generation from lyrics
  - Instrumental generation
  - Cover creation from reference audio
  - Multiple model support (music-3.0, music-2.6, music-cover)
  - Free tier variants
  - Audio settings configuration
  - Streaming output support
- `minimax_music_cover_preprocess` tool for cover preprocessing
  - Reference audio analysis
  - Lyrics extraction
  - Audio feature extraction
- `minimax_music_download` tool for downloading music to disk
  - Download from URL
  - Decode hex-encoded audio data
  - Automatic directory creation
  - File size reporting
- `/music` command for quick generation
- Comprehensive documentation
  - SKILL.md with usage instructions
  - REFERENCE.md with API documentation
  - EXAMPLES.md with usage examples
  - QUICKSTART.md for quick setup
- TypeScript support with proper typing
- Error handling for API responses
- Environment variable support for API key
- Status indicators in Pi UI

### Features
- Generate songs with customizable style and mood
- Create instrumental tracks without vocals
- Produce cover versions from reference audio
- Support for multiple audio formats (mp3, wav, pcm)
- Configurable sample rate and bitrate
- Lyrics structure tags for better arrangement
- Two-step cover workflow for advanced editing
- Rate limit handling
- Comprehensive error messages

### Models Supported
- music-3.0 (recommended)
- music-2.6
- music-cover
- music-3.0-free
- music-2.6-free
- music-cover-free

### Audio Settings
- Sample rates: 16000, 24000, 32000, 44100 Hz
- Bitrates: 32000, 64000, 128000, 256000 bps
- Formats: mp3, wav, pcm

### Lyrics Structure Tags
- [Intro], [Verse], [Pre Chorus], [Chorus]
- [Interlude], [Bridge], [Outro], [Post Chorus]
- [Transition], [Break], [Hook], [Build Up]
- [Inst], [Solo]

### Error Codes Handled
- 0: Success
- 1002: Rate limit
- 1004: Authentication failed
- 1008: Insufficient balance
- 1026: Content flagged
- 2013: Invalid parameters
- 2049: Invalid API Key

## [Unreleased]

### Planned
- Batch generation support
- Playlist generation
- More audio effects
- Integration with other Pi tools
- Web UI for music preview
- Export to popular formats
- Collaboration features
- Template library
- Advanced mixing controls
- Real-time collaboration