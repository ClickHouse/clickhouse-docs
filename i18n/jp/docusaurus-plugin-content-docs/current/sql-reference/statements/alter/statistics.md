---
'description': 'Manipulating Column Statistics に関するドキュメント'
'sidebar_label': 'STATISTICS'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/statistics'
'title': 'カラム統計の操作'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# カラム統計の操作

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

次の操作が利用可能です：

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - テーブルメタデータに統計の説明を追加します。

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - テーブルメタデータの統計の説明を修正します。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 指定されたカラムのメタデータから統計を削除し、指定されたカラムのすべてのパーツの統計オブジェクトを削除します。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 指定されたカラムのすべてのパーツの統計オブジェクトを削除します。統計オブジェクトは `ALTER TABLE MATERIALIZE STATISTICS` を使用して再構築できます。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - カラムの統計を再構築します。これは [ミューテーション](../../../sql-reference/statements/alter/index.md#mutations)として実装されています。

最初の2つのコマンドは、メタデータを変更するかファイルを削除するだけの軽量な操作です。

また、これらはレプリケーションされ、ZooKeeperを介して統計メタデータが同期されます。

## 例: {#example}

2つのカラムに2種類の統計を追加する：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
統計は、[`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) エンジンテーブル（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md) バリアントを含む）にのみサポートされています。
:::
