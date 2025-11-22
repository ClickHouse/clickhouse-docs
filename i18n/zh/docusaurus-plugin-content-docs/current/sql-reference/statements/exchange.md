---
description: 'EXCHANGE 语句文档'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE 语句'
doc_type: 'reference'
---



# EXCHANGE 语句

以原子性方式交换两个表或字典的名称。
也可以使用带有临时名称的 [`RENAME`](./rename.md) 查询来完成此任务，但在这种情况下，该操作不具有原子性。

:::note\
`EXCHANGE` 查询仅受 [`Atomic`](../../engines/database-engines/atomic.md) 和 [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) 数据库引擎支持。
:::

**语法**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```


## EXCHANGE TABLES {#exchange-tables}

交换两个表的名称。

**语法**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```


## EXCHANGE DICTIONARIES {#exchange-dictionaries}

交换两个字典的名称。

**语法**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**另请参阅**

- [字典](../../sql-reference/dictionaries/index.md)
