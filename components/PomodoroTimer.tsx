"use client";

import { useEffect, useRef, useState } from "react";

const WORK_TIME = 20 * 60; // 20 minutes
const BREAK_TIME = 30;     // 30 seconds

type Phase = "work" | "break";

export default function PomodoroTimer() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(WORK_TIME);
  const [phase, setPhase] = useState<Phase>("work");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved session
  useEffect(() => {
    const isRunning = localStorage.getItem("pomodoro-running") === "true";
    const startTime = localStorage.getItem("pomodoro-start-time");
    const savedPhase = localStorage.getItem("pomodoro-phase") as Phase;

    if (isRunning && startTime && savedPhase) {
      setRunning(true);
      setPhase(savedPhase);
      calculateRemaining(Number(startTime), savedPhase);
    }
  }, []);

  // Timer loop
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const startTime = Number(
        localStorage.getItem("pomodoro-start-time")
      );
      const savedPhase = localStorage.getItem("pomodoro-phase") as Phase;

      calculateRemaining(startTime, savedPhase);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  function calculateRemaining(startTime: number, currentPhase: Phase) {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);

    if (currentPhase === "work") {
      const timeLeft = WORK_TIME - elapsed;

      if (timeLeft <= 0) {
        // Switch to break
        switchToBreak();
      } else {
        setRemaining(timeLeft);
      }
    }

    if (currentPhase === "break") {
      const timeLeft = BREAK_TIME - elapsed;

      if (timeLeft <= 0) {
        // Switch back to work
        switchToWork();
      } else {
        setRemaining(timeLeft);
      }
    }
  }

  function switchToBreak() {
    setPhase("break");
    localStorage.setItem("pomodoro-phase", "break");
    localStorage.setItem("pomodoro-start-time", Date.now().toString());
    setRemaining(BREAK_TIME);

    // Play sound once
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  function switchToWork() {
    setPhase("work");
    localStorage.setItem("pomodoro-phase", "work");
    localStorage.setItem("pomodoro-start-time", Date.now().toString());
    setRemaining(WORK_TIME);

    // Stop sound if still playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  function startSession() {
    localStorage.setItem("pomodoro-running", "true");
    localStorage.setItem("pomodoro-phase", "work");
    localStorage.setItem(
      "pomodoro-start-time",
      Date.now().toString()
    );

    setPhase("work");
    setRemaining(WORK_TIME);
    setRunning(true);
  }

  function endSession() {
    if (!confirm("End current session?")) return;

    localStorage.removeItem("pomodoro-running");
    localStorage.removeItem("pomodoro-start-time");
    localStorage.removeItem("pomodoro-phase");

    setRunning(false);
    setPhase("work");
    setRemaining(WORK_TIME);

    // 🔴 Stop audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="bg-neutral-800 w-[380px] p-10 rounded-2xl shadow-xl text-center">
      <h1 className="text-3xl font-bold mb-2">
        {phase === "work" ? "Focus Time" : "Break Time"}
      </h1>

      <div className="text-6xl font-mono mb-8">
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>

      {!running ? (
        <button
          onClick={startSession}
          className="bg-green-800 hover:bg-green-900 hover:cursor-pointer text-white px-6 py-3 rounded-lg w-full"
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

      <audio ref={audioRef} src="/one_piece.mp3" preload="auto" />
    </div>
  );
}