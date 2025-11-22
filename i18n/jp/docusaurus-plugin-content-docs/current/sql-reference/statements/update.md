---
description: '軽量な UPDATE は、パッチパーツを使用してデータベース内のデータを更新する処理を簡素化します。'
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
軽量（ライトウェイト）更新は現在ベータ版です。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues)で Issue を作成してください。
:::

軽量（ライトウェイト）な `UPDATE` ステートメントは、`filter_expr` の式に一致するテーブル `[db.]table` 内の行を更新します。
これは、データパーツ内の列全体を書き換えるというヘビーウェイトな処理を行う [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) クエリと対比して、「軽量更新」と呼ばれています。
これは [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) テーブルエンジンファミリーでのみ利用可能です。

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr` は `UInt8` 型である必要があります。このクエリは、`filter_expr` がゼロ以外の値をとる行に対して、指定された列の値を対応する式の値に更新します。
値は `CAST` 演算子を使用して列の型にキャストされます。プライマリキーまたはパーティションキーの計算に使用される列を更新することはできません。


## 例 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```


## 軽量更新はデータを即座に更新しない {#lightweight-update-does-not-update-data-immediately}

軽量`UPDATE`は**パッチパート**を使用して実装されています。パッチパートは、更新された列と行のみを含む特殊なデータパートです。

軽量`UPDATE`はパッチパートを作成しますが、ストレージ内の元のデータを物理的に即座に変更しません。

更新処理は`INSERT ... SELECT ...`クエリと似ていますが、`UPDATE`クエリはパッチパートの作成が完了するまで待機してから結果を返します。


更新された値は次のようになります：

- パッチの適用により`SELECT`クエリで**即座に可視化**されます
- 後続のマージとミューテーション時にのみ**物理的にマテリアライズ**されます
- すべてのアクティブなパートでパッチがマテリアライズされると**自動的にクリーンアップ**されます

## 軽量更新の要件 {#lightweight-update-requirements}

軽量更新は、[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)、[`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree)、[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree)エンジン、およびそれらの[`Replicated`](/engines/table-engines/mergetree-family/replication.md)版と[`Shared`](/cloud/reference/shared-merge-tree)版でサポートされています。

軽量更新を使用するには、テーブル設定[`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column)と[`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column)を使用して、`_block_number`列と`_block_offset`列のマテリアライゼーションを有効にする必要があります。


## 軽量削除 {#lightweight-delete}

[軽量 `DELETE`](/sql-reference/statements/delete) クエリは、`ALTER UPDATE` ミューテーションの代わりに軽量 `UPDATE` として実行できます。軽量 `DELETE` の実装は、[`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) 設定によって制御されます。


## パフォーマンスに関する考慮事項 {#performance-considerations}

**軽量更新の利点:**

- 更新のレイテンシは`INSERT ... SELECT ...`クエリのレイテンシと同等です
- データパート内の列全体ではなく、更新された列と値のみが書き込まれます
- 現在実行中のマージ/ミューテーションの完了を待つ必要がないため、更新のレイテンシは予測可能です
- 軽量更新の並列実行が可能です

**潜在的なパフォーマンスへの影響:**

- パッチを適用する必要がある`SELECT`クエリにオーバーヘッドが追加されます
- パッチが適用されるデータパート内の列に対しては[スキッピングインデックス](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)が使用されません。テーブルにパッチパートが存在する場合、パッチが適用されないデータパートを含め、[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections)は使用されません。
- 頻繁すぎる小規模な更新は「パーツが多すぎる」エラーを引き起こす可能性があります。複数の更新を単一のクエリにまとめることを推奨します。例えば、`WHERE`句内の単一の`IN`句に更新対象のIDをまとめる方法があります
- 軽量更新は少量の行(テーブルの約10%まで)を更新するように設計されています。より多くの行を更新する必要がある場合は、[`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update)ミューテーションの使用を推奨します


## 同時実行操作 {#concurrent-operations}

軽量更新は、重量級ミューテーションとは異なり、現在実行中のマージ/ミューテーションの完了を待機しません。
同時実行される軽量更新の一貫性は、設定[`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency)および[`update_parallel_mode`](/operations/settings/settings#update_parallel_mode)によって制御されます。


## 更新権限 {#update-permissions}

`UPDATE`には`ALTER UPDATE`権限が必要です。特定のユーザーに対して特定のテーブルで`UPDATE`文を有効にするには、次を実行します:

```sql
GRANT ALTER UPDATE ON db.table TO username;
```


## 実装の詳細 {#details-of-the-implementation}

パッチパートは通常のパートと同じですが、更新されたカラムといくつかのシステムカラムのみを含みます:

- `_part` - 元のパートの名前
- `_part_offset` - 元のパート内の行番号
- `_block_number` - 元のパート内の行のブロック番号
- `_block_offset` - 元のパート内の行のブロックオフセット
- `_data_version` - 更新されたデータのデータバージョン(`UPDATE`クエリに割り当てられたブロック番号)

平均して、パッチパート内の更新された行ごとに約40バイト(非圧縮データ)のオーバーヘッドが発生します。
システムカラムは、更新対象となる元のパート内の行を特定するために使用されます。
システムカラムは、元のパート内の[仮想カラム](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)に関連しており、パッチパートを適用する必要がある場合に読み取り用に追加されます。
パッチパートは`_part`と`_part_offset`でソートされます。

パッチパートは元のパートとは異なるパーティションに属します。
パッチパートのパーティションIDは`patch-<パッチパート内のカラム名のハッシュ>-<元のパーティションID>`です。
したがって、異なるカラムを持つパッチパートは異なるパーティションに格納されます。
例えば、3つの更新`SET x = 1 WHERE <cond>`、`SET y = 1 WHERE <cond>`、`SET x = 1, y = 1 WHERE <cond>`は、3つの異なるパーティションに3つのパッチパートを作成します。

パッチパートは相互にマージすることで、`SELECT`クエリで適用されるパッチの量を減らし、オーバーヘッドを削減できます。パッチパートのマージは、`_data_version`をバージョンカラムとして使用する[replacing](/engines/table-engines/mergetree-family/replacingmergetree)マージアルゴリズムを使用します。
したがって、パッチパートは常にパート内の各更新された行の最新バージョンを保持します。

軽量更新は、現在実行中のマージやミューテーションの完了を待たず、常にデータパートの現在のスナップショットを使用して更新を実行し、パッチパートを生成します。
そのため、パッチパートを適用する際には2つのケースが存在します。

例えば、パート`A`を読み取る場合、パッチパート`X`を適用する必要があります:

- `X`がパート`A`自体を含む場合。これは`UPDATE`が実行されたときに`A`がマージに参加していなかった場合に発生します。
- `X`がパート`B`と`C`を含み、それらがパート`A`によってカバーされている場合。これは`UPDATE`が実行されたときにマージ(`B`, `C`) -> `A`が実行中だった場合に発生します。

これら2つのケースに対して、それぞれパッチパートを適用する2つの方法があります:

- ソート済みカラム`_part`、`_part_offset`によるマージを使用する方法。
- `_block_number`、`_block_offset`カラムによる結合を使用する方法。

結合モードはマージモードよりも低速で、より多くのメモリを必要としますが、使用頻度は低くなります。


## 関連コンテンツ {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 重量級の`UPDATE`操作
- [軽量`DELETE`](/sql-reference/statements/delete) - 軽量の`DELETE`操作
