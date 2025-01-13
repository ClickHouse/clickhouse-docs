---
sidebar_label: JDBC V2
sidebar_position: 4
keywords: [clickhouse, java, jdbc, driver, integrate]
description: ClickHouse JDBC driver V2
slug: /en/integrations/java/jdbc-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# JDBC Driver

`clickhouse-jdbc` implements the standard JDBC interface. Being built on top of [clickhouse-client](/docs/en/integrations/sql-clients/sql-console), it provides additional features like custom type mapping, transaction support, and standard synchronous `UPDATE` and `DELETE` statements, etc., so that it can be easily used with legacy applications and tools.

:::note
    Latest JDBC (0.8.0) version uses Client-V2 by default. 
:::

`clickhouse-jdbc` API is synchronous, and generally, it has more overheads (e.g., SQL parsing and type mapping/conversion, etc.). Consider [client-v2](/docs/en/integrations/language-clients/java/client-v2.md) when performance is critical or if you prefer a more direct way to access ClickHouse.

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
    <!-- use uber jar with all dependencies included, change classifier to http for smaller jar -->
    <classifier>shaded-all</classifier>    
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
// use uber jar with all dependencies included, change classifier to http for smaller jar
implementation("com.clickhouse:clickhouse-jdbc:0.8.0:shaded-all")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc
// use uber jar with all dependencies included, change classifier to http for smaller jar
implementation 'com.clickhouse:clickhouse-jdbc:0.8.0:shaded-all'
```

</TabItem>
</Tabs>

Since version `0.5.0`, we are using Apache HTTP Client that's packed the Client. Since there is not a shared version of the package, you need to add a logger as a dependency.

<Tabs groupId="jdbc-logging-dependency">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/org.slf4j/slf4j-api -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.16</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/org.slf4j/slf4j-api
implementation("org.slf4j:slf4j-api:2.0.16")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/org.slf4j/slf4j-api
implementation 'org.slf4j:slf4j-api:2.0.16'
```

</TabItem>
</Tabs>

## Configuration

**Driver Class**: `com.clickhouse.jdbc.ClickHouseDriver`

**URL Syntax**: `jdbc:(ch|clickhouse)[:<protocol>]://endpoint1[,endpoint2,...][/<database>][?param1=value1&param2=value2][#tag1,tag2,...]`, for example:

- `jdbc:clickhouse:http://localhost:8123`
- `jdbc:clickhouse:https://localhost:8443?ssl=true&sslmode=STRICT`

**Connection Properties**:

Beyond standard JDBC properties, the driver supports the ClickHouse-specific properties offered by the underlying [client](/docs/en/integrations/language-clients/java/client-v2.md).
Where possible methods will return an SQLFeatureNotSupportedException if the feature is not supported. Other custom properties include:

| Property                         | Default | Description                                 |
|----------------------------------|---------|---------------------------------------------|
| `disable_frameworks_detection`   | `true`  | Disable frameworks detection for User-Agent |
| `jdbc_ignore_unsupported_values` | `false` | Suppresses SQLFeatureNotSupportedException  |
| `clickhouse.jdbc.v1`             | `false` | Use JDBC-V1 instead of JDBC-V2              |

## Supported data types

JDBC Driver supports same data formats as the client library does. 

:::note
- AggregatedFunction - :warning: does not support `SELECT * FROM table ...`
- Decimal - `SET output_format_decimal_trailing_zeros=1` in 21.9+ for consistency
- Enum - can be treated as both string and integer
- UInt64 - mapped to `long` (in client-v1) 
:::

## Creating Connection

```java
String url = "jdbc:ch://my-server:8123/system"; // use http protocol

Properties properties = new Properties();

DataSource dataSource = new DataSource(url, properties);
try (Connection conn = dataSource.getConnection("default", "password");
    Statement stmt = conn.createStatement()) {
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

## More Information
For more information, see our [GitHub repository](https://github.com/ClickHouse/clickhouse-java) and [Client-V2 documentation](/docs/en/integrations/language-clients/java/client-v2.md).
```
