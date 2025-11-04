---
'description': '选择列的最后一个遇到的值。'
'sidebar_position': 105
'slug': '/sql-reference/aggregate-functions/reference/anylast'
'title': 'anyLast'
'doc_type': 'reference'
---


# anyLast

选择列中最后遇到的值。

:::warning
由于查询可以以任意顺序执行，因此此函数的结果是非确定性的。
如果需要任意但确定的结果，请使用函数 [`min`](../reference/min.md) 或 [`max`](../reference/max.md)。
:::

默认情况下，该函数永远不会返回 NULL，即忽略输入列中的 NULL 值。
但是，如果使用 `RESPECT NULLS` 修饰符调用该函数，它会返回第一个读取的值，无论是 NULL 还是非 NULL。

**语法**

```sql
anyLast(column) [RESPECT NULLS]
```

别名 `anyLast(column)`（不带 `RESPECT NULLS`）
- [`last_value`](../reference/last_value.md)。

`anyLast(column) RESPECT NULLS` 的别名
- `anyLastRespectNulls`, `anyLast_respect_nulls`
- `lastValueRespectNulls`, `last_value_respect_nulls`

**参数**
- `column`: 列名。

**返回值**

- 最后遇到的值。

**示例**

查询：

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES ('Amsterdam'),(NULL),('New York'),('Tokyo'),('Valencia'),(NULL);

SELECT anyLast(city), anyLastRespectNulls(city) FROM tab;
```

```response
┌─anyLast(city)─┬─anyLastRespectNulls(city)─┐
│ Valencia      │ ᴺᵁᴸᴸ                      │
└───────────────┴───────────────────────────┘
```
