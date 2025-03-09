---
sidebar_label: '客户端 0.8+'
sidebar_position: 2
keywords: ['clickhouse', 'java', 'client', 'integrate']
description: 'Java ClickHouse Connector 0.8+'
slug: /integrations/language-clients/java/client
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java 客户端 (0.8+)

Java 客户端库用于通过协议与数据库服务器通信。目前实现仅支持 [HTTP 接口](/interfaces/http)。 
该库提供自己的 API 以发送请求到服务器。该库还提供处理不同二进制数据格式的工具 (RowBinary* & Native*)。

:::note
如果您正在寻找 java 客户端文档的早期版本，请参见 [这里](/integrations/language-clients/java/client-v1.md)。
:::
## 设置 {#setup}

- Maven Central (项目网页): https://mvnrepository.com/artifact/com.clickhouse/client-v2
- 每日构建 (仓库链接): https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

<Tabs groupId="client-setup">
<TabItem value="maven" label="Maven">

```xml 
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>client-v2</artifactId>
    <version>0.8.2</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation("com.clickhouse:client-v2:0.8.2")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation 'com.clickhouse:client-v2:0.8.2'
```

</TabItem>
</Tabs>
## 初始化 {#initialization}

Client 对象由 `com.clickhouse.client.api.Client.Builder#build()` 初始化。每个客户端都有自己的上下文，且对象之间不共享。
Builder 提供了便于设置的配置方法。

示例: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client` 是 `AutoCloseable`，在不再需要时应关闭。
### 认证 {#authentication}

认证在初始化阶段按客户端配置。支持三种认证方法：使用密码、访问令牌、SSL 客户端证书。

通过密码进行认证需要设置用户名和密码，通过调用 `setUsername(String)` 和 `setPassword(String)`:
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

通过访问令牌进行认证需要通过调用 `setAccessToken(String)` 设置访问令牌:
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

通过 SSL 客户端证书进行认证需要相应地设置用户名、启用 SSL 认证、设置客户端证书和客户端密钥，通过调用 `setUsername(String)`、`useSSLAuthentication(boolean)`、`setClientCertificate(String)` 和 `setClientKey(String)`:
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
在生产环境中，SSL 认证可能难以排查故障，因为 SSL 库的许多错误提供的信息不足。例如，如果客户端证书和密钥不匹配，服务器将立即终止连接（在 HTTP 的情况下，这是在连接初始化阶段，未发送任何 HTTP 请求因此未发送响应）。

请使用 [openssl](https://docs.openssl.org/master/man1/openssl/) 等工具来验证证书和密钥：
- 检查密钥完整性: `openssl rsa -in [key-file.key] -check -noout`
- 检查客户端证书是否具有匹配的 CN:
    - 从用户证书获取 CN - `openssl x509 -noout -subject -in [user.cert]`
    - 验证数据库中设置了相同的值 `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'` (查询将输出 `auth_params`，类似 ` {"common_names":["some_user"]}`) 

:::
## 配置 {#configuration}

所有设置都由实例方法（即配置方法）定义，使每个值的范围和上下文明确。
主要的配置参数在一个范围内定义（客户端或操作），并且不会相互覆盖。

配置在创建客户端时定义。请参见 `com.clickhouse.client.api.Client.Builder`。
## 客户端配置 {#client-configuration}

