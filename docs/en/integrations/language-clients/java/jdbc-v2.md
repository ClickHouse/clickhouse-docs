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

`clickhouse-jdbc` implements the standard JDBC interface using [client-v2](/docs/en/integrations/language-clients/java/client-v2.md).
We recommend using [client-v2](/docs/en/integrations/language-clients/java/client-v2.md) directly if performance/direct access is critical.

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

Beyond standard JDBC properties, the driver supports the ClickHouse-specific properties offered by the underlying [client](/docs/en/integrations/language-clients/java/client-v2.md).
Where possible methods will return an `SQLFeatureNotSupportedException` if the feature is not supported. Other custom properties include:

| Property                         | Default | Description                                                    |
|----------------------------------|---------|----------------------------------------------------------------|
| `disable_frameworks_detection`   | `true`  | Disable frameworks detection for User-Agent                    |
| `jdbc_ignore_unsupported_values` | `false` | Suppresses SQLFeatureNotSupportedException                     |
| `clickhouse.jdbc.v1`             | `false` | Use JDBC-V1 instead of JDBC-V2                                 |
| `default_query_settings`         | `null`  | Allows passing of default query settings with query operations |

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
## Migrating from 0.7.x
In general we tried to make the driver more strictly follow the JDBC specification, so there are some changes that may affect you:

| Old Feature                     | Notes                                                                                                                                                                                                     |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Transaction Support             | Early versions of the driver only **simulated** transaction support, which could have unexpected results.                                                                                                 |
| Response Column Renaming        | ResultSets were read/write - for efficiency sake they're now read-only                                                                                                                                    |
| Multi-Statement SQL             | Statements would split multi-statements and execute, now it strictly follows 1:1                                                                                                                          |
| Named Parameters                |                                                                                                                                                                                                           |
| Stream-based PreparedStatements | Early version of the driver allowed for non-jdbc usage of PreparedStatements - if you desire such options, we recommend looking to [Client-V2](/docs/en/integrations/language-clients/java/client-v2.md). |



## More Information
For more information, see our [GitHub repository](https://github.com/ClickHouse/clickhouse-java) and [Client-V2 documentation](/docs/en/integrations/language-clients/java/client-v2.md).
```