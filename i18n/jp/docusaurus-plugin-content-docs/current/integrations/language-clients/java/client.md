---
sidebar_label: 'クライアント 0.8+'
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: 'Java ClickHouse Connector 0.8+'
slug: /integrations/language-clients/java/client
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java Client (0.8+)

Javaクライアントライブラリは、DBサーバーとそのプロトコルを通じて通信するためのものです。現在の実装では、[HTTPインターフェース](/interfaces/http)のみをサポートしています。
このライブラリは、サーバーへのリクエストを送信するための独自のAPIを提供し、さまざまなバイナリデータ形式（RowBinary* & Native*）で作業するためのツールも提供します。

:::note
以前のバージョンのJavaクライアントドキュメントを探している場合は、[こちら](/integrations/language-clients/java/client-v1.md)をご覧ください。
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
## 初期化 {#initialization}

Clientオブジェクトは `com.clickhouse.client.api.Client.Builder#build()` によって初期化されます。各クライアントには独自のコンテキストがあり、オブジェクトは共有されません。
Builderには便利な設定のための設定メソッドがあります。

例:
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client`は`AutoCloseable`であり、不要になったら閉じる必要があります。
### 認証 {#authentication}

認証は初期化フェーズでクライアントごとに設定されます。サポートされている認証方法は3つあります：パスワード、アクセストークン、SSLクライアント証明書によるものです。

パスワードによる認証は、ユーザー名のパスワードを設定する必要があり、`setUsername(String)` と `setPassword(String)` を呼び出します。
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

アクセストークンによる認証は、`setAccessToken(String)` を呼び出してアクセストークンを設定する必要があります。
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

SSLクライアント証明書による認証は、ユーザー名を設定し、SSL認証を有効にし、`setUsername(String)`、`useSSLAuthentication(boolean)`、`setClientCertificate(String)` および `setClientKey(String)`を呼び出してクライアント証明書とクライアントキーを設定する必要があります。
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
SSL認証は、本番環境でのトラブルシューティングが難しい場合があります。SSLライブラリからの多くのエラーは、十分な情報を提供しません。例えば、クライアント証明書とキーが一致しない場合、サーバーは接続を即座に切断します（HTTPの場合、これはHTTPリクエストが送信されておらず、レスポンスが送信されていない接続の初期化段階です）。

[openssl](https://docs.openssl.org/master/man1/openssl/)のようなツールを使用して証明書とキーを検証してください：
- キーの整合性を確認する: `openssl rsa -in [key-file.key] -check -noout`
- クライアント証明書がユーザーのCNと一致していることを確認する：
    - ユーザー証明書からCNを取得する - `openssl x509 -noout -subject -in [user.cert]`
    - データベースに設定されている同じ値が指定されていることを確認する `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'`（クエリは `auth_params` に `{"common_names":["some_user"]}` のような値を出力します）。

:::
## 構成 {#configuration}

すべての設定は、各値のスコープとコンテキストを明示的にするインスタンスメソッド（いわゆる設定メソッド）によって定義されます。
主要な構成パラメータは1つのスコープ（クライアントまたは操作）で定義され、お互いにオーバーライドされることはありません。

構成はクライアント作成時に定義されます。 `com.clickhouse.client.api.Client.Builder` を参照してください。
## クライアント構成 {#client-configuration}

