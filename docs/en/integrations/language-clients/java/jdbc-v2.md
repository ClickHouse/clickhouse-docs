---
sidebar_label: JDBC 0.8+
sidebar_position: 4
keywords: [clickhouse, java, jdbc, driver, integrate]
description: ClickHouse JDBC driver
slug: /en/integrations/java/jdbc-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# JDBC Driver

`clickhouse-jdbc` implements the standard JDBC interface using the latest [java client](/docs/en/integrations/language-clients/java/client-v2.md).
We recommend using the latest [java client](/docs/en/integrations/language-clients/java/client-v2.md) directly if performance/direct access is critical.

:::note
If you're looking for a prior version of the JDBC driver docs, please see [here](/docs/en/integrations/language-clients/java/jdbc-v1.md).
:::

## Changes from 0.7.x
In 0.8 we tried to make the driver more strictly follow the JDBC specification, so there are some removed features that may affect you:

| Old Feature                      | Notes                                                                                                                                                                                                                                                                                                           |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Transaction Support              | Early versions of the driver only **simulated** transaction support, which could have unexpected results.                                                                                                                                                                                                       |
| Response Column Renaming         | `ResultSet` was mutable - for efficiency sake they're now read-only                                                                                                                                                                                                                                             |
| Multi-Statement SQL              | Multi-statement support was only **simulated**, now it strictly follows 1:1                                                                                                                                                                                                                                     |
| Named Parameters                 | Not part of the JDBC spec                                                                                                                                                                                                                                                                                       |
| Stream-based `PreparedStatement` | Early version of the driver allowed for non-jdbc usage of `PreparedStatement` - if you desire such options, we recommend looking at the [Java Client](/docs/en/integrations/language-clients/java/client-v2.md) and its [examples](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2). |

:::note
`Date` is stored without timezone, while `DateTime` is stored with timezone. This can lead to unexpected results if you're not careful.
:::

## Environment requirements

- [OpenJDK](https://openjdk.java.net) version >= 8

### Setup

<Tabs groupId="jdbc-base-dependencies">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.8.0</version>
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation("com.clickhouse:clickhouse-jdbc:0.8.0:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
implementation 'com.clickhouse:clickhouse-jdbc:0.8.0:shaded-all'
```

</TabItem>
</Tabs>

## Configuration

**Driver Class**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL Syntax**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`, for example:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true`

**Connection Properties**:

Beyond standard JDBC properties, the driver supports the ClickHouse-specific properties offered by the underlying [java client](/docs/en/integrations/language-clients/java/client-v2.md).
Where possible methods will return an `SQLFeatureNotSupportedException` if the feature is not supported. Other custom properties include:

| Property                         | Default | Description                                                    |
|----------------------------------|---------|----------------------------------------------------------------|
| `disable_frameworks_detection`   | `true`  | Disable frameworks detection for User-Agent                    |
| `jdbc_ignore_unsupported_values` | `false` | Suppresses `SQLFeatureNotSupportedException`                   |
| `clickhouse.jdbc.v1`             | `false` | Use older JDBC implementation instead of new JDBC              |
| `default_query_settings`         | `null`  | Allows passing of default query settings with query operations |

## Supported data types

JDBC Driver supports the same data formats as the underlying [java client](/docs/en/integrations/language-clients/java/client-v2.md).

### Handling Dates, Times, and Timezones
`java.sql.Date`, `java.sql.Time`, and `java.sql.Timestamp` can complicate how Timezones are calculated - though they're of course supported,
you may want to consider using the [java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) package. `ZonedDateTime` and
`OffsetDateTime` are both great replacements for java.sql.Timestamp, java.sql.Date, and java.sql.Time.

## Creating Connection

```java
String url = "jdbc:ch://my-server:8123/system";

Properties properties = new Properties();
DataSource dataSource = new DataSource(url, properties);//DataSource or DriverManager are the main entry points
try (Connection conn = dataSource.getConnection()) {
... // do something with the connection
```

## Supplying Credentials and Settings

```java showLineNumbers
String url = "jdbc:ch://localhost:8123?jdbc_ignore_unsupported_values=true&socket_timeout=10";

Properties info = new Properties();
info.put("user", "default");
info.put("password", "password");
info.put("database", "some_db");

//Creating a connection with DataSource
DataSource dataSource = new DataSource(url, info);
try (Connection conn = dataSource.getConnection()) {
... // do something with the connection
}

//Alternate approach using the DriverManager
try (Connection conn = DriverManager.getConnection(url, info)) {
... // do something with the connection
}
```

## Simple Statement

```java showLineNumbers

try (Connection conn = dataSource.getConnection(...);
    Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("select * from numbers(50000)");
    while(rs.next()) {
        // ...
    }
}
```

## Insert

```java showLineNumbers
try (PreparedStatement ps = conn.prepareStatement("INSERT INTO mytable VALUES (?, ?)")) {
    ps.setString(1, "test"); // id
    ps.setObject(2, LocalDateTime.now()); // timestamp
    ps.addBatch();
    ...
    ps.executeBatch(); // stream everything on-hand into ClickHouse
}
```

## `HikariCP`
    
```java showLineNumbers
// connection pooling won't help much in terms of performance,
// because the underlying implementation has its own pool.
// for example: HttpURLConnection has a pool for sockets
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
        // handle row
        log.info("Integer: {}, String: {}", rs.getInt(1), rs.getString(1));//Same column but different types
    }
}
```

## More Information
For more information, see our [GitHub repository](https://github.com/ClickHouse/clickhouse-java) and [Java Client documentation](/docs/en/integrations/language-clients/java/client-v2.md).


## Troubleshooting
### Logging
The driver uses [slf4j](https://www.slf4j.org/) for logging, and will use the first available implementation on the `classpath`.

### Resolving JDBC Timeout on Large Inserts

When performing large inserts in ClickHouse with long execution times, you may encounter JDBC timeout errors like:

```plaintext
Caused by: java.sql.SQLException: Read timed out, server myHostname [uri=https://hostname.aws.clickhouse.cloud:8443]
```
These errors can disrupt the data insertion process and affect system stability. To address this issue you may need to adjust a few timeout settings in the client's OS.

#### Mac OS

On Mac OS, the following settings can be adjusted to resolve the issue:

- `net.inet.tcp.keepidle`: 60000
- `net.inet.tcp.keepintvl`: 45000
- `net.inet.tcp.keepinit`: 45000
- `net.inet.tcp.keepcnt`: 8
- `net.inet.tcp.always_keepalive`: 1

#### Linux

On Linux, the equivalent settings alone may not resolve the issue. Additional steps are required due to the differences in how Linux handles socket keep-alive settings. Follow these steps:

1. Adjust the following Linux kernel parameters in `/etc/sysctl.conf` or a related configuration file:

    - `net.inet.tcp.keepidle`: 60000
    - `net.inet.tcp.keepintvl`: 45000
    - `net.inet.tcp.keepinit`: 45000
    - `net.inet.tcp.keepcnt`: 8
    - `net.inet.tcp.always_keepalive`: 1
    - `net.ipv4.tcp_keepalive_intvl`: 75
    - `net.ipv4.tcp_keepalive_probes`: 9
    - `net.ipv4.tcp_keepalive_time`: 60 (You may consider lowering this value from the default 300 seconds)

2. After modifying the kernel parameters, apply the changes by running the following command:

```shell
sudo sysctl -p
```

After Setting those settings, you need to ensure that your client enables the Keep Alive option on the socket:

```java
properties.setProperty("socket_keepalive", "true");
```