---
'description': 'UNION 句に関するドキュメント'
'sidebar_label': 'UNION'
'slug': '/sql-reference/statements/select/union'
'title': 'UNION 句'
'doc_type': 'reference'
---


# UNION句

`UNION`は、`UNION ALL`または`UNION DISTINCT`を明示的に指定する形で使用できます。

`ALL`または`DISTINCT`を指定しない場合、`union_default_mode`設定に依存します。`UNION ALL`と`UNION DISTINCT`の違いは、`UNION DISTINCT`が結合結果の重複排除を行うことであり、これは`UNION ALL`を含むサブクエリから`SELECT DISTINCT`を実行することと等価です。

`UNION`を使用すると、結果を拡張することで任意の数の`SELECT`クエリを結合できます。例:

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

結果のカラムはそのインデックス（`SELECT`内の順序）によって一致します。カラム名が一致しない場合、最終結果の名前は最初のクエリから取られます。

結合のために型変換が行われます。例えば、結合される2つのクエリが同じフィールドを持ち、互換性のある型の非Nullable型とNullable型の場合、結果の`UNION`はNullable型のフィールドを持つことになります。

`UNION`の一部となるクエリは丸括弧で囲むことができます。[ORDER BY](../../../sql-reference/statements/select/order-by.md)および[LIMIT](../../../sql-reference/statements/select/limit.md)は別々のクエリに適用され、最終結果には適用されません。最終結果に変換を適用する必要がある場合、`UNION`を含むすべてのクエリを[FROM](../../../sql-reference/statements/select/from.md)句内のサブクエリに入れることができます。

`UNION`を使用して`UNION ALL`または`UNION DISTINCT`を明示的に指定しない場合、[union_default_mode](/operations/settings/settings#union_default_mode)設定を使用して結合モードを指定できます。設定値は`ALL`、`DISTINCT`、または空の文字列にできます。ただし、`union_default_mode`設定を空の文字列で`UNION`を使用すると、例外が発生します。以下の例は、異なる値の設定のクエリ結果を示します。

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

`UNION/UNION ALL/UNION DISTINCT`の一部となるクエリは同時に実行でき、その結果は混ぜ合わせることができます。

**関連項目**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default)設定。
- [union_default_mode](/operations/settings/settings#union_default_mode)設定。
