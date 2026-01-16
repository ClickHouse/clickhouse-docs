---
title: 'AWS での BYOC のオブザーバビリティ'
slug: /cloud/reference/byoc/observability
sidebar_label: 'AWS'
keywords: ['BYOC', 'クラウド', '自前クラウド（BYOC）', 'AWS']
description: '独自のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

## オブザーバビリティ \\{#observability\\}

### 組み込みの監視ツール \\{#built-in-monitoring-tools\\}

ClickHouse BYOC は、さまざまなユースケースに対応する複数のアプローチを提供しています。

#### オブザーバビリティダッシュボード \\{#observability-dashboard\\}

ClickHouse Cloud には、メモリ使用量、クエリレート、I/O などのメトリクスを表示する高度なオブザーバビリティダッシュボードが用意されています。ClickHouse Cloud の Web コンソールの **Monitoring** セクションからアクセスできます。

<br />

<Image img={byoc3} size="lg" alt="オブザーバビリティダッシュボード" border />

<br />

#### 高度なダッシュボード \\{#advanced-dashboard\\}

`system.metrics`、`system.events`、`system.asynchronous_metrics` などのシステムテーブルからメトリクスを取得してダッシュボードをカスタマイズすることで、サーバーのパフォーマンスやリソース使用状況を詳細に監視できます。

<br />

<Image img={byoc4} size="lg" alt="高度なダッシュボード" border />

<br />

#### BYOC Prometheus スタックへのアクセス \\{#prometheus-access\\}

ClickHouse BYOC は、Prometheus スタックを Kubernetes クラスター上にデプロイします。そこからメトリクスへアクセスしてスクレイプし、お使いの監視スタックと統合できます。

プライベートロードバランサーを有効化し、URL を取得するには ClickHouse サポートにお問い合わせください。この URL はプライベートネットワーク経由でのみアクセス可能であり、認証をサポートしていない点に注意してください。

**サンプル URL**

```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 連携 \\{#prometheus-integration\\}

<DeprecatedBadge />

代わりに、上記セクションの Prometheus スタック連携を使用してください。ClickHouse Server のメトリクスに加え、K8S メトリクスやその他のサービスのメトリクスも取得できます。

ClickHouse Cloud は、監視用にメトリクスをスクレイプできる Prometheus エンドポイントを提供します。これにより、Grafana や Datadog などのツールと連携して可視化できます。

**https エンドポイント /metrics&#95;all を利用したリクエスト例**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount The age of the oldest mutation (in seconds)
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings The number of warnings issued by the server. It usually indicates about possible misconfiguration
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

認証には ClickHouse のユーザー名とパスワードの組み合わせを使用できます。メトリクスのスクレイプ専用で、必要最小限の権限のみを持つユーザーを作成することを推奨します。少なくとも、すべてのレプリカに対する `system.custom_metrics` テーブルへの `READ` 権限が必要です。例：

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

以下に設定例を示します。`targets` エンドポイントは、ClickHouse サービスにアクセスする際に使用するものと同じです。

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

[こちらのブログ記事](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および[ClickHouse 向け Prometheus セットアップドキュメント](/integrations/prometheus)もあわせてご覧ください。
