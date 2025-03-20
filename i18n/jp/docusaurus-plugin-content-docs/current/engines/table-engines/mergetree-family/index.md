---
slug: '/engines/table-engines/mergetree-family/'
sidebar_position: 10
sidebar_label: 'MergeTreeファミリー'
---


# MergeTreeエンジンファミリー

MergeTreeファミリーのテーブルエンジンは、ClickHouseのデータストレージ機能の核となっています。これらは、列指向ストレージ、カスタムパーティショニング、スパース主キー、セカンダリーデータスキッピングインデックスなど、レジリエンスと高パフォーマンスのデータ取得のためのほとんどの機能を提供します。

基本の [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンは、シングルノードのClickHouseインスタンスのデフォルトテーブルエンジンと見なすことができます。これは多目的であり、幅広いユースケースに実用的だからです。

本番環境では、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) が推奨されます。これは通常のMergeTreeエンジンのすべての機能に高可用性を追加するためです。ボーナスとして、データの取り込み時に自動的にデデュプリケーションを行うため、挿入中にネットワークの問題が発生した場合でも安全に再試行できます。

MergeTreeファミリーの他のすべてのエンジンは、特定のユースケースのための追加機能を提供します。通常、これはバックグラウンドでの追加データ操作として実装されています。

MergeTreeエンジンの主な欠点は、それらが比較的重いことです。したがって、一般的なパターンは、それほど多くのMergeTreeエンジンを持たないことです。一時的なデータなどのために多くの小さなテーブルが必要な場合は、[Logエンジンファミリー](../../../engines/table-engines/log-family/index.md)を検討してください。

<!-- このページの目次テーブルは、 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
によって自動的に生成されます。
YAMLフロントマターのフィールドから: slug, description, title.

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | オブジェクトの状態を迅速に書き込み、古いオブジェクトの状態をバックグラウンドで削除します。 |
| [データレプリケーション](/engines/table-engines/mergetree-family/replication) | ClickHouseにおけるデータレプリケーションの概要 |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | `MergeTree`ファミリーのテーブルエンジンは、高速なデータ取り込み率と膨大なデータ量に対応するために設計されています。 |
| [ベクトル類似性インデックスを使用した近似最近傍探索](/engines/table-engines/mergetree-family/annindexes) | ベクトル類似性インデックスを利用した近似最近傍探索 |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | MergeTreeから継承し、マージプロセス中に行を圧縮するロジックを追加します。 |
| [カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) | MergeTreeテーブルにカスタムパーティショニングキーを追加する方法を学びます。 |
| [全文検索インデックスを使用した全文検索](/engines/table-engines/mergetree-family/invertedindexes) | テキスト内の検索用語を迅速に見つけます。 |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTreeはMergeTreeエンジンから継承されます。その主な機能は、パートのマージ中に数値データを自動的に合計できることです。 |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | 同じ主キー（より正確には、同じ [ソーティングキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を1行に置き換えます（単一のデータパート内で、集約関数の状態の組み合わせを格納します）。 |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | Graphiteデータの薄化および集約/平均化（ロールアップ）用に設計されています。 |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | MergeTreeとは異なり、同じソーティングキー値を持つ重複エントリを削除します（`ORDER BY`テーブルセクションで、`PRIMARY KEY`ではない）。 |
