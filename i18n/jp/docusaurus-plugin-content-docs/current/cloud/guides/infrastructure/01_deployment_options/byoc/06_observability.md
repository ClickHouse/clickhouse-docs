---
title: 'BYOC オブザーバビリティ'
slug: /cloud/reference/byoc/observability
sidebar_label: 'オブザーバビリティ'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'オブザーバビリティ', 'モニタリング', 'Prometheus', 'Grafana']
description: '組み込みダッシュボードと Prometheus メトリクスを使用して、BYOC ClickHouse デプロイメントの監視とオブザーバビリティを実現します'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_mixin_1 from '@site/static/images/cloud/reference/byoc-mixin-1.png';
import byoc_mixin_2 from '@site/static/images/cloud/reference/byoc-mixin-2.png';
import byoc_mixin_3 from '@site/static/images/cloud/reference/byoc-mixin-3.png';
import byoc_mixin_4 from '@site/static/images/cloud/reference/byoc-mixin-4.png';
import byoc_mixin_5 from '@site/static/images/cloud/reference/byoc-mixin-5.png';

BYOC デプロイメントには包括的なオブザーバビリティ機能が含まれており、専用の Prometheus モニタリングスタックおよび ClickHouse サーバーからのメトリックエンドポイントを通じて ClickHouse サービスを監視できます。すべてのオブザーバビリティデータはクラウドアカウント内に保持されるため、モニタリング基盤を完全に制御できます。


## Prometheus モニタリングのアプローチ \{#prometheus-monitoring\}

BYOC では、Prometheus を使用してメトリクスを収集および可視化する方法として、2 つの主なアプローチを提供しています。

1. **組み込みの Prometheus スタックに接続する**: BYOC Kubernetes クラスター内で動作する、集中管理された事前インストール済みの Prometheus インスタンスにアクセスします。
2. **ClickHouse のメトリクスを直接スクレイプする**: 各 ClickHouse サービスによって公開されている `/metrics_all` エンドポイントを、自前の Prometheus デプロイメントのスクレイプ対象として指定します。

### 監視方法の比較 \{#monitoring-approaches-comparison\}

| 機能                     | 組み込み Prometheus スタック                                          | ClickHouse サービスからの直接スクレイピング                   |
|-------------------------|-------------------------------------------------------------------|------------------------------------------------------------|
| **メトリクスの範囲**     | ClickHouse、Kubernetes、および補助サービスからのメトリクスを集約（クラスター全体の可視性） | 個々の ClickHouse サーバーからのメトリクスのみ               |
| **セットアップ手順**     | プライベートロードバランサーなど、プライベートネットワークアクセスの設定が必要 | Prometheus を設定して、パブリックまたはプライベートの ClickHouse エンドポイントをスクレイプするだけ |
| **接続方法**             | VPC/ネットワーク内のプライベートロードバランサー経由               | データベースアクセスに使用しているのと同じエンドポイント      |
| **認証**                 | 不要（プライベートネットワークで制限）                             | ClickHouse サービスの認証情報を使用                         |
| **ネットワーク前提条件** | プライベートロードバランサーと適切なネットワーク接続               | ClickHouse エンドポイントへアクセスできる任意のネットワークから利用可能 |
| **最適な用途**           | インフラおよびサービス全体を対象とした総合的な監視                 | サービス単位に特化した監視および統合                        |
| **統合方法**             | 外部 Prometheus でフェデレーションを設定してクラスターのメトリクスを取り込む | ClickHouse のメトリクスエンドポイントを直接 Prometheus の設定に追加 |

**推奨**: ほとんどのユースケースでは、組み込み Prometheus スタックとの統合を推奨します。これは、ClickHouse サーバーメトリクスだけでなく、BYOC デプロイメント内のすべてのコンポーネント（ClickHouse サービス、Kubernetes クラスター、および補助サービス）から包括的なメトリクスを提供するためです。 

## 組み込みの BYOC Prometheus スタック \{#builtin-prometheus-stack\}

ClickHouse BYOC は、Prometheus、Grafana、AlertManager に加え、長期メトリクス保存用にオプションで Thanos を含む、完全な Prometheus 監視スタックを Kubernetes クラスター内にデプロイします。このスタックは次のメトリクスを収集します:

- ClickHouse サーバーおよび ClickHouse Keeper
- Kubernetes クラスターおよびシステムコンポーネント
- 基盤となるインフラストラクチャのノード

### Prometheus スタックへのアクセス \{#accessing-prometheus-stack\}

組み込みの Prometheus スタックに接続するには、次の手順を実行します。

1. BYOC 環境向けのプライベートロードバランサーを有効化してもらうため、**ClickHouse Support に連絡**します。
2. **Prometheus エンドポイント URL を ClickHouse Support にリクエスト**します。
3. 通常は VPC ピアリングやその他のプライベートネットワーク構成を用いて、Prometheus エンドポイントへの**プライベートネットワーク経由での接続性を検証**します。

Prometheus エンドポイントは次の形式になります。

```bash
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com
```

