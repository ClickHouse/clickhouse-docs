---
slug: /sql-reference/statements/select/limit-by
sidebar_label: LIMIT BY
---

# LIMIT BY 句

`LIMIT n BY expressions` 句を持つクエリは、各異なる `expressions` の値について最初の `n` 行を選択します。`LIMIT BY` のキーには、任意の数の [expressions](../../../sql-reference/syntax.md#syntax-expressions) を含めることができます。

ClickHouse は以下の構文バリエーションをサポートしています：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

クエリ処理中、ClickHouse はソートキーによって順序付けられたデータを選択します。ソートキーは、[ORDER BY](order-by.md#select-order-by) 句を使用して明示的に設定するか、テーブルエンジンのプロパティとして暗黙的に設定されます（[ORDER BY](order-by.md#select-order-by) を使用する場合にのみ行の順序が保証されます。それ以外の場合、マルチスレッドにより行のブロックは順序付けられません）。その後、ClickHouse は `LIMIT n BY expressions` を適用し、各異なる `expressions` の組み合わせに対して最初の `n` 行を返します。`OFFSET` が指定されている場合、異なる `expressions` の組み合わせに属するデータブロックについて、ClickHouse はブロックの最初から `offset_value` 行をスキップし、結果として最大 `n` 行を返します。`offset_value` がデータブロックの行数よりも大きい場合、ClickHouse はブロックから行を返しません。

:::note    
`LIMIT BY` は [LIMIT](../../../sql-reference/statements/select/limit.md) とは関係ありません。両方とも同じクエリで使用することができます。
:::

`LIMIT BY` 句で列名の代わりに列番号を使用したい場合は、設定 [enable_positional_arguments](../../../operations/settings/settings.md#enable-positional-arguments) を有効にしてください。	
	

## 例 {#examples}

サンプルテーブル：

``` sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

クエリ：

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

次のクエリは、各 `domain, device_type` ペアに対して最大 100 行の合計でトップ 5 のリファラーを返します（`LIMIT n BY + LIMIT` を使用）。

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
