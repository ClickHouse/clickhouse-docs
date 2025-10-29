---
'sidebar_label': 'イントロダクション'
'description': '外部データソースをClickHouse Cloudにシームレスに接続します。'
'slug': '/integrations/clickpipes'
'title': 'ClickHouse Cloudとの統合'
'doc_type': 'guide'
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


# ClickHouse Cloudとの統合

## はじめに {#introduction}

[ClickPipes](/integrations/clickpipes) は、さまざまなデータソースからのデータ取り込みをボタンを数回クリックするだけで簡単に行えるマネージド統合プラットフォームです。最も要求の厳しいワークロード向けに設計されたClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。ClickPipesは長期的なストリーミングニーズや一度限りのデータロードジョブに使用できます。

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## サポートされているデータソース {#supported-data-sources}

| 名前                                                | ロゴ                                                                                            | 種類     | ステータス        | 説明                                                                                               |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------|----------|-------------------|----------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)      | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | ストリーミング | 安定               | ClickPipesを設定し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込み始めます。          |
| Confluent Cloud                                     | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>              | ストリーミング | 安定               | 直接統合を通じてConfluentとClickHouse Cloudの組み合わせたパワーを解き放ちます。                      |
| Redpanda                                            | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                  | ストリーミング | 安定               | ClickPipesを設定し、RedpandaからClickHouse Cloudにストリーミングデータを取り込み始めます。            |
| AWS MSK                                             | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>        | ストリーミング | 安定               | ClickPipesを設定し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込み始めます。           |
| Azure Event Hubs                                    | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>       | ストリーミング | 安定               | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込み始めます。[Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs)を参照してください。 |
| WarpStream                                          | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                  | ストリーミング | 安定               | ClickPipesを設定し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込み始めます。           |
| Amazon S3                                           | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>         | オブジェクトストレージ | 安定            | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                         |
| Google Cloud Storage                                | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定            | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                         |
| DigitalOcean Spaces                                 | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>      | オブジェクトストレージ | 安定            | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                         |
| Azure Blob Storage                                  | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | オブジェクトストレージ | 安定            | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                         |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | ストリーミング | 安定               | ClickPipesを設定し、Amazon KinesisからClickHouse Cloudにストリーミングデータを取り込み始めます。      |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>     | DBMS      | 安定               | ClickPipesを設定し、PostgresからClickHouse Cloudにデータを取り込み始めます。                     |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: '3rem'}}/>          | DBMS      | パブリックベータ     | ClickPipesを設定し、MySQLからClickHouse Cloudにデータを取り込み始めます。                          |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: '3rem'}}/>      | DBMS      | プライベートプレビュー | ClickPipesを設定し、MongoDBからClickHouse Cloudにデータを取り込み始めます。                        |

