---
sidebar_label: '介绍'
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


# 与 ClickHouse Cloud 集成 {#integrating-with-clickhouse-cloud}

## 介绍 {#introduction}

[ClickPipes](/integrations/clickpipes) 是一款托管集成平台，使得从各类数据源摄取数据就像点击几下按钮一样简单。ClickPipes 专为最苛刻的工作负载而设计，其健壮且可扩展的架构确保了稳定一致的性能和可靠性。ClickPipes 既可用于长期的流式数据摄取需求，也可用于一次性的数据加载任务。

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## 支持的数据源 {#supported-data-sources}

| 名称                                               | Logo                                                                                             |类型| 状态           | 描述                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|----------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka 徽标" style={{width: '3rem', 'height': '3rem'}}/>      |流式| 稳定版           | 配置 ClickPipes，并开始将来自 Apache Kafka 的流式数据摄取到 ClickHouse Cloud。                      |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud 徽标" style={{width: '3rem'}}/>                 |流式| 稳定版           | 通过我们的直接集成，充分利用 Confluent 与 ClickHouse Cloud 组合的强大能力。                         |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda 徽标"/>                                     |流式| 稳定版           | 配置 ClickPipes，并开始将来自 Redpanda 的流式数据摄取到 ClickHouse Cloud。                          |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK 徽标" style={{width: '3rem', 'height': '3rem'}}/>             |流式| 稳定版           | 配置 ClickPipes，并开始将来自 AWS MSK 的流式数据摄取到 ClickHouse Cloud。                           |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs 徽标" style={{width: '3rem'}}/>           |流式| 稳定版           | 配置 ClickPipes，并开始将来自 Azure Event Hubs 的流式数据摄取到 ClickHouse Cloud。有关指导，请参阅 [Azure Event Hubs 常见问题](/integrations/clickpipes/kafka/faq/#azure-eventhubs)。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream 徽标" style={{width: '3rem'}}/>                     |流式| 稳定版           | 配置 ClickPipes，并开始将来自 WarpStream 的流式数据摄取到 ClickHouse Cloud。                        |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 徽标" style={{width: '3rem', height: 'auto'}}/>              |对象存储| 稳定版           | 配置 ClickPipes，从对象存储中摄取海量数据。                                                        |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage 徽标" style={{width: '3rem', height: 'auto'}}/>  |对象存储| 稳定版           | 配置 ClickPipes，从对象存储中摄取海量数据。                                                        |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean 徽标" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定版 | 配置 ClickPipes，从对象存储中摄取海量数据。 |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage 徽标" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定版 | 配置 ClickPipes，从对象存储中摄取海量数据。 |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kinesis 徽标" style={{width: '3rem', height: 'auto'}}/> |流式| 稳定版           | 配置 ClickPipes，并开始将来自 Amazon Kinesis 的流式数据摄取到 ClickHouse Cloud。                    |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres 徽标" style={{width: '3rem', height: 'auto'}}/>         |DBMS| 稳定版      | 配置 ClickPipes，并开始将来自 Postgres 的数据摄取到 ClickHouse Cloud。                              |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL 徽标" style={{width: '3rem', height: '3rem'}}/>               |DBMS| 公共测试版 | 配置 ClickPipes，并开始将来自 MySQL 的数据摄取到 ClickHouse Cloud。                                 |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB 徽标" style={{width: '3rem', height: '3rem'}}/>           |DBMS| 私有预览版 | 配置 ClickPipes，并开始将来自 MongoDB 的数据摄取到 ClickHouse Cloud。                              |

后续还会为 ClickPipes 添加更多连接器，您可以通过[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)了解更多信息。

## 静态 IP 列表 {#list-of-static-ips}

下面是 ClickPipes 用于连接到您外部服务的静态 NAT IP（按区域划分）。请将与您实例所在区域对应的 IP 添加到 IP 允许列表中，以允许相关流量通过。对于对象存储类型的管道，您还应将 [ClickHouse 集群 IP](/manage/data-sources/cloud-endpoints-api) 添加到 IP 允许列表中。

对于所有服务，ClickPipes 的流量将根据服务所在位置，从默认区域发起：
- **eu-central-1**：适用于所有位于 EU 区域的服务。（包括 GCP 和 Azure 的 EU 区域）
- **us-east-1**：适用于 AWS `us-east-1` 中的所有服务。
- **ap-south-1**：适用于在 AWS `ap-south-1` 中于 2025 年 6 月 25 日或之后创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **ap-northeast-2**：适用于在 AWS `ap-northeast-2` 中于 2025 年 11 月 14 日或之后创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **ap-southeast-2**：适用于在 AWS `ap-southeast-2` 中于 2025 年 6 月 25 日或之后创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **us-west-2**：适用于在 AWS `us-west-2` 中于 2025 年 6 月 24 日或之后创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **us-east-2**：适用于所有未在上方明确列出的其他区域。（包括 GCP 和 Azure 的美国区域）

