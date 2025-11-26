---
description: 'EXCHANGE ステートメントのドキュメント'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE ステートメント'
doc_type: 'reference'
---



# EXCHANGE ステートメント

2 つのテーブルまたはディクショナリの名前をアトミックに入れ替えます。
この処理は一時的な名前を利用した [`RENAME`](./rename.md) クエリでも実現できますが、その場合はアトミックな操作にはなりません。

:::note\
`EXCHANGE` クエリは、[`Atomic`](../../engines/database-engines/atomic.md) および [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) データベースエンジンでのみサポートされています。
:::

**構文**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```


## テーブルの入れ替え

2つのテーブルの名前を入れ替えます。

**構文**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```


## EXCHANGE DICTIONARIES

2 つの辞書の名前を入れ替えます。

**構文**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**関連項目**

* [辞書](../../sql-reference/dictionaries/index.md)
