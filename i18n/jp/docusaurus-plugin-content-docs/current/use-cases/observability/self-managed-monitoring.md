---
slug: /use-cases/observability/oss-monitoring
title: '自己管理型監視'
sidebar_label: '自己管理型監視'
description: '自己管理型監視ガイド'
doc_type: 'guide'
keywords: ['オブザーバビリティ', '監視', '自己管理型', 'メトリクス', 'システムの健全性']
---

import ObservabilityIntegrations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';


# セルフマネージド環境での監視 {#cloud-monitoring}

本ガイドでは、ClickHouse オープンソースを評価しているエンタープライズチーム向けに、本番デプロイメントにおける監視およびオブザーバビリティ機能に関する包括的な情報を提供します。エンタープライズ顧客からは、すぐに利用可能な監視機能、Datadog や AWS CloudWatch などのツールを含む既存のオブザーバビリティスタックとの統合、および ClickHouse の監視機能がセルフホスト型デプロイメントとどのように比較できるのか、といった点について頻繁に問い合わせがあります。

### Prometheus ベースのインテグレーションアーキテクチャ {#prometheus}

ClickHouse は、デプロイモデルに応じて異なるエンドポイントを通じて Prometheus 互換のメトリクスを公開しており、それぞれ運用上の特性が異なります。

**セルフマネージド/OSS ClickHouse**

ClickHouse サーバー上の標準的な /metrics エンドポイント経由で直接アクセス可能な、サーバーの Prometheus エンドポイント。このアプローチは次のような特長を提供します。

- メトリクスの完全な公開: 組み込みのフィルタリングなしで、利用可能な ClickHouse メトリクスの全範囲にアクセス可能
- リアルタイムなメトリクス: スクレイプ時に system テーブルから直接生成

**システムへの直接アクセス** 

本番環境の system テーブルをクエリするため、監視による負荷が増加し、コスト削減につながるアイドル状態への移行を妨げます。

<ObservabilityIntegrations/>

### ClickStack のデプロイメントオプション {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetes ベースのデバッグ環境向けに推奨です。`values.yaml` を通じて、環境固有の設定、リソース制限、およびスケーリングが可能です。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 各コンポーネント（ClickHouse、HyperDX、OTel collector、MongoDB）を個別にデプロイします。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): 単体で動作する HyperDX コンテナ。

デプロイメントオプションの一覧およびアーキテクチャの詳細については、[ClickStack ドキュメント](/use-cases/observability/clickstack/overview)および[データインジェストガイド](/use-cases/observability/clickstack/ingesting-data/overview)を参照してください。

<DirectIntegrations/>

<CommunityMonitoring/>