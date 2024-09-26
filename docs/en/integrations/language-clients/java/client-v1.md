---
sidebar_label: Client V1
sidebar_position: 3
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouse Connector v1
slug: /en/integrations/java/client-v1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Client (V1)

Current client implementation. Is uses Apache Http Client by default and supports JDK built-in http clients aswell. 

*Note*: this component will be deprecated soon. 

## Setup

<Tabs groupId="client-v1-setup">
<TabItem value="maven" label="Maven" >

```xml 
<!-- https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client -->
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-http-client</artifactId>
    <version>0.6.5</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation("com.clickhouse:clickhouse-http-client:0.6.5")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client
implementation 'com.clickhouse:clickhouse-http-client:0.6.5'
```

</TabItem>
</Tabs>

Since version `0.5.0`, the driver uses a new client http library that needs to be added as a dependency.


<Tabs groupId="client-v1-http-client">
<TabItem value="maven" label="Maven" >

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

## Initialization

Connection URL Format: `protocol://host[:port][/database][?param[=value][&param[=value]][#tag[,tag]]`, for example:

- `http://localhost:8443?ssl=true&sslmode=NONE`
- `https://(https://explorer@play.clickhouse.com:443`

Connect to a single node:

```java showLineNumbers
ClickHouseNode server = ClickHouseNode.of("http://localhost:8123/default?compress=0");
```
Connect to a cluster with multiple nodes:

```java showLineNumbers
ClickHouseNodes servers = ClickHouseNodes.of(
    "jdbc:ch:http://server1.domain,server2.domain,server3.domain/my_db"
    + "?load_balancing_policy=random&health_check_interval=5000&failover=2");
```

## Query API

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

## Streaming Query API 

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers)
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("select * from numbers limit :limit")
        .params(1000)
        .executeAndWait()) {
            for (ClickHouseRecord r : response.records()) {
            int num = r.getValue(0).asInteger();
            // type conversion
            String str = r.getValue(0).asString();
            LocalDate date = r.getValue(0).asDate();
        }
}
```

## Insert API

```java showLineNumbers
try (ClickHouseClient client = ClickHouseClient.newInstance(ClickHouseProtocol.HTTP);
     ClickHouseResponse response = client.read(servers).write()
        .format(ClickHouseFormat.RowBinaryWithNamesAndTypes)
        .query("insert into my_table select c2, c3 from input('c1 UInt8, c2 String, c3 Int32')")
        .data(myInputStream) // load data into a table and wait until it's completed
        .executeAndWait()) {
            ClickHouseResponseSummary summary = response.getSummary();
            summary.getWrittenRows();
}
```

## Features
### Compression

The client will by default use LZ4 compression, which requires this dependency:

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


You can choose to use gzip instead by setting `compress_algorithm=gzip` in the connection URL.

Alternatively, you can disable compression a few ways.

1. Disable by setting `compress=0` in the connection URL: `http://localhost:8123/default?compress=0`
2. Disable via the client configuration:

```java showLineNumbers
ClickHouseClient client = ClickHouseClient.builder()
   .config(new ClickHouseConfig(Map.of(ClickHouseClientOption.COMPRESS, false)))
   .nodeSelector(ClickHouseNodeSelector.of(ClickHouseProtocol.HTTP))
   .build();
```

See the [compression documentation](/en/native-protocol/compression) to learn more about different compression options.

### Multiple queries

Execute multiple queries in a worker thread one after another within same session:

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

### Named Parameters

You can pass parameters by name rather than relying solely on their position in the parameter list. This capability is available using `params` function.

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

:::note Parameters
All `params` signatures involving `String` type (`String`, `String[]`, `Map<String, String>`) assume the keys being passed are valid ClickHouse SQL strings. For instance:

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

If you prefer not to parse String objects to ClickHouse SQL manually, you can use the helper function `ClickHouseValues.convertToSqlExpression` located at `com.clickhouse.data`:

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

In the example above, `ClickHouseValues.convertToSqlExpression` will escape the inner single quote, and surround the variable with a valid single quotes.

Other types, such as `Integer`, `UUID`, `Array` and `Enum` will be converted automatically inside `params`.
:::
