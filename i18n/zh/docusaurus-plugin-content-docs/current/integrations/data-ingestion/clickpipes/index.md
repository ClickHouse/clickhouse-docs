---
'sidebar_label': '介绍'
'description': '无缝连接您的外部数据源到ClickHouse云。'
'slug': '/integrations/clickpipes'
'title': '与ClickHouse云集成'
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
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import Image from '@theme/IdealImage';


# 与 ClickHouse Cloud 集成

## 介绍 {#introduction}

[ClickPipes](/integrations/clickpipes) 是一个托管的集成平台，使从各种来源获取数据变得像单击几下按钮一样简单。旨在应对最苛刻的工作负载，ClickPipes 的强大和可扩展的架构确保了性能和可靠性的一致性。ClickPipes 可用于长期流式传输需求或一次性数据加载作业。

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## 支持的数据源 {#supported-data-sources}

| 名称                    | 徽标                                                                                            | 类型        | 状态             | 描述                                                                                               |
|-------------------------|------------------------------------------------------------------------------------------------|-------------|------------------|---------------------------------------------------------------------------------------------------|
| Apache Kafka            | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | 流式        | 稳定            | 配置 ClickPipes 并开始从 Apache Kafka 向 ClickHouse Cloud 导入流式数据。                       |
| Confluent Cloud         | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>             | 流式        | 稳定            | 通过我们的直接集成，释放 Confluent 和 ClickHouse Cloud 的强大结合。                         |
| Redpanda                | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                   | 流式        | 稳定            | 配置 ClickPipes 并开始从 Redpanda 向 ClickHouse Cloud 导入流式数据。                          |
| AWS MSK                 | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>         | 流式        | 稳定            | 配置 ClickPipes 并开始从 AWS MSK 向 ClickHouse Cloud 导入流式数据。                          |
| Azure Event Hubs        | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>       | 流式        | 稳定            | 配置 ClickPipes 并开始从 Azure Event Hubs 向 ClickHouse Cloud 导入流式数据。                 |
| WarpStream              | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                 | 流式        | 稳定            | 配置 ClickPipes 并开始从 WarpStream 向 ClickHouse Cloud 导入流式数据。                       |
| Amazon S3               | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>          | 对象存储    | 稳定            | 配置 ClickPipes 以从对象存储中导入大量数据。                                                   |
| Google Cloud Storage    | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储    | 稳定            | 配置 ClickPipes 以从对象存储中导入大量数据。                                                   |
| DigitalOcean Spaces     | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>       | 对象存储    | 稳定            | 配置 ClickPipes 以从对象存储中导入大量数据。                                                   |
| Azure Blob Storage      | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储    | 私有测试         | 配置 ClickPipes 以从对象存储中导入大量数据。                                                   |
| Amazon Kinesis          | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> | 流式       | 稳定            | 配置 ClickPipes 并开始从 Amazon Kinesis 向 ClickHouse Cloud 导入流式数据。                   |
| Postgres                | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>     | DBMS        | 公共测试         | 配置 ClickPipes 并开始从 Postgres 向 ClickHouse Cloud 导入数据。                              |
| MySQL                   | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>            | DBMS        | 私有测试         | 配置 ClickPipes 并开始从 MySQL 向 ClickHouse Cloud 导入数据。                                   |

更多连接器将会添加到 ClickPipes，您可以通过 [与我们联系](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 静态 IP 列表 {#list-of-static-ips}

以下是 ClickPipes 用于连接您的外部服务的静态 NAT IP（按区域分隔）。
请将相关实例区域的 IP 添加到您的 IP 允许列表中以允许流量。
如果您的实例区域未在此列出，则将使用默认区域：

- **eu-central-1** 对于 EU 区域
- **us-east-1** 对于位于 `us-east-1` 的实例
- **us-east-2** 对于其他所有区域

| ClickHouse Cloud 区域 | IP 地址                                                              |
|-----------------------|---------------------------------------------------------------------|
| **eu-central-1**      | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**         | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`      |
| **us-east-1**         | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`    |

## 调整 ClickHouse 设置 {#adjusting-clickhouse-settings}

ClickHouse Cloud 为大多数用例提供了合理的默认值。 然而，如果您需要调整某些 ClickHouse 设置以满足 ClickPipes 目标表的需求，专用角色是最灵活的解决方案。
步骤：
1. 创建自定义角色 `CREATE ROLE my_clickpipes_role SETTINGS ...`。有关详细信息，请参阅 [CREATE ROLE](/sql-reference/statements/create/role.md) 语法。
2. 在 ClickPipes 创建的 “详细信息和设置” 步骤中将自定义角色添加到 ClickPipes 用户。

<Image img={cp_custom_role} alt="分配自定义角色" size="lg" border/>

## 错误报告 {#error-reporting}

ClickPipes 将在您的目标表旁边创建一个后缀为 `<destination_table_name>_clickpipes_error` 的表。 此表将包含来自 ClickPipe 操作（网络、连接等）的任何错误，以及任何不符合模式的数据。错误表具有 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。
如果 ClickPipes 无法在 15 分钟内连接到数据源或目标，ClickPipes 实例将停止，并在错误表中存储相应的消息（前提是 ClickHouse 实例可用）。

## 常见问题解答 {#faq}

- **什么是 ClickPipes？**

  ClickPipes 是 ClickHouse Cloud 的一项功能，使用户能够轻松将 ClickHouse 服务与外部数据源（尤其是 Kafka）连接起来。通过 ClickPipes for Kafka，用户可以轻松地持续加载数据到 ClickHouse，使其可用于实时分析。

- **ClickPipes 支持数据转换吗？**

  是的，ClickPipes 通过暴露 DDL 创建来支持基本数据转换。 然后，您可以在数据被加载到 ClickHouse Cloud 服务的目标表中时，应用更高级的转换，利用 ClickHouse 的 [物化视图功能](/guides/developer/cascading-materialized-views)。

- **使用 ClickPipes 会产生额外费用吗？**

  ClickPipes 的计费有两个维度：获取的数据和计算。价格的完整详细信息可在 [此页面](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq) 上找到。运行 ClickPipes 还可能会在目标 ClickHouse Cloud 服务上产生与任何数据获取工作负载类似的间接计算和存储费用。

- **有什么办法处理使用 ClickPipes for Kafka 时的错误或故障吗？**

  是的，ClickPipes for Kafka 会在从 Kafka 消费数据时自动重试失败的情况。ClickPipes 还支持启用一个专门的错误表，该表将保存错误和格式错误的数据，保留 7 天。
