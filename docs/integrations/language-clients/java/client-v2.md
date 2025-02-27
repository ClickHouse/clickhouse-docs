---
sidebar_label: Client 0.8+
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouse Connector 0.8+
slug: /integrations/java/client-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java Client (V2)

Java client library to communicate with a DB server through its protocols. The current implementation only supports the [HTTP interface](/interfaces/http). 
The library provides its own API to send requests to a server. The library also provides tools to work with different binary data formats (RowBinary* & Native*).  

:::note
If you're looking for a prior version of the java client docs, please see [here](/integrations/language-clients/java/client-v1.md).
:::

## Setup {#setup}

- Maven Central (project web page): https://mvnrepository.com/artifact/com.clickhouse/client-v2
- Nightly builds (repository link): https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

<Tabs groupId="client-v2-setup">
<TabItem value="maven" label="Maven" >

```xml 
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>client-v2</artifactId>
    <version>0.7.2</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation("com.clickhouse:client-v2:0.7.2")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation 'com.clickhouse:client-v2:0.7.2'
```

</TabItem>
</Tabs>

## Initialization {#initialization}

The Client object is initialized by `com.clickhouse.client.api.Client.Builder#build()`. Each client has its own context and no objects are shared between them.
The Builder has configuration methods for convenient setup. 

Example: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client` is `AutoCloseable` and should be closed when not needed anymore.

### Authentication {#authentication}

Authentication is configured per client at the initialization phase. There are three authentication methods supported: by password, by access token, by SSL Client Certificate. 

Authentication by a password requires setting user name password by calling `setUsername(String)` and `setPassword(String)`: 
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

Authentication by an access token requires setting access token by calling `setAccessToken(String)`:
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

Authentication by a SSL Client Certificate require setting username, enabling SSL Authentication, setting a client sertificate and a client key by calling `setUsername(String)`,  `useSSLAuthentication(boolean)`, `setClientCertificate(String)` and `setClientKey(String)` accordingly: 
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
SSL Authentication may be hard to troubleshoot on production because many errors from SSL libraries provide not enough information. For example, if client certificate and key do not match then server will terminate connection immediately (in case of HTTP it will be connection initiation stage where no HTTP requests are send so no response is sent).

Please use tools like [openssl](https://docs.openssl.org/master/man1/openssl/) to verify certificates and keys: 
- check key integrity: `openssl rsa -in [key-file.key] -check -noout`
- check client certificate has matching CN for a user:
    - get CN from an user certificate - `openssl x509 -noout -subject -in [user.cert]`
    - verify same value is set in database `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'` (query will output `auth_params` with something like ` {"common_names":["some_user"]}`) 

:::


## Writing Data
This sections describes common scenarios of writing data to ClickHouse. Client has different API methods for different use cases:
- `insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)` - should be used to write data in a text format. Input stream defined by `data` will compressed according to the settings. Data encoding is done by an application.
- `insert(String tableName, List<?> data, InsertSettings settings)` - should be used to write a list of POJOs (or DTOs). Client will encode data as RowBinary and will handle serialization according to a tabele schema of the table "tableName". Stream will be compressed according to the settings. Can be used for a big datasets. 
- `insert(String tableName, DataStreamWriter writer, ClickHouseFormat format, InsertSettings settings)` - more advanced version of the first API method. This one accepts a functional interface implementation that can control how data is written to server. This method is useful when transcoding data into a byte stream not wanted or to organize reading data from a queue. This methods allows to use application compression when data is already compresses, for example, as LZ4 frames. However there are some limitations.

Speed of write operation, first of all, defined by how fast server processes data. It can be slow if data requires a lot of parsing. Therefore operation performance affected much by data format. Please read our blog [post](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) about input formats. Client uses RowBinary by default but user may choose more suitable format for her data. 
Configuration is the next stop where performance can be improved. Client builder method `setClientNetworkBufferSize(int size)` should be used to configure size of a buffer that stands between socket and client. This is important configuration because defines how many socket IO operation will be done to send data. When size of this buffer is too small it causes many calls to OS what is potential bottle-neck. When size of this buffer is too big compare to socket buffers, system performance and available memory it will cause slowness because copying data from heap to OS buffer is very expensive operations. Big size of the buffer means more memory needed per request, too. 


## Reading Data
This sections describes common scenarios of reading data from ClickHouse. Client has different API method for different use cases: 
- `query(String sqlQuery, QuerySettings settings)` and `query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)` - base methods for most query requests. This pair of method accept raw SQL query and return response object with raw input stream of bytes. This method should be used for big queries because access to raw byte stream allows to use most performant way of reading data. Main benefits of these methods - they allows to streamline reading of data and avoid allocating a lot of memory.    
- `queryAll(String sqlQuery, QuerySettings settings)` and `queryAll(String sqlQuery, Map<String, Object> params, QuerySettings settings)` - methods are designed to simplify fetching small amount of data in way of iterable collection or records. These methods should be used only to fetch small number of rows. These methods read result from a server fully. It may because significant peak of memory usage especially in high concurrent applications. 
- `queryAll(String sqlQuery, Class<T> clazz, TableSchema schema, Supplier<T> allocator)` is for reading result set directly to a plain java objects (DTOs). Method is suitable for any size of a result. Method uses precompiled serializers to minimize operations overhead. Method doesn't hold connection after reading. 

