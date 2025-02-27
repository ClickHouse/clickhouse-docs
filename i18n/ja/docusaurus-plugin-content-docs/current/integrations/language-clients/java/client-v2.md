---
sidebar_label: クライアント 0.8+
sidebar_position: 2
keywords: [clickhouse, java, client, integrate]
description: Java ClickHouseコネクタ 0.8+
slug: /integrations/java/client-v2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Javaクライアント (V2)

DBサーバとそのプロトコルを通じて通信するためのJavaクライアントライブラリです。現在の実装は[HTTPインターフェース](/interfaces/http)のみをサポートしています。
このライブラリは、サーバにリクエストを送信するための独自のAPIを提供します。また、さまざまなバイナリデータ形式（RowBinary* & Native*）で作業するためのツールも提供しています。

:::note
以前のバージョンのJavaクライアントドキュメントを探している場合は、[こちら](/integrations/language-clients/java/client-v1.md)をご覧ください。
:::

## セットアップ {#setup}

- Maven Central (プロジェクトウェブページ): https://mvnrepository.com/artifact/com.clickhouse/client-v2
- ナイトリービルド (リポジトリリンク): https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/

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

## 初期化 {#initialization}

クライアントオブジェクトは `com.clickhouse.client.api.Client.Builder#build()` で初期化されます。各クライアントには独自のコンテキストがあり、オブジェクトが共有されることはありません。
ビルダーには、便利な設定のための構成メソッドがあります。

例: 
```java showLineNumbers
 Client client = new Client.Builder()
                .addEndpoint("https://clickhouse-cloud-instance:8443/")
                .setUsername(user)
                .setPassword(password)
                .build();
```

`Client` は `AutoCloseable` であり、不要になった際には閉じる必要があります。

### 認証 {#authentication}

認証は初期化段階でクライアントごとに設定されます。サポートされている認証方法は三つあります：パスワードによる認証、アクセストークンによる認証、SSLクライアント証明書による認証。

パスワードによる認証には、ユーザー名とパスワードを設定するために `setUsername(String)` および `setPassword(String)` を呼び出す必要があります：
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setUsername(user)
        .setPassword(password)
        .build();
```

アクセストークンによる認証には、アクセストークンを設定するために `setAccessToken(String)` を呼び出す必要があります：
```java showLineNumbers
 Client client = new Client.Builder()
        .addEndpoint("https://clickhouse-cloud-instance:8443/")
        .setAccessToken(userAccessToken)
        .build();
```

SSLクライアント証明書による認証には、ユーザー名を設定し、SSL認証を有効にし、クライアント証明書とクライアントキーをそれぞれ `setUsername(String)`, `useSSLAuthentication(boolean)`, `setClientCertificate(String)` および `setClientKey(String)`を呼び出す必要があります：
```java showLineNumbers
Client client = new Client.Builder()
        .useSSLAuthentication(true)
        .setUsername("some_user")
        .setClientCertificate("some_user.crt")
        .setClientKey("some_user.key")
