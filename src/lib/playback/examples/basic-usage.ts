/**
 * Basic Usage Examples
 * Demonstrates how to use the playback synchronization system
 */

import { getPlaybackCoordinator } from '../playback-coordinator'
import { ScoreSync } from '../score-sync'
import { KeyboardSync } from '../keyboard-sync'

/**
 * Example 1: Basic Setup
 */
export function example1_basicSetup() {
  // Get coordinator instance
  const coordinator = getPlaybackCoordinator()

  // Initialize with time signature (4/4 time)
  coordinator.initialize(4)

  // Start playback
  coordinator.startPlayback()

  // Handle MIDI note events
  coordinator.handleNoteOn(
    {
      midiNote: 60,
      velocity: 100,
      duration: 0.5,
      time: 0
    },
    'SOPRANO'
  )

  // After some time, note off
  setTimeout(() => {
    coordinator.handleNoteOff(60)
  }, 500)

  // Stop playback
  setTimeout(() => {
    coordinator.stopPlayback()
  }, 2000)

  // Cleanup
  return () => coordinator.dispose()
}

/**
 * Example 2: Score Synchronization
 */
export function example2_scoreSync() {
  const coordinator = getPlaybackCoordinator()
  coordinator.initialize(4)

  // Create score sync manager
  const scoreSync = new ScoreSync({
    autoScroll: true,
    scrollDuration: 300,
    highlightMeasure: true
  })

  // Set scroll container (in actual usage, this would be a DOM element)
  // scoreSync.setScrollContainer(document.getElementById('score-container'))

  // Listen to cursor updates
  coordinator.on('cursor-update', (position) => {
    scoreSync.updateCursor(position)
    console.log(`Cursor at M${position.measure}:B${position.beat}`)
  })

  // Simulate playback
  coordinator.startPlayback()

  // Cleanup
  return () => {
    scoreSync.dispose()
    coordinator.dispose()
  }
}

/**
 * Example 3: Keyboard Highlighting
 */
export function example3_keyboardHighlights() {
  const coordinator = getPlaybackCoordinator()
  coordinator.initialize(4)

  const keyboardSync = new KeyboardSync({
    voiceColors: true,
    velocityOpacity: true,
    fadeOutDuration: 150
  })

  // Listen to note events
  coordinator.on('note-on', (note) => {
    keyboardSync.addNoteHighlight(note)
    const highlights = keyboardSync.getHighlights()
    console.log(`Active notes: ${highlights.length}`)
  })

  coordinator.on('note-off', (midiNote) => {
    keyboardSync.removeNoteHighlight(midiNote)
  })

  // Simulate chord
  coordinator.handleNoteOn(
    { midiNote: 60, velocity: 100, duration: 1, time: 0 },
    'SOPRANO'
  )
  coordinator.handleNoteOn(
    { midiNote: 64, velocity: 100, duration: 1, time: 0 },
    'ALTO'
  )
  coordinator.handleNoteOn(
    { midiNote: 67, velocity: 100, duration: 1, time: 0 },
    'TENOR'
  )

  // Release chord
  setTimeout(() => {
    coordinator.handleNoteOff(60)
    coordinator.handleNoteOff(64)
    coordinator.handleNoteOff(67)
  }, 1000)

  // Cleanup
  return () => {
    keyboardSync.dispose()
    coordinator.dispose()
  }
}

/**
 * Example 4: Complete Integration
 */
export function example4_completeIntegration() {
  const coordinator = getPlaybackCoordinator()
  coordinator.initialize(4)

  const scoreSync = new ScoreSync({
    autoScroll: true,
    scrollDuration: 300
  })

  const keyboardSync = new KeyboardSync({
    voiceColors: true,
    velocityOpacity: true
  })

  // Setup event handlers
  coordinator.on('cursor-update', (position) => {
    scoreSync.updateCursor(position)
  })

  coordinator.on('note-on', (note) => {
    keyboardSync.addNoteHighlight(note)
  })

  coordinator.on('note-off', (midiNote) => {
    keyboardSync.removeNoteHighlight(midiNote)
  })

  coordinator.on('state-change', (state) => {
    console.log(`Playback state: ${state}`)
  })

  coordinator.on('measure-change', (measure, beat) => {
    console.log(`Measure changed: ${measure}:${beat}`)
  })

  // Simulate playback with measure changes
  coordinator.startPlayback()

  let currentMeasure = 1
  const interval = setInterval(() => {
    currentMeasure++
    coordinator.handleMeasureChange(currentMeasure)

    if (currentMeasure >= 4) {
      clearInterval(interval)
      coordinator.stopPlayback()
    }
  }, 1000)

  // Cleanup
  return () => {
    clearInterval(interval)
    scoreSync.dispose()
    keyboardSync.dispose()
    coordinator.dispose()
  }
}

/**
 * Example 5: Loop Region
 */
export function example5_loopRegion() {
  const coordinator = getPlaybackCoordinator()
  coordinator.initialize(4)

  const scoreSync = new ScoreSync()

  // Set loop region (measures 2-5)
  const loopMeasures = [2, 3, 4, 5]
  coordinator.setHighlightedMeasures(loopMeasures)

  // Listen to loop changes
  coordinator.on('loop-change', (measures) => {
    scoreSync.highlightMeasures(measures)
    console.log(`Loop region: measures ${measures.join(', ')}`)
  })

  // Cleanup
  return () => {
    scoreSync.dispose()
    coordinator.dispose()
  }
}

/**
 * Example 6: Tempo Control
 */
export function example6_tempoControl() {
  const coordinator = getPlaybackCoordinator()
  coordinator.initialize(4)

  // Start at normal speed
  coordinator.setTempoMultiplier(1.0)

  // Listen to tempo changes
  coordinator.on('tempo-change', (multiplier) => {
    console.log(`Tempo: ${multiplier * 100}%`)
  })

  // Slow down to 50%
  setTimeout(() => {
    coordinator.setTempoMultiplier(0.5)
  }, 1000)

  // Speed up to 150%
  setTimeout(() => {
    coordinator.setTempoMultiplier(1.5)
  }, 2000)

  // Back to normal
  setTimeout(() => {
    coordinator.setTempoMultiplier(1.0)
  }, 3000)

  // Cleanup
  return () => coordinator.dispose()
}

/**
 * Example 7: Seeking
 */
export function example7_seeking() {
  const coordinator = getPlaybackCoordinator()
  coordinator.initialize(4)

  // Start playback
  coordinator.startPlayback()

  // Seek to measure 5, beat 3
  setTimeout(() => {
    coordinator.seekTo(5, 3)
  }, 1000)

  // Seek to measure 1 (beginning)
  setTimeout(() => {
    coordinator.seekTo(1, 1)
  }, 2000)

  // Listen to measure changes
  coordinator.on('measure-change', (measure, beat) => {
    console.log(`Now at: ${measure}:${beat}`)
  })

  // Cleanup
  return () => coordinator.dispose()
}
