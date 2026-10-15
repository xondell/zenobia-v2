'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Expand, Menu, MonitorPlay, X } from 'lucide-react';
import { chapters } from '@/data/chapters';
import { sources } from '@/data/sources';
import { getNextChapter, shouldIgnoreShortcut } from '@/lib/navigation';
import { Modal } from './Modal';
import { ChapterVisual } from './ChapterVisual';
import { AssetCredits } from './Sources';

type Panel = 'chapters' | 'sources' | null;
export default function Experience() {
  const [current, setCurrent] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [notes, setNotes] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState('');
  const [collapsedText, setCollapsedText] = useState<Record<string, boolean>>({});
  const progress = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const navigationTarget = useRef<number | null>(null);
  const presentationActive = useRef(false);
  const transitioning = useRef(false);
  const animation = useRef<Animation | null>(null);
  const direction = useRef(1);
  const [inTransition, setInTransition] = useState(false);
  const chapter = chapters[current];

  const go = useCallback((index: number) => {
    const next = Math.max(0, Math.min(9, index));
    if (transitioning.current) return;
    setPanel(null);
    if (presenting && next !== current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const outgoing = document.getElementById(chapters[current].id);
      if (!outgoing) return;
      direction.current = next > current ? 1 : -1;
      transitioning.current = true; setInTransition(true);
      const motion = outgoing.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: .15, transform: `translateX(${-direction.current * 28}px)` }], { duration: 220, easing: 'ease-in', fill: 'forwards' });
      animation.current = motion;
      void motion.finished.then(() => {
        setCurrent(next);
        history.replaceState(null, '', '#' + chapters[next].id);
      }).catch(() => {});
      return;
    }
    if (presenting) window.scrollTo({ top: 0, behavior: 'instant' });
    else navigationTarget.current = next;
    setCurrent(next); setPanel(null);
    history.replaceState(null, '', '#' + chapters[next].id);
    if (!presenting) document.getElementById(chapters[next].id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [presenting, current]);

  useLayoutEffect(() => {
    if (!presenting || !transitioning.current) return;
    animation.current?.cancel();
    const incoming = document.getElementById(chapters[current].id);
    if (!incoming) return;
    const motion = incoming.animate([{ opacity: .15, transform: `translateX(${direction.current * 28}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
    animation.current = motion;
    void motion.finished.catch(() => {}).finally(() => {
      if (animation.current !== motion) return;
      transitioning.current = false; setInTransition(false); animation.current = null;
    });
  }, [current, presenting]);

  useEffect(() => () => { animation.current?.cancel(); }, []);

  const fullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch { setNotice('Полноэкранный режим недоступен. Презентация работает в окне браузера.'); }
  }, []);

  const enter = () => {
    presentationActive.current = true;
    if (navigationTarget.current !== null) setCurrent(navigationTarget.current);
    navigationTarget.current = null;
    setPresenting(true); setPanel(null); setNotes(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    void fullscreen();
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const exit = useCallback(() => {
    animation.current?.cancel(); animation.current = null;
    transitioning.current = false; setInTransition(false);
    presentationActive.current = false;
    setPresenting(false); setNotes(false); setNotice('');
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    requestAnimationFrame(() => document.getElementById(chapters[current].id)?.scrollIntoView({ behavior: 'instant' }));
  }, [current]);

  useEffect(() => {
    if (presenting) return;
    const elements = document.querySelectorAll<HTMLElement>('[data-chapter]');
    const observer = new IntersectionObserver(entries => {
      if (presentationActive.current) return;
      for (const entry of entries) if (entry.isIntersecting) {
        const index = Number((entry.target as HTMLElement).dataset.chapter);
        if (navigationTarget.current !== null && navigationTarget.current !== index) continue;
        if (navigationTarget.current === index) navigationTarget.current = null;
        setCurrent(index);
      }
    }, { rootMargin: '-35% 0px -45% 0px' });
    elements.forEach(el => observer.observe(el));
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); };
  }, [presenting]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (e.altKey || e.ctrlKey || e.metaKey || target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (presenting && e.key.toLowerCase() === 'n') { e.preventDefault(); setNotes(n => !n); return; }
      if (target.closest('[role="button"], [role="tab"], [role="slider"]')) return;
      if (e.altKey || e.ctrlKey || e.metaKey || shouldIgnoreShortcut(target.tagName, target.isContentEditable)) return;
      if (e.key.toLowerCase() === 'f') { e.preventDefault(); void fullscreen(); }
      if (!presenting) return;
      if (e.key === 'Escape') { e.preventDefault(); exit(); }
      if (['ArrowRight', 'ArrowLeft', ' ', 'Home', 'End'].includes(e.key)) { e.preventDefault(); go(getNextChapter(current, e.key)); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [current, presenting, panel, go, exit, fullscreen]);

  useEffect(() => {
    const onFullscreen = () => { if (!document.fullscreenElement && presenting) exit(); };
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, [presenting, exit]);

  useEffect(() => {
    if (presenting || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    // Scope and revert GSAP to avoid duplicate triggers after mode switches.
    // https://gsap.com/docs/v3/GSAP/gsap.context/
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => {
          gsap.from(el, { y: 32, opacity: 0.15, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 94%', toggleActions: 'play none none reverse' } });
        });
      }, root);
      cleanup = () => ctx.revert();
    });
    return () => { cancelled = true; cleanup?.(); };
  }, [presenting]);

  return <div ref={root} data-transitioning={inTransition} className={`experience ${presenting ? 'presenting' : ''}`}>
    <a href="#prologue" className="skip-link">Перейти к истории</a>
    <header className="site-header">
      <button className="wordmark" onClick={() => go(0)} aria-label="Зенобия — к началу">Z<span className="logo-rule" />ENOBIA</button>
      <span className="header-caption">ИСТОРИЯ ОДНОГО ВЫЗОВА</span>
      <nav aria-label="Основная навигация">
        <button aria-label="Главы" onClick={() => setPanel('chapters')}><Menu size={15} /><span>Главы</span></button>
        <button className="explore-nav" onClick={() => go(2)}>Исследовать</button>
        <button aria-label="Источники" onClick={() => setPanel('sources')}><BookOpen size={15} /><span>Источники</span></button>
        {presenting ? <button className="presentation-button" onClick={exit}><X size={15} />Выйти</button> : <button aria-label="Презентация" className="presentation-button" onClick={enter}><MonitorPlay size={15} /><span>Презентация</span></button>}
      </nav>
      <div className="reading-progress" ref={progress} />
    </header>

    <main>
      {chapters.map((c, index) => <section key={c.id} id={c.id} data-chapter={index} aria-labelledby={`${c.id}-title`} hidden={presenting && current !== index} className={`chapter chapter-${c.id} ${[1, 2, 4, 5, 6, 8].includes(index) ? 'chapter-immersive' : ''} ${collapsedText[c.id] ? 'text-collapsed' : ''}`}>
        {index === 0 ? <>
          <div className="hero-visual"><ChapterVisual id={c.id} presenting={presenting} /></div>
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow hero-eyebrow"><span /> ИНТЕРАКТИВНАЯ ИСТОРИЧЕСКАЯ ХРОНИКА <span /></p>
            <p className="hero-latin">THE QUEEN WHO DEFIED ROME</p>
            <h1 id="prologue-title" className="hero-title" aria-label="Зенобия">{'ЗЕНОБИЯ'.split('').map((letter, i) => <span key={i} style={{ animationDelay: `${i * 0.09}s` }}>{letter}</span>)}</h1>
            <p className="hero-subtitle">Женщина, бросившая<br className="mobile-break" /> вызов Риму</p>
            <div className="hero-date"><span />267 — 272 <small>ГОДЫ Н. Э.</small><span /></div>
            <button className="begin-button" onClick={() => go(1)}>Открыть историю <ArrowRight size={18} /></button>
          </div>
          <div className="hero-bottom"><span>ПАЛЬМИРА, СИРИЯ<br /><small>34°33′15″N 38°16′00″E</small></span><button onClick={() => go(1)} className="scroll-cue"><ArrowDown size={18} /><span>Листайте, чтобы открыть историю</span></button><span className="hero-edition">ДЕСЯТЬ ГЛАВ<br /><small>ОДНА НЕВЕРОЯТНАЯ ИСТОРИЯ</small></span></div>
        </> : <>
          <div className="chapter-heading reveal">
            <p className="eyebrow"><span className="chapter-number">{String(index + 1).padStart(2, '0')}</span> {c.english} <span className="fine-line" /></p>
            <p className="chapter-kicker">{c.kicker}</p><h2 id={`${c.id}-title`}>{c.title}</h2><p className="chapter-subtitle">{c.subtitle}</p>
            {[1, 2, 4, 5, 6, 8].includes(index) && <button className="toggle-copy" aria-expanded={!collapsedText[c.id]} onClick={() => setCollapsedText(previous => ({ ...previous, [c.id]: !previous[c.id] }))}>{collapsedText[c.id] ? 'Показать текст' : 'Свернуть текст'}</button>}
          </div>
          <div className="chapter-layout"><div className="chapter-copy reveal">{c.paragraphs.map((p, j) => <p key={j}>{p}</p>)}{index === 9 && <div className="closing-actions"><button className="gold-button" onClick={() => go(0)}>Изучить историю заново <ArrowRight size={16} /></button><button onClick={() => setPanel('sources')}>Исторические источники</button><button onClick={enter}><MonitorPlay size={16} />Режим презентации</button></div>}</div><div className="chapter-art reveal"><ChapterVisual id={c.id} presenting={presenting} /></div></div>
        </>}
      </section>)}
    </main>

    {!presenting && <nav className="chapter-rail" aria-label="Быстрый переход по главам">{chapters.map((c, i) => <button key={c.id} aria-label={`${String(i + 1).padStart(2, '0')} ${c.title}`} aria-current={current === i ? 'step' : undefined} onClick={() => go(i)} title={c.title}><span className="rail-label">{c.title}</span><span>{String(i + 1).padStart(2, '0')}</span><i /></button>)}</nav>}

    {presenting && <footer className="presentation-controls"><button className="icon-button" onClick={() => go(current - 1)} disabled={current === 0} aria-label="Предыдущая глава"><ArrowLeft /></button><div className="chapter-status"><b>{String(current + 1).padStart(2, '0')} <span>/ 10</span></b><span>{chapter.title}</span></div><button className="icon-button" onClick={() => go(current + 1)} disabled={current === 9} aria-label="Следующая глава"><ArrowRight /></button><button onClick={() => setNotes(n => !n)} aria-pressed={notes}>N · Заметки</button><button className="icon-button" onClick={() => void fullscreen()} aria-label="Полный экран"><Expand size={18} /></button></footer>}
    {presenting && notes && <aside className="speaker-notes"><div><p className="eyebrow">ЗАМЕТКИ ВЫСТУПАЮЩЕГО · {current + 1}/10</p><button className="icon-button" onClick={() => setNotes(false)} aria-label="Скрыть заметки"><X size={16} /></button></div><p>{chapter.notes}</p><small>Полный текст рассчитан примерно на 7–10 минут с паузами. Панель видна зрителям: для проектора закройте её клавишей N.</small></aside>}
    {notice && <div className="notice" role="status">{notice}<button aria-label="Скрыть уведомление" onClick={() => setNotice('')}><X size={15} /></button></div>}

    {panel === 'chapters' && <Modal title="Десять глав истории" onClose={() => setPanel(null)}><div className="chapter-menu">{chapters.map((c, i) => <button key={c.id} onClick={() => go(i)}><span>{String(i + 1).padStart(2, '0')}</span><div>{c.title}<small>{c.english}</small></div><ArrowRight size={20} /></button>)}</div></Modal>}
    {panel === 'sources' && <Modal title="Источники и авторы" onClose={() => setPanel(null)}><p className="modal-intro">История требует свидетельств. Здесь собраны исследования, первоисточники и происхождение изображений.</p><div className="sources-list">{sources.map(s => <article key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><p>{s.label}</p><small>{s.note}</small></article>)}</div><AssetCredits /></Modal>}
  </div>;
}
