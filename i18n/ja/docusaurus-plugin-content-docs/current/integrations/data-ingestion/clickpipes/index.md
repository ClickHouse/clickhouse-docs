---
sidebar_label: はじめに
description: 外部データソースをClickHouse Cloudにシームレスに接続します。
slug: /integrations/clickpipes
---

import KafkaSVG from "../../images/logos/kafka.svg";
import ConfluentSVG from "../../images/logos/confluent.svg";
import MskSVG from "../../images/logos/msk.svg";
import AzureEventHubsSVG from "../../images/logos/azure_event_hubs.svg";
import WarpStreamSVG from "../../images/logos/warpstream.svg";
import S3SVG from "../../images/logos/amazon_s3_logo.svg";
import AmazonKinesis from "../../images/logos/amazon_kinesis_logo.svg";
import GCSSVG from "../../images/logos/gcs.svg";
import PostgresSVG from "../../images/logos/postgresql.svg";

# ClickHouse Cloudとの統合

## はじめに {#introduction}

[ClickPipes](/integrations/clickpipes)は、さまざまなソースからデータを取り込むための管理された統合プラットフォームであり、ボタンを数回クリックするだけで簡単にデータを取り込むことができます。最も要求の厳しいワークロード向けに設計されたClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。ClickPipesは、長期的なストリーミングニーズや、一回限りのデータロードジョブに使用できます。

![ClickPipesスタック](./images/clickpipes_stack.png)

## サポートされているデータソース {#supported-data-sources}

| 名前                   | ロゴ | タイプ            | ステータス        | 説明                                                                                                 |
|------------------------|------|------------------|-------------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka           |<KafkaSVG style={{width: '3rem', 'height': '3rem'}} />| ストリーミング     | 安定          | ClickPipesを設定し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込み始めます。          |
| Confluent Cloud        |<ConfluentSVG style={{width: '3rem'}} />| ストリーミング     | 安定          | 直接統合を通じてConfluentとClickHouse Cloudの結合された力を解き放ちます。                            |
| Redpanda               |<img src={require('../../images/logos/logo_redpanda.png').default} class="image" alt="Redpandaのロゴ" style={{width: '2.5rem', 'background-color': 'transparent'}}/>| ストリーミング     | 安定          | ClickPipesを設定し、RedpandaからClickHouse Cloudにストリーミングデータを取り込み始めます。            |
| AWS MSK                |<MskSVG style={{width: '3rem', 'height': '3rem'}} />| ストリーミング     | 安定          | ClickPipesを設定し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込み始めます。             |
| Azure Event Hubs       |<AzureEventHubsSVG style={{width: '3rem'}} />| ストリーミング     | 安定          | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込み始めます。  |
| WarpStream             |<WarpStreamSVG style={{width: '3rem'}} />| ストリーミング     | 安定          | ClickPipesを設定し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込み始めます。          |
| Amazon S3              |<S3SVG style={{width: '3rem', height: 'auto'}} />| オブジェクトストレージ | 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                        |
| Google Cloud Storage   |<GCSSVG style={{width: '3rem', height: 'auto'}} />| オブジェクトストレージ | 安定          | ClickPipesを設定して、オブジェクトストレージから大量のデータを取り込みます。                        |
| Amazon Kinesis         |<AmazonKinesis style={{width: '3rem', height: 'auto'}} />| ストリーミング     | 安定          | ClickPipesを設定し、Amazon KinesisからClickHouse Cloudにストリーミングデータを取り込み始めます。    |
| Postgres               |<PostgresSVG style={{width: '3rem', height: 'auto'}} />| DBMS              | パブリックベータ  | ClickPipesを設定し、PostgresからClickHouse Cloudにデータを取り込み始めます。                         |

今後、ClickPipesにさらなるコネクタが追加されます。詳細は[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。


## 静的IPのリスト {#list-of-static-ips}

以下は、ClickPipesが外部サービスに接続するために使用する静的NAT IP（地域別に分けられています）です。
関連するインスタンス地域のIPをIP許可リストに追加して、トラフィックを許可します。
ここにリストされていないインスタンス地域の場合、デフォルト地域にフォールバックします:

- **eu-central-1**：EU地域用
- **us-east-1**：`us-east-1`のインスタンス用
- **us-east-2**：その他すべての地域用

| ClickHouse Cloud地域     | IPアドレス                                       |
|-------------------------|--------------------------------------------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## ClickHouse設定の調整 {#adjusting-clickhouse-settings}
ClickHouse Cloudは、ほとんどのユースケースに対して合理的なデフォルトを提供します。ただし、ClickPipesの宛先テーブルのためにClickHouse設定を調整する必要がある場合、ClickPipes用に専用のロールを作成するのが最も柔軟な解決策です。
手順:
1. カスタムロールを作成します `CREATE ROLE my_clickpipes_role SETTINGS ...`。詳細については[CREATE ROLE](/sql-reference/statements/create/role.md)構文を参照してください。
2. ClickPipesの作成時に`詳細と設定`のステップでカスタムロールをClickPipesユーザーに追加します。
![カスタムロールの割り当て](./images/cp_custom_role.png)

## エラー報告 {#error-reporting}
ClickPipesは、宛先テーブルの隣に`<destination_table_name>_clickpipes_error`という接尾語のテーブルを作成します。このテーブルには、ClickPipeの操作（ネットワーク、接続など）からのエラーや、スキーマに準拠しないデータが含まれます。エラーテーブルには、[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)が7日間設定されています。
ClickPipesがデータソースまたは宛先に15分以内に接続できない場合、ClickPipesインスタンスは停止し、エラーテーブルに適切なメッセージを保存します（ClickHouseインスタンスが利用可能であると仮定）。

## よくある質問 {#faq}
- **ClickPipesとは何ですか？**

  ClickPipesは、ユーザーがClickHouseサービスを外部データソース、特にKafkaに接続するのを容易にするClickHouse Cloudの機能です。ClickPipes for Kafkaを使用すると、ユーザーはClickHouseにデータを継続的に簡単にロードできるため、リアルタイム分析に利用できます。

- **ClickPipesはデータ変換をサポートしていますか？**

  はい、ClickPipesはDDL作成を公開することによって基本的なデータ変換をサポートしています。その後、ClickHouse Cloudサービスの宛先テーブルにデータがロードされる際により高度な変換を適用できます。これはClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を活用しています。

- **ClickPipesを使用すると追加のコストが発生しますか？**

  ClickPipesは、取り込まれたデータとコンピュートの2つの次元で請求されます。料金の詳細は[このページ](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing)で確認できます。ClickPipesを実行すると、宛先のClickHouse Cloudサービスにおいて、取り込み作業と同様の間接的なコンピュートおよびストレージコストが発生する可能性があります。

- **ClickPipes for Kafkaを使用する際にエラーや失敗を処理する方法はありますか？**

  はい、ClickPipes for Kafkaは、Kafkaからデータを消費する際に失敗が発生した場合、自動的に再試行を行います。また、ClickPipesには、7日間エラーや不正なデータを保持する専用のエラーテーブルを有効にするサポートがあります。
