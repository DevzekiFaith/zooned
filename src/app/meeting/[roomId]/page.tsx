'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

export default function MeetingPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const meetingLink = typeof window !== 'undefined' ? `${window.location.origin}/meeting/${params.roomId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Jitsi Meet API script if not already loaded
      if (!(window as any).JitsiMeetExternalAPI) {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = initializeJitsi;
        document.body.appendChild(script);
      } else {
        initializeJitsi();
      }
    }

    function initializeJitsi() {
      const domain = 'meet.jit.si';
      const options = {
        roomName: params.roomId,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainer.current,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
        },
      };

      const api = new (window as any).JitsiMeetExternalAPI(domain, options);

      api.executeCommand('displayName', 'Guest');

      return () => {
        if (api) {
          api.dispose();
        }
      };
    }
  }, [params.roomId]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-sm text-gray-300">Meeting ID:</span>
            <span className="font-mono">{params.roomId}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            {copied ? (
              <>
                <FaCheck className="text-green-400" /> Copied!
              </>
            ) : (
              <>
                <FaCopy /> Copy Link
              </>
            )}
          </button>
        </div>
      </header>
      <div className="flex-1" ref={jitsiContainer}>
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
          <p>Loading meeting...</p>
        </div>
      </div>
    </div>
  );
}
