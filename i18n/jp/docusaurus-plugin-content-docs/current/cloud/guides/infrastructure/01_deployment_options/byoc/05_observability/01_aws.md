---
title: 'AWS における BYOC の可観測性'
slug: /cloud/reference/byoc/observability
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '独自のクラウドインフラストラクチャ上で ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


## 可観測性 {#observability}

### 組み込み監視ツール {#built-in-monitoring-tools}

ClickHouse BYOCは、さまざまなユースケースに対応する複数のアプローチを提供します。

#### 可観測性ダッシュボード {#observability-dashboard}

ClickHouse Cloudには、メモリ使用量、クエリレート、I/Oなどのメトリクスを表示する高度な可観測性ダッシュボードが含まれています。ClickHouse Cloud Webコンソールインターフェースの**Monitoring**セクションからアクセスできます。

<br />

<Image img={byoc3} size='lg' alt='可観測性ダッシュボード' border />

<br />

#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics`などのシステムテーブルからのメトリクスを使用してダッシュボードをカスタマイズし、サーバーのパフォーマンスとリソース使用率を詳細に監視できます。

<br />

<Image img={byoc4} size='lg' alt='高度なダッシュボード' border />

<br />

#### BYOCのPrometheusスタックへのアクセス {#prometheus-access}

ClickHouse BYOCは、KubernetesクラスタにPrometheusスタックをデプロイします。そこからメトリクスにアクセスしてスクレイピングし、独自の監視スタックと統合できます。

プライベートロードバランサーを有効にしてURLを取得するには、ClickHouseサポートにお問い合わせください。このURLはプライベートネットワーク経由でのみアクセス可能であり、認証には対応していないことにご注意ください。

**サンプルURL**

```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus統合 {#prometheus-integration}

<DeprecatedBadge />

代わりに上記セクションのPrometheusスタック統合を使用してください。ClickHouse Serverのメトリクスに加えて、K8Sメトリクスや他のサービスからのメトリクスなど、より多くのメトリクスを提供します。

ClickHouse Cloudは、監視用のメトリクスをスクレイピングするために使用できるPrometheusエンドポイントを提供します。これにより、GrafanaやDatadogなどのツールと統合して可視化できます。

**httpsエンドポイント /metrics_all 経由のサンプルリクエスト**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**


```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes systemデータベースのディスク`s3disk`に格納されているバイト数
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 破損したデタッチ済みパートの数
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount 最も古いミューテーションの経過時間(秒)
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings サーバーが発行した警告の数。通常、設定の誤りの可能性を示します
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors 最後の再起動以降のサーバーエラーの総数
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

ClickHouse のユーザー名とパスワードの組み合わせを認証に使用できます。メトリクスをスクレイピングするための専用ユーザーを作成し、その権限を最小限に抑えることを推奨します。少なくとも、すべてのレプリカで `system.custom_metrics` テーブルに対する `READ` 権限が必要です。例えば:

```sql
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```

**Prometheus の設定**

以下に設定例を示します。`targets` エンドポイントは、ClickHouse サービスへのアクセスに使用するものと同じです。

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

[このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および [ClickHouse 向け Prometheus セットアップドキュメント](/integrations/prometheus)も参照してください。
