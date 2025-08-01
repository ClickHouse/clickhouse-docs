---
description: 'Documentation for Offset'
sidebar_label: 'OFFSET'
slug: '/sql-reference/statements/select/offset'
title: 'OFFSET FETCH Clause'
---



`OFFSET` と `FETCH` は、データを部分的に取得することを可能にします。これらは、一度のクエリで取得したい行のブロックを指定します。

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` または `fetch_row_count` の値は数値またはリテラル定数で指定できます。`fetch_row_count` は省略可能で、デフォルトでは 1 になります。

`OFFSET` は、クエリの結果セットから行を返す前にスキップする行数を指定します。

`FETCH` は、クエリの結果に含まれる最大行数を指定します。

`ONLY` オプションは、`OFFSET` によって省略された行の直後に続く行を返す際に使用されます。この場合、`FETCH` は [LIMIT](../../../sql-reference/statements/select/limit.md) 句の代替となります。例えば、以下のクエリは

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

以下のクエリと同じです。

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` オプションは、`ORDER BY` 句に従って結果セットの最後の位置に結びつく追加の行も返すために使います。例えば、`fetch_row_count` が 5 に設定されている場合でも、5 行目の `ORDER BY` カラムと一致する行が2つあった場合、結果セットには7行が含まれます。

:::note    
標準に従い、`OFFSET` 句は両方が存在する場合は `FETCH` 句の前に来る必要があります。
:::

:::note    
実際のオフセットは、[offset](../../../operations/settings/settings.md#offset) 設定にも依存する可能性があります。
:::

## 例 {#examples}

入力テーブル:

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

`ONLY` オプションの使用:

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

`WITH TIES` オプションの使用:

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
