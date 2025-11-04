---
'description': '计算不同参数值的精确数量。'
'sidebar_position': 207
'slug': '/sql-reference/aggregate-functions/reference/uniqexact'
'title': 'uniqExact'
'doc_type': 'reference'
---


# uniqExact

计算不同参数值的确切数量。

```sql
uniqExact(x[, ...])
```

如果您绝对需要精确的结果，请使用 `uniqExact` 函数。否则，请使用 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数。

`uniqExact` 函数比 `uniq` 使用更多内存，因为随着不同值数量的增加，状态的大小会无限增长。

**参数**

该函数接受多个参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**示例**

在此示例中，我们将使用 `uniqExact` 函数来计算 [opensky 数据集](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) 中唯一类型代码的数量（飞机类型的简短标识符）。

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**另请参见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
