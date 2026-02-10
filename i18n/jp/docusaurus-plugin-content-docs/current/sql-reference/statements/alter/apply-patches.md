---
description: '論理更新から生成されたパッチの適用に関するドキュメント'
sidebar_label: 'APPLY PATCHES'
sidebar_position: 47
slug: /sql-reference/statements/alter/apply-patches
title: '論理更新から生成されたパッチを適用する'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] APPLY PATCHES [IN PARTITION partition_id]
```

このコマンドは、[軽量な `UPDATE`](/sql-reference/statements/update) 文によって作成されたパッチパーツの物理マテリアライズを手動でトリガーします。影響を受けたカラムのみを書き換えることで、保留中のパッチをデータパーツに強制的に適用します。

:::note

* [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルに対してのみ動作します。
* これはミューテーション操作であり、バックグラウンドで非同期に実行されます。
  :::


## APPLY PATCHES を使用するタイミング \{#when-to-use\}

:::tip
通常は `APPLY PATCHES` を使用する必要はありません。
:::

パッチパーツは、[`apply_patches_on_merge`](/operations/settings/merge-tree-settings#apply_patches_on_merge) 設定が有効（デフォルト）の場合、マージ時に自動的に適用されます。ただし、次のようなシナリオではパッチの適用を手動で実行したくなる場合があります。

- `SELECT` クエリ実行時のパッチ適用によるオーバーヘッドを減らしたい場合
- 蓄積する前に複数のパッチパーツを集約したい場合
- すでにパッチがマテリアライズされた状態でバックアップやエクスポートのためにデータを準備したい場合
- `apply_patches_on_merge` が無効で、パッチをいつ適用するかを自分で制御したい場合

## 例 \{#examples\}

テーブルに対する保留中のすべてのパッチを適用する：

```sql
ALTER TABLE my_table APPLY PATCHES;
```

特定のパーティションにのみパッチを適用する:

```sql
ALTER TABLE my_table APPLY PATCHES IN PARTITION '2024-01';
```

他の操作と組み合わせて実行する:

```sql
ALTER TABLE my_table APPLY PATCHES, UPDATE column = value WHERE condition;
```


## パッチ適用の監視 \{#monitor\}

[`system.mutations`](/operations/system-tables/mutations) テーブルを使用して、パッチ適用の進行状況を監視できます。

```sql
SELECT * FROM system.mutations
WHERE table = 'my_table' AND command LIKE '%APPLY PATCHES%';
```


## 関連項目 \{#see-also\}

- [Lightweight `UPDATE`](/sql-reference/statements/update) - 論理更新でパッチ用パーツを作成する
- [`apply_patches_on_merge` setting](/operations/settings/merge-tree-settings#apply_patches_on_merge) - マージ処理中のパッチ自動適用を制御する