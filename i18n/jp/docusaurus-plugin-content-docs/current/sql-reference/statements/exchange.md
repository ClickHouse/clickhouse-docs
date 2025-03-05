---
slug: /sql-reference/statements/exchange
sidebar_position: 49
sidebar_label: EXCHANGE
---


# EXCHANGE ステートメント

二つのテーブルまたは辞書の名前を原子的に交換します。
この処理は、テンポラリ名を使用した [RENAME](./rename.md) クエリで実行することもできますが、その場合は操作が原子的ではありません。

:::note    
`EXCHANGE` クエリは [Atomic](../../engines/database-engines/atomic.md) データベースエンジンでのみサポートされています。
:::

**構文**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

二つのテーブルの名前を交換します。

**構文**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

二つの辞書の名前を交換します。

**構文**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**関連項目**

- [Dictionaries](../../sql-reference/dictionaries/index.md)
