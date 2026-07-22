# Changelog

## [2.0.0] - 2026-07-21

### Changed
- **BREAKING**: Extension now only uses mmx CLI (no direct API calls)
- Removed `minimax_music` tool (direct API)
- Removed `minimax_music_cover_preprocess` tool (direct API)
- Removed `minimax_music_download` tool (mmx handles --out)
- Single tool: `mmx_music` for all music generation
- Simplified extension to depend only on mmx CLI

### Removed
- Direct MiniMax API integration
- Cover preprocessing tool (mmx handles automatically)
- Download tool (mmx --out saves directly)
- API response type definitions
- MINIMAX_API_KEY requirement for extension (mmx CLI handles auth)

### Added
- Prerequisite: mmx CLI must be installed (`npm install -g mmx`)
- Auto-detection of mmx CLI availability
- Clear error messages when mmx not found

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
