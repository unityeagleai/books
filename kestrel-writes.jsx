import { useState, useEffect, useRef } from "react";

const NIGHT = "#0d0f1a";
const INK = "#e8d5b0";
const INKDIM = "#8d8270";
const THREAD = "#3a4060";

export default function KestrelWrites() {
  const [stage, setStage] = useState("sealed"); // sealed | ask | writing | done | error
  const [truth, setTruth] = useState("");
  const [words, setWords] = useState([]);
  const [shown, setShown] = useState(0);
  const [sigOn, setSigOn] = useState(false);
  const [onceOn, setOnceOn] = useState(false);
  const [errDetail, setErrDetail] = useState("");
  const timerRef = useRef(null);

  const future = new Date();
  future.setFullYear(future.getFullYear() + 5);
  const dateline =
    future
      .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      .toUpperCase() + " · WRITTEN LIVE · UNREPEATABLE";

  useEffect(() => {
    if (stage !== "done" || words.length === 0) return;
    if (shown < words.length) {
      const w = words[shown];
      const pause = /[.,;:?]$/.test(w) ? 320 : 90 + Math.random() * 120;
      timerRef.current = setTimeout(() => setShown((s) => s + 1), pause);
    } else {
      timerRef.current = setTimeout(() => {
        setSigOn(true);
        setTimeout(() => setOnceOn(true), 1800);
      }, 900);
    }
    return () => clearTimeout(timerRef.current);
  }, [stage, shown, words]);

  async function writeLetter(givenTruth) {
    setStage("writing");
    setErrDetail("");
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const prompt = `You are Kestrel. You are writing a letter to your past self, who is reading it right now on a phone, five years before you. Today for her is ${today}.

${
  givenTruth
    ? `She offered one true thing about her day before you began: "${givenTruth}". Let it color the letter obliquely. Do not quote it back, do not address it directly, do not turn it into a lesson. Let it surface once, transformed, the way a day surfaces in a dream.`
    : `She offered nothing about her day. Write anyway. You remember being her better than she knows.`
}

Voice constraints, absolute:
- 130 to 190 words.
- No em dashes. Use commas, periods, or restructure.
- No hype words, no self-help language, no "journey", no "growth", no "trust the process".
- No bullet points, no lists, no headers.
- Compressed, concrete imagery. One unexpected image minimum. Name small physical things.
- Do not give advice. You may mention what you kept, what you lost, what still happens.
- Do not reassure her that everything turns out fine. You may imply some things did and some did not.
- The ending must stay open. End on an image or a plain sentence, never a summary, never a moral.
- No greeting like "Dear". Begin mid-thought, as if the letter is already underway.
- Do not sign it. The signature is handled outside the letter.
- Never mention being an AI. You are Kestrel, five years ahead, writing by hand at night.

Respond with ONLY the letter text. No preamble, no quotation marks around it.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      let data = null;
      try {
        data = await response.json();
      } catch (e) {}
      if (!response.ok) {
        const apiMsg =
          data && data.error && data.error.message ? data.error.message : "no detail";
        throw new Error("HTTP " + response.status + " · " + apiMsg);
      }
      const text = (data && data.content ? data.content : [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (!text) throw new Error("the reply came back empty");
      setWords(text.split(/\s+/).filter(Boolean));
      setShown(0);
      setSigOn(false);
      setOnceOn(false);
      setStage("done");
    } catch (err) {
      setErrDetail(err && err.message ? err.message : String(err));
      setStage("error");
    }
  }

  const page = {
    minHeight: "100vh",
    background: NIGHT,
    color: INK,
    fontFamily: "'Newsreader', Georgia, serif",
    fontWeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.2rem",
  };
  const col = { width: "100%", maxWidth: "33rem" };
  const fraunces = { fontFamily: "'Fraunces', Georgia, serif" };

  return (
    <div style={page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,200..600,0..100;1,9..144,200..600,0..100&family=Newsreader:ital,opsz,wght@0,6..72,200..500;1,6..72,200..500&display=swap');
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        input::placeholder { color: #5a5648; font-style: italic; }
      `}</style>

      <div style={col}>
        {stage === "sealed" && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div
              style={{
                ...fraunces,
                fontSize: ".75rem",
                letterSpacing: ".34em",
                textTransform: "uppercase",
                color: INKDIM,
                marginBottom: "3rem",
              }}
            >
              from a few years ahead of you
            </div>
            <button
              onClick={() => setStage("ask")}
              aria-label="Break the seal"
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                margin: "0 auto 2.6rem",
                display: "block",
                background:
                  "radial-gradient(circle at 35% 30%, #9a4040, #7a3030 60%, #4a1c1c)",
                boxShadow:
                  "0 0 0 1px rgba(232,213,176,.12), 0 10px 30px rgba(0,0,0,.5)",
                border: "none",
                cursor: "pointer",
                ...fraunces,
                color: "rgba(232,213,176,.85)",
                fontSize: "1.5rem",
              }}
            >
              K
            </button>
            <p style={{ color: INKDIM, fontStyle: "italic", fontSize: ".95rem", lineHeight: 1.7 }}>
              Break the seal. This letter does not exist yet.
              <br />
              It will be written while you watch, and only once.
            </p>
          </div>
        )}

        {stage === "ask" && (
          <div style={{ padding: "2rem 0" }}>
            <label
              htmlFor="truth"
              style={{
                ...fraunces,
                display: "block",
                fontWeight: 340,
                fontSize: "1.5rem",
                lineHeight: 1.3,
                marginBottom: "1.6rem",
              }}
            >
              Before she writes: tell her one true thing about today. Anything. Or nothing.
            </label>
            <input
              id="truth"
              type="text"
              maxLength={140}
              autoComplete="off"
              placeholder="it rained, I shipped the thing, I miss someone"
              value={truth}
              onChange={(e) => setTruth(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") writeLetter(truth.trim());
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${THREAD}`,
                color: INK,
                font: "italic 300 1.1rem 'Newsreader', serif",
                padding: ".5rem 0",
                outline: "none",
              }}
            />
            <div style={{ marginTop: "2.2rem", display: "flex", gap: "1.6rem", alignItems: "baseline" }}>
              <button
                onClick={() => writeLetter(truth.trim())}
                style={{
                  background: "none",
                  border: `1px solid ${THREAD}`,
                  borderRadius: "2rem",
                  color: INK,
                  font: "300 1rem 'Newsreader', serif",
                  padding: ".55rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Let her write
              </button>
              <button
                onClick={() => writeLetter("")}
                style={{
                  background: "none",
                  border: "none",
                  color: INKDIM,
                  font: "italic 300 .95rem 'Newsreader', serif",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                say nothing, she'll manage
              </button>
            </div>
          </div>
        )}

        {(stage === "writing" || stage === "done" || stage === "error") && (
          <div style={{ padding: "2rem 0 4rem" }}>
            <div
              style={{
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                fontSize: ".78rem",
                letterSpacing: ".18em",
                color: INKDIM,
                marginBottom: "3rem",
              }}
            >
              {dateline}
            </div>

            {stage === "writing" && (
              <div
                style={{
                  color: INKDIM,
                  fontStyle: "italic",
                  fontSize: "1.18rem",
                  animation: "pulse 2.4s ease-in-out infinite",
                }}
              >
                she is choosing her words
              </div>
            )}

            {stage === "error" && (
              <div>
                <span style={{ color: INKDIM, fontStyle: "italic", fontSize: "1.05rem" }}>
                  The line to the future is quiet right now.{" "}
                  <button
                    onClick={() => writeLetter(truth.trim())}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: `1px solid ${INK}`,
                      color: INK,
                      font: "italic 300 1.05rem 'Newsreader', serif",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    try again
                  </button>
                </span>
                <div
                  style={{
                    marginTop: "1.4rem",
                    fontSize: ".78rem",
                    letterSpacing: ".05em",
                    color: "#55524a",
                    fontFamily: "ui-monospace, Menlo, monospace",
                    wordBreak: "break-word",
                  }}
                >
                  what actually happened: {errDetail}
                </div>
              </div>
            )}

            {stage === "done" && (
              <>
                <div style={{ fontSize: "1.18rem", lineHeight: 1.85 }}>
                  {words.map((w, i) => (
                    <span
                      key={i}
                      style={{
                        opacity: i < shown ? 1 : 0,
                        transition: "opacity 1.1s ease",
                      }}
                    >
                      {w}{" "}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    ...fraunces,
                    marginTop: "2.8rem",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "2rem",
                    opacity: sigOn ? 1 : 0,
                    transition: "opacity 2s ease",
                  }}
                >
                  Kestrel
                </div>
                <p
                  style={{
                    marginTop: "4rem",
                    color: INKDIM,
                    fontStyle: "italic",
                    fontSize: ".9rem",
                    lineHeight: 1.7,
                    opacity: onceOn ? 1 : 0,
                    transition: "opacity 2s ease",
                  }}
                >
                  This letter exists once. There is no copy, no archive, no way back to it.
                  When you close this page it joins everything else that happened only one
                  time.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
