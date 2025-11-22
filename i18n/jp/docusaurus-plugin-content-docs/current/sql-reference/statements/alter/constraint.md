---
description: '制約の操作に関するドキュメント'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: '制約の操作'
doc_type: 'reference'
---

# 制約の操作

制約は次の構文で追加および削除できます：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

[制約](../../../sql-reference/statements/create/table.md#constraints)の詳細については、こちらを参照してください。

クエリはテーブルの制約に関するメタデータを追加または削除するだけなので、即座に処理されます。

:::tip
制約のチェックは、追加された場合でも既存データに対しては**実行されません**。
:::

レプリケートされたテーブルに対するすべての変更は ZooKeeper にブロードキャストされ、他のレプリカにも適用されます。
