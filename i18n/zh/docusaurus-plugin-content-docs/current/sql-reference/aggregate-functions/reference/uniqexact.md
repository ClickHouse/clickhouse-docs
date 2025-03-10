---
slug: /sql-reference/aggregate-functions/reference/uniqexact
sidebar_position: 207
title: 'uniqExact'
description: '计算不同参数值的确切数量。'
---


# uniqExact

计算不同参数值的确切数量。

``` sql
uniqExact(x[, ...])
```

如果您绝对需要一个确切的结果，请使用 `uniqExact` 函数。否则，请使用 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数。

`uniqExact` 函数使用的内存比 `uniq` 多，因为随着不同值的增加，状态的大小会无限增长。

**参数**

该函数接受可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**示例**

在此示例中，我们将使用 `uniqExact` 函数来计算 [opensky 数据集](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) 中唯一类型代码（飞机类型的短标识符）的数量。

```sql title="查询"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="响应"
1106
```

**另见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
