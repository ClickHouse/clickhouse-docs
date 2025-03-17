---
slug: /cloud/bestpractices/avoid-optimize-final
sidebar_label: Optimize Final を避ける
title: Optimize Final を避ける
keywords: ['OPTIMIZE TABLE', 'FINAL', '予定外のマージ']
---

[`OPTIMIZE TABLE ... FINAL`](/sql-reference/statements/optimize/) クエリを使用すると、特定のテーブルのデータパーツを未予定のマージにより一つのデータパーツに統合します。このプロセス中に、ClickHouse は以下のステップを実行します：

- データパーツを読み込みます。
- パーツが解凍されます。
- パーツがマージされます。
- それらは一つのパーツに圧縮されます。
- そのパーツがオブジェクトストアに書き戻されます。

上記の操作はリソースを多く消費し、CPU とディスク I/O に significant な負荷をかけます。この最適化を使用することは、既に一つのパーツへのマージが行われていても、パーツの再書き込みを強制することに注意することが重要です。

さらに、`OPTIMIZE TABLE ... FINAL` クエリを使用すると、ClickHouse が通常バックグラウンドで自動的にマージするパーツの最大サイズを制御する設定 [`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) を無視する場合があります。

[`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) 設定はデフォルトで 150 GB に設定されています。`OPTIMIZE TABLE ... FINAL` を実行すると、上記の手順が実行され、マージ後に一つのパーツが残ります。この残りの一つのパーツは、この設定のデフォルトで指定された 150 GB を超える可能性があります。これは、あなたがこのステートメントの使用を避けるべき理由の一つであり、大きな 150 GB のパーツを一つのパーツにマージすることは、 significant な時間および/またはメモリを必要とする可能性があります。
