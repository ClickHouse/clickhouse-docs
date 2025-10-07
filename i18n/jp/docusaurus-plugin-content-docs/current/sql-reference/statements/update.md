---
'description': '軽量更新は、パッチパーツを使用してデータベース内のデータを更新するプロセスを簡素化します。'
'keywords':
- 'update'
'sidebar_label': 'UPDATE'
'sidebar_position': 39
'slug': '/sql-reference/statements/update'
'title': '軽量更新ステートメント'
'doc_type': 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

:::note
軽量更新は現在ベータ版です。
問題が発生した場合は、[ClickHouseリポジトリ](https://github.com/clickhouse/clickhouse/issues)で問題を報告してください。
:::

軽量の `UPDATE` ステートメントは、式 `filter_expr` に一致するテーブル `[db.]table` の行を更新します。
これは、データパーツの全列を書き換える重いプロセスである [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) クエリと対比するために「軽量更新」と呼ばれています。
これは、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) テーブルエンジンファミリーでのみ利用可能です。

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` は `UInt8` 型でなければなりません。このクエリは、`filter_expr` がゼロでない値を取る行の指定されたカラムの値を、対応する式の値に更新します。
値は `CAST` 演算子を使用してカラム型にキャストされます。主キーまたはパーティションキーの計算に使用されるカラムの更新はサポートされていません。

## 例 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```

## 軽量更新はデータを即座には更新しない {#lightweight-update-does-not-update-data-immediately}

軽量 `UPDATE` は **パッチパーツ** - 更新されたカラムと行のみを含む特別なデータパートを使用して実装されています。
軽量 `UPDATE` はパッチパーツを作成しますが、ストレージ内の元のデータを物理的に即座には変更しません。
更新プロセスは `INSERT ... SELECT ...` クエリに似ていますが、`UPDATE` クエリはパッチパートの作成が完了するまで待機します。

更新された値は次の通りです：
- **即座に可視化** される `SELECT` クエリを通じてパッチの適用によって
- **物理的にマテリアライズ** されるのは、その後のマージやミューテーションの際のみです
- **自動的にクリーンアップ** されるのは、すべてのアクティブパーツがパッチをマテリアライズした後です

## 軽量更新の要件 {#lightweight-update-requirements}

軽量更新は、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)、[`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree)、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) エンジンおよびそれらの [`Replicated`](/engines/table-engines/mergetree-family/replication.md) と [`Shared`](/cloud/reference/shared-merge-tree) バージョンでサポートされています。

軽量更新を使用するには、テーブル設定 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) と [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column) を使用して、`_block_number` と `_block_offset` カラムのマテリアライズを有効にする必要があります。

## 軽量削除 {#lightweight-delete}

[軽量 `DELETE`](/sql-reference/statements/delete) クエリは、`ALTER UPDATE` ミューテーションの代わりに軽量 `UPDATE` として実行できます。軽量 `DELETE` の実装は、設定 [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) によって制御されます。

## パフォーマンスの考慮事項 {#performance-considerations}

**軽量更新の利点：**
- 更新のレイテンシは、`INSERT ... SELECT ...` クエリのレイテンシと同程度です
- 更新されるのは更新されたカラムと値のみで、データパーツ全体が書き込まれません
- 現在実行中のマージやミューテーションの完了を待つ必要がないため、更新のレイテンシは予測可能です
- 軽量更新の並行実行が可能です

**潜在的なパフォーマンスへの影響：**
- パッチを適用する必要がある `SELECT` クエリにオーバーヘッドが追加されます
- [スキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes) は、パッチが適用されるデータパーツのカラムには使用されません。[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections) は、パッチが適用されるデータパーツを含むテーブルにパッチパーツが存在する場合には使用されません。
- あまりにも頻繁すぎる小さな更新は、「パーツが多すぎる」というエラーにつながる可能性があります。例えば、複数の更新を単一のクエリにバッチ処理することをお勧めします。つまり、更新するためのIDを `WHERE` 句の単一の `IN` 句に入れることです。
- 軽量更新は、少量の行（テーブルの約10％まで）を更新するために設計されています。より多くを更新する必要がある場合は、[`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) ミューテーションの使用をお勧めします。

