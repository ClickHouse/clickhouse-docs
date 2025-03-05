---
sidebar_label: クライアント 0.8+
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouse コネクタ 0.8+
slug: /integrations/language-clients/java/client
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java クライアント (0.8+)

DB サーバーとそのプロトコルを通じて通信するための Java クライアントライブラリです。現在の実装は、[HTTP インターフェース](/interfaces/http) のみをサポートしています。  
このライブラリは、サーバーへのリクエストを送信するための独自の API を提供します。また、異なるバイナリデータフォーマット（RowBinary* & Native*）で作業するためのツールも提供します。

:::note
以前のバージョンの Java クライアントドキュメントを探している場合は、[こちら](/integrations/language-clients/java/client-v1.md)をご覧ください。
:::
## セットアップ {#setup}

- Maven Central (プロジェクトウェブページ): https://mvnrepository.com/artifact/com.clickhouse/client-v2
- ナイトリービルド (リポジトリリンク): https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

<Tabs groupId="client-setup">
<TabItem value="maven" label="Maven" >

```xml 
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>client-v2</artifactId>
    <version>0.8.1</version>
</dependency>
```

</TabItem>
<TabItem value="gradle-kt" label="Gradle (Kotlin)">

```kotlin
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation("com.clickhouse:client-v2:0.8.1")
```
</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
// https://mvnrepository.com/artifact/com.clickhouse/client-v2
implementation 'com.clickhouse:client-v2:0.8.1'
```

</TabItem>
</Tabs>
## 初期化 {#initialization}

`com.clickhouse.client.api.Client.Builder#build()` により Client オブジェクトが初期化されます。各クライアントには独自のコンテキストがあり、オブジェクトは共有されません。  
Builder には便利なセットアップのための設定メソッドがあります。

例: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client` は `AutoCloseable` であり、必要なくなった際には閉じる必要があります。
### 認証 {#authentication}

認証は初期化時にクライアントごとに設定されます。サポートされている認証方法は、パスワードによる認証、アクセストークンによる認証、および SSL クライアント証明書による認証の 3 つです。

パスワードによる認証では、`setUsername(String)` と `setPassword(String)` を呼び出してユーザー名とパスワードを設定する必要があります: 
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

アクセストークンによる認証では、`setAccessToken(String)` を呼び出してアクセストークンを設定する必要があります:
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

SSL クライアント証明書による認証では、ユーザー名を設定し、SSL 認証を有効にし、クライアント証明書とクライアントキーをそれぞれ `setUsername(String)`, `useSSLAuthentication(boolean)`, `setClientCertificate(String)`, および `setClientKey(String)` を呼び出して設定する必要があります: 
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
SSL 認証は、SSL ライブラリからの多くのエラーが十分な情報を提供しないため、運用時にトラブルシューティングが難しい場合があります。たとえば、クライアント証明書とキーが一致しない場合、サーバーは接続を即座に終了します（HTTP の場合、HTTP リクエストが送信される前の接続初期化段階で発生します）。

[openssl](https://docs.openssl.org/master/man1/openssl/) のようなツールを使用して、証明書やキーを確認してください: 
- キーの整合性を確認する: `openssl rsa -in [key-file.key] -check -noout`
- クライアント証明書がユーザーの CN と一致することを確認する:
    - ユーザー証明書から CN を取得する - `openssl x509 -noout -subject -in [user.cert]`
    - データベースに設定されている同じ値を検証する `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'`（クエリは `auth_params` を含む出力を提供し、`{"common_names":["some_user"]}` のように表示されます）

:::
## 設定 {#configuration}

すべての設定は、インスタンスメソッド（アーキテクチャの設定メソッド）によって定義され、各値のスコープとコンテキストを明確にします。  
主な構成パラメータは一つのスコープ（クライアントまたは操作）で定義され、互いに上書きされることはありません。

構成はクライアント作成時に定義されます。`com.clickhouse.client.api.Client.Builder` を参照してください。
## クライアント設定 {#client-configuration}

