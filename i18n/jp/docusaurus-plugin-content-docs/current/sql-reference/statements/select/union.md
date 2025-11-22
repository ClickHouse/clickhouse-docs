---
description: 'UNION 句に関するドキュメント'
sidebar_label: 'UNION'
slug: /sql-reference/statements/select/union
title: 'UNION 句'
doc_type: 'reference'
---

# UNION 句

`UNION ALL` または `UNION DISTINCT` を明示的に指定して `UNION` を使用できます。

`ALL` または `DISTINCT` を指定しない場合は、`union_default_mode` 設定の値に依存します。`UNION ALL` と `UNION DISTINCT` の違いは、`UNION DISTINCT` が UNION の結果に対して重複行を取り除く変換を行う点であり、`UNION ALL` を含むサブクエリに対する `SELECT DISTINCT` と同等です。

`UNION` を使用して、結果セットを縦方向に連結することで、任意個数の `SELECT` クエリを結合できます。例:

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

結果の列はそのインデックス（`SELECT` 内での順序）によって対応付けられます。列名が一致しない場合、最終結果の列名は最初のクエリから取得されます。

`UNION` に対しては型変換が行われます。例えば、結合される 2 つのクエリにおいて、互換性のある型で同じフィールドが一方では非 `Nullable` 型、もう一方では `Nullable` 型である場合、結果の `UNION` ではそのフィールドは `Nullable` 型になります。

`UNION` の一部であるクエリは丸括弧で囲むことができます。[ORDER BY](../../../sql-reference/statements/select/order-by.md) と [LIMIT](../../../sql-reference/statements/select/limit.md) は、最終結果ではなく個々のクエリに適用されます。最終結果に対して変換を適用する必要がある場合は、`UNION` を用いたすべてのクエリを [FROM](../../../sql-reference/statements/select/from.md) 句内のサブクエリに入れることができます。

`UNION ALL` または `UNION DISTINCT` を明示的に指定せずに `UNION` を使用する場合、[union&#95;default&#95;mode](/operations/settings/settings#union_default_mode) 設定を使用して UNION のモードを指定できます。設定値には `ALL`、`DISTINCT`、または空文字列を指定できます。しかし、`union_default_mode` 設定を空文字列にして `UNION` を使用すると、例外がスローされます。次の例は、異なる設定値を用いたクエリの結果を示します。

クエリ：

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

`UNION/UNION ALL/UNION DISTINCT` を構成するクエリは同時に実行でき、その結果は1つの結果セットとして統合されます。

**関連項目**

* [insert&#95;null&#95;as&#95;default](../../../operations/settings/settings.md#insert_null_as_default) 設定。
* [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode) 設定。
