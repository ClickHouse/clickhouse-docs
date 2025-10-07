---
'description': '算術平均を計算します。'
'sidebar_position': 112
'slug': '/sql-reference/aggregate-functions/reference/avg'
'title': 'avg'
'doc_type': 'reference'
---


# avg

算術平均を計算します。

**構文**

```sql
avg(x)
```

**引数**

- `x` — 入力値。必ず [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、または [Decimal](../../../sql-reference/data-types/decimal.md) である必要があります。

**返される値**

- 常に算術平均として [Float64](../../../sql-reference/data-types/float.md) が返されます。
- 入力パラメータ `x` が空の場合は `NaN`。

**例**

クエリ:

```sql
SELECT avg(x) FROM VALUES('x Int8', 0, 1, 2, 3, 4, 5);
```

結果:

```text
┌─avg(x)─┐
│    2.5 │
└────────┘
```

**例**

一時テーブルを作成します。

クエリ:

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
```

算術平均を取得します。

クエリ:

```sql
SELECT avg(t) FROM test;
```

結果:

```text
┌─avg(x)─┐
│    nan │
└────────┘
```
