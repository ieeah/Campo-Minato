/**
 * Audio Manager
 * Centralized audio management for the game
 */

class AudioManager {
  constructor() {
    this.audioClick = null;
    this.audioLost = null;
    this.audioWon = null;
    this.audioFlag = null;
    this.muted = false;
  }

  /**
   * Initializes audio elements from the DOM
   */
  init() {
    this.audioClick = document.getElementById("audio_click");
    this.audioLost = document.getElementById("audio_lost");
    this.audioWon = document.getElementById("audio_won");
    this.audioFlag = document.getElementById("audio_flag");
  }

  /**
   * Plays an audio element if not muted
   * @param {HTMLAudioElement} audio - Audio element to play
   */
  play(audio) {
    if (!this.muted && audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play();
    }
  }

  /**
   * Plays the click sound
   */
  playClick() {
    this.play(this.audioClick);
  }

  /**
   * Plays the game lost sound
   */
  playLost() {
    this.play(this.audioLost);
  }

  /**
   * Plays the game won sound
   */
  playWon() {
    this.play(this.audioWon);
  }

  /**
   * Plays the flag sound
   */
  playFlag() {
    this.play(this.audioFlag);
  }

  /**
   * Sets the muted state
   * @param {boolean} value - Whether to mute audio
   */
  setMuted(value) {
    this.muted = value;
  }

  /**
   * Gets the current muted state
   * @returns {boolean} Whether audio is muted
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Toggles the muted state
   * @returns {boolean} New muted state
   */
  toggleMuted() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Gets all audio elements as an object (for compatibility)
   * @returns {Object} Object containing all audio elements
   */
  getElements() {
    return {
      audioClick: this.audioClick,
      audioLost: this.audioLost,
      audioWon: this.audioWon,
      audioFlag: this.audioFlag,
    };
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
