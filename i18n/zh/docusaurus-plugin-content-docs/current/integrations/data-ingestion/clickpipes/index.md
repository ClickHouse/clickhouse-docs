---
'sidebar_label': '介绍'
'description': '无缝连接您的外部数据源到 ClickHouse Cloud。'
'slug': '/integrations/clickpipes'
'title': '与 ClickHouse Cloud 集成'
'doc_type': 'guide'
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

## 介绍 {#introduction}

[ClickPipes](/integrations/clickpipes) 是一个托管集成平台，使从多种来源摄取数据变得简单，仅需点击几个按钮。ClickPipes 设计用于满足最苛刻的工作负载，其强大且可扩展的架构确保持续的性能和可靠性。ClickPipes 可用于长期流式传输需求或一次性数据加载作业。

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## 支持的数据源 {#supported-data-sources}

| 名称                                               | 标志                                                                                             | 类型      | 状态           | 描述                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----------|------------------|--------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      | 流式    | 稳定           | 配置 ClickPipes 并开始将流式数据从 Apache Kafka 导入 ClickHouse Cloud。     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 | 流式    | 稳定           | 通过我们的直接集成释放 Confluent 和 ClickHouse Cloud 的组合力量。          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     | 流式    | 稳定           | 配置 ClickPipes 并开始将流式数据从 Redpanda 导入 ClickHouse Cloud。         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             | 流式    | 稳定           | 配置 ClickPipes 并开始将流式数据从 AWS MSK 导入 ClickHouse Cloud。          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           | 流式    | 稳定           | 配置 ClickPipes 并开始将流式数据从 Azure Event Hubs 导入 ClickHouse Cloud。有关指导，请参见 [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs)。 |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     | 流式    | 稳定           | 配置 ClickPipes 并开始将流式数据从 WarpStream 导入 ClickHouse Cloud。       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              | 对象存储 | 稳定           | 配置 ClickPipes 从对象存储中摄取大量数据。                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  | 对象存储 | 稳定           | 配置 ClickPipes 从对象存储中摄取大量数据。                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定           | 配置 ClickPipes 从对象存储中摄取大量数据。                            |
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定           | 配置 ClickPipes 从对象存储中摄取大量数据。                            |
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | 流式    | 稳定           | 配置 ClickPipes 并开始将流式数据从 Amazon Kinesis 导入 ClickHouse Cloud。   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         | DBMS      | 稳定      | 配置 ClickPipes 并开始将数据从 Postgres 导入 ClickHouse Cloud。                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: '3rem'}}/>               | DBMS      | 公共测试版 | 配置 ClickPipes 并开始将数据从 MySQL 导入 ClickHouse Cloud。                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: '3rem'}}/>           | DBMS      | 私人预览 | 配置 ClickPipes 并开始将数据从 MongoDB 导入 ClickHouse Cloud。                   |

