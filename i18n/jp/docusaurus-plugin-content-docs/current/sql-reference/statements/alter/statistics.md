---
slug: /sql-reference/statements/alter/statistics
sidebar_position: 45
sidebar_label: STATISTICS
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# カラム統計の操作

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

以下の操作が可能です：

- `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - テーブルのメタデータに統計の説明を追加します。

- `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - テーブルのメタデータにある統計の説明を修正します。

- `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 指定されたカラムのメタデータから統計を削除し、指定されたカラムに対するすべてのパーツ内の統計オブジェクトを削除します。

- `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 指定されたカラムに対するすべてのパーツ内の統計オブジェクトを削除します。統計オブジェクトは `ALTER TABLE MATERIALIZE STATISTICS` を使用して再構築できます。

- `ALTER TABLE [db.]table MATERIALIZE STATISTICS [IF EXISTS] (column list)` - カラムのために統計を再構築します。これは [mutation](../../../sql-reference/statements/alter/index.md#mutations) として実装されています。

最初の2つのコマンドは、メタデータを変更するかファイルを削除するだけであるため、ライトウェイトです。

また、これらはレプリケーションされており、ZooKeeperを介して統計メタデータを同期します。

## 例: {#example}

2つのカラムに2種類の統計を追加する：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
統計は [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブル（[レプリケートされた](../../../engines/table-engines/mergetree-family/replication.md) バリアントを含む）のみでサポートされています。
:::
