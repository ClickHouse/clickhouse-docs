---
sidebar_label: 'はじめに'
description: '外部データソースを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes
title: 'ClickHouse Cloud との統合'
---
```

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


# ClickHouse Cloud との統合

## はじめに {#introduction}

[ClickPipes](/integrations/clickpipes) は、さまざまなソースからのデータ取り込みをボタンをクリックするだけでシンプルに実現するための管理された統合プラットフォームです。最も要求の厳しいワークロード向けに設計された ClickPipes の堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。ClickPipes は、長期的なストリーミングニーズや、一度限りのデータロードジョブに使用できます。

<Image img={clickpipes_stack} alt="ClickPipes スタック" size="lg" border/>

## サポートされているデータソース {#supported-data-sources}

| 名前                  | ロゴ                                                                                             |種類| ステータス           | 説明                                                                                                 |
|-----------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka          | <Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>      |ストリーミング| 安定            | ClickPipes を設定し、Apache Kafka から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。     |
| Confluent Cloud       | <Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>                 |ストリーミング| 安定            | 当社の直接統合を通じて、Confluent と ClickHouse Cloud の組み合わせの力を解き放ちます。                  |
| Redpanda              | <Image img={redpanda_logo} size="logo" alt="Redpanda ロゴ"/>                                     |ストリーミング| 安定            | ClickPipes を設定し、Redpanda から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。       |
| AWS MSK               | <Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>             |ストリーミング| 安定            | ClickPipes を設定し、AWS MSK から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。      |
| Azure Event Hubs      | <Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>           |ストリーミング| 安定            | ClickPipes を設定し、Azure Event Hubs から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。|
| WarpStream            | <Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>                     |ストリーミング| 安定            | ClickPipes を設定し、WarpStream から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。   |
| Amazon S3             | <S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>              |オブジェクトストレージ| 安定          | ClickPipes を設定し、オブジェクトストレージから大量のデータを取り込みます。                             |
| Google Cloud Storage  | <Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>  |オブジェクトストレージ| 安定          | ClickPipes を設定し、オブジェクトストレージから大量のデータを取り込みます。                             |
| DigitalOcean Spaces   | <DOsvg class="image" alt="Digital Ocean ロゴ" style={{width: '3rem', height: 'auto'}}/>         |オブジェクトストレージ| 安定          | ClickPipes を設定し、オブジェクトストレージから大量のデータを取り込みます。                             |
| Azure Blob Storage    | <ABSsvg class="image" alt="Azure Blob Storage ロゴ" style={{width: '3rem', height: 'auto'}}/> |オブジェクトストレージ| プライベートベータ | ClickPipes を設定し、オブジェクトストレージから大量のデータを取り込みます。                             |
| Amazon Kinesis        | <Amazonkinesis class="image" alt="Amazon Kinesis ロゴ" style={{width: '3rem', height: 'auto'}}/> |ストリーミング| 安定            | ClickPipes を設定し、Amazon Kinesis から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。|
| Postgres              | <Postgressvg class="image" alt="Postgres ロゴ" style={{width: '3rem', height: 'auto'}}/>         |DBMS| パブリックベータ  | ClickPipes を設定し、Postgres から ClickHouse Cloud へのデータの取り込みを開始します。                    |
| MySQL                 | <Mysqlsvg class="image" alt="MySQL ロゴ" style={{width: '3rem', height: 'auto'}}/>               |DBMS| プライベートベータ | ClickPipes を設定し、MySQL から ClickHouse Cloud へのデータの取り込みを開始します。                      |

より多くのコネクタが ClickPipes に追加される予定です。詳細については [お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes) ください。

## 静的 IP アドレスのリスト {#list-of-static-ips}

以下は、ClickPipes が外部サービスに接続するために使用する静的 NAT IP (地域別) です。
関連するインスタンスの地域の IP を IP 許可リストに追加して、トラフィックを許可してください。
インスタンスの地域がここにリストされていない場合、デフォルト地域にフォールバックします：

- **eu-central-1** は EU 地域向け
- **us-east-1** は `us-east-1` にあるインスタンス向け
- **us-east-2** はその他すべての地域向け

| ClickHouse Cloud 地域  | IP アドレス |
|-------------------------|--------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## ClickHouse 設定の調整 {#adjusting-clickhouse-settings}
ClickHouse Cloud は、ほとんどのユースケースに対して妥当なデフォルトを提供します。しかし、ClickPipes のデスティネーションテーブルのために ClickHouse 設定を調整する必要がある場合、ClickPipes 用の専用ロールが最も柔軟な解決策です。
手順：
1. カスタムロールを作成 `CREATE ROLE my_clickpipes_role SETTINGS ...`。詳細は [CREATE ROLE](/sql-reference/statements/create/role.md) 構文を参照してください。
2. ClickPipes 作成中のステップ `詳細と設定` でカスタムロールを ClickPipes ユーザーに追加します。

<Image img={cp_custom_role} alt="カスタムロールの割り当て" size="lg" border/>

## エラーレポート {#error-reporting}
ClickPipes は、デスティネーションテーブルの隣に `<destination_table_name>_clickpipes_error` の接尾辞を持つテーブルを作成します。このテーブルには、ClickPipe の操作から生じたエラー（ネットワーク、接続性など）およびスキーマに準拠しないデータが含まれます。エラーテーブルの [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) は 7 日です。
ClickPipes がデータソースまたはデスティネーションに 15 分後に接続できない場合、ClickPipes インスタンスは停止し、エラーテーブルに適切なメッセージを保存します（ClickHouse インスタンスが利用可能な場合）。

## よくある質問 {#faq}
- **ClickPipes とは何ですか？**

  ClickPipes は、ユーザーが ClickHouse サービスを外部データソース、特に Kafka に接続するのを簡単にする ClickHouse Cloud の機能です。ClickPipes for Kafka を利用することで、ユーザーはデータを ClickHouse に継続的に取り込むことができ、リアルタイム分析に利用できるようになります。

- **ClickPipes はデータ変換をサポートしていますか？**

  はい、ClickPipes は DDL 作成を公開することで基本的なデータ変換をサポートしています。その後、ClickHouse Cloud サービスのデスティネーションテーブルにデータがロードされる際に、より高度な変換を適用することができます。 ClickHouse の [マテリアライズドビュー機能](/guides/developer/cascading-materialized-views) を活用します。

- **ClickPipes の使用は追加料金が発生しますか？**

  ClickPipes は、取り込まれたデータとコンピュートの 2 つの次元で請求されます。料金の詳細については [このページ](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq) で確認できます。ClickPipes の実行は、デスティネーションの ClickHouse Cloud サービスに対する間接的なコンピュータおよびストレージコストを生成する可能性があり、これは他の取り込みワークロードと同様です。

- **ClickPipes for Kafka を使用しているときにエラーや障害を処理する方法はありますか？**

  はい、ClickPipes for Kafka は、Kafka からデータを消費する際に障害が発生した場合、自動的に再試行します。ClickPipes は、7 日間エラーおよび不正形成データを保持する専用のエラーテーブルを有効にすることもサポートしています。
