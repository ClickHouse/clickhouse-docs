---
'slug': '/cloud/get-started/cloud/resource-tour'
'title': 'リソースツアー'
'description': 'クエリ最適化、スケーリング戦略、監視、およびベストプラクティスのためのClickHouse Cloudドキュメントリソースの概要'
'keywords':
- 'clickhouse cloud'
'hide_title': true
'doc_type': 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/jp/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/jp/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';


# リソースツアー

この記事は、ClickHouse Cloud デプロイメントを最大限に活用するために、ドキュメントに用意されているリソースの概要を提供することを目的としています。以下のトピックに沿ったリソースを探索してください:

- [クエリ最適化技術とパフォーマンス調整](#query-optimization)
- [監視](#monitoring)
- [セキュリティのベストプラクティスとコンプライアンス機能](#security)
- [コスト最適化と請求](#cost-optimization)

より具体的なトピックに入る前に、ClickHouse を使用する際に従うべき一般的なベストプラクティスをカバーした、一般的な ClickHouse ベストプラクティスガイドから始めることをお勧めします。

<TableOfContentsBestPractices />

## クエリ最適化技術とパフォーマンス調整 {#query-optimization}

<TableOfContentsOptimizationAndPerformance/>

## 監視 {#monitoring}

| ページ                                                            | 説明                                                                                       |
|-----------------------------------------------------------------|------------------------------------------------------------------------------------------|
| [高度なダッシュボード](/cloud/manage/monitor/advanced-dashboard)  | 内蔵の高度なダッシュボードを使用してサービスの健康状態とパフォーマンスを監視します       |
| [Prometheus統合](/integrations/prometheus)                      | Prometheus を使用して Cloud サービスを監視します                                          |

## セキュリティ {#security}

<TableOfContentsSecurity/>

## コスト最適化と請求 {#cost-optimization}

| ページ                                                | 説明                                                                                                |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| [データ転送](/cloud/manage/network-data-transfer)  | ClickHouse Cloud が受信および送信されたデータをどのように計測するかを理解します                  |
| [通知](/cloud/notifications)                         | ClickHouse Cloud サービスの通知を設定します。たとえば、クレジット使用量が閾値を超えたときなどです |
