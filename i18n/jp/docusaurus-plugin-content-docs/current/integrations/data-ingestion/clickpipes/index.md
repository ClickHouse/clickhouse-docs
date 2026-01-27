---
sidebar_label: '概要'
description: '外部データソースと ClickHouse Cloud をシームレスに連携させます。'
slug: /integrations/clickpipes
title: 'ClickHouse Cloud との連携'
doc_type: 'guide'
keywords: ['ClickPipes', 'データインジェストプラットフォーム', 'ストリーミングデータ', 'インテグレーションプラットフォーム', 'ClickHouse Cloud']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud との連携 \{#integrating-with-clickhouse-cloud\}

## はじめに \{#introduction\}

[ClickPipes](/integrations/clickpipes) は、さまざまなデータソースからのデータを、数回クリックするだけで簡単に取り込むことができるマネージド型統合プラットフォームです。最も厳しいワークロード向けに設計された ClickPipes の堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと高い信頼性を実現します。ClickPipes は、長期的なストリーミング用途にも、単発のデータロード・ジョブにも利用できます。

<Image img={clickpipes_stack} alt="ClickPipes スタック" size="lg" border/>

## サポートされているデータソース \{#supported-data-sources\}

| 名前                                               | ロゴ                                                                                             |タイプ| ステータス           | 説明                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | ClickPipes を構成し、Apache Kafka から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>                 |Streaming| Stable           | Confluent と ClickHouse Cloud のダイレクト連携により、両者を組み合わせた高いパフォーマンスを引き出します。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda ロゴ"/>                                     |Streaming| Stable           | ClickPipes を構成し、Redpanda から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | ClickPipes を構成し、AWS MSK から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>           |Streaming| Stable           | ClickPipes を構成し、Azure Event Hubs から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。詳細なガイダンスについては [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs) を参照してください。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>                     |Streaming| Stable           | ClickPipes を構成し、WarpStream から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めるようにします。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めるようにします。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean ロゴ" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めるようにします。
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage ロゴ" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めるようにします。
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis ロゴ" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | ClickPipes を構成し、Amazon Kinesis から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres ロゴ" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | ClickPipes を構成し、Postgres から ClickHouse Cloud へのデータ取り込みを開始します。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL ロゴ" style={{width: '3rem', height: '3rem'}}/>               |DBMS| Public Beta | ClickPipes を構成し、MySQL から ClickHouse Cloud へのデータ取り込みを開始します。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB ロゴ" style={{width: '3rem', height: '3rem'}}/>           |DBMS| Private Preview | ClickPipes を構成し、MongoDB から ClickHouse Cloud へのデータ取り込みを開始します。                   |

ClickPipes には今後さらに多くのコネクタが追加される予定です。詳しくは[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## 固定 IP の一覧 \{#list-of-static-ips\}

以下は、ClickPipes が外部サービスへの接続に使用する固定 NAT IP（リージョンごと）です。ご利用のインスタンスが属するリージョンの IP を IP 許可リストに追加し、そのトラフィックを許可してください。オブジェクトストレージのパイプを利用する場合は、[ClickHouse クラスター IP](/manage/data-sources/cloud-endpoints-api) も IP 許可リストに追加する必要があります。

すべてのサービスについて、ClickPipes のトラフィックはサービスの配置場所に基づき、デフォルトのリージョンから発信されます。

- **eu-central-1**: 個別に記載されていないすべての EU リージョン（GCP および Azure の EU リージョンを含む）。
- **eu-west-1**: 2026 年 1 月 20 日以降に作成された、AWS `eu-west-1` 内のすべてのサービス（この日付より前に作成されたサービスは `eu-central-1` の IP を使用）。
- **us-east-1**: AWS `us-east-1` 内のすべてのサービス。
- **ap-south-1**: 2025 年 6 月 25 日以降に作成された、AWS `ap-south-1` 内のサービス（この日付より前に作成されたサービスは `us-east-2` の IP を使用）。
- **ap-northeast-2**: 2025 年 11 月 14 日以降に作成された、AWS `ap-northeast-2` 内のサービス（この日付より前に作成されたサービスは `us-east-2` の IP を使用）。
- **ap-southeast-2**: 2025 年 6 月 25 日以降に作成された、AWS `ap-southeast-2` 内のサービス（この日付より前に作成されたサービスは `us-east-2` の IP を使用）。
- **us-west-2**: 2025 年 6 月 24 日以降に作成された、AWS `us-west-2` 内のサービス（この日付より前に作成されたサービスは `us-east-2` の IP を使用）。
- **us-east-2**: 上記で明示的に記載されていないすべてのその他のリージョン（GCP および Azure のリージョンを含む）。

| AWS リージョン                        | IP アドレス                                                                                                                                     |
|---------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                       |
| **eu-west-1** (2026 年 1 月 20 日以降)      | `54.228.1.92`, `54.72.101.254`, `54.228.16.208`, `54.76.200.104`, `52.211.2.177`, `54.77.10.134`                                                      |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`      |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                     |
| **ap-south-1** (2025 年 6 月 25 日以降)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                                   |
| **ap-northeast-2** (2025 年 11 月 14 日以降) | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104` 
                    |
| **ap-southeast-2** (2025 年 6 月 25 日以降) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                                     |
| **us-west-2** (2025 年 6 月 24 日以降)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                                     |

## ClickHouse 設定の調整 \{#adjusting-clickhouse-settings\}

ClickHouse Cloud は、ほとんどのユースケース向けに適切なデフォルト値を提供します。ただし、ClickPipes の宛先テーブル向けに一部の ClickHouse 設定を調整する必要がある場合は、ClickPipes 専用のロールを作成する方法が最も柔軟です。
手順:

1. カスタムロール `CREATE ROLE my_clickpipes_role SETTINGS ...` を作成します。詳細は [CREATE ROLE](/sql-reference/statements/create/role.md) の構文を参照してください。
2. ClickPipes を作成する際の `Details and Settings` ステップで、ClickPipes 用ユーザーにそのカスタムロールを付与します。

<Image img={cp_custom_role} alt="カスタムロールを割り当てる" size="lg" border/>

## ClickPipes の高度な設定を調整する \{#clickpipes-advanced-settings\}

ClickPipes には、多くのユースケースをカバーする妥当なデフォルト設定が用意されています。ユースケースで追加の微調整が必要な場合は、次の設定を調整できます。

### オブジェクトストレージ ClickPipes \{#clickpipes-advanced-settings-object-storage\}

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 1回の挿入バッチで処理するバイト数。                                  |
| `Max file count`                   | 100           | 1回の挿入バッチで処理するファイルの最大数。                          |
| `Max threads`                      | auto(3)       | ファイル処理に使用する[同時実行スレッド数の上限](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | ファイル処理に使用する[同時実行挿入スレッド数の上限](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | テーブルに挿入可能な[ブロック内の最小サイズ（バイト数）](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [同時実行ダウンロードスレッド数の上限](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | ClickHouse クラスターへデータを挿入する前の最大待機時間を設定します。 |
| `Parallel distributed insert select` | 2           | [parallel_distributed_insert_select 設定](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | アタッチされた VIEW への書き込みを[逐次ではなく並行して](/operations/settings/settings#parallel_view_processing)行うかどうか。 |
| `Use cluster function`             | true          | 複数ノード間でファイルを並行処理するかどうか。 |

<Image img={cp_advanced_settings} alt="ClickPipes の高度な設定" size="lg" border/>

### ストリーミング ClickPipes \{#clickpipes-advanced-settings-streaming\}

| 設定                               | デフォルト値 |  説明                                                                                  |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Streaming max insert wait time`   | 5s            | データを ClickHouse クラスターに挿入する前の最大待機時間を設定します。                |

## エラー レポート \{#error-reporting\}

ClickPipesは、インジェスト処理中に発生したエラーの種類に応じて、それらを 2 つの別個のテーブルに保存します。

### レコードエラー \{#record-errors\}

ClickPipes は、宛先テーブルとは別に、`<destination_table_name>_clickpipes_error` という接尾辞を持つテーブルを作成します。このテーブルには、不正なデータやスキーマの不一致によって発生したすべてのエラーが保存され、無効なメッセージ全体が含まれます。このテーブルには 7 日間の [有効期限 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) が設定されています。

### システムエラー \{#system-errors\}

ClickPipe の動作に関連するエラー（ネットワークや接続などを含む）は、すべて `system.clickpipes_log` テーブルに保存されます。このテーブルには 7 日間の[有効期限 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) が設定されています。

ClickPipes が 15 分経過してもデータソースに接続できない場合、または 1 時間経過しても送信先に接続できない場合、ClickPipes インスタンスは停止し、（ClickHouse インスタンスが利用可能であれば）システムエラーテーブルに適切なメッセージを保存します。

## FAQ \{#faq\}

- **What is ClickPipes?**

  ClickPipes は ClickHouse Cloud の機能で、ClickHouse サービスを外部データソース、特に Kafka に容易に接続できるようにします。ClickPipes for Kafka を利用すると、データを継続的に ClickHouse に取り込むことができ、リアルタイム分析で利用可能になります。

- **Does ClickPipes support data transformation?**

  はい。ClickPipes は DDL 作成を公開することで、基本的なデータ変換をサポートします。さらに、ClickHouse Cloud サービス内の宛先テーブルにデータがロードされる際に、ClickHouse の [materialized views 機能](/guides/developer/cascading-materialized-views) を活用して、より高度な変換を適用できます。

- **Does using ClickPipes incur an additional cost?**

  ClickPipes の課金は、Ingested Data と Compute の 2 つを基準として行われます。料金の詳細は[このページ](/cloud/reference/billing/clickpipes)に記載されています。ClickPipes を実行すると、他の取り込みワークロードと同様に、宛先の ClickHouse Cloud サービス側で間接的なコンピュートおよびストレージコストが発生する可能性もあります。

- **Is there a way to handle errors or failures when using ClickPipes for Kafka?**

  はい。ClickPipes for Kafka は、ネットワーク障害や接続障害など、Kafka からデータを読み取る際のあらゆる運用上の問題が発生した場合に、自動的にリトライを行います。不正なデータや無効なスキーマが検出された場合、ClickPipes はそのレコードを `record_error` テーブルに保存し、処理を継続します。