Data can be fetched in any output format that ClickHouse support. Client will try to use RowBinaryWithNamesAndTypes by default because this format has metadata definition at the header lines and it more compact for network transfer. 
As we mentioned in "Writing Data" section, there is client builder method `setClientNetworkBufferSize(int size)` that works for read in the same ways as for writes. 

## Configuration {#configuration}

All settings are defined by instance methods (a.k.a configuration methods) that make the scope and context of each value clear. 
Major configuration parameters are defined in one scope (client or operation) and do not override each other.

Configuration is defined during client creation. See `com.clickhouse.client.api.Client.Builder`.

## Client Configuration {#client-configuration}

| Configuration Method                  | Arguments                                      |  Description                                |
|---------------------------------------|:-----------------------------------------------|:--------------------------------------------|
| `addEndpoint(String endpoint)`          | - `enpoint` - URL formatted a server address.      | Adds a server endpoint to list of available servers. Currently only one endpoint is supported. |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - connection protocol `com.clickhouse.client.api.enums.Protocol#HTTP`.<br />- `host` - IP or hostname of a server.<br />- `secure` - if communication should use secure version of the protocol (HTTPS) | Adds a server endpoint to list of available servers. Currently only one endpoint is supported. |
| `setOption(String key, String value)`   | - `key` - String key of the client configuration option.<br /> - `value` - String value of the option | Sets raw value of client options. Useful when reading configuration from properties files. | 
| `setUsername(String username)`          | - `username` - User's username to use while authentication | Sets username for an authentication method that is selected by further configuration | 
| `setPassword(String password)`          | - `password` - secret value for password authentication | Sets a secret for password authentication and effectively selects as authentication method |
| `setAccessToken(String accessToken)`    | - `accessToken` - String representation of an access token | Sets an access token to authenticate with a sets corresponding authentication method |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - flag that indicates if SSL auth should be used | Sets SSL Client Certificate as an authentication method | 
| `enableConnectionPool(boolean enable)`  | - `enable` - flag that indicates if the option should be enabled | Sets if a connection pool is enabled | 
| `setConnectTimeout(long timeout, ChronoUnit unit)` | - `timeout` - timeout in some time unit.<br /> - `unit` - time unit of the `timeout` | Sets connection initiation timeout  for any outgoing connection. This affects time wait on getting socket connect. |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - timeout in some time unit.<br /> - `unit` - time unit of the `timeout` | Sets connection request timeout. This take effect only for getting connection from a pool. | 
| `setMaxConnections(int maxConnections)` | - `maxConnections` - number of connections | Sets how many connections can a client open to each server endpoint. | 
| `setConnectionTTL(long timeout, ChronoUnit unit)` | - `timeout` - timeout in some time unit.<br /> - `unit` - time unit of the `timeout` | Sets connection TTL after which connection will be considered as not active |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - timeout in some time unit.<br /> - `unit` - time unit of the `timeout` | Sets HTTP connection keep-alive timeout. This option may be used to disable Keep-Alive by setting timeout to zero - `0` |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - enum `com.clickhouse.client.api.ConnectionReuseStrategy` constant | Selects which strategy connection pool should use: `LIFO` if connection should be reused as soon as they are returned to a pool or `FIFO` to use connection in the order they become available (returned connection are not used immediately). |
| `setSocketTimeout(long timeout, ChronoUnit unit`)` | - `timeout` - timeout in some time unit.<br /> - `unit` - time unit of the `timeout` | Sets socket timeout that affects read and write operations | 
| `setSocketRcvbuf(long size)` | - `size` - size in bytes | Sets TCP socket receive buffer. This buffer out of the JVM memory. |
| `setSocketSndbuf(long size)` | - `size` - size in bytes | Sets TCP socket receive buffer. This buffer out of the JVM memory. |
| `setSocketKeepAlive(boolean value)` | - `value` - flag that indicates if option should be enabled. | Sets option `SO_KEEPALIVE` for every TCP socket created by the client. TCP Keep Alive enables mechanism that will check liveness of the connection and will help to detect abruptly terminated ones. | 
| `setSocketTcpNodelay(boolean value)` | - `value` - flag that indicates if option should be enabled. | Sets option `SO_NODELAY` for every TCP socket created by the client. This TCP option will make socket to push data as soon as possible. |
| `setSocketLinger(int secondsToWait)` | - `secondsToWait` - number of seconds. | Set linger time for every TCP socket created by the client. |
| `compressServerResponse(boolean enabled)` | - `enabled` - flag that indicates if the option should be enabled | Sets if server should compress its responses. | 
| `compressClientRequest(boolean enabled)` | - `enabled` - flag that indicates if the option should be enabled | Sets if client should compress its requests. |
| `useHttpCompression(boolean enabled)` | - `enabled` - flag that indicates if the option should be enabled | Sets if HTTP compression should be used for client/server communications if corresponding options are enabled | 
| `setLZ4UncompressedBufferSize(int size)` | - `size` - size in bytes | Sets size of a buffer that will receive uncompressed portion of a data stream. If buffer is underestimated - a new one will be created and corresponding warning will be present in logs. | 
| `setDefaultDatabase(String database)` | - `database` - name of a database | Sets default database. |
| `addProxy(ProxyType type, String host, int port)` | - `type` - proxy type.<br /> - `host` - proxy host name or IP Address.<br /> - `port` - proxy port | Sets proxy to be used for communication with a server. Setting proxy is required if proxy requires authentication. |
| `setProxyCredentials(String user, String pass)` | - `user` - proxy username.<br /> - `pass` - password | Sets user credentials to authenticate with a proxy. |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - timeout in some time unit.<br /> - `timeUnit` - time unit of the `timeout` | Sets maximum execution timeout for queries |
| `setHttpCookiesEnabled(boolean enabled)` | `enabled` - flag that indicates if the option should be enabled | Set if HTTP cookies should be remembered and sent to server back. |
| `setSSLTrustStore(String path)` | `path` - file path on local (client side) system | Sets if client should use SSL truststore for server host validation. | 
| `setSSLTrustStorePassword(String password)` | `password` - secret value | Sets password to be used to unlock SSL truststore specified by `setSSLTrustStore(String path)` |
| `setSSLTrustStoreType(String type)` | `type` - truststore type name | Sets type of the truststore specified by `setSSLTrustStore(String path)`. | 
| `setRootCertificate(String path)` | `path` - file path on local (client side) system | Sets if client should use specified root (CA) certificate for server host to validation. |
| `setClientCertificate(String path)` | `path` - file path on local (client side) system | Sets client certificate path to be used while initiating SSL connection and to be used by SSL authentication |
| `setClientKey(String path)` | `path` - file path on local (client side) system | Sets client private key to be used for encrypting SSL communication with a server. |
| `useServerTimeZone(boolean useServerTimeZone)` | `useServerTimeZone` - flag that indicates if the option should be enabled | Sets if client should use server timezone when decoding DateTime and Date column values. If enabled then server timezone should be set by `setServerTimeZone(String timeZone)` | 
| `useTimeZone(String timeZone)` | `timeZone` - string value of java valid timezone ID (see `java.time.ZoneId`) | Sets if specified timezone should be used when decoding DateTime and Date column values. Will override server timezone |
| `setServerTimeZone(String timeZone)` |  `timeZone` - string value of java valid timezone ID (see `java.time.ZoneId`) | Sets server side timezone. UTC timezone will be used by default. | 
| `useAsyncRequests(boolean async)` | `async` - flag that indicates if the option should be enabled. | Sets if client should execute request in a separate thread. Disabled by default because application knows better how to organize multi-threaded tasks and running tasks in separate thread do not help with performance. | 
| `setSharedOperationExecutor(ExecutorService executorService)` | `executorService` - instance of executor service. | Sets executor service for operation tasks. | 
| `setClientNetworkBufferSize(int size)` | - `size` - size in bytes | Sets size of a buffer in application memory space that is used to copy data back-and-forth between socket and application. Greater reduces system calls to TCP stack, but affects how much memory is spent on every connection. This buffer is also subject for GC because connections are shortlive. Also keep in mind that allocating big continious block of memory might be a problem. Default is `300,000` bytes. |
| `retryOnFailures(ClientFaultCause ...causes)` | - `causes` - enum constant of `com.clickhouse.client.api.ClientFaultCause` | Sets recoverable/retriable fault types. | 
| `setMaxRetries(int maxRetries)` | - `maxRetries` - number of retries | Sets maximum number of retries for failures defined by `retryOnFailures(ClientFaultCause ...causes)` | 
| `allowBinaryReaderToReuseBuffers(boolean reuse)` | - `reuse` - flag that indicates if the option should be enabled | Most datasets contain numeric data encoded as small byte sequences. By default reader will allocate required buffer, read data into it and then transform into a target Number class. That may cause significant GC preasure because of many small objects are being allocated and released. If this option is enabled then reader will use preallocated buffers to do numbers transcoding. It is safe because each reader has own set of buffers and readers are used by one thread. |
| `httpHeader(String key, String value)` | - `key` - HTTP header key.<br /> - `value` - string value of the header. | Sets value for a single HTTP header. Previous value is overridden.|
| `httpHeader(String key, Collection values)` | - `key` - HTTP header key.<br /> - `values` - list of string values. | Sets values for a single HTTP header. Previous value is overridden.|
| `httpHeaders(Map headers)` | - `header` - map with HTTP headers and their values. | Sets multiple HTTP header values at a time. |
| `serverSetting(String name, String value)` | - `name` - name of a query level setting.<br /> - `value` - string value of the setting. | Sets what settings to pass to server along with each query. Individual operation settings may override it. The [List of settings](/operations/settings/query-level) | 
| `serverSetting(String name,  Collection values)` | - `name` - name of a query level setting.<br /> - `values` - string values of the setting. |Sets what settings to pass to server along with each query. Individual operation settings may override it. The [List of settings](/operations/settings/query-level). This method is useful to set settings with multiple values, for example [roles](/interfaces/http#setting-role-with-query-parameters) |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - implementation of a column-field matching strategy | Sets custom strategy to be used for matching DTO class fields and DB columns when registering DTO. | 
| `useHTTPBasicAuth(boolean useBasicAuth)` | - `useBasicAuth` - flag that indicates if the option should be enabled | Sets if basic HTTP authentication should be used for user-password authentication. Default is enabled. Using this type of authentication resolves issues with passwords containing special characters that cannot be transferred over HTTP headers. |
| `setClientName(String clientName)` | - `clientName` - a string representing application name | Sets additional information about calling application. This string will be passed to server as a client name. In case of HTTP protocol it will be passed as a `User-Agent` header. |
| `useBearerTokenAuth(String bearerToken)` | - `bearerToken` - an encoded bearer token |  Specifies whether to use Bearer Authentication and what token to use. The token will be sent as is, so it should be encoded before passing to this method. |

## Common Definitions {#common-definitions}

### ClickHouseFormat {#clickhouseformat}

Enum of [supported formats](/interfaces/formats). It includes all formats that ClickHouse supports. 

* `raw` - user should transcode raw data 
* `full` - the client can transcode data by itself and accepts a raw data stream
* `-` - operation not supported by ClickHouse for this format

This client version supports:

| Format                                                                                                                        | Input  | Output  |
|-------------------------------------------------------------------------------------------------------------------------------|:------:|:-------:|
| [TabSeparated](/interfaces/formats#tabseparated)                                                                      | raw    | raw     |
| [TabSeparatedRaw](/interfaces/formats#tabseparatedraw)                                                                | raw    | raw     |
| [TabSeparatedWithNames](/interfaces/formats#tabseparatedwithnames)                                                    | raw    | raw     |
| [TabSeparatedWithNamesAndTypes](/interfaces/formats#tabseparatedwithnamesandtypes)                                    | raw    | raw     |
| [TabSeparatedRawWithNames](/interfaces/formats#tabseparatedrawwithnames)                                              | raw    | raw     |
| [TabSeparatedRawWithNamesAndTypes](/interfaces/formats#tabseparatedrawwithnamesandtypes)                              | raw    | raw     |
| [Template](/interfaces/formats#format-template)                                                                       | raw    | raw     |
| [TemplateIgnoreSpaces](/interfaces/formats#templateignorespaces)                                                      | raw    |  -      |
| [CSV](/interfaces/formats#csv)                                                                                        | raw    | raw     |
| [CSVWithNames](/interfaces/formats#csvwithnames)                                                                      | raw    | raw     |
| [CSVWithNamesAndTypes](/interfaces/formats#csvwithnamesandtypes)                                                      | raw    | raw     |
| [CustomSeparated](/interfaces/formats#format-customseparated)                                                         | raw    | raw     |
| [CustomSeparatedWithNames](/interfaces/formats#customseparatedwithnames)                                              | raw    | raw     |
| [CustomSeparatedWithNamesAndTypes](/interfaces/formats#customseparatedwithnamesandtypes)                              | raw    | raw     |
| [SQLInsert](/interfaces/formats#sqlinsert)                                                                            | -      | raw     |
| [Values](/interfaces/formats#data-format-values)                                                                      | raw    | raw     |
| [Vertical](/interfaces/formats#vertical)                                                                              | -      | raw     |
| [JSON](/interfaces/formats#json)                                                                                      | raw    | raw     |
| [JSONAsString](/interfaces/formats#jsonasstring)                                                                      | raw    | -       |
| [JSONAsObject](/interfaces/formats#jsonasobject)                                                                      | raw    | -       |
| [JSONStrings](/interfaces/formats#jsonstrings)                                                                        | raw    | raw     |
| [JSONColumns](/interfaces/formats#jsoncolumns)                                                                        | raw    | raw     |
| [JSONColumnsWithMetadata](/interfaces/formats#jsoncolumnsmonoblock)                                                   | raw    | raw     |
| [JSONCompact](/interfaces/formats#jsoncompact)                                                                        | raw    | raw     |
| [JSONCompactStrings](/interfaces/formats#jsoncompactstrings)                                                          | -      | raw     |
| [JSONCompactColumns](/interfaces/formats#jsoncompactcolumns)                                                          | raw    | raw     |
| [JSONEachRow](/interfaces/formats#jsoneachrow)                                                                        | raw    | raw     |
| [PrettyJSONEachRow](/interfaces/formats#prettyjsoneachrow)                                                            | -      | raw     |
| [JSONEachRowWithProgress](/interfaces/formats#jsoneachrowwithprogress)                                                | -      | raw     |
| [JSONStringsEachRow](/interfaces/formats#jsonstringseachrow)                                                          | raw    | raw     |
| [JSONStringsEachRowWithProgress](/interfaces/formats#jsonstringseachrowwithprogress)                                  | -      | raw     |
| [JSONCompactEachRow](/interfaces/formats#jsoncompacteachrow)                                                          | raw    | raw     |
| [JSONCompactEachRowWithNames](/interfaces/formats#jsoncompacteachrowwithnames)                                        | raw    | raw     |
| [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats#jsoncompacteachrowwithnamesandtypes)                        | raw    | raw     |
| [JSONCompactStringsEachRow](/interfaces/formats#jsoncompactstringseachrow)                                            | raw    | raw     |
| [JSONCompactStringsEachRowWithNames](/interfaces/formats#jsoncompactstringseachrowwithnames)                          | raw    | raw     |
| [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats#jsoncompactstringseachrowwithnamesandtypes)          | raw    | raw     |
| [JSONObjectEachRow](/interfaces/formats#jsonobjecteachrow)                                                            | raw    | raw     |
| [BSONEachRow](/interfaces/formats#bsoneachrow)                                                                        | raw    | raw     |
| [TSKV](/interfaces/formats#tskv)                                                                                      | raw    | raw     |
| [Pretty](/interfaces/formats#pretty)                                                                                  | -      | raw     |
| [PrettyNoEscapes](/interfaces/formats#prettynoescapes)                                                                | -      | raw     |
| [PrettyMonoBlock](/interfaces/formats#prettymonoblock)                                                                | -      | raw     |
| [PrettyNoEscapesMonoBlock](/interfaces/formats#prettynoescapesmonoblock)                                              | -      | raw     |
| [PrettyCompact](/interfaces/formats#prettycompact)                                                                    | -      | raw     |
| [PrettyCompactNoEscapes](/interfaces/formats#prettycompactnoescapes)                                                  | -      | raw     |
| [PrettyCompactMonoBlock](/interfaces/formats#prettycompactmonoblock)                                                  | -      | raw     |
| [PrettyCompactNoEscapesMonoBlock](/interfaces/formats#prettycompactnoescapesmonoblock)                                | -      | raw     |
| [PrettySpace](/interfaces/formats#prettyspace)                                                                        | -      | raw     |
| [PrettySpaceNoEscapes](/interfaces/formats#prettyspacenoescapes)                                                      | -      | raw     |
| [PrettySpaceMonoBlock](/interfaces/formats#prettyspacemonoblock)                                                      | -      | raw     |
| [PrettySpaceNoEscapesMonoBlock](/interfaces/formats#prettyspacenoescapesmonoblock)                                    | -      | raw     |
| [Prometheus](/interfaces/formats#prometheus)                                                                          | -      | raw     |
| [Protobuf](/interfaces/formats#protobuf)                                                                              | raw    | raw     |
| [ProtobufSingle](/interfaces/formats#protobufsingle)                                                                  | raw    | raw     |
| [ProtobufList](/interfaces/formats#protobuflist)								                                        | raw    | raw     |
| [Avro](/interfaces/formats#data-format-avro)                                                                          | raw    | raw     |
| [AvroConfluent](/interfaces/formats#data-format-avro-confluent)                                                       | raw    | -       |
| [Parquet](/interfaces/formats#data-format-parquet)                                                                    | raw    | raw     |
| [ParquetMetadata](/interfaces/formats#data-format-parquet-metadata)                                                   | raw    | -       |
| [Arrow](/interfaces/formats#data-format-arrow)                                                                        | raw    | raw     |
| [ArrowStream](/interfaces/formats#data-format-arrow-stream)                                                           | raw    | raw     |
| [ORC](/interfaces/formats#data-format-orc)                                                                            | raw    | raw     |
| [One](/interfaces/formats#data-format-one)                                                                            | raw    | -       |
| [Npy](/interfaces/formats#data-format-npy)                                                                            | raw    | raw     |
| [RowBinary](/interfaces/formats#rowbinary)                                                                            | full   | full    |
| [RowBinaryWithNames](/interfaces/formats#rowbinarywithnamesandtypes)                                                  | full   | full    |
| [RowBinaryWithNamesAndTypes](/interfaces/formats#rowbinarywithnamesandtypes)                                          | full   | full    |
| [RowBinaryWithDefaults](/interfaces/formats#rowbinarywithdefaults)                                                    | full   | -       |
| [Native](/interfaces/formats#native)                                                                                  | full   | raw     |
| [Null](/interfaces/formats#null)                                                                                      | -      | raw     |
| [XML](/interfaces/formats#xml)                                                                                        | -      | raw     |
| [CapnProto](/interfaces/formats#capnproto)                                                                            | raw    | raw     |
| [LineAsString](/interfaces/formats#lineasstring)                                                                      | raw    | raw     |
| [Regexp](/interfaces/formats#data-format-regexp)                                                                      | raw    | -       |
| [RawBLOB](/interfaces/formats#rawblob)                                                                                | raw    | raw     |
| [MsgPack](/interfaces/formats#msgpack)                                                                                | raw    | raw     |
| [MySQLDump](/interfaces/formats#mysqldump)                                                                            | raw    | -       |
| [DWARF](/interfaces/formats#dwarf)                                                                                    | raw    | -       |
| [Markdown](/interfaces/formats#markdown)                                                                              | -      | raw     |
| [Form](/interfaces/formats#form)                                                                                      | raw    | -       |


## Insert API {#insert-api}

### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

Accepts data as an `InputStream` of bytes in the specified format. It is expected that `data` is encoded in the `format`.

**Signatures**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**Parameters**

`tableName` - a target table name.

`data` - an input stream of an encoded data.

`format` - a format in which the data is encoded.

`settings` - request settings.

**Return value**

Future of `InsertResponse` type - result of the operation and additional information like server side metrics.

**Examples**

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

### insert(String tableName, List&lt;?> data, InsertSettings settings) {#insertstring-tablename-listlt-data-insertsettings-settings}

Sends a write request to database. The list of objects is converted into an efficient format and then is sent to a server. The class of the list items should be registed up-front using `register(Class, TableSchema)` method.

**Signatures**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**Parameters**

`tableName` - name of the target table. 

`data` - collection DTO (Data Transfer Object) objects.

`settings` - request settings.

**Return value**

Future of `InsertResponse` type - the result of the operation and additional information like server side metrics.

**Examples**

```java showLineNumbers
// Important step (done once) - register class to pre-compile object serializer according to the table schema. 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));


