'use client';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { geoGraticule10, geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { Pause, Play, RotateCcw } from 'lucide-react';
import land from '@/data/geo/land.json';
import { MapPopover } from './MapPopover';

const geographicProjection = geoMercator().center([20, 36]).scale(760).translate([500, 270]);
// Node and browser trig implementations differ at ~1e-13. Round SVG values
// deterministically instead of suppressing hydration warnings.
const projection = (coords: number[]) => geographicProjection([coords[0], coords[1]])?.map(n => Number(n.toFixed(3)));
const path = geoPath(geographicProjection).digits(3);
const landPath = path(land as GeoPermissibleObjects) || '';
const graticule = path(geoGraticule10()) || '';
const cities = [
  { name: 'Рим', coords: [12.496, 41.903], text: 'Политический центр империи. В III веке власть императоров всё сильнее зависела от армии.' },
  { name: 'Пальмира', coords: [38.269, 34.55], text: 'Торговый оазис и центр власти Одената, Зенобии и Вабаллата.' },
  { name: 'Антиохия', coords: [36.16, 36.2], text: 'Крупный город римской Сирии и монетный двор. Близ него в 272 году произошло сражение у Имм.' },
  { name: 'Александрия', coords: [29.918, 31.2], text: 'Крупнейший город Египта. Пальмирские войска установили контроль над регионом в 270 году.' },
  { name: 'Эмеса', coords: [36.71, 34.73], text: 'Современный Хомс. У Эмесы в 272 году Аврелиан вновь разгромил пальмирские войска.' },
];
const regions = [
  { name: 'Галлия', coords: [1, 46], text: 'Западные провинции. В годы кризиса здесь возникло отдельное Галльское государство.' },
  { name: 'Италия', coords: [13, 44.5], text: 'Историческое ядро римской державы. Схематическая заливка не означает неизменности политического контроля.' },
  { name: 'Балканы', coords: [23, 43], text: 'Дунайская граница имела большое военное значение. Армия региона выдвигала будущих императоров.' },
  { name: 'Малая Азия', coords: [32, 39.5], text: 'Значительная часть региона оказалась под пальмирским контролем к 271 году. Детали северо-западной границы дискуссионны.' },
  { name: 'Сирия', coords: [42, 33.5], text: 'Сирия была основой пальмирского влияния на римском Востоке.' },
  { name: 'Египет', coords: [30, 26.8], text: 'Богатая провинция и важнейший поставщик зерна. Контроль Пальмиры датируется 270 годом; в отдельных обзорах встречается 269.' },
];
const campaignStages = [
  { ...cities[2], label: '01 · ИММЫ', text: 'В 272 году Аврелиан победил пальмирские войска у Имм, близ Антиохии. Зенобия отступила на юг.' },
  { ...cities[4], label: '02 · ЭМЕСА', text: 'У Эмесы в 272 году римляне вновь разгромили войска Зенобии. После поражения она отступила к Пальмире.' },
  { ...cities[1], label: '03 · ПАЛЬМИРА', text: 'В 272 году Пальмира капитулировала, а Зенобия была захвачена при попытке покинуть город. Государство потеряло самостоятельность.' },
];
const yearText: Record<number, string> = {
  267: 'Регентство Зенобии. Основа власти — Пальмира и римский Восток.',
  268: 'Укрепление влияния. Точные изменения контроля по годам не установлены.',
  269: 'Рост самостоятельности. Датировка начала египетской кампании дискуссионна.',
  270: 'Египет под пальмирским контролем. Новый центр силы на Востоке.',
  271: 'Наибольший размах влияния: Сирия, Египет, значительная часть Малой Азии.',
  272: 'Поход Аврелиана: Иммы → Эмеса → Пальмира. Утрата самостоятельности.',
};
function project(coords: number[]) { return projection([coords[0], coords[1]])!; }
function points(coords: number[][]) { return coords.map(c => project(c).join(',')).join(' '); }
const roman = points([[-10, 50], [23, 49], [31, 44], [44, 40], [44, 30], [34, 23], [24, 29], [-9, 29]]);
const syria = points([[35, 37], [40, 37.5], [42, 33], [35, 31], [34, 33]]);
const egypt = points([[33.5, 31.5], [34, 23], [28, 23], [24, 31.5]]);
const anatolia = points([[27, 40], [36, 41], [41, 37.5], [35, 36], [28, 36]]);

export default function HistoricalMap({ mode = 'expansion' }: { mode?: 'crisis' | 'expansion' | 'campaign' }) {
  const [year, setYear] = useState(mode === 'campaign' ? 272 : 267);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<{ name: string; text: string; coords: number[] } | null>(null);
  const closeDetail = useCallback(() => setSelected(null), []);
  const select = (item: typeof cities[number]) => {
    const detail = mode === 'campaign' ? campaignStages.find(stage => stage.name === item.name) ?? item : item;
    setSelected(previous => previous?.name === item.name ? null : detail);
  };
  const id = useId().replaceAll(':', '');
  const zoom = selected ? 1.22 : 1;
  const center = selected ? project(selected.coords) : [500, 270];
  const transform = `translate(500 270) scale(${zoom}) translate(${-center[0]} ${-center[1]})`;
  const route = useMemo(() => {
    const coords = mode === 'campaign' || year === 272 ? [[29, 40], [34, 37], [36.16, 36.2], [36.71, 34.73], [38.269, 34.55]] : [[38.269, 34.55], [35, 33], [33, 31.5], [29.918, 31.2]];
    return 'M' + coords.map(c => project(c).join(',')).join(' L');
  }, [mode, year]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setYear(y => y === 272 ? 267 : y + 1), 1800);
    return () => clearInterval(timer);
  }, [playing]);

  return <div className={`historical-map map-${mode}`}>
    <div className="map-topline"><span className="eyebrow">{mode === 'campaign' ? 'КАМПАНИЯ АВРЕЛИАНА' : 'АТЛАС ДРЕВНЕГО МИРА'}</span><button className="icon-button" aria-label="Вернуться к общей карте" onClick={() => { setSelected(null); setPlaying(false); setYear(mode === 'campaign' ? 272 : 267); }}><RotateCcw size={16} /></button></div>
    <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="map-svg" aria-label="Карта Средиземноморья с историческими городами">
      <defs><clipPath id={`map-clip-${id}`}><rect width="1000" height="560" /></clipPath><clipPath id={`land-${id}`}><path d={landPath} /></clipPath><pattern id={`hatch-${id}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><line y2="9" stroke="#d6ad73" strokeWidth="2" opacity=".35" /></pattern></defs>
      <g clipPath={`url(#map-clip-${id})`}><rect width="1000" height="560" fill="#e1eae7" /><g className="map-camera" transform={transform}>
        <path d={graticule} fill="none" stroke="#708e8c" strokeWidth=".5" opacity=".25" />
        <path d={landPath} fill="#ded8c8" stroke="#8c8a79" strokeWidth="1" />
        <g clipPath={`url(#land-${id})`}><polygon points={roman} fill="#b17b6c" opacity=".48" />
          <polygon points={syria} className="palmyrene-area" fill={year === 272 ? `url(#hatch-${id})` : '#b18b51'} opacity=".9" />
          <polygon points={egypt} className="palmyrene-area" fill={year >= 270 && year < 272 ? '#b18b51' : year === 272 ? `url(#hatch-${id})` : 'transparent'} opacity=".9" />
          <polygon points={anatolia} className="palmyrene-area" fill={year >= 271 && year < 272 ? '#b18b51' : year === 272 ? `url(#hatch-${id})` : 'transparent'} opacity=".9" />
        </g>
        <text x="375" y="340" className="sea-label" transform="rotate(-13 375 340)">СРЕДИЗЕМНОЕ МОРЕ</text>
        {regions.map(region => { const p = projection(region.coords)!; return <g key={region.name} role="button" tabIndex={0} aria-label={`Регион ${region.name}`} aria-expanded={selected?.name === region.name} data-selected={selected?.name === region.name} className="map-region" onClick={() => select(region)} onKeyDown={e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); select(region); } }}><title>{region.text}</title><rect x={p[0] - 65} y={p[1] - 19} width="130" height="29" fill="transparent" /><text x={p[0]} y={p[1]}>{region.name.toUpperCase()}</text></g>; })}
        {(year >= 270 || mode === 'campaign') && mode !== 'crisis' && <path className="campaign-route" d={route} fill="none" stroke={year === 272 ? '#914f3d' : '#704820'} strokeWidth="3" strokeDasharray="5 6" />}
        {cities.map((city, i) => { const p = projection(city.coords)!; return <g key={city.name} role="button" tabIndex={0} aria-label={city.name} aria-expanded={selected?.name === city.name} data-selected={selected?.name === city.name} className={`map-city city-${i}`} onClick={() => select(city)} onKeyDown={e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); select(city); } }}><title>{city.text}</title><circle cx={p[0]} cy={p[1]} r="15" fill="transparent" /><circle cx={p[0]} cy={p[1]} r={i === 1 ? 6 : 4} fill={i === 1 ? '#8e622d' : '#39352f'} /><circle cx={p[0]} cy={p[1]} r="10" fill="none" stroke="#8e622d" opacity=".7" /><text x={p[0] + (i === 4 ? -12 : 14)} y={p[1] + (i === 2 ? -18 : i === 4 ? 27 : -7)} textAnchor={i === 4 ? 'end' : 'start'}>{city.name}</text></g>; })}
        <text x="55" y="510" className="map-north">N ↑</text>
      </g></g>
    </svg>
    <div className="map-legend"><span><i className="roman-dot" />Римский мир</span><span><i className="palmyra-dot" />Пальмирский контроль</span>{year === 272 && <span>Штриховка — утраченные владения</span>}</div>
    {mode === 'expansion' && <div className="map-timeline"><div className="year-display"><strong>{year}</strong><span>ГОД Н. Э.</span><button onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Остановить хронологию' : 'Воспроизвести хронологию'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button></div><div className="year-slider"><input aria-label="Год на исторической карте" type="range" min="267" max="272" step="1" value={year} onChange={e => { setYear(Number(e.target.value)); setPlaying(false); }} /><div>{[267, 268, 269, 270, 271, 272].map(y => <button key={y} onClick={() => { setYear(y); setPlaying(false); }} aria-pressed={year === y}>{y}</button>)}</div></div></div>}
    {selected && <MapPopover name={selected.name} text={selected.text} onClose={closeDetail} />}
    {mode === 'campaign' && <div className="battle-stages" role="group" aria-label="Этапы кампании">{campaignStages.map(stage => <button key={stage.label} aria-pressed={selected?.name === stage.name} onClick={() => select(stage)}>{stage.label}</button>)}</div>}
    <p className="map-event" aria-live="polite"><span key={year} className="exhibit-enter">{mode === 'crisis' ? 'Нажмите на город или регион, чтобы узнать его значение.' : yearText[year]}</span></p>
    <p className="map-disclaimer">Береговая линия — Natural Earth. Зоны влияния и направления походов схематичны; точные границы и ежегодные изменения известны не полностью.</p>
  </div>;
}
