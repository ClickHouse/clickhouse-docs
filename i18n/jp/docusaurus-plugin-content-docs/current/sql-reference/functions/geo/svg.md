---
slug: /sql-reference/functions/geo/svg
sidebar_label: SVG
title: "GeoデータからSVG画像を生成するための関数"
---

## Svg {#svg}

Geoデータの選択されたSVG要素タグの文字列を返します。

**構文**

``` sql
Svg(geometry,[style])
```

エイリアス: `SVG`, `svg`

**パラメータ**

- `geometry` — Geoデータ。 [Geo](../../data-types/geo).
- `style` — オプションのスタイル名。 [String](../../data-types/string).

**返される値**

- 幾何学のSVG表現。 [String](../../data-types/string).
  - SVG円
  - SVG多角形
  - SVGパス

**例**

**円**

クエリ:

```sql
SELECT SVG((0., 0.))
```

結果:

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**多角形**

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
