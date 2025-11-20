---
title: 'Java'
keywords: ['clickhouse', 'java', 'jdbc', 'client', 'integrate', 'r2dbc']
description: '通过 Java 连接 ClickHouse 的可选方式'
slug: /integrations/java
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java 客户端总览

- [Client 0.8+](./client/client.mdx)
- [JDBC 0.8+](./jdbc/jdbc.mdx)
- [R2DBC 驱动](./r2dbc.md)



## ClickHouse 客户端 {#clickhouse-client}

Java 客户端是一个实现了自有 API 的库,用于抽象与 ClickHouse 服务器的网络通信细节。目前仅支持 HTTP 接口。该库提供了用于处理不同 ClickHouse 格式及其他相关功能的实用工具。

Java 客户端最早开发于 2015 年。随着时间推移,其代码库变得难以维护,API 设计混乱,也难以进一步优化。因此我们在 2024 年将其重构为新组件 `client-v2`。新版本具有清晰的 API、更轻量的代码库、更多性能改进,并更好地支持 ClickHouse 格式(主要是 RowBinary 和 Native)。JDBC 将在近期采用此客户端。

### 支持的数据类型 {#supported-data-types}

| **数据类型**           | **Client V2 支持** | **Client V1 支持** |
| ----------------------- | --------------------- | --------------------- |
| Int8                    | ✔                    | ✔                    |
| Int16                   | ✔                    | ✔                    |
| Int32                   | ✔                    | ✔                    |
| Int64                   | ✔                    | ✔                    |
| Int128                  | ✔                    | ✔                    |
| Int256                  | ✔                    | ✔                    |
| UInt8                   | ✔                    | ✔                    |
| UInt16                  | ✔                    | ✔                    |
| UInt32                  | ✔                    | ✔                    |
| UInt64                  | ✔                    | ✔                    |
| UInt128                 | ✔                    | ✔                    |
| UInt256                 | ✔                    | ✔                    |
| Float32                 | ✔                    | ✔                    |
| Float64                 | ✔                    | ✔                    |
| Decimal                 | ✔                    | ✔                    |
| Decimal32               | ✔                    | ✔                    |
| Decimal64               | ✔                    | ✔                    |
| Decimal128              | ✔                    | ✔                    |
| Decimal256              | ✔                    | ✔                    |
| Bool                    | ✔                    | ✔                    |
| String                  | ✔                    | ✔                    |
| FixedString             | ✔                    | ✔                    |
| Nullable                | ✔                    | ✔                    |
| Date                    | ✔                    | ✔                    |
| Date32                  | ✔                    | ✔                    |
| DateTime                | ✔                    | ✔                    |
| DateTime32              | ✔                    | ✔                    |
| DateTime64              | ✔                    | ✔                    |
| Interval                | ✗                     | ✗                     |
| Enum                    | ✔                    | ✔                    |
| Enum8                   | ✔                    | ✔                    |
| Enum16                  | ✔                    | ✔                    |
| Array                   | ✔                    | ✔                    |
| Map                     | ✔                    | ✔                    |
| Nested                  | ✔                    | ✔                    |
| Tuple                   | ✔                    | ✔                    |
| UUID                    | ✔                    | ✔                    |
| IPv4                    | ✔                    | ✔                    |
| IPv6                    | ✔                    | ✔                    |
| Object                  | ✗                     | ✔                    |
| Point                   | ✔                    | ✔                    |
| Nothing                 | ✔                    | ✔                    |
| MultiPolygon            | ✔                    | ✔                    |
| Ring                    | ✔                    | ✔                    |
| Polygon                 | ✔                    | ✔                    |
| SimpleAggregateFunction | ✔                    | ✔                    |
| AggregateFunction       | ✗                     | ✔                    |
| Variant                 | ✔                    | ✗                     |
| Dynamic                 | ✔                    | ✗                     |
| JSON                    | ✔                    | ✗                     |

[ClickHouse 数据类型](/sql-reference/data-types)

:::note

- AggregatedFunction - :warning: 不支持 `SELECT * FROM table ...`
- Decimal - 在 21.9+ 版本中设置 `SET output_format_decimal_trailing_zeros=1` 以保持一致性
- Enum - 可同时作为字符串和整数处理
- UInt64 - 在 client-v1 中映射为 `long`
  :::

### 功能特性 {#features}

客户端功能特性对照表:


| 名称                              | Client V2 | Client V1 |           备注           |
| --------------------------------- | :-------: | :-------: | :--------------------------: |
| Http 连接                   |    ✔     |    ✔     |                              |
| Http 压缩 (LZ4)            |    ✔     |    ✔     |                              |
| 服务器响应压缩 - LZ4 |    ✔     |    ✔     |                              |
| 客户端请求压缩 - LZ4  |    ✔     |    ✔     |                              |
| HTTPS                             |    ✔     |    ✔     |                              |
| 客户端 SSL 证书 (mTLS)            |    ✔     |    ✔     |                              |
| Http 代理                        |    ✔     |    ✔     |                              |
| POJO 序列化/反序列化                        |    ✔     |     ✗     |                              |
| 连接池                   |    ✔     |    ✔     | 使用 Apache HTTP Client 时 |
| 命名参数                  |    ✔     |    ✔     |                              |
| 失败重试                  |    ✔     |    ✔     |                              |
| 故障转移                          |     ✗     |    ✔     |                              |
| 负载均衡                    |     ✗     |    ✔     |                              |
| 服务器自动发现             |     ✗     |    ✔     |                              |
| 日志注释                       |    ✔     |    ✔     |                              |
| 会话角色                     |    ✔     |    ✔     |                              |
| SSL 客户端身份验证         |    ✔     |    ✔     |                              |
| 会话时区                  |    ✔     |    ✔     |                              |

JDBC 驱动继承了底层客户端实现的相同特性。其他 JDBC 特性列在其[页面](/integrations/language-clients/java/jdbc)中。

### 兼容性 {#compatibility}

- 此仓库中的所有项目都已通过 ClickHouse 所有[活跃 LTS 版本](https://github.com/ClickHouse/ClickHouse/pulls?q=is%3Aopen+is%3Apr+label%3Arelease)的测试。
- [Support policy](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)
- 我们建议持续升级客户端，以免错过安全修复和新改进
- 如果您在迁移到 v2 API 时遇到问题 - [创建一个 issue](https://github.com/ClickHouse/clickhouse-java/issues/new?assignees=&labels=v2-feedback&projects=&template=v2-feedback.md&title=)，我们会及时回复！

### 日志记录 {#logging}

我们的 Java 语言客户端使用 [SLF4J](https://www.slf4j.org/) 进行日志记录。您可以使用任何与 SLF4J 兼容的日志框架，例如 `Logback` 或 `Log4j`。
例如，如果您使用 Maven，可以将以下依赖项添加到您的 `pom.xml` 文件中：

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

    <!-- Logback Classic (将 SLF4J 桥接到 Logback) -->
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.5.16</version> <!-- 使用最新版本 -->
    </dependency>
</dependencies>
```

#### 配置日志记录 {#configuring-logging}

这取决于您使用的日志框架。例如，如果您使用 `Logback`，可以在名为 `logback.xml` 的文件中配置日志记录：

```xml title="logback.xml"
<configuration>
    <!-- 控制台 Appender -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}] [%level] [%thread] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 文件 Appender -->
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

```


    <!-- 特定包的自定义日志级别 -->
    <logger name="com.clickhouse" level="info" />

</configuration>
```

[更新日志](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md)
