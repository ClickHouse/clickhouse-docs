---
description: 'すべての範囲（数値軸上の区間）の和集合の全長を計算します。'
sidebar_label: 'intervalLengthSum'
sidebar_position: 155
slug: /sql-reference/aggregate-functions/reference/intervalLengthSum
title: 'intervalLengthSum'
doc_type: 'reference'
---

すべての範囲（数値軸上の区間）の和集合の全長を計算します。

**構文**

```sql
intervalLengthSum(start, end)
```

**引数**

* `start` — 区間の開始値。[Int32](/sql-reference/data-types/int-uint#integer-ranges)、[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt32](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、[Float32](/sql-reference/data-types/float)、[Float64](/sql-reference/data-types/float)、[DateTime](/sql-reference/data-types/datetime) または [Date](/sql-reference/data-types/date)。
* `end` — 区間の終了値。[Int32](/sql-reference/data-types/int-uint#integer-ranges)、[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt32](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、[Float32](/sql-reference/data-types/float)、[Float64](/sql-reference/data-types/float)、[DateTime](/sql-reference/data-types/datetime) または [Date](/sql-reference/data-types/date)。

:::note
引数は同一のデータ型でなければなりません。そうでない場合は、例外がスローされます。
:::

**戻り値**

* すべての範囲（数直線上の区間）の和集合の全体の長さ。引数の型に応じて、戻り値は [UInt64](/sql-reference/data-types/int-uint#integer-ranges) 型または [Float64](/sql-reference/data-types/float) 型になります。

**例**

1. 入力テーブル:

```text
┌─id─┬─start─┬─end─┐
│ a  │   1.1 │ 2.9 │
│ a  │   2.5 │ 3.2 │
│ a  │     4 │   5 │
└────┴───────┴─────┘
```

この例では、`Float32` 型の引数が使用されています。関数は `Float64` 型の値を返します。

結果は、区間 `[1.1, 3.2]`（`[1.1, 2.9]` と `[2.5, 3.2]` の和集合）と `[4, 5]` の長さの合計です。

クエリ:

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM fl_interval GROUP BY id ORDER BY id;
```

結果：

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                           3.1 │ Float64                                   │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```

2. 入力テーブル：

```text
┌─id─┬───────────────start─┬─────────────────end─┐
│ a  │ 2020-01-01 01:12:30 │ 2020-01-01 02:10:10 │
│ a  │ 2020-01-01 02:05:30 │ 2020-01-01 02:50:31 │
│ a  │ 2020-01-01 03:11:22 │ 2020-01-01 03:23:31 │
└────┴─────────────────────┴─────────────────────┘
```

この例では、`DateTime` 型の引数を使用します。関数は秒単位の値を返します。

クエリ:

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM dt_interval GROUP BY id ORDER BY id;
```

結果：

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                          6610 │ UInt64                                    │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```

3. 入力テーブル：

```text
┌─id─┬──────start─┬────────end─┐
│ a  │ 2020-01-01 │ 2020-01-04 │
│ a  │ 2020-01-12 │ 2020-01-18 │
└────┴────────────┴────────────┘
```

この例では、`Date` 型の引数が使用されています。関数は日単位の値を返します。

クエリ:

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM date_interval GROUP BY id ORDER BY id;
```

結果：

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                             9 │ UInt64                                    │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```
