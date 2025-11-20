---
sidebar_label: '連携'
slug: /manage/integrations
title: '連携'
description: 'ClickHouse の連携機能'
doc_type: 'landing-page'
keywords: ['integrations', 'cloud features', 'third-party tools', 'data sources', 'connectors']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import AmazonKinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import Image from '@theme/IdealImage';

ClickHouse Cloud では、お使いのツールやサービスを自由に連携できます。


## ClickHouse Cloud向けマネージド統合パイプライン {#clickpipes}

ClickPipesは、多様なソースからのデータ取り込みを数回のクリックで簡単に実現するマネージド統合プラットフォームです。
最も要求の厳しいワークロード向けに設計されたClickPipesの堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を保証します。
ClickPipesは、長期的なストリーミングニーズや一回限りのデータロードジョブに使用できます。

| 名前                                               | ロゴ                                                                                             | タイプ           | ステータス          | 説明                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | ストリーミング      | 安定版          | ClickPipesを設定し、Apache KafkaからClickHouse Cloudへのストリーミングデータの取り込みを開始します。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | ストリーミング      | 安定版          | 直接統合により、ConfluentとClickHouse Cloudの統合パワーを活用できます。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | ストリーミング      | 安定版          | ClickPipesを設定し、RedpandaからClickHouse Cloudへのストリーミングデータの取り込みを開始します。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | ストリーミング      | 安定版          | ClickPipesを設定し、AWS MSKからClickHouse Cloudへのストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | ストリーミング      | 安定版          | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudへのストリーミングデータの取り込みを開始します。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | ストリーミング      | 安定版          | ClickPipesを設定し、WarpStreamからClickHouse Cloudへのストリーミングデータの取り込みを開始します。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | オブジェクトストレージ | 安定版          | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | オブジェクトストレージ | 安定版          | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | オブジェクトストレージ | 安定版          | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                            |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | オブジェクトストレージ | プライベートベータ    | ClickPipesを設定し、オブジェクトストレージから大量のデータを取り込みます。                            |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> | ストリーミング      | 安定版          | ClickPipesを設定し、Amazon KinesisからClickHouse Cloudへのストリーミングデータの取り込みを開始します。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | DBMS           | 安定版          | ClickPipesを設定し、PostgresからClickHouse Cloudへのデータ取り込みを開始します。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               | DBMS           | プライベートベータ    | ClickPipesを設定し、MySQLからClickHouse Cloudへのデータ取り込みを開始します。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           | DBMS           | プライベートプレビュー | ClickPipesを設定し、MongoDBからClickHouse Cloudへのデータ取り込みを開始します。                    |


## 言語クライアント統合 {#language-client-integrations}

ClickHouseは複数の言語クライアント統合を提供しており、各ドキュメントへのリンクは以下の通りです。

| ページ                                                            | 説明                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [C++](/interfaces/cpp)                                          | C++クライアントライブラリとuserver非同期フレームワーク                            |
| [C#](/integrations/csharp)                                      | C#プロジェクトをClickHouseに接続する方法について説明します。                             |
| [Go](/integrations/go)                                          | GoプロジェクトをClickHouseに接続する方法について説明します。                             |
| [JavaScript](/integrations/javascript)                          | 公式JSクライアントを使用してJavaScriptプロジェクトをClickHouseに接続する方法について説明します。 |
| [Java](/integrations/java)                                      | JavaとClickHouseの複数の統合について詳しく説明します。                   |
| [Python](/integrations/python)                                  | PythonプロジェクトをClickHouseに接続する方法について説明します。                         |
| [Rust](/integrations/rust)                                      | RustプロジェクトをClickHouseに接続する方法について説明します。                           |
| [サードパーティクライアント](/interfaces/third-party/client-libraries) | サードパーティ開発者によるクライアントライブラリについて詳しく説明します。                   |

ClickPipesや言語クライアントに加えて、ClickHouseはコア統合、パートナー統合、コミュニティ統合を含む多数の統合をサポートしています。
完全なリストについては、ドキュメントの[「統合」](/integrations)セクションを参照してください。
