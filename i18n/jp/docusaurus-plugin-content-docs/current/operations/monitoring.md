---
slug: /operations/monitoring
sidebar_position: 45
sidebar_label: モニタリング
description: ハードウェアリソースの利用状況やClickHouseサーバーメトリクスを監視できます。
keywords: [モニタリング, 可観測性, 高度なダッシュボード, ダッシュボード, 可観測性ダッシュボード]
---


# モニタリング

:::note
このガイドで概説されている監視データはClickHouse Cloudでアクセス可能です。以下に説明する組み込みダッシュボードを介して表示されるだけでなく、基本的および高度なパフォーマンスメトリクスもメインサービスコンソールで直接表示できます。
:::

監視できる項目：

- ハードウェアリソースの利用状況。
- ClickHouseサーバーメトリクス。

## 組み込み高度可観測性ダッシュボード {#built-in-advanced-observability-dashboard}

<img width="400" alt="Screenshot 2023-11-12 at 6 08 58 PM" src="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" />

ClickHouseには組み込みの高度な可観測性ダッシュボード機能があり、`$HOST:$PORT/dashboard`（ユーザー名とパスワードが必要）でアクセスでき、以下のメトリクスを表示します：
- クエリ/秒
- CPU 使用率 (コア)
- 実行中のクエリ
- 実行中のマージ
- 選択されたバイト/秒
- IO 待機
- CPU 待機
- OS CPU 使用率 (ユーザースペース)
- OS CPU 使用率 (カーネル)
- ディスクからの読み込み
- ファイルシステムからの読み込み
- メモリ (追跡中)
- 挿入された行/秒
- MergeTree パーツの合計
- パーティションあたりの最大パーツ

## リソースの利用状況 {#resource-utilization}

ClickHouseは、次のようなハードウェアリソースの状態を自動的に監視します：

- プロセッサーの負荷と温度。
- ストレージシステム、RAM、およびネットワークの利用状況。

このデータは`system.asynchronous_metric_log`テーブルに収集されます。

## ClickHouseサーバーメトリクス {#clickhouse-server-metrics}

ClickHouseサーバーには、自己状態監視のための組み込みのツールがあります。

サーバーイベントを追跡するには、サーバーログを使用します。構成ファイルの[logger](../operations/server-configuration-parameters/settings.md#logger)セクションを参照してください。

ClickHouseは次のものを収集します：

- サーバーが計算リソースをどのように使用しているかに関するさまざまなメトリクス。
- クエリ処理に関する一般的な統計。

メトリクスは、[system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events)、および[system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルで見つけることができます。

ClickHouseを設定してメトリクスを[Graphite](https://github.com/graphite-project)にエクスポートできます。ClickHouseサーバー構成ファイルの[Graphiteセクション](../operations/server-configuration-parameters/settings.md#graphite)を参照してください。メトリクスのエクスポートを構成する前に、公式の[ガイド](https://graphite.readthedocs.io/en/latest/install.html)に従ってGraphiteをセットアップする必要があります。

ClickHouseを設定してメトリクスを[Prometheus](https://prometheus.io)にエクスポートできます。ClickHouseサーバー構成ファイルの[Prometheusセクション](../operations/server-configuration-parameters/settings.md#prometheus)を参照してください。メトリクスのエクスポートを構成する前に、公式の[ガイド](https://prometheus.io/docs/prometheus/latest/installation/)に従ってPrometheusをセットアップする必要があります。

さらに、HTTP APIを介してサーバーの可用性を監視できます。`HTTP GET`リクエストを`/ping`に送信します。サーバーが利用可能な場合、`200 OK`で応答します。

クラスタ構成のサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries)パラメータを設定し、HTTPリソース`/replicas_status`を使用する必要があります。`/replicas_status`へのリクエストは、レプリカが利用可能で、他のレプリカに遅れていない場合は`200 OK`を返します。レプリカが遅れている場合は、ギャップに関する情報とともに`503 HTTP_SERVICE_UNAVAILABLE`を返します。
