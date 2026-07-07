---
slug: /integrations/integration-development/building-integrations
title: '构建 ClickHouse 集成'
sidebar_label: '构建集成'
sidebar_position: 2
description: '介绍构建 ClickHouse 集成时有关摄取、消费、传输协议和客户端约定的基础知识。'
keywords: ['合作伙伴', '集成', '摄取', '消费', 'ClickPipes', '客户端库', 'user-agent']
doc_type: '指南'
---

# 使用 ClickHouse 构建集成 \{#building-integrations-with-clickhouse\}

本页将帮助你了解集成的整体范围，以便界定摄取和消费相关工作。有关验证和发布，请继续阅读[测试你的集成](/integrations/integration-development/testing-your-integration)和[为你的集成编写文档](/integrations/integration-development/documenting-your-integration)。

## 摄取 \{#ingestion\}

数据可通过两种路径进入 ClickHouse。请根据您的产品是自行管理摄取平面，还是将其委托给其他方，来选择合适的路径。

### 路径 A：ClickPipes (托管，仅限 ClickHouse Cloud) \{#path-a-clickpipes\}

如果您不想自行构建和运维摄取基础设施，[ClickPipes](/integrations/clickpipes) 是一项托管服务，可从您客户的数据源拉取数据并导入其 ClickHouse Cloud 服务。ClickPipes 负责处理扩缩容、并行化、重试以及延迟报告。

当前支持的数据源包括：

* **流式：**Apache Kafka (包括 MSK、Confluent Cloud、Redpanda、Azure Event Hubs、WarpStream) 、Amazon Kinesis
* **对象存储：**Amazon S3 (以及兼容 S3 的存储) 、Google Cloud Storage、Azure Blob 存储
* **CDC：**PostgreSQL、MySQL、MongoDB、BigQuery

### 路径 B：通过官方语言客户端自行摄取 \{#path-b-language-client\}

如果该管道由你自行维护，请使用[官方语言客户端](/integrations/language-clients)之一。它们可以处理序列化、分批处理、TLS、压缩和连接池。你只需传入运行时基本类型；客户端会处理传输格式。

* 官方客户端：Python、Go、Java、JavaScript、Rust、C#、C++
* 支持两种传输协议：HTTP (所有客户端) 和原生 TCP (仅 Go 和 C++ 客户端)
* 认证：默认通过 TLS 使用用户名和密码；所有主流客户端都支持 mTLS 和 SSL 客户端证书认证
* 数据格式通常是实现细节。客户端会将运行时类型转换为 ClickHouse Native 或 RowBinary 格式。如果你已经生成了 Arrow、Parquet、JSONEachRow 或其他格式，大多数客户端都提供用于预序列化数据的原始字节 API
* 为了提升吞吐量，请将**10K–100K 行**作为一个批次，并将**每秒一次插入**作为同步插入的大致上限。如果客户端侧分批处理不现实，请使用[异步插入](/optimize/asynchronous-inserts)将分批处理交给服务器

另请参见：[批量插入](/optimize/bulk-inserts)。

## 消费 \{#consumption\}

HTTP 和原生 TCP 都可承载查询。原生协议采用二进制，开销更低。HTTP 则可通过负载均衡器和代理工作。两者都同等受支持；请根据基础设施来选择，而不是看功能是否有差距。

* **应用程序代码：** 使用与摄取相同的[官方语言客户端](/integrations/language-clients)
* **BI 和 SQL 工具：** ClickHouse 提供官方 [JDBC v2 driver](/integrations/java) (Java) 和 [ODBC driver](/interfaces/odbc)。Tableau、Looker、Power BI、Metabase、Apache Superset 和 Grafana 可通过这些驱动程序，或通过由 ClickHouse 及其合作伙伴维护的专用连接器进行集成
* **结果格式：** 客户端通常自行处理序列化。如果你的产品需要，也可以在传输中请求 Arrow、Parquet 或其他列式格式

### 结果集大小控制 \{#result-set-sizing\}

大多数分析查询返回的结果集都比较小 (聚合、汇总、top-N) ，网络传输链路很少会成为瓶颈。ClickHouse 表可以容纳数十亿行，而在大型事实表上执行无界的 `SELECT *` 可能会传输数 TB 的数据。**在应用中控制请求形态：**使用 `LIMIT`、分页、流式读取，以及显式指定列。如果你构建的是面向用户的分析功能，应将无界结果集视为用户体验问题，而不是传输问题。

ClickHouse 拥有丰富的类型系统：Array、Tuple、Map、JSON、Nested、LowCardinality 等。官方客户端会将这些映射为符合各编程语言习惯的类型。如果你的产品会将 ClickHouse 数据呈现给最终用户，请尽早规划类型映射策略。

## 后续步骤 \{#next-steps\}

选择一种方案，先使用 [ClickHouse Cloud 试用版](https://clickhouse.com/cloud)进行原型验证，然后在[合作伙伴门户](https://clickhouse.com/partners)注册你的集成。

## User-agent 字符串约定 \{#user-agent-string-convention\}

HTTP 客户端应设置一个用于标识你的集成的 `User-Agent` 字符串。ClickHouse 会在服务器端解析该字符串，以跟踪接入情况、收集使用遥测数据，并为产品路线图提供依据。

格式：

```text
<app_name>/<app_version> <client_name>/<client_version> (<comment>; <key1>: <value1>; <key2>: <value2>)
```

示例：

* `clickhouse-java/0.8.0`
* `my-analytics-app/3.1.2 clickhouse-js/1.2.0 (env: staging; region: us-east-1; lv: node/20.10)`

规则：

* 客户端名称和版本中均不得包含空格
* 如果包含注释，必须放在最前面
* 标准元数据键：`lv` (语言或框架版本) 、`os`、`arch`
* TCP 和原生协议客户端通过协议字段上报客户端名称和版本，而不是通过 `User-Agent`

如果使用 JDBC，请参阅[客户端标识](/integrations/language-clients/java/jdbc#client-identification)，了解驱动程序如何设置 `User-Agent` 及相关字段。

## 沙箱和试用访问权限 \{#sandbox-and-trial-access\}

[ClickHouse Cloud](https://clickhouse.com/cloud) 提供免费试用，可用于开发和集成验证。如果您是 House Mate 合作伙伴，可通过[合作伙伴门户](https://clickhouse.com/partners)申请额外的开发额度。