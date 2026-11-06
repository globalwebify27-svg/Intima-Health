"use client";

import React, { useEffect, useRef } from "react";

export interface ZegoVideoCallProps {
  roomID: string;
  userID: string;
  userName: string;
  onLeaveRoom?: () => void;
  onJoinRoom?: () => void;
}

export function ZegoVideoCall({ roomID, userID, userName, onLeaveRoom, onJoinRoom }: ZegoVideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !roomID || !userID) return;
    
    let isMounted = true;

    const myCallContainer = async (element: HTMLDivElement) => {
      // Clear container before rendering
      element.innerHTML = "";

      // Generate Kit Token
      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "0", 10);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

      if (!appID || !serverSecret) {
        console.error("ZegoCloud AppID and ServerSecret must be set in .env.local");
        element.innerHTML = "<div class='flex items-center justify-center h-full w-full bg-slate-900 text-white'>Error: ZegoCloud AppID and ServerSecret must be set.</div>";
        return;
      }

      // Dynamically import to prevent SSR 'document is not defined' error
      const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

      if (!isMounted) return;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName || "Participant"
      );

      // Create instance object from Kit Token.
      zpRef.current = ZegoUIKitPrebuilt.create(kitToken);

      // Start the call
      zpRef.current.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: "Consultation Link",
            url:
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?appointmentId=" +
              roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // For 1-on-1 consultations
        },
        showPreJoinView: false,
        turnOnCameraWhenJoining: true,
        turnOnMicrophoneWhenJoining: true,
        useFrontFacingCamera: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: false,
        autoHideFooter: false,
        showRoomTimer: true,
        layout: "Auto",
        videoScreenConfig: {
          objectFit: "cover",
          localMirror: true,
        },
        videoViewConfig: [
          {
            showAvatarWhenCameraOff: true,
          },
        ],
        showNonVideoUser: true,
        onLeaveRoom: () => {
          if (onLeaveRoom) {
            onLeaveRoom();
          }
        },
        onJoinRoom: () => {
          if (onJoinRoom) {
            onJoinRoom();
          }
        },
      });
    };

    myCallContainer(containerRef.current);

    return () => {
      isMounted = false;
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (e) {
          console.warn("Zego destroy error:", e);
        }
        zpRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomID, userID, userName]);

  return (
    <div className="relative w-full h-full isolate">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden"
      ></div>
    </div>
  );
}