| 設定メソッド                     | 引数                                            | 説明                                      |
|---------------------------------------|:-----------------------------------------------|:--------------------------------------------|
| `addEndpoint(String endpoint)`        | - `enpoint` - サーバーアドレスをフォーマットしたURL。 | 利用可能なサーバーのエンドポイントをリストに追加します。現在は1つのエンドポイントのみがサポートされています。 |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - 接続プロトコル `com.clickhouse.client.api.enums.Protocol#HTTP`。<br />- `host` - サーバーのIPまたはホスト名。<br />- `secure` - 通信がプロトコルの安全なバージョン（HTTPS）を使用する必要がある場合。 | 利用可能なサーバーのエンドポイントをリストに追加します。現在は1つのエンドポイントのみがサポートされています。 |
| `setOption(String key, String value)` | - `key` - クライアント設定オプションの文字列キー。<br /> - `value` - オプションの文字列値 | クライアントオプションの生の値を設定します。プロパティファイルから設定を読み込む際に便利です。 | 
| `setUsername(String username)`      | - `username` - 認証に使用するユーザー名       | 後で設定された認証メソッドのためのユーザー名を設定します。 | 
| `setPassword(String password)`      | - `password` - パスワード認証用の秘密の値   | パスワード認証用の秘密を設定し、実質的に認証メソッドを選択します。 |
| `setAccessToken(String accessToken)` | - `accessToken` - アクセストークンの文字列表現 | 対応する認証メソッドを使用して認証するためのアクセストークンを設定します。 |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - SSL認証を使用する必要があるかどうかを示すフラグ | SSLクライアント証明書を認証メソッドとして設定します。 |
| `enableConnectionPool(boolean enable)` | - `enable` - オプションを有効にすべきかどうかを示すフラグ | コネクションプールが有効であるかどうかを設定します。 |
| `setConnectTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 任意のアウトゴイングコネクションの接続開始タイムアウトを設定します。これは、ソケット接続を取得する際の待機時間に影響を与えます。 |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 接続リクエストのタイムアウトを設定します。これは、プールから接続を取得する際にのみ有効となります。 |
| `setMaxConnections(int maxConnections)` | - `maxConnections` - 接続数                 | 各サーバーエンドポイントに対してクライアントが開くことができる接続数を設定します。 |
| `setConnectionTTL(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 接続が非アクティブと見なされる接続のTTLを設定します。 |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | HTTP接続のキープアライブタイムアウトを設定します。このオプションは、タイムアウトをゼロ（`0`）に設定することでキープアライブを無効にするために使用できます。 |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - enum `com.clickhouse.client.api.ConnectionReuseStrategy` 定数 | コネクションプールが使用すべき戦略を選択します：接続がプールに戻されたときに即座に再利用されるべきであるなら `LIFO`、または接続が利用可能になる順番で使用されるべきであるなら `FIFO`です（戻された接続は即座には使用されません）。 |
| `setSocketTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 読み取りおよび書き込み操作に影響を与えるソケットタイムアウトを設定します。 | 
| `setSocketRcvbuf(long size)` | - `size` - バイト単位のサイズ           | TCPソケット受信バッファのサイズを設定します。このバッファはJVMメモリの外です。 |
| `setSocketSndbuf(long size)` | - `size` - バイト単位のサイズ           | TCPソケット送信バッファのサイズを設定します。このバッファはJVMメモリの外です。 |
| `setSocketKeepAlive(boolean value)` | - `value` - オプションを有効にすべきかどうかを示すフラグ。 | クライアントによって作成された各TCPソケットに対して `SO_KEEPALIVE`オプションを設定します。TCPキープアライブは、接続の生存性を確認するメカニズムを有効にし、突然の切断を検出するのに役立ちます。 | 
| `setSocketTcpNodelay(boolean value)` | - `value` - オプションを有効にすべきかどうかを示すフラグ。 | クライアントによって作成された各TCPソケットの `SO_NODELAY`オプションを設定します。このTCPオプションは、ソケットがデータをできるだけ早くプッシュするようにします。 |
| `setSocketLinger(int secondsToWait)` | - `secondsToWait` - 待機する秒数         | クライアントによって作成された各TCPソケットのリンガー時間を設定します。 |
| `compressServerResponse(boolean enabled)` | - `enabled` - オプションを有効にすべきかどうかを示すフラグ | サーバーがそのレスポンスを圧縮すべきかどうかを設定します。 | 
| `compressClientRequest(boolean enabled)` | - `enabled` - オプションを有効にすべきかどうかを示すフラグ | クライアントがそのリクエストを圧縮すべきかどうかを設定します。 |
| `useHttpCompression(boolean enabled)` | - `enabled` - オプションを有効にすべきかどうかを示すフラグ | 対応するオプションが有効な場合に、クライアント/サーバー間の通信にHTTP圧縮を使用すべきかどうかを設定します。 | 
| `setLZ4UncompressedBufferSize(int size)` | - `size` - バイト単位のサイズ           | データストリームの非圧縮部分を受信するためのバッファのサイズを設定します。バッファが過小評価された場合は、新しいバッファが作成され、それに関する警告がログに表示されることになります。 | 
| `setDefaultDatabase(String database)` | - `database` - データベースの名前       | デフォルトのデータベースを設定します。 |
| `addProxy(ProxyType type, String host, int port)` | - `type` - プロキシタイプ。<br /> - `host` - プロキシのホスト名またはIPアドレス。<br /> - `port` - プロキシポート | サーバーとの通信に使用するプロキシを設定します。プロキシが認証を必要とする場合、プロキシの設定が必要です。 |
| `setProxyCredentials(String user, String pass)` | - `user` - プロキシユーザー名。<br /> - `pass` - パスワード | プロキシで認証するためのユーザー資格情報を設定します。 |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `timeUnit` - `timeout`の時間単位 | クエリの最大実行タイムアウトを設定します。 |
| `setHttpCookiesEnabled(boolean enabled)` | `enabled` - オプションを有効にすべきかどうかを示すフラグ | HTTPクッキーを記憶し、サーバーに返送すべきかどうかを設定します。 |
| `setSSLTrustStore(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | クライアントがサーバーホストの検証にSSLトラストストアを使用すべきかどうかを設定します。 |
| `setSSLTrustStorePassword(String password)` | `password` - 秘密の値                | `setSSLTrustStore(String path)`で指定されたSSLトラストストアを解除するために使用されるパスワードを設定します。 |
| `setSSLTrustStoreType(String type)` | `type` - トラストストアのタイプ名      | `setSSLTrustStore(String path)`で指定されたトラストストアのタイプを設定します。 |
| `setRootCertificate(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | サーバーホストの検証に指定されたルート（CA）証明書を使用するべきかどうかを設定します。 |
| `setClientCertificate(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | SSL接続を開始する際に使用されるクライアント証明書のパスを設定し、SSL認証に使用します。 |
| `setClientKey(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | サーバーとのSSL通信の暗号化に使用されるクライアントの秘密鍵を設定します。 |
| `useServerTimeZone(boolean useServerTimeZone)` | `useServerTimeZone` - オプションを有効にすべきかどうかを示すフラグ | 日付と日時カラムの値をデコードする際に、クライアントがサーバータイムゾーンを使用すべきかどうかを設定します。有効にした場合、サーバーのタイムゾーンは `setServerTimeZone(String timeZone)` で設定される必要があります。 |
| `useTimeZone(String timeZone)` | `timeZone` - javaの有効なタイムゾーンIDの文字列値 (see `java.time.ZoneId`) | 日付と日時カラムの値をデコードする際に、指定されたタイムゾーンを使用すべきかどうかを設定します。サーバーのタイムゾーンをオーバーライドします。 |
| `setServerTimeZone(String timeZone)` |  `timeZone` - javaの有効なタイムゾーンIDの文字列値 (see `java.time.ZoneId`) | サーバー側のタイムゾーンを設定します。デフォルトではUTCタイムゾーンが使用されます。 |
| `useAsyncRequests(boolean async)` | `async` - オプションを有効にすべきかどうかを示すフラグ | クライアントが別のスレッドでリクエストを実行すべきかどうかを設定します。デフォルトでは無効です。なぜなら、アプリケーションはマルチスレッドタスクをどのように組織するかをよりよく知っており、別のスレッドで実行することはパフォーマンスの向上には繋がらないためです。 |
| `setSharedOperationExecutor(ExecutorService executorService)` | `executorService` - 実行サービスのインスタンス。 | 操作タスクのための実行サービスを設定します。 |
| `setClientNetworkBufferSize(int size)` | - `size` - バイト単位のサイズ           | ソケットとアプリケーション間でデータを往復するために使用されるアプリケーションメモリ空間内のバッファのサイズを設定します。これを大きくすると、TCPスタックへのシステムコールが減少しますが、各接続にどれだけのメモリが費やされるかに影響します。このバッファはGCの影響を受けるため、接続は短命です。また、大きな連続的メモリブロックを割り当てることが問題になる可能性があることにも留意してください。デフォルトは `300,000` バイトです。 |
| `retryOnFailures(ClientFaultCause ...causes)` | - `causes` - enum定数 `com.clickhouse.client.api.ClientFaultCause` | 回復可能または再試行可能な障害タイプを設定します。 | 
| `setMaxRetries(int maxRetries)` | - `maxRetries` - 再試行回数           | `retryOnFailures(ClientFaultCause ...causes)` で定義された障害に対して最大再試行回数を設定します。 | 
| `allowBinaryReaderToReuseBuffers(boolean reuse)` | - `reuse` - オプションを有効にすべきかどうかを示すフラグ | 多くのデータセットは、少量のバイトシーケンスとしてエンコードされた数値データを含みます。デフォルトではリーダーは必要なバッファを割り当て、データをそこに読み込んだ後、ターゲットのNumberクラスに変換します。これにより、多くの小さなオブジェクトが割り当てられ解放されるため、GCの圧力が大きくなる可能性があります。このオプションが有効な場合、リーダーは数値のトランスコーディングを行うために事前に確保されたバッファを使用します。これは、各リーダーが独自のバッファセットを持ち、リーダーは1つのスレッドによって使用されるため、安全です。 |
| `httpHeader(String key, String value)` | - `key` - HTTPヘッダーキー。<br /> - `value` - ヘッダーの文字列値。 | 単一のHTTPヘッダーの値を設定します。以前の値は上書きされます。 |
| `httpHeader(String key, Collection values)` | - `key` - HTTPヘッダーキー。<br /> - `values` - 文字列値のリスト。 | 単一のHTTPヘッダーの値を設定します。以前の値は上書きされます。 |
| `httpHeaders(Map headers)` | - `header` - HTTPヘッダーとその値のマップ。 | 一度に複数のHTTPヘッダーの値を設定します。 |
| `serverSetting(String name, String value)` | - `name` - クエリレベル設定の名前。<br /> - `value` - 設定の文字列値。 | 各クエリとともにサーバーに渡す設定を設定します。個々の操作の設定がこれをオーバーライドする可能性があります。 [設定のリスト](/operations/settings/query-level) |
| `serverSetting(String name,  Collection values)` | - `name` - クエリレベル設定の名前。<br /> - `values` - 設定の文字列値。 | 各クエリとともにサーバーに渡す設定を設定します。個々の操作の設定がこれをオーバーライドする可能性があります。 [設定のリスト](/operations/settings/query-level)。このメソッドは複数の値を持つ設定を設定するのに便利です。例えば、[ロール](/interfaces/http#setting-role-with-query-parameters)。 |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - カラムとメソッドのマッチング戦略の実装 | DTO登録時にDTOクラスのフィールドとDBカラムをマッチングするために使用されるカスタム戦略を設定します。 | 
| `useHTTPBasicAuth(boolean useBasicAuth)` | - `useBasicAuth` - オプションを有効にすべきかどうかを示すフラグ | ユーザー名とパスワードによる認証のために基本的なHTTP認証を使用すべきかどうかを設定します。デフォルトは有効です。このタイプの認証を使用すると、HTTPヘッダーを超えて転送できない特殊文字を含むパスワードに関する問題を解決します。 |
| `setClientName(String clientName)` | - `clientName` - アプリケーション名を表す文字列 | 呼び出しアプリケーションに関する追加情報を設定します。この文字列は、クライアント名としてサーバーに渡されます。HTTPプロトコルの場合、`User-Agent`ヘッダーとして渡されます。 |
| `useBearerTokenAuth(String bearerToken)` | - `bearerToken` - エンコードされたベアラートークン | ベアラー認証を使用するか、どのトークンを使用するかを指定します。このトークンはそのまま送信されるため、伝送する前にエンコードする必要があります。 |
## 共通定義 {#common-definitions}
### ClickHouseFormat {#clickhouseformat}

[サポートされているフォーマット](/interfaces/formats)の列挙型。ClickHouseがサポートするすべてのフォーマットが含まれています。

* `raw` - ユーザーは生データをトランスコーディングする必要があります
* `full` - クライアントはデータを独自にトランスコードでき、生データストリームを受け入れます
* `-` - このフォーマットに対してClickHouseがサポートしていない操作

このクライアントバージョンは次のフォーマットをサポートしています：

| フォーマット                                                                                                                       | 入力  | 出力  |
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
| [ProtobufList](/interfaces/formats#protobuflist)                                                                     | raw    | raw     |
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
## インサートAPI {#insert-api}

### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

指定された形式の`InputStream`としてデータを受け入れます。`data`は`format`でエンコードされていることが期待されます。

**シグネチャ**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**パラメーター**

`tableName` - 対象テーブルの名前。

`data` - エンコードされたデータの入力ストリーム。

`format` - データがエンコードされている形式。

`settings` - リクエスト設定。

**戻り値**

`InsertResponse`型のFuture - 操作の結果とサーバー側のメトリックなどの追加情報。

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

データベースに書き込みリクエストを送信します。オブジェクトのリストは効率的な形式に変換され、その後サーバーに送信されます。リストアイテムのクラスは、`register(Class, TableSchema)`メソッドを使用して事前に登録する必要があります。

**シグネチャ**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**パラメーター**

`tableName` - 対象テーブルの名前。 

`data` - DTO（データ転送オブジェクト）オブジェクトのコレクション。

`settings` - リクエスト設定。

**戻り値**

`InsertResponse`型のFuture - 操作の結果とサーバー側のメトリックなどの追加情報。

**例**

```java showLineNumbers
// 重要なステップ（1回行う） - テーブルスキーマに従ってオブジェクトシリアライザーを事前コンパイルするためにクラスを登録します。 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));

List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // レスポンスを処理します。その後、レスポンスは閉じられ、リクエストを処理した接続が解放されます。 
}
```
### InsertSettings {#insertsettings}

挿入操作のための設定オプション。

**設定メソッド**

| メソッド                                         | 説明                                                                                     |
|-------------------------------------------------|------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                      | 操作に割り当てられるクエリIDを設定します。デフォルト: `null`。                            |
| `setDeduplicationToken(String token)`             | 重複排除トークンを設定します。このトークンはサーバーに送信され、クエリを識別するのに使用できます。デフォルト: `null`。 |
| `setInputStreamCopyBufferSize(int size)`          | コピーバッファサイズ。バッファは、ユーザーが提供する入力ストリームから出力ストリームにデータをコピーするために使用されます。デフォルト: `8196`。 |
| `serverSetting(String name, String value)`        | 操作のための個別のサーバー設定を設定します。                                            |
| `serverSetting(String name, Collection values)`    | 操作のための複数の値を持つ個別のサーバー設定を設定します。コレクションの項目は`String`値である必要があります。 |
| `setDBRoles(Collection dbRoles)`                  | 操作を実行する前に設定されるDBロールを設定します。コレクションの項目は`String`値である必要があります。           |
| `setOption(String option, Object value)`          | 生の形式で設定オプションを設定します。これはサーバー設定ではありません。               |
### InsertResponse {#insertresponse}

挿入操作の結果を保持するレスポンスオブジェクト。クライアントがサーバーからのレスポンスを受け取った場合にのみ使用できます。

:::note
このオブジェクトは、接続を解放するためにできるだけ早く閉じる必要があります。前のレスポンスのすべてのデータが完全に読み取られるまで、その接続は再利用できません。
:::

| メソッド                       | 説明                                                                                     |
|-------------------------------|------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()`  | 操作メトリックを持つオブジェクトを返します。                                           |
| `String getQueryId()`         | アプリケーションによって操作に割り当てられたクエリIDを返します（操作設定またはサーバーによって）。 |
## Query API {#query-api}
### query(String sqlQuery) {#querystring-sqlquery}

そのまま`sqlQuery`を送信します。レスポンス形式はクエリ設定によって設定されます。`QueryResponse`は、サポートされている形式のレスポンスストリームへの参照を保持します。

**シグネチャ**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**パラメーター**

`sqlQuery` - 単一のSQL文。クエリはそのままサーバーに送信されます。  

`settings` - リクエスト設定。

**戻り値**

`QueryResponse`型のFuture - 結果データセットとサーバー側のメトリックなどの追加情報。レスポンスオブジェクトは、データセットを消費した後に閉じる必要があります。

**例**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// デフォルト形式はRowBinaryWithNamesAndTypesFormatReaderなので、リーダーはカラムに関するすべての情報を持っています。
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // データに便利な方法でアクセスするためのリーダーを作成します。
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み取り、解析します。

        // 値を取得
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // データを収集
    }
} catch (Exception e) {
    log.error("Failed to read data", e);
}

