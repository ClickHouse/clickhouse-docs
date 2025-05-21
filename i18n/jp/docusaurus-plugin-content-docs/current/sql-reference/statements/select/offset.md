---
description: 'Offsetに関するドキュメント'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'OFFSET FETCH句'
---

`OFFSET` と `FETCH` を使用すると、データを部分的に取得できます。これらは、1つのクエリによって取得したい行のブロックを指定します。

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count`または`fetch_row_count`の値は、数値またはリテラル定数を指定できます。`fetch_row_count`は省略可能で、デフォルトでは1に設定されています。

`OFFSET`は、クエリの結果セットから行を返し始める前にスキップする行数を指定します。

`FETCH`は、クエリの結果に含めることができる最大行数を指定します。

`ONLY`オプションは、`OFFSET`で除外された行の直後に続く行を返すために使用されます。この場合、`FETCH`は[LIMIT](../../../sql-reference/statements/select/limit.md)句の代替となります。例えば、次のクエリは

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

は次のクエリと同じです。

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES`オプションは、`ORDER BY`句に従って結果セットの最後の位置に結びつく追加の行を返すために使用されます。例えば、`fetch_row_count`が5に設定されているが、5番目の行の`ORDER BY`列の値に一致する行が2つ追加される場合、結果セットには7行が含まれます。

:::note    
標準に従って、`OFFSET`句は両方が存在する場合、`FETCH`句の前に来なければなりません。
:::

:::note    
実際のオフセットは、[offset](../../../operations/settings/settings.md#offset)設定にも依存する場合があります。
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

`ONLY`オプションの使用例：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

結果：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

`WITH TIES`オプションの使用例：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

結果：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
