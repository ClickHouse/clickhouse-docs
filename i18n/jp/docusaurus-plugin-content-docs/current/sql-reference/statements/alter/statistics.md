---
description: 'カラム統計の操作方法に関するドキュメント'
sidebar_label: '統計'
sidebar_position: 45
slug: /sql-reference/statements/alter/statistics
title: 'カラム統計の操作'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 列統計の操作

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

利用可能な操作は次のとおりです。

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - テーブルのメタデータに統計の定義を追加します。

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - テーブルのメタデータ内の統計の定義を変更します。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 指定した列のメタデータから統計を削除し、指定した列について全パーツに存在する統計オブジェクトをすべて削除します。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 指定した列について全パーツに存在する統計オブジェクトをすべて削除します。統計オブジェクトは `ALTER TABLE MATERIALIZE STATISTICS` を使用して再構築できます。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - 列の統計を再構築します。[mutation](../../../sql-reference/statements/alter/index.md#mutations) として実装されています。 

最初の 2 つのコマンドは、メタデータの変更またはファイルの削除のみを行うという点で軽量です。

さらに、これらはレプリケートされており、ZooKeeper を介して統計メタデータを同期します。



## Example: {#example}

2つの列に2つの統計タイプを追加する：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
統計は[`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブル（[レプリケート版](../../../engines/table-engines/mergetree-family/replication.md)を含む）でのみサポートされています。
:::
