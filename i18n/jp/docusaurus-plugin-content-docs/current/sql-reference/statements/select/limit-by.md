---
description: 'LIMIT BY 句に関するドキュメント'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'LIMIT BY 句'
doc_type: 'reference'
---



# LIMIT BY 句

`LIMIT n BY expressions` 句を含むクエリは、`expressions` のそれぞれの異なる値ごとに先頭の `n` 行を選択します。`LIMIT BY` のキーには任意個数の [expressions](/sql-reference/syntax#expressions) を含めることができます。

ClickHouse は次の構文のバリエーションをサポートしています：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

クエリを処理する際、ClickHouse はソートキーで並べ替えられたデータを使用します。ソートキーは、[ORDER BY](/sql-reference/statements/select/order-by) 句を使用して明示的に設定するか、テーブルエンジンのプロパティとして暗黙的に設定されます（行の順序が保証されるのは [ORDER BY](/sql-reference/statements/select/order-by) を使用する場合のみであり、それ以外の場合はマルチスレッド実行により行ブロックの順序は保証されません）。その後、ClickHouse は `LIMIT n BY expressions` を適用し、`expressions` のそれぞれの異なる組み合わせごとに先頭の `n` 行を返します。`OFFSET` が指定されている場合、`expressions` のそれぞれの異なる組み合わせに属する各データブロックに対して、ClickHouse はブロック先頭から `offset_value` 行をスキップし、その結果として最大 `n` 行を返します。`offset_value` がデータブロック内の行数よりも大きい場合、ClickHouse はそのブロックから 0 行を返します。

:::note    
`LIMIT BY` は [LIMIT](../../../sql-reference/statements/select/limit.md) とは関係ありません。両方を同じクエリで使用できます。
:::

`LIMIT BY` 句でカラム名の代わりにカラム番号を使用したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にしてください。    



## 例 {#examples}

サンプルテーブル:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ:

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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` クエリは同じ結果を返します。

次のクエリは、各 `domain, device_type` ペアごとに上位5件のリファラーを返し、全体で最大100行まで返します(`LIMIT n BY + LIMIT`)。

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


## LIMIT BY ALL {#limit-by-all}

`LIMIT BY ALL`は、集約関数以外のすべてのSELECT式を列挙することと同等です。

例:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL
```

は次と同じです:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3
```

特殊なケースとして、集約関数と他のフィールドの両方を引数として持つ関数がある場合、`LIMIT BY`キーには、その関数から抽出できる最大限の非集約フィールドが含まれます。

例:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL
```

は次と同じです:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2)
```


## 例 {#examples-limit-by-all}

サンプルテーブル:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ:

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

`LIMIT BY ALL`の使用:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL
```

これは以下と同等です:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val
```

以下のクエリは、各`domain, device_type`ペアごとに上位5件のリファラーを返し、全体で最大100行を返します(`LIMIT n BY + LIMIT`)。

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
