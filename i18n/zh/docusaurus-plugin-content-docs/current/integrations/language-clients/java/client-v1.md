title: '客户端 (0.7.x 及更早版本)'
sidebar_label: '客户端 (0.7.x 及更早版本)'
keywords: ['Java', '客户端', 'ClickHouse']
description: '与数据库服务器通过其协议进行通信的 Java 客户端库。'

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# 客户端 (0.7.x 及更早版本)

Java 客户端库，通过其协议与数据库服务器通信。当前实现仅支持 [HTTP 接口](/interfaces/http)。该库提供了自己的 API，以向服务器发送请求。

:::warning 弃用
该库将很快被弃用。对于新项目，请使用最新的 [Java 客户端](/integrations/language-clients/java/client.md)
:::

## 设置 {#setup}

<Tabs groupId="client-v1-setup">
<TabItem value="maven" label="Maven">

```xml
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.7.2</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation("com.clickhouse:clickhouse-http-client:0.7.2")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation 'com.clickhouse:clickhouse-http-client:0.7.2'
```

</TabItem>
</Tabs>

自版本 `0.5.0` 起，驱动程序使用一个新的客户端 HTTP 库，需要作为依赖添加。

<Tabs groupId="client-v1-http-client">
<TabItem value="maven" label="Maven">

```xml
<!-- https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5 -->
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
    <version>5.3.1</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5
implementation("org.apache.httpcomponents.client5:httpclient5:5.3.1")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.apache.httpcomponents.client5/httpclient5
implementation 'org.apache.httpcomponents.client5:httpclient5:5.3.1'
```

</TabItem>
</Tabs>

## 初始化 {#initialization}

连接 URL 格式: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`，例如：

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `https://(https://explorer@play.clickhouse.com:443`

连接到单个节点:

```java showLineNumbers
ClickHouseNode server = ClickHouseNode.of("http://localhost:8123/default?compress=0");
```
连接到多个节点的集群:

```java showLineNumbers
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

## 查询 API {#query-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            long totalRows = summary.getTotalRowsToRead();
}
```

## 流式查询 API {#streaming-query-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            for (ClickHouseRecord r : response.records()) {
            int num = r.getValue(0).asInteger();
            // 类型转换
            String str = r.getValue(0).asString();
            LocalDate date = r.getValue(0).asDate();
        }
}
```

请参阅 [完整的代码示例](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L73) 在 [仓库](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client)。

## 插入 API {#insert-api}

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // `myInputStream` 是源数据，以 RowBinary 格式
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

请参阅 [完整的代码示例](https://github.com/ClickHouse/clickhouse-java/blob/main/examples/client/src/main/java/com/clickhouse/examples/jdbc/Main.java#L39) 在 [仓库](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client)。

**RowBinary 编码**

RowBinary 格式在其 [页面](/interfaces/formats#rowbinarywithnamesandtypes) 中描述。

有关 [代码示例](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/src/main/java/com/clickhouse/kafka/connect/sink/db/ClickHouseWriter.java#L622)。

## 特性 {#features}
### 压缩 {#compression}

客户端默认使用 LZ4 压缩，需要此依赖：

<Tabs groupId="client-v1-compression-deps">
<TabItem value="maven" label="Maven" >

```xml
<!-- https://mvnrepository.com/artifact/org.lz4/lz4-java -->
<dependency>
    <groupId>org.lz4</groupId>
    <artifactId>lz4-java</artifactId>
    <version>1.8.0</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.lz4/lz4-java
implementation("org.lz4:lz4-java:1.8.0")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.lz4/lz4-java
implementation 'org.lz4:lz4-java:1.8.0'
```

</TabItem>
</Tabs>

您可以选择通过在连接 URL 中设置 `compress_algorithm=gzip` 来使用 gzip。

或者，您可以通过几种方式禁用压缩。

1. 通过在连接 URL 中设置 `compress=0` 禁用: `http://localhost:8123/default?compress=0`
2. 通过客户端配置禁用:

```java showLineNumbers
ClickHouseClient client = ClickHouseClient.builder()
    .config(new ClickHouseConfig(Map.of(ClickHouseClientOption.COMPRESS, false)))
    .nodeSelector(ClickHouseNodeSelector.of(ClickHouseProtocol.HTTP))
    .build();
```

请参阅 [压缩文档](/data-compression/compression-modes) 以了解有关不同压缩选项的更多信息。

### 多个查询 {#multiple-queries}

在同一个会话中在工作线程依次执行多个查询：

```java showLineNumbers
CompletableFuture<List<ClickHouseResponseSummary>> future = ClickHouseClient.send(servers.apply(servers.getNodeSelector()),
    "create database if not exists my_base",
    "use my_base",
    "create table if not exists test_table(s String) engine=Memory",
    "insert into test_table values('1')('2')('3')",
    "select * from test_table limit 1",
    "truncate table test_table",
    "drop table if exists test_table");
List<ClickHouseResponseSummary> results = future.get();
```

### 命名参数 {#named-parameters}

您可以按名称传递参数，而不必仅依赖参数列表中的位置。此功能可以通过 `params` 函数使用。

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name limit :limit")
        .params("Ben", 1000)
        .executeAndWait()) {
            //...
        }
}
```

:::note 参数
所有涉及 `String` 类型 (`String`, `String[]`, `Map<String, String>`) 的 `params` 签名假定传递的键为有效的 ClickHouse SQL 字符串。例如：

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name")
        .params(Map.of("name","'Ben'"))
        .executeAndWait()) {
            //...
        }
}
```

