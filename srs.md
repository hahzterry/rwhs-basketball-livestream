High School Basketball Livestream System — Software Requirements Specification (SRS)
Version: 1.3 (Svelte 5 and best practices)
Date: April 22, 2025

1. Introduction
1.1 Purpose
This document specifies the functional and non-functional requirements for the High School Basketball Livestream System. The primary goal of this system is to stream the semi-final and final games of a high school basketball tournament to Instagram Live in real time, through a defined video processing pipeline. This document serves as the primary basis for the development team's design, implementation, and testing.

1.2 Scope
The system covers the following scope:

Receiving live video signals from mobile devices (up to two).

Fetching live game scores from Google Sheets.

Providing an admin interface to monitor game feeds and (during finals) switch the primary video source.

Dynamically compositing the final output frame based on the tournament phase (semi-final / final).

Producing a final output frame that matches Instagram Live's vertical aspect ratio (9:16).

Integrating with OBS, which captures the system-generated frame and pushes it to Instagram Live.

Out of scope:

Installation, configuration, and operation of OBS.

Instagram account management and live-stream permission settings.

Creation and maintenance of Google Sheets.

Purchase of the VPS, OS installation, and base network configuration.

Native development of the mobile livestream app.

2. Overall Description
2.1 Product Vision
This system is a web application designed to simplify the integration of multiple mobile video signals with live scores, and to produce a vertical-format livestream for Instagram Live. The system uses LiveKit for WebRTC, a Rust backend for data integration and logic, and a Svelte 5 frontend for the operator interface and final frame output. The system acts as a source for OBS and interacts with an external LiveKit server, Google Sheets, OBS, and the Instagram Live platform.

2.2 Product Features
Live video reception: Receives live video streams from mobile devices. Assigns mobile roles based on tournament phase.

Live score integration: Reads game scores from Google Sheets and updates them in real time.

Admin and monitoring: Provides a web admin interface for operators to monitor feeds and perform necessary actions.

Dynamic frame compositing: Dynamically composites the final output frame based on phase and operator commands.

Vertical output: Ensures the frame matches the 9:16 aspect ratio.

OBS integration: Provides a web endpoint that OBS can capture via a Browser Source.

2.3 User Characteristics
Administrator / Operator: Should have basic computer skills and understand the livestream workflow. Responsible for monitoring feeds, verifying scores, and performing source switching during finals.

Mobile Camera Operator: Responsible for operating the phone to film. Should be able to open the designated webpage in a mobile browser and, following instructions, grant camera/microphone permissions and select the current filming context (e.g., court or angle).

2.4 General Constraints
Tech stack: Frontend must use Svelte 5, backend must use Rust, WebRTC infrastructure must use LiveKit.

Deployment environment: The LiveKit server and Rust backend must be deployed on a VPS.

Output platform: The final livestream destination is Instagram Live, and the output frame must be 9:16 vertical.

Security: A basic LiveKit token verification mechanism must be implemented. No sensitive information should be hardcoded.

2.5 Assumptions and Dependencies
The VPS is assumed to have enough CPU, RAM, and bandwidth to run LiveKit and the Rust backend.

All phones, admin computers, and the VPS are assumed to have stable, sufficient internet connectivity.

The Google Sheets document structure is assumed to match system read requirements and to be accessible by the Rust backend.

The operator is assumed to have correctly installed and configured OBS, and to know how to add a Browser Source and set up an Instagram livestream.

The LiveKit server is assumed to be correctly installed and configured (including a TURN server to ensure NAT traversal).

Mobile browsers are assumed to support WebRTC and required features.

3. Specific Requirements
3.1 Functional Requirements (FR)
FR-MODE-SWITCH: System mode switching
Provide a mechanism (e.g., triggered via the admin interface) that lets the Admin Page and Output Page switch between "semi-final mode" and "final mode," adjusting their behavior and layout accordingly. This state change must be implemented via Svelte's state management (e.g., a writable or derived store) so that all components update in sync.