| 設定メソッド                     | 引数                                         | 説明                               |
|----------------------------------|:---------------------------------------------|:------------------------------------|
| `addEndpoint(String endpoint)`        | - `enpoint` - サーバーアドレスをフォーマットした URL。      | サーバーエンドポイントを利用可能なサーバーのリストに追加します。現在のところ、一つのエンドポイントのみがサポートされています。 |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - 接続プロトコル `com.clickhouse.client.api.enums.Protocol#HTTP`.<br />- `host` - サーバーの IP またはホスト名。<br />- `secure` - 通信がプロトコルの安全なバージョン（HTTPS）を利用すべきか | サーバーエンドポイントを利用可能なサーバーのリストに追加します。現在のところ、一つのエンドポイントのみがサポートされています。 |
| `setOption(String key, String value)`  | - `key` - クライアント設定オプションの文字列キー。<br /> - `value` - オプションの文字列値 | クライアントオプションの生の値を設定します。プロパティファイルから設定を読み取る際に便利です。 | 
| `setUsername(String username)`         | - `username` - 認証に使用するユーザーのユーザー名 | 認証方法のユーザー名を設定します。以降の設定で選択されます。 | 
| `setPassword(String password)`         | - `password` - パスワード認証用の秘密の値 | パスワード認証用の秘密を設定し、認証方法を実質的に選択します。 |
| `setAccessToken(String accessToken)`    | - `accessToken` - アクセストークンの文字列表示 | 対応する認証方法を設定して認証するためのアクセストークンを設定します。 |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - SSL 認証を使用すべきかを示すフラグ | SSL クライアント証明書を認証方法として設定します。 | 
| `enableConnectionPool(boolean enable)`  | - `enable` - オプションを有効にすべきかを示すフラグ | 接続プールを有効にするかどうかを設定します。 | 
| `setConnectTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | すべてのアウトゴーイング接続の接続初期化タイムアウトを設定します。これはソケット接続を取得する際の待機時間に影響します。 |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | 接続要求のタイムアウトを設定します。プールから接続を取得する際にのみ適用されます。 | 
| `setMaxConnections(int maxConnections)` | - `maxConnections` - 接続数 | 各サーバーエンドポイントに対してクライアントがオープンできる接続の数を設定します。 | 
| `setConnectionTTL(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | 接続が非アクティブと見なされる timeout を設定します |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | HTTP 接続のキープアライブタイムアウトを設定します。このオプションは、タイムアウトをゼロ（`0`）に設定することでキープアライブを無効にするためにも使用できます。 |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - `com.clickhouse.client.api.ConnectionReuseStrategy` 定数の列挙型 | 接続プールが使用すべき戦略を選択します: 返却されるとすぐに再利用する場合は `LIFO`、または利用可能になる順序で接続を使用する場合（返却された接続はすぐに使用されません）には `FIFO`。 |
| `setSocketTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | 読み込みおよび書き込み操作に影響を与えるソケットタイムアウトを設定します。 | 
| `setSocketRcvbuf(long size)` | - `size` - バイト単位のサイズ | TCP ソケット受信バッファを設定します。このバッファは JVM メモリの外にあります。 |
| `setSocketSndbuf(long size)` | - `size` - バイト単位のサイズ | TCP ソケット受信バッファを設定します。このバッファは JVM メモリの外にあります。 |
| `setSocketKeepAlive(boolean value)` | - `value` - オプションを有効にすべきかを示すフラグ | クライアントによって作成されたすべての TCP ソケットに対してオプション `SO_KEEPALIVE` を設定します。TCP キープアライブは、接続の生存性をチェックし、突然終了したものを検出するのに役立ちます。 |
| `setSocketTcpNodelay(boolean value)` | - `value` - オプションを有効にすべきかを示すフラグ | クライアントによって作成されたすべての TCP ソケットに対してオプション `SO_NODELAY` を設定します。この TCP オプションは、ソケットがデータをできるだけ早くプッシュするようにします。 |
| `setSocketLinger(int secondsToWait)` | - `secondsToWait` - 待機する秒数。 | クライアントによって作成されたすべての TCP ソケットのラングタイムを設定します。 |
| `compressServerResponse(boolean enabled)` | - `enabled` - オプションを有効にすべきかを示すフラグ | サーバーがレスポンスを圧縮するべきかを設定します。 | 
| `compressClientRequest(boolean enabled)` | - `enabled` - オプションを有効にすべきかを示すフラグ | クライアントがリクエストを圧縮するべきかを設定します。 |
| `useHttpCompression(boolean enabled)` | - `enabled` - オプションを有効にすべきかを示すフラグ | 対応するオプションが有効な場合、クライアント/サーバー間の通信に HTTP 圧縮を使用するべきかを設定します。 | 
| `setLZ4UncompressedBufferSize(int size)` | - `size` - バイト単位のサイズ | データストリームから非圧縮部分を受け取るバッファのサイズを設定します。バッファが過小評価されると、新しいものが作成され、ログに警告が表示されます。 | 
| `setDefaultDatabase(String database)` | - `database` - データベースの名前 | デフォルトデータベースを設定します。 |
| `addProxy(ProxyType type, String host, int port)` | - `type` - プロキシの種類。<br /> - `host` - プロキシホスト名または IP アドレス。<br /> - `port` - プロキシポート | サーバーとの通信に使用するプロキシを設定します。プロキシが認証を必要とする場合はプロキシを設定する必要があります。 |
| `setProxyCredentials(String user, String pass)` | - `user` - プロキシユーザー名。<br /> - `pass` - パスワード | プロキシに認証するためのユーザー資格情報を設定します。 |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `timeUnit` - `timeout` の時間単位 | クエリの最大実行タイムアウトを設定します。 |
| `setHttpCookiesEnabled(boolean enabled)` | `enabled` - オプションを有効にすべきかを示すフラグ | HTTP クッキーを記憶し、サーバーに返送するべきかを設定します。 |
| `setSSLTrustStore(String path)` | `path` - ローカル（クライアント側）システム上のファイルパス | クライアントがサーバーホスト検証のために SSL トラストストアを使用するべきかを設定します。 | 
| `setSSLTrustStorePassword(String password)` | `password` - 秘密の値 | `setSSLTrustStore(String path)` で指定された SSL トラストストアを解除するためのパスワードを設定します。 |
| `setSSLTrustStoreType(String type)` | `type` - トラストストアタイプ名 | `setSSLTrustStore(String path)` で指定されたトラストストアのタイプを設定します。 | 
| `setRootCertificate(String path)` | `path` - ローカル（クライアント側）システム上のファイルパス | クライアントが指定されたルート (CA) 証明書をサーバーホスト検証に使用するべきかを設定します。 |
| `setClientCertificate(String path)` | `path` - ローカル（クライアント側）システム上のファイルパス | SSL 接続を開始する際に使用されるクライアント証明書パスを設定します。 |
| `setClientKey(String path)` | `path` - ローカル（クライアント側）システム上のファイルパス | サーバーとの SSL 通信を暗号化するために使用されるクライアントの秘密鍵を設定します。 |
| `useServerTimeZone(boolean useServerTimeZone)` | `useServerTimeZone` - オプションを有効にすべきかを示すフラグ | クライアントが DateTime および Date カラムの値をデコードする際にサーバータイムゾーンを使用するべきかを設定します。これが有効な場合、サーバータイムゾーンは `setServerTimeZone(String timeZone)` によって設定する必要があります。 |
| `useTimeZone(String timeZone)` | `timeZone` - java 有効なタイムゾーン ID の文字列値 (see `java.time.ZoneId`) | 指定されたタイムゾーンを DateTime および Date カラムの値をデコードする際に使用するべきかを設定します。サーバータイムゾーンを上書きします。 |
| `setServerTimeZone(String timeZone)` |  `timeZone` - java 有効なタイムゾーン ID の文字列値 (see `java.time.ZoneId`) | サーバー側のタイムゾーンを設定します。デフォルトで UTC タイムゾーンが使用されます。 | 
| `useAsyncRequests(boolean async)` | `async` - オプションを有効にすべきかを示すフラグ。 | クライアントがリクエストを別スレッドで実行するべきかを設定します。デフォルトでは無効です。アプリケーションはマルチスレッドタスクをどのように整理するかをよりよく知っており、別スレッドでタスクを実行することはパフォーマンスに寄与しません。 | 
| `setSharedOperationExecutor(ExecutorService executorService)` | `executorService` - エグゼキュータサービスのインスタンス。 | 操作タスク用のエグゼキュータサービスを設定します。 | 
| `setClientNetworkBufferSize(int size)` | - `size` - バイト単位のサイズ | ソケットとアプリケーション間でデータを往復コピーするために使用されるアプリケーションメモリ空間のバッファサイズを設定します。大きくすることで TCP スタックへのシステムコールが減りますが、各接続で消費されるメモリに影響します。このバッファも GC の対象となります。接続は短命であるためです。大きな連続したメモリブロックを割り当てることが問題になる可能性があることにも注意してください。デフォルトは `300,000` バイトです。 |
| `retryOnFailures(ClientFaultCause ...causes)` | - `causes` - `com.clickhouse.client.api.ClientFaultCause` の列挙型定数 | 回復可能/再試行可能な故障タイプを設定します。 | 
| `setMaxRetries(int maxRetries)` | - `maxRetries` - 再試行の回数 | `retryOnFailures(ClientFaultCause ...causes)` で定義された失敗に対する最大再試行回数を設定します。 | 
| `allowBinaryReaderToReuseBuffers(boolean reuse)` | - `reuse` - オプションを有効にすべきかを示すフラグ | ほとんどのデータセットは小さなバイトシーケンスとしてエンコードされた数値データを含んでいます。デフォルトでは、リーダーは必要なバッファを割り当て、その中にデータを読み込んでから、ターゲットの Number クラスに変換します。これは、多くの小さなオブジェクトが割り当てられては解放されるため、重大な GC プレッシャーを引き起こす可能性があります。このオプションが有効な場合、リーダーは数値の変換を行うために事前に割り当てられたバッファを使用します。各リーダーは独自のバッファセットを持っており、リーダーは単一スレッドによって使用されるため、安全です。 |
| `httpHeader(String key, String value)` | - `key` - HTTP ヘッダーキー。<br /> - `value` - ヘッダーの文字列値。 | 単一の HTTP ヘッダーの値を設定します。前の値は上書きされます。|
| `httpHeader(String key, Collection values)` | - `key` - HTTP ヘッダーキー。<br /> - `values` - 文字列値のリスト。 | 単一の HTTP ヘッダーの値を設定します。前の値は上書きされます。|
| `httpHeaders(Map headers)` | - `header` - HTTP ヘッダーとその値のマップ。 | 一度に複数の HTTP ヘッダー値を設定します。 |
| `serverSetting(String name, String value)` | - `name` - クエリレベル設定の名前。<br /> - `value` - 設定の文字列値。 | 各クエリに渡す設定を設定します。個別の操作設定がこれを上書きすることがあります。[設定のリスト](/operations/settings/query-level) |
| `serverSetting(String name,  Collection values)` | - `name` - クエリレベル設定の名前。<br /> - `values` - 設定の文字列値。 | 各クエリに渡す設定を設定します。個別の操作設定がこれを上書きすることがあります。[設定のリスト](/operations/settings/query-level)。このメソッドは、[roles](/interfaces/http#setting-role-with-query-parameters) のような複数の値を持つ設定に便利です。 |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - カラムとメソッドのマッチング戦略の実装 | DTO を登録する際に、DTO クラスのフィールドと DB のカラムをマッチングするためのカスタム戦略を設定します。 | 
| `useHTTPBasicAuth(boolean useBasicAuth)` | - `useBasicAuth` - オプションを有効にすべきかを示すフラグ | ユーザー名とパスワードの認証に対して基本 HTTP 認証を使用すべきかを設定します。デフォルトでは有効です。このタイプの認証を使用すると、HTTP ヘッダーで転送できない特殊文字を含むパスワードの問題が解決されます。 |
| `setClientName(String clientName)` | - `clientName` - アプリケーション名を表す文字列 | 呼び出しアプリケーションに関する追加情報を設定します。この文字列は、サーバーにクライアント名として渡されます。HTTP プロトコルの場合は、`User-Agent` ヘッダーとして渡されます。 |
| `useBearerTokenAuth(String bearerToken)` | - `bearerToken` - エンコードされたベアラートークン | ベアラー認証を使用するか、どのトークンを使用するかを指定します。トークンはそのまま送信されるため、事前にエンコードしてからこのメソッドに渡す必要があります。 |
## 共通定義 {#common-definitions}
### ClickHouseFormat {#clickhouseformat}

[サポートされているフォーマット](/interfaces/formats) の列挙型です。ClickHouse がサポートするすべてのフォーマットが含まれています。

* `raw` - ユーザーは生データをトランスコードする必要があります。 
* `full` - クライアントが自分でデータをトランスコードでき、生データストリームを受け入れます。 
* `-` - このフォーマットでは ClickHouse によってサポートされていない操作。

このクライアントバージョンは次をサポートしています:

| フォーマット                                                                                                                 | 入力  | 出力  |
|------------------------------------------------------------------------------------------------------------------------------|:------:|:-------:|
| [TabSeparated](/interfaces/formats#tabseparated)                                                                       | raw    | raw     |
| [TabSeparatedRaw](/interfaces/formats#tabseparatedraw)                                                                 | raw    | raw     |
| [TabSeparatedWithNames](/interfaces/formats#tabseparatedwithnames)                                                   | raw    | raw     |
| [TabSeparatedWithNamesAndTypes](/interfaces/formats#tabseparatedwithnamesandtypes)                                   | raw    | raw     |
| [TabSeparatedRawWithNames](/interfaces/formats#tabseparatedrawwithnames)                                             | raw    | raw     |
| [TabSeparatedRawWithNamesAndTypes](/interfaces/formats#tabseparatedrawwithnamesandtypes)                             | raw    | raw     |
| [Template](/interfaces/formats#format-template)                                                                        | raw    | raw     |
| [TemplateIgnoreSpaces](/interfaces/formats#templateignorespaces)                                                       | raw    |  -      |
| [CSV](/interfaces/formats#csv)                                                                                         | raw    | raw     |
| [CSVWithNames](/interfaces/formats#csvwithnames)                                                                       | raw    | raw     |
| [CSVWithNamesAndTypes](/interfaces/formats#csvwithnamesandtypes)                                                       | raw    | raw     |
| [CustomSeparated](/interfaces/formats#format-customseparated)                                                        | raw    | raw     |
| [CustomSeparatedWithNames](/interfaces/formats#customseparatedwithnames)                                             | raw    | raw     |
| [CustomSeparatedWithNamesAndTypes](/interfaces/formats#customseparatedwithnamesandtypes)                             | raw    | raw     |
| [SQLInsert](/interfaces/formats#sqlinsert)                                                                             | -      | raw     |
| [Values](/interfaces/formats#data-format-values)                                                                       | raw    | raw     |
| [Vertical](/interfaces/formats#vertical)                                                                               | -      | raw     |
| [JSON](/interfaces/formats#json)                                                                                       | raw    | raw     |
| [JSONAsString](/interfaces/formats#jsonasstring)                                                                       | raw    | -       |
| [JSONAsObject](/interfaces/formats#jsonasobject)                                                                       | raw    | -       |
| [JSONStrings](/interfaces/formats#jsonstrings)                                                                         | raw    | raw     |
| [JSONColumns](/interfaces/formats#jsoncolumns)                                                                         | raw    | raw     |
| [JSONColumnsWithMetadata](/interfaces/formats#jsoncolumnsmonoblock)                                                    | raw    | raw     |
| [JSONCompact](/interfaces/formats#jsoncompact)                                                                         | raw    | raw     |
| [JSONCompactStrings](/interfaces/formats#jsoncompactstrings)                                                           | -      | raw     |
| [JSONCompactColumns](/interfaces/formats#jsoncompactcolumns)                                                           | raw    | raw     |
| [JSONEachRow](/interfaces/formats#jsoneachrow)                                                                         | raw    | raw     |
| [PrettyJSONEachRow](/interfaces/formats#prettyjsoneachrow)                                                             | -      | raw     |
| [JSONEachRowWithProgress](/interfaces/formats#jsoneachrowwithprogress)                                                 | -      | raw     |
| [JSONStringsEachRow](/interfaces/formats#jsonstringseachrow)                                                           | raw    | raw     |
| [JSONStringsEachRowWithProgress](/interfaces/formats#jsonstringseachrowwithprogress)                                   | -      | raw     |
| [JSONCompactEachRow](/interfaces/formats#jsoncompacteachrow)                                                           | raw    | raw     |
| [JSONCompactEachRowWithNames](/interfaces/formats#jsoncompacteachrowwithnames)                                         | raw    | raw     |
| [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats#jsoncompacteachrowwithnamesandtypes)                          | raw    | raw     |
| [JSONCompactStringsEachRow](/interfaces/formats#jsoncompactstringseachrow)                                             | raw    | raw     |
| [JSONCompactStringsEachRowWithNames](/interfaces/formats#jsoncompactstringseachrowwithnames)                           | raw    | raw     |
| [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats#jsoncompactstringseachrowwithnamesandtypes)           | raw    | raw     |
| [JSONObjectEachRow](/interfaces/formats#jsonobjecteachrow)                                                             | raw    | raw     |
| [BSONEachRow](/interfaces/formats#bsoneachrow)                                                                         | raw    | raw     |
| [TSKV](/interfaces/formats#tskv)                                                                                       | raw    | raw     |
| [Pretty](/interfaces/formats#pretty)                                                                                   | -      | raw     |
| [PrettyNoEscapes](/interfaces/formats#prettynoescapes)                                                                 | -      | raw     |
| [PrettyMonoBlock](/interfaces/formats#prettymonoblock)                                                               | -      | raw     |
| [PrettyNoEscapesMonoBlock](/interfaces/formats#prettynoescapesmonoblock)                                             | -      | raw     |
| [PrettyCompact](/interfaces/formats#prettycompact)                                                                     | -      | raw     |
| [PrettyCompactNoEscapes](/interfaces/formats#prettycompactnoescapes)                                                 | -      | raw     |
| [PrettyCompactMonoBlock](/interfaces/formats#prettycompactmonoblock)                                                 | -      | raw     |
| [PrettyCompactNoEscapesMonoBlock](/interfaces/formats#prettycompactnoescapesmonoblock)                               | -      | raw     |
| [PrettySpace](/interfaces/formats#prettyspace)                                                                        | -      | raw     |
| [PrettySpaceNoEscapes](/interfaces/formats#prettyspacenoescapes)                                                     | -      | raw     |
| [PrettySpaceMonoBlock](/interfaces/formats#prettyspacemonoblock)                                                     | -      | raw     |
| [PrettySpaceNoEscapesMonoBlock](/interfaces/formats#prettyspacenoescapesmonoblock)                                   | -      | raw     |
| [Prometheus](/interfaces/formats#prometheus)                                                                          | -      | raw     |
| [Protobuf](/interfaces/formats#protobuf)                                                                              | raw    | raw     |
| [ProtobufSingle](/interfaces/formats#protobufsingle)                                                                  | raw    | raw     |
| [ProtobufList](/interfaces/formats#protobuflist)                                                                       | raw    | raw     |
| [Avro](/interfaces/formats#data-format-avro)                                                                          | raw    | raw     |
| [AvroConfluent](/interfaces/formats#data-format-avro-confluent)                                                       | raw    | -       |
| [Parquet](/interfaces/formats#data-format-parquet)                                                                    | raw    | raw     |
| [ParquetMetadata](/interfaces/formats#data-format-parquet-metadata)                                                  | raw    | -       |
| [Arrow](/interfaces/formats#data-format-arrow)                                                                        | raw    | raw     |
| [ArrowStream](/interfaces/formats#data-format-arrow-stream)                                                           | raw    | raw     |
| [ORC](/interfaces/formats#data-format-orc)                                                                            | raw    | raw     |
| [One](/interfaces/formats#data-format-one)                                                                            | raw    | -       |
| [Npy](/interfaces/formats#data-format-npy)                                                                            | raw    | raw     |
| [RowBinary](/interfaces/formats#rowbinary)                                                                            | full   | full    |
| [RowBinaryWithNames](/interfaces/formats#rowbinarywithnamesandtypes)                                                 | full   | full    |
| [RowBinaryWithNamesAndTypes](/interfaces/formats#rowbinarywithnamesandtypes)                                         | full   | full    |
| [RowBinaryWithDefaults](/interfaces/formats#rowbinarywithdefaults)                                                   | full   | -       |
| [Native](/interfaces/formats#native)                                                                                  | full   | raw     |
| [Null](/interfaces/formats#null)                                                                                      | -      | raw     |
| [XML](/interfaces/formats#xml)                                                                                        | -      | raw     |
| [CapnProto](/interfaces/formats#capnproto)                                                                           | raw    | raw     |
| [LineAsString](/interfaces/formats#lineasstring)                                                                     | raw    | raw     |
| [Regexp](/interfaces/formats#data-format-regexp)                                                                     | raw    | -       |
| [RawBLOB](/interfaces/formats#rawblob)                                                                                | raw    | raw     |
| [MsgPack](/interfaces/formats#msgpack)                                                                                | raw    | raw     |
| [MySQLDump](/interfaces/formats#mysqldump)                                                                            | raw    | -       |
| [DWARF](/interfaces/formats#dwarf)                                                                                    | raw    | -       |
| [Markdown](/interfaces/formats#markdown)                                                                              | -      | raw     |
| [Form](/interfaces/formats#form)                                                                                      | raw    | -       |
## 挿入 API {#insert-api}
### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

指定されたフォーマットのバイトデータを `InputStream` として受け取ります。`data` が `format` でエンコードされていることが期待されます。

**シグネチャ**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**パラメータ**

`tableName` - 対象となるテーブル名。

`data` - エンコードされたデータの入力ストリーム。

`format` - データがエンコードされているフォーマット。

`settings` - リクエストの設定。

**返り値**

`InsertResponse` 型の将来のオブジェクト - 操作の結果とサーバーメトリクスなどの追加情報。

**例**

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

データベースに書き込みリクエストを送信します。オブジェクトのリストは効率的なフォーマットに変換され、サーバーに送信されます。リストアイテムのクラスは `register(Class, TableSchema)` メソッドを使用して事前に登録されている必要があります。

**シグネチャ**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**パラメータ**

`tableName` - 対象となるテーブルの名前。

`data` - コレクション DTO (データ転送オブジェクト) オブジェクト。

`settings` - リクエストの設定。

**返り値**

`InsertResponse` 型の将来のオブジェクト - 操作の結果とサーバーメトリクスなどの追加情報。

**例**

```java showLineNumbers
// 重要なステップ（1回実行） - テーブルスキーマに従ってオブジェクトシリアライザを事前にコンパイルするためにクラスを登録します。 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));

List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // レスポンスを処理後、クローズされ、リクエストを提供した接続が解放されます。 
}
```

### InsertSettings {#insertsettings}

挿入操作の設定オプション。

**設定メソッド**

| メソッド                                       | 説明                                                                                                   |
|------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                   | 操作に割り当てられるクエリIDを設定します。デフォルト: `null`。                                            |
| `setDeduplicationToken(String token)`          | 重複排除トークンを設定します。このトークンはサーバーに送信され、クエリを識別するために使用されます。デフォルト: `null`。 |
| `setInputStreamCopyBufferSize(int size)`       | コピーバッファサイズ。バッファはユーザー提供の入力ストリームから出力ストリームへデータをコピーする際に使用されます。デフォルト: `8196`。 |
| `serverSetting(String name, String value)`     | 操作のための個別のサーバー設定を設定します。                                                             |
| `serverSetting(String name, Collection values)` | 複数の値に対する個別のサーバー設定を設定します。コレクションのアイテムは `String` 値であるべきです。               |
| `setDBRoles(Collection dbRoles)`               | 操作を実行する前に設定されるDBロールを設定します。コレクションのアイテムは `String` 値であるべきです。               |
| `setOption(String option, Object value)`       | 生の形式で設定オプションを設定します。これはサーバー設定ではありません。                                           |

### InsertResponse {#insertresponse}

挿入操作の結果を保持するレスポンスオブジェクト。クライアントがサーバーからレスポンスを受け取った場合にのみ利用可能です。

:::note
このオブジェクトは、以前のレスポンスのすべてのデータが完全に読み取られるまで再利用できないため、できるだけ早く閉じる必要があります。
:::

| メソッド                          | 説明                                                                                          |
|---------------------------------------|------------------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()`       | 操作メトリクスを持つオブジェクトを返します。                                                 |
| `String getQueryId()`                 | 操作にアプリケーションによって割り当てられたクエリIDを返します（操作設定またはサーバーによって）。 |

