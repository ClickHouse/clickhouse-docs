---
description: 'Документация по SVG'
sidebar_label: 'SVG'
slug: /sql-reference/functions/geo/svg
title: 'Функции для создания SVG-изображений из геоданных'
doc_type: 'reference'
---



## Svg {#svg}

Возвращает строку с тегами элементов SVG на основе геоданных.

**Синтаксис**

```sql
Svg(geometry,[style])
```

Синонимы: `SVG`, `svg`

**Параметры**

- `geometry` — геоданные. [Geo](../../data-types/geo).
- `style` — необязательное название стиля. [String](../../data-types/string).

**Возвращаемое значение**

- SVG-представление геометрии. [String](../../data-types/string).
  - SVG-окружность
  - SVG-многоугольник
  - SVG-путь

**Примеры**

**Окружность**

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
