---
'description': 'Documentation for Manipulating Constraints'
'sidebar_label': 'CONSTRAINT'
'sidebar_position': 43
'slug': '/sql-reference/statements/alter/constraint'
'title': 'Manipulating Constraints'
---




# 制約の操作

制約は次の構文を使用して追加または削除できます：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

制約の詳細については、[constraints](../../../sql-reference/statements/create/table.md#constraints)を参照してください。

クエリはテーブルの制約に関するメタデータを追加または削除するため、すぐに処理されます。

:::tip
追加された場合、制約チェックは**既存のデータに対して実行されません**。
:::

レプリケートされたテーブルのすべての変更はZooKeeperにブロードキャストされ、他のレプリカにも適用されます。
