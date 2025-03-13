---
slug: /sql-reference/statements/exchange
sidebar_position: 49
sidebar_label: EXCHANGE
---


# EXCHANGE 语句

原子性地交换两个表或字典的名称。  
这个任务也可以通过使用临时名称的 [RENAME](./rename.md) 查询来完成，但在这种情况下，操作不是原子性的。

:::note    
`EXCHANGE` 查询仅由 [Atomic](../../engines/database-engines/atomic.md) 数据库引擎支持。
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
