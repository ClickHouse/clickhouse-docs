---
slug: /cloud/get-started/cloud/resource-tour
title: 'リソースツアー'
description: 'クエリ最適化、スケーリング戦略、監視、ベストプラクティスに関する ClickHouse Cloud ドキュメントリソースの概要'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/docs/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/docs/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/docs/cloud/_snippets/_security_table_of_contents.md';


# リソースツアー

この記事では、ClickHouse Cloud デプロイメントを最大限に活用するために役立つ、本ドキュメント内で利用できる各種リソースの概要を紹介します。
以下のトピック別に整理されたリソースをご覧ください。

- [クエリ最適化手法とパフォーマンスチューニング](#query-optimization)
- [監視](#monitoring)
- [セキュリティのベストプラクティスとコンプライアンス機能](#security)
- [コスト最適化と課金](#cost-optimization)

より具体的なトピックに進む前に、ClickHouse を使用する際に従うべき一般的なベストプラクティスをまとめた、
ClickHouse 全般のベストプラクティスガイドから読み始めることをお勧めします。

<TableOfContentsBestPractices />



## クエリ最適化手法とパフォーマンスチューニング {#query-optimization}

<TableOfContentsOptimizationAndPerformance />


## モニタリング {#monitoring}

| ページ                                                                       | 説明                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Advanced dashboard](/cloud/manage/monitor/advanced-dashboard)             | 組み込みの高度なダッシュボードを使用してサービスの健全性とパフォーマンスを監視する |
| [Prometheus integration](/integrations/prometheus)                         | Prometheusを使用してCloudサービスを監視する                                      |
| [Cloud Monitoring Capabilities](/use-cases/observability/cloud-monitoring) | 組み込みのモニタリング機能と統合オプションの概要を確認する   |


## セキュリティ {#security}

<TableOfContentsSecurity />


## コスト最適化と請求 {#cost-optimization}

| ページ                                                 | 説明                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [データ転送](/cloud/manage/network-data-transfer) | ClickHouse Cloudがイングレスおよびエグレスで転送されるデータを計測する方法について理解する                                |
| [通知](/cloud/notifications)                | ClickHouse Cloudサービスの通知を設定する。例：クレジット使用量が閾値を超えた場合 |
