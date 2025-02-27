---
slug: /sql-reference/statements/select/union
sidebar_label: UNION
---

# UNION句

`UNION`は、明示的に`UNION ALL`または`UNION DISTINCT`を指定して使用できます。

`ALL` または `DISTINCT` を指定しない場合、`union_default_mode` 設定に依存します。 `UNION ALL` と `UNION DISTINCT` の違いは、`UNION DISTINCT` が結合結果に対して一意の変換を行う点で、これは`UNION ALL`を含むサブクエリからの`SELECT DISTINCT`と同等です。

任意の数の`SELECT`クエリを結果を拡張して結合するために `UNION` を使用できます。例：

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

結果のカラムはそのインデックス（`SELECT`内の順序）によってマッチします。カラム名が一致しない場合、最終結果の名前は最初のクエリから取られます。

ユニオンに対して型キャスティングが行われます。例えば、結合される二つのクエリが互換性のある型からの非`Nullable`と`Nullable`型の同じフィールドを持つ場合、結果的な`UNION`は`Nullable`型のフィールドを持ちます。

`UNION`の一部であるクエリは丸括弧で囲むことができます。[ORDER BY](../../../sql-reference/statements/select/order-by.md)と[LIMIT](../../../sql-reference/statements/select/limit.md)は、最終結果ではなく、個々のクエリに適用されます。最終結果に変換を適用する必要がある場合は、すべてのクエリを`UNION`でサブクエリとして[FROM](../../../sql-reference/statements/select/from.md)句に置くことができます。

`UNION`を明示的に`UNION ALL`または`UNION DISTINCT`を指定せずに使用する場合、[union_default_mode](../../../operations/settings/settings.md#union-default-mode)設定を使用してユニオンモードを指定できます。設定値は`ALL`、`DISTINCT`、または空文字列にできます。ただし、`union_default_mode`設定を空文字列に設定して`UNION`を使用すると例外が発生します。以下の例は、異なる設定値によるクエリの結果を示しています。

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

`UNION/UNION ALL/UNION DISTINCT`の一部であるクエリは同時に実行でき、それらの結果は混合できます。

**参照**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 設定。
- [union_default_mode](../../../operations/settings/settings.md#union-default-mode) 設定。
