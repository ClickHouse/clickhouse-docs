---
sidebar_label: はじめに
description: あなたの外部データソースを ClickHouse Cloud にシームレスに接続します。
slug: /integrations/clickpipes
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';


# ClickHouse Cloudとの統合

## はじめに {#introduction}

[ClickPipes](/integrations/clickpipes)は、さまざまなデータソースからデータを取り込むための管理された統合プラットフォームです。 数回のクリックで簡単に操作できます。最も要求の厳しいワークロード向けに設計されたClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。ClickPipesは、長期的なストリーミングニーズや、一度限りのデータロードジョブに使用することができます。

<img src={clickpipes_stack} alt="ClickPipes スタック" />

## 対応データソース {#supported-data-sources}

| 名称                  | ロゴ|タイプ| ステータス         | 説明                                                                                                    |
|----------------------|----|----|-----------------|--------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>|ストリーミング| 安定          | ClickPipesを設定し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込み始めましょう。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>|ストリーミング| 安定          | ConfluentとClickHouse Cloudの組み合わせの力を、直接の統合を通じて解放します。                      |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Redpanda ロゴ" style={{width: '2.5rem', 'background-color': 'transparent'}}/>|ストリーミング| 安定          | ClickPipesを設定し、RedpandaからClickHouse Cloudにストリーミングデータを取り込み始めましょう。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>|ストリーミング| 安定          | ClickPipesを設定し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込み始めましょう。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>|ストリーミング| 安定          | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込み始めましょう。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>|ストリーミング| 安定          | ClickPipesを設定し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込み始めましょう。       |
| Amazon S3            |<S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                    |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>|オブジェクトストレージ| 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                    |
| Amazon Kinesis       |<Amazonkinesis class="image" alt="Amazon Kinesis ロゴ" style={{width: '3rem', height: 'auto'}}/>|ストリーミング| 安定          | ClickPipesを設定し、Amazon KinesisからClickHouse Cloudにストリーミングデータを取り込み始めましょう。 |
| Postgres             |<Postgressvg class="image" alt="Postgres ロゴ" style={{width: '3rem', height: 'auto'}}/>|DBMS| パブリックベータ | ClickPipesを設定し、PostgresからClickHouse Cloudにデータを取り込み始めましょう。                   |

ClickPipesにはさらなるコネクタが追加される予定です。詳細は[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

## 静的 IP リスト {#list-of-static-ips}

以下は、ClickPipesが外部サービスに接続するために使用する静的 NAT IP（リージョンごとに分かれています）です。
関連するインスタンスリージョンの IP を IP の許可リストに追加してトラフィックを許可する必要があります。
インスタンスリージョンがここにリストされていない場合、デフォルトリージョンにフォールバックします：

- EUリージョン用の **eu-central-1**
- `us-east-1` のインスタンス用の **us-east-1**
- その他のすべてのリージョン用の **us-east-2**

| ClickHouse Cloud リージョン | IP アドレス |
|-------------------------|--------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## ClickHouse 設定の調整 {#adjusting-clickhouse-settings}
ClickHouse Cloudは、ほとんどの使用ケースに対して sensible defaults を提供します。ただし、ClickPipes の宛先テーブルの ClickHouse 設定を調整する必要がある場合、ClickPipes のための専用のロールが最も柔軟なソリューションです。
手順:
1. カスタムロールを作成します `CREATE ROLE my_clickpipes_role SETTINGS ...`。詳細については、[CREATE ROLE](/sql-reference/statements/create/role.md)の構文を参照してください。
2. ClickPipesの作成中の「詳細と設定」のステップでカスタムロールをClickPipesユーザーに追加してください。

<img src={cp_custom_role} alt="カスタムロールの割り当て" />

## エラー報告 {#error-reporting}
ClickPipesは、宛先テーブルの隣に `<destination_table_name>_clickpipes_error` という接尾辞のついたテーブルを作成します。このテーブルには、ClickPipeの操作（ネットワーク、接続など）からのエラーや、スキーマに従わないデータが含まれます。エラーテーブルには[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)が設定され、7日間保持されます。
ClickPipesがデータソースまたは宛先への接続に15分間失敗した場合、ClickPipesインスタンスは停止し、エラーテーブルに適切なメッセージを保存します（ClickHouseインスタンスが利用可能である場合）。

## よくある質問 {#faq}
- **ClickPipesとは何ですか？**

  ClickPipesは、ユーザーがClickHouseサービスを外部データソース、具体的にはKafkaに簡単に接続できるClickHouse Cloudの機能です。ClickPipesを使用することで、ユーザーはデータをClickHouseにリアルタイムで分析できるように、継続的にローディングすることができます。

- **ClickPipesはデータ変換をサポートしていますか？**

  はい、ClickPipesはDDL作成を公開することによって基本的なデータ変換をサポートしています。その後、ClickHouse Cloudサービスの宛先テーブルにデータがロードされる際に、より高度な変換を適用できます。これにはClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を活用します。

- **ClickPipesを使用すると追加料金が発生しますか？**

  ClickPipesは、取り込まれるデータとコンピュートの二次元で請求されます。価格の詳細については、[このページ](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing)をご覧ください。ClickPipesを実行すると、宛先のClickHouse Cloudサービスでも、あらゆる取り込みワークロードと同様に、間接的な計算およびストレージコストが発生する場合があります。

- **ClickPipesを使用してKafkaを扱う際に、エラーや失敗を処理する方法はありますか？**

  はい、ClickPipes for KafkaはデータをKafkaから消費する際の失敗時に自動的に再試行します。また、ClickPipesはエラーと欠陥データを7日間保持する専用のエラーテーブルを有効にすることもサポートしています。
