---
sidebar_label: 導入
description: 外部データソースを ClickHouse Cloud にシームレスに接続します。
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


# ClickHouse Cloud との統合

## 導入 {#introduction}

[ClickPipes](/integrations/clickpipes) は、さまざまなソースからのデータの取り込みをボタンをクリックするだけで簡単に行える管理された統合プラットフォームです。最も要求の厳しいワークロード向けに設計された ClickPipes の堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。ClickPipes は長期的なストリーミングニーズや一回限りのデータロードジョブに使用できます。

<img src={clickpipes_stack} alt="ClickPipes スタック" />

## サポートされているデータソース {#supported-data-sources}

| 名前                   | ロゴ | 種類            | ステータス       | 説明                                                                                               |
|------------------------|------|-----------------|-----------------|---------------------------------------------------------------------------------------------------|
| Apache Kafka           |<Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定           | ClickPipes を構成し、Apache Kafka から ClickHouse Cloud へストリーミングデータを取り込み始めます。            |
| Confluent Cloud        |<Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>| ストリーミング | 安定           | Confluent と ClickHouse Cloud の統合を通じて、その結合されたパワーを活用しましょう。                      |
| Redpanda               |<img src={redpanda_logo} class="image" alt="Redpanda ロゴ" style={{width: '2.5rem', 'background-color': 'transparent'}}/>| ストリーミング | 安定           | ClickPipes を構成し、Redpanda から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。        |
| AWS MSK                |<Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定           | ClickPipes を構成し、AWS MSK から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs       |<Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>| ストリーミング | 安定           | ClickPipes を構成し、Azure Event Hubs から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。 |
| WarpStream             |<Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>| ストリーミング | 安定           | ClickPipes を構成し、WarpStream から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。       |
| Amazon S3              |<S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>| オブジェクトストレージ | 安定           | ClickPipes を構成して、オブジェクトストレージから大量のデータを取り込みます。                                    |
| Google Cloud Storage   |<Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>| オブジェクトストレージ | 安定           | ClickPipes を構成して、オブジェクトストレージから大量のデータを取り込みます。                                    |
| Amazon Kinesis         |<Amazonkinesis class="image" alt="Amazon Kenesis ロゴ" style={{width: '3rem', height: 'auto'}}/>| ストリーミング | 安定           | ClickPipes を構成し、Amazon Kinesis から ClickHouse Cloud へストリーミングデータを取り込み始めます。           |
| Postgres               |<Postgressvg class="image" alt="Postgres ロゴ" style={{width: '3rem', height: 'auto'}}/>| DBMS          | パブリックベータ | ClickPipes を構成し、Postgres から ClickHouse Cloud へのデータの取り込みを開始します。                         |

さらに多くのコネクタが ClickPipes に追加される予定です。詳細については、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## 静的 IP アドレスのリスト {#list-of-static-ips}

以下は、ClickPipes が外部サービスに接続するために使用する静的 NAT IP（地域別に分かれています）です。関連するインスタンス地域の IP を IP 許可リストに追加して、トラフィックを許可してください。インスタンス地域がここにリストされていない場合は、デフォルト地域にフォールバックします。

- **eu-central-1** EU 地域用
- **us-east-1** `us-east-1` のインスタンス用
- **us-east-2** 他のすべての地域用

| ClickHouse Cloud 地域 | IP アドレス |
|-----------------------|--------------|
| **eu-central-1**      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## ClickHouse 設定の調整 {#adjusting-clickhouse-settings}
ClickHouse Cloud は、ほとんどのユースケースに対して妥当なデフォルト値を提供します。ただし、ClickPipes の宛先テーブルの ClickHouse 設定を調整する必要がある場合、ClickPipes 用の専用ロールが最も柔軟なソリューションです。
手順：
1. カスタムロールを作成 `CREATE ROLE my_clickpipes_role SETTINGS ...`。詳細については、[CREATE ROLE](/sql-reference/statements/create/role.md) 文法を参照してください。
2. ClickPipes の作成時に `詳細と設定` ステップで、カスタムロールを ClickPipes ユーザーに追加します。

<img src={cp_custom_role} alt="カスタムロールの割り当て" />

## エラー報告 {#error-reporting}
ClickPipes は、宛先テーブルの横に `<destination_table_name>_clickpipes_error` という接尾辞を持つテーブルを作成します。このテーブルには、ClickPipe の操作からのエラー（ネットワーク、接続など）や、スキーマに準拠しないデータが含まれます。エラーテーブルの有効期限（[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)）は 7 日間です。
ClickPipes が 15 分後にデータソースまたは宛先に接続できない場合、ClickPipes インスタンスは停止し、エラーテーブルに適切なメッセージを保存します（ClickHouse インスタンスが利用可能な場合）。

## よくある質問 {#faq}
- **ClickPipes とは何ですか？**

  ClickPipes は、ユーザーが ClickHouse サービスを外部データソース、特に Kafka に接続するのを容易にする ClickHouse Cloud の機能です。ClickPipes for Kafka を使用すると、ユーザーはデータを ClickHouse に継続的にロードできるため、リアルタイム分析に利用可能となります。

- **ClickPipes はデータ変換をサポートしていますか？**

  はい、ClickPipes は基本的なデータ変換を DDL 作成を通じて公開することによりサポートしています。ClickHouse Cloud サービスの宛先テーブルにデータがロードされる際に、ClickHouse の [マテリアライズドビュー機能](/guides/developer/cascading-materialized-views) を利用して、より高度な変換を適用できます。

- **ClickPipes を使用すると追加費用が発生しますか？**

  ClickPipes は、取り込まれたデータと計算の 2 次元で請求されます。料金の詳細は、[このページ](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq) で確認できます。ClickPipes を実行すると、宛先の ClickHouse Cloud サービスで、他の取り込みワークロードと同様に、間接的な計算およびストレージコストも発生する可能性があります。

- **Kafka 用の ClickPipes を使用している際に、エラーや失敗を処理する方法はありますか？**

  はい、ClickPipes for Kafka は、データを Kafka から取得する際に失敗した場合、自動的に再試行します。また、ClickPipes は、エラーや不正なデータを 7 日間保持する専用のエラーテーブルを有効にすることもサポートしています。
