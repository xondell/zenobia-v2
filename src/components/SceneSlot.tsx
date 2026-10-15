'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, RotateCcw } from 'lucide-react';

export type SceneKind = 'hero' | 'city' | 'coin';
const SceneCanvas = dynamic(() => import('@/three/SceneCanvas'), { ssr: false, loading: () => <span className="scene-loading">Подготавливаем 3D…</span> });

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function SceneSlot({ kind, presenting = false }: { kind: SceneKind; presenting?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [simple, setSimple] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [reset, setReset] = useState(0);
  const [ruins, setRuins] = useState(false);
  const [face, setFace] = useState(0);
  const [inspection, setInspection] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [detail, setDetail] = useState('');
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(media.matches); setSpinning(!media.matches); };
    media.addEventListener('change', update);
    let checked = false;
    const observer = new IntersectionObserver(entries => {
      const intersecting = entries.some(e => e.isIntersecting);
      setVisible(intersecting);
      if (intersecting && !checked) {
        checked = true;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl2');
        setSupported(!!context);
        context?.getExtension('WEBGL_lose_context')?.loseContext();
        update();
      }
    }, { rootMargin: '120px' });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); media.removeEventListener('change', update); };
  }, []);
  const poster = kind === 'coin' ? `/images/coin-${face === 0 ? 'obverse' : 'reverse'}.webp` : '/images/palmyra.webp';
  const fallback = <div className={`scene-fallback ${kind === 'coin' ? 'coin-poster' : ''}`}><Image src={poster} alt={kind === 'coin' ? 'Подлинный антониниан Зенобии, фотография Classical Numismatic Group' : 'Колоннада Пальмиры на фотографии Bernard Gagnon, 2010'} fill sizes={kind === 'hero' ? '100vw' : '(max-width: 800px) 100vw, 60vw'} priority={kind === 'hero'} /><span>{kind !== 'hero' && 'Статичный режим · весь материал доступен'}</span></div>;

  return <div ref={ref} className={`scene-slot scene-${kind}`}>
    <div className="scene-stage" role="group" aria-label={kind === 'coin' ? 'Трёхмерная монета Зенобии' : 'Трёхмерная архитектура Пальмиры'}>
      {fallback}
      {supported && !simple && visible && <SceneBoundary fallback={fallback}><SceneCanvas key={reset} kind={kind} reduced={reduced} exploring={exploring} ruins={ruins} face={face} inspection={inspection} spinning={spinning} presenting={presenting} onDetail={setDetail} onFailure={() => setSupported(false)} /></SceneBoundary>}
    </div>
    {kind !== 'hero' && <>
      <div className="scene-toolbar">
        {kind === 'city' ? <><button onClick={() => setExploring(e => !e)} aria-pressed={exploring}><Box size={15} />{exploring ? 'Завершить осмотр' : 'Исследовать 3D'}</button><button onClick={() => setRuins(r => !r)} aria-pressed={ruins}>{ruins ? 'Реконструкция' : 'Условные руины'}</button></> : <><button onClick={() => { setFace(f => 1 - f); setInspection(n => n + 1); setSpinning(false); }}>Показать {face === 0 ? 'реверс' : 'аверс'}</button><button onClick={() => setSpinning(s => !s)} aria-pressed={spinning}>{spinning ? 'Остановить вращение' : 'Вращать монету'}</button></>}
        <button className="icon-button" onClick={() => { setReset(r => r + 1); setFace(0); setDetail(''); }} aria-label="Сбросить камеру"><RotateCcw size={16} /></button>
        <button onClick={() => setSimple(s => !s)} aria-pressed={simple}>{simple ? 'Включить 3D' : 'Без 3D'}</button>
      </div>
      <p className="scene-caption">{kind === 'city' ? 'Храм Бела: G. De Gasperis, A. Cordisco / #NEWPALMYRA · CC BY 4.0. Остальная архитектура — собственная. Компоновка художественная, не точный план. В режиме осмотра: тяните для вращения, колесо — масштаб.' : 'CNG · Антониниан, 20 мм, 3,17 г · CC BY-SA 2.5. Фототекстуры подлинные; объём и край условны. Тяните для вращения, колесо — масштаб.'}</p>
      <div className="scene-information">
      {kind === 'city' && <div className="hotspot-list">{[['Колоннада', 'Монументальная колоннада связывала важнейшие общественные здания. Главная улица тянулась примерно на 1,1 км.'], ['Храм Бела', 'Храм Бела был одним из важнейших религиозных сооружений Пальмиры. Его архитектура соединяла местные и греко-римские традиции.'], ['Римский театр', 'Театр отражает влияние греко-римской архитектуры. В сцене он показан схематично, в виде полукруглых рядов.']].map(([name, text]) => <button key={name} onClick={() => setDetail(text)}>{name} <span>+</span></button>)}</div>}
      {kind === 'coin' && <div className="coin-legends"><button aria-pressed={!spinning && face === 0} onClick={() => { setFace(0); setSpinning(false); setInspection(n => n + 1); setDetail('AVG — Augusta. Императорский титул, который использовала Зенобия. На монете: S ZЄNOBIA AVG; нормализованная запись — S ZENOBIA AVG.'); }}>S ZЄNOBIA <u>AVG</u> <span>↗</span></button><button aria-pressed={!spinning && face === 1} onClick={() => { setFace(1); setSpinning(false); setInspection(n => n + 1); setDetail('IVNO REGINA — «Юнона-царица». На реверсе Юнона держит патеру и скипетр; у её ног павлин.'); }}>IVNO REGINA <span>↗</span></button></div>}
      {detail && <p className="object-detail" role="status">{detail}</p>}
      </div>
    </>}
  </div>;
}
