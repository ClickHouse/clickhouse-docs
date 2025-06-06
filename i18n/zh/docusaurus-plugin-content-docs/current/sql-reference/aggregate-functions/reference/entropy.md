---
'description': '计算一列值的香农熵。'
'sidebar_position': 131
'slug': '/sql-reference/aggregate-functions/reference/entropy'
'title': 'entropy'
---


# entropy

计算列值的 [Shannon 熵](https://en.wikipedia.org/wiki/Entropy_(information_theory))。

**语法**

```sql
entropy(val)
```

**参数**

- `val` — 任何类型的值的列。

**返回值**

- Shannon 熵。

类型: [Float64](../../../sql-reference/data-types/float.md)。

**示例**

查询:

```sql
CREATE TABLE entropy (`vals` UInt32,`strings` String) ENGINE = Memory;

INSERT INTO entropy VALUES (1, 'A'), (1, 'A'), (1,'A'), (1,'A'), (2,'B'), (2,'B'), (2,'C'), (2,'D');

SELECT entropy(vals), entropy(strings) FROM entropy;
```

结果:

```text
┌─entropy(vals)─┬─entropy(strings)─┐
│             1 │             1.75 │
└───────────────┴──────────────────┘
```
