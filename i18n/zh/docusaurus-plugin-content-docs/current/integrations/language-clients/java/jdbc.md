---
sidebar_label: 'JDBC 0.8+'
sidebar_position: 4
keywords: ['clickhouse', 'java', 'jdbc', 'driver', 'integrate']
description: 'ClickHouse JDBC driver'
slug: '/integrations/language-clients/java/jdbc'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';



# JDBC 驱动程序 (0.8+)

`clickhouse-jdbc` 实现了标准 JDBC 接口，使用最新的 [java client](/integrations/language-clients/java/client.md)。如果性能/直接访问至关重要，我们建议直接使用最新的 [java client](/integrations/language-clients/java/client.md)。

:::note
如果您正在寻找 JDBC 驱动程序文档的先前版本，请参见 [这里](/integrations/language-clients/java/jdbc-v1.md)。
:::

## 从 0.7.x 的变更 {#changes-from-07x}
在 0.8 版本中，我们尝试使驱动程序更严格地遵循 JDBC 规范，因此有一些删除的功能可能会影响到您：

| 旧功能                          | 说明                                                                                                                                                                                                                                                                                                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 事务支持                        | 驱动程序的早期版本仅 **模拟** 了事务支持，这可能会导致意外结果。                                                                                                                                                                                                                                        |
| 响应列重命名                    | `ResultSet` 是可变的 - 出于效率考虑，它们现在是只读的                                                                                                                                                                                                                                                        |
| 多语句 SQL                     | 多语句支持仅是 **模拟** 的，现在严格遵循 1:1                                                                                                                                                                                                                                                             |
| 命名参数                        | 不是 JDBC 规范的一部分                                                                                                                                                                                                                                                                                  |
| 基于流的 `PreparedStatement`    | 驱动程序的早期版本允许非 JDBC 使用 `PreparedStatement` - 如果您需要此类选项，我们建议查看 [Java Client](/integrations/language-clients/java/client.md) 及其 [示例](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)。 |

:::note
`Date` 不带时区存储，而 `DateTime` 带时区存储。如果不谨慎，这可能会导致意外结果。
:::

## 环境要求 {#environment-requirements}

- [OpenJDK](https://openjdk.java.net) 版本 >= 8

### 设置 {#setup}

<Tabs groupId="jdbc-base-dependencies">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.8.2</version>
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation("com.clickhouse:clickhouse-jdbc:0.8.2:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation 'com.clickhouse:clickhouse-jdbc:0.8.2:shaded-all'
```

</TabItem>
</Tabs>

## 配置 {#configuration}

**驱动类**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL 语法**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`，例如：

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**连接属性**:

除了标准 JDBC 属性外，驱动程序还支持由底层 [java client](/integrations/language-clients/java/client.md) 提供的 ClickHouse 特定属性。如果功能不被支持，尽可能的方法将返回 `SQLFeatureNotSupportedException`。其他自定义属性包括：

| 属性                             | 默认   | 描述                                                      |
|----------------------------------|--------|---------------------------------------------------------|
| `disable_frameworks_detection`    | `true` | 禁用用户代理的框架检测                                   |
| `jdbc_ignore_unsupported_values`  | `false` | 抑制 `SQLFeatureNotSupportedException`                  |
| `clickhouse.jdbc.v1`              | `false` | 使用旧的 JDBC 实现，而不是新的 JDBC                     |
| `default_query_settings`          | `null` | 允许在查询操作中传递默认的查询设置                     |

## 支持的数据类型 {#supported-data-types}

JDBC 驱动程序支持与底层 [java client](/integrations/language-clients/java/client.md) 相同的数据格式。

### 处理日期、时间和时区 {#handling-dates-times-and-timezones}
`java.sql.Date`、`java.sql.Time` 和 `java.sql.Timestamp` 可能会使时区计算复杂 - 尽管它们当然受到支持，您可能希望考虑使用 [java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) 包。`ZonedDateTime` 和 `OffsetDateTime` 都是 `java.sql.Timestamp`、`java.sql.Date` 和 `java.sql.Time` 的极好替代品。

## 创建连接 {#creating-connection}

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties);//DataSource 或 DriverManager 是主要的入口点
try (Connection conn = dataSource.getConnection()) {
... // 使用连接做一些事情
```

## 提供凭证和设置 {#supplying-credentials-and-settings}

```java showLineNumbers
String url = "jdbc:ch://localhost:8123?jdbc_ignore_unsupported_values=true&socket_timeout=10";

Properties info = new Properties();
info.put("user", "default");
info.put("password", "password");
info.put("database", "some_db");

//使用 DataSource 创建连接
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
... // 使用连接做一些事情
}

// 使用 DriverManager 的备用方法
try (Connection conn = DriverManager.getConnection(url, info)) {
... // 使用连接做一些事情
}
```

## 简单语句 {#simple-statement}

```java showLineNumbers

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

## 插入 {#insert}

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("INSERT INTO mytable VALUES (?, ?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch();
    ...
    ps.executeBatch(); // 将所有数据流式传输到 ClickHouse
}
```

## `HikariCP` {#hikaricp}
    
```java showLineNumbers
// 连接池在性能上没有太大帮助，
// 因为底层实现有自己池。
// 例如: HttpURLConnection 有用于套接字的池
HikariConfig poolConfig = new HikariConfig();
poolConfig.setConnectionTimeout(5000L);
poolConfig.setMaximumPoolSize(20);
poolConfig.setMaxLifetime(300_000L);
poolConfig.setDataSource(new ClickHouseDataSource(url, properties));

try (HikariDataSource ds = new HikariDataSource(poolConfig);
     Connection conn = ds.getConnection();
     Statement s = conn.createStatement();
     ResultSet rs = s.executeQuery("SELECT * FROM system.numbers LIMIT 3")) {
    while (rs.next()) {
        // 处理行
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1));//相同的列但不同的类型
    }
}
```

## 更多信息 {#more-information}
有关更多信息，请查看我们的 [GitHub 代码库](https://github.com/ClickHouse/clickhouse-java) 和 [Java Client 文档](/integrations/language-clients/java/client.md)。


## 故障排除 {#troubleshooting}
### 日志记录 {#logging}
该驱动程序使用 [slf4j](https://www.slf4j.org/) 进行日志记录，并将使用 `classpath` 上的第一个可用实现。

### 解决大型插入的 JDBC 超时 {#resolving-jdbc-timeout-on-large-inserts}

在 ClickHouse 中执行长时间的巨大插入时，您可能会遇到类似于以下的 JDBC 超时错误：

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
这些错误可能会中断数据插入过程并影响系统稳定性。为了解决此问题，您可能需要调整客户端操作系统中的一些超时设置。

#### Mac OS {#mac-os}

在 Mac OS 中，可以调整以下设置以解决此问题：

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux {#linux}

在 Linux 中，单独调整等效设置可能无法解决问题。由于 Linux 处理套接字保持活动设置的方式不同，因此需要额外的步骤。请按照以下步骤操作：

1. 在 `/etc/sysctl.conf` 或相关配置文件中调整以下 Linux 内核参数：

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (您可能希望将此值从默认的 300 秒降低)

2. 修改内核参数后，通过运行以下命令应用更改：

```shell
sudo sysctl -p
```

设置这些设置后，您需要确保客户端在套接字上启用保持活动选项：

```java
properties.setProperty("socket_keepalive", "true");
```
