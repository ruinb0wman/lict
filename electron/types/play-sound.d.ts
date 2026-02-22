declare module 'play-sound' {
  interface PlaySoundOptions {
    player?: string
  }
  
  interface Player {
    play(path: string, callback?: (err: Error | null) => void): void
  }
  
  function playSound(opts?: PlaySoundOptions): Player
  export default playSound
}
