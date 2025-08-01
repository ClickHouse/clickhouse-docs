---
description: 'ハードウェアリソースの利用状況やClickHouseサーバーのメトリクスを監視できます。'
keywords:
- 'monitoring'
- 'observability'
- 'advanced dashboard'
- 'dashboard'
- 'observability dashboard'
sidebar_label: 'モニタリング'
sidebar_position: 45
slug: '/operations/monitoring'
title: 'モニタリング'
---

import Image from '@theme/IdealImage';


# 監視

:::note
このガイドに記載されている監視データは、ClickHouse Cloud でアクセス可能です。以下に説明する組み込みのダッシュボードを介して表示されるほか、基本的および高度なパフォーマンス指標はメインサービスコンソールで直接表示することもできます。
:::

以下を監視できます：

- ハードウェアリソースの利用状況。
- ClickHouse サーバーのメトリック。

## 組み込みの高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="Screenshot 2023-11-12 at 6 08 58 PM" size="md" />

ClickHouse には、次のメトリックを表示する組み込みの高度な可観測性ダッシュボード機能があります。これは `$HOST:$PORT/dashboard` にアクセスすることで利用可能です（ユーザー名とパスワードが必要です）：

- クエリ/秒
- CPU 使用率 (コア数)
- 実行中のクエリ数
- 実行中のマージ数
- 選択されたバイト/秒
- IO 待機
- CPU 待機
- OS CPU 使用率 (ユーザースペース)
- OS CPU 使用率 (カーネル)
- ディスクからの読み取り
- ファイルシステムからの読み取り
- メモリ (追跡済み)
- 挿入された行/秒
- 総 MergeTree パーツ
- 各パーティションの最大パーツ

## リソース利用状況 {#resource-utilization}

ClickHouse は、次のようなハードウェアリソースの状態を自動で監視します：

- プロセッサの負荷と温度。
- ストレージシステム、RAM、およびネットワークの利用状況。

このデータは `system.asynchronous_metric_log` テーブルに収集されます。

## ClickHouse サーバーメトリック {#clickhouse-server-metrics}

ClickHouse サーバーにはセルフ状態監視のための組み込み機器があります。

サーバーイベントを追跡するには、サーバーログを使用します。設定ファイルの [logger](../operations/server-configuration-parameters/settings.md#logger) セクションを参照してください。

ClickHouse は次の情報を収集します：

- サーバーが計算リソースをどのように使用しているかの異なるメトリック。
- クエリ処理に関する一般的な統計。

メトリックは [system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events)、および [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルで見つけることができます。

ClickHouse を構成してメトリックを [Graphite](https://github.com/graphite-project) にエクスポートすることができます。ClickHouse サーバーの設定ファイルの [Graphite セクション](../operations/server-configuration-parameters/settings.md#graphite) を参照してください。メトリックのエクスポートを構成する前に、公式の [ガイド](https://graphite.readthedocs.io/en/latest/install.html) に従って Graphite のセットアップを行う必要があります。

ClickHouse を構成してメトリックを [Prometheus](https://prometheus.io) にエクスポートすることもできます。ClickHouse サーバーの設定ファイルの [Prometheus セクション](../operations/server-configuration-parameters/settings.md#prometheus) を参照してください。メトリックのエクスポートを構成する前に、公式の [ガイド](https://prometheus.io/docs/prometheus/latest/installation/) に従って Prometheus のセットアップを行う必要があります。

さらに、HTTP API を通じてサーバーの可用性を監視することができます。`HTTP GET` リクエストを `/ping` に送信します。サーバーが利用可能な場合、`200 OK` で応答します。

クラスタ構成のサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) パラメータを設定し、HTTP リソース `/replicas_status` を使用します。`/replicas_status` へのリクエストは、レプリカが利用可能であり、他のレプリカに遅延がない場合 `200 OK` を返します。レプリカが遅延している場合、遅延に関する情報を含む `503 HTTP_SERVICE_UNAVAILABLE` を返します。
