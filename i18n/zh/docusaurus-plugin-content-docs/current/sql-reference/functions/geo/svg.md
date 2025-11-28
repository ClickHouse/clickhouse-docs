---
description: 'SVG 文档'
sidebar_label: 'SVG'
slug: /sql-reference/functions/geo/svg
title: '用于从地理数据生成 SVG 图像的函数'
doc_type: 'reference'
---



## Svg

从 Geo 数据返回包含所选 SVG 元素标签的字符串。

**语法**

```sql
Svg(geometry,[style])
```

别名：`SVG`、`svg`

**参数**

* `geometry` — 地理数据。[Geo](../../data-types/geo)。
* `style` — 可选的样式名称。[String](../../data-types/string)。

**返回值**

* 几何对象的 SVG 形式。[String](../../data-types/string)。
  * SVG 圆
  * SVG 多边形
  * SVG 路径

**示例**

**圆**

查询：

```sql
SELECT SVG((0., 0.))
```

结果：

```response
<circle cx="0" cy="0" r="5" style=""/>
```

**Polygon**

查询：

```sql
SELECT SVG([(0., 0.), (10, 0), (10, 10), (0, 10)])
```

结果：

```response
<polygon points="0,0 0,10 10,10 10,0 0,0" style=""/>
```

**路径**

查询：

```sql
SELECT SVG([[(0., 0.), (10, 0), (10, 10), (0, 10)], [(4., 4.), (5, 4), (5, 5), (4, 5)]])
```

结果：

```response
<g fill-rule="evenodd"><path d="M 0,0 L 0,10 L 10,10 L 10,0 L 0,0M 4,4 L 5,4 L 5,5 L 4,5 L 4,4 z " style=""/></g>
```
