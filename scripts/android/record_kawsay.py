# -*- coding: utf-8 -*-
"""
Drives Kawsay like a person while `adb screenrecord` captures it, then writes the take
where demos:process expects it: view/demos/kawsay.webm plus its sidecar JSON.

Run kawsay_setup.py first: it wipes the app and logs an invented profile and breakfast,
so no real user's data is ever on screen.

Every UI lookup (a uiautomator dump, one to two seconds) is marked as a skip, so the clip
keeps the app's own pace and drops the automation's. screenrecord writes frames only when
the screen changes, so the take is converted to a constant 30 fps before it is cut, or a
still screen held for three seconds would survive as a single frame.
"""
import json, os, subprocess, time
import droid as D

marks = []
RAW = "kawsay-raw.mp4"
t0 = None
def mark(name): marks.append({"name": name, "at": round(time.time() - t0, 3)})
def p(s): time.sleep(s)

# Every UI lookup is automation latency, not the app: cut it out of the clip.
_find = D.find
def find(*a, **k):
    if t0: mark("skip-start")
    n = _find(*a, **k)
    if t0: mark("skip-end")
    return n
D.find = find
def starts(prefix):
    mark("skip-start")
    r = [x for x in D.texts() if x and x.startswith(prefix)][0]
    mark("skip-end")
    return r
def glide(dy, steps=3):
    w, h = D.screen()
    for _ in range(steps):
        D.swipe(w // 2, h // 2 + dy // 2, w // 2, h // 2 - dy // 2, 700, 0.5)

# start clean on Today
D.adb("shell", "settings", "put", "system", "show_touches", "1")
D.tap("Hoy", exact=True); p(0.8)
D.scroll_to("Calorías: ", up=True); p(0.5)

rec = subprocess.Popen([D.ADB, "shell", "screenrecord", "--size", "720x1600", "--bit-rate", "8000000", "/sdcard/kawsay.mp4"])
p(1.5); t0 = time.time()

p(2.5)                                    # Today: six gauges at real scale
glide(500, 2); p(1.2); glide(-500, 2); p(0.8)
D.tap("Calorías: "); p(3.2)              # gauge detail: limits + what added most
D.tap("Listo", exact=True); p(1)

D.tap("Registrar", exact=True); p(1.2)   # log lunch
D.tap("Comida", exact=True); p(1.2)
D.tap("Agregar a Almuerzo"); p(1)
D.tap("Buscar plato"); D.type_text("lomo", per_char=0.18); p(1.4)
D.tap("Lomo saltado", exact=True); p(2.8) # preview: needles before/after
D.tap("¾", exact=True); p(2.2)
D.tap(starts("Agregar ")); p(1.6)

D.tap("Lomo saltado"); p(1.4)            # edit the amount afterwards
D.tap("½", exact=True); p(1.4)
D.tap(starts("Guardar ")); p(1.6)

D.scroll_to("+ Agregar actividad"); p(0.6) # a walk raises today's target
D.tap("+ Agregar actividad"); p(1)
D.tap("Caminar", exact=True); p(0.5)
D.tap("45′", exact=True); p(0.5)
D.tap("Media", exact=True); p(0.5)
D.tap("Mañana", exact=True); p(0.8)
D.tap("Agregar", exact=True); p(1.4)

D.scroll_to("Calorías: ", up=True); p(3.2)

D.tap("Análisis", exact=True); p(2)     # weekly liver card
glide(600, 2); p(3)

mark("end")
D.adb("shell", "pkill", "-INT", "screenrecord", check=False); rec.wait(timeout=20); p(1.5)
D.adb("shell", "settings", "put", "system", "show_touches", "0")
D.adb("pull", "/sdcard/kawsay.mp4", RAW)

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
ffbin = os.environ.get("FFMPEG_DIR") or os.path.join(os.environ["LOCALAPPDATA"],
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin")
dur = float(subprocess.run([os.path.join(ffbin, "ffprobe"), "-v", "error", "-show_entries", "format=duration",
                            "-of", "csv=p=0", RAW], capture_output=True, text=True).stdout)
# Marks use the script's clock; the video starts when screenrecord is up. Align on the end.
end = [m for m in marks if m["name"] == "end"][0]["at"]
shift = end + 0.3 - dur
out = []
for m in marks:
    if m["name"] == "end": continue
    at = m["at"] - shift - (0.25 if m["name"] == "skip-end" else 0)  # keep each tap's lead-in
    out.append({"name": m["name"], "at": round(at, 3)})
out += [{"name": "skip-start", "at": round(dur - 0.6, 3)}, {"name": "skip-end", "at": round(dur, 3)}]
subprocess.run([os.path.join(ffbin, "ffmpeg"), "-v", "error", "-y", "-i", RAW, "-vf", "fps=30",
                "-c:v", "libvpx-vp9", "-crf", "24", "-b:v", "0", "-deadline", "good", "-cpu-used", "4",
                "-row-mt", "1", os.path.join(root, "view", "demos", "kawsay.webm")], check=True)
json.dump({"name": "kawsay", "viewport": {"width": 720, "height": 1600}, "phone": True, "marks": out},
          open(os.path.join(root, "view", "demos", "kawsay.json"), "w"), indent=2)
os.remove(RAW)
print(f"{len(out) // 2} cuts, take {dur:.1f} s")
