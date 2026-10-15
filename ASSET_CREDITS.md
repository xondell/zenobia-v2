# Происхождение ресурсов ZENOBIA

Проверка: 15 октября 2026. Эти материалы имеют собственные лицензии независимо от кода сайта. Атрибуция также доступна внутри сайта в «Источники».

## Внешняя 3D-модель

**Temple of Bel in Palmyra, Siria** — Giovanni De Gasperis и A. Cordisco, производная/переработанная модель #NEWPALMYRA. **CC BY 4.0**: https://creativecommons.org/licenses/by/4.0/ .

- Репозиторий автора: https://github.com/giodegas/PalmyraTemple
- OBJ: https://github.com/giodegas/PalmyraTemple/blob/master/other/PalmyraTemple.obj.zip
- Авторская публикация: https://sketchfab.com/3d-models/temple-of-bel-in-palmyra-siria-a75f47dd20464f6ab8c08ea2b3c62066
- API публикации, где подтверждена лицензия: https://api.sketchfab.com/v3/models/a75f47dd20464f6ab8c08ea2b3c62066
- Архив релиза/происхождение проекта: https://zenodo.org/records/44221 (DOI 10.5281/zenodo.44221).

Геометрия получена из открытого GitHub OBJ, а не обходом авторизации Sketchfab. Сам репозиторий не содержит отдельного LICENSE: основание использования — связанная самим автором публикация той же модели с CC BY 4.0. Атрибуция авторам и #NEWPALMYRA сохраняется. Запись Zenodo подтверждает происхождение, но не используется как замена лицензии Sketchfab.

Локально: `public/models/temple-bel-source.zip` — исходный OBJ-архив; `temple-bel.glb` — производная модель. Изменения: 1 551 исходный объект объединён в один mesh, удалены исходные UV, объединены совпадающие вершины, Z-up переведён в Y-up, центрирование/масштаб, созданы проекционные UV, добавлены новые каменные материалы, Meshopt и квантование. Итог: **150 550 треугольников, 2 321 628 байт**. Число треугольников относится к конкретному OBJ, не к статистике другой версии просмотрщика. Скрипт: `scripts/convert-temple.mjs`.

## Собственные 3D-элементы

`src/three/Architecture.tsx`: колоннада (60 экземпляров колонн), каннелюры, условные капители с листьями и волютами, базы, антаблемент, схематичная арка, схематичный театр, запасной храм на время загрузки, каменные обломки, песчаный рельеф. `SceneCanvas.tsx`: освещение, небо, пыль, движение камеры и объём монеты. `scripts/stone-textures.mjs`: процедурные цветовая и высотная карты известняка. Эти элементы созданы для проекта; фото-сканированными или археологически точными моделями не являются.

Город расположен художественно. Храм внешнего автора не выдается за собственную геометрию. Монета использует собственный условный объём и **внешние подлинные фотографии сторон**, перечисленные ниже.

## Изображения

| Локальный файл | Автор и источник | Лицензия и изменения |
|---|---|---|
| `palmyra.jpg`, `palmyra.webp`, `palmyra-small.webp` | Bernard Gagnon, 07.04.2010. https://commons.wikimedia.org/wiki/File:Palmyra_01.jpg | CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/ . Уменьшение, WebP; кадрирование в интерфейсе. Производные сохраняют CC BY-SA 4.0. Фото до разрушений 2015–2017. |
| `coin.png`, `coin-obverse.webp`, `coin-reverse.webp` | Classical Numismatic Group, Inc. / cngcoins.com. https://commons.wikimedia.org/wiki/File:Antoninianus_of_Zenobia.png | CC BY-SA 2.5, https://creativecommons.org/licenses/by-sa/2.5/ . Стороны вырезаны из общей фотографии, масштабированы и переведены в WebP; производные текстуры — CC BY-SA 2.5. Антиохия, март–май 272, 20 мм, 3,17 г. |
| `schmalz.jpg`, `schmalz.webp` | Herbert Gustave Schmalz, 1888, «Последний взгляд Зенобии на Пальмиру». https://commons.wikimedia.org/wiki/File:Herbert_Schmalz-Zenobia.jpg | Общественное достояние. Уменьшение/WebP. Не документальная сцена. |
| `zenobia.png`, `zenobia.webp` | Sowlos, фотография скульптуры Harriet Hosmer «Зенобия в цепях», 1859. https://www.worldhistory.org/image/3014/zenobia-in-chains/ | CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/ . Уменьшение/WebP, кадрирование. Производные — CC BY-SA 4.0. Не античный портрет. |
| `tiepolo.jpg`, `tiepolo.webp` | Giovanni Battista Tiepolo, XVIII век. https://commons.wikimedia.org/wiki/File:Giovanni_Battista_Tiepolo_-_Il_trionfo_di_Aureliano.jpg | Общественное достояние; копия получена через WHE. Уменьшение/WebP. Художественная интерпретация поздней традиции. |

## География, шрифты, иконки

- Natural Earth, public domain: https://www.naturalearthdata.com/about/terms-of-use/ . Геометрия 1:110m land из https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson , локально `src/data/geo/land.json`. Проекция Mercator; политические границы современных стран отсутствуют. Области древнего контроля и маршруты созданы схематично и не являются историческим GIS-набором.
- Cormorant Garamond, Manrope, Cinzel — локальные файлы пакетов `@fontsource/*`, SIL Open Font License 1.1. Лицензионные файлы сохранены в `public/licenses/`.
- Lucide — ISC License; значки поставляются через пакет `lucide-react`.
- Three.js/R3F/drei, GSAP и другие библиотеки сохраняют собственные условия; см. LICENSE установленных пакетов и зафиксированные версии в lockfile. Лицензия GSAP не подменяется MIT.

## Рассмотренные, но не включённые модели

Архивы страниц #NEWPALMYRA, проверенные в ходе поиска, содержали изображения, но не пригодную геометрию. Репозиторий `lurnid/newpalmyra-AR` не дал доступного OBJ/GLTF/GLB для этого сайта. Другие просмотрщики Sketchfab не извлекались без разрешённой загрузки/подтверждённой лицензии. Использована только указанная выше внешняя модель храма.