List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // handle response, then it will be closed and connection that served request will be released. 
}
```

### insert(String tableName, DataStreamWriter writer, ClickHouseFormat format, InsertSettings settings)
**Beta** 

This API method allows to pass a writer object that will encode data directly into an output stream. Data will be compressed by the client.
There is a configuration option in `InsertSettings` called `appCompressedData` that allows to turn off client compression and let application to send compressed stream. 
Examples shows major usecases this API was designed for. 

`com.clickhouse.client.api.DataStreamWriter` is a functional interface with a method `onOutput` that is called by the client when output stream is ready for data to be written. This interface has
another method `onRetry` with default implementation. This method is called when retry logic is triggered and mainly used to reset data source if applicable. 


**Signatures**
```java
CompletableFuture<InsertResponse> insert(String tableName,              // name of destination table
                                         DataStreamWriter writer,       // data writer instance 
                                         ClickHouseFormat format,       // data format in which the writer encodes data 
                                         InsertSettings settings)       // operation settings
```

**Parameters**

`tableName` - name of the target table. 

`writer` - data writer instance.

`format` - data format in which the writer encodes data. 

`settings` - request settings.

**Return value**

Future of `InsertResponse` type - the result of the operation and additional information like server side metrics.

**Examples**

Writing a collection of JSON objects encoded as string values using `JSONEachRow` format: 
```java showLineNumbers

