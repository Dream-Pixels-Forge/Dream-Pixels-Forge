# Songsy Usage Examples

## Example 1: Generate a Pop Song

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Pop, upbeat, summer vibes, catchy melody",
  lyrics: `[Intro]
Sunshine streaming through my window

[Verse 1]
Wake up to the sound of birds
Coffee brewing, feeling good
Today's the day we've been waiting for
Let's make the most of it

[Chorus]
Dance with me under the stars
Feel the rhythm in your heart
Tonight we're alive, let's celebrate
This beautiful moment we create

[Verse 2]
Walking down the empty street
Music playing on repeat
Every step feels like a dream
Nothing's ever what it seems

[Chorus]
Dance with me under the stars
Feel the rhythm in your heart
Tonight we're alive, let's celebrate
This beautiful moment we create

[Outro]
Sunshine streaming through my window`,
  audio_setting: {
    sample_rate: 44100,
    bitrate: 256000,
    format: "mp3"
  }
})
```

## Example 2: Generate Instrumental Music

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Epic orchestral, cinematic, heroic, building tension",
  is_instrumental: true,
  audio_setting: {
    sample_rate: 44100,
    bitrate: 256000,
    format: "wav"
  }
})
```

## Example 3: Generate a Cover

```typescript
// Step 1: Preprocess reference audio
const preprocessResult = await minimax_music_cover_preprocess({
  model: "music-cover",
  audio_url: "https://example.com/original-song.mp3"
});

// Step 2: Generate cover with modified lyrics
minimax_music({
  model: "music-cover",
  cover_feature_id: preprocessResult.cover_feature_id,
  prompt: "Acoustic guitar version, soft and mellow",
  lyrics: `[Verse 1]
Modified lyrics here
[Chorus]
New chorus lyrics here`,
  audio_setting: {
    sample_rate: 44100,
    bitrate: 128000,
    format: "mp3"
  }
})
```

## Example 4: Quick Song with Auto Lyrics

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Melancholic piano ballad, emotional, heartfelt",
  lyrics_optimizer: true
})
```

## Example 5: Generate with URL Output

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Electronic dance music, high energy",
  is_instrumental: true,
  output_format: "url"
})
// Returns URL that expires in 24 hours
```

## Example 6: Low Quality Preview

```typescript
minimax_music({
  model: "music-3.0-free",
  prompt: "Jazz, smooth, relaxed",
  lyrics: "[Verse]\nSmooth jazz flowing\n[Chorus]\nFeel the rhythm",
  audio_setting: {
    sample_rate: 16000,
    bitrate: 32000,
    format: "mp3"
  }
})
```

## Example 7: Complex Song Structure

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Progressive rock, complex arrangements, dynamic",
  lyrics: `[Intro]
Instrumental buildup

[Verse 1]
Complex lyrics here

[Pre Chorus]
Building tension

[Chorus]
Powerful chorus

[Interlude]
Guitar solo

[Verse 2]
More lyrics

[Bridge]
Different section

[Outro]
Fading out`,
  audio_setting: {
    sample_rate: 44100,
    bitrate: 256000,
    format: "wav"
  }
})
```

## Example 8: Cover with Lyrics Modification

```typescript
// Preprocess to get original lyrics
const preprocess = await minimax_music_cover_preprocess({
  model: "music-cover",
  audio_url: "https://example.com/song.mp3"
});

// Modify the extracted lyrics
const modifiedLyrics = preprocess.formatted_lyrics
  .replace("Original line", "New line");

// Generate cover with modified lyrics
minimax_music({
  model: "music-cover",
  cover_feature_id: preprocess.cover_feature_id,
  prompt: "Piano version, slow and emotional",
  lyrics: modifiedLyrics
})
```

## Example 9: Batch Generation

```typescript
// Generate multiple versions
const prompts = [
  "Upbeat pop, happy",
  "Sad ballad, emotional",
  "Electronic dance, high energy"
];

