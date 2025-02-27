---
sidebar_label: クライアント 0.8+
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouseコネクタ 0.8+
slug: /integrations/language-clients/java/client
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Java クライアント (0.8+)

DBサーバーとそのプロトコルを介して通信するためのJavaクライアントライブラリです。現在の実装は[HTTPインターフェース](/interfaces/http)のみをサポートしています。
このライブラリは、サーバーにリクエストを送信するための独自のAPIを提供します。また、さまざまなバイナリデータフォーマット（RowBinary* & Native*）を扱うためのツールも提供します。

:::note
以前のバージョンのJavaクライアントドキュメントを探している場合は、[こちら](/integrations/language-clients/java/client-v1.md)をご覧ください。
:::
## セットアップ {#setup}

- Maven Central (プロジェクトのウェブページ): https://mvnrepository.com/artifact/com.clickhouse/client-v2
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

`com.clickhouse.client.api.Client.Builder#build()`によってClientオブジェクトが初期化されます。各クライアントは独自のコンテキストを持ち、それらの間でオブジェクトは共有されません。
ビルダーは、便利なセットアップのための構成メソッドを持っています。

例: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client`は`AutoCloseable`であり、必要なくなったときに閉じるべきです。
### 認証 {#authentication}

認証は初期化フェーズでクライアントごとに設定されます。サポートされている認証方法は3つあります：パスワードによる認証、アクセス・トークンによる認証、SSLクライアント証明書による認証です。

パスワードによる認証は、`setUsername(String)`と`setPassword(String)`を呼び出してユーザー名とパスワードを設定する必要があります: 
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

アクセス・トークンによる認証は、`setAccessToken(String)`を呼び出してアクセス・トークンを設定する必要があります:
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

SSLクライアント証明書による認証は、ユーザー名を設定し、SSL認証を有効にし、クライアント証明書とクライアントキーをそれぞれ`setUsername(String)`、`useSSLAuthentication(boolean)`、`setClientCertificate(String)`、`setClientKey(String)`を呼び出して設定する必要があります: 
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
プロダクション環境でのSSL認証はトラブルシューティングが難しい場合があります。SSLライブラリの多くのエラーは十分な情報を提供しないためです。たとえば、クライアント証明書とキーが一致しない場合、サーバーは接続を直ちに切断します（HTTPの場合、HTTPリクエストが送信されないため、接続の初期化段階で切断されます）。 

証明書とキーを検証するには、[openssl](https://docs.openssl.org/master/man1/openssl/)のようなツールを使用してください: 
- キーの整合性を確認: `openssl rsa -in [key-file.key] -check -noout`
- ユーザー証明書からCNを取得 - `openssl x509 -noout -subject -in [user.cert]`
- 同じ値がデータベースに設定されていることを検証する `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'`（クエリは`auth_params`を出力します。例: `{"common_names":["some_user"]}`） 

:::
## 構成 {#configuration}

すべての設定は、各値のスコープとコンテキストを明確にするためのインスタンスメソッド（いわゆる構成メソッド）によって定義されます。
主な構成パラメータは1つのスコープ（クライアントまたは操作）で定義され、互いに上書きされることはありません。

構成はクライアント作成時に定義されます。`com.clickhouse.client.api.Client.Builder`を参照してください。
## クライアント構成 {#client-configuration}