| AWS 区域                             | IP 地址                                                                                                                                          |
|---------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                       |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`      |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                     |
| **ap-south-1** (自 2025 年 6 月 25 日起)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                                   |
| **ap-northeast-2** (自 2025 年 11 月 14 日起) | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104` 
                    |
| **ap-southeast-2** (自 2025 年 6 月 25 日起) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                                     |
| **us-west-2** (自 2025 年 6 月 24 日起)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                                     |

## 调整 ClickHouse 设置 {#adjusting-clickhouse-settings}

ClickHouse Cloud 为大多数使用场景提供了合理的默认配置。不过，如果需要为 ClickPipes 的目标表调整某些 ClickHouse 设置，为 ClickPipes 创建一个专用角色是最灵活的解决方案。
步骤：

1. 创建一个自定义角色：`CREATE ROLE my_clickpipes_role SETTINGS ...`。详细语法参见 [CREATE ROLE](/sql-reference/statements/create/role.md)。
2. 在创建 ClickPipes 时，在 `Details and Settings` 步骤中将该自定义角色分配给 ClickPipes 用户。

<Image img={cp_custom_role} alt="分配自定义角色" size="lg" border/>

## 调整 ClickPipes 高级设置 {#clickpipes-advanced-settings}

ClickPipes 提供了合理的默认值，可以满足大多数用例的需求。如果您的用例需要进一步微调，可以调整以下设置：

### 对象存储 ClickPipes {#clickpipes-advanced-settings-object-storage}

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 单个插入批次中可处理的最大字节数。                                  |
| `Max file count`                   | 100           | 单个插入批次中可处理的最大文件数。                          |
| `Max threads`                      | auto(3)       | 用于文件处理的[最大并发线程数](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | 用于文件处理的[最大并发插入线程数](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | [可插入到表中的数据块的最小字节大小](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [最大并发下载线程数](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | 配置在向 ClickHouse 集群插入数据前的最长轮询等待时间。 |
| `Parallel distributed insert select` | 2           | [并行分布式 insert select 设置](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | 是否启用向附加视图[并发而非顺序](/operations/settings/settings#parallel_view_processing)推送。 |
| `Use cluster function`             | true          | 是否在多个节点上并行处理文件。 |

<Image img={cp_advanced_settings} alt="ClickPipes 高级设置" size="lg" border/>

### 流式 ClickPipes {#clickpipes-advanced-settings-streaming}

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Streaming max insert wait time`   | 5s            | 配置在向 ClickHouse 集群插入数据前的最长等待时间。 |

## 错误报告 {#error-reporting}

ClickPipes 会根据在摄取过程中遇到的错误类型，将错误存储在两个不同的表中。

### 记录错误 {#record-errors}

ClickPipes 会为目标表创建一个带有后缀 `<destination_table_name>_clickpipes_error` 的对应表。该表将包含由于数据格式错误或模式不匹配而产生的任何错误，并会保存完整的无效消息。此表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

### 系统错误 {#system-errors}

与 ClickPipe 运行相关的错误将存储在 `system.clickpipes_log` 表中。该表会存储与你的 ClickPipe 运行相关的所有其他错误（网络、连接等）。此表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

如果 ClickPipes 在 15 分钟后仍无法连接到数据源，或在 1 小时后仍无法连接到目标，则 ClickPipes 实例会停止运行，并在系统错误表中存储一条相应的消息（前提是 ClickHouse 实例可用）。

## 常见问题解答 {#faq}
- **什么是 ClickPipes？**

  ClickPipes 是 ClickHouse Cloud 的一项功能，能够简化用户将 ClickHouse 服务连接到外部数据源（尤其是 Kafka）的过程。借助 Kafka 的 ClickPipes，用户可以轻松地、持续不断地将数据加载到 ClickHouse 中，从而支持实时分析。

- **ClickPipes 是否支持数据转换？**

  是的，ClickPipes 通过提供 DDL 创建能力来支持基础数据转换。之后，您可以在数据加载到 ClickHouse Cloud 服务中的目标表时，利用 ClickHouse 的[物化视图功能](/guides/developer/cascading-materialized-views)对数据执行更高级的转换。

- **使用 ClickPipes 是否会产生额外成本？**

  ClickPipes 基于两个维度计费：摄取的数据量和计算资源。完整的定价详情请参见[此页面](/cloud/reference/billing/clickpipes)。运行 ClickPipes 还可能在目标 ClickHouse Cloud 服务上带来类似于其他摄取工作负载的间接计算和存储成本。

- **使用 Kafka 的 ClickPipes 时，有没有办法处理错误或故障？**

  有。Kafka 的 ClickPipes 在因任何运行故障（包括网络问题、连接问题等）导致从 Kafka 消费数据失败时会自动重试。如果遇到格式错误的数据或无效的 schema，ClickPipes 会将相应记录存储在 `record_error` 表中，并继续处理。