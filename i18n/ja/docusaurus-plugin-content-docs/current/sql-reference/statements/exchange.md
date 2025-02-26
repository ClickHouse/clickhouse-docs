---
slug: /sql-reference/statements/exchange
sidebar_position: 49
sidebar_label: EXCHANGE
---

# EXCHANGEステートメント

2つのテーブルまたは辞書の名前をアトミックに交換します。
このタスクは、一時的な名前を使用して[RENAME](./rename.md)クエリでも実行できますが、その場合、操作はアトミックではありません。

:::note    
`EXCHANGE`クエリは、[Atomic](../../engines/database-engines/atomic.md)データベースエンジンのみでサポートされています。
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

2つの辞書の名前を交換します。

**構文**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**関連項目**

- [辞書](../../sql-reference/dictionaries/index.md)