// 読み取りブロックの外でビジネスロジックを配置して、HTTP接続をできるだけ早く解放します。  
```
### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

そのまま`sqlQuery`を送信します。追加でクエリパラメータを送信し、サーバーがSQL式をコンパイルできるようにします。

**シグネチャ**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**パラメーター**

`sqlQuery` - プレースホルダー`{}`を含むSQL式。 

`queryParams` - サーバー上のSQL式を完成させるための変数のマップ。

`settings` - リクエスト設定。 

**戻り値**

`QueryResponse`型のFuture - 結果データセットとサーバー側のメトリックなどの追加情報。レスポンスオブジェクトは、データセットを消費した後に閉じる必要があります。

**例**

```java showLineNumbers

// パラメータを定義します。リクエストと共にサーバーに送信されます。   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // データに便利な方法でアクセスするためのリーダーを作成します。
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み取り、解析します。

        // データを読み取ります。
    }

} catch (Exception e) {
    log.error("Failed to read data", e);
}
```
### queryAll(String sqlQuery) {#queryallstring-sqlquery}

`RowBinaryWithNamesAndTypes`形式でデータをクエリします。結果はコレクションとして返されます。読み取り性能はリーダーと同じですが、全データセットを保持するためにはより多くのメモリが必要です。

**シグネチャ**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**パラメーター**

`sqlQuery` - サーバーからデータをクエリするためのSQL式。

**戻り値**

`GenericRecord`オブジェクトのリストとして表現された完全なデータセットで、結果データに対して行スタイルでアクセスします。 

**例**

```java showLineNumbers
try {
    log.info("Reading whole table and process record by record");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // 結果集合全体を読み取り、レコードごとに処理します。
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

クエリ操作のための設定オプション。

**設定メソッド**

| メソッド                                         | 説明                                                                                     |
|-------------------------------------------------|------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                      | 操作に割り当てられるクエリIDを設定します。                                             |
| `setFormat(ClickHouseFormat format)`              | レスポンス形式を設定します。完全なリストについては`RowBinaryWithNamesAndTypes`を参照してください。    |
| `setMaxExecutionTime(Integer maxExecutionTime)`   | サーバー上の操作実行時間を設定します。読み取りタイムアウトには影響しません。                    |
| `waitEndOfQuery(Boolean waitEndOfQuery)`          | サーバーにレスポンスを送信する前にクエリの終了を待つようリクエストします。                       |
| `setUseServerTimeZone(Boolean useServerTimeZone)`  | サーバーのタイムゾーン（クライアント設定を参照）が操作の結果における日付/時間型を解析するために使用されます。デフォルトは`false`。 |
| `setUseTimeZone(String timeZone)`                  | サーバーに`timeZone`を使用して時間変換を行うようリクエストします。 [session_timezone](/operations/settings/settings#session_timezone)を参照してください。 |
| `serverSetting(String name, String value)`         | 操作のための個別のサーバー設定を設定します。                                               |
| `serverSetting(String name, Collection values)`     | 操作のための複数の値を持つ個別のサーバー設定を設定します。コレクションの項目は`String`値である必要があります。 |
| `setDBRoles(Collection dbRoles)`                   | 操作を実行する前に設定されるDBロールを設定します。コレクションの項目は`String`値である必要があります。           |
| `setOption(String option, Object value)`           | 生の形式で設定オプションを設定します。これはサーバー設定ではありません。                 |
### QueryResponse {#queryresponse}

クエリ実行の結果を保持するレスポンスオブジェクト。クライアントがサーバーからのレスポンスを受け取った場合にのみ使用できます。

:::note
このオブジェクトは、接続を解放するためにできるだけ早く閉じる必要があります。前のレスポンスのすべてのデータが完全に読み取られるまで、その接続は再利用できません。
:::

| メソッド                                | 説明                                                                                     |
|-----------------------------------------|------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`          | レスポンスにおいてデータがエンコードされている形式を返します。                             |
| `InputStream getInputStream()`          | 指定された形式のデータの非圧縮バイトストリームを返します。                               |
| `OperationMetrics getMetrics()`         | 操作メトリックを持つオブジェクトを返します。                                           |
| `String getQueryId()`                   | アプリケーションによって操作に割り当てられたクエリIDを返します（操作設定またはサーバーによって）。 |
| `TimeZone getTimeZone()`                | レスポンス内の日付/日時型を処理するために使用されるタイムゾーンを返します。               |
### Examples {#examples}

- 例コードは[repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2)で利用可能です。
- Springサービスの[実装](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)の参照。
## Common API {#common-api}
### getTableSchema(String table) {#gettableschemastring-table}

`table`のテーブルスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**パラメーター**

`table` - スキーマデータを取得する対象テーブルの名前。

`database` - 対象テーブルが定義されているデータベース。

**戻り値**

テーブルカラムのリストを持つ`TableSchema`オブジェクトを返します。
### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

SQLステートメントからスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**パラメーター**

`sql` - スキーマを返す"SELECT" SQLステートメント。

**戻り値**

`sql`式に合うカラムを持つ`TableSchema`オブジェクトを返します。
### TableSchema {#tableschema}
### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

`schema`を使ってデータの読み書きに使用するためのJavaクラスのシリアル化とデシリアル化層をコンパイルします。このメソッドは、ペアのgetter/setterと対応するカラムのシリアライザーとデシリアライザーを作成します。 
カラムの一致はメソッド名からその名前を抽出して見つけます。例えば、`getFirstName`はカラム`first_name`や`firstname`に対応します。

**シグネチャ**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**パラメーター**

`clazz` - データを読み書きするために使用されるPOJOを表すクラス。

`schema` - POJOプロパティと一致させるために使用するデータスキーマ。

**例**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```
## Usage Examples {#usage-examples}

完全な例コードは'repo'の'example` [folder](https://github.com/ClickHouse/clickhouse-java/tree/main/examples)に保存されています：

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - 主な例セット。
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - Spring Bootアプリケーションでクライアントを使用する方法の例。
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - Ktor（Kotlin）アプリケーションでクライアントを使用する方法の例。
