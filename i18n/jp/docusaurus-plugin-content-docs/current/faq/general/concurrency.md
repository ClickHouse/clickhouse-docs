---
title: 'ClickHouse は高頻度かつ同時に実行されるクエリをサポートしますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/concurrency
description: 'ClickHouse は高い QPS と高い同時実行性をサポートします'
doc_type: 'reference'
keywords: ['concurrency', 'QPS']
---

# ClickHouse は高頻度かつ同時実行されるクエリをサポートしますか？

ClickHouse は、外部ユーザー向けに直接サービスを提供するリアルタイム分析アプリケーション向けに設計されています。ペタバイト規模のデータベース上で、履歴データとリアルタイムの書き込みを組み合わせつつ、低レイテンシ（10 ミリ秒未満）かつ高い同時実行性（1 秒あたり 1 万件超のクエリ）の分析クエリ処理を実現できます。

これは、効率的なインデックス構造、柔軟なキャッシュ機構、さらに `projections` や `materialized views` といった構成可能な機能によって可能になっています。

組み込みのロールベースアクセス制御、リソース使用量クォータ、設定可能なクエリ複雑度のガードレール、ワークロードスケジューラにより、ClickHouse は分析データの上に構築されるサービングレイヤーとして理想的な選択肢となります。