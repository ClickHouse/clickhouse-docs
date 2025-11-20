---
sidebar_label: '集成'
slug: /manage/integrations
title: '集成'
description: 'ClickHouse 集成'
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

ClickHouse Cloud 让你轻松连接常用的工具和服务。


## ClickHouse Cloud 的托管集成管道 {#clickpipes}

ClickPipes 是一个托管集成平台,只需点击几下即可从各种数据源中摄取数据。
ClickPipes 专为最苛刻的工作负载而设计,其强大且可扩展的架构确保了一致的性能和可靠性。
ClickPipes 可用于长期流式传输需求或一次性数据加载作业。

| 名称                                               | 徽标                                                                                             | 类型           | 状态          | 描述                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | 流式传输      | 稳定          | 配置 ClickPipes 并开始将 Apache Kafka 的流式数据摄取到 ClickHouse Cloud。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | 流式传输      | 稳定          | 通过我们的直接集成,释放 Confluent 和 ClickHouse Cloud 的组合能力。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | 流式传输      | 稳定          | 配置 ClickPipes 并开始将 Redpanda 的流式数据摄取到 ClickHouse Cloud。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | 流式传输      | 稳定          | 配置 ClickPipes 并开始将 AWS MSK 的流式数据摄取到 ClickHouse Cloud。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | 流式传输      | 稳定          | 配置 ClickPipes 并开始将 Azure Event Hubs 的流式数据摄取到 ClickHouse Cloud。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | 流式传输      | 稳定          | 配置 ClickPipes 并开始将 WarpStream 的流式数据摄取到 ClickHouse Cloud。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储中摄取大量数据。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储中摄取大量数据。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储中摄取大量数据。                            |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | 对象存储 | 私有测试版    | 配置 ClickPipes 以从对象存储中摄取大量数据。                            |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <AmazonKinesis class="image" alt="Amazon Kinesis logo" style={{width: '3rem', height: 'auto'}}/> | 流式传输      | 稳定          | 配置 ClickPipes 并开始将 Amazon Kinesis 的流式数据摄取到 ClickHouse Cloud。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | 数据库管理系统           | 稳定          | 配置 ClickPipes 并开始将 Postgres 的数据摄取到 ClickHouse Cloud。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               | 数据库管理系统           | 私有测试版    | 配置 ClickPipes 并开始将 MySQL 的数据摄取到 ClickHouse Cloud。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: 'auto'}}/>           | 数据库管理系统           | 私有预览版 | 配置 ClickPipes 并开始将 MongoDB 的数据摄取到 ClickHouse Cloud。                    |


## 语言客户端集成 {#language-client-integrations}

ClickHouse 提供了多种语言客户端集成,各集成的文档链接如下。

| 页面                                                            | 说明                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [C++](/interfaces/cpp)                                          | C++ 客户端库和 userver 异步框架                            |
| [C#](/integrations/csharp)                                      | 了解如何将 C# 项目连接到 ClickHouse。                             |
| [Go](/integrations/go)                                          | 了解如何将 Go 项目连接到 ClickHouse。                             |
| [JavaScript](/integrations/javascript)                          | 了解如何使用官方 JS 客户端将 JS 项目连接到 ClickHouse。 |
| [Java](/integrations/java)                                      | 了解 Java 与 ClickHouse 的多种集成方式。                   |
| [Python](/integrations/python)                                  | 了解如何将 Python 项目连接到 ClickHouse。                         |
| [Rust](/integrations/rust)                                      | 了解如何将 Rust 项目连接到 ClickHouse。                           |
| [第三方客户端](/interfaces/third-party/client-libraries) | 了解第三方开发者提供的客户端库。                   |

除了 ClickPipes 和语言客户端,ClickHouse 还支持众多其他集成,涵盖核心集成、
合作伙伴集成和社区集成。
完整列表请参阅文档的["集成"](/integrations)部分。
