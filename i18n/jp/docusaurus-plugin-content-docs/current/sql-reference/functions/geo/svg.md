---
description: 'SVG のドキュメント'
sidebar_label: 'SVG'
slug: /sql-reference/functions/geo/svg
title: '地理データから SVG 画像を生成する関数'
doc_type: 'reference'
---

## Svg {#svg}

Geo データから特定の SVG 要素タグの文字列を返します。

**構文**

```sql
Svg(geometry,[style])
```

Aliases: `SVG`, `svg`

**パラメーター**

* `geometry` — ジオデータ。[Geo](../../data-types/geo)。
* `style` — オプションのスタイル名。[String](../../data-types/string)。

**返される値**

* ジオメトリの SVG 表現。[String](../../data-types/string)。
  * SVG の円
  * SVG の多角形
  * SVG のパス

**例**

**Circle**

クエリ:

```sql
SELECT SVG((0., 0.))
```

結果:

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**ポリゴン**

クエリ：

```sql
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

結果：

```response
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**パス**

クエリ：

```sql
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

結果:

```response
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```
