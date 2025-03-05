---
slug: /sql-reference/statements/select/union
sidebar_label: UNION
---


# UNION 句

`UNION` は `UNION ALL` または `UNION DISTINCT` を明示的に指定して使用できます。

`ALL` または `DISTINCT` を指定しない場合、`union_default_mode` 設定に依存します。`UNION ALL` と `UNION DISTINCT` の違いは、`UNION DISTINCT` が結合結果に対して重複排除を行うことであり、これは `UNION ALL` を含むサブクエリからの `SELECT DISTINCT` に相当します。

`UNION` を使用して、任意の数の `SELECT` クエリを結果を拡張して結合できます。例:

``` sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

結果のカラムはそのインデックス（`SELECT` 内の順序）によって一致します。カラム名が一致しない場合、最終結果の名前は最初のクエリから取得されます。

結合に対して型キャストが行われます。たとえば、結合される二つのクエリが互換性のある型の非 `Nullable` 型および `Nullable` 型を持つ同じフィールドを持っている場合、結果の `UNION` には `Nullable` 型のフィールドが含まれます。

`UNION` の部分であるクエリは丸括弧で囲むこともできます。[ORDER BY](../../../sql-reference/statements/select/order-by.md) および [LIMIT](../../../sql-reference/statements/select/limit.md) は別々のクエリに適用され、最終結果には適用されません。最終結果に変換を適用する必要がある場合、すべてのクエリを `UNION` で [FROM](../../../sql-reference/statements/select/from.md) 句内のサブクエリに配置できます。

`UNION` を使用して `UNION ALL` または `UNION DISTINCT` を明示的に指定しない場合、[union_default_mode](../../../operations/settings/settings.md#union-default-mode) 設定を使用して結合モードを指定できます。設定値は `ALL`、`DISTINCT` もしくは空の文字列にすることができます。しかし、`union_default_mode` 設定を空の文字列で `UNION` を使用する場合、例外がスローされます。以下の例は、異なる設定値を持つクエリの結果を示しています。

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

`UNION/UNION ALL/UNION DISTINCT` の部分であるクエリは同時に実行可能であり、それらの結果を混ぜ合わせることができます。

**関連情報**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 設定。
- [union_default_mode](../../../operations/settings/settings.md#union-default-mode) 設定。
