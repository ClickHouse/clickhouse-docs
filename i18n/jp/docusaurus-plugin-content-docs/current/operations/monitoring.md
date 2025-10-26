---
'description': 'ハードウェアリソースの利用状況を監視でき、ClickHouseサーバーのメトリックも監視できます。'
'keywords':
- 'monitoring'
- 'observability'
- 'advanced dashboard'
- 'dashboard'
- 'observability dashboard'
'sidebar_label': '監視'
'sidebar_position': 45
'slug': '/operations/monitoring'
'title': '監視'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';


# 監視

:::note
このガイドに記載されている監視データは、ClickHouse Cloudで利用可能です。以下で説明する組み込みダッシュボードを通じて表示されるだけでなく、基本的および高度なパフォーマンスメトリクスも、メインサービスコンソールで直接表示できます。
:::

監視できる内容：

- ハードウェアリソースの利用状況。
- ClickHouseサーバーメトリクス。

## 組み込みの高度な可観測ダッシュボード {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="Screenshot 2023-11-12 at 6 08 58 PM" size="md" />

ClickHouseには、`$HOST:$PORT/dashboard` にアクセスすることで利用できる組み込みの高度な可観測ダッシュボード機能があります（ユーザー名とパスワードが必要です）。以下のメトリクスが表示されます：
- クエリ/秒
- CPU使用率（コア）
- 実行中のクエリ
- 実行中のマージ
- 選択バイト/秒
- IO待機
- CPU待機
- OS CPU使用率（ユーザースペース）
- OS CPU使用率（カーネル）
- ディスクからの読み取り
- ファイルシステムからの読み取り
- メモリ（トラッキング済み）
- 挿入された行/秒
- 合計MergeTreeパーツ
- パーティションの最大パーツ数

## リソース利用状況 {#resource-utilization}

ClickHouseは、以下のようなハードウェアリソースの状態を自動的に監視します：

- プロセッサの負荷と温度。
- ストレージシステム、RAM、およびネットワークの利用状況。

このデータは `system.asynchronous_metric_log` テーブルに収集されます。

## ClickHouseサーバーメトリクス {#clickhouse-server-metrics}

ClickHouseサーバーには自己状態監視のための組み込みのインストゥルメントがあります。

サーバーイベントを追跡するには、サーバーログを使用します。構成ファイルの [logger](../operations/server-configuration-parameters/settings.md#logger) セクションを参照してください。

ClickHouseは以下を収集します：

- サーバーが計算リソースをどのように使用しているかのさまざまなメトリクス。
- クエリ処理に関する一般的な統計。

メトリクスは [system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events)、および [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルで確認できます。

ClickHouseを設定して、メトリクスを [Graphite](https://github.com/graphite-project) にエクスポートすることができます。ClickHouseサーバ構成ファイルの [Graphiteセクション](../operations/server-configuration-parameters/settings.md#graphite) を参照してください。メトリクスのエクスポートを構成する前に、公式の [ガイド](https://graphite.readthedocs.io/en/latest/install.html) に従ってGraphiteを設定する必要があります。

ClickHouseを設定して、メトリクスを [Prometheus](https://prometheus.io) にエクスポートすることができます。ClickHouseサーバ構成ファイルの [Prometheusセクション](../operations/server-configuration-parameters/settings.md#prometheus) を参照してください。メトリクスのエクスポートを構成する前に、公式の [ガイド](https://prometheus.io/docs/prometheus/latest/installation/) に従ってPrometheusを設定する必要があります。

さらに、HTTP APIを通じてサーバーの可用性を監視できます。`HTTP GET` リクエストを `/ping` に送信してください。サーバーが利用可能な場合、`200 OK` と応答します。

クラスタ構成でサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) パラメータを設定し、HTTPリソース `/replicas_status` を使用する必要があります。`/replicas_status` へのリクエストは、レプリカが利用可能で、他のレプリカに遅れがない場合、`200 OK` を返します。レプリカが遅れている場合、遅延に関する情報とともに `503 HTTP_SERVICE_UNAVAILABLE` を返します。
