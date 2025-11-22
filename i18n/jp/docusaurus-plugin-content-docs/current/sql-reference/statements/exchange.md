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
この操作は、一時的な名前を使った [`RENAME`](./rename.md) クエリでも実行できますが、その場合はアトミックではありません。

:::note\
`EXCHANGE` クエリがサポートされるのは、[`Atomic`](../../engines/database-engines/atomic.md) および [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) データベースエンジンのみです。
:::

**構文**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```


## EXCHANGE TABLES {#exchange-tables}

2つのテーブルの名前を交換します。

**構文**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```


## EXCHANGE DICTIONARIES {#exchange-dictionaries}

2つのディクショナリの名前を交換します。

**構文**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**関連項目**

- [ディクショナリ](../../sql-reference/dictionaries/index.md)
