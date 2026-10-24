/**
 * The section panel: which section shows, the rail index with its price line, the
 * videos, and the scroll effects. Pure DOM, no 3D: the markup is already in the page.
 */
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const pad2 = (n: number) => String(n).padStart(2, '0');
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Sections {
  readonly panel = document.getElementById('panel')!;
  readonly scroller = document.getElementById('scroller')!;
  readonly list = [...document.querySelectorAll<HTMLElement>('#panel .sec')];
  private readonly index = document.getElementById('railIndex')!;
  private observer: IntersectionObserver | null = null;
  private price = { len: 0, pts: [] as [number, number][] };
  private raf = 0;
  current = -1;

  constructor(handlers: { go: (i: number, x: number, y: number) => void; back: () => void }) {
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-back]')) b.hidden = false;
    this.panel.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const go = t.closest<HTMLElement>('[data-go]');
      if (go) {
        e.preventDefault();
        const r = go.getBoundingClientRect();
        handlers.go(Number(go.dataset.go), r.left + r.width / 2, r.top + r.height / 2);
        return;
      }
      const an = t.closest<HTMLElement>('[data-anchor-go]');
      if (an) {
        const a = this.anchors()[Number(an.dataset.anchorGo)];
        if (a) this.scroller.scrollTo({ top: a.offsetTop - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }
      if (t.closest('[data-back]')) handlers.back();
    });
    this.scroller.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(() => this.buildPriceLine()));
  }

  private section() {
    return this.list[this.current];
  }

  private anchors() {
    return [...(this.section()?.querySelectorAll<HTMLElement>('[data-anchor]') ?? [])];
  }

  /** Show section i, hide the others, and rebuild the navigation around it. */
  show(i: number) {
    this.current = i;
    this.list.forEach((s, k) => { s.hidden = k !== i; });
    for (const a of this.panel.querySelectorAll<HTMLElement>('.secnav a, .topbar a.tab')) {
      a.setAttribute('aria-current', String(Number(a.dataset.go) === i));
    }
    const bar = this.panel.querySelector<HTMLElement>('.topbar');
    const tab = bar?.querySelector<HTMLElement>('a.tab[aria-current="true"]');
    if (bar && tab) bar.scrollLeft = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    // rail index, from the section's own anchors
    const sec = this.section();
    const title = sec?.dataset.indexTitle;
    const items = this.anchors().map((a) => a.dataset.anchor ?? '');
    this.index.hidden = !title;
    if (title) {
      this.index.innerHTML =
        `<h2>${esc(title)}</h2><ol>${items
          .map((t, k) => `<li><button type="button" data-anchor-go="${k}"><span>${pad2(k + 1)}</span><span>${esc(t)}</span></button></li>`)
          .join('')}</ol><svg aria-hidden="true"><path class="track"/><path class="price"/><circle class="dot" r="3.5"/></svg>`;
    } else this.index.innerHTML = '';
    this.scroller.scrollTop = 0;
    this.setupVideos();
    requestAnimationFrame(() => this.buildPriceLine());
  }

  focusTitle() {
    this.section()?.querySelector<HTMLElement>('.sec-title')?.focus({ preventScroll: true });
  }

  pauseVideos() {
    for (const v of this.panel.querySelectorAll('video')) v.pause();
  }

  /** A zig-zag through the index items, like a price chart, drawn up to where you read. */
  buildPriceLine() {
    if (this.index.hidden) return;
    const ol = this.index.querySelector('ol');
    if (!ol) return;
    const btns = [...this.index.querySelectorAll<HTMLElement>('li button')];
    const top0 = ol.offsetTop;
    this.price.pts = [[2, top0], ...btns.map((b, k): [number, number] => [k % 2 ? 15 : 5 + (k % 3) * 2, top0 + b.offsetTop + b.offsetHeight / 2])];
    const d = this.price.pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const path = this.index.querySelector<SVGPathElement>('.price');
    this.index.querySelector('.track')?.setAttribute('d', d);
    if (!path) return;
    path.setAttribute('d', d);
    this.price.len = path.getTotalLength();
    path.style.strokeDasharray = String(this.price.len);
    this.onScroll();
  }

  onScroll() {
    if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.effects(); });
  }

  private effects() {
    const vh = this.scroller.clientHeight;
    const sr = this.scroller.getBoundingClientRect();
    // project videos slide in sideways as they enter, like a horizontal track
    for (const m of this.section()?.querySelectorAll<HTMLElement>('.proj .media') ?? []) {
      const r = m.getBoundingClientRect();
      const e = 1 - Math.pow(1 - clamp((sr.bottom - r.top) / (vh * 0.55), 0, 1), 3);
      m.style.transform = `translateX(${((1 - e) * 90).toFixed(1)}px)`;
      m.style.opacity = (0.25 + 0.75 * e).toFixed(3);
    }
    // which anchor is being read, and how far along it
    const anchors = this.anchors();
    if (!anchors.length) return;
    const probe = sr.top + vh * 0.4;
    let on = -1;
    let frac = 0;
    anchors.forEach((a, k) => {
      const r = a.getBoundingClientRect();
      if (r.top <= probe) { on = k; frac = clamp((probe - r.top) / Math.max(1, r.height), 0, 1); }
    });
    const btns = [...this.index.querySelectorAll<HTMLElement>('li button')];
    btns.forEach((b, k) => b.classList.toggle('on', k === on));
    const act = btns[on];
    if (act && this.index.scrollHeight > this.index.clientHeight) {
      const want = act.offsetTop - this.index.clientHeight * 0.4;
      if (Math.abs(this.index.scrollTop - want) > 24) this.index.scrollTo({ top: want, behavior: 'smooth' });
    }
    const P = this.price.pts;
    const path = this.index.querySelector<SVGPathElement>('.price');
    if (!this.price.len || P.length < 2 || !path) return;
    // the line reaches item k when you start reading it, and moves on toward k+1 as you read
    const cum = [0];
    for (let k = 1; k < P.length; k++) cum[k] = cum[k - 1]! + Math.hypot(P[k]![0] - P[k - 1]![0], P[k]![1] - P[k - 1]![1]);
    const total = cum[cum.length - 1]!;
    const acc = on < 0 ? 0 : cum[on + 1]! + (on + 2 < P.length ? frac * (cum[on + 2]! - cum[on + 1]!) : 0);
    const len = (acc * this.price.len) / total;
    path.style.strokeDashoffset = (this.price.len - len).toFixed(1);
    const pt = path.getPointAtLength(Math.max(0, len));
    const dot = this.index.querySelector('.dot');
    dot?.setAttribute('cx', pt.x.toFixed(1));
    dot?.setAttribute('cy', pt.y.toFixed(1));
  }

  /** Videos load and play only while on screen; phones get the small cut. */
  private setupVideos() {
    this.observer?.disconnect();
    const small = window.innerWidth <= 760;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const v = en.target as HTMLVideoElement;
          if (en.isIntersecting) {
            if (!reduceMotion) v.play().catch(() => {});
          } else if (!v.paused) v.pause();
        }
      },
      { root: this.scroller, threshold: 0.35 },
    );
    for (const v of this.section()?.querySelectorAll('video') ?? []) {
      if (!reduceMotion) {
        v.controls = false;
        const src = v.querySelector('source');
        if (small && v.dataset.sm && src && !src.src.endsWith(v.dataset.sm)) {
          src.src = v.dataset.sm;
          v.load();
        }
      }
      this.observer.observe(v);
    }
  }
}
