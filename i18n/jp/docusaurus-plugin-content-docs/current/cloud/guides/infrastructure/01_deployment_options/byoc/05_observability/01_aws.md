---
title: 'AWS における BYOC の可観測性'
slug: /cloud/reference/byoc/observability
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '独自のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


## オブザーバビリティ {#observability}

### 組み込み監視ツール {#built-in-monitoring-tools}

ClickHouse BYOC では、さまざまなユースケースに対応する複数のアプローチを提供します。

#### オブザーバビリティダッシュボード {#observability-dashboard}

ClickHouse Cloud には、メモリ使用量、クエリ実行率、I/O などのメトリクスを表示する高度なオブザーバビリティダッシュボードが含まれています。これは、ClickHouse Cloud の Web コンソールの **Monitoring** セクションからアクセスできます。

<br />

<Image img={byoc3} size='lg' alt='オブザーバビリティダッシュボード' border />

<br />

#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics` などのシステムテーブルから取得したメトリクスを利用してダッシュボードをカスタマイズし、サーバーのパフォーマンスやリソース使用状況を詳細に監視できます。

<br />

<Image img={byoc4} size='lg' alt='高度なダッシュボード' border />

<br />

#### BYOC Prometheus スタックへのアクセス {#prometheus-access}

ClickHouse BYOC は、お使いの Kubernetes クラスター上に Prometheus スタックをデプロイします。そこからメトリクスにアクセスしてスクレイプし、独自の監視スタックと統合できます。

Private Load balancer を有効化し、URL を取得するには、ClickHouse サポートにお問い合わせください。この URL はプライベートネットワーク経由でのみアクセス可能であり、認証はサポートされていない点にご注意ください。

**サンプル URL**

```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 連携 {#prometheus-integration}

<DeprecatedBadge />

代わりに、上記セクションの Prometheus スタックとの連携をご利用ください。ClickHouse Server のメトリクスに加えて、K8S のメトリクスやその他のサービスのメトリクスも提供します。

ClickHouse Cloud は、監視用のメトリクスをスクレイプできる Prometheus エンドポイントを提供します。これにより、Grafana や Datadog などのツールと連携し、可視化することができます。

**HTTPS エンドポイント /metrics_all 経由のサンプルリクエスト**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**


```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes systemデータベースのディスク`s3disk`に格納されているバイト数
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 破損したデタッチ済みパーツの数
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
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors 最後の再起動以降のサーバー上のエラー総数
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

認証には ClickHouse のユーザー名とパスワードの組を使用できます。メトリクスのスクレイピング専用に、必要最小限の権限だけを付与したユーザーを作成することを推奨します。少なくとも、すべてのレプリカに対して `system.custom_metrics` テーブルの `READ` 権限が必要です。例えば：

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

以下に設定例を示します。`targets` エンドポイントは、ClickHouse サービスに接続する際に使用するエンドポイントと同じです。

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

[こちらのブログ記事](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および [ClickHouse 向け Prometheus セットアップドキュメント](/integrations/prometheus) もご参照ください。
