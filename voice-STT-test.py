import os
import json
import queue
import sounddevice as sd
from vosk import Model, KaldiRecognizer
from datetime import datetime

# ================= CONFIG =================
SAMPLE_RATE = 16000
MODEL_PATH = "vosk-model-small-en-us-0.15"
OUTPUT_DIR = "backend/static/voice-stt"
# =========================================

os.makedirs(OUTPUT_DIR, exist_ok=True)

audio_queue = queue.Queue()

def callback(indata, frames, time, status):
    if status:
        print(status)
    audio_queue.put(bytes(indata))

def main():
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Vosk model not found at '{MODEL_PATH}'. "
            "Download and extract the model first."
        )

    print("Loading Vosk model...")
    model = Model(MODEL_PATH)
    recognizer = KaldiRecognizer(model, SAMPLE_RATE)
    recognizer.SetWords(True)

    print("\nSpeak now (Press Ctrl+C to stop)...\n")

    full_text = []

    try:
        with sd.RawInputStream(
            samplerate=SAMPLE_RATE,
            blocksize=8000,
            dtype="int16",
            channels=1,
            callback=callback,
        ):
            while True:
                data = audio_queue.get()
                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    if result.get("text"):
                        print(">", result["text"])
                        full_text.append(result["text"])

    except KeyboardInterrupt:
        print("\nRecording stopped")

    final_result = json.loads(recognizer.FinalResult())
    if final_result.get("text"):
        full_text.append(final_result["text"])

    text = " ".join(full_text).strip()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    txt_path = f"{OUTPUT_DIR}/voice_{timestamp}.txt"

    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)

    print("\n================ RESULT ================")
    print(text)
    print("=======================================")
    print(f"Saved to: {txt_path}")

if __name__ == "__main__":
    main()