## Query API {#query-api}
### query(String sqlQuery) {#querystring-sqlquery}

`sqlQuery` をそのまま送信します。レスポンスフォーマットはクエリ設定によって設定されます。`QueryResponse` は指定されたフォーマットをサポートするリーダーによって消費されるべきレスポンスストリームへのリファレンスを保持します。

**シグネチャ**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**パラメータ**

`sqlQuery` - 単一のSQLステートメント。クエリはそのままサーバーに送信されます。  

`settings` - リクエスト設定。

**返り値**

`QueryResponse` 型の将来のオブジェクト - 結果データセットとサーバーメトリクスなどの追加情報。レスポンスオブジェクトはデータセットを消費した後に閉じる必要があります。

**例**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// デフォルトのフォーマットは RowBinaryWithNamesAndTypesFormatReader ですので、リーダーはカラムに関するすべての情報を持っています。
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // データに便利にアクセスするためのリーダーを作成する
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み取り、解析します

        // 値を取得
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // データを収集 
    }
} catch (Exception e) {
    log.error("Failed to read data", e);
}

// HTTP接続をできるだけ早く解放するためにビジネスロジックを読み取りブロックの外に置く。  
```

### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

`sqlQuery` をそのまま送信します。さらに、クエリパラメータを送信し、サーバーがSQL式をコンパイルできるようにします。

**シグネチャ**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**パラメータ**

`sqlQuery` - プレースホルダー `{}` を含むSQL式。

`queryParams` - サーバーでSQL式を補完するための変数のマップ。

`settings` - リクエスト設定。 

**返り値**

`QueryResponse` 型の将来のオブジェクト - 結果データセットとサーバーメトリクスなどの追加情報。レスポンスオブジェクトはデータセットを消費した後に閉じる必要があります。

**例**

```java showLineNumbers

