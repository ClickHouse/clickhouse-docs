---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: '使用 Java 连接 ClickHouse 的选项'
slug: /integrations/java
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java 客户端概览 {#java-clients-overview}

- [Client 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC 驱动](./r2dbc.md)

## ClickHouse client {#clickhouse-client}

Java 客户端是一个实现自身 API 的库，用于屏蔽与 ClickHouse 服务器进行网络通信的细节。目前仅支持 HTTP 接口。该库提供了用于处理不同 ClickHouse 格式以及其他相关功能的实用工具。

Java 客户端最早开发于 2015 年，其代码库如今变得非常难以维护，API 设计令人困惑，也难以进一步优化。因此我们在 2024 年将其重构为新的组件 `client-v2`。它具有清晰的 API、更轻量的代码库和更多性能优化，并对 ClickHouse 格式提供了更好的支持（主要是 RowBinary 和 Native）。JDBC 将在不久的将来使用该客户端。  

### 支持的数据类型 {#supported-data-types}

|**数据类型**           |**Client V2 支持**   |**Client V1 支持**   |
|-----------------------|---------------------|---------------------|
|Int8                   |✔                    |✔                    |
|Int16                  |✔                    |✔                    |
|Int32                  |✔                    |✔                    |
|Int64                  |✔                    |✔                    |
|Int128                 |✔                    |✔                    |
|Int256                 |✔                    |✔                    |
|UInt8                  |✔                    |✔                    |
|UInt16                 |✔                    |✔                    |
|UInt32                 |✔                    |✔                    |
|UInt64                 |✔                    |✔                    |
|UInt128                |✔                    |✔                    |
|UInt256                |✔                    |✔                    |
|Float32                |✔                    |✔                    |
|Float64                |✔                    |✔                    |
|Decimal                |✔                    |✔                    |
|Decimal32              |✔                    |✔                    |
|Decimal64              |✔                    |✔                    |
|Decimal128             |✔                    |✔                    |
|Decimal256             |✔                    |✔                    |
|Bool                   |✔                    |✔                    |
|String                 |✔                    |✔                    |
|FixedString            |✔                    |✔                    |
|Nullable               |✔                    |✔                    |
|Date                   |✔                    |✔                    |
|Date32                 |✔                    |✔                    |
|DateTime               |✔                    |✔                    |
|DateTime32             |✔                    |✔                    |
|DateTime64             |✔                    |✔                    |
|Interval               |✗                    |✗                    |
|Enum                   |✔                    |✔                    |
|Enum8                  |✔                    |✔                    |
|Enum16                 |✔                    |✔                    |
|Array                  |✔                    |✔                    |
|Map                    |✔                    |✔                    |
|Nested                 |✔                    |✔                    |
|Tuple                  |✔                    |✔                    |
|UUID                   |✔                    |✔                    |
|IPv4                   |✔                    |✔                    |
|IPv6                   |✔                    |✔                    |
|Object                 |✗                    |✔                    |
|Point                  |✔                    |✔                    |
|Nothing                |✔                    |✔                    |
|MultiPolygon           |✔                    |✔                    |
|Ring                   |✔                    |✔                    |
|Polygon                |✔                    |✔                    |
|SimpleAggregateFunction|✔                    |✔                    |
|AggregateFunction      |✗                    |✔                    |
|Variant                |✔                    |✗                    |
|Dynamic                |✔                    |✗                    |
|JSON                   |✔                    |✗                    |

[ClickHouse 数据类型](/sql-reference/data-types)

:::note

- AggregatedFunction - :warning: 不支持 `SELECT * FROM table ...`
- Decimal - 在 21.9+ 版本中将 `output_format_decimal_trailing_zeros` 设置为 `1` 以保持一致性
- Enum - 既可以作为字符串，也可以作为整数使用
- UInt64 - 在 client-v1 中映射到 `long` 类型
:::

### 功能 {#features}

各客户端功能对比表：

| 名称                                         | Client V2 | Client V1 | 说明
|----------------------------------------------|:---------:|:---------:|:---------:|
| HTTP Connection                              |✔       |✔      | |
| HTTP Compression (LZ4)                       |✔       |✔      | |
| Server Response Compression - LZ4            |✔       |✔      | | 
| Client Request Compression - LZ4             |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| Client SSL Cert (mTLS)                       |✔       |✔      | |
| HTTP Proxy                                   |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| Connection Pool                              |✔       |✔      | 当使用 Apache HTTP Client 时 |
| Named Parameters                             |✔       |✔      | |
| Retry on failure                             |✔       |✔      | |
| Failover                                     |✗       |✔      | |
| Load-balancing                               |✗       |✔      | |
| Server auto-discovery                        |✗       |✔      | |
| Log Comment                                  |✔       |✔      | |
| Session Roles                                |✔       |✔      | |
| SSL Client Authentication                    |✔       |✔      | |
| Session timezone                             |✔       |✔      | |

JDBC 驱动继承其底层客户端实现所具备的相同功能。其他 JDBC 功能列在其[页面](/integrations/language-clients/java/jdbc)中。

### 兼容性 {#compatibility}

- 此仓库中的所有项目都已在所有 ClickHouse [当前处于活动状态的 LTS 版本](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)上通过测试。
- [支持策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- 我们建议持续升级客户端，以免错过安全修复和新的改进。
- 如果在迁移到 v2 API 时遇到问题，请[创建一个 issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)，我们会及时回复！

### 日志记录 {#logging}

我们的 Java 客户端使用 [SLF4J](https://www.slf4j.org/) 进行日志记录。你可以使用任何与 SLF4J 兼容的日志框架，例如 `Logback` 或 `Log4j`。
例如，如果你使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- 使用最新版本 -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- 使用最新版本 -->
    </dependency>

    <!-- Logback Classic(桥接 SLF4J 与 Logback)-->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 使用最新版本 -->
    </dependency>
</dependencies>
```

#### 配置日志记录 {#configuring-logging}

具体配置方式取决于你所使用的日志框架。例如，如果你使用的是 `Logback`，可以在名为 `logback.xml` 的文件中进行配置：

```xml title="logback.xml"
<configuration>
    <!-- 控制台输出器 -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 文件输出器 -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.log</file>
        <append>true</append>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 根日志记录器 -->
    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

    <!-- 特定包的自定义日志级别 -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[变更日志](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
