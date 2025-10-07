---
'description': 'EXCHANGE ステートメントのドキュメント'
'sidebar_label': 'EXCHANGE'
'sidebar_position': 49
'slug': '/sql-reference/statements/exchange'
'title': 'EXCHANGE ステートメント'
'doc_type': 'reference'
---


# EXCHANGEステートメント

2つのテーブルまたは辞書の名前を原子性で交換します。
この作業は、一時的な名前を使った[`RENAME`](./rename.md)クエリでも実行できますが、その場合、操作は原子性ではありません。

:::note    
`EXCHANGE`クエリは[`Atomic`](../../engines/database-engines/atomic.md)および[`Shared`](/cloud/reference/shared-catalog#shared-database-engine)データベースエンジンのみでサポートされています。
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

**関連情報**

- [Dictionaries](../../sql-reference/dictionaries/index.md)
