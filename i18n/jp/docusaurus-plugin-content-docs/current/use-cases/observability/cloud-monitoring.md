---
slug: /use-cases/observability/cloud-monitoring
title: 'ClickHouse Cloud 監視'
sidebar_label: 'ClickHouse Cloud 監視'
description: 'ClickHouse Cloud 監視ガイド'
doc_type: 'guide'
keywords: ['オブザーバビリティ', '監視', 'クラウド', 'メトリクス', 'システムの健全性']
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# ClickHouse Cloud の監視 {#cloud-monitoring}

このガイドでは、ClickHouse Cloud を評価しているエンタープライズチーム向けに、本番環境デプロイメントにおける監視およびオブザーバビリティ機能についての包括的な情報を提供します。エンタープライズのお客様からは、すぐに利用できる監視機能、Datadog や AWS CloudWatch などのツールを含む既存のオブザーバビリティスタックとの統合、そして ClickHouse の監視機能がセルフホスト型デプロイメントとどのように比較されるのかについて、頻繁にお問い合わせをいただきます。

## 高度なオブザーバビリティダッシュボード {#advanced-observability}

ClickHouse Cloud では、Monitoring セクションからアクセス可能な組み込みダッシュボードインターフェースを通じて包括的なモニタリング機能を提供します。これらのダッシュボードは、追加のセットアップ不要でリアルタイムにシステムおよびパフォーマンスメトリクスを可視化し、ClickHouse Cloud における本番環境のリアルタイム監視の主要なツールとして機能します。

- **Advanced Dashboard**: Monitoring → Advanced dashboard からアクセス可能なメインのダッシュボードインターフェースであり、クエリレート、リソース使用状況、システムヘルス、およびストレージパフォーマンスをリアルタイムで可視化します。このダッシュボードは別途の認証を必要とせず、インスタンスのアイドル状態を妨げず、本番システムへのクエリ負荷も追加しません。各可視化はカスタマイズ可能な SQL クエリによって動作し、ClickHouse 固有メトリクス、システムヘルス、Cloud 固有メトリクスのグループごとに標準提供のチャートが用意されています。ユーザーは SQL コンソールでカスタムクエリを直接作成することで、モニタリングを拡張できます。

:::note
これらのメトリクスへアクセスしても、基盤となるサービスへのクエリは発行されず、アイドル状態のサービスを起動することもありません。
:::

