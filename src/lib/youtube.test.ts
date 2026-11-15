import { test } from 'node:test'
import assert from 'node:assert/strict'
import { outputVolume, parseYouTubeId } from './youtube.ts'

test('accepts video IDs and supported YouTube link formats', () => {
  for (const input of ['1nZh1ILveC4', 'https://www.youtube.com/watch?v=1nZh1ILveC4&t=30', 'https://youtu.be/1nZh1ILveC4?si=abc', 'youtube.com/live/1nZh1ILveC4', 'https://m.youtube.com/shorts/1nZh1ILveC4', 'https://www.youtube-nocookie.com/embed/1nZh1ILveC4']) {
    assert.equal(parseYouTubeId(input), '1nZh1ILveC4')
  }
})
test('rejects lookalike hosts, playlists, executable URLs, and malformed IDs', () => {
  for (const input of ['https://youtube.com.evil.test/watch?v=1nZh1ILveC4', 'https://evil.test/?v=1nZh1ILveC4', 'javascript:alert(1)', 'https://youtube.com/playlist?list=abc', 'abcd', 'https://youtube.com/watch?v=<script>']) assert.equal(parseYouTubeId(input), null)
})
test('master changes preserve channel balance and mute/silence reach zero', () => {
  assert.equal(outputVolume(0, 0, false), 100)
  assert.equal(outputVolume(-6, 0, false), 50)
  assert.equal(outputVolume(-6, -6, false), 25)
  assert.equal(outputVolume(0, -60, false), 0)
  assert.equal(outputVolume(-60, 0, false), 0)
  assert.equal(outputVolume(0, 0, true), 0)
})
