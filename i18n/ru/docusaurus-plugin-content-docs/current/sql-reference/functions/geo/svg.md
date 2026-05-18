---
description: 'Документация по SVG'
sidebar_label: 'SVG'
slug: /sql-reference/functions/geo/svg
title: 'Функции для генерации SVG-изображений из геоданных'
doc_type: 'reference'
---

## Svg \{#svg\}

Возвращает строку тегов выбранных элементов SVG из геоданных.

**Синтаксис**

```sql
Svg(geometry,[style])
```

Псевдонимы: `SVG`, `svg`

**Параметры**

* `geometry` — геоданные. [Geo](../../data-types/geo).
* `style` — необязательное имя стиля. [String](../../data-types/string).

**Возвращаемое значение**

* SVG-представление геометрии. [String](../../data-types/string).
  * SVG-круг
  * SVG-многоугольник
  * SVG-путь

**Примеры**

**Окружность**

```sql title="Query"
SELECT SVG((0., 0.))
```

```response title="Response"
<circle cx="0" cy="0" r="5" style=""/>
```

**Полигон**

```sql title="Query"
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

```response title="Response"
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**Путь**

```sql title="Query"
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

```response title="Response"
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```