FR-AUTH-TOKEN: LiveKit connection token generation
The Rust backend must be able to securely generate a connection Token with a validity period and participant identity/metadata using the LiveKit Secret Key.
Metadata must include at least phase (semi/final), game (game1/game2/final), and angle (main/angle1/angle2) so the frontend can identify the video source.

FR-INPUT-JOIN: Mobile video source join
The mobile Svelte page must be able to request a connection Token from the Rust backend.
After obtaining the Token, the mobile client must use the LiveKit JS SDK to join the specified LiveKit room.
The mobile Svelte page must provide a mechanism (e.g., a simple dropdown or settings) that lets the operator specify the current phase, court, or angle the phone represents, and include that information in the Metadata published to LiveKit. Using Svelte's form binding (bind:value) is recommended to simplify form handling.
The mobile client must request camera permission and "publish" video and audio to the LiveKit room, along with the specified Metadata.

FR-SCORE-PUSH: Live score push
The Rust backend must establish a WebSocket service.
When score data in the Google Sheet changes, Google Apps Script must detect that change.
Google Apps Script must POST the updated score data as an HTTP POST request to a specific API endpoint on the Rust backend. More precisely, when score data in the Google Sheet changes, Google Apps Script is triggered and sends the updated score data to the Rust backend.
Upon receiving score data, the Rust backend must push structured data containing phase and scores over WebSocket to all connected frontend clients (Admin Page, Output Page). Using a Svelte store to manage received scores is recommended, so it can be shared across multiple components.

FR-ADMIN-DISPLAY: Admin interface display
The Admin Page must be able to obtain a Token from the backend and join the LiveKit room.
The Admin Page must display the appropriate interface layout based on the current system mode. Using Svelte's dynamic components (<svelte:component>) to switch UI based on mode is recommended.

Semi-final mode: Must subscribe to and simultaneously display the main video feeds from both phones (representing game1 and game2), plus the corresponding live scores.

Final mode: Must subscribe to and simultaneously display the video feeds from both phones (representing angle1 and angle2), plus the final's live scores.

