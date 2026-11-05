"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { trackLandingEvent } from "@/lib/landing-tracking";
import styles from "../DashboardWalkthrough.module.css";

export default function DashboardClassroomVideo() {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const play = () => {
    setPlaying(true);
    trackLandingEvent("video_play", { video: "digital_classroom" });
    requestAnimationFrame(() => void video.current?.play());
  };

  return (
    <>
      <div className={styles.classroomVideo}>
        <div>
          <span className={styles.videoEyebrow}>BJOT DIGITAL CLASSROOM</span>
          <h3>See how the dashboard fits together.</h3>
          <p>
            Watch the motion graphic when you’re ready. The video is loaded only
            after you press play.
          </p>
        </div>
        <div className={styles.videoFrame}>
          {playing ? (
            <video
              ref={video}
              controls
              playsInline
              preload="none"
              poster="/dashboard-previews/digital-classroom-poster.png"
              aria-label="BJOT Digital Classroom motion graphic"
            >
              <source
                src="/dashboard-previews/digital-classroom.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <button
              type="button"
              className={styles.videoPoster}
              onClick={play}
              aria-label="Play BJOT Digital Classroom motion graphic"
            >
              <Image
                src="/dashboard-previews/digital-classroom-poster.png"
                alt="Preview of the BJOT Digital Classroom motion graphic"
                fill
                sizes="(max-width: 800px) 90vw, 50vw"
                loading="lazy"
              />
              <span>
                <Play size={22} fill="currentColor" aria-hidden="true" />
                Play classroom video
              </span>
            </button>
          )}
        </div>
      </div>
      <p className={styles.accessNote}>
        Access to premium dashboard tools depends on your account and plan. CBT
        practice is listed as a Pro benefit; check the current plan details
        before enrolling.
      </p>
    </>
  );
}
