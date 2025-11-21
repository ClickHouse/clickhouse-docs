---
title: 'ClickHouse は高頻度かつ同時並行なクエリをサポートしますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/concurrency
description: 'ClickHouse は高い QPS と高い同時実行性をサポートします'
doc_type: 'reference'
keywords: ['concurrency', 'QPS']
---

# ClickHouse は高頻度かつ多数の同時実行クエリをサポートしますか？

ClickHouse は、外部ユーザーに直接提供されるリアルタイム分析アプリケーション向けに設計されています。ペタバイト規模のデータベースに対して、履歴データとリアルタイムで挿入されるデータを組み合わせつつ、低レイテンシー（10 ミリ秒未満）かつ高い同時実行性（1 秒あたり 10,000 クエリ超）で分析クエリを処理できます。

これは、効率的なインデックス構造、柔軟なキャッシュ機構、`projections` や `materialized views` といった各種構成オプションによって実現されています。

組み込みのロールベースアクセス制御、リソース使用量クォータ、設定可能なクエリ複雑性のガードレール機能、ワークロードスケジューラにより、ClickHouse は分析データの上に構築されるサービングレイヤーとして理想的な選択肢となります。