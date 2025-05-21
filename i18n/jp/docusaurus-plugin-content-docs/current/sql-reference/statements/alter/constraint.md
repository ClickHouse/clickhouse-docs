---
description: '制約の操作に関するドキュメント'
sidebar_label: '制約'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: '制約の操作'
---


# 制約の操作

制約は以下の構文を使用して追加または削除できます。

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

[制約についてもっと見る](../../../sql-reference/statements/create/table.md#constraints)。

クエリは、テーブルの制約に関するメタデータを追加または削除するため、即座に処理されます。

:::tip
追加された場合、制約チェックは**既存のデータに対して実行されません**。
:::

レプリケートされたテーブルに対するすべての変更はZooKeeperにブロードキャストされ、他のレプリカにも適用されます。
