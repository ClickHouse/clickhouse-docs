---
slug: /operations/monitoring
sidebar_position: 45
sidebar_label: 監視
description: ハードウェアリソースの利用状況とClickHouseサーバーメトリクスを監視できます。
keywords: [監視, 可観測性, 高度なダッシュボード, ダッシュボード, 可観測性ダッシュボード]
---

# 監視

:::note
このガイドで概説されている監視データは、ClickHouse Cloudでアクセス可能です。以下で説明する組み込みダッシュボードを通じて表示されるだけでなく、基本的なパフォーマンスメトリクスと高度なメトリクスをサービスコンソールで直接確認することもできます。
:::

監視できる内容：

- ハードウェアリソースの利用状況
- ClickHouseサーバーメトリクス

## 組み込みの高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard}

<img width="400" alt="Screenshot 2023-11-12 at 6 08 58 PM" src="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" />

ClickHouseには、次のメトリクスを表示する組み込みの高度な可観測性ダッシュボード機能があります。このダッシュボードには`$HOST:$PORT/dashboard`（ユーザー名とパスワードが必要）からアクセス可能です：
- クエリ/秒
- CPU使用率（コア）
- 実行中のクエリ
- 実行中のマージ
- 選択されたバイト数/秒
- IO待機
- CPU待機
- OS CPU使用率（ユーザースペース）
- OS CPU使用率（カーネル）
- ディスクからの読み取り
- ファイルシステムからの読み取り
- メモリ（追跡中）
- 挿入された行/秒
- 総MergeTreeパーツ
- パーティションごとの最大パーツ数

## リソース利用状況 {#resource-utilization}

ClickHouseは、次のようなハードウェアリソースの状態も自動的に監視します：

- プロセッサの負荷と温度
- ストレージシステム、RAM、ネットワークの利用状況

このデータは、`system.asynchronous_metric_log` テーブルに収集されます。

## ClickHouseサーバーメトリクス {#clickhouse-server-metrics}

ClickHouseサーバーには、自己状態の監視のための組み込みインストゥルメントがあります。

サーバーイベントを追跡するには、サーバーログを使用します。設定ファイルの[logger](../operations/server-configuration-parameters/settings.md#logger)セクションを参照してください。

ClickHouseは、次のようなメトリクスを収集します：

- サーバーが計算リソースをどのように使用しているかに関するさまざまなメトリクス
- クエリ処理に関する一般的な統計情報

メトリクスは、[system.metrics](../operations/system-tables/metrics.md#system_tables-metrics)、[system.events](../operations/system-tables/events.md#system_tables-events)、および[system.asynchronous_metrics](../operations/system-tables/asynchronous_metrics.md#system_tables-asynchronous_metrics)テーブルで見つけることができます。

ClickHouseを設定して、メトリクスを[Graphite](https://github.com/graphite-project)にエクスポートできます。ClickHouseサーバーの設定ファイルの[Graphiteセクション](../operations/server-configuration-parameters/settings.md#graphite)を確認してください。メトリクスのエクスポートを設定する前に、公式の[ガイド](https://graphite.readthedocs.io/en/latest/install.html)に従ってGraphiteをセットアップする必要があります。

ClickHouseを設定して、メトリクスを[Prometheus](https://prometheus.io)にエクスポートすることも可能です。ClickHouseサーバーの設定ファイルの[Prometheusセクション](../operations/server-configuration-parameters/settings.md#prometheus)を参照してください。メトリクスのエクスポートを設定する前に、公式の[ガイド](https://prometheus.io/docs/prometheus/latest/installation/)に従ってPrometheusをセットアップする必要があります。

さらに、HTTP APIを通じてサーバーの可用性を監視できます。`/ping`にHTTP GETリクエストを送信します。サーバーが利用可能な場合は`200 OK`と応答します。

クラスター構成でサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries)パラメータを設定し、HTTPリソース`/replicas_status`を使用する必要があります。`/replicas_status`へのリクエストは、レプリカが利用可能で他のレプリカに遅れていない場合は`200 OK`を返します。レプリカが遅れている場合は、ギャップに関する情報と共に`503 HTTP_SERVICE_UNAVAILABLE`を返します。
