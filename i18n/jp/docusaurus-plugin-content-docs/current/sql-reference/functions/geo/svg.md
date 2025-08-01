---
description: 'Documentation for Svg'
sidebar_label: 'SVG'
slug: '/sql-reference/functions/geo/svg'
title: 'Functions for Generating SVG images from Geo data'
---



## Svg {#svg}

Geo データから選択した SVG 要素タグの文字列を返します。

**構文**

```sql
Svg(geometry,[style])
```

エイリアス: `SVG`, `svg`

**パラメータ**

- `geometry` — Geo データ。 [Geo](../../data-types/geo)。
- `style` — オプショナルなスタイル名。 [String](../../data-types/string)。

**返される値**

- ジオメトリの SVG 表現。 [String](../../data-types/string)。
  - SVG サークル
  - SVG ポリゴン
  - SVG パス

**例**

**サークル**

クエリ:

```sql
SELECT SVG((0., 0.))
```

結果:

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**ポリゴン**

クエリ:

```sql
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

結果:

```response
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**パス**

クエリ:

```sql
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

結果:

```response
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```
