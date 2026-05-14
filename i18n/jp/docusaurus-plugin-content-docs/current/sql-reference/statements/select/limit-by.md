---
description: 'LIMIT BY 句のドキュメント'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'LIMIT BY 句'
doc_type: 'reference'
---

`LIMIT n BY expressions` 句を含むクエリは、`expressions` のそれぞれの異なる値ごとに先頭の `n` 行を選択します。`LIMIT BY` のキーには任意個数の[式](/sql-reference/syntax#expressions)を含めることができます。

ClickHouse は次の構文バリエーションをサポートします。

* `LIMIT [offset_value, ]n BY expressions`
* `LIMIT n OFFSET offset_value BY expressions`

クエリ処理中、ClickHouse はソートキーで並べ替えられたデータを処理します。ソートキーは [ORDER BY](/sql-reference/statements/select/order-by) 句を使用して明示的に設定するか、テーブルエンジンのプロパティとして暗黙的に設定されます ([ORDER BY](/sql-reference/statements/select/order-by) を使用する場合のみ行の順序が保証され、それ以外の場合はマルチスレッド処理により行ブロックの順序は保証されません) 。その後、ClickHouse は `LIMIT n BY expressions` を適用し、`expressions` のそれぞれ異なる組み合わせごとに先頭の `n` 行を返します。OFFSET が指定されている場合、`expressions` のそれぞれ異なる組み合わせに属する各データブロックについて、ClickHouse はブロック先頭から `offset_value` 行をスキップし、その結果として最大 `n` 行を返します。`offset_value` がデータブロック内の行数より大きい場合、ClickHouse はそのブロックから 0 行を返します。

:::note
`LIMIT BY` は [LIMIT](../../../sql-reference/statements/select/limit.md) とは無関係です。両方を同じクエリ内で使用できます。
:::

`LIMIT BY` 句でカラム名の代わりにカラム番号を使用したい場合は、設定 [enable&#95;positional&#95;arguments](/operations/settings/settings#enable_positional_arguments) を有効にしてください。

## 例 \{#examples\}

サンプルテーブル:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ：

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id;
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
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id;
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

The `SELECT * FROM limit_by ORDER BY id, val LIMIT 2  1 BY id` query returns the same result.

次のクエリは、全体で最大100行 (`LIMIT n BY + LIMIT`) という制限のもとで、各 `domain, device_type` ペアごとに上位5件のリファラーを返します。

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
LIMIT 100;
```

`LIMIT BY` は、負の limit および offset に対しても機能します。[負の LIMIT 句](/sql-reference/statements/select/limit#negative-limits) と同様に、`LIMIT BY` でも負の値を使用して、各グループの*末尾*から行を選択できます。

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT -2 BY id;
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

各 `id` について最後の2行を返します。`id = 1` では `11` と `12` の行が返されます。`id = 2` では、そのグループには2行しかないため、両方の行が返されます。

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT -1 OFFSET -1 BY id;
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  2 │  20 │
└────┴─────┘
```

各 `id` について末尾から2番目の行を返します。末尾の `OFFSET -1` で各グループの最後の行を除外し、その後、先頭の `-1` で残った行の最後の行だけを保持します。

符号の異なる `LIMIT` と `OFFSET` を組み合わせることもできます。たとえば、各グループの先頭行を除外してから、残った行のうち最後の2行を保持するには、次のようにします。

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT -2 OFFSET 1 BY id;
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`id = 1` の場合、最初の行 (`10`) はスキップされ、`11, 12` の最後の 2 行が返されます。`id = 2` の場合、最初の行 (`20`) はスキップされ、`21` のみが残ります。

## LIMIT BY ALL \{#limit-by-all\}

`LIMIT BY ALL` は、集約関数ではない、SELECT で指定したすべての式を列挙するのと同等です。

例:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL;
```

と同じです

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3;
```

集約関数とその他のフィールドの両方を引数に取る関数が存在するという特殊なケースでは、`LIMIT BY` のキーには、その関数から抽出可能な非集約フィールドが可能な限り多く含まれます。

例えば、次のようになります。

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL;
```

と同じです

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2);
```

## 例 \{#examples-limit-by-all\}

サンプルテーブル：

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ：

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id;
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
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id;
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` クエリは、同じ結果を返します。

`LIMIT BY ALL` の使用例:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL;
```

これは次と同等です：

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val;
```