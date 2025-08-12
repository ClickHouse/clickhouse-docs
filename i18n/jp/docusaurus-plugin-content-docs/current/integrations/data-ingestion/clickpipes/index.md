---
sidebar_label: 'はじめに'
description: '外部データソースをClickHouse Cloudにシームレスに接続します。'
slug: '/integrations/clickpipes'
title: 'Integrating with ClickHouse Cloud'
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
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloudとの統合

## はじめに {#introduction}

[ClickPipes](/integrations/clickpipes) は、さまざまなソースからのデータを簡単にインジェストできる管理された統合プラットフォームです。最も要求の厳しいワークロード向けに設計されたClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を確保します。ClickPipesは、長期的なストリーミングニーズや一回限りのデータロードジョブに使用できます。

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## サポートされているデータソース {#supported-data-sources}

| 名前                   | ロゴ                                                                                             | タイプ       | ステータス       | 説明                                                                                                 |
|------------------------|--------------------------------------------------------------------------------------------------|-------------|------------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka           | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | ストリーミング | 安定            | ClickPipesを設定し、Apache KafkaからClickHouse Cloudへのストリーミングデータをインジェスト開始します。     |
| Confluent Cloud        | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | ストリーミング | 安定            | ConfluentとClickHouse Cloudの統合による強力な機能を解放します。                                     |
| Redpanda               | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | ストリーミング | 安定            | ClickPipesを設定し、RedpandaからClickHouse Cloudへのストリーミングデータをインジェスト開始します。         |
| AWS MSK                | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | ストリーミング | 安定            | ClickPipesを設定し、AWS MSKからClickHouse Cloudへのストリーミングデータをインジェスト開始します。          |
| Azure Event Hubs       | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | ストリーミング | 安定            | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudへのストリーミングデータをインジェスト開始します。 |
| WarpStream             | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | ストリーミング | 安定            | ClickPipesを設定し、WarpStreamからClickHouse Cloudへのストリーミングデータをインジェスト開始します。       |
| Amazon S3              | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | オブジェクトストレージ | 安定         | ClickPipesを設定し、オブジェクトストレージから大量のデータをインジェストします。                            |
| Google Cloud Storage   | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | オブジェクトストレージ | 安定         | ClickPipesを設定し、オブジェクトストレージから大量のデータをインジェストします。                            |
| DigitalOcean Spaces    | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>           | オブジェクトストレージ | 安定         | ClickPipesを設定し、オブジェクトストレージから大量のデータをインジェストします。                           |
| Azure Blob Storage      | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | オブジェクトストレージ | プライベートベータ | ClickPipesを設定し、オブジェクトストレージから大量のデータをインジェストします。                           |
| Amazon Kinesis         | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | ストリーミング | 安定            | ClickPipesを設定し、Amazon KinesisからClickHouse Cloudへのストリーミングデータをインジェスト開始します。   |
| Postgres               | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | DBMS        | パブリックベータ  | ClickPipesを設定し、PostgresからClickHouse Cloudへのデータをインジェスト開始します。                     |
| MySQL                  | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               | DBMS        | プライベートベータ | ClickPipesを設定し、MySQLからClickHouse Cloudへのデータをインジェスト開始します。                          |


より多くのコネクタがClickPipesに追加されます。詳細については、[お問い合せ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## スタティックIPのリスト {#list-of-static-ips}

以下は、ClickPipesが外部サービスに接続するために使用する静的NAT IP（地域別に分けたもの）です。関連するインスタンスの地域のIPをIP許可リストに追加して、トラフィックを許可してください。 
インスタンスの地域がここにリストされていない場合は、デフォルトの地域にフォールバックします：

- **eu-central-1** EU地域用
- **us-east-1** `us-east-1`のインスタンス用
- **us-east-2** その他すべての地域用

| ClickHouse Cloud地域   | IPアドレス                               |
|-------------------------|-----------------------------------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## ClickHouse設定の調整 {#adjusting-clickhouse-settings}
ClickHouse Cloudは、ほとんどのユースケースに対して合理的なデフォルトを提供します。ただし、ClickPipesの宛先テーブルのためにいくつかのClickHouse設定を調整する必要がある場合は、ClickPipes用の専用ロールが最も柔軟なソリューションです。
手順：
1. カスタムロール `CREATE ROLE my_clickpipes_role SETTINGS ...` を作成します。[CREATE ROLE](/sql-reference/statements/create/role.md) 構文の詳細を参照してください。
2. ClickPipesの作成中の「詳細と設定」ステップでカスタムロールをClickPipesユーザーに追加します。

<Image img={cp_custom_role} alt="Assign a custom role" size="lg" border/>

## エラーレポート {#error-reporting}
ClickPipesは、宛先テーブルの隣に `<destination_table_name>_clickpipes_error` という接尾辞を持つテーブルを作成します。このテーブルには、ClickPipeの操作（ネットワーク、接続など）からのエラーや、スキーマに準拠していないデータが含まれます。エラー テーブルには [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) が 7 日間設定されています。
ClickPipesがデータソースまたは宛先に15分間接続できない場合、ClickPipesインスタンスは停止し、エラーテーブルに適切なメッセージを保存します（ClickHouseインスタンスが利用可能な場合）。

## よくある質問 {#faq}
- **ClickPipesとは何ですか？**

  ClickPipesは、ユーザーがClickHouseサービスを外部データソース、特にKafkaに接続しやすくするClickHouse Cloudの機能です。ClickPipesを使用すると、ユーザーは簡単にデータをClickHouseに継続的にロードし、リアルタイム解析のためにそれを利用可能にします。

- **ClickPipesはデータ変換をサポートしていますか？**

  はい、ClickPipesはDDL作成を公開することにより、基本的なデータ変換をサポートしています。これにより、ClickHouse Cloudサービスの宛先テーブルにデータがロードされる際に、より高度な変換を適用できます。ClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を活用できます。

- **ClickPipesの使用には追加コストがかかりますか？**

  ClickPipesは、インジェストされたデータとコンピュートの二つの次元で請求されます。料金の詳細は[このページ](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq)で確認できます。ClickPipesを実行すると、宛先ClickHouse Cloudサービスでの間接的なコンピュートおよびストレージコストが発生する場合もあります。

- **Kafka用のClickPipesを使用する際のエラーや失敗を処理する方法はありますか？**

  はい、ClickPipes for Kafkaは、Kafkaからデータを消費する際に失敗した場合、自動的に再試行します。ClickPipesは、エラーと不正なデータを7日間保持する専用のエラーテーブルを有効にすることもサポートしています。
