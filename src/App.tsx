import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const firstRef = useRef<HTMLInputElement | null>(null);
  const secondRef = useRef<HTMLInputElement | null>(null);

  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ledMessage, setLedMessage] = useState(""); // For custom LED message input
  const [ledSending, setLedSending] = useState(false);

  const sendMessage = async (msg: string) => {
    const res = await fetch("http://localhost:3001/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    console.log("Response from server:", data);
  };

  // Autofocus the first input when component mounts
  useEffect(() => {
    firstRef.current?.focus();
    // also select content if barcode scanner re-uses focus
    firstRef.current?.select();
  }, []);

  const onFirstKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // move focus to second input automatically
      secondRef.current?.focus();
      secondRef.current?.select();
    }
  };

  // When second input is completed, automatically send to server
  const onSecondKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Second input completed, submitting scan...");
      await submitScan();
    }
  };

  async function submitScan() {
    // Basic validation
    if (!firstValue.trim() || !secondValue.trim()) {
      setMessage("Oba unosa moraju biti popunjena.");
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // POST to example server - replace URL with your real endpoint
      // const res = await fetch("https://example.com/api/scan", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     code1: firstValue.trim(),
      //     code2: secondValue.trim(),
      //   }),
      // });

      // // try to parse JSON, but fallback to text
      // let text: string;
      // try {
      //   const json = await res.json();
      //   text = json.message || JSON.stringify(json);
      // } catch {
      //   text = await res.text();
      // }
      await sendMessage(
        `OCITAN KOTUR: ${firstValue.trim()}, KORISNIK: ${secondValue.trim()}!`
      );

      // show full-screen message
      setMessage(
        `USPESNO POSLAT VEZAN KOTUR: ${firstValue.trim()} KORISNIK: ${secondValue.trim()}!`
      );
    } catch (err: any) {
      await sendMessage("GRESKA!");
      setMessage("Greška pri slanju: " + (err?.message || String(err)));
    } finally {
      setLoading(false);

      // prepare for next input: focus first and clear values (user asked inputs visible for now)
      setFirstValue("");
      setSecondValue("");
      firstRef.current?.focus();
      firstRef.current?.select();

      // hide the message after a while
      setTimeout(() => setMessage(null), 4000);
    }
  }

  // Function to send custom message to LED panel
  async function sendToLed() {
    if (!ledMessage.trim()) {
      setMessage("Unesite poruku za LED panel.");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    setLedSending(true);
    await sendMessage(ledMessage.toUpperCase()); // Use the sendMessage function for serial
    setLedSending(false);
    setLedMessage("");
    firstRef.current?.focus();
    firstRef.current?.select(); // Clear input after sending
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg.png')] bg-cover bg-bottom">
      <div className="z-10 w-full max-w-2xl">
        <div className="absolute top-0 left-0 rounded-2xl backdrop-blur-sm bg-white/5 ring-1 ring-white/10 p-8 shadow-2xl">
          <h1 className="text-5xl font-semibold text-white mb-4 text-center">
            VEZIVAČI APLIKACIJA
          </h1>
        </div>
        <div className="rounded-2xl backdrop-blur-sm bg-white/5 ring-1 ring-white/10 p-8 shadow-2xl">
          
          <h1 className="text-4xl text-center font-semibold text-white mb-4">
            Unos skeniranjem barkoda kartice vezivača i kotura
          </h1>
          <div className="opacity-0 absolute pointer-events-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-xs text-slate-300 mb-1">Prvi kod</span>
                <input
                  ref={firstRef}
                  value={firstValue}
                  onChange={(e) => setFirstValue(e.target.value)}
                  onKeyDown={onFirstKeyDown}
                  className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Skenirajte prvi barkod..."
                  autoFocus
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-slate-300 mb-1">Drugi kod</span>
                <input
                  ref={secondRef}
                  value={secondValue}
                  onChange={(e) => setSecondValue(e.target.value)}
                  onKeyDown={onSecondKeyDown}
                  className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Skenirajte drugi barkod..."
                />
              </label>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={submitScan}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium disabled:opacity-60"
              >
                Pošalji ručno
              </button>

              <div className="text-sm text-slate-300">
                Status: {loading ? "Šaljem..." : "Spreman"}
              </div>
            </div>
          </div>

          {/* Section for sending message to LED panel */}
          <div className="mt-20">
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Slanje poruke na LED panel
            </h2>
            <div className="flex gap-4">
              <input
                value={ledMessage}
                onChange={(e) => setLedMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Unesite poruku za LED..."
              />
              <button
                onClick={sendToLed}
                disabled={ledSending}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium  disabled:opacity-60"
              >
                {ledSending ? "Šaljem..." : "Pošalji na LED"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen message overlay shown after server response */}
      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-3xl mx-6 p-8 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-center shadow-2xl">
            <div className="text-5xl font-semibold mb-2">{message}</div>
            <div className="text-sm opacity-90 mt-2">
              Poruka se automatski zatvara
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
