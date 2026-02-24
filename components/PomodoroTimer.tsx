"use client";

import { useEffect, useRef, useState } from "react";

const WORK_TIME = 20 * 60; // 20 minutes
const SOUND_TIME = 30;    // 30 seconds
const CYCLE_TIME = WORK_TIME + SOUND_TIME;

export default function PomodoroTimer() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(WORK_TIME);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved session
  useEffect(() => {
    const isRunning = localStorage.getItem("pomodoro-running") === "true";
    const startTime = localStorage.getItem("pomodoro-start-time");

    if (isRunning && startTime) {
      setRunning(true);
      calculateRemaining(Number(startTime));
    }
  }, []);

  // Tick every second
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const start = Number(
        localStorage.getItem("pomodoro-start-time")
      );
      calculateRemaining(start);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  function calculateRemaining(startTime: number) {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const position = elapsed % CYCLE_TIME;

    if (position < WORK_TIME) {
      setRemaining(WORK_TIME - position);
    } else {
      setRemaining(SOUND_TIME - (position - WORK_TIME));
      audioRef.current?.play();
    }
  }

  function startSession() {
    localStorage.setItem("pomodoro-running", "true");
    localStorage.setItem(
      "pomodoro-start-time",
      Date.now().toString()
    );
    setRunning(true);
  }

  function endSession() {
    if (!confirm("End current session?")) return;

    localStorage.removeItem("pomodoro-running");
    localStorage.removeItem("pomodoro-start-time");
    setRunning(false);
    setRemaining(WORK_TIME);
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="bg-white w-[360px] p-10 rounded-2xl shadow-xl text-center">
      <h1 className="text-3xl font-bold mb-4">Pomodoro Focus</h1>

      <div className="text-6xl font-mono mb-8">
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>

      {!running ? (
        <button
          onClick={startSession}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
        >
          Start Session
        </button>
      ) : (
        <button
          onClick={endSession}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg w-full"
        >
          End Session
        </button>
      )}

      <audio ref={audioRef} src="/bell.mp3" preload="auto" />
    </div>
  );
}