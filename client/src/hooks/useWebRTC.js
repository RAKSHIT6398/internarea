import { useCallback, useEffect, useRef, useState } from "react";

const ICE = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

const resolveMe = (myId) => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u?._id || u?.name) {
      return {
        _id: String(u._id || myId),
        name: u.name || "Someone",
        profileImage: u.profileImage || "",
      };
    }
  } catch {}
  return { _id: myId, name: "Someone", profileImage: "" };
};

/**
 * status: idle | calling | ringing | connecting | ongoing | ended
 * call.peer = hamesha DOOSRA user (remote)
 */
export default function useWebRTC(socket, myId) {
  const [call, setCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState("");

  const pcRef = useRef(null);
  const localRef = useRef(null);
  const pendingIce = useRef([]);
  const callRef = useRef(null);
  const ringTO = useRef(null);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  const cleanup = useCallback(() => {
    clearTimeout(ringTO.current);
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    pendingIce.current = [];
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const createPC = useCallback(
    (peerId) => {
      const pc = new RTCPeerConnection(ICE);

      pc.onicecandidate = (e) => {
        if (e.candidate)
          socket.emit("call:ice", { to: peerId, from: myId, candidate: e.candidate });
      };

      pc.ontrack = (e) => setRemoteStream(e.streams[0]);

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        if (s === "connected") setCall((c) => (c ? { ...c, status: "ongoing" } : c));
        if (s === "failed" || s === "disconnected") {
          setError("Connection lost");
          setTimeout(() => {
            cleanup();
            setCall(null);
          }, 1500);
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [socket, myId, cleanup]
  );

  const getMedia = useCallback(async (type) => {
    const constraints =
      type === "video"
        ? {
            audio: true,
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          }
        : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  /* ══ START CALL — peer = jisko call kiya (Anu) ══ */
  const startCall = useCallback(
    async (peer, type) => {
      try {
        setError("");
        const me = resolveMe(myId);

        setCall({
          type,
          status: "calling",
          incoming: false,
          peer, // remote = Anu
        });

        const stream = await getMedia(type);
        const pc = createPC(peer._id);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:offer", {
          to: peer._id,
          from: myId,
          type,
          sdp: offer,
          caller: me, // Deep ka naam/photo — receiver ke liye
        });

        ringTO.current = setTimeout(() => {
          if (callRef.current?.status === "calling") {
            setError("No answer");
            socket.emit("call:end", { to: peer._id, from: myId });
            cleanup();
            setTimeout(() => setCall(null), 1200);
          }
        }, 45000);
      } catch (e) {
        console.error(e);
        setError(
          e.name === "NotAllowedError"
            ? "Camera/Mic permission denied"
            : e.name === "NotFoundError"
            ? "No camera/microphone found"
            : "Could not start call"
        );
        cleanup();
        setTimeout(() => {
          setCall(null);
          setError("");
        }, 2500);
      }
    },
    [socket, myId, getMedia, createPC, cleanup]
  );

  const acceptCall = useCallback(async () => {
    const c = callRef.current;
    if (!c?.offer) return;
    try {
      setError("");
    setCall((p) => ({ ...p, status: "connecting", incoming: false }));

      const stream = await getMedia(c.type);
      const pc = createPC(c.peer._id);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(c.offer));
      for (const ic of pendingIce.current)
        await pc.addIceCandidate(new RTCIceCandidate(ic));
      pendingIce.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { to: c.peer._id, from: myId, sdp: answer });
      clearTimeout(ringTO.current);
    } catch (e) {
      console.error(e);
      setError(e.name === "NotAllowedError" ? "Permission denied" : "Failed to connect");
      socket.emit("call:decline", { to: c.peer._id, from: myId });
      cleanup();
      setTimeout(() => {
        setCall(null);
        setError("");
      }, 2200);
    }
  }, [socket, myId, getMedia, createPC, cleanup]);

  const endCall = useCallback(() => {
    const c = callRef.current;
    if (c?.peer?._id) {
      const ev = c.status === "ringing" && c.incoming ? "call:decline" : "call:end";
      socket.emit(ev, { to: c.peer._id, from: myId });
    }
    cleanup();
    setCall(null);
    setError("");
  }, [socket, myId, cleanup]);

  const toggleMic = useCallback(() => {
    const t = localRef.current?.getAudioTracks()?.[0];
    if (!t) return false;
    t.enabled = !t.enabled;
    return !t.enabled;
  }, []);

  const toggleCam = useCallback(() => {
    const t = localRef.current?.getVideoTracks()?.[0];
    if (!t) return false;
    t.enabled = !t.enabled;
    return !t.enabled;
  }, []);

  useEffect(() => {
    if (!socket || !myId) return;

    const onOffer = ({ from, caller, type, sdp }) => {
      if (callRef.current) {
        socket.emit("call:busy", { to: from, from: myId });
        return;
      }
      pendingIce.current = [];
      setCall({
        type,
        status: "ringing",
        incoming: true,
        peer: caller?._id
          ? caller
          : { _id: from, name: caller?.name || "Unknown", profileImage: caller?.profileImage || "" },
        offer: sdp,
      });
      ringTO.current = setTimeout(() => {
        if (callRef.current?.status === "ringing") {
          socket.emit("call:decline", { to: from, from: myId });
          cleanup();
          setCall(null);
        }
      }, 45000);
    };

    const onAnswer = async ({ sdp }) => {
      clearTimeout(ringTO.current);
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        for (const ic of pendingIce.current)
          await pc.addIceCandidate(new RTCIceCandidate(ic));
        pendingIce.current = [];
       setCall((c) => (c ? { ...c, status: "ongoing", incoming: false } : c));
      } catch (e) {
        console.error(e);
      }
    };

    const onIce = async ({ candidate }) => {
      const pc = pcRef.current;
      if (!candidate) return;
      if (pc?.remoteDescription?.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      } else pendingIce.current.push(candidate);
    };

    const onDeclined = () => {
      setError("Call declined");
      cleanup();
      setTimeout(() => {
        setCall(null);
        setError("");
      }, 1600);
    };
    const onEnded = () => {
      cleanup();
      setCall(null);
      setError("");
    };
    const onBusy = () => {
      setError("User is on another call");
      cleanup();
      setTimeout(() => {
        setCall(null);
        setError("");
      }, 2000);
    };

    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice", onIce);
    socket.on("call:declined", onDeclined);
    socket.on("call:ended", onEnded);
    socket.on("call:busy", onBusy);

    return () => {
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice", onIce);
      socket.off("call:declined", onDeclined);
      socket.off("call:ended", onEnded);
      socket.off("call:busy", onBusy);
    };
  }, [socket, myId, cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    call,
    localStream,
    remoteStream,
    error,
    startCall,
    acceptCall,
    endCall,
    toggleMic,
    toggleCam,
  };
}