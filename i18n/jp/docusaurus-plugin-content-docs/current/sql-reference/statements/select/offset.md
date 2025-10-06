---
'description': 'Offset に関するドキュメント'
'sidebar_label': 'OFFSET'
'slug': '/sql-reference/statements/select/offset'
'title': 'OFFSET FETCH 句'
'doc_type': 'reference'
---

`OFFSET` と `FETCH` を使用すると、データを部分的に取得できます。これにより、単一のクエリで取得したい行のブロックを指定します。

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` または `fetch_row_count` の値は、数値またはリテラル定数にできます。`fetch_row_count` を省略することもできます。デフォルトでは、1に等しくなります。

`OFFSET` は、クエリ結果セットから行を返し始める前にスキップする行の数を指定します。

`FETCH` は、クエリ結果に含まれる最大行数を指定します。

`ONLY` オプションは、`OFFSET` によって省略された行に直後に続く行を返すために使用されます。この場合、`FETCH` は [LIMIT](../../../sql-reference/statements/select/limit.md) 句の代替として機能します。例えば、以下のクエリ

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

は、以下のクエリと同じです。

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` オプションは、`ORDER BY` 句に基づいて結果セットの最後に位置する追加の行を返すために使用されます。たとえば、`fetch_row_count` が5に設定されているが、5行目の `ORDER BY` カラムの値に一致する追加の行が2行ある場合、結果セットには7行が含まれます。

:::note    
標準に従って、`OFFSET` 句は両方の句が存在する場合、`FETCH` 句の前に来なければなりません。
:::

:::note    
実際のオフセットは、[offset](../../../operations/settings/settings.md#offset) 設定にも依存する場合があります。
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

`ONLY` オプションの使用例:

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

`WITH TIES` オプションの使用例:

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