| 配置方法                                      | 参数                                      | 描述                                     |
|-----------------------------------------------|:------------------------------------------|:-----------------------------------------|
| `addEndpoint(String endpoint)`                | - `enpoint` - 按照 URL 格式的服务器地址。       | 将服务器端点添加到可用服务器列表中。目前只支持一个端点。   |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - 连接协议 `com.clickhouse.client.api.enums.Protocol#HTTP`。<br />- `host` - 服务器的 IP 或主机名。<br />- `secure` - 如果通信应使用安全版本的协议 (HTTPS) | 将服务器端点添加到可用服务器列表中。目前只支持一个端点。   |
| `setOption(String key, String value)`       | - `key` - 客户端配置选项的字符串键。<br /> - `value` - 选项的字符串值 | 设置客户端选项的原始值。当从属性文件读取配置时很有用。 |
| `setUsername(String username)`                | - `username` - 在身份验证中使用的用户名       | 为进一步配置所选的身份验证方法设置用户名。  |
| `setPassword(String password)`                | - `password` - 用于密码身份验证的秘密值     | 设置密码身份验证的秘密，并有效选择身份验证方法。 |
| `setAccessToken(String accessToken)`          | - `accessToken` - 访问令牌的字符串表示      | 设置用于身份验证的访问令牌，使用相应的身份验证方法。 |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - 指示是否应使用 SSL 认证的标志 | 将 SSL 客户端证书设置为身份验证的方法。 |
| `enableConnectionPool(boolean enable)`       | - `enable` - 指示是否应启用该选项的标志     | 设置连接池是否启用。 |
| `setConnectTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 以某种时间单位的超时。<br /> - `unit` - `timeout` 的时间单位 | 设置任何外部连接的连接初始化超时时间。这会影响获取套接字连接的等待时间。 |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 以某种时间单位的超时。<br /> - `unit` - `timeout` 的时间单位 | 设置连接请求超时。此设置只对从池中获取连接有效。 |
| `setMaxConnections(int maxConnections)`       | - `maxConnections` - 连接数                  | 设置客户端可以打开到每个服务器端点的连接数。 |
| `setConnectionTTL(long timeout, ChronoUnit unit)` | - `timeout` - 以某种时间单位的超时。<br /> - `unit` - `timeout` 的时间单位 | 设置连接的生存时间 (TTL)，之后连接将被视为不活跃。 |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 以某种时间单位的超时。<br /> - `unit` - `timeout` 的时间单位 | 设置 HTTP 连接保持活动超时。可以通过将超时设置为零 (`0`) 来禁用 Keep-Alive。 |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - 枚举 `com.clickhouse.client.api.ConnectionReuseStrategy` 常量 | 选择连接池应使用的策略：`LIFO` 如果连接应在返回到池中后立即重用，或 `FIFO` 以使用按可用顺序的连接（返回的连接不会立即使用）。 |
| `setSocketTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 以某种时间单位的超时。<br /> - `unit` - `timeout` 的时间单位 | 设置影响读写操作的套接字超时。 |
| `setSocketRcvbuf(long size)`                  | - `size` - 字节大小                          | 设置 TCP 套接字接收缓冲区。该缓冲区位于 JVM 内存之外。 |
| `setSocketSndbuf(long size)`                  | - `size` - 字节大小                          | 设置 TCP 套接字发送缓冲区。该缓冲区位于 JVM 内存之外。 |
| `setSocketKeepAlive(boolean value)`           | - `value` - 指示是否应启用该选项的标志      | 为客户端创建的每个 TCP 套接字设置选项 `SO_KEEPALIVE`。 TCP Keep Alive 启用机制，将检查连接的存活状态，并帮助检测突然终止的连接。 |
| `setSocketTcpNodelay(boolean value)`          | - `value` - 指示是否应启用该选项的标志      | 为客户端创建的每个 TCP 套接字设置选项 `SO_NODELAY`。此 TCP 选项将使套接字尽快推送数据。 |
| `setSocketLinger(int secondsToWait)`          | - `secondsToWait` - 秒数                     | 设置客户端创建的每个 TCP 套接字的保留时间。 |
| `compressServerResponse(boolean enabled)`      | - `enabled` - 指示是否应启用该选项的标志    | 设置服务器是否应压缩其响应。 |
| `compressClientRequest(boolean enabled)`       | - `enabled` - 指示是否应启用该选项的标志    | 设置客户端是否应压缩其请求。 |
| `useHttpCompression(boolean enabled)`          | - `enabled` - 指示是否应启用该选项的标志    | 设置是否应在客户端/服务器通信中使用 HTTP 压缩，如果启用了相应的选项。 |
| `setLZ4UncompressedBufferSize(int size)`      | - `size` - 字节大小                          | 设置接收未压缩数据流部分的缓冲区大小。如果缓冲区被低估，则会创建一个新缓冲区，并在日志中发出相应的警告。 |
| `setDefaultDatabase(String database)`          | - `database` - 数据库名称                    | 设置默认数据库。 |
| `addProxy(ProxyType type, String host, int port)` | - `type` - 代理类型。<br /> - `host` - 代理主机名或 IP 地址。<br /> - `port` - 代理端口 | 设置用于与服务器通信的代理。如果代理需要身份验证，则需要设置代理。 |
| `setProxyCredentials(String user, String pass)` | - `user` - 代理用户。<br /> - `pass` - 密码 | 设置用于通过代理进行身份验证的用户凭据。 |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - 以某种时间单位的超时。<br /> - `timeUnit` - `timeout` 的时间单位 | 设置查询的最大执行超时时间。 |
| `setHttpCookiesEnabled(boolean enabled)`      | `enabled` - 指示是否应启用该选项的标志      | 设置是否应记住 HTTP cookie，并将其发送回服务器。 |
| `setSSLTrustStore(String path)`               | `path` - 本地（客户端）系统上的文件路径   | 设置客户端是否应使用 SSL 受信任存储进行服务器主机验证。 |
| `setSSLTrustStorePassword(String password)`   | `password` - 秘密值                          | 设置用于解锁由 `setSSLTrustStore(String path)` 指定的 SSL 受信任存储的密码。 |
| `setSSLTrustStoreType(String type)`           | `type` - 受信任存储类型名称                  | 设置由 `setSSLTrustStore(String path)` 指定的受信任存储的类型。 |
| `setRootCertificate(String path)`              | `path` - 本地（客户端）系统上的文件路径   | 设置客户端是否应使用指定的根（CA）证书进行服务器主机验证。 |
| `setClientCertificate(String path)`            | `path` - 本地（客户端）系统上的文件路径   | 设置在启动 SSL 连接时使用的客户端证书路径，并由 SSL 身份验证使用。 |
| `setClientKey(String path)`                    | `path` - 本地（客户端）系统上的文件路径   | 设置用于加密与服务器的 SSL 通信的客户端私钥。 |
| `useServerTimeZone(boolean useServerTimeZone)` | `useServerTimeZone` - 指示是否应启用该选项的标志 | 设置客户端是否应在解码 DateTime 和 Date 列值时使用服务器时区。如果启用，则服务器时区应通过 `setServerTimeZone(String timeZone)` 设置。 |
| `useTimeZone(String timeZone)`                 | `timeZone` - java 有效时区 ID 的字符串值 (见 `java.time.ZoneId`) | 设置在解码 DateTime 和 Date 列值时是否应使用指定的时区。将覆盖服务器时区。 |
| `setServerTimeZone(String timeZone)`           |  `timeZone` - java 有效时区 ID 的字符串值 (见 `java.time.ZoneId`) | 设置服务器侧时区。默认将使用 UTC 时区。 |
| `useAsyncRequests(boolean async)`              | `async` - 指示是否应启用该选项的标志      | 设置客户端是否应在单独的线程中执行请求。默认禁用，因为应用程序更了解如何组织多线程任务，并且在单独线程中运行任务不会提高性能。 |
| `setSharedOperationExecutor(ExecutorService executorService)` | `executorService` - 执行器服务的实例 | 设置操作任务的执行器服务。 |
| `setClientNetworkBufferSize(int size)`        | - `size` - 字节大小                          | 设置在应用程序内存空间中用于在套接字和应用程序之间来回复制数据的缓冲区大小。较大则减少对 TCP 栈的系统调用，但影响每个连接上消耗的内存。此缓冲区也会受到 GC 的影响，因为连接是短暂的。还要记住，分配一个大的连续内存块可能会有问题。默认值为 `300,000` 字节。 |
| `retryOnFailures(ClientFaultCause ...causes)` | - `causes` - `com.clickhouse.client.api.ClientFaultCause` 的枚举常量 | 设置可恢复/可重试的故障类型。 |
| `setMaxRetries(int maxRetries)`               | - `maxRetries` - 重试次数                   | 设置由 `retryOnFailures(ClientFaultCause ...causes)` 定义的故障的最大重试次数。 |
| `allowBinaryReaderToReuseBuffers(boolean reuse)` | - `reuse` - 指示是否应启用该选项的标志   | 大多数数据集包含编码为小字节序列的数字数据。默认情况下，阅读器将分配所需的缓冲区，将数据读取到其中，然后转换为目标数字类。这可能会导致显著的 GC 压力，因为许多小对象被分配和释放。如果启用该选项，则阅读器将使用预分配的缓冲区进行数字转换。这样是安全的，因为每个读取器都有自己的缓冲区集，并且读取器由一个线程使用。 |
| `httpHeader(String key, String value)`       | - `key` - HTTP 头部键。<br /> - `value` - 头部的字符串值。 | 为单个 HTTP 头部设置值。前一个值被覆盖。|
| `httpHeader(String key, Collection values)`   | - `key` - HTTP 头部键。<br /> - `values` - 字符串值的列表。 | 为单个 HTTP 头部设置值。前一个值被覆盖。|
| `httpHeaders(Map headers)`                     | - `header` - 带有 HTTP 头及其值的映射。   | 一次设置多个 HTTP 头值。 |
| `serverSetting(String name, String value)`    | - `name` - 查询级设置的名称。<br /> - `value` - 设置的字符串值。 | 设置要与每个查询一起传递到服务器的设置。单个操作设置可能会覆盖它。 [设置列表](/operations/settings/query-level) | 
| `serverSetting(String name,  Collection values)` | - `name` - 查询级设置的名称。<br /> - `values` - 设置的字符串值。 | 设置要与每个查询一起传递到服务器的设置。单个操作设置可能会覆盖它。 [设置列表](/operations/settings/query-level)。此方法用于设置具有多个值的设置，例如 [roles](/interfaces/http#setting-role-with-query-parameters) |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - 列与方法之间匹配策略的实现 | 设置自定义策略，以便在注册 DTO 时用于匹配 DTO 类字段和数据库列。 |
| `useHTTPBasicAuth(boolean useBasicAuth)`      | - `useBasicAuth` - 指示是否应启用该选项的标志 | 设置是否应使用基本 HTTP 身份验证进行用户-密码身份验证。默认启用。使用这种类型的身份验证可以解决包含特殊字符的密码无法通过 HTTP 头传输的问题。 |
| `setClientName(String clientName)`            | - `clientName` - 表示应用程序名称的字符串 | 设置有关调用应用程序的附加信息。此字符串将作为客户端名称传递给服务器。在使用 HTTP 协议的情况下，它将作为 `User-Agent` 头传递。 |
| `useBearerTokenAuth(String bearerToken)`      | - `bearerToken` - 编码的 Bearer 令牌     | 指定是否使用 Bearer 身份验证以及使用哪个令牌。该令牌将原样发送，因此应在传递给此方法之前进行编码。 |
## 常见定义 {#common-definitions}
### ClickHouseFormat {#clickhouseformat}

[受支持格式](/interfaces/formats) 的枚举。包括 ClickHouse 支持的所有格式。

* `raw` - 用户应转码原始数据 
* `full` - 客户端可以自行转码数据，并接受原始数据流
* `-` - 点击屋对该格式不支持的操作

此客户端版本支持：

| 格式                                                                                                                        | 输入  | 输出  |
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
| [PrettyNoEscapesMonoBlock](/interfaces/formats#prettynoescapesmonoblock)                                            | -      | raw     |
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
| [ProtobufList](/interfaces/formats#protobuflist)                                                                      | raw    | raw     |
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
## 插入 API {#insert-api}
### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

接受指定格式的 `InputStream` 字节数据。预期 `data` 按 `format` 编码。

**方法签名**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**参数**

`tableName` - 目标表名。

`data` - 编码数据的输入流。

`format` - 数据编码格式。

`settings` - 请求设置。

**返回值**

类型为 `InsertResponse` 的未来对象 - 操作结果及附加信息，如服务器端度量。

**示例**

```java showLineNumbers
try (InputStream dataStream = getDataStream()) {
    try (InsertResponse response = client.insert(TABLE_NAME, dataStream, ClickHouseFormat.JSONEachRow,
            insertSettings).get(3, TimeUnit.SECONDS)) {

        log.info("插入完成：{} 行已写入", response.getMetrics().getMetric(ServerMetrics.NUM_ROWS_WRITTEN).getLong());
    } catch (Exception e) {
        log.error("写入 JSONEachRow 数据失败", e);
        throw new RuntimeException(e);
    }
}
```

### insert(String tableName, List&lt;?> data, InsertSettings settings) {#insertstring-tablename-listlt-data-insertsettings-settings}

向数据库发送写入请求。对象列表被转换为有效格式，然后发送到服务器。列表项的类应使用 `register(Class, TableSchema)` 方法提前注册。

**方法签名**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**参数**

`tableName` - 目标表名。

`data` - DTO（数据传输对象）对象集合。

`settings` - 请求设置。

**返回值**

类型为 `InsertResponse` 的未来对象 - 操作结果及附加信息，如服务器端度量。

**示例**

```java showLineNumbers
// 重要步骤（仅需执行一次） - 根据表架构注册类以预编译对象序列化器。
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));

List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // 处理响应，之后它将被关闭，提供请求的连接将被释放。
}
```

### InsertSettings {#insertsettings}

插入操作的配置选项。

**配置方法**

| 方法                                       | 描述                                                                                                                        |
|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`               | 设置将分配给操作的查询 ID。默认值：`null`。                                                                               |
| `setDeduplicationToken(String token)`      | 设置去重令牌。此令牌将发送到服务器，可用于识别查询。默认值：`null`。                                                       |
| `setInputStreamCopyBufferSize(int size)`   | 复制缓冲区大小。该缓冲区在写入操作期间用于将数据从用户提供的输入流复制到输出流。默认值：`8196`。                        |
| `serverSetting(String name, String value)` | 为操作设置单个服务器设置。                                                                                                |
| `serverSetting(String name, Collection values)` | 为操作设置多个值的单个服务器设置。集合中的项目应为 `String` 值。                                                         |
| `setDBRoles(Collection dbRoles)`           | 执行操作前要设置的数据库角色。集合中的项目应为 `String` 值。                                                             |
| `setOption(String option, Object value)`   | 以原始格式设置配置选项。这不是服务器设置。                                                                                 |

### InsertResponse {#insertresponse}

包含插入操作结果的响应对象。仅在客户端收到服务器的响应时可用。

:::note
应尽快关闭此对象以释放连接，因为在完全部署前的响应数据读取完毕之前，连接无法被重复使用。
:::

| 方法                           | 描述                                                                                            |
|-------------------------------|-------------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()` | 返回操作度量对象。                                                                            |
| `String getQueryId()`        | 返回由应用程序（通过操作设置或服务器）分配给操作的查询 ID。                                     |

## Query API {#query-api}
### query(String sqlQuery) {#querystring-sqlquery}

原样发送 `sqlQuery`。响应格式由查询设置确定。`QueryResponse` 将持有对应于所支持格式的响应流的引用，应该由读取器消费。

**方法签名**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**参数**

`sqlQuery` - 单个 SQL 语句。查询会原样发送到服务器。

`settings` - 请求设置。

**返回值**

类型为 `QueryResponse` 的未来对象 - 结果数据集及附加信息，如服务器端度量。应在消费数据集后关闭响应对象。

**示例**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// 默认格式是 RowBinaryWithNamesAndTypesFormatReader，因此读取器会获取所有列的信息
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // 创建读取器以方便访问数据
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // 从流中读取下一条记录并解析它

        // 获取值
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // 收集数据 
    }
} catch (Exception e) {
    log.error("读取数据失败", e);
}

// 将业务逻辑放在读取块之外，以便尽快释放 HTTP 连接。 
```

### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

原样发送 `sqlQuery`。此外，还将发送查询参数，以便服务器可以编译 SQL 表达式。

**方法签名**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**参数**

`sqlQuery` - 带有占位符 `{}` 的 SQL 表达式。

`queryParams` - 变量的映射，以在服务器上完成 SQL 表达式。

`settings` - 请求设置。 

**返回值**

类型为 `QueryResponse` 的未来对象 - 结果数据集及附加信息，如服务器端度量。应在消费数据集后关闭响应对象。

**示例**

```java showLineNumbers

// 定义参数。它们将随请求发送到服务器。   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // 创建读取器以方便访问数据
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // 从流中读取下一条记录并解析它

        // 读取数据 
    }

} catch (Exception e) {
    log.error("读取数据失败", e);
}
```

### queryAll(String sqlQuery) {#queryallstring-sqlquery}

以 `RowBinaryWithNamesAndTypes` 格式查询数据。结果返回为一个集合。读取性能与读取器相同，但需要更多内存来保持整个数据集。

**方法签名**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**参数**

`sqlQuery` - 用于从服务器查询数据的 SQL 表达式。

**返回值**

完整数据集由 `GenericRecord` 对象列表表示，提供按行访问结果数据的能力。

**示例**

```java showLineNumbers
try {
    log.info("读取整个表并逐条处理记录");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // 读取整个结果集并逐条处理
    client.queryAll(sql).forEach(row -> {
        double id = row.getDouble("id");
        String title = row.getString("title");
        String url = row.getString("url");

        log.info("id: {}, title: {}, url: {}", id, title, url);
    });
} catch (Exception e) {
    log.error("读取数据失败", e);
}
```

### QuerySettings {#querysettings}

查询操作的配置选项。

**配置方法**

| 方法                                       | 描述                                                                                                                       |
|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`               | 设置将分配给操作的查询 ID。                                                                                              |
| `setFormat(ClickHouseFormat format)`       | 设置响应格式。有关完整列表，请参阅 `RowBinaryWithNamesAndTypes`。                                                        |
| `setMaxExecutionTime(Integer maxExecutionTime)` | 设置服务器上的操作执行时间。这不会影响读取超时。                                                                       |
| `waitEndOfQuery(Boolean waitEndOfQuery)`   | 请求服务器在发送响应之前等待查询结束。                                                                                  |
| `setUseServerTimeZone(Boolean useServerTimeZone)` | 服务器时区（见客户端配置）将用于解析操作结果中的日期/时间类型。默认为 `false`。                                         |
| `setUseTimeZone(String timeZone)`          | 请求服务器使用 `timeZone` 进行时间转换。有关详细信息，请参阅 [session_timezone](/operations/settings/settings#session_timezone)。 |
| `serverSetting(String name, String value)` | 为操作设置单个服务器设置。                                                                                               |
| `serverSetting(String name, Collection values)` | 为操作设置多个值的单个服务器设置。集合中的项目应为 `String` 值。                                                       |
| `setDBRoles(Collection dbRoles)`           | 执行操作前要设置的数据库角色。集合中的项目应为 `String` 值。                                                           |
| `setOption(String option, Object value)`   | 以原始格式设置配置选项。这不是服务器设置。                                                                               |

### QueryResponse {#queryresponse}

包含查询执行结果的响应对象。仅在客户端收到服务器的响应时可用。

:::note
应尽快关闭此对象以释放连接，因为在完全部署前的响应数据读取完毕之前，连接无法被重复使用。
:::

| 方法                                  | 描述                                                                                                                       |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`        | 返回响应中数据编码的格式。                                                                                               |
| `InputStream getInputStream()`        | 返回以指定格式编码的未压缩字节流数据。                                                                                   |
| `OperationMetrics getMetrics()`       | 返回操作度量对象。                                                                                                        |
| `String getQueryId()`                 | 返回由应用程序（通过操作设置或服务器）分配给操作的查询 ID。                                                             |
| `TimeZone getTimeZone()`              | 返回应用于处理响应中的日期/日期时间类型的时区。                                                                         |

### Examples {#examples}

- 示例代码可在 [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) 中找到。
- 参考 Spring Service [实现](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)。

## Common API {#common-api}
### getTableSchema(String table) {#gettableschemastring-table}

获取 `table` 的表架构。

**方法签名**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**参数**

`table` - 需要获取架构数据的表名。

`database` - 定义目标表的数据库。

**返回值**

返回一个 `TableSchema` 对象，包含表列的列表。

### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

从 SQL 语句中获取架构。

**方法签名**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**参数**

`sql` - "SELECT" SQL 语句，其架构应返回。

**返回值**

返回一个 `TableSchema` 对象，其列与 `sql` 表达式匹配。

### TableSchema {#tableschema}
### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

为 Java 类编译序列化和反序列化层，以用于使用 `schema` 读取/写入数据。该方法将为配对的 getter/setter 和相应的列创建序列化器和反序列化器。  
通过从方法名称中提取列名称来找到列匹配。例如，`getFirstName` 将对应于列 `first_name` 或 `firstname`。

**方法签名**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**参数**

`clazz` - 表示用于读取/写入数据的 POJO 的类。

`schema` - 用于与 POJO 属性匹配的数据架构。

**示例**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## Usage Examples {#usage-examples}

完整示例代码存储在 `example` [文件夹](https://github.com/ClickHouse/clickhouse-java/tree/main/examples) 中：

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - 主要示例集。
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - 如何在 Spring Boot 应用程序中使用客户端的示例。
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - 如何在 Ktor（Kotlin）应用程序中使用客户端的示例。
