"use client";
import { useEffect, useState } from "react";
import { V3Page } from "../v3-page";
import type { Content } from "../content";

type Message = { type: "netofficials-preview"; content: Content; path: string; paths: string[] };

/** Renders unsaved editor content sent from the parent admin window. */
export function LivePreview() {
  const [state, setState] = useState<Message | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.type !== "netofficials-preview") return;
      setState(event.data as Message);
    };
    addEventListener("message", receive);
    // Tell the editor we are ready for the first payload.
    parent.postMessage({ type: "netofficials-preview-ready" }, location.origin);
    return () => removeEventListener("message", receive);
  }, []);
  if (!state) return <p style={{ padding: 24, fontFamily: "sans-serif", color: "#5b6578" }}>Waiting for the editor…</p>;
  return (
    <V3Page
      content={state.content}
      path={state.path}
      paths={state.paths}
      preview
      linkMap={Object.fromEntries(state.paths.map((p) => [p, "#"]))}
    />
  );
}
