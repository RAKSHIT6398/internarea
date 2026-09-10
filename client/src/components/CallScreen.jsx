import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX,
  Minimize2, Maximize2, PhoneIncoming, Loader2, AlertCircle,
} from "lucide-react";

const fmtDur = (s) => {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    x = s % 60;
  return (h ? `${h}:` : "") + `${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`;
};

export default function CallScreen({
  call,
  peer: peerProp,
  localStream,
  remoteStream,
  error,
  avatar,
  onAccept,
  onEnd,
  onToggleMic,
  onToggleCam,
}) {
  const [sec, setSec] = useState(0);
  const [mini, setMini] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [spkOff, setSpkOff] = useState(false);

  const localV = useRef(null);
  const remoteV = useRef(null);
  const remoteA = useRef(null);

  const isVideo = call?.type === "video";
  const st = call?.status;

  const other = peerProp || call?.peer;
  const isIncomingRing = st === "ringing";

  useEffect(() => {
    if (localV.current && localStream) localV.current.srcObject = localStream;
  }, [localStream, mini, st]);

  useEffect(() => {
    if (remoteV.current && remoteStream) remoteV.current.srcObject = remoteStream;
    if (remoteA.current && remoteStream) remoteA.current.srcObject = remoteStream;
  }, [remoteStream, mini, st]);

  useEffect(() => {
    if (st !== "ongoing") {
      setSec(0);
      return;
    }
    const i = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [st]);

  useEffect(() => {
    if (st !== "ringing" && st !== "calling") return;
    let ctx, iv;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beep = () => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = st === "ringing" ? 880 : 440;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        o.start();
        o.stop(ctx.currentTime + 0.55);
      };
      beep();
      iv = setInterval(beep, 2200);
    } catch {}
    return () => {
      clearInterval(iv);
      ctx?.close?.();
    };
  }, [st]);

  useEffect(() => {
    if (remoteA.current) remoteA.current.muted = spkOff;
    if (remoteV.current) remoteV.current.muted = spkOff;
  }, [spkOff]);

  if (!call) return null;

  if (mini) {
    return createPortal(
      <div className="fixed bottom-5 right-5 z-[600] w-[220px] overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/95 shadow-2xl backdrop-blur">
        {isVideo && remoteStream ? (
          <video ref={remoteV} autoPlay playsInline className="h-[124px] w-full bg-black object-cover" />
        ) : (
          <div className="flex h-[80px] items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
            <img
              src={avatar(other)}
              alt={other?.name || ""}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
          </div>
        )}
        <audio ref={remoteA} autoPlay />
        <div className="flex items-center gap-2 p-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-bold text-white">{other?.name}</p>
            <p className="text-[10px] font-bold text-emerald-400">
              {st === "ongoing"
                ? fmtDur(sec)
                : isIncomingRing
                ? "Incoming…"
                : "Connecting…"}
            </p>
          </div>
          <button
            onClick={() => setMini(false)}
            className="rounded-lg bg-zinc-800 p-1.5 text-zinc-300 hover:bg-zinc-700"
          >
            <Maximize2 size={13} />
          </button>
          <button onClick={onEnd} className="rounded-lg bg-rose-500 p-1.5 text-white hover:bg-rose-600">
            <PhoneOff size={13} />
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const connected = st === "ongoing";
  const showVideo = isVideo && connected && remoteStream;

  return createPortal(
    <div className="fixed inset-0 z-[600] flex flex-col bg-[#05070d]">
      <audio ref={remoteA} autoPlay />

      {showVideo ? (
        <div className="relative flex-1 bg-black">
          <video ref={remoteV} autoPlay playsInline className="h-full w-full object-contain" />

          {localStream && (
            <div className="absolute bottom-28 right-5 h-[150px] w-[110px] overflow-hidden rounded-2xl border-2 border-white/15 bg-zinc-950 shadow-2xl sm:h-[180px] sm:w-[130px]">
              <video
                ref={localV}
                autoPlay
                playsInline
                muted
                className="h-full w-full scale-x-[-1] object-cover"
              />
              {camOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <VideoOff size={18} className="text-zinc-600" />
                </div>
              )}
              <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white/70">You</span>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-5 py-4">
            <div className="flex items-center gap-2.5">
              <img
                src={avatar(other)}
                alt={other?.name || ""}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <p className="text-[13px] font-black text-white">{other?.name}</p>
                <p className="text-[10.5px] font-bold tabular-nums text-emerald-400">{fmtDur(sec)}</p>
              </div>
            </div>
            <button
              onClick={() => setMini(true)}
              className="rounded-xl bg-black/40 p-2.5 text-white backdrop-blur hover:bg-black/60"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col items-center justify-center px-6">
          <div
            className={`pointer-events-none absolute h-[420px] w-[420px] rounded-full blur-[130px] ${
              isVideo ? "bg-sky-600/15" : "bg-emerald-600/15"
            }`}
          />

          {connected && (
            <button
              onClick={() => setMini(true)}
              className="absolute right-5 top-5 rounded-xl bg-zinc-900/70 p-2.5 text-zinc-400 backdrop-blur hover:text-white"
            >
              <Minimize2 size={16} />
            </button>
          )}

          <div className="relative mb-6">
            {(st === "calling" || st === "ringing") && (
              <>
                <span
                  className={`absolute inset-0 animate-ping rounded-full ${
                    isVideo ? "bg-sky-500/25" : "bg-emerald-500/25"
                  }`}
                />
                <span
                  className={`absolute -inset-4 animate-pulse rounded-full ${
                    isVideo ? "bg-sky-500/10" : "bg-emerald-500/10"
                  }`}
                />
                <span
                  className={`absolute -inset-8 animate-pulse rounded-full ${
                    isVideo ? "bg-sky-500/5" : "bg-emerald-500/5"
                  }`}
                  style={{ animationDelay: "300ms" }}
                />
              </>
            )}
            <img
              src={avatar(other)}
              alt={other?.name || ""}
              className={`relative h-32 w-32 rounded-full object-cover ring-4 sm:h-40 sm:w-40 ${
                isVideo ? "ring-sky-500/40" : "ring-emerald-500/40"
              }`}
            />
          </div>

          <h2 className="text-2xl font-black text-white sm:text-3xl">{other?.name || "Unknown"}</h2>

          <div className="mt-2.5 min-h-[24px]">
            {error ? (
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-rose-400">
                <AlertCircle size={14} /> {error}
              </p>
            ) : isIncomingRing ? (
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-400">
                <PhoneIncoming size={14} className="animate-pulse" />
                {other?.name || "Someone"} is calling…
              </p>
            ) : st === "calling" ? (
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-400">
                <Loader2 size={14} className="animate-spin" /> Calling {other?.name || "…"}
              </p>
            ) : st === "connecting" ? (
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-amber-400">
                <Loader2 size={14} className="animate-spin" /> Connecting…
              </p>
            ) : (
              <p className="text-[15px] font-black tabular-nums text-emerald-400">{fmtDur(sec)}</p>
            )}
          </div>

          <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            {isVideo ? "Video Call" : "Voice Call"} · internArea
          </p>

          {isVideo && localStream && (
            <video ref={localV} autoPlay playsInline muted className="hidden" />
          )}
        </div>
      )}

      <div className="shrink-0 border-t border-white/[0.06] bg-black/50 px-6 py-6 backdrop-blur-xl">
        {isIncomingRing ? (
          <div className="flex items-center justify-center gap-14">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onEnd}
                className="rounded-full bg-rose-500 p-5 text-white shadow-2xl shadow-rose-500/30 transition hover:scale-110 active:scale-95"
              >
                <PhoneOff size={24} />
              </button>
              <span className="text-[10.5px] font-bold text-zinc-500">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onAccept}
                className="animate-bounce rounded-full bg-emerald-500 p-5 text-white shadow-2xl shadow-emerald-500/30 transition hover:scale-110 active:scale-95"
              >
                {isVideo ? <Video size={24} /> : <Phone size={24} />}
              </button>
              <span className="text-[10.5px] font-bold text-zinc-500">Accept</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Ctrl
              active={micOff}
              onClick={() => setMicOff(onToggleMic())}
              on={<Mic size={19} />}
              off={<MicOff size={19} />}
              label={micOff ? "Unmute" : "Mute"}
            />

            {isVideo && (
              <Ctrl
                active={camOff}
                onClick={() => setCamOff(onToggleCam())}
                on={<Video size={19} />}
                off={<VideoOff size={19} />}
                label={camOff ? "Start" : "Stop"}
              />
            )}

            <Ctrl
              active={spkOff}
              onClick={() => setSpkOff((v) => !v)}
              on={<Volume2 size={19} />}
              off={<VolumeX size={19} />}
              label="Speaker"
            />

            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={onEnd}
                className="rounded-full bg-rose-500 px-7 py-4 text-white shadow-2xl shadow-rose-500/30 transition hover:scale-105 hover:bg-rose-600 active:scale-95"
              >
                <PhoneOff size={21} />
              </button>
              <span className="text-[9.5px] font-bold text-zinc-600">End</span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function Ctrl({ active, onClick, on, off, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        className={`rounded-full p-4 transition active:scale-90 ${
          active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {active ? off : on}
      </button>
      <span className="text-[9.5px] font-bold text-zinc-600">{label}</span>
    </div>
  );
}