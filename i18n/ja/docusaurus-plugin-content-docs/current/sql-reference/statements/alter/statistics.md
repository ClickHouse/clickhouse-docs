---
slug: /sql-reference/statements/alter/statistics
sidebar_position: 45
sidebar_label: 統計情報
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# カラム統計の操作

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

以下の操作が利用可能です：

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (カラムリスト) TYPE (タイプリスト)` - テーブルのメタデータに統計の説明を追加します。

-   `ALTER TABLE [db].table MODIFY STATISTICS (カラムリスト) TYPE (タイプリスト)` - テーブルのメタデータに統計の説明を修正します。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (カラムリスト)` - 指定されたカラムのメタデータから統計を削除し、指定されたカラムのすべてのパーツにおけるすべての統計オブジェクトを削除します。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (カラムリスト)` - 指定されたカラムのすべてのパーツにおけるすべての統計オブジェクトを削除します。統計オブジェクトは `ALTER TABLE MATERIALIZE STATISTICS` を使用して再構築できます。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS [IF EXISTS] (カラムリスト)` - カラムの統計を再構築します。これは [ミューテーション](../../../sql-reference/statements/alter/index.md#mutations)として実装されています。

最初の二つのコマンドは、メタデータを変更するかファイルを削除するだけなので、軽量です。

また、ZooKeeperを介して統計メタデータを同期するため、レプリケーションされています。

## 例: {#example}

2つのカラムに2つの統計タイプを追加する：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
統計は [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブル（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md)バリエーションを含む）でのみサポートされています。
:::
