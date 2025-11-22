---
description: 'OFFSET のドキュメント'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'OFFSET FETCH 句'
doc_type: 'reference'
---

`OFFSET` と `FETCH` を使用すると、データを一定量ずつ取得できます。これらは、単一のクエリで取得したい行ブロックを指定します。

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` または `fetch_row_count` の値には、数値またはリテラル定数を指定できます。`fetch_row_count` は省略可能で、省略した場合のデフォルト値は 1 です。

`OFFSET` は、クエリ結果セットから行を返し始める前にスキップする行数を指定します。`OFFSET n` は、結果の先頭から `n` 行をスキップします。

負の OFFSET もサポートされています。`OFFSET -n` は結果の末尾から `n` 行をスキップします。

小数の OFFSET もサポートされています。`OFFSET n` について、0 &lt; n &lt; 1 の場合、結果の先頭の n * 100% がスキップされます。

例:
• `OFFSET 0.1` - 結果の先頭 10% をスキップします。

> **注意**
> • この小数は、[Float64](../../data-types/float.md) 型の数値であり、1 未満かつ 0 より大きい必要があります。
> • 計算の結果として行数が小数になった場合は、次の整数に切り上げられます。

`FETCH` は、クエリ結果に含めることができる最大行数を指定します。

`ONLY` オプションは、`OFFSET` によってスキップされた行に直後に続く行のみを返すために使用されます。この場合、`FETCH` は [LIMIT](../../../sql-reference/statements/select/limit.md) 句の代替となります。例えば、次のクエリは

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

クエリと同じです

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` オプションは、`ORDER BY` 句に従った結果セットにおいて、最後の行と同順位（タイ）となる追加の行を返すために使用されます。たとえば、`fetch_row_count` が 5 に設定されているものの、5 行目の `ORDER BY` 列の値と一致する行がさらに 2 行ある場合、結果セットには合計 7 行が含まれます。

:::note\
標準仕様によると、`OFFSET` 句と `FETCH` 句の両方が存在する場合、`OFFSET` 句は `FETCH` 句より前に配置しなければなりません。
:::

:::note\
実際に適用されるオフセットは、[offset](../../../operations/settings/settings.md#offset) 設定にも依存する場合があります。
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

`ONLY`オプションの使用例:

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

`WITH TIES`オプションの使用例:

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
