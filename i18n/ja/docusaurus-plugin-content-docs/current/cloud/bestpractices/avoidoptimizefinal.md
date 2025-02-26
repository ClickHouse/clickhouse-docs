---
slug: /cloud/bestpractices/avoid-optimize-final
sidebar_label: 最適化のファイナルを避ける
title: 最適化のファイナルを避ける
keywords: ['OPTIMIZE TABLE', 'FINAL', '未スケジュールマージ']
---

[`OPTIMIZE TABLE ... FINAL`](/sql-reference/statements/optimize/) クエリを使用すると、特定のテーブルのデータパーツの未スケジュールマージが開始され、1つのデータパーツに統合されます。
このプロセスでは、ClickHouseは以下の手順を実行します：

- データパーツが読み取られます。
- パーツが非圧縮されます。
- パーツがマージされます。
- 単一のパーツに圧縮されます。
- その後、パーツがオブジェクトストアに書き戻されます。

上記で説明した操作はリソースを大量に消費し、CPUとディスクI/Oに大きな負担をかけます。
この最適化を使用すると、パーツの再書き込みが強制されることに注意が必要です。
たとえすでに1つのパーツへのマージが行われていてもです。

さらに、`OPTIMIZE TABLE ... FINAL` クエリの使用により、ClickHouseが通常、自動的にバックグラウンドでマージするパーツの最大サイズを制御する設定 [`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) が無視される可能性があります。

設定 [`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) はデフォルトで150GBに設定されています。
`OPTIMIZE TABLE ... FINAL` を実行すると、上記の手順が実行され、マージ後に単一のパーツが残ります。
この残りの単一パーツは、この設定のデフォルトである150GBを超える可能性があります。
これは重要な考慮事項であり、このステートメントの使用を避けるべき理由の一つです。
なぜなら、150GBのパーツを大量に1つのパーツにマージするには、かなりの時間と/またはメモリを要する可能性があるからです。
