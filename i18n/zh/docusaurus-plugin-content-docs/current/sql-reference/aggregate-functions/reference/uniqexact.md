---
description: '计算不同参数取值的精确数量。'
sidebar_position: 207
slug: /sql-reference/aggregate-functions/reference/uniqexact
title: 'uniqExact'
doc_type: 'reference'
---

# uniqExact

计算参数的不同取值的精确数量。

```sql
uniqExact(x[, ...])
```

如果确实需要精确结果，请使用 `uniqExact` 函数。否则，请使用 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数。

`uniqExact` 函数比 `uniq` 使用更多内存，因为其状态大小会随着不同取值数量的增加而无限增长。

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**示例**

在本示例中，我们将使用 `uniqExact` 函数来统计 [opensky 数据集](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) 中唯一机型代码（用于标识飞机类型的简短标识符）的数量。

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
