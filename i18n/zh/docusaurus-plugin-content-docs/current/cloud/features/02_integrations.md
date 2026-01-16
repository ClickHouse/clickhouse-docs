---
sidebar_label: '集成'
slug: /manage/integrations
title: '集成'
description: 'ClickHouse 集成'
doc_type: 'landing-page'
keywords: ['集成', '云功能', '第三方工具', '数据源', '连接器']
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

ClickHouse Cloud 让你连接你常用的各类工具和服务。


## 面向 ClickHouse Cloud 的托管集成管道 \{#clickpipes\}

ClickPipes 是一个托管集成平台，可使从多种不同来源摄取数据变得像点击几下按钮一样简单。
ClickPipes 为最苛刻的工作负载而设计，其健壮且可扩展的架构确保了稳定的性能和可靠性。
ClickPipes 既可以用于长期的流式数据摄取需求，也可以用于一次性的数据加载作业。

| Name                                               | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | 配置 ClickPipes，并开始将来自 Apache Kafka 的流式数据摄取到 ClickHouse Cloud 中。                    |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 |Streaming| Stable           | 通过我们的直接集成，释放 Confluent 与 ClickHouse Cloud 的强大联合能力。                               |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     |Streaming| Stable           | 配置 ClickPipes，并开始将来自 Redpanda 的流式数据摄取到 ClickHouse Cloud 中。                        |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | 配置 ClickPipes，并开始将来自 AWS MSK 的流式数据摄取到 ClickHouse Cloud 中。                         |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           |Streaming| Stable           | 配置 ClickPipes，并开始将来自 Azure Event Hubs 的流式数据摄取到 ClickHouse Cloud 中。                |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     |Streaming| Stable           | 配置 ClickPipes，并开始将来自 WarpStream 的流式数据摄取到 ClickHouse Cloud 中。                      |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | 配置 ClickPipes，以从对象存储中摄取海量数据。                                                         |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | 配置 ClickPipes，以从对象存储中摄取海量数据。                                                         |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | Object Storage | Stable | 配置 ClickPipes，以从对象存储中摄取海量数据。
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | Object Storage | Private Beta | 配置 ClickPipes，以从对象存储中摄取海量数据。
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | 配置 ClickPipes，并开始将来自 Amazon Kinesis 的流式数据摄取到 ClickHouse Cloud 中。                  |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | 配置 ClickPipes，并开始将来自 Postgres 的数据摄取到 ClickHouse Cloud 中。                            |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | 配置 ClickPipes，并开始将来自 MySQL 的数据摄取到 ClickHouse Cloud 中。                               |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           |DBMS| Private Preview | 配置 ClickPipes，并开始将来自 MongoDB 的数据摄取到 ClickHouse Cloud 中。                            |



## 语言客户端集成 \{#language-client-integrations\}

ClickHouse 提供了多种语言客户端集成，下面列出了每种集成对应的文档链接。

| 页面                                                                    | 描述                                                                      |
|-------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [C++](/interfaces/cpp)                                          | C++ 客户端库和 userver 异步框架                                           |
| [C#](/integrations/csharp)                                  | 了解如何将您的 C# 项目连接到 ClickHouse。                                 |
| [Go](/integrations/go)                                          | 了解如何将您的 Go 项目连接到 ClickHouse。                                 |
| [JavaScript](/integrations/javascript)                          | 了解如何使用官方 JS 客户端将您的 JS 项目连接到 ClickHouse。              |
| [Java](/integrations/java)                                      | 进一步了解 Java 与 ClickHouse 的多种集成方式。                            |
| [Python](/integrations/python)                                  | 了解如何将您的 Python 项目连接到 ClickHouse。                             |
| [Rust](/integrations/rust)                                      | 了解如何将您的 Rust 项目连接到 ClickHouse。                               |
| [Third-party clients](/interfaces/third-party/client-libraries) | 进一步了解由第三方开发者提供的客户端库。                                  |
| [ClickPipes](/integrations/clickpipes)                          | 了解如何使用 ClickPipes 与 ClickHouse 集成。                              |

除了 ClickPipes 和语言客户端之外，ClickHouse 还支持大量其他集成，涵盖核心集成、合作伙伴集成以及社区集成。
完整列表请参见文档中的「Integrations」部分。