:::note
Prometheus スタックの URL にはプライベートネットワーク接続を通じてのみアクセスでき、認証は不要です。アクセスは、VPC ピアリングやその他のプライベート接続オプション経由で BYOC VPC に到達可能なネットワークに限定されています。
:::


### 監視ツールとの統合 \{#prometheus-stack-integration\}

BYOC Prometheus スタックは、監視エコシステム全体で次のように活用できます。

**オプション 1: Prometheus API にクエリを実行する**

* お使いの監視プラットフォームやカスタムダッシュボードから、Prometheus API エンドポイントへ直接アクセスします。
* PromQL クエリを使用して、必要なメトリクスを抽出・集約・可視化します。
* 独自のダッシュボードやアラートパイプラインを構築する場合に最適です。

Prometheus のクエリエンドポイント:

```text
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com/query
```

**オプション 2: 独自の Prometheus へメトリクスをフェデレーションする**

* 外部 Prometheus インスタンスを設定し、ClickHouse BYOC Prometheus スタックからメトリクスをフェデレーション（pull）できるようにします。
* これにより、複数の環境やクラスターからのメトリクス収集を統合し、集中管理できます。
* Prometheus フェデレーションの設定例:

```yaml
scrape_configs:
  - job_name: 'federate-clickhouse-byoc'
    scrape_interval: 15s
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job="clickhouse"}'
        - '{job="kubernetes"}'
    static_configs:
      - targets:
        - 'prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com'
```


## ClickHouse サービスの Prometheus 連携 \{#direct-prometheus-integration\}

ClickHouse サービスは Prometheus 互換のメトリクス用エンドポイントを公開しており、自前の Prometheus インスタンスを使用して直接スクレイプできます。この方法では ClickHouse 固有のメトリクスは取得できますが、Kubernetes や関連サービスのメトリクスは含まれません。

### メトリクスエンドポイントへのアクセス \{#metrics-endpoint\}

メトリクスエンドポイントは、ClickHouse サービスエンドポイントの `/metrics_all` で公開されています。

```bash
curl --user <username>:<password> https://<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443/metrics_all
```

**サンプル応答：**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```


### 認証 \{#authentication\}

メトリクスエンドポイントには、ClickHouse の認証情報を使用した認証が必要です。`default` ユーザーを使用するか、メトリクスのスクレイピング専用に最小権限のユーザーを作成することを推奨します。

**必要な権限:**

* サービスに接続するための `REMOTE` 権限
* 関連する system テーブルに対する `SELECT` 権限

**ユーザー設定例:**

```sql
CREATE USER scrapping_user IDENTIFIED BY 'secure_password';
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


### Prometheus の設定 \{#configuring-prometheus\}

Prometheus インスタンスを構成し、ClickHouse のメトリクス エンドポイントをスクレイプさせます。

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443"]
    scheme: https
    metrics_path: "/metrics_all"
    basic_auth:
      username: <username>
      password: <password>
    honor_labels: true
```

次の値を置き換えます:

* `<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443` を実際のサービスエンドポイントに置き換える
* `<username>` と `<password>` をスクレイピングに使用するユーザーの認証情報に置き換える


## ClickHouse Mixin \{#clickhouse-mixin\}

あらかじめ用意されたダッシュボード一式を利用したいチーム向けに、ClickHouse は Prometheus 用の **ClickHouse Mixin** を提供しています。これは、ClickHouse クラスターの監視向けに特化して設計された、あらかじめ構成済みの Grafana ダッシュボードです。

### Grafana のセットアップと ClickHouse Mix-in のインポート \{#setup-grafana-mixin\}

Prometheus インスタンスが ClickHouse 監視スタックと統合できたら、次の手順に従って Grafana でメトリクスを可視化できます。

1. **Grafana に Prometheus をデータソースとして追加する**  
   Grafana のサイドバーで「Data sources」に移動し、「Add data source」をクリックして「Prometheus」を選択します。Prometheus インスタンスの URL と、接続に必要な認証情報を入力します。

<Image img={byoc_mixin_1} size="lg" alt="BYOC Mixin 1" background='black'/>

<Image img={byoc_mixin_2} size="lg" alt="BYOC Mixin 2" background='black'/>

<Image img={byoc_mixin_3} size="lg" alt="BYOC Mixin 3" background='black'/>

2. **ClickHouse ダッシュボードをインポートする**  
   Grafana でダッシュボード画面に移動し、「Import」を選択します。ダッシュボードの JSON ファイルをアップロードするか、その内容を直接貼り付けることができます。JSON ファイルは ClickHouse Mix-in リポジトリから取得します。  
   [ClickHouse Mix-in Dashboard JSON](https://github.com/ClickHouse/clickhouse-mixin/blob/main/dashboard_byoc.json)

<Image img={byoc_mixin_4} size="lg" alt="BYOC Mixin 4" background='black'/>

3. **メトリクスを確認する**  
   ダッシュボードをインポートし、Prometheus データソースで設定すると、ClickHouse Cloud サービスからのリアルタイムのメトリクスが表示されるはずです。

<Image img={byoc_mixin_5} size="lg" alt="BYOC Mixin 5" background='black'/>