如果您不想手动将字符串对象解析为 ClickHouse SQL，您可以使用位于 `com.clickhouse.data` 的辅助函数 `ClickHouseValues.convertToSqlExpression`：

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from my_table where name=:name")
        .params(Map.of("name", ClickHouseValues.convertToSqlExpression("Ben's")))
        .executeAndWait()) {
            //...
        }
}
```

在上述示例中，`ClickHouseValues.convertToSqlExpression` 将转义内单引号，并用有效的单引号括起来。

其他类型，例如 `Integer`、`UUID`、`Array` 和 `Enum` 将在 `params` 中自动转换。
:::

## 节点发现 {#node-discovery}

Java 客户端提供自动发现 ClickHouse 节点的能力。自动发现默认情况下是禁用的。要手动启用它，请将 `auto_discovery` 设置为 `true`：

```java
properties.setProperty("auto_discovery", "true");
```

或在连接 URL 中：

```plaintext
jdbc:ch://my-server/system?auto_discovery=true
```

如果启用自动发现，则不必在连接 URL 中指定所有 ClickHouse 节点。URL 中指定的节点将被视为种子，Java 客户端将自动从系统表和/或 clickhouse-keeper 或 zookeeper 发现更多节点。

以下选项负责自动发现配置：

| 属性                     | 默认    | 描述                                                                                              |
|--------------------------|---------|--------------------------------------------------------------------------------------------------|
| auto_discovery           | `false` | 客户端是否应从系统表和/或 clickhouse-keeper/zookeeper 中发现更多节点。                           |
| node_discovery_interval   | `0`     | 节点发现间隔（以毫秒为单位），零或负值表示一次性发现。                                          |
| node_discovery_limit      | `100`   | 一次最大可发现的节点数量；零或负值表示无限制。                                                  |

### 负载均衡 {#load-balancing}

Java 客户端根据负载均衡策略选择要发送请求的 ClickHouse 节点。一般来说，负载均衡策略负责以下内容：

1. 从受管理的节点列表中获取一个节点。
2. 管理节点的状态。
3. 可选地调度后台进程进行节点发现（如果启用了自动发现）并运行健康检查。

以下是配置负载均衡的选项列表：

| 属性                    | 默认                      | 描述                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| load_balancing_policy   | `""`                      | 负载均衡策略可以是以下之一：<li>`firstAlive` - 请求发送到受管理节点列表中的第一个健康节点</li><li>`random` - 请求发送到受管理节点列表中的随机节点</li><li>`roundRobin` - 请求依次发送到受管理节点列表中的每个节点</li><li>完整的类名，实现了 `ClickHouseLoadBalancingPolicy` - 自定义负载均衡策略</li>如果未指定，请求将发送到受管理节点列表中的第一个节点 |
| load_balancing_tags     | `""`                      | 用于过滤节点的负载均衡标签。请求仅发送到具有指定标签的节点                                                                                                                                                                                                                                                                                                                                       |
| health_check_interval   | `0`                       | 健康检查间隔（以毫秒为单位），零或负值表示一次性。                                                                                                                                                                                                                                                                                                                                                   |
| health_check_method     | `ClickHouseHealthCheckMethod.SELECT_ONE` | 健康检查方法。可以是以下之一：<li>`ClickHouseHealthCheckMethod.SELECT_ONE` - 使用 `select 1` 查询进行检查</li><li>`ClickHouseHealthCheckMethod.PING` - 协议特定检查，通常更快</li>                                                                                                                                                                                                 |
| node_check_interval     | `0`                       | 节点检查间隔（以毫秒为单位），负数视为零。如果自上次检查以来已过指定时间，则检查节点状态。<br/>`health_check_interval` 和 `node_check_interval` 之间的区别在于 `health_check_interval` 选项调度了一个后台作业，该作业检查节点的状态（所有或故障节点），但 `node_check_interval` 指定自上次检查以来过去的时间                       |
| check_all_nodes         | `false`                   | 是否对所有节点或仅对故障节点执行健康检查。                                                                                                                                                                                                                                                                                                                                                        |

### 故障转移和重试 {#failover-and-retry}

Java 客户端提供配置选项，用于设置失败查询的故障转移和重试行为：

| 属性                   | 默认      | 描述                                                                                                                                                                                                                      |
|------------------------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| failover               | `0`       | 请求的最大故障转移次数。零或负值表示不进行故障转移。故障转移将失败的请求发送到另一个节点（根据负载均衡策略），以便从故障中恢复。                                                                                  |
| retry                  | `0`       | 请求的最大重试次数。零或负值表示不重试。重试将请求发送到同一节点，仅当 ClickHouse 服务器返回`NETWORK_ERROR` 错误代码时。                                                                                         |
| repeat_on_session_lock | `true`    | 会话锁定时是否重复执行，直到超时（根据 `session_timeout` 或 `connect_timeout`）。如果 ClickHouse 服务器返回`SESSION_IS_LOCKED` 错误代码，则会重复失败请求。                                                        |

### 添加自定义 HTTP 头 {#adding-custom-http-headers}

Java 客户端支持 HTTP/S 传输层，以便在请求中添加自定义 HTTP 头。
我们应该使用 `custom_http_headers` 属性，且头部需要使用 `,` 分隔。头部的键/值应通过 `=` 分隔。

## Java 客户端支持 {#java-client-support}

```java
options.put("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
```

## JDBC 驱动 {#jdbc-driver}

```java
properties.setProperty("custom_http_headers", "X-ClickHouse-Quota=test, X-ClickHouse-Test=test");
