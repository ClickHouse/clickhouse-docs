
# RENAME 语句

重命名数据库、表或字典。在单个查询中可以重命名多个实体。
请注意，带有多个实体的 `RENAME` 查询是非原子操作。要原子地交换实体名称，请使用 [EXCHANGE](./exchange.md) 语句。

**语法**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] name TO new_name [,...] [ON CLUSTER cluster]
```

## RENAME DATABASE {#rename-database}

重命名数据库。

**语法**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```

## RENAME TABLE {#rename-table}

重命名一个或多个表。

重命名表是一个轻量级操作。如果在 `TO` 后面传递了不同的数据库，表将被移动到该数据库。但是，数据库目录必须位于同一文件系统中。否则，将返回错误。
如果您在一个查询中重命名多个表，则该操作不是原子性的。它可能会部分执行，其他会话中的查询可能会出现 `Table ... does not exist ...` 错误。

**语法**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**示例**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

您可以使用更简单的 SQL:  
```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

重命名一个或多个字典。此查询可用于在数据库之间移动字典。

**语法**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**另请查看**

- [字典](../../sql-reference/dictionaries/index.md)