// パラメータを定義します。これらはリクエストとともにサーバーに送信されます。   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // データに便利にアクセスするためのリーダーを作成する
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み取り、解析します

        // データを読み取る 
    }

} catch (Exception e) {
    log.error("Failed to read data", e);
}
```

### queryAll(String sqlQuery) {#queryallstring-sqlquery}

`RowBinaryWithNamesAndTypes` フォーマットでデータをクエリします。結果はコレクションとして返されます。読み取り性能はリーダーと同様ですが、全データセットを保持するためにより多くのメモリが必要です。

**シグネチャ**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**パラメータ**

`sqlQuery` - サーバーからデータをクエリするためのSQL式。

**返り値**

`GenericRecord` オブジェクトのリストによって表される完全なデータセット。このオブジェクトは結果データの行スタイルでのアクセスを提供します。

**例**

```java showLineNumbers
try {
    log.info("Reading whole table and process record by record");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // 結果セット全体を読み取り、レコードごとに処理します
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

クエリ操作の設定オプション。

**設定メソッド**

| メソッド                                       | 説明                                                                                                   |
|------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                   | 操作に割り当てられるクエリIDを設定します。                                                            |
| `setFormat(ClickHouseFormat format)`           | レスポンスフォーマットを設定します。完全なリストについては `RowBinaryWithNamesAndTypes` を参照します。        |
| `setMaxExecutionTime(Integer maxExecutionTime)` | サーバー上の操作実行時間を設定します。読み取りタイムアウトには影響しません。                             |
| `waitEndOfQuery(Boolean waitEndOfQuery)`       | サーバーにレスポンスを送信する前にクエリの終了を待つようリクエストします。                                |
| `setUseServerTimeZone(Boolean useServerTimeZone)` | サーバーのタイムゾーン（クライアント設定参照）が結果の日時型を解析するために使用されます。デフォルトは `false`。 |
| `setUseTimeZone(String timeZone)`              | サーバーに `timeZone` を使用して時間変換を行うようリクエストします。詳細は [session_timezone](/operations/settings/settings#session_timezone) を参照してください。 |
| `serverSetting(String name, String value)`     | 操作のための個別のサーバー設定を設定します。                                                             |
| `serverSetting(String name, Collection values)` | 複数の値に対する個別のサーバー設定を設定します。コレクションのアイテムは `String` 値であるべきです。              |
| `setDBRoles(Collection dbRoles)`               | 操作を実行する前に設定されるDBロールを設定します。コレクションのアイテムは `String` 値であるべきです。              |
| `setOption(String option, Object value)`       | 生の形式で設定オプションを設定します。これはサーバー設定ではありません。                                   |

### QueryResponse {#queryresponse}

クエリ実行の結果を保持するレスポンスオブジェクト。クライアントがサーバーからレスポンスを受け取った場合にのみ利用可能です。

:::note
このオブジェクトは、以前のレスポンスのすべてのデータが完全に読み取られるまで再利用できないため、できるだけ早く閉じる必要があります。
:::

| メソッド                              | 説明                                                                                          |
|---------------------------------------|------------------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`        | レスポンス内のデータがエンコードされているフォーマットを返します。                                          |
| `InputStream getInputStream()`        | 指定されたフォーマットでのデータの非圧縮バイトストリームを返します。                                     |
| `OperationMetrics getMetrics()`       | 操作メトリクスを持つオブジェクトを返します。                                                     |
| `String getQueryId()`                 | 操作にアプリケーションによって割り当てられたクエリIDを返します（操作設定またはサーバーによって）。      |
| `TimeZone getTimeZone()`              | レスポンスにおける Date/DateTime 型の処理に使用されるタイムゾーンを返します。                          |

### Examples {#examples}

- 例のコードは [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) にあります。
- Spring Service の [実装](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) を参照してください。

## Common API {#common-api}
### getTableSchema(String table) {#gettableschemastring-table}

指定された `table` のテーブルスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**パラメータ**

`table` - スキーマデータを取得するテーブル名。

`database` - 対象テーブルが定義されているデータベース。

**返り値**

テーブルカラムのリストを持つ `TableSchema` オブジェクトを返します。

### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

SQLステートメントからスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**パラメータ**

`sql` - スキーマを返すべき "SELECT" SQL ステートメント。

**返り値**

`sql` 式に一致するカラムを持つ `TableSchema` オブジェクトを返します。

### TableSchema {#tableschema}
### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

データを書き込み/読み取りに使用されるJavaクラスのシリアル化およびデシリアル化層をコンパイルします。このメソッドはペアのゲッター/セッターと対応するカラムのためのシリアライザーとデシリアライザーを作成します。カラムのマッチングは、メソッド名からその名前を抽出することによって行われます。たとえば、`getFirstName` はカラム `first_name` または `firstname` になります。

**シグネチャ**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**パラメータ**

`clazz` - データを読み書きするために使用されるPOJOを表すクラス。

`schema` - POJOプロパティとのマッチングに使用されるデータスキーマ。

**例**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## Usage Examples {#usage-examples}

完全な例のコードはリポジトリの 'example` フォルダに格納されています:

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - 主な例のセット。
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - Spring Boot アプリケーションでクライアントを使用する方法の例。
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - Ktor (Kotlin) アプリケーションでクライアントを使用する方法の例。
