---
slug: /sql-reference/functions/geo/svg
sidebar_label: SVG
title: '从地理数据生成SVG图像的函数'
---

## Svg {#svg}

返回Geo数据中选择的SVG元素标签字符串。

**语法**

``` sql
Svg(geometry,[style])
```

别名: `SVG`, `svg`

**参数**

- `geometry` — 地理数据。 [Geo](../../data-types/geo).
- `style` — 可选样式名称。 [String](../../data-types/string).

**返回值**

- 几何图形的SVG表示。 [String](../../data-types/string).
  - SVG 圆
  - SVG 多边形
  - SVG 路径

**示例**

**圆形**

查询:

```sql
SELECT SVG((0., 0.))
```

结果:

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**多边形**

查询:

```sql
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

结果:

```response
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**路径**

查询:

```sql
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

结果:

```response
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```
