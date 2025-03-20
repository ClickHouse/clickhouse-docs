---
slug: /sql-reference/statements/alter/constraint
sidebar_position: 43
sidebar_label: 制約
---


# 制約の操作

制約は、以下の構文を使用して追加または削除できます:

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

制約の詳細については、[制約](../../../sql-reference/statements/create/table.md#constraints)を参照してください。

クエリはテーブルの制約に関するメタデータを追加または削除するため、即座に処理されます。

:::tip
制約チェックは、追加された場合、既存のデータに対して**実行されません**。
:::

複製テーブルに対するすべての変更はZooKeeperにブロードキャストされ、他のレプリカにも適用されます。
