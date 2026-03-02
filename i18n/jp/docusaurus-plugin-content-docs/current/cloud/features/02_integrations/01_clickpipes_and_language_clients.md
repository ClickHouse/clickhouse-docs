---
sidebar_label: 'ClickPipes と言語クライアント'
slug: /manage/integrations
title: 'ClickPipes と言語クライアント'
description: 'ClickHouse Cloud 向けの ClickPipes および言語クライアントとの連携'
doc_type: 'landing-page'
keywords: ['連携', 'Cloud 機能', 'clickpipes', '言語クライアント', 'コネクタ']
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

ClickHouse Cloud を使えば、お気に入りのツールやサービスを接続できます。


## ClickHouse Cloud 向けマネージド統合パイプライン \{#clickpipes\}

ClickPipes は、多様なソースからのデータを、数回のクリックだけで簡単に取り込めるマネージド統合プラットフォームです。
最も要求の厳しいワークロード向けに設計されており、ClickPipes の堅牢でスケーラブルなアーキテクチャにより、一貫したパフォーマンスと高い信頼性が確保されます。
ClickPipes は、長期的なストリーミング要件にも、単発のデータロードジョブにも利用できます。

| Name                                               | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka のロゴ" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | ClickPipes を構成し、Apache Kafka から ClickHouse Cloud へストリーミングデータの取り込みを開始します。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud のロゴ" style={{width: '3rem'}}/>                 |Streaming| Stable           | 直接連携により、Confluent と ClickHouse Cloud を組み合わせた活用が可能になります。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda のロゴ"/>                                     |Streaming| Stable           | ClickPipes を構成し、Redpanda から ClickHouse Cloud へストリーミングデータの取り込みを開始します。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK のロゴ" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | ClickPipes を構成し、AWS MSK から ClickHouse Cloud へストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs のロゴ" style={{width: '3rem'}}/>           |Streaming| Stable           | ClickPipes を構成し、Azure Event Hubs から ClickHouse Cloud へストリーミングデータの取り込みを開始します。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream のロゴ" style={{width: '3rem'}}/>                     |Streaming| Stable           | ClickPipes を構成し、WarpStream から ClickHouse Cloud へストリーミングデータの取り込みを開始します。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 のロゴ" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込みます。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage のロゴ" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込みます。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean のロゴ" style={{width: '3rem', height: 'auto'}}/>          | Object Storage | Stable | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込みます。
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage のロゴ" style={{width: '3rem', height: 'auto'}}/>    | Object Storage | Private Beta | ClickPipes を構成し、オブジェクトストレージから大量のデータを取り込みます。
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis のロゴ" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | ClickPipes を構成し、Amazon Kinesis から ClickHouse Cloud へストリーミングデータの取り込みを開始します。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres のロゴ" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | ClickPipes を構成し、Postgres から ClickHouse Cloud へデータの取り込みを開始します。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL のロゴ" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | ClickPipes を構成し、MySQL から ClickHouse Cloud へデータの取り込みを開始します。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB のロゴ" style={{width: '3rem', height: 'auto'}}/>           |DBMS| Private Preview | ClickPipes を構成し、MongoDB から ClickHouse Cloud へデータの取り込みを開始します。                   |

## 言語クライアント統合 \{#language-client-integrations\}

ClickHouse には多数の言語クライアント統合があり、それぞれに対応するドキュメントへのリンクを以下に示します。

| ページ                                                                    | 説明                                                                                |
|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ クライアントライブラリおよび userver 非同期フレームワーク                      |
| [C#](/integrations/csharp)                                  | C# プロジェクトを ClickHouse に接続する方法を説明します。                          |
| [Go](/integrations/go)                                          | Go プロジェクトを ClickHouse に接続する方法を説明します。                          |
| [JavaScript](/integrations/javascript)                          | 公式 JS クライアントを使って JS プロジェクトを ClickHouse に接続する方法を説明します。 |
| [Java](/integrations/java)                                      | Java と ClickHouse 向けの複数の統合について詳しく説明します。                      |
| [Python](/integrations/python)                                  | Python プロジェクトを ClickHouse に接続する方法を説明します。                      |
| [Rust](/integrations/rust)                                      | Rust プロジェクトを ClickHouse に接続する方法を説明します。                        |
| [サードパーティクライアント](/interfaces/third-party/client-libraries) | サードパーティ開発者によるクライアントライブラリについて詳しく説明します。        |

ClickPipes や言語クライアントに加えて、ClickHouse では、コア統合、パートナー統合、コミュニティ統合など、多数の統合機能をサポートしています。
完全な一覧については、ドキュメントの ["Integrations"](/integrations) セクションを参照してください。