---
description: '列統計の操作方法に関するドキュメント'
sidebar_label: '統計'
sidebar_position: 45
slug: /sql-reference/statements/alter/statistics
title: '列統計の操作'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 列統計の操作 \{#manipulating-column-statistics\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

次の操作が使用できます。

* `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 統計定義をテーブルのメタデータに追加します。

* `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 統計定義をテーブルのメタデータ上で変更します。

* `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 指定した列のメタデータから統計を削除し、指定した列について、すべてのパーツに存在する統計オブジェクトを削除します。

* `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 指定した列について、すべてのパーツに存在する統計オブジェクトを削除します。統計オブジェクトは `ALTER TABLE MATERIALIZE STATISTICS` を使用して再構築できます。

* `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - 列の統計を再構築します。[ミューテーション](../../../sql-reference/statements/alter/index.md#mutations)として実装されています。

最初の 2 つのコマンドは、メタデータの変更またはファイルの削除だけを行う、軽量な操作です。

また、これらの操作はレプリケートされ、ZooKeeper を介して統計メタデータを同期します。

## 例： \{#example\}

2 種類の統計タイプを 2 つの列に追加する：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
統計情報は、[`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブル（[レプリケーション](../../../engines/table-engines/mergetree-family/replication.md)バリアントを含む）でのみサポートされています。
:::
