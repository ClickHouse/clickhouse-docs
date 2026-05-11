---
sidebar_label: 'ClickPipes 与语言客户端'
slug: /manage/integrations
title: 'ClickPipes 与语言客户端'
description: 'ClickHouse Cloud 的 ClickPipes 与语言客户端集成'
doc_type: 'landing-page'
keywords: ['集成', 'Cloud 功能', 'ClickPipes', '语言客户端', '连接器']
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

ClickHouse Cloud 使您能够连接并集成您常用的工具和服务。


## ClickHouse Cloud 的托管集成管道 \{#clickpipes\}

ClickPipes 是一个托管的集成平台，使得从多种来源摄取数据就像点击几下按钮一样简单。
为了满足最苛刻的工作负载而设计，ClickPipes 其稳健且可扩展的架构确保了一致的性能和可靠性。
ClickPipes 既可用于长期的流式传输需求，也可用于一次性的数据加载任务。

| 名称                                               | Logo                                                                                             |类型| 状态             | 描述                                                                                                  |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka 标志" style={{width: '3rem', 'height': '3rem'}}/>      |流式传输| Stable           | 配置 ClickPipes 并开始将来自 Apache Kafka 的流式数据摄取到 ClickHouse Cloud。                        |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud 标志" style={{width: '3rem'}}/>                 |流式传输| Stable           | 通过我们的直接集成，发挥 Confluent 与 ClickHouse Cloud 组合的强大能力。                               |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda 标志"/>                                     |流式传输| Stable           | 配置 ClickPipes 并开始将来自 Redpanda 的流式数据摄取到 ClickHouse Cloud。                            |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK 标志" style={{width: '3rem', 'height': '3rem'}}/>             |流式传输| Stable           | 配置 ClickPipes 并开始将来自 AWS MSK 的流式数据摄取到 ClickHouse Cloud。                             |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs 标志" style={{width: '3rem'}}/>           |流式传输| Stable           | 配置 ClickPipes 并开始将来自 Azure Event Hubs 的流式数据摄取到 ClickHouse Cloud。                    |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream 标志" style={{width: '3rem'}}/>                     |流式传输| Stable           | 配置 ClickPipes 并开始将来自 WarpStream 的流式数据摄取到 ClickHouse Cloud。                          |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 标志" style={{width: '3rem', height: 'auto'}}/>              |对象存储| Stable           | 配置 ClickPipes 以从对象存储中摄取海量数据。                                                          |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage 标志" style={{width: '3rem', height: 'auto'}}/>  |对象存储| Stable           | 配置 ClickPipes 以从对象存储中摄取海量数据。                                                          |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean 标志" style={{width: '3rem', height: 'auto'}}/>          | 对象存储 | Stable | 配置 ClickPipes 以从对象存储中摄取海量数据。 |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage 标志" style={{width: '3rem', height: 'auto'}}/>    | 对象存储 | Private Beta | 配置 ClickPipes 以从对象存储中摄取海量数据。 |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis 标志" style={{width: '3rem', height: 'auto'}}/> |流式传输| Stable           | 配置 ClickPipes 并开始将来自 Amazon Kinesis 的流式数据摄取到 ClickHouse Cloud。                      |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres 标志" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | 配置 ClickPipes 并开始将来自 Postgres 的数据摄取到 ClickHouse Cloud。                                |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL 标志" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | 配置 ClickPipes 并开始将来自 MySQL 的数据摄取到 ClickHouse Cloud。                                   |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB 标志" style={{width: '3rem', height: 'auto'}}/>           |DBMS| Private Preview | 配置 ClickPipes 并开始将来自 MongoDB 的数据摄取到 ClickHouse Cloud。                               |

## 语言客户端集成 \{#language-client-integrations\}

ClickHouse 提供了多种语言客户端集成，其相应文档链接如下所示。

| Page                                                                    | Description                                                                      |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ 客户端库和 userver 异步框架                            |
| [C#](/integrations/csharp)                                  | 了解如何将 C# 项目连接到 ClickHouse。                         |
| [Go](/integrations/go)                                          | 了解如何将 Go 项目连接到 ClickHouse。                             |
| [JavaScript](/integrations/javascript)                          | 了解如何使用官方 JS 客户端将 JS 项目连接到 ClickHouse。 |
| [Java](/integrations/java)                                      | 进一步了解适用于 Java 和 ClickHouse 的多种集成方式。                   |
| [Python](/integrations/python)                                  | 了解如何将 Python 项目连接到 ClickHouse。                         |
| [Rust](/integrations/rust)                                      | 了解如何将 Rust 项目连接到 ClickHouse。                           |
| [Third-party clients](/interfaces/third-party/client-libraries) | 了解更多由第三方开发者提供的客户端库。                   |

除了 ClickPipes 和语言客户端以外，ClickHouse 还支持众多其他集成，涵盖核心集成、合作伙伴集成和社区集成。
完整列表请参阅文档中的 ["Integrations"](/integrations) 部分。