"""Encode pre-rendered frames to MP4 and WebM."""
import os
import shutil
import subprocess

FRAME_DIR = "/home/z/my-project/scripts/frames"
OUT_MP4 = "/home/z/my-project/download/lp-grid-concept.mp4"
OUT_WEBM = "/home/z/my-project/download/lp-grid-concept.webm"
FPS = 30

def main():
    n = len([f for f in os.listdir(FRAME_DIR) if f.endswith(".png")])
    print(f"Found {n} frames. Encoding...")
    if os.path.exists(OUT_MP4):
        os.remove(OUT_MP4)
    cmd = [
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", f"{FRAME_DIR}/frame_%04d.png",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "fast",
        "-movflags", "+faststart",
        OUT_MP4,
    ]
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)
    print(f"MP4 written: {OUT_MP4} ({os.path.getsize(OUT_MP4) / 1024 / 1024:.1f} MB)")

    if os.path.exists(OUT_WEBM):
        os.remove(OUT_WEBM)
    cmd2 = [
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", f"{FRAME_DIR}/frame_%04d.png",
        "-c:v", "libvpx-vp9", "-b:v", "1.5M", "-pix_fmt", "yuv420p",
        "-deadline", "realtime", "-speed", "8",
        OUT_WEBM,
    ]
    print(" ".join(cmd2))
    subprocess.run(cmd2, check=True)
    print(f"WebM written: {OUT_WEBM} ({os.path.getsize(OUT_WEBM) / 1024 / 1024:.1f} MB)")

    # Verify
    probe = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
             "default=noprint_wrappers=1:nokey=1", OUT_MP4]
    dur = subprocess.check_output(probe).decode().strip()
    print(f"MP4 duration: {dur}s")

if __name__ == "__main__":
    main()
