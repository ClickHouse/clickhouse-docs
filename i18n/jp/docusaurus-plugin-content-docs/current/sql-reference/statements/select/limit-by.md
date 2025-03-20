---
slug: '/sql-reference/statements/select/limit-by'
sidebar_label: 'LIMIT BY'
keywords: ['ClickHouse', 'SQL', 'LIMIT BY', 'clauses']
description: 'LIMIT BY句を使用して、distinct valuesごとに最初のn行を選択します。'
---


# LIMIT BY 句

`LIMIT n BY expressions` 句を使用したクエリは、各distinctな `expressions` の値に対して最初の `n` 行を選択します。 `LIMIT BY` のキーは、任意の数の [expressions](/sql-reference/syntax#expressions) を含むことができます。

ClickHouseは、以下の構文のバリエーションをサポートしています：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

クエリ処理中、ClickHouseはソートキーによって順序付けられたデータを選択します。ソートキーは、[ORDER BY](/sql-reference/statements/select/order-by) 句を使用して明示的に設定されるか、テーブルエンジンのプロパティとして暗黙的に設定されます（[ORDER BY](/sql-reference/statements/select/order-by) を使用する場合のみ行の順序が保証されます。そうでない場合、行ブロックはマルチスレッドのために順序付けされません）。その後、ClickHouseは `LIMIT n BY expressions` を適用し、各distinctな `expressions` の組み合わせに対して最初の `n` 行を返します。`OFFSET` が指定されている場合、各distinctな `expressions` の組み合わせに属するデータブロックについて、ClickHouseはブロックの先頭から `offset_value` 行をスキップし、最大で `n` 行を結果として返します。`offset_value` がデータブロック内の行数よりも大きい場合、ClickHouseはそのブロックからゼロ行を返します。

:::note
`LIMIT BY` は [LIMIT](../../../sql-reference/statements/select/limit.md) とは関係ありません。両方とも同じクエリ内で使用できます。
:::

`LIMIT BY` 句でカラム名の代わりにカラム番号を使用したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にします。

## 例 {#examples}

サンプルテーブル:

``` sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ:

``` sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

``` text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

``` sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

``` text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` クエリは同じ結果を返します。

以下のクエリは、各 `domain, device_type` のペアに対して上位5件のリファラーを、合計最大100行で返します（`LIMIT n BY + LIMIT`）。

``` sql
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