FR-ADMIN-CONTROL: Admin interface control (final mode)
In final mode, the Admin Page must provide clear controls (e.g., buttons) that let the operator choose which camera angle becomes the main feed. Using Svelte's event handling (on:click) to handle button clicks is recommended.
When the operator selects an angle, the Admin Page must send a command message via the LiveKit DataChannel containing action: 'switch_source' and the target targetSid (the selected phone's Participant SID).

FR-OUTPUT-SEMI: Output frame rendering (semi-final mode)
The Output Page (obs-output.html) must be designed for a 9:16 vertical aspect ratio.
In semi-final mode, the Output Page must:

Join the LiveKit room and connect to the backend WebSocket.

Based on Metadata, subscribe to the main horizontal (16:9) video and audio streams from both phones (representing game1 and game2).

In the vertical frame, render both horizontal streams simultaneously using a top/bottom split. Use CSS (object-fit: cover or another strategy) to handle cropping or filling. Using Svelte's {#each} block to dynamically render video elements is recommended.

Receive and display each game's live scores, overlaid near the corresponding video region. Storing score data in a Svelte store is recommended so the UI updates automatically.

FR-OUTPUT-FINAL: Output frame rendering (final mode)
The Output Page must:

Join the LiveKit room and connect to the backend WebSocket.

Listen for switch_source commands on the LiveKit DataChannel.

By default, subscribe to one angle's (e.g., angle1) vertical (9:16) video and audio stream initially.

On receiving a switch_source command, unsubscribe from the old stream and subscribe only to the selected vertical (9:16) video and audio stream, based on the targetSid in the command. Using Svelte's reactive declarations ($:) to handle side effects of switch_source commands is recommended.

Render this single vertical stream in the 9:16 page layout (fully visible).

Receive and display the final's live scores as an overlay.

FR-OBS-INTEGRATE: OBS integration
The Output Page (obs-output.html) must be capturable as a standalone webpage by OBS's "Browser Source."
The page background can be set to transparent, so OBS can perform further compositing if needed. Using CSS modules (<style module>) in Svelte components is recommended to avoid global style pollution.

FR-INSTAGRAM-STREAM: Instagram livestream (external)
The system-generated frame will ultimately be pushed by OBS to Instagram Live. OBS stream settings must meet Instagram's requirements (this is external to the system).

3.2 Non-Functional Requirements (NFR)
NFR-PERF-LATENCY: Performance — latency

Video latency through LiveKit should be as low as possible (target: sub-second).

Score update latency from Google Sheets to the Output Page should be within a few seconds. Using Svelte's onMount lifecycle hook to start data fetching, and setInterval to periodically check for updates, is recommended.

NFR-USABILITY-ADMIN: Usability — admin interface
The Admin Page interface should be clear and intuitive, especially with respect to switching sources in final mode, which should be easy to perform. Mode switching should be clearly indicated. Using Svelte's transition animations (transition:...) is recommended to provide a smooth user experience.

NFR-RELIABILITY: Reliability
The system should run stably for at least several hours (during the game).
Basic error handling should be considered (e.g., notifying on LiveKit disconnection, without requiring complex auto-reconnect). Using Svelte's try...catch blocks to handle errors and show friendly error messages to users is recommended.

NFR-DEPLOY: Deployment

The LiveKit server and Rust backend should be deployable to a VPS via Docker or Docker Compose.

The Svelte frontend should be deployable via a static file server (e.g., Nginx, Apache, Vercel, Netlify). Svelte's build output should be optimized, e.g., using a production-mode build (npm run build).

NFR-SECURITY-BASIC: Security — basic

LiveKit connections must use a backend-generated Token.

LiveKit's API Key / Secret Key must not leak into frontend code or the source repository. Using environment variables to manage sensitive information, injected at build time, is recommended.

3.3 Interface Requirements
User Interfaces (UI)

Mobile input page: Minimal — includes camera permission, selection of current role (Metadata settings, e.g., using a Svelte <select> element), and connection status display.

Admin Page: Multi-preview area (using <video> elements to display), live score display area, mode switch control (e.g., using Svelte <button> elements), and final-mode source switch control.

Output Page: No interactive elements — only displays the dynamically composited frame for OBS capture.

Software Interfaces (API)

LiveKit JS/Rust SDK: For communication between the Svelte frontend and the LiveKit server.

LiveKit Server API: The management interface provided by the LiveKit server.

WebSocket API: Provided by the Rust backend, used to push scores to the Svelte frontend.

LiveKit DataChannel API: For real-time command passing between the Admin Page and the Output Page.

Hardware Interfaces

Mobile camera and microphone.

3.4 Data Requirements
LiveKit Participant Metadata

Structure: JSON object

Example: { "phase": "semi" | "final", "game": string, "angle": string }

WebSocket Score Message

Structure: JSON object

Example (semi-final):

json
{
  "phase": "semi",
  "scores": {
    "game1": {
      "<classA>": null,
      "<classB>": null
    },
    "game2": {
      "<classC>": null,
      "<classD>": null
    }
  }
}
Example (final):

json
{
  "phase": "final",
  "scores": {
    "final": {
      "<classA>": null,
      "<classB>": null
    }
  }
}
LiveKit DataChannel Message (switch command)

Structure: JSON object

Example: { "action": "switch_source", "targetSid": string }

Data Format Sent by Apps Script

Semi-final stage:

json
{
  "phase": "semi",
  "scores": {
    "game1": {
      "<classA>": "string",
      "<classB>": "string"
    },
    "game2": {
      "<classC>": "string",
      "<classD>": "string"
    }
  }
}
Final stage:

json
{
  "phase": "final",
  "scores": {
    "final": {
      "<classA>": "string",
      "<classB>": "string"
    }
  }
}
