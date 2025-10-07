---
'sidebar_label': '集成'
'slug': '/manage/integrations'
'title': '集成'
'description': 'ClickHouse 的集成'
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

ClickHouse Cloud 使您能够连接您喜爱的工具和服务。

## ClickHouse Cloud 的托管集成管道 {#clickpipes}

ClickPipes 是一个托管集成平台，使从多种来源摄取数据变得像点击几下按钮一样简单。
ClickPipes 的强大和可扩展架构专为最苛刻的工作负载而设计，确保了性能和可靠性的一致性。
ClickPipes 可用于长期流式传输需求或一次性数据加载作业。

| 名称                                               | 徽标                                                                                             | 类型       | 状态           | 描述                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|------------|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | 流式       | 稳定           | 配置 ClickPipes 并开始从 Apache Kafka 向 ClickHouse Cloud 摄取流式数据。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | 流式       | 稳定           | 通过我们的直接集成，释放 Confluent 和 ClickHouse Cloud 的结合力量。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | 流式       | 稳定           | 配置 ClickPipes 并开始从 Redpanda 向 ClickHouse Cloud 摄取流式数据。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | 流式       | 稳定           | 配置 ClickPipes 并开始从 AWS MSK 向 ClickHouse Cloud 摄取流式数据。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | 流式       | 稳定           | 配置 ClickPipes 并开始从 Azure Event Hubs 向 ClickHouse Cloud 摄取流式数据。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | 流式       | 稳定           | 配置 ClickPipes 并开始从 WarpStream 向 ClickHouse Cloud 摄取流式数据。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | 对象存储   | 稳定           | 配置 ClickPipes 从对象存储中摄取大量数据。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | 对象存储   | 稳定           | 配置 ClickPipes 从对象存储中摄取大量数据。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | 对象存储   | 稳定 | 配置 ClickPipes 从对象存储中摄取大量数据。
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | 对象存储   | 私有测试 | 配置 ClickPipes 从对象存储中摄取大量数据。
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> | 流式       | 稳定           | 配置 ClickPipes 并开始从 Amazon Kinesis 向 ClickHouse Cloud 摄取流式数据。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | DBMS      | 稳定      | 配置 ClickPipes 并开始从 Postgres 向 ClickHouse Cloud 摄取数据。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               | DBMS      | 私有测试 | 配置 ClickPipes 并开始从 MySQL 向 ClickHouse Cloud 摄取数据。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           | DBMS      | 私有预览 | 配置 ClickPipes 并开始从 MongoDB 向 ClickHouse Cloud 摄取数据。                   |

## 语言客户端集成 {#language-client-integrations}

ClickHouse 提供多种语言客户端集成，每个集成的文档链接如下。

| 页面                                                                    | 描述                                                                      |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ 客户端库和用户服务器异步框架                            |
| [C#](/integrations/csharp)                                  | 学习如何将您的 C# 项目连接到 ClickHouse。                         |
| [Go](/integrations/go)                                          | 学习如何将您的 Go 项目连接到 ClickHouse。                             |
| [JavaScript](/integrations/javascript)                          | 学习如何使用官方 JS 客户端将您的 JS 项目连接到 ClickHouse。 |
| [Java](/integrations/java)                                      | 了解多个 Java 和 ClickHouse 的集成。                   |
| [Python](/integrations/python)                                  | 学习如何将您的 Python 项目连接到 ClickHouse。                         |
| [Rust](/integrations/rust)                                      | 学习如何将您的 Rust 项目连接到 ClickHouse。                           |
| [第三方客户端](/interfaces/third-party/client-libraries) | 了解来自第三方开发者的客户端库。                   |

除了 ClickPipes 和语言客户端外，ClickHouse 还支持其他众多集成，涵盖核心集成、合作伙伴集成和社区集成。
完整的列表请参见文档的 ["集成"](/integrations) 部分。
