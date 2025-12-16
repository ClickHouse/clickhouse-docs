---
sidebar_label: '連携'
slug: /manage/integrations
title: '連携'
description: 'ClickHouse との連携'
doc_type: 'landing-page'
keywords: ['連携', 'クラウド機能', 'サードパーティーツール', 'データソース', 'コネクタ']
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

ClickHouse Cloud を使用すると、お気に入りのツールやサービスを接続できます。


## ClickHouse Cloud 向けマネージド連携パイプライン {#clickpipes}

ClickPipes は、さまざまなソースからのデータを数クリックで取り込めるようにするマネージドインテグレーションプラットフォームです。
最も要求の厳しいワークロードを想定して設計されており、ClickPipes の堅牢でスケーラブルなアーキテクチャにより、一貫したパフォーマンスと高い信頼性を実現します。
ClickPipes は、長期的なストリーミング用途にも、単発のデータロードジョブにも使用できます。

| 名前                                               | ロゴ                                                                                             |種類| ステータス       | 説明                                                                                                 |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>      |ストリーミング| 安定版           | ClickPipes を構成し、Apache Kafka から ClickHouse Cloud へストリーミングデータの取り込みを開始します。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>                 |ストリーミング| 安定版           | 直接連携により、Confluent と ClickHouse Cloud を組み合わせた強力な機能を活用できます。                        |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda ロゴ"/>                                     |ストリーミング| 安定版           | ClickPipes を構成し、Redpanda から ClickHouse Cloud へストリーミングデータの取り込みを開始します。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>             |ストリーミング| 安定版           | ClickPipes を構成し、AWS MSK から ClickHouse Cloud へストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>           |ストリーミング| 安定版           | ClickPipes を構成し、Azure Event Hubs から ClickHouse Cloud へストリーミングデータの取り込みを開始します。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>                     |ストリーミング| 安定版           | ClickPipes を構成し、WarpStream から ClickHouse Cloud へストリーミングデータの取り込みを開始します。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 ロゴ" style={{width: '3rem', height: 'auto'}}/>              |オブジェクトストレージ| 安定版           | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めます。                              |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>  |オブジェクトストレージ| 安定版           | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めます。                              |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="DigitalOcean ロゴ" style={{width: '3rem', height: 'auto'}}/>          | オブジェクトストレージ | 安定版 | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めます。
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage ロゴ" style={{width: '3rem', height: 'auto'}}/>    | オブジェクトストレージ | プライベートベータ版 | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込めます。
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis ロゴ" style={{width: '3rem', height: 'auto'}}/> |ストリーミング| 安定版           | ClickPipes を構成し、Amazon Kinesis から ClickHouse Cloud へストリーミングデータの取り込みを開始します。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres ロゴ" style={{width: '3rem', height: 'auto'}}/>         |DBMS| 安定版      | ClickPipes を構成し、Postgres から ClickHouse Cloud へデータの取り込みを開始します。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL ロゴ" style={{width: '3rem', height: 'auto'}}/>               |DBMS| プライベートベータ版 | ClickPipes を構成し、MySQL から ClickHouse Cloud へデータの取り込みを開始します。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB ロゴ" style={{width: '3rem', height: 'auto'}}/>           |DBMS| プライベートプレビュー版 | ClickPipes を構成し、MongoDB から ClickHouse Cloud へデータの取り込みを開始します。                   |



## 言語クライアント連携 {#language-client-integrations}

ClickHouse には複数の言語クライアント連携が用意されており、それぞれのドキュメントへのリンクは以下のとおりです。

| ページ                                                                    | 説明                                                                                  |
|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ クライアントライブラリおよび userver 非同期フレームワーク                        |
| [C#](/integrations/csharp)                                  | C# プロジェクトを ClickHouse に接続する方法。                                      |
| [Go](/integrations/go)                                          | Go プロジェクトを ClickHouse に接続する方法。                                       |
| [JavaScript](/integrations/javascript)                          | 公式 JS クライアントを使用して JS プロジェクトを ClickHouse に接続する方法。       |
| [Java](/integrations/java)                                      | Java と ClickHouse 向けの複数の連携方法の詳細。                                     |
| [Python](/integrations/python)                                  | Python プロジェクトを ClickHouse に接続する方法。                                   |
| [Rust](/integrations/rust)                                      | Rust プロジェクトを ClickHouse に接続する方法。                                     |
| [サードパーティークライアント](/interfaces/third-party/client-libraries) | サードパーティー開発者によるクライアントライブラリの詳細。                         |

ClickPipes や言語クライアントに加えて、ClickHouse はコア連携、パートナー連携、コミュニティ連携など、その他にも数多くの連携機能をサポートしています。
完全な一覧については、ドキュメントの「[Integrations](/integrations)」セクションを参照してください。