---
description: '軽量更新により、パッチパーツを使用してデータベース内のデータを更新する処理が簡素化されます。'
keywords: ['update']
sidebar_label: 'UPDATE'
sidebar_position: 39
slug: /sql-reference/statements/update
title: '軽量 UPDATE ステートメント'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
Lightweight update は現在ベータ版です。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues) に issue を作成してください。
:::

lightweight な `UPDATE` ステートメントは、`filter_expr` という式に一致するテーブル `[db.]table` 内の行を更新します。
このステートメントは、データパーツ内の列全体を書き換える重量級の処理である [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) クエリと対比して「lightweight update」と呼ばれます。
これは [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) テーブルエンジンファミリーでのみ利用可能です。

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` は `UInt8` 型でなければなりません。このクエリは、`filter_expr` が非ゼロの値を取る行について、指定された列の値を対応する式の評価結果に更新します。
値は `CAST` 演算子を使用して列の型にキャストされます。プライマリキーまたはパーティションキーの計算に使用されている列の更新はサポートされていません。

## 例 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```

## 軽量な更新はデータを即時には更新しない {#lightweight-update-does-not-update-data-immediately}

軽量な `UPDATE` は **パッチパーツ (patch parts)** を用いて実装されています。パッチパーツは、更新対象の列と行のみを含む特殊な種類のデータパーツです。
軽量な `UPDATE` はパッチパーツを作成しますが、ストレージ上の元のデータはすぐに物理的に書き換えられるわけではありません。
更新処理は `INSERT ... SELECT ...` クエリに似ていますが、`UPDATE` クエリはパッチパーツの作成が完了するまで待機してから結果を返します。

更新された値は次のとおりです:
- パッチの適用により `SELECT` クエリで**即座に参照可能**になります
- 後続のマージおよびミューテーション時にのみ**物理的にマテリアライズ**されます
- すべてのアクティブなパーツでパッチがマテリアライズされると**自動的にクリーンアップ**されます

## 軽量アップデートの要件 {#lightweight-update-requirements}

軽量アップデートは、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)、[`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree)、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) エンジンおよびそれらの [`Replicated`](/engines/table-engines/mergetree-family/replication.md) と [`Shared`](/cloud/reference/shared-merge-tree) バージョンでサポートされています。

軽量アップデートを使用するには、テーブル設定 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) および [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column) により `_block_number` および `_block_offset` カラムのマテリアライズを有効にする必要があります。

## 軽量な削除 {#lightweight-delete}

[軽量な `DELETE`](/sql-reference/statements/delete) クエリは、`ALTER UPDATE` ミューテーションではなく、軽量な `UPDATE` として実行できます。軽量な `DELETE` の実装は、[`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) の設定によって制御されます。

## パフォーマンスに関する考慮事項 {#performance-considerations}

**軽量アップデートの利点:**
- アップデートのレイテンシは、`INSERT ... SELECT ...` クエリのレイテンシと同程度
- データパーツ内の列全体ではなく、更新された列と値のみが書き込まれる
- 現在実行中のマージやミューテーションの完了を待つ必要がないため、アップデートのレイテンシを予測しやすい
- 軽量アップデートは並列実行が可能

**想定されるパフォーマンスへの影響:**
- パッチを適用する必要がある `SELECT` クエリにはオーバーヘッドが発生する
- パッチを適用すべきデータパーツ内の列には[スキップインデックス](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)が使用されない。テーブルにパッチパーツが存在する場合は、パッチを適用する必要がないデータパーツであっても[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections)は使用されない。
- ごく小さいアップデートを高頻度で行うと「too many parts」エラーにつながる可能性がある。`WHERE` 句内の単一の `IN` 句にアップデート対象の ID をまとめるなどして、複数のアップデートを 1 つのクエリにバッチ処理することが推奨される
- 軽量アップデートは、テーブル全体の約 10% 程度までの少量の行を更新することを想定して設計されている。より多くの行を更新する必要がある場合は、[`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) ミューテーションを使用することが推奨される

## 同時実行操作 {#concurrent-operations}

軽量な更新は、重いミューテーションとは異なり、現在実行中のマージやミューテーションの完了を待ちません。
同時に行われる軽量更新の一貫性は、[`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) および [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode) の設定によって制御されます。

