"use client";

import { useEffect, useState } from "react";

/**
 * ConceptVideo — renders a "Watch concept film" affordance ONLY when
 * `public/media/lp-grid-concept.mp4` is actually deployed.
 *
 * Until the file exists, this component renders nothing, so the page
 * never carries a broken or 404 video link.
 *
 * When the MP4 is added, the component shows a compact button that opens
 * a modal `<video>` player (silent, autoplay, loop, no controls clutter).
 *
 * To enable: drop the file at `public/media/lp-grid-concept.mp4` and redeploy.
 */
export default function ConceptVideo() {
  const [exists, setExists] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Cheap HEAD request — no body downloaded. If the file isn't there,
    // we get a 404 and render nothing.
    fetch("/media/lp-grid-concept.mp4", { method: "HEAD" })
      .then((r) => setExists(r.ok))
      .catch(() => setExists(false));
  }, []);

  if (!exists) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[12px] font-medium text-slate-200 transition-colors hover:bg-white/[0.05]"
      >
        Watch concept film →
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="LP Grid concept film"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
        >
          <video
            src="/media/lp-grid-concept.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="max-h-[88vh] max-w-[92vw] rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] text-slate-200"
            aria-label="Close video"
          >
            Close ✕
          </button>
        </div>
      )}
    </>
  );
}
