---
slug: /use-cases/observability/oss-monitoring
title: '自前運用の監視'
sidebar_label: '自前運用の監視'
description: '自前運用の監視ガイド'
doc_type: 'guide'
keywords: ['observability', 'monitoring', 'self-managed', 'metrics', 'system health']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# セルフマネージド監視 {#cloud-monitoring}

本ガイドは、ClickHouseオープンソースを評価するエンタープライズチームに対して、本番環境デプロイメントにおける監視とオブザーバビリティ機能に関する包括的な情報を提供します。エンタープライズ顧客からは、すぐに使える監視機能、DatadogやAWS CloudWatchなどのツールを含む既存のオブザーバビリティスタックとの統合、そしてClickHouseの監視機能とセルフホスト型デプロイメントとの比較について、頻繁に質問が寄せられます。

### Prometheusベースの統合アーキテクチャ {#prometheus}

ClickHouseは、デプロイメントモデルに応じて異なるエンドポイントを通じてPrometheus互換メトリクスを公開しており、それぞれ異なる運用特性を持ちます:

**セルフマネージド/OSS ClickHouse**

ClickHouseサーバー上の標準的な/metricsエンドポイントを介してアクセス可能な、直接サーバーPrometheusエンドポイント。このアプローチは以下を提供します:

- 完全なメトリクス公開: 組み込みフィルタリングなしで利用可能なClickHouseメトリクスの全範囲
- リアルタイムメトリクス: スクレイプ時にシステムテーブルから直接生成

**直接システムアクセス**

本番環境のシステムテーブルにクエリを実行するため、監視負荷が追加され、コスト削減のためのアイドル状態が妨げられます

<ObservabilityIntegrations />

### ClickStackデプロイメントオプション {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetesベースのデバッグ環境に推奨。`values.yaml`を介した環境固有の設定、リソース制限、スケーリングが可能です。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 各コンポーネント(ClickHouse、HyperDX、OTelコレクター、MongoDB)を個別にデプロイします。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): スタンドアロンのHyperDXコンテナ。

完全なデプロイメントオプションとアーキテクチャの詳細については、[ClickStackドキュメント](/use-cases/observability/clickstack/overview)および[データ取り込みガイド](/use-cases/observability/clickstack/ingesting-data/overview)を参照してください。

<DirectIntegrations />

<CommunityMonitoring />
