import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    
    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    // Simulate backend processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now we'll just return mock data since no real API is needed. 
    // In a real application, the backend would process the audio File.
    const result = {
      id: "0x" + Math.random().toString(16).substring(2, 6).toUpperCase(),
      transcription: [
        {
          id: 1,
          question: "How do I optimize the latency in my real-time voice processing pipeline?",
          answer: "To optimize latency, prioritize using binary stream protocols like WebSockets or gRPC over standard REST calls. Implement local VAD (Voice Activity Detection) to strip silence before transmission."
        },
        {
          id: 2,
          question: "What is the best way to handle audio recording in the browser?",
          answer: "Use the Web Audio API alongside MediaRecorder. It provides robust capabilities for capturing audio streams, visualizing frequencies, and creating blobs that can be sent to your backend."
        }
      ],
      metadata: {
        confidence: 0.982,
        duration: "4.2s"
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing voice:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
