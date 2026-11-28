import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { usePrefs } from "@/i18n/preferences";
import {
  voiceSampleCommands,
  type VoiceCopilotLanguage,
  type VoiceCopilotResult,
} from "@/lib/voice-copilot";

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface RecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const getRecognitionConstructor = () => {
  if (typeof window === "undefined") return undefined;
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
};

const speechLanguage: Record<VoiceCopilotLanguage, "en-IN" | "hi-IN"> = {
  "en-IN": "en-IN",
  "hi-IN": "hi-IN",
  pahadi: "hi-IN",
};

const languageNames: Record<
  VoiceCopilotLanguage,
  "voice.langEnglish" | "voice.langHindi" | "voice.langPahadi"
> = {
  "en-IN": "voice.langEnglish",
  "hi-IN": "voice.langHindi",
  pahadi: "voice.langPahadi",
};

export function VoiceCopilotDrawer({
  onClose,
  onCommand,
  onResult,
}: {
  onClose: () => void;
  onCommand: (
    command: string,
    lang: VoiceCopilotLanguage,
  ) => VoiceCopilotResult;
  onResult: (result: VoiceCopilotResult) => void;
}) {
  const { t } = usePrefs();
  const [language, setLanguage] = useState<VoiceCopilotLanguage>("en-IN");
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<VoiceCopilotResult>();
  const [listening, setListening] = useState(false);
  const [microphoneSupported, setMicrophoneSupported] = useState(false);
  const [microphoneMessage, setMicrophoneMessage] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setMicrophoneSupported(Boolean(getRecognitionConstructor()));
    setSpeechSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window,
    );
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (response: VoiceCopilotResult) => {
    if (muted || !speechSupported) {
      if (!speechSupported) setStatus(t("voice.speechUnavailable"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(response.spokenResponse);
    utterance.lang = response.speechSynthesisLang;
    window.speechSynthesis.speak(utterance);
  };

  const submitCommand = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const processed = onCommand(trimmed, language);
    setCommand(trimmed);
    setResult(processed);
    setStatus("");
    onResult(processed);
    speak(processed);
  };

  const startListening = () => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setMicrophoneSupported(false);
      setMicrophoneMessage(t("voice.micUnsupported"));
      return;
    }
    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.lang = speechLanguage[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setListening(true);
      setMicrophoneMessage("");
      setStatus(t("voice.listening"));
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) submitCommand(transcript);
    };
    recognition.onerror = (event) => {
      setListening(false);
      setStatus("");
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setMicrophoneMessage(t("voice.micDenied"));
      } else {
        setMicrophoneMessage(t("voice.micTryText"));
      }
    };
    recognition.onend = () => {
      setListening(false);
      setStatus("");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setListening(false);
      setMicrophoneMessage(t("voice.micTryText"));
    }
  };

  const replay = () => {
    if (!result) return;
    speak(result);
  };

  return (
    <aside
      className="rp-map-detail rp-map-voice-drawer glass-strong"
      aria-label={t("voice.title")}
    >
      <header className="rp-map-detail-heading">
        <span className="rp-map-detail-heading-label">
          <Mic aria-hidden className="size-4" />
          {t("voice.title")}
        </span>
        <button
          type="button"
          className="rp-map-detail-close"
          onClick={() => {
            recognitionRef.current?.stop();
            onClose();
          }}
          aria-label={t("voice.close")}
        >
          <X aria-hidden />
        </button>
      </header>

      <fieldset className="rp-voice-languages">
        <legend>{t("voice.chooseLanguage")}</legend>
        <div>
          {(["en-IN", "hi-IN", "pahadi"] as const).map((nextLanguage) => (
            <button
              key={nextLanguage}
              type="button"
              aria-pressed={language === nextLanguage}
              onClick={() => {
                setLanguage(nextLanguage);
                if (listening) recognitionRef.current?.stop();
                setListening(false);
              }}
            >
              {t(languageNames[nextLanguage])}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="rp-voice-privacy">{t("voice.recognitionPrivacy")}</p>

      <button
        type="button"
        className={`rp-voice-listen${listening ? " is-listening" : ""}`}
        onClick={() => {
          if (listening) recognitionRef.current?.stop();
          else startListening();
        }}
        disabled={!microphoneSupported}
        aria-label={t(
          listening ? "voice.stopListening" : "voice.startListening",
        )}
        aria-pressed={listening}
      >
        {listening ? <MicOff aria-hidden /> : <Mic aria-hidden />}
        <span>{t(listening ? "voice.listening" : "voice.tapToSpeak")}</span>
        <span className="rp-voice-wave" aria-hidden>
          {[0, 1, 2, 3, 4].map((bar) => (
            <i key={bar} />
          ))}
        </span>
      </button>

      {microphoneMessage && (
        <p className="rp-voice-fallback" role="status">
          {microphoneMessage} {t("voice.textFallback")}
        </p>
      )}
      {!microphoneSupported && !microphoneMessage && (
        <p className="rp-voice-fallback">{t("voice.micUnsupported")}</p>
      )}

      <form
        className="rp-voice-command-form"
        onSubmit={(event) => {
          event.preventDefault();
          submitCommand(command);
        }}
      >
        <label htmlFor="rp-voice-command">{t("voice.commandLabel")}</label>
        <div>
          <input
            id="rp-voice-command"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder={t("voice.commandPlaceholder")}
            autoComplete="off"
          />
          <button type="submit">{t("voice.ask")}</button>
        </div>
      </form>

      <section className="rp-voice-samples" aria-label={t("voice.samples")}>
        <h2>{t("voice.samples")}</h2>
        <div>
          {voiceSampleCommands(language).map((sample) => (
            <button
              type="button"
              key={sample}
              onClick={() => submitCommand(sample)}
            >
              {sample}
            </button>
          ))}
        </div>
      </section>

      {result && (
        <section className="rp-voice-response" aria-label={t("voice.response")}>
          <h2>{t("voice.response")}</h2>
          <p aria-live="polite">{result.spokenResponse}</p>
          <div>
            <button
              type="button"
              onClick={() => {
                setMuted((previous) => !previous);
                if (!muted && speechSupported) window.speechSynthesis.cancel();
              }}
              aria-pressed={muted}
              aria-label={t(muted ? "voice.unmute" : "voice.mute")}
            >
              {muted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
              {t(muted ? "voice.unmute" : "voice.mute")}
            </button>
            <button
              type="button"
              onClick={replay}
              disabled={!speechSupported || muted}
              aria-label={t("voice.replay")}
            >
              <RotateCcw aria-hidden />
              {t("voice.replay")}
            </button>
          </div>
        </section>
      )}
      {status && (
        <p className="rp-voice-status" role="status">
          {status}
        </p>
      )}
    </aside>
  );
}
