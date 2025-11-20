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

この記事では、ClickHouse Cloud のデプロイメントを最大限に活用するために、
ドキュメント内で利用できる各種リソースの概要を紹介します。
以下のトピックごとに整理されたリソースを参照してください：

- [クエリ最適化手法とパフォーマンスチューニング](#query-optimization)
- [監視](#monitoring)
- [セキュリティのベストプラクティスとコンプライアンス機能](#security)
- [コスト最適化と課金](#cost-optimization)

より具体的なトピックに進む前に、まずは一般的な ClickHouse ベストプラクティスガイドに目を通すことをおすすめします。このガイドでは、
ClickHouse を使用する際に従うべき共通のベストプラクティスを解説しています：

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
| [データ転送](/cloud/manage/network-data-transfer) | ClickHouse Cloudがインバウンドおよびアウトバウンドで転送されるデータを計測する方法について理解する                                |
| [通知](/cloud/notifications)                | ClickHouse Cloudサービスの通知を設定します。例えば、クレジット使用量がしきい値を超えた場合などに通知を受け取ることができます |