更多连接器将会添加到 ClickPipes，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 静态 IP 列表 {#list-of-static-ips}

以下是 ClickPipes 用于连接到外部服务的静态 NAT IP（按区域划分）。将相关实例区域的 IP 添加到您的 IP 允许列表中以允许流量。

对于所有服务，ClickPipes 的流量将源自基于服务位置的默认区域：
- **eu-central-1**：适用于所有 EU 区域的服务（包括 GCP 和 Azure EU 区域）。
- **us-east-1**：适用于 AWS `us-east-1` 中的所有服务。
- **ap-south-1**：适用于 AWS `ap-south-1` 自 2025 年 6 月 25 日创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **ap-southeast-2**：适用于 AWS `ap-southeast-2` 自 2025 年 6 月 25 日创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **us-west-2**：适用于 AWS `us-west-2` 自 2025 年 6 月 24 日创建的服务（在此日期之前创建的服务使用 `us-east-2` 的 IP）。
- **us-east-2**：适用于未明确列出的所有其他区域（包括 GCP 和 Azure US 区域）。

| AWS 区域                            | IP 地址                                                                                                                                     |
|---------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **eu-central-1**                      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                     |
| **us-east-1**                         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`         |
| **us-east-2**                         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                     |
| **ap-south-1** (自 2025 年 6 月 25 日起)     | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                                     |
| **ap-southeast-2** (自 2025 年 6 月 25 日起) | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                                     |
| **us-west-2** (自 2025 年 6 月 24 日起)      | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                                     |

## 调整 ClickHouse 设置 {#adjusting-clickhouse-settings}
ClickHouse Cloud 为大多数用例提供了合理的默认值。然而，如果您需要针对 ClickPipes 目标表调整一些 ClickHouse 设置，特别为 ClickPipes 创建的角色是最灵活的解决方案。
步骤：
1. 创建一个自定义角色 `CREATE ROLE my_clickpipes_role SETTINGS ...`。有关详细信息，请参阅 [CREATE ROLE](/sql-reference/statements/create/role.md) 语法。
2. 在 ClickPipes 创建期间的“详细信息和设置”步骤中，将自定义角色添加到 ClickPipes 用户。

<Image img={cp_custom_role} alt="Assign a custom role" size="lg" border/>

## 调整 ClickPipes 高级设置 {#clickpipes-advanced-settings}
ClickPipes 提供了覆盖大多数用例需求的合理默认值。如果您的用例需要额外的微调，您可以调整以下设置：

### 对象存储 ClickPipes {#clickpipes-advanced-settings-object-storage}

| 设置                            | 默认值 | 描述                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 在单个插入批处理中处理的字节数。                                  |
| `Max file count`                   | 100           | 在单个插入批处理中处理的最大文件数。                          |
| `Max threads`                      | auto(3)       | [文件处理的最大并发线程数](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | [文件处理的最大并发插入线程数](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | [可插入到表中的块的最小字节大小](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [最大并发下载线程数](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | 配置在将数据插入 ClickHouse 集群之前的最大等待时间。 |
| `Parallel distributed insert select` | 2           | [并行分布式插入选择设置](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | 是否启用[附加视图的并行推送而非顺序推送](/operations/settings/settings#parallel_view_processing)。 |
| `Use cluster function`             | true          | 是否在多个节点之间并行处理文件。 |

<Image img={cp_advanced_settings} alt="Advanced settings for ClickPipes" size="lg" border/>

### 流式 ClickPipes {#clickpipes-advanced-settings-streaming}

| 设置                            | 默认值 | 描述                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Streaming max insert wait time`   | 5s            | 配置在将数据插入 ClickHouse 集群之前的最大等待时间。 |

## 错误报告 {#error-reporting}
ClickPipes 将根据数据摄取过程中的错误类型将错误存储在两个单独的表中。
### 记录错误 {#record-errors}
ClickPipes 将在您的目标表旁创建一个表，后缀为 `<destination_table_name>_clickpipes_error`。该表将包含来自格式错误的数据或模式不匹配的任何错误，并将包括整个无效消息。该表具有 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。
### 系统错误 {#system-errors}
与 ClickPipe 操作相关的错误将存储在 `system.clickpipes_log` 表中。这将存储与您的 ClickPipe 操作相关的所有其他错误（网络、连接等）。该表具有 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

如果 ClickPipes 在 15 分钟内无法连接到数据源，或者在 1 小时内无法连接到目标，ClickPipes 实例将停止并在系统错误表中存储适当的消息（前提是 ClickHouse 实例可用）。

## 常见问题 {#faq}
- **什么是 ClickPipes？**

  ClickPipes 是 ClickHouse Cloud 的一项功能，使用户能够轻松地将 ClickHouse 服务连接到外部数据源，特别是 Kafka。通过 ClickPipes for Kafka，用户可以轻松地将数据持续加载到 ClickHouse 中，使其可用于实时分析。

- **ClickPipes 支持数据转换吗？**

  是的，ClickPipes 支持通过暴露 DDL 创建来进行基本的数据转换。您可以利用 ClickHouse 的 [物化视图功能](/guides/developer/cascading-materialized-views) 对加载到 ClickHouse Cloud 服务的目标表的数据应用更高级的转换。

- **使用 ClickPipes 会产生额外费用吗？**

  ClickPipes 在两个维度上计费：摄取的数据和计算。定价的完整细节可以在 [此页面](/cloud/reference/billing/clickpipes) 上找到。运行 ClickPipes 也可能会在目标 ClickHouse Cloud 服务上产生间接的计算和存储费用，类似于任何摄取工作负载。

- **在使用 ClickPipes for Kafka 时，有没有办法处理错误或故障？**

  是的，ClickPipes for Kafka 在从 Kafka 消费数据时，如果遇到任何操作问题（包括网络问题、连接问题等），将自动重试。在遇到格式错误的数据或无效的模式时，ClickPipes 将在 record_error 表中存储记录并继续处理。
