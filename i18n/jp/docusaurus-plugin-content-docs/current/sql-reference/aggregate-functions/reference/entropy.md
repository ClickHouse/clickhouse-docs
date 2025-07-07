---
'description': 'Calculates Shannon entropy of for a column of values.'
'sidebar_position': 131
'slug': '/sql-reference/aggregate-functions/reference/entropy'
'title': 'entropy'
---




# entropy

列の値の [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)) を計算します。

**構文**

```sql
entropy(val)
```

**引数**

- `val` — 任意の型の値のカラム。

**返される値**

- Shannon entropy。

型: [Float64](../../../sql-reference/data-types/float.md)。

**例**

クエリ:

```sql
CREATE TABLE entropy (`vals` UInt32,`strings` String) ENGINE = Memory;

INSERT INTO entropy VALUES (1, 'A'), (1, 'A'), (1,'A'), (1,'A'), (2,'B'), (2,'B'), (2,'C'), (2,'D');

SELECT entropy(vals), entropy(strings) FROM entropy;
```

結果:

```text
┌─entropy(vals)─┬─entropy(strings)─┐
│             1 │             1.75 │
└───────────────┴──────────────────┘
```