for (const prompt of prompts) {
  const result = await minimax_music({
    model: "music-3.0",
    prompt,
    is_instrumental: true,
    output_format: "url"
  });
  console.log(`Generated: ${result.audio_url}`);
}
```

## Example 10: Error Handling

```typescript
try {
  const result = await minimax_music({
    model: "music-3.0",
    prompt: "Test song",
    lyrics: "Test lyrics"
  });
  
  if (result.base_resp?.status_code !== 0) {
    console.error(`API Error: ${result.base_resp?.status_msg}`);
  }
} catch (error) {
  console.error(`Request failed: ${error.message}`);
}
```

## Example 11: Download Music to Disk

```typescript
// Generate music and download to file
const musicResult = await minimax_music({
  model: "music-3.0",
  prompt: "Pop, upbeat",
  lyrics: "[Verse]\nHello world",
  output_format: "hex"
});

// Download the generated music
const downloadResult = await minimax_music_download({
  audio_hex: musicResult.audio_hex,
  output_path: "./music/my-song.mp3"
});

console.log(`Downloaded to: ${downloadResult.output_path}`);
console.log(`File size: ${downloadResult.file_size}`);
```

## Example 12: Download from URL

```typescript
// Generate music with URL output
const musicResult = await minimax_music({
  model: "music-3.0",
  prompt: "Jazz, smooth",
  is_instrumental: true,
  output_format: "url"
});

// Download from URL
const downloadResult = await minimax_music_download({
  audio_url: musicResult.audio_url,
  output_path: "./music/jazz-instrumental.mp3"
});

console.log(`Downloaded: ${downloadResult.file_size}`);
```

## Example 13: Batch Download

```typescript
// Generate multiple songs and download all
const songs = [
  { prompt: "Pop, happy", lyrics: "[Verse]\nHappy day" },
  { prompt: "Rock, energetic", lyrics: "[Verse]\nRock on" },
  { prompt: "Classical, peaceful", is_instrumental: true }
];

for (let i = 0; i < songs.length; i++) {
  const musicResult = await minimax_music({
    model: "music-3.0",
    ...songs[i],
    output_format: "hex"
  });
  
  await minimax_music_download({
    audio_hex: musicResult.audio_hex,
    output_path: `./music/song-${i + 1}.mp3`
  });
}
```

## Example 14: Gospel Song with Section Tags

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Contemporary Gospel with soul influences, powerful choir",
  lyrics: `[Intro]
[Verse 1]
Walking through the valley of shadows
Finding light in the darkness above
[Pre Chorus]
Hold on tight, help is on the way
[Chorus]
Grace will lead me home
Grace will lead me home
[Verse 2]
Mountains high and valleys low
His love will guide me where I need to go
[Bridge]
When I'm weak, He makes me strong
When I'm lost, He leads me on
[Final Chorus]
Grace will lead me home
Grace will lead me home
[Outro]
Home, home, home...`,
  audio_setting: {
    sample_rate: 44100,
    bitrate: 256000,
    format: "mp3"
  }
})
```

## Example 15: EDM Track with Build Up

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Electronic dance music, high energy, festival anthem",
  lyrics: `[Intro]
[Verse 1]
Feel the beat drop low
Hands up, let's go
[Build Up]
Rising up, can you feel the power
[Chorus]
Let the music take control
[Verse 2]
Lights flash, bass kicks in
Heart racing, let the music begin
[Build Up]
Higher now, we're taking it there
[Chorus]
Let the music take control
[Bridge]
When the beat stops
We keep moving on
[Chorus]
Let the music take control
[Outro]
`,
  is_instrumental: false
})
```

## Example 16: R&B Ballad

```typescript
minimax_music({
  model: "music-3.0",
  prompt: "Smooth R&B ballad, intimate vocals, romantic mood",
  lyrics: `[Intro]
[Verse 1]
Soft whispers in the moonlight
Your touch feels so right
[Pre Chorus]
Can't help but fall for you
[Chorus]
Baby, you're my everything
The song my heart sings
[Verse 2]
Through storms and sunny days
Your love always stays
[Interlude]
[Bridge]
When the world fades away
You're all I need today
[Chorus]
Baby, you're my everything
The song my heart sings
[Outro]
My everything...`
})
```