---
'sidebar_label': 'インテグレーション'
'slug': '/manage/integrations'
'title': 'インテグレーション'
'description': 'ClickHouseへのインテグレーション'
'doc_type': 'landing-page'
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

ClickHouse Cloud は、あなたが愛するツールやサービスを接続することを可能にします。

## ClickHouse Cloud 用の管理された統合パイプライン {#clickpipes}

ClickPipes は、さまざまなソースからデータをインジェストするための管理された統合プラットフォームであり、数回のボタンクリックで操作を可能にします。
最も要求の厳しいワークロード向けに設計された ClickPipes の堅牢でスケーラブルなアーキテクチャは、一貫したパフォーマンスと信頼性を確保します。
ClickPipes は、長期的なストリーミングのニーズや一時的なデータロードジョブに使用できます。

| 名前                                                 | ロゴ                                                                                             |タイプ| ステータス           | 説明                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      |ストリーミング| 安定           | ClickPipes を設定し、Apache Kafka から ClickHouse Cloud へのストリーミングデータのインジェストを開始します。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 |ストリーミング| 安定           | Confluent と ClickHouse Cloud の結合された力を直接統合を通じて解放します。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     |ストリーミング| 安定           | ClickPipes を設定し、Redpanda から ClickHouse Cloud へのストリーミングデータのインジェストを開始します。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             |ストリーミング| 安定           | ClickPipes を設定し、AWS MSK から ClickHouse Cloud へのストリーミングデータのインジェストを開始します。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           |ストリーミング| 安定           | ClickPipes を設定し、Azure Event Hubs から ClickHouse Cloud へのストリーミングデータのインジェストを開始します。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     |ストリーミング| 安定           | ClickPipes を設定し、WarpStream から ClickHouse Cloud へのストリーミングデータのインジェストを開始します。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              |オブジェクトストレージ| 安定           | ClickPipes を設定して、オブジェクトストレージから大量のデータをインジェストします。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  |オブジェクトストレージ| 安定           | ClickPipes を設定して、オブジェクトストレージから大量のデータをインジェストします。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | オブジェクトストレージ | 安定 | ClickPipes を設定して、オブジェクトストレージから大量のデータをインジェストします。  |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | オブジェクトストレージ | プライベートベータ | ClickPipes を設定して、オブジェクトストレージから大量のデータをインジェストします。  |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> |ストリーミング| 安定           | ClickPipes を設定し、Amazon Kinesis から ClickHouse Cloud へのストリーミングデータのインジェストを開始します。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         |DBMS| 安定      | ClickPipes を設定し、Postgres から ClickHouse Cloud へのデータのインジェストを開始します。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               |DBMS| プライベートベータ | ClickPipes を設定し、MySQL から ClickHouse Cloud へのデータのインジェストを開始します。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           |DBMS| プライベートプレビュー | ClickPipes を設定し、MongoDB から ClickHouse Cloud へのデータのインジェストを開始します。                   |

## 言語クライアントの統合 {#language-client-integrations}

ClickHouse は、いくつかの言語クライアント統合を提供しており、それぞれのドキュメントは以下にリンクされています。

| ページ                                                                    | 説明                                                                      |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ クライアントライブラリとユーザーダープ非同期フレームワーク                     |
| [C#](/integrations/csharp)                                  | C# プロジェクトを ClickHouse に接続する方法を学びます。                         |
| [Go](/integrations/go)                                          | Go プロジェクトを ClickHouse に接続する方法を学びます。                             |
| [JavaScript](/integrations/javascript)                          | 公式の JS クライアントを使用して、JS プロジェクトを ClickHouse に接続する方法を学びます。 |
| [Java](/integrations/java)                                      | Java と ClickHouse に対するいくつかの統合についてもっと知ります。                   |
| [Python](/integrations/python)                                  | Python プロジェクトを ClickHouse に接続する方法を学びます。                         |
| [Rust](/integrations/rust)                                      | Rust プロジェクトを ClickHouse に接続する方法を学びます。                           |
| [サードパーティクライアント](/interfaces/third-party/client-libraries) | サードパーティ開発者のクライアントライブラリについてもっと知ります。                   |

ClickPipes や言語クライアントに加えて、ClickHouse はコア統合、パートナー統合、コミュニティ統合を含む多くの統合をサポートしています。
完全なリストについては、ドキュメントの ["Integrations"](/integrations) セクションを参照してください。
