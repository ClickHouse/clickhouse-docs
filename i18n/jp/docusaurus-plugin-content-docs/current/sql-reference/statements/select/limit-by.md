---
description: 'LIMIT BY句のドキュメント'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'LIMIT BY句'
---


# LIMIT BY句

`LIMIT n BY expressions`句を使用したクエリは、各異なる値の`expressions`について最初の`n`行を選択します。`LIMIT BY`のキーは、任意の数の[expressions](/sql-reference/syntax#expressions)を含むことができます。

ClickHouseは以下の構文のバリエーションをサポートしています：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

クエリ処理中、ClickHouseはソートキーによって順序付けられたデータを選択します。ソートキーは、[ORDER BY](/sql-reference/statements/select/order-by)句を使用して明示的に設定するか、テーブルエンジンのプロパティとして暗黙的に設定されます（[ORDER BY](/sql-reference/statements/select/order-by)を使用しない場合、行の順序は保証されず、行ブロックはマルチスレッド処理のために順序付けられません）。それからClickHouseは`LIMIT n BY expressions`を適用し、各異なる`expressions`の組み合わせに対して最初の`n`行を返します。`OFFSET`が指定されている場合、各`expressions`の異なる組み合わせに属するデータブロックについて、ClickHouseはブロックの先頭から`offset_value`行をスキップし、最大で`n`行を結果として返します。`offset_value`がデータブロック内の行数よりも大きい場合、ClickHouseはそのブロックからゼロ行を返します。

:::note    
`LIMIT BY`は[LIMIT](../../../sql-reference/statements/select/limit.md)とは関係ありません。両方を同じクエリで使用できます。
:::

`LIMIT BY`句で列名の代わりに列番号を使用したい場合は、設定[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)を有効にしてください。    
    

## 例 {#examples}

サンプルテーブル：

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ：

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id`クエリは同じ結果を返します。

以下のクエリは、各`domain, device_type`ペアの上位5つのリファラーを、合計最大100行で返します（`LIMIT n BY + LIMIT`）。

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    domainWithoutWWW(REFERRER_URL) AS referrer,
    device_type,
    count() cnt
FROM hits
GROUP BY domain, referrer, device_type
ORDER BY cnt DESC
LIMIT 5 BY domain, device_type
LIMIT 100
```
