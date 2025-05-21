---
description: 'MergeTreeエンジンファミリーのドキュメント'
sidebar_label: 'MergeTreeファミリー'
sidebar_position: 10
slug: /engines/table-engines/mergetree-family/
title: 'MergeTreeエンジンファミリー'
---


# MergeTreeエンジンファミリー

MergeTreeファミリーのテーブルエンジンは、ClickHouseのデータストレージ機能の中核です。これらは、列指向ストレージ、カスタムパーティショニング、スパース主キー、セカンダリデータスキッピングインデックスなど、高い耐障害性とパフォーマンスのデータ取得機能のほとんどを提供します。

基本の [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンは、シングルノードのClickHouseインスタンス用のデフォルトのテーブルエンジンと見なすことができます。これは、幅広いユースケースに対して汎用性が高く実用的です。

本番用途には [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) を使用するのが最適です。これは、通常のMergeTreeエンジンのすべての機能に高可用性を追加します。ボーナスとして、データの取り込み時に自動データ重複排除が行われるため、挿入中にネットワークの問題が発生した場合でも、安全に再試行できます。

MergeTreeファミリーの他のすべてのエンジンは、特定のユースケースのために追加機能を提供します。通常、これはバックグラウンドでの追加データ操作として実装されています。

MergeTreeエンジンの主な欠点は、それらが非常に重いことです。そのため、典型的なパターンは、あまり多くのテーブルを持たないことです。例えば、一時的なデータのために多くの小さなテーブルが必要な場合は、[Logエンジンファミリー](../../../engines/table-engines/log-family/index.md)を検討してください。

<!-- このページの目次テーブルは自動的に生成されます。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールド：slug、description、titleから生成されます。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | 継続的に変化するオブジェクトの状態を迅速に書き込み、古いオブジェクトの状態をバックグラウンドで削除することができます。 |
| [Data Replication](/engines/table-engines/mergetree-family/replication) | ClickHouseにおけるデータレプリケーションの概要 |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | `MergeTree`ファミリーのテーブルエンジンは、高いデータ取り込み率と膨大なデータボリューム向けに設計されています。 |
| [Exact and Approximate Nearest Neighbor Search](/engines/table-engines/mergetree-family/annindexes) | 正確かつ近似的な最近傍検索のドキュメント |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | MergeTreeから継承し、マージプロセス中に行を崩壊させるためのロジックを追加します。 |
| [Custom Partitioning Key](/engines/table-engines/mergetree-family/custom-partitioning-key) | MergeTreeテーブルにカスタムパーティショニングキーを追加する方法を学びます。 |
| [Full-text Search using Full-text Indexes](/engines/table-engines/mergetree-family/invertedindexes) | テキスト内の検索用語を迅速に見つけることができます。 |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTreeはMergeTreeエンジンから継承されます。その主な機能は、パーツのマージ中に数値データを自動的に合計する能力です。 |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | 同じ主キー（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態の組み合わせを格納する単一の行に置き換えます（単一のデータパーツ内）。 |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | Graphiteデータのスリムおよび集約/平均化（ロールアップ）用に設計されています。 |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | MergeTreeとは異なり、同じソートキー値（`ORDER BY`テーブルセクション、`PRIMARY KEY`ではない）を持つ重複エントリを削除します。 |
