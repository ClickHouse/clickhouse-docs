---
slug: '/sql-reference/statements/select/union'
sidebar_label: 'UNION'
keywords: ['UNION', 'SQL', 'ClickHouse']
description: 'Learn about the UNION clause in ClickHouse SQL, including usage, examples, and settings.'
---


# UNION句

`UNION`を使用する際は、明示的に`UNION ALL`または`UNION DISTINCT`を指定できます。

`ALL`または`DISTINCT`を指定しない場合、`union_default_mode`の設定に依存します。`UNION ALL`と`UNION DISTINCT`の違いは、`UNION DISTINCT`が結合結果に対して一意の変換を行う点です。これは、`UNION ALL`を含むサブクエリからの`SELECT DISTINCT`と等価です。

`UNION`を使用して、任意の数の`SELECT`クエリを結果に拡張することで結合できます。例:

```sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

結果のカラムは、そのインデックス（`SELECT`内の順序）で一致します。カラム名が一致しない場合、最終結果の名前は最初のクエリから取られます。

結合のために型変換が行われます。たとえば、結合される2つのクエリが互換性のある型の`Nullable`でないフィールドと`Nullable`型を持っている場合、結果の`UNION`は`Nullable`型のフィールドを持ちます。

`UNION`の一部であるクエリは、丸括弧で囲むことができます。[ORDER BY](../../../sql-reference/statements/select/order-by.md)と[LIMIT](../../../sql-reference/statements/select/limit.md)は、最終結果ではなく、個別のクエリに適用されます。最終結果に変換を適用する必要がある場合は、[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリに`UNION`を持つすべてのクエリを置くことができます。

`UNION`を使用して`UNION ALL`または`UNION DISTINCT`を明示的に指定しない場合、[union_default_mode](/operations/settings/settings#union_default_mode)設定を使用して結合モードを指定できます。設定値は`ALL`、`DISTINCT`、または空の文字列です。ただし、`union_default_mode`設定を空の文字列で使用する場合、例外がスローされます。以下の例では、異なる設定値のクエリの結果を示しています。

クエリ:

```sql
SET union_default_mode = 'DISTINCT';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

結果:

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

クエリ:

```sql
SET union_default_mode = 'ALL';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

結果:

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

`UNION/UNION ALL/UNION DISTINCT`の一部であるクエリは同時に実行でき、その結果は混ぜ合わせることができます。

**関連情報**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default)設定。
- [union_default_mode](/operations/settings/settings#union_default_mode)設定。