さらに多くのコネクタがClickPipesに追加される予定です。詳細については[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## 静的IPのリスト {#list-of-static-ips}

以下は、ClickPipesが外部サービスに接続するために使用する静的NAT IP（地域ごとに区切られています）です。トラフィックを許可するために、関連するインスタンスの地域IPをIP許可リストに追加してください。

すべてのサービスについて、ClickPipesのトラフィックはサービスの場所に基づいてデフォルト地域から発生します：
- **eu-central-1**: EU地域のすべてのサービス。 (これにはGCPおよびAzureのEU地域が含まれます)
- **us-east-1**: AWS `us-east-1`のすべてのサービス。
- **ap-south-1**: 2025年6月25日以降に作成されたAWS `ap-south-1`のサービス（この日以前に作成されたサービスは`us-east-2`のIPを使用します）。
- **ap-southeast-2**: 2025年6月25日以降に作成されたAWS `ap-southeast-2`のサービス（この日以前に作成されたサービスは`us-east-2`のIPを使用します）。
- **us-west-2**: 2025年6月24日以降に作成されたAWS `us-west-2`のサービス（この日以前に作成されたサービスは`us-east-2`のIPを使用します）。
- **us-east-2**: 明示的にリストされていないすべての地域。 (これにはGCPおよびAzureのUS地域が含まれます)

| AWS地域                             | IPアドレス                                                                                                                                     |
|--------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **eu-central-1**                     | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                   |
| **us-east-1**                        | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`       |
| **us-east-2**                        | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                               |
| **ap-south-1** (2025年6月25日以降)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                            |
| **ap-southeast-2** (2025年6月25日以降) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                             |
| **us-west-2** (2025年6月24日以降)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                            |

## ClickHouse設定の調整 {#adjusting-clickhouse-settings}
ClickHouse Cloudは、ほとんどのユースケースに対して妥当なデフォルトを提供します。ただし、ClickPipesの宛先テーブルに対してClickHouseの設定を調整する必要がある場合は、ClickPipes用の専用ロールが最も柔軟な解決策です。
手順：
1. カスタムロール `CREATE ROLE my_clickpipes_role SETTINGS ...` を作成します。詳細は[CREATE ROLE](/sql-reference/statements/create/role.md)の構文を参照してください。
2. ClickPipesユーザーにカスタムロールを追加します。ClickPipes作成時の`詳細と設定`のステップで行います。

<Image img={cp_custom_role} alt="Assign a custom role" size="lg" border/>

## ClickPipesの高度な設定の調整 {#clickpipes-advanced-settings}
ClickPipesは、ほとんどのユースケースの要件をカバーする妥当なデフォルトを提供します。ユースケースによって追加の微調整が必要な場合、次の設定を調整できます。

### オブジェクトストレージ ClickPipes {#clickpipes-advanced-settings-object-storage}

| 設定                                   | デフォルト値  | 説明                                                                                                                              |                    
|----------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `Max insert bytes`                    | 10GB           | 単一の挿入バッチで処理するバイト数。                                                                                                 |
| `Max file count`                      | 100            | 単一の挿入バッチで処理するファイルの最大数。                                                                                       |
| `Max threads`                         | auto(3)        | [ファイル処理の最大同時スレッド数](/operations/settings/settings#max_threads)。                                                            |
| `Max insert threads`                  | 1              | [ファイル処理の最大同時挿入スレッド数](/operations/settings/settings#max_insert_threads)。                                               |
| `Min insert block size bytes`         | 1GB            | [テーブルに挿入できるブロック内のバイトの最小サイズ](/operations/settings/settings#min_insert_block_size_bytes)。                                     |
| `Max download threads`                | 4              | [最大同時ダウンロードスレッド数](/operations/settings/settings#max_download_threads)。                                                     |
| `Object storage polling interval`     | 30秒           | ClickHouseクラスタにデータを挿入する前の最大待機時間を構成します。                                                                 |
| `Parallel distributed insert select`   | 2              | [並列分散挿入選択設定](/operations/settings/settings#parallel_distributed_insert_select)。                                                |
| `Parallel view processing`            | false          | [順次ではなく同時に](/operations/settings/settings#parallel_view_processing)アタッチされたビューへのプッシュを有効にするかどうか。                    |
| `Use cluster function`                | true           | 複数のノード間でファイルを並行処理するかどうか。                                                                                         |

<Image img={cp_advanced_settings} alt="Advanced settings for ClickPipes" size="lg" border/>

### ストリーミング ClickPipes {#clickpipes-advanced-settings-streaming}

| 設定                                   | デフォルト値 | 説明                                                                                                                              |                    
|----------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `Streaming max insert wait time`      | 5秒            | ClickHouseクラスタにデータを挿入する前の最大待機時間を構成します。                                                                     |

## エラー報告 {#error-reporting}
ClickPipesは、取り込みプロセス中に発生したエラーの種類に応じて2つの異なるテーブルにエラーを格納します。
### レコードエラー {#record-errors}
ClickPipesは、宛先テーブルの隣に`<destination_table_name>_clickpipes_error`という後置詞を持つテーブルを作成します。このテーブルは、形式が正しくないデータやスキーマの不一致からのエラーを含み、無効なメッセージの全文を含みます。このテーブルには7日間の[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)があります。
### システムエラー {#system-errors}
ClickPipeの動作に関連するエラーは、`system.clickpipes_log`テーブルに格納されます。これにより、ネットワーク、接続性などのClickPipeの動作に関連する他のすべてのエラーが保存されます。このテーブルにも7日間の[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)があります。

ClickPipesが15分後にデータソースに接続できない場合、または1時間後に宛先に接続できない場合、ClickPipesインスタンスは停止し、システムエラーのテーブルに適切なメッセージを保存します（ClickHouseインスタンスが利用可能な場合）。 

## FAQ {#faq}
- **ClickPipesとは何ですか？**

  ClickPipesは、ユーザーがClickHouseサービスを外部データソース、特にKafkaに接続するのを容易にするClickHouse Cloudの機能です。ClickPipes for Kafkaを使用すると、ユーザーは簡単にデータをClickHouseに継続的にロードし、リアルタイムの分析に利用できるようになります。

- **ClickPipesはデータ変換をサポートしていますか？**

  はい、ClickPipesはDDL作成を公開することによって基本的なデータ変換をサポートしています。その後、ClickHouse Cloudサービスの宛先テーブルにデータがロードされる際に、ClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を利用して、より高度な変換を適用できます。

- **ClickPipesを使用すると追加料金が発生しますか？**

  ClickPipesは、取り込まれたデータと計算の2つの次元で請求されます。価格の詳細は[このページ](/cloud/reference/billing/clickpipes)で確認できます。ClickPipesを実行すると、宛先のClickHouse Cloudサービスにおいて、他の取り込み作業と同様の間接的な計算およびストレージコストが発生する可能性もあります。

- **ClickPipes for Kafkaを使用する際にエラーや失敗を処理する方法はありますか？**

  はい、ClickPipes for Kafkaは、ネットワークの問題、接続の問題などを含む操作上の問題が発生した場合に、自動的に再試行を行います。形式が正しくないデータや無効なスキーマの場合、ClickPipesはレコードをrecord_errorテーブルに保存し、処理を続けます。
