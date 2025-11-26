---
slug: /use-cases/observability/cloud-monitoring
title: 'ClickHouse Cloud の監視'
sidebar_label: 'ClickHouse Cloud の監視'
description: 'ClickHouse Cloud 監視ガイド'
doc_type: 'guide'
keywords: ['可観測性', '監視', 'クラウド', 'メトリクス', 'システムの健全性']
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# ClickHouse Cloud のモニタリング {#cloud-monitoring}

このガイドでは、ClickHouse Cloud の評価を行っているエンタープライズチーム向けに、本番デプロイメントにおけるモニタリングおよびオブザーバビリティ機能について包括的な情報を提供します。エンタープライズのお客様からは、標準で利用可能なモニタリング機能、Datadog や AWS CloudWatch などのツールを含む既存のオブザーバビリティスタックとの統合、そして ClickHouse のモニタリング機能がセルフホスト型デプロイメントとどのように比較されるかについて、頻繁にご質問をいただきます。



## 高度なオブザーバビリティダッシュボード {#advanced-observability}

ClickHouse Cloud は、Monitoring セクションからアクセス可能な組み込みダッシュボードインターフェースを通じて、包括的な監視機能を提供します。これらのダッシュボードは追加のセットアップなしにシステムおよびパフォーマンスメトリクスをリアルタイムに可視化し、ClickHouse Cloud における本番環境のリアルタイム監視における主要なツールとして機能します。

- **Advanced Dashboard**: Monitoring → Advanced dashboard からアクセスできるメインのダッシュボードインターフェースであり、クエリレート、リソース使用状況、システムヘルス、ストレージパフォーマンスをリアルタイムに可視化できます。このダッシュボードでは追加の認証は不要で、インスタンスのアイドル状態を解除することはなく、本番システムへのクエリ負荷も増加させません。各ビジュアライゼーションはカスタマイズ可能な SQL クエリによって駆動されており、標準搭載のチャートは ClickHouse 固有、システムヘルス、ClickHouse Cloud 固有のメトリクスごとにグループ化されています。ユーザーは SQL コンソールでカスタムクエリを作成することで、監視機能を拡張できます。

:::note
これらのメトリクスにアクセスしても、基盤となるサービスへのクエリは発行されず、アイドル状態のサービスが起動されることもありません。
:::

<Image img={AdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

これらの可視化を拡張したいユーザーは、ClickHouse Cloud のダッシュボード機能を使用してシステムテーブルを直接クエリできます。

- **ネイティブ Advanced ダッシュボード**: Monitoring セクション内の「You can still access the native advanced dashboard」というリンクからアクセスできる代替ダッシュボードインターフェースです。これは別タブで認証付きで開かれ、システムおよびサービスヘルスを監視するための代替 UI を提供します。このダッシュボードでは、ユーザーが基盤となる SQL クエリを変更して高度な分析を行うことができます。

<Image img={NativeAdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

どちらのダッシュボードも外部コンポーネントに依存することなくサービスヘルスとパフォーマンスを即座に可視化でき、ClickStack のような外部のデバッグ特化ツールとは一線を画しています。

ダッシュボードの詳細な機能および利用可能なメトリクスについては、[高度なダッシュボードのドキュメント](/cloud/manage/monitor/advanced-dashboard)を参照してください。



## クエリインサイトとリソース監視 {#query-insights}

ClickHouse Cloud には追加の監視機能が含まれています：

- Query Insights：クエリのパフォーマンス分析およびトラブルシューティングのための組み込みインターフェイス
- Resource Utilization Dashboard：メモリ、CPU の割り当て、およびデータ転送パターンを追跡します。CPU 使用率グラフとメモリ使用率グラフには、特定の期間における最大利用率メトリクスが表示されます。CPU 使用率グラフは、システムレベルの CPU 利用率メトリクスを示しており（ClickHouse の CPU 利用率メトリクスではありません）。

詳細な機能については、[Query Insights](/cloud/get-started/query-insights) および [Resource Utilization](/operations/monitoring#resource-utilization) のドキュメントを参照してください。



## Prometheus 互換メトリクスエンドポイント {#prometheus}

ClickHouse Cloud は Prometheus エンドポイントを提供しています。これにより、既存のワークフローを維持しつつ、チームの既存の専門知識を活用し、ClickHouse のメトリクスを Grafana、Datadog をはじめとする各種 Prometheus 互換ツールを含むエンタープライズ監視プラットフォームへ統合できます。 

組織レベルのエンドポイントはすべてのサービスからメトリクスを集約し、サービスごとのエンドポイントはより細かな監視を提供します。主な特徴は次のとおりです。
- フィルタリング済みメトリクスオプション: オプションの `filtered_metrics=true` パラメータにより、利用可能な 1000 以上のメトリクスから 125 個の「ミッションクリティカル」なメトリクスにペイロードを削減し、コスト最適化と監視対象の絞り込みを容易にします
- キャッシュされたメトリクス配信: 本番システムへのクエリ負荷を最小限に抑えるため、毎分更新されるマテリアライズドビューを利用します

:::note
この方式はサービスのアイドル状態での挙動を尊重し、クエリを積極的に処理していないときのコスト最適化を可能にします。この API エンドポイントは ClickHouse Cloud の API 認証情報に依存します。エンドポイント構成の詳細については、ClickHouse Cloud の [Prometheus ドキュメント](/integrations/prometheus) を参照してください。
:::

<ObservabilityIntegrations/>

### ClickStack のデプロイオプション {#clickstack-deployment}

- **HyperDX in ClickHouse Cloud**（プライベートプレビュー）: HyperDX は任意の ClickHouse Cloud サービス上で起動できます。
- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetes ベースのデバッグ環境に推奨されます。ClickHouse Cloud との統合をサポートし、`values.yaml` を介した環境固有の設定、リソース制限、およびスケーリングを可能にします。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 各コンポーネント（ClickHouse、HyperDX、OTel collector、MongoDB）を個別にデプロイします。ClickHouse Cloud と統合する際に、特に ClickHouse と OTel collector を削除するために、ユーザーは compose ファイルを編集できます。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): 単体の HyperDX コンテナ。

すべてのデプロイオプションおよびアーキテクチャの詳細については、[ClickStack ドキュメント](/use-cases/observability/clickstack/overview) と [データインジェストガイド](/use-cases/observability/clickstack/ingesting-data/overview) を参照してください。

:::note
ユーザーは、ClickHouse Cloud の Prometheus エンドポイントからメトリクスを OTel collector 経由で収集し、可視化のために別の ClickStack デプロイメントへ転送することもできます。
:::

<DirectIntegrations/>

<CommunityMonitoring/>



## システムへの影響に関する考慮事項 {#system-impact}

上記のすべてのアプローチは、Prometheus エンドポイントへの依存、ClickHouse Cloud による管理、またはシステムテーブルへの直接クエリ、あるいはそれらの組み合わせを利用します。
このうち後者の方法は、本番環境の ClickHouse サービスに対してクエリを投げることに依存しています。これにより、監視対象システムへのクエリ負荷が増加し、ClickHouse Cloud インスタンスがアイドル状態になりにくくなるため、コスト最適化に影響を与えます。さらに、本番システムに障害が発生した場合、両者が密接に結び付いているため、監視も影響を受ける可能性があります。このアプローチはシステムの深い解析やデバッグには有効ですが、リアルタイムな本番監視にはあまり適していません。以降のセクションで説明する外部ツール連携アプローチと Grafana からの直接連携を比較検討する際には、詳細なシステム分析機能と運用オーバーヘッドとのトレードオフを考慮してください。
