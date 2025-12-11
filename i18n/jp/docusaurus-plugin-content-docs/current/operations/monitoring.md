---
description: 'ハードウェアリソースの利用状況や ClickHouse サーバーメトリクスを監視できます。'
keywords: ['監視', 'オブザーバビリティ', '高度なダッシュボード', 'ダッシュボード', 'オブザーバビリティダッシュボード']
sidebar_label: '監視'
sidebar_position: 45
slug: /operations/monitoring
title: '監視'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';

# 監視 {#monitoring}

:::note
このガイドで説明している監視データは、ClickHouse Cloud で参照できます。以下で説明する組み込みダッシュボードで表示できるだけでなく、基本および高度なパフォーマンスメトリクスの両方をメインのサービスコンソールで直接確認することもできます。
:::

次の内容を監視できます:

- ハードウェアリソースの利用状況
- ClickHouse サーバーのメトリクス

## 組み込みの高度なオブザーバビリティダッシュボード {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="Screenshot 2023-11-12 at 6 08 58 PM" size="md" />

ClickHouse には、`$HOST:$PORT/dashboard`（ユーザー名とパスワードが必要）からアクセスできる、組み込みの高度なオブザーバビリティダッシュボード機能が備わっており、次のメトリクスを表示します：
- Queries/second
- CPU 使用率（コア）
- Queries running
- Merges running
- Selected bytes/second
- IO wait
- CPU wait
- OS CPU Usage (userspace)
- OS CPU Usage (kernel)
- Read from disk
- Read from filesystem
- Memory (tracked)
- Inserted rows/second
- Total MergeTree parts
- Max parts for partition

## リソース使用状況 {#resource-utilization}

ClickHouse は、次のようなハードウェアリソースの状態も自動的に監視します。

- プロセッサの負荷および温度
- ストレージシステム、RAM、ネットワークの使用率

このデータは `system.asynchronous_metric_log` テーブルに蓄積されます。

## ClickHouse サーバーメトリクス {#clickhouse-server-metrics}

ClickHouse サーバーには、自身の状態を監視するための組み込み機能があります。

サーバーイベントを追跡するには、サーバーログを使用します。設定ファイルの [logger](../operations/server-configuration-parameters/settings.md#logger) セクションを参照してください。

ClickHouse は次の情報を収集します:

- サーバーが計算リソースをどのように使用しているかに関する各種メトリクス。
- クエリ処理に関する一般的な統計情報。

メトリクスは [system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events)、[system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルで確認できます。

ClickHouse を構成することで、メトリクスを [Graphite](https://github.com/graphite-project) にエクスポートできます。ClickHouse サーバー設定ファイルの [Graphite セクション](../operations/server-configuration-parameters/settings.md#graphite) を参照してください。メトリクスのエクスポートを設定する前に、公式の [ガイド](https://graphite.readthedocs.io/en/latest/install.html) に従って Graphite をセットアップしておく必要があります。

ClickHouse を構成することで、メトリクスを [Prometheus](https://prometheus.io) にエクスポートできます。ClickHouse サーバー設定ファイルの [Prometheus セクション](../operations/server-configuration-parameters/settings.md#prometheus) を参照してください。メトリクスのエクスポートを設定する前に、公式の [ガイド](https://prometheus.io/docs/prometheus/latest/installation/) に従って Prometheus をセットアップしておく必要があります。

さらに、HTTP API を通じてサーバーの可用性を監視できます。`HTTP GET` リクエストを `/ping` に送信してください。サーバーが利用可能であれば、`200 OK` で応答します。

クラスタ構成のサーバーを監視するには、[max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) パラメータを設定し、HTTP リソース `/replicas_status` を使用する必要があります。`/replicas_status` へのリクエストは、レプリカが利用可能で他のレプリカから遅延していない場合には `200 OK` を返します。レプリカが遅延している場合には、遅延量に関する情報とともに `503 HTTP_SERVICE_UNAVAILABLE` を返します。
