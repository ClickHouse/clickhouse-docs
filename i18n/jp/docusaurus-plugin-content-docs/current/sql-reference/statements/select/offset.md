---
slug: /sql-reference/statements/select/offset
sidebar_label: OFFSET
title: "OFFSET FETCH 句"
---

`OFFSET` と `FETCH` を使うことで、データを部分的に取得することができます。これらは、1回のクエリで取得したい行のブロックを指定します。

``` sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` または `fetch_row_count` の値は、数字またはリテラル定数になります。 `fetch_row_count` は省略可能で、デフォルトでは 1 になります。

`OFFSET` は、クエリの結果セットから行を返し始める前にスキップする行数を指定します。

`FETCH` は、クエリの結果に含まれる可能性がある最大行数を指定します。

`ONLY` オプションは、`OFFSET` によって省略された行に直後の行を返すために使用されます。この場合、`FETCH` は [LIMIT](../../../sql-reference/statements/select/limit.md) 句の代替となります。例えば、次のクエリ

``` sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

は次のクエリと同じです。

``` sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` オプションは、`ORDER BY` 句に従って結果セット内の最後の場所で同点の追加行を返すために使用されます。例えば、`fetch_row_count` が 5 に設定されているが、5 行目の `ORDER BY` 列の値に一致する追加の行が 2 行ある場合、結果セットは 7 行になります。

:::note    
標準に従って、両方が存在する場合、`OFFSET` 句は `FETCH` 句の前に来なければなりません。
:::

:::note    
実際のオフセットは [offset](../../../operations/settings/settings.md#offset) 設定にも依存する場合があります。
:::

## 例 {#examples}

入力テーブル:

``` text
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

`ONLY` オプションの使用例:

``` sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

結果:

``` text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

`WITH TIES` オプションの使用例:

``` sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

結果:

``` text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