final int EXECUTE_CMD_TIMEOUT = 10; // seconds
final String tableName = "events";
final String tableCreate = "CREATE TABLE \"" + tableName + "\" " +
        " (name String, " +
        "  v1 Float32, " +
        "  v2 Float32, " +
        "  attrs Nullable(String), " +
        "  corrected_time DateTime('UTC') DEFAULT now()," +
        "  special_attr Nullable(Int8) DEFAULT -1)" +
        "  Engine = MergeTree ORDER by ()";

client.execute("DROP TABLE IF EXISTS " + tableName).get(EXECUTE_CMD_TIMEOUT, TimeUnit.SECONDS);
client.execute(createTableSQL).get(EXECUTE_CMD_TIMEOUT, TimeUnit.SECONDS);

String correctedTime = Instant.now().atZone(ZoneId.of("UTC")).format(DataTypeUtils.DATETIME_FORMATTER);
String[] rows = new String[] {
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6, \"attrs\": \"a=1,b=2,c=5\", \"corrected_time\": \"" + correctedTime + "\", \"special_attr\": 10}",
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6, \"attrs\": \"a=1,b=2,c=5\", \"corrected_time\": \"" + correctedTime + "\"}",
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6, \"attrs\": \"a=1,b=2,c=5\" }",
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6 }",
};