## 同時操作 {#concurrent-operations}

軽量更新は、重いミューテーションとは異なり、現在実行中のマージやミューテーションの完了を待ちません。
同時軽量更新の整合性は、設定 [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) と [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode) によって制御されます。

## 更新権限 {#update-permissions}

`UPDATE` には `ALTER UPDATE` 権限が必要です。特定のテーブルに対する特定のユーザーの `UPDATE` ステートメントを有効にするには、次のコマンドを実行します：

```sql
GRANT ALTER UPDATE ON db.table TO username;
```

## 実装の詳細 {#details-of-the-implementation}

パッチパーツは通常のパーツと同じですが、更新されたカラムといくつかのシステムカラムのみを含みます：
- `_part` - 元のパーツ名
- `_part_offset` - 元のパーツ内の行番号
- `_block_number` - 元のパーツ内の行のブロック番号
- `_block_offset` - 元のパーツ内の行のブロックオフセット
- `_data_version` - 更新されたデータのデータバージョン（`UPDATE` クエリのために割り当てられたブロック番号）

平均して、パッチパーツの各更新行には約40バイト（非圧縮データ）のオーバーヘッドがかかります。
システムカラムは、更新すべき元のパーツ内の行を見つけるのに役立ちます。
システムカラムは、パッチパーツが適用されるべき場合に読み取りのために追加される元のパーツの[仮想カラム](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)に関連しています。
パッチパーツは、`_part` と `_part_offset` によってソートされます。

パッチパーツは元のパーツとは異なるパーティションに属します。
パッチパーツのパーティションIDは `patch-<patchパーツのカラム名のハッシュ>-<original_partition_id>` です。
したがって、異なるカラムを持つパッチパーツは、異なるパーティションに格納されます。
例えば、三つの更新 `SET x = 1 WHERE <cond>`、`SET y = 1 WHERE <cond>`、`SET x = 1, y = 1 WHERE <cond>` は、三つの異なるパーティションに三つのパッチパーツを作成します。

パッチパーツは、お互いにマージ可能で、`SELECT` クエリにおける適用されたパッチの数を減らし、オーバーヘッドを減少させます。パッチパーツのマージは、`_data_version` をバージョンカラムとして使用した[置換](/engines/table-engines/mergetree-family/replacingmergetree)マージアルゴリズムを使用します。
そのため、パッチパーツは常に部分内の各更新行の最新バージョンを保存します。

軽量更新は、現在実行中のマージやミューテーションが完了するのを待たず、常にデータパーツの現在のスナップショットを使用して更新を実行し、パッチパーツを生成します。
そのため、パッチパーツを適用する場合に二つのケースが考えられます。

例えば、部分 `A` を読み取り、そのパッチ部分 `X` を適用する必要がある場合：
- `X` が `A` 自身を含む場合。`UPDATE` が実行されたときに `A` がマージに参加していなかった場合に発生します。
- `X` が `B` と `C` を含み、これらが部分 `A` にカバーされている場合。`UPDATE` が実行されたときにマージ（`B`、`C`）-> `A` が実行中だった場合に発生します。

これら二つのケースに対して、それぞれパッチパーツを適用する二つの方法があります：
- ソートされたカラム `_part`、`_part_offset` によるマージを使用します。
- `_block_number`、`_block_offset` カラムによるジョインを使用します。

ジョインモードはマージモードよりも遅く、より多くのメモリを必要としますが、あまり頻繁には使用されません。

## 関連コンテンツ {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 重い `UPDATE` 操作
- [軽量 `DELETE`](/sql-reference/statements/delete) - 軽量 `DELETE` 操作
