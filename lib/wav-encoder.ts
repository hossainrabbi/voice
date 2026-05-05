/**
 * Encodes raw PCM Float32Array samples into a valid WAV Blob.
 * @param samples  - Interleaved (mono) Float32 PCM samples in [-1, 1]
 * @param sampleRate - The AudioContext sample rate (e.g. 44100 or 48000)
 * @param numChannels - Number of channels (default: 1 mono)
 */
export function encodeWav(
  samples: Float32Array,
  sampleRate: number,
  numChannels = 1,
): Blob {
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = samples.length * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // --- RIFF chunk descriptor ---
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  writeString(view, 8, "WAVE");

  // --- fmt sub-chunk ---
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);         // Subchunk1Size (PCM = 16)
  view.setUint16(20, 1, true);          // AudioFormat   (PCM = 1)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // --- data sub-chunk ---
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Convert Float32 [-1, 1] → Int16 PCM
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
