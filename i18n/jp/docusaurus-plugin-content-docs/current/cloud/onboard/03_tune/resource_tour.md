---
slug: /cloud/get-started/cloud/resource-tour
title: 'リソースツアー'
description: 'クエリ最適化、スケーリング戦略、監視、ベストプラクティスに関する ClickHouse Cloud のドキュメントリソース概要'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/jp/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/jp/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';

# リソースの概要 \{#resource-tour\}

この記事では、ClickHouse Cloud デプロイメントを最大限に活用するために、
ドキュメント内で利用できる各種リソースの概要を紹介します。
以下のトピックごとに整理されたリソースを参照してください。

- [クエリ最適化手法とパフォーマンスチューニング](#query-optimization)
- [モニタリング](#monitoring)
- [セキュリティのベストプラクティスとコンプライアンス機能](#security)
- [コスト最適化と課金](#cost-optimization)

より具体的なトピックに進む前に、まずは ClickHouse を使用する際に従うべき
一般的なベストプラクティスをまとめた ClickHouse ベストプラクティスガイドを
参照することをおすすめします。

<TableOfContentsBestPractices />

## クエリ最適化手法とパフォーマンスチューニング \{#query-optimization\}

<TableOfContentsOptimizationAndPerformance/>

## 監視 \{#monitoring\}

| ページ                                                                       | 説明                                                                               |
|----------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| [高度なダッシュボード](/cloud/manage/monitor/advanced-dashboard)             | 組み込みの高度なダッシュボードを使用して、サービスの健全性と性能を監視します         |
| [Prometheus 連携](/integrations/prometheus)                         | Prometheus を使用してクラウドサービスを監視します                                   |
| [クラウド監視機能](/use-cases/observability/cloud-monitoring) | 組み込みの監視機能と連携オプションの概要を確認します                               |

## セキュリティ \{#security\}

<TableOfContentsSecurity/>

## コスト最適化と課金 \{#cost-optimization\}

| ページ                                              | 説明                                                                                                                 |
|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [データ転送](/cloud/manage/network-data-transfer)   | ClickHouse Cloud がインバウンドおよびアウトバウンドのデータ転送量をどのように計測・課金するかを理解します            |
| [通知](/cloud/notifications)                        | ClickHouse Cloud サービスに対する通知を設定します。たとえば、クレジット使用量がしきい値を超えたときに通知を受け取れます |
