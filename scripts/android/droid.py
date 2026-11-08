"""Tiny adb driver for recording native apps: find views by visible text or content-desc and tap them, like a person would."""
import os
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

SDK = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk")
ADB = os.path.join(SDK, "platform-tools", "adb.exe")


def adb(*args, check=True, capture=True):
    r = subprocess.run([ADB, *args], capture_output=capture, text=True, encoding="utf8", errors="replace")
    if check and r.returncode != 0:
        raise RuntimeError(f"adb {' '.join(args)}: {r.stderr}")
    return r.stdout


def dump():
    for _ in range(5):
        out = adb("exec-out", "uiautomator", "dump", "/dev/tty", check=False)
        i = out.find("<?xml")
        j = out.rfind("</hierarchy>")
        if i != -1 and j != -1:
            return ET.fromstring(out[i : j + len("</hierarchy>")])
        time.sleep(0.5)
    raise RuntimeError("no ui dump")


def bounds(node):
    x1, y1, x2, y2 = map(int, re.findall(r"\d+", node.get("bounds")))
    return x1, y1, x2, y2


def nodes(match, exact=False):
    root = dump()
    found = []
    for n in root.iter("node"):
        for attr in ("text", "content-desc"):
            v = n.get(attr) or ""
            if (v == match) if exact else (match.lower() in v.lower()):
                found.append(n)
                break
    return found


def find(match, exact=False, timeout=10, index=0):
    end = time.time() + timeout
    while time.time() < end:
        ns = nodes(match, exact)
        if len(ns) > index:
            return ns[index]
        time.sleep(0.4)
    raise RuntimeError(f"not found: {match}")


def tap_xy(x, y, pause=0.6):
    adb("shell", "input", "tap", str(x), str(y))
    time.sleep(pause)


def tap(match, exact=False, timeout=10, index=0, pause=0.8):
    x1, y1, x2, y2 = bounds(find(match, exact, timeout, index))
    tap_xy((x1 + x2) // 2, (y1 + y2) // 2, pause)


def exists(match, exact=False):
    return bool(nodes(match, exact))


def type_text(text, per_char=0.0):
    """Types like a keyboard. Spaces become %s; accents are not supported by `input text`."""
    if per_char:
        for ch in text:
            adb("shell", "input", "text", "%s" if ch == " " else ch)
            time.sleep(per_char)
    else:
        adb("shell", "input", "text", text.replace(" ", "%s"))
    time.sleep(0.5)


def key(code, pause=0.5):
    adb("shell", "input", "keyevent", str(code))
    time.sleep(pause)


def back():
    key(4)


def hide_keyboard():
    out = adb("shell", "dumpsys", "input_method", check=False)
    if "mInputShown=true" in out:
        back()


def swipe(x1, y1, x2, y2, ms=600, pause=0.8):
    adb("shell", "input", "swipe", str(x1), str(y1), str(x2), str(y2), str(ms))
    time.sleep(pause)


def scroll_to(match, max_swipes=8, up=False, exact=False):
    w, h = screen()
    for _ in range(max_swipes):
        if exists(match, exact):
            n = find(match, exact)
            x1, y1, x2, y2 = bounds(n)
            if 250 < (y1 + y2) // 2 < h - 300:
                return n
        if up:
            swipe(w // 2, int(h * 0.35), w // 2, int(h * 0.7), 500)
        else:
            swipe(w // 2, int(h * 0.7), w // 2, int(h * 0.35), 500)
    return find(match, exact)


_size = None


def screen():
    global _size
    if not _size:
        m = re.search(r"(\d+)x(\d+)", adb("shell", "wm", "size"))
        _size = (int(m.group(1)), int(m.group(2)))
    return _size


def texts():
    return [n.get("text") or n.get("content-desc") for n in dump().iter("node") if (n.get("text") or n.get("content-desc"))]


if __name__ == "__main__":
    print("\n".join(texts()))
