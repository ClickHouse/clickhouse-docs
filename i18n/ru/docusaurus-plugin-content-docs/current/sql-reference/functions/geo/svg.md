---
slug: '/sql-reference/functions/geo/svg'
sidebar_label: SVG
description: 'Документация для Svg'
title: 'Функции для генерации изображений SVG из гео-данных'
doc_type: reference
---
## Svg {#svg}

Возвращает строку выборки тегов SVG элементов из геоданных.

**Синтаксис**

```sql
Svg(geometry,[style])
```

Псевдонимы: `SVG`, `svg`

**Параметры**

- `geometry` — Геоданные. [Geo](../../data-types/geo).
- `style` — Необязательно имя стиля. [String](../../data-types/string).

**Возвращаемое значение**

- SVG представление геометрии. [String](../../data-types/string).
  - SVG круг
  - SVG многоугольник
  - SVG путь

**Примеры**

**Круг**

Запрос:

```sql
SELECT SVG((0., 0.))
```

Результат:

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**Многоугольник**

Запрос:

```sql
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

Результат:

```response
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**Путь**

Запрос:

```sql
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

Результат:

```response
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```