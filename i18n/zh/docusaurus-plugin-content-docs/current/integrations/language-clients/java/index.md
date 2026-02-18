---
title: 'Java'
sidebar_position: 1
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: '从 Java 连接到 ClickHouse 的可选方案'
slug: /integrations/java
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java 客户端概览 \{#java-clients-overview\}

- [Client 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC 驱动](./r2dbc.md)

## ClickHouse 客户端 \{#clickhouse-client\}

Java 客户端是一个库，提供了自己的 API，用于屏蔽与 ClickHouse 服务器进行网络通信的细节。目前仅支持 HTTP 接口。该库提供了用于处理不同 ClickHouse 格式及其他相关功能的实用工具。

Java 客户端早在 2015 年就开始开发，其代码库已经变得非常难以维护，API 设计也较为混乱，进一步优化的空间有限。因此我们在 2024 年对其进行了重构，形成了一个新的组件 `client-v2`。它具有更清晰的 API、更轻量的代码库和更高的性能，并对 ClickHouse 格式（主要是 RowBinary 与 Native）提供了更好的支持。JDBC 将在不久的将来使用这个客户端。

### 支持的数据类型 \{#supported-data-types\}

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
- Decimal - 在 21.9+ 中使用 `SET output_format_decimal_trailing_zeros=1` 以获得一致的行为
- Enum - 可以同时视为字符串和整数
- UInt64 - 在 client-v1 中映射为 `long` 类型
:::

### 功能 \{#features\}

客户端功能对比表：

| 名称                                         | Client V2 | Client V1 | 备注
|----------------------------------------------|:---------:|:---------:|:---------:|
| HTTP 连接                                    |✔       |✔      | |
| HTTP 压缩（LZ4）                             |✔       |✔      | |
| 应用程序控制压缩                            |✔       |✗      | |
| 服务器响应压缩 - LZ4                         |✔       |✔      | |
| 客户端请求压缩 - LZ4                         |✔       |✔      | |
| HTTPS                                        |✔       |✔      | |
| 客户端 SSL 证书（mTLS）                      |✔       |✔      | |
| HTTP 代理                                   |✔       |✔      | |
| POJO SerDe                                   |✔       |✗      | |
| 连接池                                       |✔       |✔      | 当使用 Apache HTTP Client 时 |
| 命名参数                                     |✔       |✔      | |
| 失败重试                                     |✔       |✔      | |
| 故障转移                                     |✗       |✔      | |
| 负载均衡                                     |✗       |✔      | |
| 服务器自动发现                               |✗       |✔      | |
| 日志注释                                     |✔       |✔      | |
| 会话角色                                     |✔       |✔      | |
| SSL 客户端认证                               |✔       |✔      | |
| SNI 配置                                     |✔       |✗      | |
| 会话时区                                     |✔       |✔      | |

JDBC 驱动继承其底层客户端实现的相同功能。其他 JDBC 功能列在其[页面](/integrations/language-clients/java/jdbc)中。

### 兼容性 \{#compatibility\}

- 此仓库中的所有项目都会针对 ClickHouse 的所有[当前活动的 LTS 版本](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)进行测试。
- [支持策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- 我们建议持续升级客户端，以免错过安全修复和最新改进。
- 如果在迁移到 v2 API 时遇到问题，请[提交一个 issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)，我们会及时回复。

### 日志记录 \{#logging\}

我们的 Java 客户端使用 [SLF4J](https://www.slf4j.org/) 进行日志记录。您可以使用任何与 SLF4J 兼容的日志框架，例如 `Logback` 或 `Log4j`。
例如，如果您使用 Maven，可以在 `pom.xml` 文件中添加如下依赖：

```xml title="pom.xml"
<dependencies>
    <!-- SLF4J API -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>2.0.16</version> <!-- Use the latest version -->
    </dependency>

    <!-- Logback Core -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>1.5.16</version> <!-- Use the latest version -->
    </dependency>

    <!-- Logback Classic (bridges SLF4J to Logback) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- Use the latest version -->
    </dependency>
</dependencies>
```


#### 配置日志记录 \{#configuring-logging\}

这取决于所使用的日志框架。例如，如果使用 `Logback`，可以在名为 `logback.xml` 的文件中配置日志记录：

```xml title="logback.xml"
<configuration>
    <!-- Console Appender -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- File Appender -->
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.log</file>
        <append>true</append>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Root Logger -->
    <root level="info">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>

    <!-- Custom Log Levels for Specific Packages -->
    <logger name="com.clickhouse" level="info" />
</configuration>
```

[更新日志](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
