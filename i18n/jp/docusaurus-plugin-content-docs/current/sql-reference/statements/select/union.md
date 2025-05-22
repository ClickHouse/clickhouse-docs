---
'description': 'Documentation for UNION Clause'
'sidebar_label': 'UNION'
'slug': '/sql-reference/statements/select/union'
'title': 'UNION Clause'
---




# UNION 句

`UNION` を使用する際、明示的に `UNION ALL` または `UNION DISTINCT` を指定できます。

`ALL` または `DISTINCT` を指定しない場合、`union_default_mode` 設定に依存します。 `UNION ALL` と `UNION DISTINCT` の違いは、`UNION DISTINCT` が結合結果に対して一意な変換を行うことであり、これは `UNION ALL` を含むサブクエリからの `SELECT DISTINCT` と同等です。

任意の数の `SELECT` クエリを結合するために `UNION` を使用できます。例:

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

結果のカラムは、そのインデックス（`SELECT` 内の順序）によって一致します。カラム名が一致しない場合、最終結果の名前は最初のクエリから取得されます。

クラスタリングに対して型変換が行われます。たとえば、結合する二つのクエリが互換性のある型の非 `Nullable` 及び `Nullable` タイプを持つ同じフィールドを持つ場合、結果の `UNION` は `Nullable` タイプのフィールドになります。

`UNION` の一部であるクエリは丸括弧で囲むことができます。[ORDER BY](../../../sql-reference/statements/select/order-by.md) と [LIMIT](../../../sql-reference/statements/select/limit.md) は個別のクエリに適用され、最終結果には適用されません。最終結果に変換を適用する必要がある場合は、すべてのクエリを `UNION` でサブクエリに入れ、[FROM](../../../sql-reference/statements/select/from.md) 句内に配置できます。

`UNION` を使用して明示的に `UNION ALL` または `UNION DISTINCT` を指定しなかった場合、[union_default_mode](/operations/settings/settings#union_default_mode) 設定を使用して結合モードを指定できます。設定値は `ALL`、`DISTINCT`、または空文字列を指定できます。ただし、`union_default_mode` 設定が空文字列で `UNION` を使用すると例外がスローされます。次の例は、異なる値の設定に対するクエリの結果を示します。

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

`UNION/UNION ALL/UNION DISTINCT` の一部であるクエリは同時に実行でき、それらの結果を混ぜ合わせることができます。

**関連情報**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 設定。
- [union_default_mode](/operations/settings/settings#union_default_mode) 設定。
