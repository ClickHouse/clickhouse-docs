---
slug: /use-cases/observability/cloud-monitoring
title: 'ClickHouse Cloud のモニタリング'
sidebar_label: 'ClickHouse Cloud のモニタリング'
description: 'ClickHouse Cloud モニタリングガイド'
doc_type: 'guide'
keywords: ['observability', 'monitoring', 'cloud', 'metrics', 'system health']
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# ClickHouse Cloudのモニタリング {#cloud-monitoring}

本ガイドでは、ClickHouse Cloudを評価中のエンタープライズチームに向けて、本番環境デプロイメントにおけるモニタリングおよび可観測性機能に関する包括的な情報を提供します。エンタープライズのお客様からは、標準搭載のモニタリング機能、DatadogやAWS CloudWatchなどのツールを含む既存の可観測性スタックとの統合、そしてClickHouseのモニタリングがセルフホスト型デプロイメントと比較してどう異なるかについて、よくお問い合わせをいただきます。


## 高度な可観測性ダッシュボード {#advanced-observability}

ClickHouse Cloudは、Monitoringセクションからアクセス可能な組み込みダッシュボードインターフェースを通じて包括的な監視機能を提供します。これらのダッシュボードは、追加のセットアップを必要とせずにシステムとパフォーマンスのメトリクスをリアルタイムで可視化し、ClickHouse Cloud内でのリアルタイム本番環境監視の主要なツールとして機能します。

- **Advanced Dashboard**: Monitoring → Advanced dashboardからアクセス可能なメインダッシュボードインターフェースは、クエリレート、リソース使用状況、システムヘルス、ストレージパフォーマンスへのリアルタイムな可視性を提供します。このダッシュボードは個別の認証を必要とせず、インスタンスのアイドル状態を妨げることもなく、本番システムにクエリ負荷を追加することもありません。各可視化はカスタマイズ可能なSQLクエリによって駆動され、すぐに使用できるチャートはClickHouse固有、システムヘルス、Cloud固有のメトリクスにグループ化されています。ユーザーはSQLコンソールで直接カスタムクエリを作成することで監視を拡張できます。

:::note
これらのメトリクスへのアクセスは、基盤となるサービスにクエリを発行せず、アイドル状態のサービスをウェイクアップすることもありません。
:::

<Image img={AdvancedDashboard} size='lg' alt='高度なダッシュボード' />

これらの可視化を拡張したいユーザーは、ClickHouse Cloudのダッシュボード機能を使用して、システムテーブルに直接クエリを実行できます。

- **Native advanced dashboard**: Monitoringセクション内の「You can still access the native advanced dashboard」からアクセス可能な代替ダッシュボードインターフェースです。これは認証を伴う別タブで開き、システムとサービスヘルス監視のための代替UIを提供します。このダッシュボードは高度な分析を可能にし、ユーザーは基盤となるSQLクエリを変更できます。

<Image img={NativeAdvancedDashboard} size='lg' alt='高度なダッシュボード' />

両方のダッシュボードは、外部依存関係なしにサービスヘルスとパフォーマンスへの即座の可視性を提供し、ClickStackのような外部デバッグ重視ツールとは区別されます。

ダッシュボード機能と利用可能なメトリクスの詳細については、[高度なダッシュボードのドキュメント](/cloud/manage/monitor/advanced-dashboard)を参照してください。


## クエリインサイトとリソース監視 {#query-insights}

ClickHouse Cloudには、以下の追加監視機能が含まれています:

- Query Insights: クエリパフォーマンスの分析とトラブルシューティングのための組み込みインターフェース
- Resource Utilization Dashboard: メモリ、CPU割り当て、データ転送パターンを追跡します。CPU使用率とメモリ使用率のグラフは、特定の期間における最大使用率メトリックを表示します。CPU使用率グラフは、システムレベルのCPU使用率メトリックを表示します(ClickHouseのCPU使用率メトリックではありません)。

詳細な機能については、[query insights](/cloud/get-started/query-insights)および[resource utilization](/operations/monitoring#resource-utilization)のドキュメントを参照してください。


## Prometheus互換メトリクスエンドポイント {#prometheus}

ClickHouse CloudはPrometheusエンドポイントを提供します。これにより、ユーザーは既存のワークフローを維持し、チームの専門知識を活用しながら、ClickHouseメトリクスをGrafana、Datadog、その他のPrometheus互換ツールを含むエンタープライズ監視プラットフォームに統合できます。

組織レベルのエンドポイントは全サービスからメトリクスを集約し、サービスごとのエンドポイントは詳細な監視を提供します。主な機能は以下の通りです:

- フィルタリングされたメトリクスオプション: オプションの`filtered_metrics=true`パラメータにより、1000以上の利用可能なメトリクスから125の「ミッションクリティカル」メトリクスにペイロードを削減し、コスト最適化と監視の焦点を絞りやすくします
- キャッシュされたメトリクス配信: 本番システムへのクエリ負荷を最小限に抑えるため、毎分更新されるマテリアライズドビューを使用します

:::note
このアプローチはサービスのアイドリング動作を考慮し、サービスがクエリを積極的に処理していない場合のコスト最適化を可能にします。このAPIエンドポイントはClickHouse Cloud APIクレデンシャルに依存します。エンドポイント設定の詳細については、クラウド[Prometheusドキュメント](/integrations/prometheus)を参照してください。
:::

<ObservabilityIntegrations />

### ClickStackデプロイメントオプション {#clickstack-deployment}

- **HyperDX in Clickhouse Cloud**（プライベートプレビュー）: HyperDXは任意のClickhouse Cloudサービス上で起動できます。
- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetesベースのデバッグ環境に推奨されます。ClickHouse Cloudとの統合をサポートし、`values.yaml`を介した環境固有の設定、リソース制限、スケーリングが可能です。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 各コンポーネント（ClickHouse、HyperDX、OTelコレクター、MongoDB）を個別にデプロイします。ClickHouse Cloudと統合する際、ユーザーはcomposeファイルを変更して、特にClickHouseとOpen Telemetry Collectorなど、使用しないコンポーネントを削除できます。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): スタンドアロンのHyperDXコンテナ。

完全なデプロイメントオプションとアーキテクチャの詳細については、[ClickStackドキュメント](/use-cases/observability/clickstack/overview)と[データ取り込みガイド](/use-cases/observability/clickstack/ingesting-data/overview)を参照してください。

:::note
ユーザーは、OpenTelemetry Collectorを介してClickHouse Cloud Prometheusエンドポイントからメトリクスを収集し、可視化のために別のClickStackデプロイメントに転送することもできます。
:::

<DirectIntegrations />

<CommunityMonitoring />


## システムへの影響に関する考慮事項 {#system-impact}

上記のすべてのアプローチは、Prometheusエンドポイントの利用、ClickHouse Cloudによる管理、またはシステムテーブルへの直接クエリのいずれか、あるいはこれらの組み合わせを使用します。
最後のオプションは、本番環境のClickHouseサービスへのクエリに依存します。これにより、監視対象のシステムにクエリ負荷が追加され、ClickHouse Cloudインスタンスがアイドル状態になることを妨げるため、コスト最適化に影響を与えます。さらに、本番システムに障害が発生した場合、両者が密結合しているため、監視も影響を受ける可能性があります。このアプローチは、詳細な内部調査やデバッグには有効ですが、リアルタイムの本番監視にはあまり適していません。次のセクションで説明する外部ツール統合アプローチと比較して、Grafanaの直接統合を評価する際には、詳細なシステム分析機能と運用オーバーヘッドの間のトレードオフを考慮してください。
