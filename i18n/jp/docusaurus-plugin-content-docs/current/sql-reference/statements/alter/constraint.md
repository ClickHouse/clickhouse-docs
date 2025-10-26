---
'description': '制約を操作するためのDocumentation'
'sidebar_label': 'CONSTRAINT'
'sidebar_position': 43
'slug': '/sql-reference/statements/alter/constraint'
'title': '制約を操作する'
'doc_type': 'reference'
---


# 制約の操作

制約は以下の構文を使用して追加または削除できます。

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

制約の詳細については、[constraints](../../../sql-reference/statements/create/table.md#constraints)を参照してください。

クエリはテーブルから制約に関するメタデータを追加または削除するため、即座に処理されます。

:::tip
追加された場合、既存データに対して**制約チェックは実行されません**。
:::

レプリケートされたテーブルのすべての変更はZooKeeperにブロードキャストされ、他のレプリカにも適用されます。
