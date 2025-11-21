---
sidebar_label: '简介'
description: '将外部数据源无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes
title: '与 ClickHouse Cloud 集成'
doc_type: 'guide'
keywords: ['ClickPipes', '数据摄取平台', '流式数据', '集成平台', 'ClickHouse Cloud']
---

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
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';


# 与 ClickHouse Cloud 集成



## 简介 {#introduction}

[ClickPipes](/integrations/clickpipes) 是一个托管式集成平台,可通过简单的点击操作从多种数据源中摄取数据。 ClickPipes 专为最严苛的工作负载而设计,其强大且可扩展的架构确保了稳定的性能和可靠性。 ClickPipes 既可用于长期流式传输需求,也可用于一次性数据加载作业。

<Image img={clickpipes_stack} alt='ClickPipes 技术栈' size='lg' border />


## 支持的数据源 {#supported-data-sources}

| 名称                                               | 徽标                                                                                             | 类型           | 状态          | 描述                                                                                                                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | 流式      | 稳定          | 配置 ClickPipes 并开始将 Apache Kafka 的流式数据摄取到 ClickHouse Cloud。                                                                                                       |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | 流式      | 稳定          | 通过我们的直接集成,充分发挥 Confluent 和 ClickHouse Cloud 的组合优势。                                                                                                            |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | 流式      | 稳定          | 配置 ClickPipes 并开始将 Redpanda 的流式数据摄取到 ClickHouse Cloud。                                                                                                           |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | 流式      | 稳定          | 配置 ClickPipes 并开始将 AWS MSK 的流式数据摄取到 ClickHouse Cloud。                                                                                                            |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | 流式      | 稳定          | 配置 ClickPipes 并开始将 Azure Event Hubs 的流式数据摄取到 ClickHouse Cloud。相关指导请参阅 [Azure Event Hubs 常见问题](/integrations/clickpipes/kafka/faq/#azure-eventhubs)。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | 流式      | 稳定          | 配置 ClickPipes 并开始将 WarpStream 的流式数据摄取到 ClickHouse Cloud。                                                                                                         |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储摄取大量数据。                                                                                                                              |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储摄取大量数据。                                                                                                                              |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>          | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储摄取大量数据。                                                                                                                              |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>    | 对象存储 | 稳定          | 配置 ClickPipes 以从对象存储摄取大量数据。                                                                                                                              |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | 流式      | 稳定          | 配置 ClickPipes 并开始将 Amazon Kinesis 的流式数据摄取到 ClickHouse Cloud。                                                                                                     |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | 数据库管理系统           | 稳定          | 配置 ClickPipes 并开始将 Postgres 的数据摄取到 ClickHouse Cloud。                                                                                                                     |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: '3rem'}}/>               | 数据库管理系统           | 公开测试版     | 配置 ClickPipes 并开始将 MySQL 的数据摄取到 ClickHouse Cloud。                                                                                                                        |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: '3rem'}}/>           | 数据库管理系统           | 私有预览 | 配置 ClickPipes 并开始将 MongoDB 的数据摄取到 ClickHouse Cloud。                                                                                                                      |

更多连接器将陆续添加到 ClickPipes,您可以通过[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)了解更多信息。


## 静态 IP 列表 {#list-of-static-ips}

以下是 ClickPipes 用于连接外部服务的静态 NAT IP(按区域划分)。请将您实例所在区域的 IP 添加到 IP 白名单中以允许流量通过。

对于所有服务,ClickPipes 流量将根据服务所在位置从相应的默认区域发起:

- **eu-central-1**: 适用于欧盟区域的所有服务。(包括 GCP 和 Azure 欧盟区域)
- **us-east-1**: 适用于 AWS `us-east-1` 中的所有服务。
- **ap-south-1**: 适用于 2025 年 6 月 25 日或之后在 AWS `ap-south-1` 中创建的服务(此日期之前创建的服务使用 `us-east-2` IP)。
- **ap-northeast-2**: 适用于 2025 年 11 月 14 日或之后在 AWS `ap-northeast-2` 中创建的服务(此日期之前创建的服务使用 `us-east-2` IP)。
- **ap-southeast-2**: 适用于 2025 年 6 月 25 日或之后在 AWS `ap-southeast-2` 中创建的服务(此日期之前创建的服务使用 `us-east-2` IP)。
- **us-west-2**: 适用于 2025 年 6 月 24 日或之后在 AWS `us-west-2` 中创建的服务(此日期之前创建的服务使用 `us-east-2` IP)。
- **us-east-2**: 适用于所有未明确列出的其他区域。(包括 GCP 和 Azure 美国区域)

| AWS 区域                              | IP 地址                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                              |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                            |
| **ap-south-1** (自 2025 年 6 月 25 日起)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                          |
| **ap-northeast-2** (自 2025 年 11 月 14 日起) | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104`                                                   |
|  |
| **ap-southeast-2** (自 2025 年 6 月 25 日起) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                            |
| **us-west-2** (自 2025 年 6 月 24 日起)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                            |


## 调整 ClickHouse 设置 {#adjusting-clickhouse-settings}

ClickHouse Cloud 为大多数使用场景提供了合理的默认设置。但是,如果您需要为 ClickPipes 目标表调整某些 ClickHouse 设置,为 ClickPipes 创建专用角色是最灵活的解决方案。
步骤:

1. 创建自定义角色 `CREATE ROLE my_clickpipes_role SETTINGS ...`。详细信息请参阅 [CREATE ROLE](/sql-reference/statements/create/role.md) 语法。
2. 在创建 ClickPipes 期间的 `Details and Settings` 步骤中,将自定义角色添加到 ClickPipes 用户。

<Image img={cp_custom_role} alt='分配自定义角色' size='lg' border />


## 调整 ClickPipes 高级设置 {#clickpipes-advanced-settings}

ClickPipes 提供了合理的默认值,可满足大多数使用场景的需求。如果您的使用场景需要进一步调优,可以调整以下设置:

### 对象存储 ClickPipes {#clickpipes-advanced-settings-object-storage}

| 设置                              | 默认值 | 描述                                                                                                                                 |
| ------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Max insert bytes`                   | 10GB          | 单次插入批次中处理的字节数。                                                                                        |
| `Max file count`                     | 100           | 单次插入批次中处理的最大文件数。                                                                                |
| `Max threads`                        | auto(3)       | 文件处理的[最大并发线程数](/operations/settings/settings#max_threads)。                                      |
| `Max insert threads`                 | 1             | 文件处理的[最大并发插入线程数](/operations/settings/settings#max_insert_threads)。                        |
| `Min insert block size bytes`        | 1GB           | 可插入表中的[数据块最小字节大小](/operations/settings/settings#min_insert_block_size_bytes)。         |
| `Max download threads`               | 4             | [最大并发下载线程数](/operations/settings/settings#max_download_threads)。                                        |
| `Object storage polling interval`    | 30s           | 配置将数据插入 ClickHouse 集群前的最大等待时间。                                                       |
| `Parallel distributed insert select` | 2             | [并行分布式插入选择设置](/operations/settings/settings#parallel_distributed_insert_select)。                             |
| `Parallel view processing`           | false         | 是否启用[并发推送到附加视图而非顺序推送](/operations/settings/settings#parallel_view_processing)。 |
| `Use cluster function`               | true          | 是否跨多个节点并行处理文件。                                                                                 |

<Image
  img={cp_advanced_settings}
  alt='ClickPipes 高级设置'
  size='lg'
  border
/>

### 流式 ClickPipes {#clickpipes-advanced-settings-streaming}

| Setting                          | Default value | Description                                                                           |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `Streaming max insert wait time` | 5s            | 配置将数据插入 ClickHouse 集群前的最大等待时间。 |


## 错误报告 {#error-reporting}

ClickPipes 会根据数据摄取过程中遇到的错误类型,将错误存储在两个独立的表中。

### 记录错误 {#record-errors}

ClickPipes 会在您的目标表旁创建一个带有后缀 `<destination_table_name>_clickpipes_error` 的表。该表将包含由格式错误的数据或模式不匹配导致的所有错误,并包含完整的无效消息内容。该表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

### 系统错误 {#system-errors}

与 ClickPipe 运行相关的错误将存储在 `system.clickpipes_log` 表中。该表将存储与您的 ClickPipe 运行相关的所有其他错误(网络、连接等)。该表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

如果 ClickPipes 在 15 分钟后无法连接到数据源,或在 1 小时后无法连接到目标,则 ClickPipes 实例将停止运行并在系统错误表中存储相应的消息(前提是 ClickHouse 实例可用)。


## 常见问题 {#faq}

- **什么是 ClickPipes?**

  ClickPipes 是 ClickHouse Cloud 的一项功能,使用户能够轻松地将 ClickHouse 服务连接到外部数据源,特别是 Kafka。通过 ClickPipes for Kafka,用户可以轻松实现数据持续加载到 ClickHouse,使其可用于实时分析。

- **ClickPipes 是否支持数据转换?**

  是的,ClickPipes 通过暴露 DDL 创建来支持基本的数据转换。您还可以利用 ClickHouse 的[物化视图功能](/guides/developer/cascading-materialized-views),在数据加载到 ClickHouse Cloud 服务的目标表时对其应用更高级的转换。

- **使用 ClickPipes 是否会产生额外费用?**

  ClickPipes 按两个维度计费:数据摄取和计算。定价的完整详情可在[此页面](/cloud/reference/billing/clickpipes)查看。运行 ClickPipes 还可能在目标 ClickHouse Cloud 服务上产生间接的计算和存储成本,这与任何数据摄取工作负载类似。

- **使用 ClickPipes for Kafka 时是否有办法处理错误或故障?**

  是的,当从 Kafka 消费数据时遇到任何操作问题(包括网络问题、连接问题等)导致的故障时,ClickPipes for Kafka 会自动重试。如果遇到格式错误的数据或无效的模式,ClickPipes 会将记录存储在 record_error 表中并继续处理。