| 構成メソッド                          | 引数                                          | 説明                                           |
|---------------------------------------|:---------------------------------------------|:----------------------------------------------|
| `addEndpoint(String endpoint)`          | - `endpoint` - サーバーアドレスを含むURL。     | 利用可能なサーバーのリストにサーバーエンドポイントを追加します。現在、1つのエンドポイントのみがサポートされています。 |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - 接続プロトコル `com.clickhouse.client.api.enums.Protocol#HTTP`。<br />- `host` - サーバーのIPまたはホスト名。<br />- `secure` - 通信がプロトコルの安全なバージョン（HTTPS）を使用するかどうか。 | 利用可能なサーバーのリストにサーバーエンドポイントを追加します。現在、1つのエンドポイントのみがサポートされています。 |
| `setOption(String key, String value)`   | - `key` - クライアント構成オプションの文字列キー。<br /> - `value` - オプションの文字列値 | クライアントオプションの生の値を設定します。プロパティファイルから構成を読み取る際に便利です。 | 
| `setUsername(String username)`          | - `username` - 認証時に使用するユーザー名 | 後の構成で選択した認証メソッドのためのユーザー名を設定します。 | 
| `setPassword(String password)`          | - `password` - パスワード認証用の秘密値 | パスワード認証用の秘密を設定し、事実上認証メソッドを選択します。 |
| `setAccessToken(String accessToken)`    | - `accessToken` - アクセス・トークンの文字列表現 | 対応する認証メソッドで認証するためのアクセス・トークンを設定します。 |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - SSL認証を使用すべきかどうかを示すフラグ | 認証メソッドとしてSSLクライアント証明書を設定します。 | 
| `enableConnectionPool(boolean enable)`  | - `enable` - オプションを有効にすべきかどうかを示すフラグ | 接続プールが有効であるかどうかを設定します。 | 
| `setConnectTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | アウトゴーイング接続の初期化タイムアウトを設定します。これはソケット接続を取得する際の待機時間に影響します。 |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 接続リクエストのタイムアウトを設定します。これはプールから接続を取得する際にのみ有効です。 | 
| `setMaxConnections(int maxConnections)` | - `maxConnections` - 接続の数 | 各サーバーエンドポイントに対してクライアントが開くことができる接続の数を設定します。 | 
| `setConnectionTTL(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 接続が非アクティブと見なされるまでの接続TTLを設定します。 |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | HTTP接続のキープアライブタイムアウトを設定します。このオプションは、タイムアウトをゼロに設定することでキープアライブを無効にするためにも使用できます - `0` |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - `com.clickhouse.client.api.ConnectionReuseStrategy`の列挙型定数 | 接続プールが使用する戦略を選択します：接続がプールに返されるとすぐに再利用されるべき場合は`LIFO`、接続が利用可能になる順序（返された接続はすぐには使用しない）で使用される場合は`FIFO`。 |
| `setSocketTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `unit` - `timeout`の時間単位 | 読み取りおよび書き込み操作に影響を与えるソケットのタイムアウトを設定します。 |
| `setSocketRcvbuf(long size)` | - `size` - バイト単位のサイズ | TCPソケット受信バッファを設定します。このバッファはJVMメモリの外にあります。 |
| `setSocketSndbuf(long size)` | - `size` - バイト単位のサイズ | TCPソケット送信バッファを設定します。このバッファはJVMメモリの外にあります。 |
| `setSocketKeepAlive(boolean value)` | - `value` - オプションを有効にすべきかどうかを示すフラグ。 | クライアントが作成したすべてのTCPソケットに`SO_KEEPALIVE`オプションを設定します。TCP Keep Aliveは接続の生存性を確認するメカニズムを有効にし、異常終了した接続を検出するのに役立ちます。 | 
| `setSocketTcpNodelay(boolean value)` | - `value` - オプションを有効にすべきかどうかを示すフラグ。 | クライアントが作成したすべてのTCPソケットに`SO_NODELAY`オプションを設定します。このTCPオプションは、ソケットができるだけ早くデータをプッシュすることを可能にします。 |
| `setSocketLinger(int secondsToWait)` | - `secondsToWait` - 待機する秒数。 | クライアントが作成するすべてのTCPソケットのリンガー時間を設定します。 |
| `compressServerResponse(boolean enabled)` | - `enabled` - オプションを有効にすべきかどうかを示すフラグ | サーバーが応答を圧縮すべきかどうかを設定します。 | 
| `compressClientRequest(boolean enabled)` | - `enabled` - オプションを有効にすべきかどうかを示すフラグ | クライアントがリクエストを圧縮すべきかどうかを設定します。 |
| `useHttpCompression(boolean enabled)` | - `enabled` - オプションを有効にすべきかどうかを示すフラグ | HTTP圧縮がクライアント/サーバー間の通信に使用されるべきかどうかを設定します。対応するオプションが有効になっている場合のみ。 |
| `setLZ4UncompressedBufferSize(int size)` | - `size` - バイト単位のサイズ | データストリームの未圧縮部分を受け取るためのバッファのサイズを設定します。バッファが過小評価されている場合、新しいものが作成され、対応する警告がログに表示されます。 | 
| `setDefaultDatabase(String database)` | - `database` - データベースの名前 | デフォルトのデータベースを設定します。 |
| `addProxy(ProxyType type, String host, int port)` | - `type` - プロキシタイプ。<br /> - `host` - プロキシのホスト名またはIPアドレス。<br /> - `port` - プロキシポート | サーバーとの通信に使用するプロキシを設定します。プロキシが認証を必要とする場合、プロキシの設定が必要です。 |
| `setProxyCredentials(String user, String pass)` | - `user` - プロキシのユーザー名。<br /> - `pass` - パスワード | プロキシに対して認証するためのユーザークレデンシャルを設定します。 |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - 一定の時間単位でのタイムアウト。<br /> - `timeUnit` - `timeout`の時間単位 | クエリの最大実行タイムアウトを設定します。 |
| `setHttpCookiesEnabled(boolean enabled)` | `enabled` - オプションを有効にすべきかどうかを示すフラグ | HTTPクッキーを記憶し、サーバーに送信すべきかを設定します。 |
| `setSSLTrustStore(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | クライアントがサーバーホストの検証にSSLトラストストアを使用すべきかを設定します。 | 
| `setSSLTrustStorePassword(String password)` | `password` - 秘密値 | `setSSLTrustStore(String path)`で指定されたSSLトラストストアのロックを解除するために使用されるパスワードを設定します。 |
| `setSSLTrustStoreType(String type)` | `type` - トラストストアのタイプ名 | `setSSLTrustStore(String path)`で指定されたトラストストアのタイプを設定します。 | 
| `setRootCertificate(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | クライアントがサーバーホストの検証に使用する指定されたルート（CA）証明書を使用すべきかを設定します。 |
| `setClientCertificate(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | SSL接続を開始する際に便利なクライアント証明書のパスを設定し、SSL認証時に使用します。 |
| `setClientKey(String path)` | `path` - ローカル（クライアント側）システムのファイルパス | サーバーとのSSL通信を暗号化するために使用されるクライアントプライベートキーを設定します。 |
| `useServerTimeZone(boolean useServerTimeZone)` | `useServerTimeZone` - オプションを有効にすべきかどうかを示すフラグ | クライアントがDateTimeおよびDateカラムの値をデコードする際にサーバーのタイムゾーンを使用すべきかを設定します。これが有効な場合、サーバーのタイムゾーンは`setServerTimeZone(String timeZone)`によって設定されるべきです。 | 
| `useTimeZone(String timeZone)` | `timeZone` - 有効なjavaタイムゾーンIDの文字列値（`java.time.ZoneId`を参照） | 指定されたタイムゾーンを使用してDateTimeおよびDateカラムの値をデコードすべきかを設定します。これによりサーバーのタイムゾーンが上書きされます。 |
| `setServerTimeZone(String timeZone)` |  `timeZone` - 有効なjavaタイムゾーンIDの文字列値（`java.time.ZoneId`を参照） | サーバー側のタイムゾーンを設定します。デフォルトではUTCタイムゾーンが使用されます。 | 
| `useAsyncRequests(boolean async)` | `async` - オプションを有効にすべきかどうかを示すフラグ。 | クライアントが別のスレッドでリクエストを実行すべきかを設定します。これが無効な場合は、アプリケーションがマルチスレッドタスクをどのように整理するかをよく知っているため、別スレッドでタスクを実行することはパフォーマンスの向上には役立ちません。 | 
| `setSharedOperationExecutor(ExecutorService executorService)` | `executorService` - 実行サービスのインスタンス。 | 操作タスクの実行サービスを設定します。 | 
| `setClientNetworkBufferSize(int size)` | - `size` - バイト単位のサイズ | ソケットとアプリケーション間でデータを往復するために使用されるアプリケーションメモリ空間内のバッファのサイズを設定します。大きくすることでTCPスタックへのシステムコールを減少させますが、各接続に費やすメモリに影響します。このバッファはGCの対象にもなります。接続は短命だからです。また、大きな連続したメモリブロックを割り当てることが問題になる場合があることも考慮してください。デフォルトは`300,000`バイトです。 |
| `retryOnFailures(ClientFaultCause ...causes)` | - `causes` - `com.clickhouse.client.api.ClientFaultCause`の列挙型定数 | 回復可能/再試行可能な障害タイプを設定します。 | 
| `setMaxRetries(int maxRetries)` | - `maxRetries` - 再試行回数 | `retryOnFailures(ClientFaultCause ...causes)`で定義された障害の最大再試行回数を設定します。 | 
| `allowBinaryReaderToReuseBuffers(boolean reuse)` | - `reuse` - オプションを有効にすべきかどうかを示すフラグ | ほとんどのデータセットは、小さなバイトシーケンスとしてエンコードされた数値データを含みます。デフォルトではリーダーが必要なバッファを割り当ててデータを読み込み、その後、対象のNumberクラスに変換します。これにより、多くの小さなオブジェクトが割り当てられて解放されるため、GCに対するプレッシャーが大きくなる場合があります。このオプションが有効な場合、リーダーは事前に割り当てられたバッファを使用して数値のトランスコーディングを行います。この操作は安全です、なぜなら各リーダーは独自のバッファセットを持ち、リーダーは1つのスレッドによって使用されるからです。 |
| `httpHeader(String key, String value)` | - `key` - HTTPヘッダーキー。<br /> - `value` - ヘッダーの文字列値。 | 単一のHTTPヘッダーの値を設定します。前の値は上書きされます。|
| `httpHeader(String key, Collection values)` | - `key` - HTTPヘッダーキー。<br /> - `values` - 文字列値のリスト。 | 単一のHTTPヘッダーの値を設定します。前の値は上書きされます。|
| `httpHeaders(Map headers)` | - `header` - HTTPヘッダーとその値を含むマップ。 | 一度に複数のHTTPヘッダーの値を設定します。 |
| `serverSetting(String name, String value)` | - `name` - クエリレベル設定の名前。<br /> - `value` - 設定の文字列値。 | 各クエリと一緒にサーバーに渡す設定を定義します。個別の操作設定がこれを上書きすることがあります。設定の[リスト](/operations/settings/query-level)。 | 
| `serverSetting(String name,  Collection values)` | - `name` - クエリレベル設定の名前。<br /> - `values` - 設定の文字列値。 | 各クエリと一緒にサーバーに渡す設定を定義します。個別の操作設定がこれを上書きすることがあります。設定の[リスト](/operations/settings/query-level)。複数の値を持つ設定を設定するのに便利なメソッドです。例えば、[roles](/interfaces/http#setting-role-with-query-parameters)。 |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - カラム-フィールドマッチング戦略の実装 | DTOクラスのフィールドとDBカラムを登録する際に使用されるカスタム戦略を設定します。 | 
| `useHTTPBasicAuth(boolean useBasicAuth)` | - `useBasicAuth` - オプションを有効にすべきかどうかを示すフラグ | ユーザー・パスワード認証のために基本的なHTTP認証を使用すべきかどうかを設定します。デフォルトは有効です。この認証方式を使用することで、HTTPヘッダーを介して転送できない特殊文字を含むパスワードに関する問題が解決されます。 |
| `setClientName(String clientName)` | - `clientName` - アプリケーション名を表す文字列 | 呼び出し元アプリケーションについての追加情報を設定します。この文字列はクライアント名としてサーバーに渡されます。HTTPプロトコルの場合、`User-Agent`ヘッダーとして渡されます。 |
| `useBearerTokenAuth(String bearerToken)` | - `bearerToken` - エンコードされたベアラートークン | Bearer認証を使用するかどうか、そしてどのトークンを使用するかを指定します。このトークンはそのまま送信されるため、このメソッドに渡す前にエンコードする必要があります。 |
## 共通定義 {#common-definitions}
### ClickHouseFormat {#clickhouseformat}

[サポートされるフォーマット](/interfaces/formats)の列挙型です。ClickHouseがサポートしているすべてのフォーマットを含みます。

* `raw` - ユーザーは生データをトランスコードする必要があります。 
* `full` - クライアントは自分でデータをトランスコードでき、生データストリームを受け入れます。
* `-` - このフォーマットに対してClickHouseがサポートしていない操作。

このクライアントバージョンは次のフォーマットをサポートしています。

| フォーマット                                                                                                                  | 入力  | 出力  |
|-------------------------------------------------------------------------------------------------------------------------------|:------:|:-------:|
| [TabSeparated](/interfaces/formats#tabseparated)                                                                          | raw    | raw     |
| [TabSeparatedRaw](/interfaces/formats#tabseparatedraw)                                                                    | raw    | raw     |
| [TabSeparatedWithNames](/interfaces/formats#tabseparatedwithnames)                                                        | raw    | raw     |
| [TabSeparatedWithNamesAndTypes](/interfaces/formats#tabseparatedwithnamesandtypes)                                        | raw    | raw     |
| [TabSeparatedRawWithNames](/interfaces/formats#tabseparatedrawwithnames)                                                  | raw    | raw     |
| [TabSeparatedRawWithNamesAndTypes](/interfaces/formats#tabseparatedrawwithnamesandtypes)                                  | raw    | raw     |
| [Template](/interfaces/formats#format-template)                                                                           | raw    | raw     |
| [TemplateIgnoreSpaces](/interfaces/formats#templateignorespaces)                                                          | raw    |  -      |
| [CSV](/interfaces/formats#csv)                                                                                            | raw    | raw     |
| [CSVWithNames](/interfaces/formats#csvwithnames)                                                                          | raw    | raw     |
| [CSVWithNamesAndTypes](/interfaces/formats#csvwithnamesandtypes)                                                          | raw    | raw     |
| [CustomSeparated](/interfaces/formats#format-customseparated)                                                             | raw    | raw     |
| [CustomSeparatedWithNames](/interfaces/formats#customseparatedwithnames)                                                  | raw    | raw     |
| [CustomSeparatedWithNamesAndTypes](/interfaces/formats#customseparatedwithnamesandtypes)                                  | raw    | raw     |
| [SQLInsert](/interfaces/formats#sqlinsert)                                                                                | -      | raw     |
| [Values](/interfaces/formats#data-format-values)                                                                          | raw    | raw     |
| [Vertical](/interfaces/formats#vertical)                                                                                  | -      | raw     |
| [JSON](/interfaces/formats#json)                                                                                          | raw    | raw     |
| [JSONAsString](/interfaces/formats#jsonasstring)                                                                          | raw    | -       |
| [JSONAsObject](/interfaces/formats#jsonasobject)                                                                          | raw    | -       |
| [JSONStrings](/interfaces/formats#jsonstrings)                                                                            | raw    | raw     |
| [JSONColumns](/interfaces/formats#jsoncolumns)                                                                            | raw    | raw     |
| [JSONColumnsWithMetadata](/interfaces/formats#jsoncolumnsmonoblock)                                                       | raw    | raw     |
| [JSONCompact](/interfaces/formats#jsoncompact)                                                                            | raw    | raw     |
| [JSONCompactStrings](/interfaces/formats#jsoncompactstrings)                                                              | -      | raw     |
| [JSONCompactColumns](/interfaces/formats#jsoncompactcolumns)                                                              | raw    | raw     |
| [JSONEachRow](/interfaces/formats#jsoneachrow)                                                                            | raw    | raw     |
| [PrettyJSONEachRow](/interfaces/formats#prettyjsoneachrow)                                                                | -      | raw     |
| [JSONEachRowWithProgress](/interfaces/formats#jsoneachrowwithprogress)                                                    | -      | raw     |
| [JSONStringsEachRow](/interfaces/formats#jsonstringseachrow)                                                              | raw    | raw     |
| [JSONStringsEachRowWithProgress](/interfaces/formats#jsonstringseachrowwithprogress)                                      | -      | raw     |
| [JSONCompactEachRow](/interfaces/formats#jsoncompacteachrow)                                                              | raw    | raw     |
| [JSONCompactEachRowWithNames](/interfaces/formats#jsoncompacteachrowwithnames)                                            | raw    | raw     |
| [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats#jsoncompacteachrowwithnamesandtypes)                            | raw    | raw     |
| [JSONCompactStringsEachRow](/interfaces/formats#jsoncompactstringseachrow)                                                | raw    | raw     |
| [JSONCompactStringsEachRowWithNames](/interfaces/formats#jsoncompactstringseachrowwithnames)                              | raw    | raw     |
| [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/jsoncompactstringseachrowwithnamesandtypes)               | raw    | raw     |
| [JSONObjectEachRow](/interfaces/formats#jsonobjecteachrow)                                                                | raw    | raw     |
| [BSONEachRow](/interfaces/formats#bsoneachrow)                                                                            | raw    | raw     |
| [TSKV](/interfaces/formats#tskv)                                                                                          | raw    | raw     |
| [Pretty](/interfaces/formats#pretty)                                                                                      | -      | raw     |
| [PrettyNoEscapes](/interfaces/formats#prettynoescapes)                                                                    | -      | raw     |
| [PrettyMonoBlock](/interfaces/formats#prettymonoblock)                                                                    | -      | raw     |
| [PrettyNoEscapesMonoBlock](/interfaces/formats#prettynoescapesmonoblock)                                               | -      | raw     |
| [PrettyCompact](/interfaces/formats#prettycompact)                                                                        | -      | raw     |
| [PrettyCompactNoEscapes](/interfaces/formats#prettycompactnoescapes)                                                      | -      | raw     |
| [PrettyCompactMonoBlock](/interfaces/formats#prettycompactmonoblock)                                                    | -      | raw     |
| [PrettyCompactNoEscapesMonoBlock](/interfaces/formats#prettycompactnoescapesmonoblock)                                   | -      | raw     |
| [PrettySpace](/interfaces/formats#prettyspace)                                                                            | -      | raw     |
| [PrettySpaceNoEscapes](/interfaces/formats#prettyspacenoescapes)                                                         | -      | raw     |
| [PrettySpaceMonoBlock](/interfaces/formats#prettyspacemonoblock)                                                         | -      | raw     |
| [PrettySpaceNoEscapesMonoBlock](/interfaces/formats#prettyspacenoescapesmonoblock)                                       | -      | raw     |
| [Prometheus](/interfaces/formats#prometheus)                                                                              | -      | raw     |
| [Protobuf](/interfaces/formats#protobuf)                                                                                  | raw    | raw     |
| [ProtobufSingle](/interfaces/formats#protobufsingle)                                                                      | raw    | raw     |
| [ProtobufList](/interfaces/formats#protobuflist)                                                                          | raw    | raw     |
| [Avro](/interfaces/formats#data-format-avro)                                                                              | raw    | raw     |
| [AvroConfluent](/interfaces/formats#data-format-avro-confluent)                                                           | raw    | -       |
| [Parquet](/interfaces/formats#data-format-parquet)                                                                        | raw    | raw     |
| [ParquetMetadata](/interfaces/formats#data-format-parquet-metadata)                                                       | raw    | -       |
| [Arrow](/interfaces/formats#data-format-arrow)                                                                            | raw    | raw     |
| [ArrowStream](/interfaces/formats#data-format-arrow-stream)                                                               | raw    | raw     |
| [ORC](/interfaces/formats#data-format-orc)                                                                                | raw    | raw     |
| [One](/interfaces/formats#data-format-one)                                                                                | raw    | -       |
| [Npy](/interfaces/formats#data-format-npy)                                                                                | raw    | raw     |
| [RowBinary](/interfaces/formats#rowbinary)                                                                                | full   | full    |
| [RowBinaryWithNames](/interfaces/formats#rowbinarywithnamesandtypes)                                                      | full   | full    |
| [RowBinaryWithNamesAndTypes](/interfaces/formats#rowbinarywithnamesandtypes)                                            | full   | full    |
| [RowBinaryWithDefaults](/interfaces/formats#rowbinarywithdefaults)                                                        | full   | -       |
| [Native](/interfaces/formats#native)                                                                                      | full   | raw     |
| [Null](/interfaces/formats#null)                                                                                          | -      | raw     |
| [XML](/interfaces/formats#xml)                                                                                            | -      | raw     |
| [CapnProto](/interfaces/formats#capnproto)                                                                                | raw    | raw     |
| [LineAsString](/interfaces/formats#lineasstring)                                                                          | raw    | raw     |
| [Regexp](/interfaces/formats#data-format-regexp)                                                                          | raw    | -       |
| [RawBLOB](/interfaces/formats#rawblob)                                                                                    | raw    | raw     |
| [MsgPack](/interfaces/formats#msgpack)                                                                                    | raw    | raw     |
| [MySQLDump](/interfaces/formats#mysqldump)                                                                                | raw    | -       |
| [DWARF](/interfaces/formats#dwarf)                                                                                        | raw    | -       |
| [Markdown](/interfaces/formats#markdown)                                                                                  | -      | raw     |
| [Form](/interfaces/formats#form)                                                                                          | raw    | -       |
## インサートAPI {#insert-api}
### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

指定されたフォーマットの`InputStream`としてデータを受け取ります。`data`は`format`でエンコードされていることが期待されます。

**シグネチャ**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**パラメータ**

`tableName` - 対象テーブル名。

`data` - エンコードされたデータの入力ストリーム。

`format` - データがエンコードされているフォーマット。

`settings` - リクエスト設定。

**戻り値**

`InsertResponse`型のFuture - 操作の結果及びサーバー側のメトリクスとしての追加情報。

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

データベースに書き込みリクエストを送信します。オブジェクトのリストは効率的なフォーマットに変換され、サーバーに送信されます。リスト項目のクラスは`register(Class, TableSchema)`メソッドを使用して事前に登録する必要があります。

**シグネチャ**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**パラメータ**

`tableName` - 対象テーブルの名前。

`data` - コレクションDTO（データ転送オブジェクト）オブジェクト。

`settings` - リクエスト設定。

**戻り値**

`InsertResponse`型のFuture - 操作の結果及びサーバー側のメトリクスとしての追加情報。

**例**

```java showLineNumbers
// 重要なステップ（1回実行） - テーブルスキーマに従ってオブジェクトシリアライザを事前コンパイルするためにクラスを登録します。 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));

List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // レスポンスを処理し、その後、クローズされ、リクエストを処理した接続が解放されます。 
}
```

### InsertSettings {#insertsettings}

挿入操作のための設定オプション。

**設定メソッド**

| メソッド                                     | 説明                                                                                                                |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                 | 操作に割り当てられるクエリIDを設定します。デフォルト: `null`。                                                   |
| `setDeduplicationToken(String token)`        | 重複排除トークンを設定します。このトークンはサーバーに送信され、クエリを識別するために使用されます。デフォルト: `null`。 |
| `setInputStreamCopyBufferSize(int size)`     | コピー バッファサイズ。バッファは、ユーザーが提供した入力ストリームから出力ストリームにデータをコピーするために書き込み操作中に使用されます。デフォルト: `8196`。 |
| `serverSetting(String name, String value)`   | 操作の個別サーバー設定を設定します。                                                                                |
| `serverSetting(String name, Collection values)` | 複数値の個別サーバー設定を操作のために設定します。コレクションのアイテムは`String`値である必要があります。            |
| `setDBRoles(Collection dbRoles)`             | 操作を実行する前に設定されるDBロールを設定します。コレクションのアイテムは`String`値である必要があります。                |
| `setOption(String option, Object value)`     | 生の形式での構成オプションを設定します。これはサーバー設定ではありません。                                      |

### InsertResponse {#insertresponse}

挿入操作の結果を保持するレスポンスオブジェクトです。クライアントがサーバーからレスポンスを受け取った場合のみ利用可能です。

:::note
このオブジェクトは、接続を解放するためにできるだけ早くクローズする必要があります。すべての前回のレスポンスデータが完全に読み取られるまで再利用はできません。
:::

| メソッド                      | 説明                                                                                          |
|-----------------------------|------------------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()` | 操作メトリクスを持つオブジェクトを返します。                                                |
| `String getQueryId()`       | アプリケーションによって操作に割り当てられたクエリIDを返します（操作設定またはサーバーによる）。 |

## Query API {#query-api}
### query(String sqlQuery) {#querystring-sqlquery}

`sqlQuery`をそのまま送信します。レスポンスフォーマットはクエリ設定によって設定されます。`QueryResponse`は、サポートフォーマットのためにリーダーによって消費されるべきレスポンスストリームへの参照を保持します。

**シグネチャ**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**パラメータ**

`sqlQuery` - 単一のSQLステートメント。クエリはそのままサーバーに送信されます。  

`settings` - リクエスト設定。

**戻り値**

`QueryResponse`型のFuture - 結果データセット及びサーバー側メトリクスとしての追加情報。レスポンスオブジェクトはデータセットを消費した後にクローズする必要があります。 

**例**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// デフォルトフォーマットは RowBinaryWithNamesAndTypesFormatReader なので、リーダーはカラムに関するすべての情報を持っています
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // データにアクセスするための便利なリーダーを作成
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み取り、それを解析する

        // 値を取得
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // データを収集 
    }
} catch (Exception e) {
    log.error("Failed to read data", e);
}

// ビジネスロジックをリーディングブロックの外に置くことで、HTTP接続をできるだけ早く解放する。  
```
### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

`sqlQuery`をそのまま送信します。さらに、サーバーがSQL式をコンパイルできるようにクエリパラメータを送信します。

**シグネチャ**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**パラメータ**

`sqlQuery` - プレースホルダ `{}` を使った SQL 式。

`queryParams` - サーバー上で SQL 式を完成させるための変数のマップ。

`settings` - リクエスト設定。 

**戻り値**

`QueryResponse`型のFuture - 結果データセット及びサーバー側メトリクスとしての追加情報。レスポンスオブジェクトはデータセットを消費した後にクローズする必要があります。 

**例**

```java showLineNumbers

// パラメータを定義します。これらはリクエストとともにサーバーに送信されます。   
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // データにアクセスするための便利なリーダーを作成
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(queryResponse);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み取り、それを解析する

        // データを読み取る 
    }

} catch (Exception e) {
    log.error("Failed to read data", e);
}
```
### queryAll(String sqlQuery) {#queryallstring-sqlquery}

`RowBinaryWithNamesAndTypes`フォーマットでデータをクエリします。結果はコレクションとして返されます。読み取りパフォーマンスはリーダーと同じですが、全データセットを保持するのにより多くのメモリが必要です。

**シグネチャ**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**パラメータ**

`sqlQuery` - サーバーからデータをクエリする SQL 式。

**戻り値**

`GenericRecord`オブジェクトのリストによって表現された完全なデータセットで、結果データに行スタイルでアクセスできます。

**例**

```java showLineNumbers
try {
    log.info("Reading whole table and process record by record");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // 結果セット全体を読み取って、1件ずつ処理します
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

| メソッド                                     | 説明                                                                                                                |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                 | 操作に割り当てられるクエリIDを設定します。                                                                        |
| `setFormat(ClickHouseFormat format)`         | レスポンスフォーマットを設定します。完全なリストについては`RowBinaryWithNamesAndTypes`を参照してください。          |
| `setMaxExecutionTime(Integer maxExecutionTime)` | サーバーでの操作実行時間を設定します。リードタイムアウトには影響しません。                                        |
| `waitEndOfQuery(Boolean waitEndOfQuery)`     | サーバーに対してレスポンスを送信する前にクエリの終了を待つようにリクエストします。                                  |
| `setUseServerTimeZone(Boolean useServerTimeZone)` | サーバーのタイムゾーン（クライアント設定参照）が結果の日時型を解析するために使用されます。デフォルトは`false`です。  |
| `setUseTimeZone(String timeZone)`            | サーバーに`timeZone`を使用して時間変換を行うようにリクエストします。詳細については [session_timezone](/operations/settings/settings#session_timezone) を参照してください。 |
| `serverSetting(String name, String value)`   | 操作の個別サーバー設定を設定します。                                                                                |
| `serverSetting(String name, Collection values)` | 複数値の個別サーバー設定を操作のために設定します。コレクションのアイテムは`String`値である必要があります。            |
| `setDBRoles(Collection dbRoles)`             | 操作を実行する前に設定されるDBロールを設定します。コレクションのアイテムは`String`値である必要があります。                |
| `setOption(String option, Object value)`     | 生の形式での構成オプションを設定します。これはサーバー設定ではありません。                                      |

### QueryResponse {#queryresponse}

クエリ実行の結果を保持するレスポンスオブジェクトです。クライアントがサーバーからレスポンスを受け取った場合のみ利用可能です。

:::note
このオブジェクトは、接続を解放するためにできるだけ早くクローズする必要があります。すべての前回のレスポンスデータが完全に読み取られるまで、再利用はできません。
:::

| メソッド                              | 説明                                                                                          |
|-------------------------------------|------------------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`      | レスポンス内のデータがエンコードされているフォーマットを返します。                                  |
| `InputStream getInputStream()`      | 指定されたフォーマットのデータの非圧縮バイトストリームを返します。                                   |
| `OperationMetrics getMetrics()`     | 操作メトリクスを持つオブジェクトを返します。                                                     |
| `String getQueryId()`               | アプリケーションによって操作に割り当てられたクエリIDを返します（操作設定またはサーバーによる）。         |
| `TimeZone getTimeZone()`            | レスポンス内の日時型を処理するために使用されるべきタイムゾーンを返します。                           |

### Examples {#examples}

- 例コードは [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) にあります。
- サービスのリファレンス[実装](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service)。
## Common API {#common-api}
### getTableSchema(String table) {#gettableschemastring-table}

`table`のテーブルスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**パラメータ**

`table` - スキーマデータが取得されるべきテーブル名。

`database` - 対象テーブルが定義されているデータベース。

**戻り値**

テーブルカラムのリストを持つ`TableSchema`オブジェクトを返します。

### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

SQLステートメントからスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**パラメータ**

`sql` - スキーマが返されるべき"SELECT" SQLステートメント。

**戻り値**

`sql`式に一致するカラムを持つ`TableSchema`オブジェクトを返します。

### TableSchema {#tableschema}
### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

データを`schema`とともに読み書きするために使用するJavaクラスのシリアル化および逆シリアル化レイヤーをコンパイルします。このメソッドは、ペアのゲッター/セッターと対応するカラムのためのシリアライザとデシリアライザを作成します。カラムの一致は、メソッド名から名前を抽出することによって見つけられます。たとえば、`getFirstName`は`first_name`または`firstname`のカラムに対応します。

**シグネチャ**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**パラメータ**

`clazz` - データを読み書きするために使用されるPOJOを表すクラス。

`schema` - POJOプロパティとのマッチングに使用するデータスキーマ。

**例**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## Usage Examples {#usage-examples}

完全な例コードは'repo'の'example` [フォルダー](https://github.com/ClickHouse/clickhouse-java/tree/main/examples)に保存されています。

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - 主な例セット。
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - Spring Bootアプリケーションでクライアントを使用する方法の例。
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - Ktor（Kotlin）アプリケーションでクライアントを使用する方法の例。
