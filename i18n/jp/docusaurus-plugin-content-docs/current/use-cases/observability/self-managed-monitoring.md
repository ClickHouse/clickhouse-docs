---
slug: /use-cases/observability/oss-monitoring
title: 'セルフマネージド監視'
sidebar_label: 'セルフマネージド監視'
description: 'セルフマネージド監視ガイド'
doc_type: 'guide'
keywords: ['可観測性', '監視', 'セルフマネージド', 'メトリクス', 'システム健全性']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# セルフマネージド環境でのモニタリング {#cloud-monitoring}

このガイドは、ClickHouse オープンソース版を評価しているエンタープライズチーム向けに、本番デプロイメントにおける監視およびオブザーバビリティ機能に関する包括的な情報を提供します。エンタープライズ顧客からは、標準で備わっているモニタリング機能、Datadog や AWS CloudWatch などのツールを含む既存のオブザーバビリティスタックとの統合方法、そして ClickHouse の監視機能がセルフホスト型デプロイメントと比べてどうかについて、よく質問が寄せられます。

### Prometheus ベースの統合アーキテクチャ {#prometheus}
ClickHouse は、デプロイメントモデルに応じて異なるエンドポイントを通じて Prometheus 互換のメトリクスを公開しており、それぞれ運用上の特性が異なります。

**セルフマネージド / OSS ClickHouse**

ClickHouse サーバー上の標準の `/metrics` エンドポイント経由で、サーバーに直接アクセスできる Prometheus エンドポイントを提供します。このアプローチには次の特長があります。
- メトリクスの完全な公開: ClickHouse で利用可能なメトリクスの全範囲を、組み込みのフィルタリングなしで取得可能
- リアルタイムメトリクス: スクレイプ時に system テーブルから直接生成

**システムへの直接アクセス**

本番環境の system テーブルに対してクエリを実行するため、モニタリング負荷が追加され、コスト削減のためのアイドル状態を妨げる可能性があります。

<ObservabilityIntegrations/>

### ClickStack のデプロイメントオプション {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetes ベースのデバッグ環境に推奨されます。`values.yaml` による環境固有の設定、リソース制限、およびスケーリングが可能です。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 各コンポーネント (ClickHouse、HyperDX、OTel collector、MongoDB) を個別にデプロイします。
- [HyperDX のみ](/use-cases/observability/clickstack/deployment/hyperdx-only): 単体の HyperDX コンテナとしてデプロイします。

デプロイメントオプションおよびアーキテクチャの詳細については、[ClickStack のドキュメント](/use-cases/observability/clickstack/overview)および[データインジェストガイド](/use-cases/observability/clickstack/ingesting-data/overview)を参照してください。

<DirectIntegrations/>

<CommunityMonitoring/>