try (InsertResponse response = client.insert(tableName, out -> {
    // writing raw bytes 
    for (String row : rows) {
        out.write(row.getBytes());
    }

}, ClickHouseFormat.JSONEachRow, new InsertSettings()).get()) {

    System.out.println("Rows written: " + response.getWrittenRows());
}

```

Writing already compressed data:
```java showLineNumbers
String tableName = "very_long_table_name_with_uuid_" + UUID.randomUUID().toString().replace('-', '_');
String tableCreate = "CREATE TABLE \"" + tableName + "\" " +
        " (name String, " +
        "  v1 Float32, " +
        "  v2 Float32, " +
        "  attrs Nullable(String), " +
        "  corrected_time DateTime('UTC') DEFAULT now()," +
        "  special_attr Nullable(Int8) DEFAULT -1)" +
        "  Engine = MergeTree ORDER by ()";

client.execute("DROP TABLE IF EXISTS " + tableName).get(EXECUTE_CMD_TIMEOUT, TimeUnit.SECONDS);
client.execute(createTableSQL).get(EXECUTE_CMD_TIMEOUT, TimeUnit.SECONDS);

String correctedTime = Instant.now().atZone(ZoneId.of("UTC")).format(DataTypeUtils.DATETIME_FORMATTER);
String[] data = new String[] {
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6, \"attrs\": \"a=1,b=2,c=5\", \"corrected_time\": \"" + correctedTime + "\", \"special_attr\": 10}",
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6, \"attrs\": \"a=1,b=2,c=5\", \"corrected_time\": \"" + correctedTime + "\"}",
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6, \"attrs\": \"a=1,b=2,c=5\" }",
        "{ \"name\": \"foo1\", \"v1\": 0.3, \"v2\": 0.6 }",
};


