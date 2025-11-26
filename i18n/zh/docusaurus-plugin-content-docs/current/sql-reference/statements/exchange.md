---
description: 'EXCHANGE 语句文档'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE 语句'
doc_type: 'reference'
---



# EXCHANGE 语句

以原子方式交换两个表或字典的名称。
也可以通过先使用临时名称的 [`RENAME`](./rename.md) 查询来完成此操作，但在这种情况下操作不是原子的。

:::note\
`EXCHANGE` 查询仅在 [`Atomic`](../../engines/database-engines/atomic.md) 和 [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) 数据库引擎中受支持。
:::

**语法**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```


## EXCHANGE TABLES

互换两个表的名称。

**语法**

```sql
交换表 [db0.]table_A 和 [db1.]table_B [在集群 cluster 上]
```


## EXCHANGE DICTIONARIES

交换两个字典的名称。

**语法**

```sql
交换字典 [db0.]dict_A 和 [db1.]dict_B [ON CLUSTER cluster]
```

**另请参阅**

* [字典](../../sql-reference/dictionaries/index.md)
