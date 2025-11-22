---
description: 'ハードウェアリソースの利用状況および ClickHouse サーバーのメトリクスを監視できます。'
keywords: ['監視', '可観測性', '高機能ダッシュボード', 'ダッシュボード', '可観測性ダッシュボード']
sidebar_label: '監視'
sidebar_position: 45
slug: /operations/monitoring
title: '監視'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';


# 監視

:::note
このガイドで示している監視データは ClickHouse Cloud で利用できます。以下で説明する組み込みダッシュボードで表示できるだけでなく、基本および高度なパフォーマンスメトリクスの両方をサービスのメインコンソールから直接確認できます。
:::

次の項目を監視できます。

- ハードウェアリソースの利用状況
- ClickHouse サーバーのメトリクス



## 組み込みの高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard}

<Image
  img='https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1'
  alt='Screenshot 2023-11-12 at 6 08 58 PM'
  size='md'
/>

ClickHouseには、`$HOST:$PORT/dashboard`でアクセス可能な組み込みの高度な可観測性ダッシュボード機能が搭載されています(ユーザー名とパスワードが必要)。このダッシュボードでは以下のメトリクスが表示されます:

- クエリ数/秒
- CPU使用率(コア)
- 実行中のクエリ数
- 実行中のマージ数
- 選択バイト数/秒
- IO待機時間
- CPU待機時間
- OS CPU使用率(ユーザースペース)
- OS CPU使用率(カーネル)
- ディスクからの読み取り
- ファイルシステムからの読み取り
- メモリ(追跡対象)
- 挿入行数/秒
- MergeTree総パーツ数
- パーティションあたりの最大パーツ数


## リソース使用状況 {#resource-utilization}

ClickHouseは、次のようなハードウェアリソースの状態も自動的に監視します：

- プロセッサの負荷と温度
- ストレージシステム、RAM、ネットワークの使用状況

このデータは`system.asynchronous_metric_log`テーブルに収集されます。


## ClickHouseサーバーメトリクス {#clickhouse-server-metrics}

ClickHouseサーバーには、自己状態監視のための組み込み機能が備わっています。

サーバーイベントを追跡するには、サーバーログを使用します。設定ファイルの[logger](../operations/server-configuration-parameters/settings.md#logger)セクションを参照してください。

ClickHouseは以下を収集します:

- サーバーが計算リソースをどのように使用しているかに関する各種メトリクス
- クエリ処理に関する一般的な統計情報

メトリクスは[system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events)、[system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルで確認できます。

ClickHouseを設定して、メトリクスを[Graphite](https://github.com/graphite-project)にエクスポートできます。ClickHouseサーバー設定ファイルの[Graphiteセクション](../operations/server-configuration-parameters/settings.md#graphite)を参照してください。メトリクスのエクスポートを設定する前に、公式[ガイド](https://graphite.readthedocs.io/en/latest/install.html)に従ってGraphiteをセットアップする必要があります。

ClickHouseを設定して、メトリクスを[Prometheus](https://prometheus.io)にエクスポートできます。ClickHouseサーバー設定ファイルの[Prometheusセクション](../operations/server-configuration-parameters/settings.md#prometheus)を参照してください。メトリクスのエクスポートを設定する前に、公式[ガイド](https://prometheus.io/docs/prometheus/latest/installation/)に従ってPrometheusをセットアップする必要があります。

さらに、HTTP APIを通じてサーバーの可用性を監視できます。`/ping`に`HTTP GET`リクエストを送信してください。サーバーが利用可能な場合、`200 OK`で応答します。

クラスター構成のサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries)パラメータを設定し、HTTPリソース`/replicas_status`を使用する必要があります。`/replicas_status`へのリクエストは、レプリカが利用可能で他のレプリカより遅延していない場合、`200 OK`を返します。レプリカが遅延している場合、遅延に関する情報とともに`503 HTTP_SERVICE_UNAVAILABLE`を返します。
