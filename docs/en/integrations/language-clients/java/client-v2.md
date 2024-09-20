---
sidebar_label: Client V2
sidebar_position: 2
keywords: [clickhouse, java, jdbc, client, integrate, r2dbc]
description: Options for connecting to ClickHouse from Java
slug: /en/integrations/java/client-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Java Client (V2)

Implementation of a new API. It uses Apache Http Client to communicate with ClickHouse server. We have selected this http client because it has many built-in features and 
has proven itself in old client implementation. We are planning to support other http client libraries. 

*Note*: Client-V2 is currently in the phase of active development and we are still working on it. 

## Setup

- Maven Central web page: https://mvnrepository.com/artifact/com.clickhouse/client-v2
- Nightly builds repository: https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

<Tabs groupId="client-v2-setup">
<TabItem value="maven" label="Maven" >

```xml 
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>client-v2</artifactId>
    <version>0.6.5</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation("com.clickhouse:client-v2:0.6.5")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation 'com.clickhouse:client-v2:0.6.5'
```

</TabItem>
</Tabs>

## Initialization

Client object is initialized by `com.clickhouse.client.api.Client.Builder#build()`. Each client has own context and no objects are shared between them.
Builder has configuration method for convinient setup. 

Example: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build;
```

`Client` is `AutoCloseable` and should be closed when not needed anymore. 

## Configuration 

All settings are defined by instance methods (a.k.a configuration methods) that make scope and context of each value clear. 
Major configuration parameters are defined in one scope (client or operation) and do not override each other. Handling 
configuration overriding across is a very hard task so we doing our best to keep it simple. 

This section describes only client wide settings. Each operation may have own and will be listed in the their sections. 


## Insert API

| Method                                                             | Description |
|--------------------------------------------------------------------|-------------|
| `CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)` | Sends write request to database. Input data is read from the input stream. |
| `CompletableFuture<InsertResponse> insert(String tableName, List<?> data, InsertSettings settings)` | Sends write request to database. List of objects is converted into a most effective format and then is sent to a server. Class of the list items should be registed up-front using `register(Class, TableSchema)` method.

There is no much difference in performance between raw data insert and POJO list insert. The last one helps to avoid 
coding complex serialization into RowBinary format - client will handle it for you.   

```java showLineNumbers
// Important step (done once) - register class to pre-compile object serializer according to the table schema. 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));


List<ArtivleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // handle response, then it will be closed and connection that served request will be released. 
}
```

If data is already in the format that ClickHouse accepts, then: 
```java showLineNumbers
try (InputStream dataStream = getDataStream()) {
    try (InsertResponse response = client.insert(TABLE_NAME, dataStream, ClickHouseFormat.JSONEachRow,
            insertSettings).get(3, TimeUnit.SECONDS)) {

        log.info("Insert finished: {} rows written", response.getMetrics().getMetric(ServerMetrics.NUM_ROWS_WRITTEN).getLong());
    } catch (Exception e) {
        log.error("Failed to write JSONEachRow data", e);
        throw new RuntimeException(e);
    }
}

```

### Query API

| Method                                                             | Description |
|--------------------------------------------------------------------|-------------|
| `CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)` | Sends `sqlQuery` as is. Response format is set by query settings. `QueryResponse` will hold a reference to the response stream what should be consumer by a reader for supportig format | 
| `CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)` | Sends `sqlQuery` as is. Additionally will send query parameter so server can comple SQL expression. | 
| `ClickHouseBinaryFormatReader newBinaryFormatReader(QueryResponse response, TableSchema schema)` | Creates a reader for `RowBinary*` and `Native*`. Table schema is required for `RowBinaryWithNames` and `RowBinary` formats. 'Native' and `RowBinaryWithNamesAndTypes` has the schema within data stream. |
| `List<GenericRecord> queryAll(String sqlQuery)` | Queries a data in `RowBinaryWithNamesAndTypes` format. Returns result as a collection. Read performance is the same as with reader but more memory required at a time to keep whole dataset. |

**QuerySettings**

| Configuration Method                       | Default Value | Description | 
|--------------------------------------------|---------------|-------------|
| `QuerySettings setQueryId(String queryId)` |               | Sets query ID that will be assigned to the operation | 
| `QuerySettings setFormat(ClickHouseFormat format)` | `RowBinaryWithNamesAndTypes` | Sets response format. See `RowBinaryWithNamesAndTypes` for the full list. |
| `QuerySettings setMaxExecutionTime(Integer maxExecutionTime)` |        | Sets operation execution time on server. Will not affect read timeout. | 
| `QuerySettings waitEndOfQuery(Boolean waitEndOfQuery)` | `false` | Requests the server to wait for the and of the query before sending response. | 
| `QuerySettings setUseServerTimeZone(Boolean useServerTimeZone)` | `true` | Server timezone (see client config) will be used to parse date/time types in the result of an operation. |
| `QuerySettings setUseTimeZone(String timeZone)` |    | Requests server to use `timeZone` for time conversion. See (`session_timezone`)[https://clickhouse.com/docs/en/operations/settings/settings#session_timezone] |



### Examples 

- Example code is available in [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)
- Reference Spring Service [implementation](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)