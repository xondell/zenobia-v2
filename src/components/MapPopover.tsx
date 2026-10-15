'use client';
import { useEffect, useRef } from 'react';

export function MapPopover({ name, text, onClose }: { name: string; text: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const card = ref.current;
    const map = card?.closest('.historical-map');
    const marker = map?.querySelector<SVGGElement>('[data-selected="true"]');
    if (!card || !map || !marker) return;
    let frame = 0;
    let until = performance.now() + 1600;
    const place = () => {
      const bounds = map.getBoundingClientRect(), point = marker.getBoundingClientRect();
      const width = card.offsetWidth, height = card.offsetHeight;
      const right = point.right - bounds.left + 20;
      const left = point.left - bounds.left - width - 20;
      const x = right + width < bounds.width - 16 ? right : left;
      const y = point.top - bounds.top - height / 2;
      card.style.setProperty('--popover-x', `${Math.max(16, Math.min(x, bounds.width - width - 16))}px`);
      card.style.setProperty('--popover-y', `${Math.max(64, Math.min(y, bounds.height - height - 80))}px`);
      if (performance.now() < until) frame = requestAnimationFrame(place);
    };
    const update = () => { cancelAnimationFrame(frame); until = performance.now() + 1600; place(); };
    const observer = new ResizeObserver(update); observer.observe(map); observer.observe(card);
    const outside = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!card.contains(target) && !target.closest('.map-city,.map-region')) onClose();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && map.contains(event.target as Node)) {
        event.preventDefault(); event.stopImmediatePropagation(); onClose(); marker.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', escape, true);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', update, { passive: true });
    place();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('keydown', escape, true); document.removeEventListener('pointerdown', outside); window.removeEventListener('scroll', update); };
  }, [name, onClose]);
  return <div ref={ref} className="map-popover map-detail" role="region" aria-label={`Описание: ${name}`} aria-live="polite"><button aria-label="Закрыть описание города" onClick={onClose}>×</button><h3>{name}</h3><p>{text}</p></div>;
}
