---
description: 'OFFSET のドキュメント'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'OFFSET FETCH 句'
doc_type: 'reference'
---

`OFFSET` と `FETCH` を使用すると、データを一定量ずつ取得できます。これらは、1 回のクエリで取得したい行のブロックを指定します。

```sql
-- SQL Standard style:
[OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]

-- MySQL/PostgreSQL style:
[LIMIT [n, ]m] [OFFSET offset_row_count]
```

`offset_row_count` または `fetch_row_count` の値には、数値またはリテラル定数を指定できます。`fetch_row_count` は省略可能で、省略した場合のデフォルト値は 1 です。

`OFFSET` は、クエリの結果セットから行を返し始める前にスキップする行数を指定します。`OFFSET n` は結果の先頭から `n` 行をスキップします。

負の `OFFSET` もサポートされます。`OFFSET -n` は結果の末尾から `n` 行をスキップします。

小数の `OFFSET` もサポートされます。`OFFSET n` — 0 &lt; n &lt; 1 の場合、結果のうち先頭から n * 100% がスキップされます。

例:
• `OFFSET 0.1` - 結果の先頭 10% をスキップします。

> **Note**
> • この値は 1 未満かつ 0 より大きい [Float64](../../data-types/float.md) 型の数値でなければなりません。
> • 計算の結果、小数の行数になった場合は、次の整数に切り上げられます。

`FETCH` は、クエリの結果に含めることができる最大行数を指定します。

`ONLY` オプションは、`OFFSET` によってスキップされた行に直後に続く行だけを返すために使用されます。この場合、`FETCH` は [LIMIT](../../../sql-reference/statements/select/limit.md) 句の代替となります。例えば、次のクエリでは

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

次のクエリと同一です

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` オプションは、`ORDER BY` 句に従った結果セットにおいて、最後の行と同じ順位となる追加の行も返すために使用されます。たとえば、`fetch_row_count` が 5 に設定されているが、5 行目の `ORDER BY` カラムの値と一致する行がさらに 2 行ある場合、結果セットには合計 7 行が含まれます。

:::note
標準仕様によると、`OFFSET` 句と `FETCH` 句の両方が存在する場合は、`OFFSET` 句を `FETCH` 句より前に記述しなければなりません。
:::

:::note
実際のオフセットは、[`offset`](../../../operations/settings/settings.md#offset) 設定にも依存する可能性があります。
:::

## 例 {#examples}

入力テーブル：

```text
┌─a─┬─b─┐
│ 1 │ 1 │
│ 2 │ 1 │
│ 3 │ 4 │
│ 1 │ 3 │
│ 5 │ 4 │
│ 0 │ 6 │
│ 5 │ 7 │
└───┴───┘
```

`ONLY` オプションの使用例：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

結果:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

`WITH TIES` オプションの使用方法:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

結果:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