// This step is only for showcase. Real application would have already compressed data. 
byte[][] compressedData = new byte[data.length][];
for (int i = 0 ; i < data.length; i++) {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    GZIPOutputStream gz = new GZIPOutputStream(baos);
    gz.write(data[i].getBytes(StandardCharsets.UTF_8));
    gz.finish();
    compressedData[i] = baos.toByteArray();
}

InsertSettings insertSettings = new InsertSettings()
        .appCompressedData(true, "gzip"); // defining compression algorithm (sent via HTTP headers)

try (InsertResponse response = client.insert(tableName, out -> {
    // Writing data 
    for (byte[] row : compressedData) {
        out.write(row);
    }
}, ClickHouseFormat.JSONEachRow, insertSettings).get()) {
    System.out.println("Rows written: " + response.getWrittenRows());
}    

```

### InsertSettings {#insertsettings}

Configuration options for insert operations.

**Configuration methods**

| Method                                       | Description                                                                                                                |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                 | Sets query ID that will be assigned to the operation. Default: `null`.                                                     |
| `setDeduplicationToken(String token)`        | Sets the deduplication token. This token will be sent to the server and can be used to identify the query. Default: `null`. |
| `setInputStreamCopyBufferSize(int size)`     | Copy buffer size. The buffer is used during write operations to copy data from user-provided input stream to an output stream. Default: `8196`. |
| `serverSetting(String name, String value)`   | Sets individual server settings for an operation.                                                                          |
| `serverSetting(String name, Collection values)` | Sets individual server settings with multiple values for an operation. Items of the collection should be `String` values.  |
| `setDBRoles(Collection dbRoles)`             | Sets DB roles to be set before executing an operation. Items of the collection should be `String` values.                  |
| `setOption(String option, Object value)`     | Sets a configuration option in raw format. This is not a server setting.                                                  |

### InsertResponse {#insertresponse}

Response object that holds result of insert operation. It is only available if the client got response from a server. 

:::note
This object should be closed as soon as possible to release a connection because the connection cannot be re-used until all data of previous response is fully read.
:::

| Method                      | Description                                                                                          |
|-----------------------------|------------------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()` | Returns object with operation metrics.                                                           |
| `String getQueryId()`       | Returns query ID assigned for the operation by the application (through operation settings or by server). |

