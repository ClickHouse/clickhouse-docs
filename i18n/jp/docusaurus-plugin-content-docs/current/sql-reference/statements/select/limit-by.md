---
'description': 'LIMIT BY 句に関するドキュメント'
'sidebar_label': 'LIMIT BY'
'slug': '/sql-reference/statements/select/limit-by'
'title': 'LIMIT BY 句'
'doc_type': 'reference'
---


# LIMIT BY 句

`LIMIT n BY expressions` 句を使用したクエリは、各異なる値の `expressions` に対して最初の `n` 行を選択します。`LIMIT BY` のキーには任意の数の [expressions](/sql-reference/syntax#expressions) を含めることができます。

ClickHouse は以下の構文のバリエーションをサポートしています：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

クエリ処理中、ClickHouse はソートキーによって順序付けられたデータを選択します。ソートキーは、[ORDER BY](/sql-reference/statements/select/order-by) 句を使用して明示的に設定するか、テーブルエンジンのプロパティとして暗黙的に設定されます（[ORDER BY](/sql-reference/statements/select/order-by) を使用している場合のみ行の順序が保証され、そうでない場合はマルチスレッド処理のため行ブロックの順序は保証されません）。その後、ClickHouse は `LIMIT n BY expressions` を適用し、各異なる `expressions` の組み合わせに対して最初の `n` 行を返します。`OFFSET` が指定されている場合、各異なる `expressions` の組み合わせに属するデータブロックについて、ClickHouse はブロックの先頭から `offset_value` 行をスキップし、結果として最大 `n` 行を返します。`offset_value` がデータブロック内の行数より大きい場合、ClickHouse はブロックからゼロ行を返します。

:::note    
`LIMIT BY` は [LIMIT](../../../sql-reference/statements/select/limit.md) と関連していません。両方を同じクエリで使用することができます。
:::

`LIMIT BY` 句でカラム名の代わりにカラム番号を使用したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にします。  

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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` クエリは同じ結果を返します。

次のクエリは、最大 100 行で各 `domain, device_type` ペアの上位 5 件のリファラーを返します（`LIMIT n BY + LIMIT`）。

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
