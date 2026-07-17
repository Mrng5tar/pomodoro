"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Switch } from "./ui/switch";
import { Field, FieldContent, FieldDescription, FieldLabel } from "./ui/field";

const WORK_TIME = 20 * 60; // 20 minutes
const BREAK_TIME = 30;     // 30 seconds

const audios = ["/1.ogg", "/2.ogg", "/3.ogg"]

type Phase = "work" | "break";

export default function PomodoroTimer() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(WORK_TIME);
  const [phase, setPhase] = useState<Phase>("work");
  const [showImage, setShowImage] = useState(true)
  const cardRef = useRef(null)

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const walkAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!sessionStorage.getItem("session-start-time")) {
  sessionStorage.setItem(
    "session-start-time",
    Date.now().toString()
  );
}

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

  //walk time
  useEffect(() => {

    if (!running) return;

    const interval = setInterval(() => {
      const startTime = Number(
        sessionStorage.getItem("session-start-time")
      );
    if(Date.now() - startTime >= 1000 * 60 *60){
      sessionStorage.setItem("session-start-time", Date.now().toString())

      if (walkAudioRef.current) {
      walkAudioRef.current.src = getRandomAudio()
      walkAudioRef.current.currentTime = 0;
      walkAudioRef.current.play();
    }
    }

      
    }, 1000 * 60);

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

  function getRandomAudio(){
    

    const random = audios[Math.floor(Math.random() * audios.length)]

    return random
  }

  function handleToggle(e:React.MouseEvent){
    if (e.target === cardRef.current) {
      setShowImage(prev => !prev)
    }
  }


  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;


  return (
    <div className="w-[380px] p-10 rounded-2xl shadow-xl text-center bg-black/50" ref={cardRef} onClick={(e)=>{
      handleToggle(e)
    }}>
      

      <div className={`${showImage ? "bg-white" : "bg-neutral-800"} w-screen h-screen absolute top-0 left-0 -z-40`}>
        {!running && showImage && (<Image src={"/home.png"} width={1920} height={1080} className="object-cover w-full h-full" alt="home image"/>)}

        {running && showImage && phase === "work" && (<Image src={"/work.png"} width={1920} height={1080} className="object-cover w-full h-full" alt="work image"/>)}

        {running && phase === "break" && (<Image src={"/break.png"} width={1920} height={1080} className="object-cover w-full h-full" alt="work image"/>)}
      </div>

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
          className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg w-full hover:cursor-pointer"
        >
          End Session
        </button>
      )}

      {phase === "work" && running && <button onClick={switchToBreak}
          className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg w-full hover:cursor-pointer mt-4">Take a break</button>}

          
      
  

      <audio ref={audioRef} src="/one_piece.mp3" preload="auto" />

      <audio ref={walkAudioRef} src="/1.ogg" preload="auto" />
    </div>
  );
}