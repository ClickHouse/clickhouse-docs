---
description: 'UNION句のドキュメント'
sidebar_label: 'UNION'
slug: /sql-reference/statements/select/union
title: 'UNION句'
---


# UNION句

`UNION`は、明示的に`UNION ALL`または`UNION DISTINCT`を指定して使用できます。

`ALL`または`DISTINCT`を指定しない場合は、`union_default_mode`設定に依存します。`UNION ALL`と`UNION DISTINCT`の違いは、`UNION DISTINCT`がユニオン結果に対して重複排除変換を行うことであり、これは`UNION ALL`を含むサブクエリからの`SELECT DISTINCT`と同等です。

`UNION`を使用して、任意の数の`SELECT`クエリを結合することができます。例：

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

結果のカラムは、そのインデックス（`SELECT`内の順序）によって一致します。カラム名が一致しない場合、最終結果の名前は最初のクエリから取得されます。

ユニオンの型変換が行われます。例えば、結合される2つのクエリが互換性のある型の非`Nullable`と`Nullable`型の同じフィールドを持つ場合、結果の`UNION`は`Nullable`型のフィールドを持ちます。

`UNION`の一部であるクエリは、丸括弧で囲むことができます。[ORDER BY](../../../sql-reference/statements/select/order-by.md)および[LIMIT](../../../sql-reference/statements/select/limit.md)は、最終結果ではなく、別々のクエリに適用されます。最終結果に変換を適用する必要がある場合、`UNION`を使用したすべてのクエリを[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリに配置することができます。

`UNION`を使用して`UNION ALL`または`UNION DISTINCT`を明示的に指定しない場合、[union_default_mode](/operations/settings/settings#union_default_mode)設定を使用してユニオンモードを指定できます。設定の値は`ALL`、`DISTINCT`、または空文字列です。ただし、`union_default_mode`設定を空文字列にして`UNION`を使用すると、例外が発生します。以下の例は、異なる値設定のクエリ結果を示しています。

クエリ：

```sql
SET union_default_mode = 'DISTINCT';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

結果：

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

クエリ：

```sql
SET union_default_mode = 'ALL';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

結果：

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

`UNION/UNION ALL/UNION DISTINCT`の一部であるクエリは同時に実行でき、その結果を混合することができます。

**参照**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default)設定。
- [union_default_mode](/operations/settings/settings#union_default_mode)設定。