<Image img={AdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

これらの可視化をさらに拡張したいユーザーは、ClickHouse Cloud のダッシュボード機能を利用し、システムテーブルに対して直接クエリを実行できます。

- **ネイティブ Advanced Dashboard**: Monitoring セクション内の "You can still access the native advanced dashboard" からアクセス可能な代替ダッシュボードインターフェースです。これは別タブで開かれ、認証が必要となり、システムおよびサービスヘルスのモニタリング向けの代替 UI を提供します。このダッシュボードでは、ユーザーが基盤となる SQL クエリを変更できる高度な分析が可能です。

<Image img={NativeAdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

どちらのダッシュボードも外部コンポーネントに依存することなくサービスヘルスとパフォーマンスを即座に可視化でき、ClickStack のようなデバッグ特化の外部ツールとは一線を画しています。

ダッシュボードの詳細な機能および利用可能なメトリクスについては、[高度なダッシュボードに関するドキュメント](/cloud/manage/monitor/advanced-dashboard)を参照してください。

## クエリインサイトとリソース監視 {#query-insights}

ClickHouse Cloud には、次の追加監視機能が含まれます:

- Query Insights: クエリパフォーマンスの分析およびトラブルシューティングのための組み込みインターフェース
- Resource Utilization Dashboard: メモリ、CPU 割り当て、およびデータ転送パターンを追跡します。CPU 使用率とメモリ使用率のグラフは、指定した期間内での最大利用率メトリクスを表示します。CPU 使用率グラフはシステムレベルの CPU 利用率メトリクスを示しており、ClickHouse の CPU 利用率メトリクスではありません。

詳細な機能については、[query insights](/cloud/get-started/query-insights) および [resource utilization](/operations/monitoring#resource-utilization) のドキュメントを参照してください。

## Prometheus 互換メトリクスエンドポイント {#prometheus}

ClickHouse Cloud は Prometheus エンドポイントを提供します。これにより、ユーザーは既存のワークフローを維持し、チームが持つ既存の専門知識を活用しながら、ClickHouse のメトリクスを Grafana、Datadog、その他の Prometheus 互換ツールを含むエンタープライズ向け監視プラットフォームに統合できます。 

組織レベルのエンドポイントはすべてのサービスからメトリクスをフェデレーションし、サービスごとのエンドポイントではよりきめ細かな監視が可能です。主な特長は次のとおりです。

- フィルタリング済みメトリクスオプション: オプションの `filtered_metrics=true` パラメータにより、1000 を超える利用可能なメトリクスから、コスト最適化と監視対象の明確化のために 125 個の「ミッションクリティカル」なメトリクスにペイロードを絞り込みます
- キャッシュされたメトリクス配信: 本番システムへのクエリ負荷を最小化するため、1 分ごとに更新されるマテリアライズドビューを使用します

:::note
このアプローチはサービスのアイドル状態を尊重し、サービスがクエリを積極的に処理していないときにコスト最適化を可能にします。この API エンドポイントは ClickHouse Cloud の API 認証情報を利用します。エンドポイント構成の詳細については、ClickHouse Cloud の [Prometheus ドキュメント](/integrations/prometheus) を参照してください。
:::

<ObservabilityIntegrations/>

### ClickStack のデプロイオプション {#clickstack-deployment}

- **ClickHouse Cloud 上の HyperDX**（プライベートプレビュー）：HyperDX は任意の ClickHouse Cloud サービス上で起動できます。
- [Helm](/use-cases/observability/clickstack/deployment/helm)：Kubernetes ベースのデバッグ用環境に推奨されます。ClickHouse Cloud との連携をサポートし、`values.yaml` を通じて環境固有の設定、リソース制限、およびスケーリングを行えます。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)：各コンポーネント（ClickHouse、HyperDX、OTel collector、MongoDB）を個別にデプロイします。特に ClickHouse Cloud と連携する際には、compose ファイルを変更して、ClickHouse や OpenTelemetry Collector など未使用のコンポーネントを削除できます。
- [HyperDX のみ](/use-cases/observability/clickstack/deployment/hyperdx-only)：スタンドアロンの HyperDX コンテナ。

利用可能なデプロイオプションやアーキテクチャの詳細については、[ClickStack のドキュメント](/use-cases/observability/clickstack/overview)および[データインジェストガイド](/use-cases/observability/clickstack/ingesting-data/overview)を参照してください。

:::note
ClickHouse Cloud の Prometheus エンドポイントから OpenTelemetry Collector 経由でメトリクスを収集し、可視化のために別の ClickStack デプロイメントへ転送することもできます。
:::

<DirectIntegrations/>

<CommunityMonitoring/>

## システムへの影響に関する考慮事項 {#system-impact}

上記のアプローチはいずれも、Prometheus エンドポイントへの依存、ClickHouse Cloud による管理、またはシステムテーブルへの直接クエリのいずれか、もしくはそれらの組み合わせを利用します。
このうち後者の選択肢は、本番環境の ClickHouse サービスへのクエリに依存します。これは監視対象システムへのクエリ負荷を増加させ、ClickHouse Cloud インスタンスがアイドル状態になることを防ぐため、コスト最適化に影響します。さらに、本番システムが障害を起こした場合、両者が密結合しているために監視も影響を受ける可能性があります。このアプローチは詳細な内部観察やデバッグには有効ですが、リアルタイムな本番監視にはあまり適していません。直接的な Grafana 連携と、次のセクションで説明する外部ツール連携アプローチを評価する際には、詳細なシステム分析能力と運用上のオーバーヘッドとのトレードオフを考慮してください。