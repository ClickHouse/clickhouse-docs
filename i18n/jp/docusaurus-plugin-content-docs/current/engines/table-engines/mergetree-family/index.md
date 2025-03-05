---
slug: /engines/table-engines/mergetree-family/
sidebar_position: 10
sidebar_label: MergeTree ファミリー
---


# MergeTree エンジンファミリー

MergeTree ファミリーのテーブルエンジンは、ClickHouse のデータストレージ機能の核心を成しています。これらは、列指向ストレージ、カスタムパーティション、スパース主キー、二次データスキッピングインデックスなど、耐障害性と高パフォーマンスのデータ取得のためのほとんどの機能を提供します。

基本の [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンは、シングルノードの ClickHouse インスタンスにとってデフォルトのテーブルエンジンと見なすことができ、多様で実用的な幅広いユースケースに対応しています。

本番環境での使用には、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) が推奨されます。これは、通常の MergeTree エンジンのすべての機能に高可用性を追加します。ボーナスとして、データの取り込み時に自動的なデータデデュプリケーションが行われるため、挿入中にネットワークの問題が発生した場合でも、ソフトウェアは安全に再試行できます。

MergeTree ファミリーの他のエンジンは、特定のユースケースに対して追加の機能を提供します。通常、これはバックグラウンドでの追加データ操作として実装されます。

MergeTree エンジンの主な欠点は、比較的重いことです。そのため、典型的なパターンとしては、多くの MergeTree エンジンを持たないことです。たとえば、一時的なデータのために多くの小さなテーブルが必要な場合は、[Log エンジンファミリー](../../../engines/table-engines/log-family/index.md) を検討してください。

<!-- このページの目次テーブルは自動的に生成されています。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAML フロントマターのフィールド: slug, description, title から。

エラーを見つけた場合は、ページ自体の YML フロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [VersionedCollapsingMergeTree](/docs/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | 継続的に変化するオブジェクトの状態を迅速に書き込み、バックグラウンドで古いオブジェクトの状態を削除します。 |
| [Data Replication](/docs/engines/table-engines/mergetree-family/replication) | ClickHouse におけるデータレプリケーションの概要 |
| [MergeTree](/docs/engines/table-engines/mergetree-family/mergetree) | `MergeTree` ファミリーのテーブルエンジンは、高速なデータ取り込みレートと巨大なデータボリュームのために設計されています。 |
| [Approximate Nearest Neighbor Search with Vector Similarity Indexes](/docs/engines/table-engines/mergetree-family/annindexes) | ベクトル類似性インデックスによる近似最近傍検索 |
| [CollapsingMergeTree](/docs/engines/table-engines/mergetree-family/collapsingmergetree) | MergeTree から派生し、マージプロセス中に行を統合するロジックを追加します。 |
| [Custom Partitioning Key](/docs/engines/table-engines/mergetree-family/custom-partitioning-key) | MergeTree テーブルにカスタムパーティショニングキーを追加する方法を学びます。 |
| [Full-text Search using Full-text Indexes](/docs/engines/table-engines/mergetree-family/invertedindexes) | テキスト内の検索語を迅速に見つけることができます。 |
| [SummingMergeTree](/docs/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTree は MergeTree エンジンから派生しています。主な機能は、部分のマージ中に数値データを自動的に合計する能力です。 |
| [AggregatingMergeTree](/docs/engines/table-engines/mergetree-family/aggregatingmergetree) | 同じ主キー（またはより正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を単一の行に置き換えます（単一のデータパーツ内で）集計関数の状態の組み合わせを格納します。 |
| [GraphiteMergeTree](/docs/engines/table-engines/mergetree-family/graphitemergetree) | Graphite データのスリム化と集約/平均化（ロールアップ）のために設計されています。 |
| [ReplacingMergeTree](/docs/engines/table-engines/mergetree-family/replacingmergetree) | MergeTree と異なり、同じソートキー値（`ORDER BY` テーブルセクション、`PRIMARY KEY` ではない）を持つ重複エントリを削除します。 |