## Query API {#query-api}

### query(String sqlQuery) {#querystring-sqlquery}

Sends `sqlQuery` as is. Response format is set by query settings. `QueryResponse` will hold a reference to the response stream that should be consumed by a reader for the supportig format.

**Signatures**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**Parameters**

`sqlQuery` - a single SQL statement. The Query is sent as is to a server.  

`settings` - request settings.

**Return value**

Future of `QueryResponse` type - a result dataset and additional information like server side metrics. The Response object should be closed after consuming the dataset. 

**Examples**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// Default format is RowBinaryWithNamesAndTypesFormatReader so reader have all information about columns
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // Create a reader to access the data in a convenient way
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // Read the next record from stream and parse it

        // get values
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // collecting data 
    }
} catch (Exception e) {
    log.error("Failed to read data", e);
}

// put business logic outside of the reading block to release http connection asap.  
```

### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

Sends `sqlQuery` as is. Additionally will send query parameters so the server can compile the SQL expression.

**Signatures**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**Parameters**

`sqlQuery` - sql expression with placeholders `{}`. 

`queryParams` - map of variables to complete the sql expression on server.

`settings` - request settings. 

**Return value**

Future of `QueryResponse` type - a result dataset and additional information like server side metrics. The Response object should be closed after consuming the dataset. 

**Examples**

```java showLineNumbers