```

:::note
本番環境でのSSL認証はトラブルシューティングが難しい場合があります。多くのSSLライブラリからのエラーは十分な情報を提供しないためです。たとえば、クライアント証明書とキーが一致しない場合、サーバーは接続を即座に終了します（HTTPの場合、接続を開始する段階でHTTPリクエストは送信されず、応答も送信されません）。

`openssl`などのツールを使って証明書とキーを検証してください：
- キーの整合性を確認する: `openssl rsa -in [key-file.key] -check -noout`
- クライアント証明書がユーザーのCNと一致していることを確認する：
    - ユーザー証明書からCNを取得する - `openssl x509 -noout -subject -in [user.cert]`
    - データベース内で同じ値が設定されていることを確認する `select name, auth_type, auth_params from system.users where auth_type = 'ssl_certificate'`（クエリは `auth_params` を `{"common_names":["some_user"]}` のように出力します）

:::


## 設定 {#configuration}

すべての設定はインスタンスメソッド（いわゆる構成メソッド）によって定義され、それぞれの値のスコープとコンテキストを明確にします。
主要な構成パラメータは一つのスコープ（クライアントまたは操作）で定義され、相互にオーバーライドされることはありません。

設定はクライアントの作成時に定義されます。`com.clickhouse.client.api.Client.Builder` を参照してください。

## クライアントの設定 {#client-configuration}

| 設定メソッド                                       | 引数                                                  | 説明                                         |
|----------------------------------------------------|:-----------------------------------------------------|:----------------------------------------------|
| `addEndpoint(String endpoint)`                      | - `enpoint` - サーバアドレスのURL形式。                     | 利用可能なサーバのエンドポイントリストにサーバエンドポイントを追加します。現在は一つのエンドポイントのみがサポートされています。 |
| `addEndpoint(Protocol protocol, String host, int port, boolean secure)` | - `protocol` - 接続プロトコル `com.clickhouse.client.api.enums.Protocol#HTTP`.<br />- `host` - サーバのIPまたはホスト名。<br />- `secure` - 通信がプロトコルの安全なバージョン（HTTPS）を使用すべきかどうか。 | 利用可能なサーバのエンドポイントリストにサーバエンドポイントを追加します。現在は一つのエンドポイントのみがサポートされています。 |
| `setOption(String key, String value)`              | - `key` - クライアント設定オプションの文字列キー。<br /> - `value` - オプションの文字列値 | クライアントオプションの生の値を設定します。プロパティファイルから設定を読むときに便利です。 | 
| `setUsername(String username)`                      | - `username` - 認証時に使用するユーザーのユーザー名 | 追加設定によって選択された認証メソッドのためのユーザー名を設定します。 | 
| `setPassword(String password)`                      | - `password` - パスワード認証のための秘密の値 | パスワード認証用の秘密を設定し、実際に認証メソッドを選択します。 |
| `setAccessToken(String accessToken)`                | - `accessToken` - アクセストークンの文字列表現 | 対応する認証方法で認証するためのアクセストークンを設定します。 |
| `useSSLAuthentication(boolean useSSLAuthentication)` | - `useSSLAuthentication` - SSL認証を使用すべきかどうかのフラグ | SSLクライアント証明書を認証方法として設定します。 | 
| `enableConnectionPool(boolean enable)`              | - `enable` - オプションを有効にすべきかどうかのフラグ | 接続プールを有効にするかどうかを設定します。 | 
| `setConnectTimeout(long timeout, ChronoUnit unit)`  | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | すべての発信接続の接続開始タイムアウトを設定します。これはソケット接続の取得待ち時間に影響します。 |
| `setConnectionRequestTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | 接続要求タイムアウトを設定します。これはプールから接続を取得する際にのみ有効です。 | 
| `setMaxConnections(int maxConnections)`             | - `maxConnections` - 接続の数 | 各サーバエンドポイントに対してクライアントが開ける接続の数を設定します。 | 
| `setConnectionTTL(long timeout, ChronoUnit unit)`   | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | 接続がアクティブでないと見なされるまでのCP接続TTLを設定します。 |
| `setKeepAliveTimeout(long timeout, ChronoUnit unit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | HTTP接続のキープアライブタイムアウトを設定します。このオプションは、タイムアウトをゼロに設定することでキープアライブを無効にするために使用できます - `0` |
| `setConnectionReuseStrategy(ConnectionReuseStrategy strategy)` | - `strategy` - enum `com.clickhouse.client.api.ConnectionReuseStrategy` 定数 | 接続プールが使用すべき戦略を選択します：返却後すぐに接続を再利用する場合は `LIFO`、または接続が利用可能になる順序で使用する場合は `FIFO`。返却された接続は即座には使用されません。 |
| `setSocketTimeout(long timeout, ChronoUnit unit)`   | - `timeout` - 時間単位でのタイムアウト。<br /> - `unit` - `timeout` の時間単位 | 読み取りおよび書き込み操作に影響を与えるソケットタイムアウトを設定します。 | 
| `setSocketRcvbuf(long size)`                        | - `size` - バイト数 | TCPソケット受信バッファのサイズを設定します。このバッファはJVMメモリ外にあります。 |
| `setSocketSndbuf(long size)`                        | - `size` - バイト数 | TCPソケット送信バッファのサイズを設定します。このバッファはJVMメモリ外にあります。 |
| `setSocketKeepAlive(boolean value)`                 | - `value` - オプションを有効にすべきかどうかのフラグ。 | クライアントによって作成されるすべてのTCPソケットに対して `SO_KEEPALIVE` オプションを設定します。 TCPKeepAliveは、接続の生存状況をチェックし、急に終了したものを検出するのに役立つメカニズムを有効にします。 | 
| `setSocketTcpNodelay(boolean value)`                | - `value` - オプションを有効にすべきかどうかのフラグ。 | クライアントによって作成されるすべてのTCPソケットに対して `SO_NODELAY` オプションを設定します。このTCPオプションは、ソケットが可能な限り速やかにデータをプッシュすることを可能にします。 |
| `setSocketLinger(int secondsToWait)`                | - `secondsToWait` - 秒数。 | クライアントによって作成されるすべてのTCPソケットのリンガー時間を設定します。 |
| `compressServerResponse(boolean enabled)`           | - `enabled` - オプションを有効にすべきかどうかのフラグ | サーバがその応答を圧縮すべきかを設定します。 | 
| `compressClientRequest(boolean enabled)`            | - `enabled` - オプションを有効にすべきかどうかのフラグ | クライアントがそのリクエストを圧縮すべきかを設定します。 |
| `useHttpCompression(boolean enabled)`                | - `enabled` - オプションを有効にすべきかどうかのフラグ | 対応するオプションが有効な場合、クライアント/サーバ間の通信にHTTP圧縮を使用すべきかを設定します。 | 
| `setLZ4UncompressedBufferSize(int size)`            | - `size` - バイト数 | データストリームの未圧縮部分を受け取るバッファのサイズを設定します。バッファが過小評価されている場合、新しいものが作成され、対応する警告がログに表示されます。 | 
| `setDefaultDatabase(String database)`                | - `database` - データベースの名前 | デフォルトのデータベースを設定します。 |
| `addProxy(ProxyType type, String host, int port)`   | - `type` - プロキシタイプ。<br /> - `host` - プロキシホスト名またはIPアドレス。<br /> - `port` - プロキシポート | サーバと通信するために使用するプロキシを設定します。プロキシが認証を必要とする場合、プロキシを設定する必要があります。 |
| `setProxyCredentials(String user, String pass)`     | - `user` - プロキシユーザー名。<br /> - `pass` - パスワード | プロキシ認証に使用するユーザ資格情報を設定します。 |
| `setExecutionTimeout(long timeout, ChronoUnit timeUnit)` | - `timeout` - 時間単位でのタイムアウト。<br /> - `timeUnit` - `timeout` の時間単位 | クエリの最大実行タイムアウトを設定します。 |
| `setHttpCookiesEnabled(boolean enabled)`            | - `enabled` - オプションを有効にすべきかどうかのフラグ | HTTPクッキーを記憶し、サーバに送信するべきかを設定します。 |
| `setSSLTrustStore(String path)`                      | - `path` - ローカル（クライアント側）システム上のファイルパス | クライアントがサーバホスト検証のためにSSLトラストストアを使用すべきかを設定します。 | 
| `setSSLTrustStorePassword(String password)`          | - `password` - 秘密の値 | `setSSLTrustStore(String path)` で指定されたSSLトラストストアをロック解除するために使用するパスワードを設定します。 |
| `setSSLTrustStoreType(String type)`                  | - `type` - トラストストアタイプ名 | `setSSLTrustStore(String path)` で指定されたトラストストアのタイプを設定します。 | 
| `setRootCertificate(String path)`                     | - `path` - ローカル（クライアント側）システム上のファイルパス | クライアントがサーバホスト検証のために指定されたルート（CA）証明書を使用すべきかを設定します。 |
| `setClientCertificate(String path)`                   | - `path` - ローカル（クライアント側）システム上のファイルパス | SSL接続を開始する際に使用するクライアント証明書のパスを設定します。 |
| `setClientKey(String path)`                           | - `path` - ローカル（クライアント側）システム上のファイルパス | サーバとのSSL通信を暗号化するために使用するクライアント秘密鍵を設定します。 |
| `useServerTimeZone(boolean useServerTimeZone)`       | - `useServerTimeZone` - オプションを有効にすべきかどうかのフラグ | DATEとDATETIMEカラムの値をデコードする際にサーバタイムゾーンを使用すべきかを設定します。有効にすると、`setServerTimeZone(String timeZone)` でサーバタイムゾーンが設定されるべきです。 | 
| `useTimeZone(String timeZone)`                        | - `timeZone` - Javaの妥当なタイムゾーンIDの文字列値（`java.time.ZoneId` を参照） | DATEとDATETIMEカラムの値をデコードするときに指定されたタイムゾーンを使用すべきかを設定します。サーバタイムゾーンを上書きします。 |
| `setServerTimeZone(String timeZone)`                  | - `timeZone` - Javaの妥当なタイムゾーンIDの文字列値（`java.time.ZoneId` を参照） | サーバ側のタイムゾーンを設定します。デフォルトではUTCタイムゾーンが使用されます。 | 
| `useAsyncRequests(boolean async)`                     | - `async` - オプションを有効にすべきかどうかのフラグ。 | クライアントがリクエストを別スレッドで実行すべきかを設定します。デフォルトでは無効で、アプリケーションはマルチスレッドタスクをどのように整理するかをよく知っており、別スレッドでタスクを実行することはパフォーマンスに役立たないためです。 | 
| `setSharedOperationExecutor(ExecutorService executorService)` | - `executorService` - 実行サービスのインスタンス。 | 操作タスクのための実行サービスを設定します。 | 
| `setClientNetworkBufferSize(int size)`               | - `size` - バイト数 | ソケットとアプリケーション間でデータを行き来させるために使用されるアプリケーションメモリスペース内のバッファサイズを設定します。大きくするとTCPスタックへのシステムコールが減りますが、各接続にどれだけメモリが消費されるかに影響します。このバッファは短命の接続のためGCの対象にもなります。また、大きな連続したメモリブロックの割り当てが問題になる可能性があることにも注意してください。デフォルトは `300,000` バイトです。 |
| `retryOnFailures(ClientFaultCause ...causes)`        | - `causes` - enum定数 `com.clickhouse.client.api.ClientFaultCause` | 回復可能な/再試行可能な故障の種類を設定します。 | 
| `setMaxRetries(int maxRetries)`                       | - `maxRetries` - 再試行の回数 | `retryOnFailures(ClientFaultCause ...causes)` で定義された失敗の最大再試行回数を設定します。 | 
| `allowBinaryReaderToReuseBuffers(boolean reuse)`      | - `reuse` - オプションを有効にすべきかどうかのフラグ | ほとんどのデータセットは小さなバイトシーケンスとしてエンコードされた数値データを含みます。デフォルトではリーダは必要なバッファを割り当て、その中にデータを読み込み、次にターゲットのNumberクラスに変換します。それは、多くの小さなオブジェクトが割り当てられ、解放されるため、重大なGCの圧迫を引き起こす可能性があります。このオプションが有効になっている場合、リーダは事前に割り当てられたバッファを使用して数値を変換します。それは安全です。なぜなら各リーダには独自のバッファセットがあり、リーダは一つのスレッドによって使用されるためです。 |
| `httpHeader(String key, String value)`               | - `key` - HTTPヘッダキー。<br /> - `value` - ヘッダの文字列値。 | 単一のHTTPヘッダの値を設定します。前の値は上書きされます。|
| `httpHeader(String key, Collection values)`          | - `key` - HTTPヘッダキー。<br /> - `values` - 文字列値のリスト。 | 単一のHTTPヘッダの値を設定します。前の値は上書きされます。|
| `httpHeaders(Map headers)`                            | - `header` - HTTPヘッダとその値のマップ。 | 複数のHTTPヘッダ値を一度に設定します。 |
| `serverSetting(String name, String value)`           | - `name` - クエリレベル設定の名前。<br /> - `value` - 設定の文字列値。 | 各クエリと共にサーバに渡す設定を設定します。個別の操作設定はこれを上書きすることがあります。[設定のリスト](/operations/settings/query-level) |
| `serverSetting(String name, Collection values)`      | - `name` - クエリレベル設定の名前。<br /> - `values` - 設定の文字列値。 | 各クエリと共にサーバに渡す設定を設定します。個別の操作設定はこれを上書きすることがあります。[設定のリスト](/operations/settings/query-level)。このメソッドは複数の値をもつ設定を設定するために便利です。たとえば[roles](/interfaces/http#setting-role-with-query-parameters) |
| `columnToMethodMatchingStrategy(ColumnToMethodMatchingStrategy strategy)` | - `strategy` - カラムとフィールドのマッチング戦略の実装 | DTOを登録する際にDTOクラスのフィールドとDBカラムを一致させるために使用するカスタム戦略を設定します。 | 
| `useHTTPBasicAuth(boolean useBasicAuth)`             | - `useBasicAuth` - オプションを有効にすべきかどうかのフラグ | ユーザー名とパスワードで認証するために基本的なHTTP認証を使用すべきかを設定します。デフォルトは有効です。この種の認証を使用すると、HTTPヘッダを介して転送できない特殊文字を含むパスワードの問題が解決されます。 |
| `setClientName(String clientName)`                   | - `clientName` - アプリケーション名を表す文字列 | 呼び出しアプリケーションに関する追加情報を設定します。この文字列はサーバにクライアント名として渡されます。HTTPプロトコルの場合、これは `User-Agent` ヘッダとして渡されます。 |
| `useBearerTokenAuth(String bearerToken)`             | - `bearerToken` - エンコードされたベアラートークン | ベアラートークン認証を使用して、どのトークンを使用するかを指定します。トークンはそのまま送信されるため、渡す前にエンコードする必要があります。 |

## 一般的な定義 {#common-definitions}

### ClickHouseFormat {#clickhouseformat}

[サポートされているフォーマット](/interfaces/formats)の列挙です。ClickHouseがサポートするすべてのフォーマットが含まれています。

* `raw` - ユーザーは生データをトランスコーディングする必要があります。 
* `full` - クライアントは自分でデータをトランスコードでき、生データストリームを受け入れます。
* `-` - このフォーマットに対してClickHouseでサポートされていない操作

このクライアントバージョンは次のフォーマットをサポートしています：

| フォーマット                                                                                                                     | 入力  | 出力  |
|-------------------------------------------------------------------------------------------------------------------------------|:------:|:-------:|
| [TabSeparated](/interfaces/formats#tabseparated)                                                                              | raw    | raw     |
| [TabSeparatedRaw](/interfaces/formats#tabseparatedraw)                                                                        | raw    | raw     |
| [TabSeparatedWithNames](/interfaces/formats#tabseparatedwithnames)                                                            | raw    | raw     |
| [TabSeparatedWithNamesAndTypes](/interfaces/formats#tabseparatedwithnamesandtypes)                                            | raw    | raw     |
| [TabSeparatedRawWithNames](/interfaces/formats#tabseparatedrawwithnames)                                                      | raw    | raw     |
| [TabSeparatedRawWithNamesAndTypes](/interfaces/formats#tabseparatedrawwithnamesandtypes)                                     | raw    | raw     |
| [Template](/interfaces/formats#format-template)                                                                               | raw    | raw     |
| [TemplateIgnoreSpaces](/interfaces/formats#templateignorespaces)                                                            | raw    |  -      |
| [CSV](/interfaces/formats#csv)                                                                                               | raw    | raw     |
| [CSVWithNames](/interfaces/formats#csvwithnames)                                                                             | raw    | raw     |
| [CSVWithNamesAndTypes](/interfaces/formats#csvwithnamesandtypes)                                                             | raw    | raw     |
| [CustomSeparated](/interfaces/formats#format-customseparated)                                                                | raw    | raw     |
| [CustomSeparatedWithNames](/interfaces/formats#customseparatedwithnames)                                                      | raw    | raw     |
| [CustomSeparatedWithNamesAndTypes](/interfaces/formats#customseparatedwithnamesandtypes)                                      | raw    | raw     |
| [SQLInsert](/interfaces/formats#sqlinsert)                                                                                    | -      | raw     |
| [Values](/interfaces/formats#data-format-values)                                                                              | raw    | raw     |
| [Vertical](/interfaces/formats#vertical)                                                                                      | -      | raw     |
| [JSON](/interfaces/formats#json)                                                                                              | raw    | raw     |
| [JSONAsString](/interfaces/formats#jsonasstring)                                                                              | raw    | -       |
| [JSONAsObject](/interfaces/formats#jsonasobject)                                                                              | raw    | -       |
| [JSONStrings](/interfaces/formats#jsonstrings)                                                                                | raw    | raw     |
| [JSONColumns](/interfaces/formats#jsoncolumns)                                                                                | raw    | raw     |
| [JSONColumnsWithMetadata](/interfaces/formats#jsoncolumnsmonoblock)                                                          | raw    | raw     |
| [JSONCompact](/interfaces/formats#jsoncompact)                                                                                | raw    | raw     |
| [JSONCompactStrings](/interfaces/formats#jsoncompactstrings)                                                                  | -      | raw     |
| [JSONCompactColumns](/interfaces/formats#jsoncompactcolumns)                                                                  | raw    | raw     |
| [JSONEachRow](/interfaces/formats#jsoneachrow)                                                                                | raw    | raw     |
| [PrettyJSONEachRow](/interfaces/formats#prettyjsoneachrow)                                                                    | -      | raw     |
| [JSONEachRowWithProgress](/interfaces/formats#jsoneachrowwithprogress)                                                        | -      | raw     |
| [JSONStringsEachRow](/interfaces/formats#jsonstringseachrow)                                                                  | raw    | raw     |
| [JSONStringsEachRowWithProgress](/interfaces/formats#jsonstringseachrowwithprogress)                                         | -      | raw     |
| [JSONCompactEachRow](/interfaces/formats#jsoncompacteachrow)                                                                  | raw    | raw     |
| [JSONCompactEachRowWithNames](/interfaces/formats#jsoncompacteachrowwithnames)                                                | raw    | raw     |
| [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats#jsoncompacteachrowwithnamesandtypes)                                | raw    | raw     |
| [JSONCompactStringsEachRow](/interfaces/formats#jsoncompactstringseachrow)                                                    | raw    | raw     |
| [JSONCompactStringsEachRowWithNames](/interfaces/formats#jsoncompactstringseachrowwithnames)                                  | raw    | raw     |
| [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats#jsoncompactstringseachrowwithnamesandtypes)                  | raw    | raw     |
| [JSONObjectEachRow](/interfaces/formats#jsonobjecteachrow)                                                                    | raw    | raw     |
| [BSONEachRow](/interfaces/formats#bsoneachrow)                                                                                | raw    | raw     |
| [TSKV](/interfaces/formats#tskv)                                                                                              | raw    | raw     |
| [Pretty](/interfaces/formats#pretty)                                                                                          | -      | raw     |
| [PrettyNoEscapes](/interfaces/formats#prettynoescapes)                                                                        | -      | raw     |
| [PrettyMonoBlock](/interfaces/formats#prettymonoblock)                                                                        | -      | raw     |
| [PrettyNoEscapesMonoBlock](/interfaces/formats#prettynoescapesmonoblock)                                                    | -      | raw     |
| [PrettyCompact](/interfaces/formats#prettycompact)                                                                            | -      | raw     |
| [PrettyCompactNoEscapes](/interfaces/formats#prettycompactnoescapes)                                                          | -      | raw     |
| [PrettyCompactMonoBlock](/interfaces/formats#prettycompactmonoblock)                                                          | -      | raw     |
| [PrettyCompactNoEscapesMonoBlock](/interfaces/formats#prettycompactnoescapesmonoblock)                                      | -      | raw     |
| [PrettySpace](/interfaces/formats#prettyspace)                                                                                | -      | raw     |
| [PrettySpaceNoEscapes](/interfaces/formats#prettyspacenoescapes)                                                              | -      | raw     |
| [PrettySpaceMonoBlock](/interfaces/formats#prettyspacemonoblock)                                                              | -      | raw     |
| [PrettySpaceNoEscapesMonoBlock](/interfaces/formats#prettyspacenoescapesmonoblock)                                          | -      | raw     |
| [Prometheus](/interfaces/formats#prometheus)                                                                                  | -      | raw     |
| [Protobuf](/interfaces/formats#protobuf)                                                                                      | raw    | raw     |
| [ProtobufSingle](/interfaces/formats#protobufsingle)                                                                          | raw    | raw     |
| [ProtobufList](/interfaces/formats#protobuflist)                                                                              | raw    | raw     |
| [Avro](/interfaces/formats#data-format-avro)                                                                                  | raw    | raw     |
| [AvroConfluent](/interfaces/formats#data-format-avro-confluent)                                                               | raw    | -       |
| [Parquet](/interfaces/formats#data-format-parquet)                                                                            | raw    | raw     |
| [ParquetMetadata](/interfaces/formats#data-format-parquet-metadata)                                                           | raw    | -       |
| [Arrow](/interfaces/formats#data-format-arrow)                                                                                | raw    | raw     |
| [ArrowStream](/interfaces/formats#data-format-arrow-stream)                                                                   | raw    | raw     |
| [ORC](/interfaces/formats#data-format-orc)                                                                                    | raw    | raw     |
| [One](/interfaces/formats#data-format-one)                                                                                    | raw    | -       |
| [Npy](/interfaces/formats#data-format-npy)                                                                                    | raw    | raw     |
| [RowBinary](/interfaces/formats#rowbinary)                                                                                    | full   | full    |
| [RowBinaryWithNames](/interfaces/formats#rowbinarywithnamesandtypes)                                                          | full   | full    |
| [RowBinaryWithNamesAndTypes](/interfaces/formats#rowbinarywithnamesandtypes)                                                  | full   | full    |
| [RowBinaryWithDefaults](/interfaces/formats#rowbinarywithdefaults)                                                            | full   | -       |
| [Native](/interfaces/formats#native)                                                                                          | full   | raw     |
| [Null](/interfaces/formats#null)                                                                                              | -      | raw     |
| [XML](/interfaces/formats#xml)                                                                                                 | -      | raw     |
| [CapnProto](/interfaces/formats#capnproto)                                                                                    | raw    | raw     |
| [LineAsString](/interfaces/formats#lineasstring)                                                                              | raw    | raw     |
| [Regexp](/interfaces/formats#data-format-regexp)                                                                              | raw    | -       |
| [RawBLOB](/interfaces/formats#rawblob)                                                                                        | raw    | raw     |
| [MsgPack](/interfaces/formats#msgpack)                                                                                        | raw    | raw     |
| [MySQLDump](/interfaces/formats#mysqldump)                                                                                    | raw    | -       |
| [DWARF](/interfaces/formats#dwarf)                                                                                            | raw    | -       |
| [Markdown](/interfaces/formats#markdown)                                                                                      | -      | raw     |
| [Form](/interfaces/formats#form)                                                                                            | raw    | -       |


## 挿入API {#insert-api}

### insert(String tableName, InputStream data, ClickHouseFormat format) {#insertstring-tablename-inputstream-data-clickhouseformat-format}

指定されたフォーマットのバイトの `InputStream` としてデータを受け入れます。 `data`は `format` でエンコードされていることが期待されています。

**シグネチャ**

```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format, InsertSettings settings)
```
```java
CompletableFuture<InsertResponse> insert(String tableName, InputStream data, ClickHouseFormat format)
```

**パラメータ**

`tableName` - 対象テーブル名。

`data` - エンコードされたデータの入力ストリーム。

`format` - データがエンコードされているフォーマット。

`settings` - リクエスト設定。

**戻り値**

`InsertResponse` 型の Future - 操作の結果およびサーバー側のメトリクスなどの追加情報。

**例**

```java showLineNumbers
try (InputStream dataStream = getDataStream()) {
    try (InsertResponse response = client.insert(TABLE_NAME, dataStream, ClickHouseFormat.JSONEachRow,
            insertSettings).get(3, TimeUnit.SECONDS)) {

        log.info("挿入完了: {} 行が書き込まれました", response.getMetrics().getMetric(ServerMetrics.NUM_ROWS_WRITTEN).getLong());
    } catch (Exception e) {
        log.error("JSONEachRowデータの書き込みに失敗しました", e);
        throw new RuntimeException(e);
    }
}

```

### insert(String tableName, List&lt;?> data, InsertSettings settings) {#insertstring-tablename-listlt-data-insertsettings-settings}

データベースに書き込みリクエストを送信します。オブジェクトのリストは効率的なフォーマットに変換され、サーバーに送信されます。リスト項目のクラスは、`register(Class, TableSchema)` メソッドを使用して事前に登録する必要があります。

**シグネチャ**
```java
client.insert(String tableName, List<?> data, InsertSettings settings)
client.insert(String tableName, List<?> data)
```

**パラメータ**

`tableName` - 対象テーブルの名前。 

`data` - DTO（データ転送オブジェクト）オブジェクトのコレクション。

`settings` - リクエスト設定。

**戻り値**

`InsertResponse` 型の Future - 操作の結果およびサーバー側のメトリクスなどの追加情報。

**例**

```java showLineNumbers
// 重要なステップ（1回実行） - テーブルスキーマに従ってオブジェクトシリアライザを事前コンパイルするためにクラスを登録します。
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));

List<ArticleViewEvent> events = loadBatch();

try (InsertResponse response = client.insert(TABLE_NAME, events).get()) {
    // レスポンスを処理し、その後クローズされ、リクエストに対応した接続が解放されます。
}
```

### InsertSettings {#insertsettings}

挿入操作の構成オプション。

**構成メソッド**

| メソッド                                       | 説明                                                                                                                  |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                 | 操作に割り当てられるクエリIDを設定します。デフォルト: `null`。                                                   |
| `setDeduplicationToken(String token)`        | 重複排除トークンを設定します。このトークンはサーバーに送信され、クエリを識別するために使用できます。デフォルト: `null`。 |
| `setInputStreamCopyBufferSize(int size)`     | コピー用バッファのサイズ。データがユーザー提供の入力ストリームから出力ストリームにコピーされるために使用されます。デフォルト: `8196`。 |
| `serverSetting(String name, String value)`   | 操作のために個別のサーバー設定を設定します。                                                                        |
| `serverSetting(String name, Collection values)` | 操作のために複数の値を持つ個別のサーバー設定を設定します。コレクションの項目は `String` 値である必要があります。      |
| `setDBRoles(Collection dbRoles)`             | 操作を実行する前に設定するDBロールを設定します。コレクションの項目は `String` 値である必要があります。                |
| `setOption(String option, Object value)`     | 生の形式で構成オプションを設定します。これはサーバー設定ではありません。                                          |

### InsertResponse {#insertresponse}

挿入操作の結果を保持するレスポンスオブジェクトです。クライアントがサーバーからのレスポンスを受け取った場合にのみ利用可能です。 

:::note
このオブジェクトは、接続を解放するためにできるだけ早く閉じる必要があります。以前のレスポンスのすべてのデータが完全に読み取られるまで、接続は再利用できません。
:::

| メソッド                      | 説明                                                                                                      |
|-----------------------------|---------------------------------------------------------------------------------------------------------|
| `OperationMetrics getMetrics()` | 操作のメトリクスを持つオブジェクトを返します。                                                    |
| `String getQueryId()`       | アプリケーションによって操作のために割り当てられたクエリIDを返します（操作設定またはサーバーによって）。 |

## Query API {#query-api}

### query(String sqlQuery) {#querystring-sqlquery}

そのまま `sqlQuery` を送信します。レスポンスのフォーマットはクエリ設定によって設定されます。 `QueryResponse` は、サポートしているフォーマットのためにリーダーによって消費されるべきレスポンスストリームへの参照を保持します。

**シグネチャ**

```java 
CompletableFuture<QueryResponse> query(String sqlQuery, QuerySettings settings)
CompletableFuture<QueryResponse> query(String sqlQuery)
```

**パラメータ**

`sqlQuery` - 単一のSQLステートメント。クエリはそのままサーバーに送信されます。

`settings` - リクエスト設定。

**戻り値**

`QueryResponse` 型の Future - 結果データセットおよびサーバー側のメトリクスなどの追加情報。レスポンスオブジェクトはデータセットを消費した後に閉じる必要があります。

**例**

```java 
final String sql = "select * from " + TABLE_NAME + " where title <> '' limit 10";

// デフォルトのフォーマットは RowBinaryWithNamesAndTypesFormatReader なので、リーダーはカラムについてのすべての情報を持っています。
try (QueryResponse response = client.query(sql).get(3, TimeUnit.SECONDS);) {

    // データに便利にアクセスするためのリーダーを作成します。
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(response);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み込み、解析します。

        // 値を取得
        double id = reader.getDouble("id");
        String title = reader.getString("title");
        String url = reader.getString("url");

        // データを収集
    }
} catch (Exception e) {
    log.error("データの読み込みに失敗しました", e);
}

// HTTP接続をできるだけ早く解放するために、ビジネスロジックを読み取りブロックの外に置きます。  
```

### query(String sqlQuery, Map&lt;String, Object> queryParams, QuerySettings settings) {#querystring-sqlquery-mapltstring-object-queryparams-querysettings-settings}

そのまま `sqlQuery` を送信します。さらに、クエリパラメータを送信し、サーバーがSQL式をコンパイルできるようにします。

**シグネチャ**
```java 
CompletableFuture<QueryResponse> query(String sqlQuery, Map<String, Object> queryParams, QuerySettings settings)
```

**パラメータ**

`sqlQuery` - プレースホルダー `{}` を含む SQL 式。 

`queryParams` - サーバーで SQL 式を完成させるための変数のマップ。

`settings` - リクエスト設定。 

**戻り値**

`QueryResponse` 型の Future - 結果データセットおよびサーバー側のメトリクスなどの追加情報。レスポンスオブジェクトはデータセットを消費した後に閉じる必要があります。

**例**

```java showLineNumbers

// 構成パラメータを定義します。これらはリクエストとともにサーバーに送信されます。
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("param1", 2);

try (QueryResponse queryResponse =
        client.query("SELECT * FROM " + table + " WHERE col1 >= {param1:UInt32}", queryParams, new QuerySettings()).get()) {

    // データに便利にアクセスするためのリーダーを作成します。
    ClickHouseBinaryFormatReader reader = client.newBinaryFormatReader(queryResponse);

    while (reader.hasNext()) {
        reader.next(); // ストリームから次のレコードを読み込み、解析します。

        // データを読み込む 
    }

} catch (Exception e) {
    log.error("データの読み込みに失敗しました", e);
}

```

### queryAll(String sqlQuery) {#queryallstring-sqlquery}

`RowBinaryWithNamesAndTypes` フォーマットでデータをクエリします。結果をコレクションとして返します。リードパフォーマンスはリーダーを使用する場合と同じですが、全体のデータセットを保持するためにより多くのメモリが必要です。

**シグネチャ**
```java 
List<GenericRecord> queryAll(String sqlQuery)
```

**パラメータ**

`sqlQuery` - サーバーからデータをクエリするための SQL 式。

**戻り値**

全体のデータセットを `GenericRecord` オブジェクトのリストとして表現し、結果データに行形式でアクセスできるようになります。 

**例**

```java showLineNumbers
try {
    log.info("全テーブルを読み込んでレコードごとに処理しています");
    final String sql = "select * from " + TABLE_NAME + " where title <> ''";

    // 結果セット全体を読み込み、レコードごとに処理します
    client.queryAll(sql).forEach(row -> {
        double id = row.getDouble("id");
        String title = row.getString("title");
        String url = row.getString("url");

        log.info("id: {}, title: {}, url: {}", id, title, url);
    });
} catch (Exception e) {
    log.error("データの読み込みに失敗しました", e);
}
```

### QuerySettings {#querysettings}

クエリ操作の構成オプション。

**構成メソッド**

| メソッド                                       | 説明                                                                                                                 |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `setQueryId(String queryId)`                 | 操作に割り当てられるクエリIDを設定します。                                                                          |
| `setFormat(ClickHouseFormat format)`         | レスポンスフォーマットを設定します。詳細なリストについては `RowBinaryWithNamesAndTypes` を参照してください。     |
| `setMaxExecutionTime(Integer maxExecutionTime)` | サーバーでの操作実行時間を設定します。読み取りタイムアウトには影響しません。                                     |
| `waitEndOfQuery(Boolean waitEndOfQuery)`     | サーバーに対してレスポンスを送信する前にクエリの終了を待つように要求します。                                      |
| `setUseServerTimeZone(Boolean useServerTimeZone)` | サーバーのタイムゾーン（クライアント構成を参照）が、操作の結果における日付/日時タイプ解析に使用されます。デフォルト `false`。 |
| `setUseTimeZone(String timeZone)`            | サーバーに対して時間変換に `timeZone` を使用するように要求します。詳細は [session_timezone](/operations/settings/settings#session_timezone) を参照してください。 |
| `serverSetting(String name, String value)`   | 操作のために個別のサーバー設定を設定します。                                                                        |
| `serverSetting(String name, Collection values)` | 操作のために複数の値を持つ個別のサーバー設定を設定します。コレクションの項目は `String` 値である必要があります。     |
| `setDBRoles(Collection dbRoles)`             | 操作を実行する前に設定するDBロールを設定します。コレクションの項目は `String` 値である必要があります。                |
| `setOption(String option, Object value)`     | 生の形式で構成オプションを設定します。これはサーバー設定ではありません。                                         |

### QueryResponse {#queryresponse}

クエリ実行結果を保持するレスポンスオブジェクトです。クライアントがサーバーからのレスポンスを受け取った場合にのみ利用可能です。

:::note
このオブジェクトは、接続を解放するためにできるだけ早く閉じる必要があります。以前のレスポンスのすべてのデータが完全に読み取られるまで、接続は再利用できません。
:::

| メソッド                              | 説明                                                                                                     |
|-------------------------------------|--------------------------------------------------------------------------------------------------------|
| `ClickHouseFormat getFormat()`      | レスポンス内のデータがエンコードされているフォーマットを返します。                                         |
| `InputStream getInputStream()`      | 指定されたフォーマットでのデータの非圧縮バイトストリームを返します。                                   |
| `OperationMetrics getMetrics()`     | 操作メトリクスを持つオブジェクトを返します。                                                           |
| `String getQueryId()`               | アプリケーションによって操作のために割り当てられたクエリIDを返します（操作設定またはサーバーによって）。 |
| `TimeZone getTimeZone()`            | レスポンス内で日付/日時タイプを処理するために使用されるべきタイムゾーンを返します。                        |

### Examples {#examples}

- 例のコードは [repo](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) で利用可能です。
- Springサービスの [実装](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) を参照してください。

## Common API {#common-api}

### getTableSchema(String table) {#gettableschemastring-table}

`table` のテーブルスキーマを取得します。

**シグネチャ**

```java 
TableSchema getTableSchema(String table)
TableSchema getTableSchema(String table, String database)
```

**パラメータ**

`table` - スキーマデータを取得するためのテーブル名。

`database` - 対象テーブルが定義されているデータベース。

**戻り値**

テーブルカラムのリストを含む `TableSchema` オブジェクトを返します。

### getTableSchemaFromQuery(String sql) {#gettableschemafromquerystring-sql}

SQLステートメントからスキーマを取得します。 

**シグネチャ**

```java 
TableSchema getTableSchemaFromQuery(String sql)
```

**パラメータ**

`sql` - スキーマを返すべき "SELECT" SQL ステートメント。

**戻り値**

`sql` 式に一致するカラムを持つ `TableSchema` オブジェクトを返します。

### TableSchema {#tableschema}

### register(Class&lt;?> clazz, TableSchema schema) {#registerclasslt-clazz-tableschema-schema}

`schema` を使用してデータの読み書きに利用するためのJavaクラスのシリアル化およびデシリアル化層をコンパイルします。このメソッドは、ペアのゲッター/セッターと対応するカラムのためのシリアライザおよびデシリアライザを作成します。カラムマッチは、メソッド名からその名前を抽出することによって見つかります。例えば、`getFirstName` は `first_name` または `firstname` に対応します。

**シグネチャ**

```java 
void register(Class<?> clazz, TableSchema schema)
```

**パラメータ**

`clazz` - データを読み書きするために使用されるPOJOを表すクラス。

`schema` - POJOのプロパティとの一致に使用するデータスキーマ。

**例**

```java showLineNumbers 
client.register(ArticleViewEvent.class, client.getTableSchema(TABLE_NAME));
```

## 使用例 {#usage-examples}

完全な例のコードは、'example' [フォルダ](https://github.com/ClickHouse/clickhouse-java/tree/main/examples) に保存されています：

- [client-v2](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/client-v2) - 主な例のセット。
- [demo-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-service) - Spring Bootアプリケーションでクライアントを使用する方法の例。
- [demo-kotlin-service](https://github.com/ClickHouse/clickhouse-java/tree/main/examples/demo-kotlin-service) - Ktor（Kotlin）アプリケーションでクライアントを使用する方法の例。
```
