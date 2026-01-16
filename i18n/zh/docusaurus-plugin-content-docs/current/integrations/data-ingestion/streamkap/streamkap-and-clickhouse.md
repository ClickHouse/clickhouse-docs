---
sidebar_label: '将 Streamkap 连接到 ClickHouse'
sidebar_position: 11
keywords: ['clickhouse', 'Streamkap', 'CDC', '连接', '集成', 'ETL', '数据集成']
slug: /integrations/sttreamkap
description: '使用 Airbyte 数据管道将流数据摄取到 ClickHouse'

title: '将 Streamkap 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://www.streamkap.com/'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 Streamkap 连接到 ClickHouse \{#connect-streamkap-to-clickhouse\}

<PartnerBadge/>

<a href="https://www.streamkap.com/" target="_blank">Streamkap</a> 是一个实时数据集成平台，专注于 CDC（变更数据捕获）流式传输和流处理。它构建在使用 Apache Kafka、Apache Flink 和 Debezium 的高吞吐量、可扩展技术栈之上，并以 SaaS 或 BYOC（Bring Your Own Cloud，自带 Cloud）部署形式提供全托管服务。 

Streamkap 允许将来自 PostgreSQL、MySQL、SQL Server、MongoDB 等源数据库以及<a href="https://streamkap.com/connectors" target="_blank">更多</a>数据源的每一次插入、更新和删除，以毫秒级延迟直接流式传输到 ClickHouse 中。 

因此，它非常适合支撑实时分析型仪表盘、运营分析，以及为机器学习模型持续提供实时数据。

## Key Features \\{#key-features\\}

- **Real-time Streaming CDC:** Streamkap 直接从数据库日志中捕获变更，确保 ClickHouse 中的数据始终是源数据库的实时副本。
Simplified Stream Processing: 在数据写入 ClickHouse 之前，以实时方式对数据进行转换、丰富、路由、格式化，并创建 embeddings。由 Flink 提供驱动，同时对用户屏蔽其复杂性。

- **Fully Managed and Scalable:** 提供适用于生产环境、零维护的数据管道，无需自行管理 Kafka、Flink、Debezium 或 schema registry 基础设施。该平台针对高吞吐量场景设计，并可线性扩展以处理数十亿级事件。

- **Automated Schema Evolution:** Streamkap 会自动检测源数据库中的 schema 变更，并将其同步到 ClickHouse。它可以在无需人工干预的情况下处理新增列或更改列类型。

- **Optimized for ClickHouse:** 此集成专为高效利用 ClickHouse 功能而构建。默认情况下，它使用 ReplacingMergeTree 引擎，以无缝方式处理来自源系统的更新和删除操作。

- **Resilient Delivery:** 该平台提供至少一次投递（at-least-once）保证，确保源端与 ClickHouse 之间的数据一致性。对于 upsert 操作，它会基于主键执行去重。

## 入门 \\{#started\\}

本指南概述了如何配置 Streamkap 数据管道，将数据加载到 ClickHouse 中。

### 前提条件 \\{#prerequisites\\}

- 一个 <a href="https://app.streamkap.com/account/sign-up" target="_blank">Streamkap 帐户</a>。
- 您的 ClickHouse 集群连接信息：主机名（Hostname）、端口（Port）、用户名（Username）和密码（Password）。
- 一个已配置为允许 CDC（变更数据捕获）的源数据库（例如 PostgreSQL、SQL Server）。您可以在 Streamkap 文档中找到详细的设置指南。

### 步骤 1：在 Streamkap 中配置数据源 \\{#configure-clickhouse-source\\}

1. 登录到你的 Streamkap 账户。
2. 在侧边栏中进入 **Connectors**，然后选择 **Sources** 选项卡。
3. 点击 **+ Add**，选择你的源数据库类型（例如 SQL Server RDS）。
4. 填写连接配置信息，包括端点（endpoint）、端口、数据库名称和用户凭据。
5. 保存该连接器。

### 步骤 2：配置 ClickHouse 目标 \\{#configure-clickhouse-dest\\}

1. 在 **Connectors** 部分中，选择 **Destinations** 选项卡。
2. 点击 **+ Add**，并从列表中选择 **ClickHouse**。
3. 输入 ClickHouse 服务的连接信息：
   - **Hostname：** ClickHouse 实例的主机名（例如 `abc123.us-west-2.aws.clickhouse.cloud`）
   - **Port：** 安全的 HTTPS 端口，通常为 `8443`
   - **Username and Password：** ClickHouse 用户的凭据
   - **Database：** ClickHouse 中的目标数据库名称
4. 保存该目标。

### 步骤 3：创建并运行 Pipeline \\{#run-pipeline\\}

1. 在侧边栏中点击 **Pipelines**，然后点击 **+ Create**。
2. 选择你刚刚配置好的 Source 和 Destination。
3. 选择你希望进行流式传输的 schema 和表。
4. 为你的 pipeline 命名，然后点击 **Save**。

创建完成后，pipeline 会自动激活。Streamkap 会先对现有数据进行一次快照，然后在有新变更发生时开始持续进行流式传输。

### 步骤 4：在 ClickHouse 中验证数据 \{#verify-data-clickhoouse\}

连接到你的 ClickHouse 集群，运行查询以查看写入目标表的数据。

```sql
SELECT * FROM your_table_name LIMIT 10;
```


## 与 ClickHouse 的工作原理 \\{#how-it-works-with-clickhouse\\}

Streamkap 集成专为在 ClickHouse 中高效管理 CDC 数据而设计。

### 表引擎和数据处理 \\{#table-engine-data-handling\\}

默认情况下，Streamkap 使用 upsert 摄取模式。在 ClickHouse 中创建表时，它会使用 ReplacingMergeTree 引擎。此引擎非常适合处理 CDC 事件：

- 源表的主键会在 ReplacingMergeTree 表定义中作为 ORDER BY 键使用。

- 源中的**更新**会作为新行写入 ClickHouse。在后台合并过程中，ReplacingMergeTree 会将这些行合并，仅根据排序键保留最新版本。

- **删除**通过一个元数据标志映射到 ReplacingMergeTree 的 ```is_deleted``` 参数来处理。源端被删除的行不会立即被移除，而是被标记为已删除。
  - 可以选择在 ClickHouse 中保留这些已删除记录，以便用于分析

### 元数据列 \\{#metadata-columns\\}

Streamkap 为每个表添加了多个元数据列，用于管理数据状态：

| 列名                      | 描述                                                                       |
|--------------------------|---------------------------------------------------------------------------|
| `_STREAMKAP_SOURCE_TS_MS` | 源数据库中事件的时间戳（毫秒）。                                            |
| `_STREAMKAP_TS_MS`        | Streamkap 处理该事件时的时间戳（毫秒）。                                   |
| `__DELETED`               | 一个布尔标志位（`true`/`false`），指示该行是否在源端被删除。                      |
| `_STREAMKAP_OFFSET`       | 来自 Streamkap 内部日志的偏移量值，用于排序和调试。                             |

### 查询最新数据 \{#query-latest-data\}

由于 ReplacingMergeTree 在后台处理更新和删除操作，在合并完成之前，简单的 SELECT * 查询可能会显示历史或已删除的行。若要获取数据的最新状态，必须过滤掉已删除的记录，并且只选择每一行的最新版本。

可以使用 FINAL 修饰符来实现这一点，它非常方便，但可能会影响查询性能：

```sql
-- Using FINAL to get the correct current state
SELECT * FROM your_table_name FINAL WHERE __DELETED = 'false';
SELECT * FROM your_table_name FINAL LIMIT 10;
SELECT * FROM your_table_name FINAL WHERE <filter by keys in ORDER BY clause>;
SELECT count(*) FROM your_table_name FINAL;
```

为了在大型表上获得更好的性能，尤其是在不需要读取所有列且只执行一次性分析查询的情况下，可以使用 `argMax` 函数为每个主键手动选出最新的记录：

```sql
SELECT key,
       argMax(col1, version) AS col1,
       argMax(col2, version) AS col2
FROM t
WHERE <your predicates>
GROUP BY key;
```

在生产环境场景下，对于存在并发且反复执行的终端用户查询，可以使用 materialized view 对数据进行建模，使其更好地匹配下游的访问模式。


## 延伸阅读 \\{#further-reading\\}

- <a href="https://streamkap.com/" target="_blank">Streamkap 网站</a>
- <a href="https://docs.streamkap.com/clickhouse" target="_blank">Streamkap 的 ClickHouse 文档</a>
- <a href="https://streamkap.com/blog/streaming-with-change-data-capture-to-clickhouse" target="_blank">博客：使用变更数据捕获向 ClickHouse 进行数据流传输</a>
- <a href="https://streamkap.com/blog/streaming-with-change-data-capture-to-clickhouse" target="_blank">ClickHouse 文档：ReplacingMergeTree</a>