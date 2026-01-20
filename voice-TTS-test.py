import os
import psycopg2
import subprocess
import platform
from dotenv import load_dotenv

load_dotenv(".env.local")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

VOICE_DIR = os.path.join(
    BASE_DIR,
    "backend",
    "static",
    "voice-tts"
)

os.makedirs(VOICE_DIR, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env.local")

conn = psycopg2.connect(DATABASE_URL)


def fetch_latest_questions(limit=3):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT generated_question_content
            FROM "DynamicQuestion"
            ORDER BY dynamic_question_id DESC
            LIMIT %s;
            """,
            (limit,),
        )
        rows = cur.fetchall()

    return [r[0] for r in rows][::-1]

def play_audio(filename: str):
    system = platform.system()

    # macOS
    if system == "Darwin":
        subprocess.run(["afplay", filename], check=True)

    # Windows (keep existing PowerShell logic)
    elif system == "Windows":
        ps_cmd = f"""
        Add-Type -AssemblyName presentationCore;
        $player = New-Object System.Windows.Media.MediaPlayer;
        $player.Open([uri]'{filename}');
        $player.Play();
        while ($player.NaturalDuration.HasTimeSpan -eq $false) {{
            Start-Sleep -Milliseconds 200
        }}
        while ($player.Position -lt $player.NaturalDuration.TimeSpan) {{
            Start-Sleep -Milliseconds 200
        }}
        """
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            check=True,
        )

    else:
        raise RuntimeError(f"Unsupported OS: {system}")


def speak_question(text: str, index: int):
    filename = os.path.join(VOICE_DIR, f"question_{index}.mp3")

    # Generate MP3 using edge-tts CLI
    subprocess.run(
        [
            "edge-tts",
            "--voice", "en-US-AriaNeural",
            "--rate", "+10%",
            "--text", text,
            "--write-media", filename,
        ],
        check=True,
    )

    # Play MP3 and BLOCK until finished
    # ps_cmd = f"""
    # Add-Type -AssemblyName presentationCore;
    # $player = New-Object System.Windows.Media.MediaPlayer;
    # $player.Open([uri]'{filename}');
    # $player.Play();
    # while ($player.NaturalDuration.HasTimeSpan -eq $false) {{
    #     Start-Sleep -Milliseconds 200
    # }}
    # while ($player.Position -lt $player.NaturalDuration.TimeSpan) {{
    #     Start-Sleep -Milliseconds 200
    # }}
    # """

    # subprocess.run(
    #     ["powershell", "-NoProfile", "-Command", ps_cmd],
    #     check=True,
    # )

    play_audio(filename)

    # Cleanup temporary file
    os.remove(filename)


def main():
    questions = fetch_latest_questions()

    if not questions:
        print("No dynamic questions found.")
        return

    print(f"\nReading {len(questions)} questions using neural voice:\n")

    for idx, question in enumerate(questions, start=1):
        print(f"Q{idx}: {question}")
        speak_question(f"Question {idx}. {question}", idx)

    print("\nDone.")


if __name__ == "__main__":
    main()
