---
title: 'ClickHouse は高頻度かつ多数の同時クエリをサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/concurrency
description: 'ClickHouse は高い QPS と高い同時実行性をサポートしています'
doc_type: 'reference'
keywords: ['concurrency', 'QPS']
---

# ClickHouse は高頻度かつ同時実行されるクエリをサポートしていますか？ \{#does-clickhouse-support-frequent-concurrent-queries\}

ClickHouse は、外部ユーザーに直接応答するリアルタイム分析アプリケーション向けに設計されています。ペタバイト規模のデータベースに対して、履歴データとリアルタイム挿入データを組み合わせつつ、低レイテンシ（10 ミリ秒未満）かつ高い同時実行性（1 秒あたり 10,000 クエリ超）で分析クエリを処理できます。

これは、高速なインデックス構造、柔軟なキャッシュ、そしてプロジェクションやマテリアライズドビューといった構成オプションにより実現されています。

組み込みのロールベースアクセス制御、リソース使用量クォータ、クエリの複雑さを制御するガードレール機能、ワークロードスケジューラにより、ClickHouse は分析データの上に構築するサービングレイヤーとして理想的な選択肢となります。