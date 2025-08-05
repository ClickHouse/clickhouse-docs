---
description: 'Documentation for EXCHANGE Statement'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: '/sql-reference/statements/exchange'
title: 'EXCHANGE Statement'
---




# EXCHANGE文

2つのテーブルまたはディクショナリの名前を原子性を持って交換します。  
このタスクは一時的な名前を使用して[RENAME](./rename.md) クエリでも実行できますが、その場合は操作は原子性を持ちません。

:::note  
`EXCHANGE` クエリは、[Atomic](../../engines/database-engines/atomic.md) データベースエンジンのみでサポートされています。  
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

- [Dictionaries](../../sql-reference/dictionaries/index.md)
