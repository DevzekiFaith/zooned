declare namespace JitsiMeetJS {
  interface JitsiMeetExternalAPI {
    dispose: () => void;
    executeCommand: (command: string, ...args: any[]) => void;
    // Add other methods as needed
  }
}

declare module 'jitsi-meet' {
  export = JitsiMeetJS;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: {
        roomName: string;
        width?: string;
        height?: string;
        parentNode: HTMLElement | null;
        configOverwrite?: Record<string, any>;
        interfaceConfigOverwrite?: Record<string, any>;
      }
    ) => JitsiMeetJS.JitsiMeetExternalAPI;
  }
}