// define parameters. They will be sent to the server along with the request.   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // Create a reader to access the data in a convenient way
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // Read the next record from stream and parse it

        // reading data 
    }

} catch (Exception e) {
    log.error("Failed to read data", e);
}

```

### queryAll(String sqlQuery) {#queryallstring-sqlquery}

Queries a data in `RowBinaryWithNamesAndTypes` format. Returns the result as a collection. Read performance is the same as with the reader but more memory is required to hold the whole dataset.

**Signatures**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**Parameters**

`sqlQuery` - sql expression to query data from a server.

**Return value**

Complete dataset represented by a list of `GenericRecord` objects that provide access in row style for the result data. 

**Examples**

```java showLineNumbers
try {
    log.info("Reading whole table and process record by record");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // Read whole result set and process it record by record
    client.queryAll(sql).forEach(row -> {
        double id = row.getDouble("id");
        String title = row.getString("title");
        String url = row.getString("url");

        log.info("id: {}, title: {}, url: {}", id, title, url);
    });
} catch (Exception e) {
    log.error("Failed to read data", e);
}
```

### QuerySettings {#querysettings}

Configuration options for query operations.

**Configuration methods**

| Method                                       | Description                                                                                                                |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                 | Sets query ID that will be assigned to the operation.                                                                      |
| `setFormat(ClickHouseFormat format)`         | Sets response format. See `RowBinaryWithNamesAndTypes` for the full list.                                                  |
| `setMaxExecutionTime(Integer maxExecutionTime)` | Sets operation execution time on server. Will not affect read timeout.                                                    |
| `waitEndOfQuery(Boolean waitEndOfQuery)`     | Requests the server to wait for the end of the query before sending a response.                                            |
| `setUseServerTimeZone(Boolean useServerTimeZone)` | Server timezone (see client config) will be used to parse date/time types in the result of an operation. Default `false`.  |
| `setUseTimeZone(String timeZone)`            | Requests server to use `timeZone` for time conversion. See [session_timezone](/operations/settings/settings#session_timezone). |
| `serverSetting(String name, String value)`   | Sets individual server settings for an operation.                                                                          |
| `serverSetting(String name, Collection values)` | Sets individual server settings with multiple values for an operation. Items of the collection should be `String` values.  |
| `setDBRoles(Collection dbRoles)`             | Sets DB roles to be set before executing an operation. Items of the collection should be `String` values.                  |
| `setOption(String option, Object value)`     | Sets a configuration option in raw format. This is not a server setting.                                                  |

### QueryResponse {#queryresponse}

Response object that holds result of query execution. It is only available if the client got a response from a server. 

:::note
This object should be closed as soon as possible to release a connection because the connection cannot be re-used until all data of previous response is fully read.
:::

| Method                              | Description                                                                                          |
|-------------------------------------|------------------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`      | Returns a format in which data in the response is encoded.                                           |
| `InputStream getInputStream()`      | Returns uncompressed byte stream of data in the specified format.                                    |
| `OperationMetrics getMetrics()`     | Returns object with operation metrics.                                                              |
| `String getQueryId()`               | Returns query ID assigned for the operation by the application (through operation settings or by server). |
| `TimeZone getTimeZone()`            | Returns timezone that should be used for handling Date/DateTime types in the response.               |

### Examples {#examples}

- Example code is available in [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)
- Reference Spring Service [implementation](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)

## Common API {#common-api}

### getTableSchema(String table) {#gettableschemastring-table}

Fetches table schema for the `table`.

**Signatures**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**Parameters**

`table` - table name for which schema data should be fetched.

`database` - database where the target table is defined.

**Return value**

Returns a `TableSchema` object with list of table columns.

### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

Fetches schema from a SQL statement. 

**Signatures**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**Parameters**

`sql` - "SELECT" SQL statement which schema should be returned.

**Return value**

Returns a `TableSchema` object with columns matching the `sql` expression.

### TableSchema {#tableschema}

### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

Compiles serialization and deserialization layer for the Java Class to use for writing/reading data with `schema`. The method will create a serializer and deserializer for the pair getter/setter and corresponding column. 
Column match is found by extracting its name from a method name. For example, `getFirstName` will be for the column `first_name` or `firstname`. 

**Signatures**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**Parameters**

`clazz` - Class representing the POJO used to read/write data.

`schema` - Data schema to use for matching with POJO properties.


**Examples**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## Usage Examples {#usage-examples}

Complete examples code is stored in the repo in a 'example` [folder](https://github.com/ClickHouse/clickhouse-java/tree/main/examples):

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - main set of examples.
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - example of how to use the client in a Spring Boot application.
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - example of how to use the client in Ktor (Kotlin) application.
