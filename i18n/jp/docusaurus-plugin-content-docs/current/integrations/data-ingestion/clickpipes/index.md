---
sidebar_label: 'はじめに'
description: '外部データソースを ClickHouse Cloud とシームレスに連携させます。'
slug: /integrations/clickpipes
title: 'ClickHouse Cloud との連携'
doc_type: 'guide'
keywords: ['ClickPipes', 'data ingestion platform', 'streaming data', 'integration platform', 'ClickHouse Cloud']
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


# ClickHouse Cloud との連携



## はじめに {#introduction}

[ClickPipes](/integrations/clickpipes)は、多様なソースからのデータ取り込みを数クリックで簡単に実現するマネージド統合プラットフォームです。最も要求の厳しいワークロードに対応できるよう設計されており、堅牢でスケーラブルなアーキテクチャにより、一貫したパフォーマンスと信頼性を確保します。ClickPipesは、長期的なストリーミング用途にも、一度限りのデータロードジョブにも利用できます。

<Image img={clickpipes_stack} alt='ClickPipesスタック' size='lg' border />


## サポートされているデータソース {#supported-data-sources}

| 名前                                               | ロゴ                                                                                             | タイプ           | ステータス          | 説明                                                                                                                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | ストリーミング      | 安定版          | ClickPipesを設定して、Apache KafkaからClickHouse Cloudへのストリーミングデータの取り込みを開始します。                                                                                                       |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | ストリーミング      | 安定版          | 直接統合により、ConfluentとClickHouse Cloudを組み合わせた強力な機能を活用できます。                                                                                                            |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | ストリーミング      | 安定版          | ClickPipesを設定して、RedpandaからClickHouse Cloudへのストリーミングデータの取り込みを開始します。                                                                                                           |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | ストリーミング      | 安定版          | ClickPipesを設定して、AWS MSKからClickHouse Cloudへのストリーミングデータの取り込みを開始します。                                                                                                            |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | ストリーミング      | 安定版          | ClickPipesを設定して、Azure Event HubsからClickHouse Cloudへのストリーミングデータの取り込みを開始します。詳細については、[Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs)を参照してください。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | ストリーミング      | 安定版          | ClickPipesを設定して、WarpStreamからClickHouse Cloudへのストリーミングデータの取り込みを開始します。                                                                                                         |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | オブジェクトストレージ | 安定版          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                                                                                                                              |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | オブジェクトストレージ | 安定版          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                                                                                                                              |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | オブジェクトストレージ | 安定版          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                                                                                                                              |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | オブジェクトストレージ | 安定版          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                                                                                                                              |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | ストリーミング      | 安定版          | ClickPipesを設定して、Amazon KinesisからClickHouse Cloudへのストリーミングデータの取り込みを開始します。                                                                                                     |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | DBMS           | 安定版          | ClickPipesを設定して、PostgresからClickHouse Cloudへのデータの取り込みを開始します。                                                                                                                     |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: '3rem'}}/>               | DBMS           | パブリックベータ版     | ClickPipesを設定して、MySQLからClickHouse Cloudへのデータの取り込みを開始します。                                                                                                                        |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: '3rem'}}/>           | DBMS           | プライベートプレビュー | ClickPipesを設定して、MongoDBからClickHouse Cloudへのデータの取り込みを開始します。                                                                                                                      |

ClickPipesには今後さらに多くのコネクタが追加される予定です。詳細については、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。


## 静的IPアドレスのリスト {#list-of-static-ips}

以下は、ClickPipesが外部サービスへの接続に使用する静的NAT IPアドレス（リージョン別）です。トラフィックを許可するには、該当するインスタンスリージョンのIPアドレスをIP許可リストに追加してください。

すべてのサービスにおいて、ClickPipesのトラフィックはサービスのロケーションに基づくデフォルトリージョンから発信されます：

- **eu-central-1**: EUリージョン内のすべてのサービス（GCPおよびAzureのEUリージョンを含む）
- **us-east-1**: AWS `us-east-1`内のすべてのサービス
- **ap-south-1**: 2025年6月25日以降に作成されたAWS `ap-south-1`内のサービス（この日付より前に作成されたサービスは`us-east-2`のIPを使用）
- **ap-northeast-2**: 2025年11月14日以降に作成されたAWS `ap-northeast-2`内のサービス（この日付より前に作成されたサービスは`us-east-2`のIPを使用）
- **ap-southeast-2**: 2025年6月25日以降に作成されたAWS `ap-southeast-2`内のサービス（この日付より前に作成されたサービスは`us-east-2`のIPを使用）
- **us-west-2**: 2025年6月24日以降に作成されたAWS `us-west-2`内のサービス（この日付より前に作成されたサービスは`us-east-2`のIPを使用）
- **us-east-2**: 上記以外のすべてのリージョン（GCPおよびAzureの米国リージョンを含む）

