---
slug: /engines/table-engines/mergetree-family/
sidebar_position: 10
sidebar_label: MergeTreeファミリー
---

# MergeTreeエンジンファミリー

MergeTreeファミリーのテーブルエンジンは、ClickHouseデータストレージ機能の中核です。これらは、列指向ストレージ、カスタムパーティション、スパース主キー、二次データスキッピングインデックスなど、耐障害性と高性能データ取得のためのほとんどの機能を提供します。

基本の [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンは、シングルノードのClickHouseインスタンスにおけるデフォルトのテーブルエンジンと考えることができ、広範なユースケースに対して汎用性と実用性を備えています。

本番環境での使用には、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) が推奨されます。これは、通常のMergeTreeエンジンのすべての機能に高可用性を追加します。ボーナスとして、データ投入時に自動でデータの重複排除を行うため、挿入中にネットワークの問題が発生した場合でも安全に再試行できます。

MergeTreeファミリーの他のエンジンは、特定のユースケースに対して追加機能を加えています。通常、これはバックグラウンドでの追加データ操作として実装されています。

MergeTreeエンジンの主な欠点は、その重量級であることです。したがって、一般的なパターンは、それほど多くのエンジンを持たないことです。例えば、一時的なデータ用の多くの小さいテーブルが必要な場合は、[Logエンジンファミリー](../../../engines/table-engines/log-family/index.md)を検討してください。

<!-- このページの目次は、 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
から自動生成されています。YAMLフロントマターのフィールド: slug, description, title.

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | 状態が継続的に変化するオブジェクトを迅速に書き込み、バックグラウンドで古いオブジェクトの状態を削除します。 |
| [データレプリケーション](/engines/table-engines/mergetree-family/replication) | ClickHouseにおけるデータレプリケーションの概要 |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | `MergeTree`ファミリーのテーブルエンジンは、高いデータ取込みレートと巨大なデータボリュームに対応するように設計されています。 |
| [ベクトル類似インデックスを用いた近似最近傍検索](/engines/table-engines/mergetree-family/annindexes) | ベクトル類似インデックスを用いた近似最近傍検索 |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | MergeTreeから継承されており、マージプロセス中に行を統合するためのロジックを追加しています。 |
| [カスタムパーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key) | MergeTreeテーブルにカスタムパーティションキーを追加する方法を学びます。 |
| [全文検索を使用した全文インデックス](/engines/table-engines/mergetree-family/invertedindexes) | テキスト内の検索語を迅速に見つけます。 |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTreeはMergeTreeエンジンから継承され、その主な機能はパートのマージ中に数値データを自動的に合計する能力です。 |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | 同じ主キー（もしくはより正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態の組み合わせを保存する単一の行（単一のデータパート内）に置き換えます。 |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | グラファイトデータの薄化と集約/平均（ロールアップ）用に設計されています。 |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | 同じソートキー値（テーブルセクションの `ORDER BY`、ではなく `PRIMARY KEY`）を持つ重複エントリを削除する点でMergeTreeと異なります。 |
