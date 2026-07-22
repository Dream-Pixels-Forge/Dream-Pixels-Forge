# Songsy Usage Examples

## Example 1: Generate a Pop Song

```typescript
mmx_music({
  command: "generate",
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
  out: "./music/pop-song.mp3"
})
```

## Example 2: Generate Instrumental Music

```typescript
mmx_music({
  command: "generate",
  prompt: "Epic orchestral, cinematic, heroic, building tension",
  instrumental: true,
  out: "./music/orchestral-bgm.mp3"
})
```

## Example 3: Generate a Cover

```typescript
// mmx handles preprocessing automatically
mmx_music({
  command: "cover",
  prompt: "Acoustic guitar version, soft and mellow",
  audio: "https://example.com/original-song.mp3",
  out: "./music/acoustic-cover.mp3"
})
```

## Example 4: Quick Song with Auto Lyrics

```typescript
mmx_music({
  command: "generate",
  prompt: "Melancholic piano ballad, emotional, heartfelt",
  lyrics_optimizer: true,
  out: "./music/auto-lyrics.mp3"
})
```

## Example 5: Generate with URL Output

```typescript
mmx_music({
  command: "generate",
  prompt: "Electronic dance music, high energy",
  instrumental: true,
  output_format: "url"
})
// Returns URL that expires in 24 hours
```

## Example 6: Low Quality Preview

```typescript
mmx_music({
  command: "generate",
  prompt: "Jazz, smooth, relaxed",
  lyrics: "[Verse]\nSmooth jazz flowing\n[Chorus]\nFeel the rhythm",
  model: "music-3.0-free",
  format: "mp3",
  sample_rate: 16000,
  bitrate: 32000,
  out: "./music/preview.mp3"
})
```

## Example 7: Complex Song Structure

```typescript
mmx_music({
  command: "generate",
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
  out: "./music/prog-rock.mp3"
})
```

## Example 8: Cover from Local File

```typescript
mmx_music({
  command: "cover",
  prompt: "Piano version, slow and emotional",
  audio_file: "./original.mp3",
  out: "./music/piano-cover.mp3"
})
```

## Example 9: Reproducible Output

```typescript
// Same seed = same output
mmx_music({
  command: "cover",
  prompt: "Pop, upbeat",
  audio: "https://example.com/ref.mp3",
  seed: 42,
  out: "./music/reproducible.mp3"
})
```

## Example 10: Advanced Parameters

```typescript
mmx_music({
  command: "generate",
  prompt: "Warm morning folk",
  vocals: "male and female duet, harmonies in chorus",
  instruments: "acoustic guitar, piano, strings",
  genre: "folk",
  mood: "warm",
  bpm: 95,
  key: "G major",
  avoid: "heavy drums, distortion",
  references: "similar to The Lumineers",
  structure: "verse-chorus-verse-bridge-chorus",
  out: "./music/folk-duet.mp3"
})
```

## Example 11: Gospel Song with Section Tags

```typescript
mmx_music({
  command: "generate",
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
  out: "./music/gospel.mp3"
})
```

## Example 12: EDM Track with Build Up

```typescript
mmx_music({
  command: "generate",
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
[Outro]`,
  out: "./music/edm-anthem.mp3"
})
```

## Example 13: R&B Ballad

```typescript
mmx_music({
  command: "generate",
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
My everything...`,
  out: "./music/rnb-ballad.mp3"
})
```

## Example 14: Cover with Seed for Reproducibility

```typescript
// Generate multiple versions with different seeds
for (let seed = 1; seed <= 3; seed++) {
  mmx_music({
    command: "cover",
    prompt: "Indie folk, acoustic guitar",
    audio: "https://example.com/original.mp3",
    seed,
    out: `./music/cover-v${seed}.mp3`
  })
}
```

## Example 15: Instrumental with Specific Style

```typescript
mmx_music({
  command: "generate",
  prompt: "Lo-fi hip hop, chill beats, study music",
  instrumental: true,
  bpm: 85,
  mood: "relaxed",
  avoid: "vocals, aggressive drums",
  out: "./music/lofi-beats.mp3"
})
```

## Example 16: Song with Custom Key and Structure

```typescript
mmx_music({
  command: "generate",
  prompt: "Classical piano concerto, elegant, virtuosic",
  key: "D minor",
  structure: "intro-verse-solo-verse-bridge-solo-outro",
  tempo: "moderate",
  out: "./music/piano-concerto.mp3"
})
```
