---
description: 'EXCHANGE文のドキュメント'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE文'
---


# EXCHANGE文

二つのテーブルまたは辞書の名前を原子的に交換します。
この作業は、一時的な名前を使用した[RENAME](./rename.md)クエリでも達成可能ですが、その場合、操作は原子的ではありません。

:::note    
`EXCHANGE`クエリは、[Atomic](../../engines/database-engines/atomic.md)データベースエンジンのみに対応しています。
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

- [Dictionary](../../sql-reference/dictionaries/index.md)
