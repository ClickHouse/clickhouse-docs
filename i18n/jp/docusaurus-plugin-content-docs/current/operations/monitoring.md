description: 'ハードウェアリソースの使用状況と、ClickHouseサーバーメトリクスを監視できます。'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability dashboard']
sidebar_label: '監視'
sidebar_position: 45
slug: /operations/monitoring
title: '監視'
```

import Image from '@theme/IdealImage';


# 監視

:::note
このガイドで示す監視データはClickHouse Cloudでアクセス可能です。以下に説明する内蔵ダッシュボードを通じて表示されるだけでなく、基本的および高度なパフォーマンスメトリクスもメインサービスコンソールで直接見ることができます。
:::

監視可能な項目：

- ハードウェアリソースの利用状況。
- ClickHouseサーバーメトリクス。

## 内蔵の高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="2023-11-12 6 08 58 PMのスクリーンショット" size="md" />

ClickHouseには、 `$HOST:$PORT/dashboard`（ユーザー名とパスワードが必要）によってアクセスできる高度な可観測性ダッシュボード機能が組み込まれており、以下のメトリクスを表示します：
- 秒間クエリ
- CPU使用率（コア）
- 実行中のクエリ
- 実行中のマージ
- 秒あたりの選択バイト
- IO待機
- CPU待機
- OSのCPU使用率（ユーザースペース）
- OSのCPU使用率（カーネル）
- ディスクからの読み取り
- ファイルシステムからの読み取り
- メモリ（トラッキング済み）
- 秒間挿入行数
- MergeTreeパーツ合計
- パーティションの最大パーツ数

## リソース利用状況 {#resource-utilization}

ClickHouseは、次のようにハードウェアリソースの状態も自動的に監視します：

- プロセッサの負荷と温度。
- ストレージシステム、RAM、ネットワークの利用状況。

このデータは `system.asynchronous_metric_log` テーブルに収集されます。

## ClickHouseサーバーメトリクス {#clickhouse-server-metrics}

ClickHouseサーバーには、自己状態監視のための組み込みツールがあります。

サーバーイベントをトラックするにはサーバーログを使用します。設定ファイルの[logger](../operations/server-configuration-parameters/settings.md#logger)セクションを参照してください。

ClickHouseは以下を収集します：

- サーバーが計算リソースをどのように使用しているかのさまざまなメトリクス。
- クエリ処理の一般的な統計。

メトリクスは、[system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events)、および[system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルで見つけることができます。

ClickHouseを構成してメトリクスを[Graphite](https://github.com/graphite-project)にエクスポートすることができます。ClickHouseサーバー設定ファイルの[Graphiteセクション](../operations/server-configuration-parameters/settings.md#graphite)を参照してください。メトリクスのエクスポートを構成する前に、公式の[ガイド](https://graphite.readthedocs.io/en/latest/install.html)に従ってGraphiteのセットアップを行う必要があります。

ClickHouseを構成してメトリクスを[Prometheus](https://prometheus.io)にエクスポートすることもできます。ClickHouseサーバー設定ファイルの[Prometheusセクション](../operations/server-configuration-parameters/settings.md#prometheus)を参照してください。メトリクスのエクスポートを構成する前に、公式の[ガイド](https://prometheus.io/docs/prometheus/latest/installation/)に従ってPrometheusのセットアップを行う必要があります。

さらに、HTTP APIを通じてサーバーの可用性を監視できます。`HTTP GET`リクエストを`/ping`に送信します。サーバーが利用可能な場合、`200 OK`で応答します。

クラスタ構成でサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries)パラメータを設定し、HTTPリソース`/replicas_status`を使用する必要があります。`/replicas_status`へのリクエストは、レプリカが利用可能で他のレプリカに遅れていない場合、`200 OK`を返します。レプリカが遅れている場合、ギャップに関する情報とともに`503 HTTP_SERVICE_UNAVAILABLE`を返します。