| AWSリージョン                            | IPアドレス                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                              |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                            |
| **ap-south-1** (2025年6月25日以降)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                          |
| **ap-northeast-2** (2025年11月14日以降) | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104`                                                   |
|  |
| **ap-southeast-2** (2025年6月25日以降) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                            |
| **us-west-2** (2025年6月24日以降)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                            |


## ClickHouse設定の調整 {#adjusting-clickhouse-settings}

ClickHouse Cloudは、ほとんどのユースケースに対して適切なデフォルト設定を提供しています。ただし、ClickPipesの宛先テーブルに対してClickHouse設定を調整する必要がある場合は、ClickPipes専用のロールを作成することが最も柔軟な解決策となります。
手順:

1. カスタムロールを作成します:`CREATE ROLE my_clickpipes_role SETTINGS ...`。詳細は[CREATE ROLE](/sql-reference/statements/create/role.md)の構文を参照してください。
2. ClickPipes作成時の`Details and Settings`ステップで、ClickPipesユーザーにカスタムロールを追加します。

<Image img={cp_custom_role} alt='カスタムロールの割り当て' size='lg' border />


## ClickPipes詳細設定の調整 {#clickpipes-advanced-settings}

ClickPipesは、ほとんどのユースケースの要件を満たす適切なデフォルト値を提供します。ユースケースでさらなる微調整が必要な場合は、以下の設定を調整できます:

### Object Storage ClickPipes {#clickpipes-advanced-settings-object-storage}

| 設定                              | デフォルト値 | 説明                                                                                                                                 |
| ------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Max insert bytes`                   | 10GB          | 単一の挿入バッチで処理するバイト数。                                                                                        |
| `Max file count`                     | 100           | 単一の挿入バッチで処理するファイルの最大数。                                                                                |
| `Max threads`                        | auto(3)       | ファイル処理のための[同時実行スレッドの最大数](/operations/settings/settings#max_threads)。                                      |
| `Max insert threads`                 | 1             | ファイル処理のための[同時実行挿入スレッドの最大数](/operations/settings/settings#max_insert_threads)。                        |
| `Min insert block size bytes`        | 1GB           | テーブルに挿入可能な[ブロック内のバイトの最小サイズ](/operations/settings/settings#min_insert_block_size_bytes)。         |
| `Max download threads`               | 4             | [同時実行ダウンロードスレッドの最大数](/operations/settings/settings#max_download_threads)。                                        |
| `Object storage polling interval`    | 30s           | ClickHouseクラスタへのデータ挿入前の最大待機時間を設定します。                                                       |
| `Parallel distributed insert select` | 2             | [並列分散挿入選択設定](/operations/settings/settings#parallel_distributed_insert_select)。                             |
| `Parallel view processing`           | false         | アタッチされたビューへのプッシュを[順次ではなく同時に](/operations/settings/settings#parallel_view_processing)実行するかどうか。 |
| `Use cluster function`               | true          | 複数のノードにわたってファイルを並列処理するかどうか。                                                                                 |

<Image
  img={cp_advanced_settings}
  alt='ClickPipesの詳細設定'
  size='lg'
  border
/>

### Streaming ClickPipes {#clickpipes-advanced-settings-streaming}

| Setting                          | Default value | Description                                                                           |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `Streaming max insert wait time` | 5s            | ClickHouseクラスタへのデータ挿入前の最大待機時間を設定します。 |


## エラー報告 {#error-reporting}

ClickPipesは、取り込みプロセス中に発生したエラーの種類に応じて、2つの別々のテーブルにエラーを保存します。

### レコードエラー {#record-errors}

ClickPipesは、宛先テーブルと並んで`<destination_table_name>_clickpipes_error`という接尾辞を持つテーブルを作成します。このテーブルには、不正な形式のデータやスキーマの不一致によるエラーが含まれ、無効なメッセージ全体が記録されます。このテーブルの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)は7日間です。

### システムエラー {#system-errors}

ClickPipeの動作に関連するエラーは、`system.clickpipes_log`テーブルに保存されます。このテーブルには、ClickPipeの動作に関連するその他すべてのエラー(ネットワーク、接続性など)が保存されます。このテーブルの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)は7日間です。

ClickPipesがデータソースに15分以内に接続できない場合、または宛先に1時間以内に接続できない場合、ClickPipesインスタンスは停止し、システムエラーテーブルに適切なメッセージを保存します(ClickHouseインスタンスが利用可能な場合)。


## よくある質問 {#faq}

- **ClickPipesとは何ですか?**

  ClickPipesは、ユーザーがClickHouseサービスを外部データソース(特にKafka)に簡単に接続できるようにするClickHouse Cloudの機能です。ClickPipes for Kafkaを使用することで、ClickHouseへのデータの継続的な取り込みを容易に行うことができ、リアルタイム分析に利用できるようになります。

- **ClickPipesはデータ変換をサポートしていますか?**

  はい、ClickPipesはDDL作成を公開することで基本的なデータ変換をサポートしています。その後、ClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を活用して、ClickHouse Cloudサービスの宛先テーブルにデータが取り込まれる際に、より高度な変換を適用することができます。

- **ClickPipesの使用には追加費用が発生しますか?**

  ClickPipesは、取り込みデータ量とコンピュートの2つの側面で課金されます。料金の詳細は[このページ](/cloud/reference/billing/clickpipes)でご確認いただけます。ClickPipesの実行により、他の取り込みワークロードと同様に、宛先のClickHouse Cloudサービスで間接的なコンピュートおよびストレージコストが発生する場合があります。

- **ClickPipes for Kafkaを使用する際にエラーや障害を処理する方法はありますか?**

  はい、ClickPipes for Kafkaは、ネットワークの問題や接続の問題など、あらゆる運用上の問題によりKafkaからのデータ消費時に障害が発生した場合、自動的に再試行します。不正な形式のデータや無効なスキーマが発生した場合、ClickPipesはそのレコードをrecord_errorテーブルに保存し、処理を続行します。
