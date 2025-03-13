---
sidebar_label: '介绍'
description: '无缝连接您的外部数据源到 ClickHouse Cloud。'
slug: '/integrations/clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';


# 与 ClickHouse Cloud 集成

## 介绍 {#introduction}

[ClickPipes](/integrations/clickpipes) 是一个管理集成平台，它使从多种来源获取数据变得像点击几个按钮那么简单。ClickPipes 专为最苛刻的工作负载设计，其强大且可扩展的架构确保了一致的性能和可靠性。ClickPipes 可用于长期流式需求或一次性数据加载任务。

<img src={clickpipes_stack} alt="ClickPipes stack" />

## 支持的数据源 {#supported-data-sources}

| 名称                 | logo| 类型| 状态          | 描述                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|流式| 稳定          | 配置 ClickPipes，并开始将来自 Apache Kafka 的流数据加载到 ClickHouse Cloud。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|流式| 稳定          | 通过我们的直接集成解锁 Confluent 和 ClickHouse Cloud 的组合力量。          |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Redpanda logo" style={{width: '2.5rem', 'background-color': 'transparent'}}/>|流式| 稳定          | 配置 ClickPipes，并开始将来自 Redpanda 的流数据加载到 ClickHouse Cloud。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|流式| 稳定          | 配置 ClickPipes，并开始将来自 AWS MSK 的流数据加载到 ClickHouse Cloud。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|流式| 稳定          | 配置 ClickPipes，并开始将来自 Azure Event Hubs 的流数据加载到 ClickHouse Cloud。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|流式| 稳定          | 配置 ClickPipes，并开始将来自 WarpStream 的流数据加载到 ClickHouse Cloud。       |
| Amazon S3            |<S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>|对象存储| 稳定          | 配置 ClickPipes 从对象存储中加载大量数据。                            |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>|对象存储| 稳定          | 配置 ClickPipes 从对象存储中加载大量数据。                            |
| Amazon Kinesis       |<Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/>|流式| 稳定          | 配置 ClickPipes，并开始将来自 Amazon Kinesis 的流数据加载到 ClickHouse Cloud。   |
| Postgres             |<Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>|数据库管理系统| 公测 | 配置 ClickPipes，并开始将数据从 Postgres 加载到 ClickHouse Cloud。                   |

更多连接器将添加到 ClickPipes，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。


## 静态 IP 列表 {#list-of-static-ips}

以下是 ClickPipes 用于连接到您的外部服务的静态 NAT IP（按区域分隔）。将相关实例区域的 IP 添加到您的 IP 允许列表中以允许流量。如果您的实例区域不在此列表中，它将使用默认区域：

- **eu-central-1** 对于 EU 区域
- **us-east-1** 对于 `us-east-1` 中的实例
- **us-east-2** 对于其他所有区域

| ClickHouse Cloud 区域 | IP 地址 |
|-------------------------|--------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## 调整 ClickHouse 设置 {#adjusting-clickhouse-settings}
ClickHouse Cloud 为大多数用例提供合理的默认设置。然而，如果您需要调整一些 ClickHouse 设置以适应 ClickPipes 目标表，一个专用角色是最灵活的解决方案。
步骤：
1. 创建一个自定义角色 `CREATE ROLE my_clickpipes_role SETTINGS ...`。有关详细信息，请参见 [CREATE ROLE](/sql-reference/statements/create/role.md) 语法。
2. 在创建 ClickPipes 时，将自定义角色添加到 ClickPipes 用户的 `Details and Settings` 步骤中。

<img src={cp_custom_role} alt="分配自定义角色" />

## 错误报告 {#error-reporting}
ClickPipes 将在您的目标表旁创建一个表，后缀为 `<destination_table_name>_clickpipes_error`。该表将包含您 ClickPipe 操作（网络、连接等）产生的任何错误，以及任何不符合模式的数据。错误表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。
如果 ClickPipes 在 15 分钟后无法连接到数据源或目标，ClickPipes 实例将停止，并在错误表中存储适当的消息（前提是 ClickHouse 实例可用）。

## 常见问题 {#faq}
- **什么是 ClickPipes？**

  ClickPipes 是 ClickHouse Cloud 的一项功能，使用户可以轻松将 ClickHouse 服务连接到外部数据源，特别是 Kafka。通过适用于 Kafka 的 ClickPipes，用户可以轻松地将数据连续加载到 ClickHouse，从而为实时分析提供数据。

- **ClickPipes 是否支持数据转换？**

  是的，ClickPipes 支持基本的数据转换，通过暴露 DDL 创建。然后，您可以在数据加载到 ClickHouse Cloud 服务的目标表时，对数据应用更高级的转换，利用 ClickHouse 的 [物化视图功能](/guides/developer/cascading-materialized-views)。

- **使用 ClickPipes 是否会产生额外费用？**

  ClickPipes 按两个维度计费：加载的数据和计算。完整的定价细节可在 [此页面](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq) 找到。运行 ClickPipes 也可能在目标 ClickHouse Cloud 服务上产生间接计算和存储费用，类似于任何加载工作负载。

- **是否有办法在使用 ClickPipes 的 Kafka 时处理错误或故障？**

  是的，适用于 Kafka 的 ClickPipes 会在从 Kafka 消费数据时自动重试故障情况。ClickPipes 还支持启用一个专用的错误表，该表将保存错误和格式错误的数据，存放 7 天。
