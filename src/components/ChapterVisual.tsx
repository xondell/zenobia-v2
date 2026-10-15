'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SceneSlot } from './SceneSlot';
const HistoricalMap = dynamic(() => import('./HistoricalMap'), { loading: () => <p className="loading-map">Подготавливаем исторический атлас…</p> });

const people = {
  'Оденат': 'Супруг Зенобии. Правитель Пальмиры, защищавший римские восточные территории от Сасанидов. Погиб около 267 года.',
  'Зенобия': 'Супруга Одената и мать Вабаллата. После гибели мужа стала регентом при малолетнем сыне и фактической правительницей.',
  'Вабаллат': 'Сын Одената и Зенобии. Первоначально Зенобия осуществляла власть от его имени. В 272 году носил титул Augustus.',
};
function Biography() {
  const [person, setPerson] = useState<keyof typeof people>('Зенобия');
  return <div className="biography-visual"><figure className="portrait"><Image src="/images/zenobia.webp" alt="Художественный образ Зенобии в скульптуре Harriet Hosmer" width={480} height={599} sizes="(max-width:800px) 90vw, 35vw" /><span className="portrait-name">SEPTIMIA<br />ZENOBIA</span><figcaption>Harriet Hosmer, 1859 · Фото Sowlos, CC BY-SA 4.0<br />Художественный образ XIX века, не античный портрет</figcaption></figure><div className="family-tree"><p className="eyebrow">ДИНАСТИЯ ПАЛЬМИРЫ</p><div className="family-parents">{(['Оденат', 'Зенобия'] as const).map(name => <button key={name} onClick={() => setPerson(name)} aria-pressed={person === name}>{name}<small>{name === 'Оденат' ? 'СУПРУГ' : 'СУПРУГА'}</small></button>)}</div><div className="family-branch" /><button className="family-child" onClick={() => setPerson('Вабаллат')} aria-pressed={person === 'Вабаллат'}>Вабаллат<small>ИХ СЫН</small></button><p className="person-detail" aria-live="polite">{people[person]}</p><div className="mini-timeline"><span><b>ок. 240</b>Рождение</span><span><b>ок. 258</b>Брак</span><span><b>ок. 267</b>Регентство</span></div></div></div>;
}
const versions = [
  { title: 'Пленение и триумф', label: 'ПОЗДНЯЯ ТРАДИЦИЯ · НИЗКАЯ НАДЁЖНОСТЬ ДЕТАЛЕЙ', text: 'Historia Augusta сообщает о Зенобии в золотых цепях на триумфе Аврелиана. Этот сборник часто вымышляет подробности. Пленение исторически принято, но именно участие в шествии нельзя считать доказанным.', source: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Tyranni_XXX*.html' },
  { title: 'Жизнь в Италии', label: 'ПОЗДНЯЯ ТРАДИЦИЯ · НЕ ПОДТВЕРЖДЕНА', text: 'В той же позднеантичной традиции Зенобия после поражения живёт близ Тибура, в Италии. Надёжных независимых свидетельств, позволяющих восстановить эту часть её жизни, недостаточно.', source: 'https://www.worldhistory.org/zenobia/' },
  { title: 'Неизвестная судьба', label: 'ОСТОРОЖНЫЙ ВЫВОД · ПРЕДЕЛ НАШИХ ЗНАНИЙ', text: 'Источники расходятся. Точная дата смерти и обстоятельства последних лет Зенобии не установлены. Историческая осторожность здесь важнее выбора самой красивой версии.', source: 'https://www.worldhistory.org/zenobia/' },
];
function FallInvestigation() {
  const [version, setVersion] = useState(2);
  return <div className="fall-visual"><figure className="schmalz"><Image src="/images/schmalz.webp" alt="Последний взгляд Зенобии на Пальмиру — картина Herbert Gustave Schmalz, 1888" width={850} height={1024} sizes="(max-width:800px) 90vw, 45vw" /><figcaption>Herbert Gustave Schmalz · 1888 · Общественное достояние<br />Живопись XIX века, не документальная сцена</figcaption></figure><div className="investigation"><p className="eyebrow">ИСТОРИЧЕСКОЕ РАССЛЕДОВАНИЕ</p><h3>Что случилось с Зенобией?</h3><div className="version-tabs" role="tablist" aria-label="Версии судьбы Зенобии">{versions.map((v, i) => <button key={v.title} id={`version-tab-${i}`} role="tab" aria-label={`${['I', 'II', 'III'][i]} ${v.title}`} aria-selected={version === i} aria-controls="version-panel" onClick={() => setVersion(i)}>{['I', 'II', 'III'][i]} <span>{v.title}</span></button>)}</div><div id="version-panel" role="tabpanel" aria-labelledby={`version-tab-${version}`}><small>{versions[version].label}</small><p>{versions[version].text}</p><a href={versions[version].source} target="_blank" rel="noreferrer">Проверить источник ↗</a></div></div></div>;
}
const gallery = [
  { image: '/images/palmyra.webp', title: 'Каменная память города', caption: 'Большая колоннада · Bernard Gagnon · 2010 · CC BY-SA 4.0', alt: 'Археологические руины колоннады Пальмиры' },
  { image: '/images/coin-obverse.webp', title: 'Свидетельство власти', caption: 'Антониниан, 272 · CNG · CC BY-SA 2.5', alt: 'Аверс античной монеты Зенобии' },
  { image: '/images/tiepolo.webp', title: 'Как рождается легенда', caption: 'Зенобия перед Аврелианом · G. B. Tiepolo · XVIII век · Public domain', alt: 'Картина Тьеполо: Зенобия перед императором Аврелианом' },
];
function LegacyGallery() {
  const [index, setIndex] = useState(0);
  const [reconstruction, setReconstruction] = useState(false);
  const item = gallery[index];
  return <div className="legacy-visual"><div className="comparison-switch"><button onClick={() => setReconstruction(false)} aria-pressed={!reconstruction}>Археологический памятник</button><button onClick={() => setReconstruction(true)} aria-pressed={reconstruction}>Художественная реконструкция</button></div>{reconstruction ? <SceneSlot kind="city" /> : <figure className={`gallery-image gallery-${index}`}><Image src={item.image} alt={item.alt} width={1300} height={900} sizes="(max-width:800px) 90vw, 60vw" /><figcaption><h3>{item.title}</h3>{item.caption}</figcaption></figure>}<p className="comparison-note">Разные типы свидетельств, не точное сравнение одного ракурса. Фотография снята до разрушений 2015–2017 годов.</p><div className="gallery-controls"><span>АРХИВ · {String(index + 1).padStart(2, '0')} / 03</span><div>{gallery.map((g, i) => <button key={g.title} onClick={() => { setIndex(i); setReconstruction(false); }} aria-label={`Галерея: ${g.title}`} aria-pressed={i === index && !reconstruction}>{String(i + 1).padStart(2, '0')}</button>)}</div><a href="https://newpalmyra.org/" target="_blank" rel="noreferrer">#NEWPALMYRA ↗</a></div></div>;
}
const questions = [
  { text: 'В каком веке правила Зенобия?', options: ['II век н. э.', 'III век н. э.', 'IV век н. э.'], correct: 1 },
  { text: 'Как назывался её город?', options: ['Александрия', 'Антиохия', 'Пальмира'], correct: 2 },
  { text: 'Какой император победил Зенобию?', options: ['Аврелиан', 'Август', 'Валериан'], correct: 0 },
];
function Quiz() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [q, setQ] = useState(0);
  if (!open) return <button className="quiz-open" onClick={() => setOpen(true)}>Проверить себя <span>3 вопроса</span><ArrowRight size={18} /></button>;
  const done = q >= questions.length;
  return <div className="quiz"><p className="eyebrow">ПОСЛЕ ИСТОРИИ · НЕОБЯЗАТЕЛЬНЫЙ ТЕСТ</p>{done ? <><h3>{answers.filter((a, i) => a === questions[i].correct).length} из 3</h3><p>Историю можно исследовать снова — каждый источник открывает новую деталь.</p><button onClick={() => { setAnswers([]); setQ(0); }}><RotateCcw size={15} />Попробовать снова</button></> : <><h3>{questions[q].text}</h3><div className="quiz-options">{questions[q].options.map((option, i) => <button key={option} disabled={answers[q] !== undefined} className={answers[q] !== undefined && questions[q].correct === i ? 'correct' : ''} onClick={() => setAnswers(a => [...a, i])}>{option}{answers[q] !== undefined && questions[q].correct === i && <Check size={16} />}</button>)}</div>{answers[q] !== undefined && <><p role="status">{answers[q] === questions[q].correct ? 'Верно.' : `Правильный ответ: ${questions[q].options[questions[q].correct]}.`}</p><button onClick={() => setQ(n => n + 1)}>Далее <ArrowRight size={15} /></button></>}</>}</div>;
}
export function ChapterVisual({ id, presenting }: { id: string; presenting: boolean }) {
  switch (id) {
    case 'prologue': return <SceneSlot kind="hero" presenting={presenting} />;
    case 'crisis': return <><div className="crisis-stat"><strong>235<span>—</span>284</strong><p>ПОЛВЕКА НЕСТАБИЛЬНОСТИ</p></div><HistoricalMap mode="crisis" /></>;
    case 'palmyra': return <SceneSlot kind="city" presenting={presenting} />;
    case 'rise': return <Biography />;
    case 'expansion': return <HistoricalMap />;
    case 'augusta': return <><p className="augusta-word">AVGVSTA</p><SceneSlot kind="coin" presenting={presenting} /></>;
    case 'aurelian': return <div className="confrontation"><div className="rivals"><div><span>ZENOBIA</span><h3>Власть Востока</h3><small>Регентство с ок. 267</small></div><b>VS</b><div><span>AVRELIANVS</span><h3>Единство Рима</h3><small>Император с 270</small></div></div><HistoricalMap mode="campaign" /><p className="battle-stages"><span>01 · ИММЫ</span><i /><span>02 · ЭМЕСА</span><i /><span>03 · ПАЛЬМИРА</span></p></div>;
    case 'fall': return <FallInvestigation />;
    case 'legacy': return <LegacyGallery />;
    case 'epilogue': return <div className="epilogue-visual"><SceneSlot kind="coin" presenting={presenting} /><Quiz /></div>;
    default: return null;
  }
}