## 更新権限 {#update-permissions}

`UPDATE` には `ALTER UPDATE` 権限が必要です。特定のユーザーに対して特定のテーブルで `UPDATE` ステートメントを有効にするには、以下を実行します。

```sql
GRANT ALTER UPDATE ON db.table TO username;
```

## 実装の詳細 {#details-of-the-implementation}

パッチパーツは通常のパーツと同じ構造ですが、更新されたカラムと、いくつかのシステムカラムのみを含みます:
- `_part` - 元のパーツの名前
- `_part_offset` - 元のパーツ内の行番号
- `_block_number` - 元のパーツ内での行のブロック番号
- `_block_offset` - 元のパーツ内での行のブロックオフセット
- `_data_version` - 更新データのデータバージョン（`UPDATE` クエリに割り当てられたブロック番号）

平均すると、パッチパーツ内の更新された 1 行あたり約 40 バイト（非圧縮データ）のオーバーヘッドが発生します。
システムカラムは、更新すべき元のパーツ内の行を見つけるのに役立ちます。
システムカラムは、パッチパーツを適用する必要がある場合に読み取り時に追加される、元のパーツ内の[仮想カラム](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)と関連しています。
パッチパーツは `_part` および `_part_offset` でソートされます。

パッチパーツは、元のパーツとは異なるパーティションに属します。
パッチパーツのパーティション ID は `patch-<hash of column names in patch part>-<original_partition_id>` です。
したがって、含まれるカラムが異なるパッチパーツは、異なるパーティションに保存されます。
例えば、`SET x = 1 WHERE <cond>`、`SET y = 1 WHERE <cond>`、`SET x = 1, y = 1 WHERE <cond>` という 3 つの更新は、3 つの異なるパーティションに 3 つのパッチパーツを作成します。

パッチパーツ同士をマージすることで、`SELECT` クエリで適用されるパッチの数を減らし、オーバーヘッドを削減できます。パッチパーツのマージには、バージョンカラムとして `_data_version` を用いた [replacing](/engines/table-engines/mergetree-family/replacingmergetree) マージアルゴリズムが使用されます。
したがって、パッチパーツは常に、そのパーツ内の各更新行について最新バージョンのみを保持します。

ライトウェイトアップデートは、現在実行中のマージやミューテーションの終了を待たず、常に現在のデータパーツのスナップショットを使用してアップデートを実行し、パッチパーツを生成します。
そのため、パッチパーツの適用には 2 つのケースが存在します。

例えば、パーツ `A` を読み取る場合、パッチパーツ `X` を適用する必要があります:
- `X` がパーツ `A` 自体を含む場合。これは、`UPDATE` が実行された時点で `A` がマージに参加していなかった場合に発生します。
- `X` がパーツ `B` と `C` を含み、それらがパーツ `A` によってカバーされている場合。これは、`UPDATE` が実行されたときに、マージ (`B`, `C`) -> `A` が実行中だった場合に発生します。

これら 2 つのケースに対して、それぞれ次の 2 通りのパッチパーツ適用方法があります:
- ソートされたカラム `_part`, `_part_offset` によるマージを使用する。
- `_block_number`, `_block_offset` カラムによるジョインを使用する。

ジョインモードはマージモードよりも低速で、より多くのメモリを必要としますが、利用頻度は低くなります。

## 関連コンテンツ {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 負荷の大きい `UPDATE` 操作
- [軽量な `DELETE`](/sql-reference/statements/delete) - 軽量な `DELETE` 操作
