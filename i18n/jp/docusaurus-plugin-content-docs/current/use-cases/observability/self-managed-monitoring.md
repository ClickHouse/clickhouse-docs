---
slug: /use-cases/observability/oss-monitoring
title: '自己管理型監視'
sidebar_label: '自己管理型監視'
description: '自己管理型監視ガイド'
doc_type: 'guide'
keywords: ['可観測性', '監視', '自己管理型', 'メトリクス', 'システムの健全性']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# セルフマネージド監視 {#cloud-monitoring}

本ガイドは、ClickHouseオープンソースを評価する企業チームに対して、本番環境デプロイメントにおける監視および可観測性機能に関する包括的な情報を提供します。企業のお客様からは、すぐに使える監視機能、DatadogやAWS CloudWatchなどのツールを含む既存の可観測性スタックとの統合、およびClickHouseの監視機能とセルフホスト型デプロイメントとの比較について、よくお問い合わせをいただきます。

### Prometheusベースの統合アーキテクチャ {#prometheus}

ClickHouseは、デプロイメントモデルに応じて異なるエンドポイントを通じてPrometheus互換メトリクスを公開します。各エンドポイントには固有の運用特性があります。

**セルフマネージド/OSSのClickHouse**

ClickHouseサーバー上の標準的な/metricsエンドポイントを介してアクセス可能な直接サーバーPrometheusエンドポイント。このアプローチでは以下が提供されます。

- 完全なメトリクス公開：組み込みフィルタリングなしで利用可能なClickHouseメトリクスの全範囲
- リアルタイムメトリクス：スクレイプ時にシステムテーブルから直接生成

**直接システムアクセス**

本番環境のシステムテーブルに対してクエリを実行するため、監視負荷が追加され、コスト削減のためのアイドル状態が妨げられます

<ObservabilityIntegrations />

### ClickStackデプロイメントオプション {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm)：Kubernetesベースのデバッグ環境に推奨されます。`values.yaml`を介して環境固有の設定、リソース制限、およびスケーリングが可能です。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)：各コンポーネント（ClickHouse、HyperDX、OTelコレクター、MongoDB）を個別にデプロイします。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)：スタンドアロンのHyperDXコンテナ。

完全なデプロイメントオプションとアーキテクチャの詳細については、[ClickStackドキュメント](/use-cases/observability/clickstack/overview)および[データ取り込みガイド](/use-cases/observability/clickstack/ingesting-data/overview)を参照してください。

<DirectIntegrations />

<CommunityMonitoring />
