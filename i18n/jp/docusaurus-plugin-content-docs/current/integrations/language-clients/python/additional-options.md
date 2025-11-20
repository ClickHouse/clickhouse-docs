---
sidebar_label: '追加オプション'
sidebar_position: 3
keywords: ['clickhouse', 'python', 'options', 'settings']
description: 'ClickHouse Connect の追加オプション'
slug: /integrations/language-clients/python/additional-options
title: '追加オプション'
doc_type: 'reference'
---



# 追加オプション {#additional-options}

ClickHouse Connectは、高度なユースケースに対応するための追加オプションを複数提供しています。


## グローバル設定 {#global-settings}

ClickHouse Connectの動作をグローバルに制御する設定がいくつかあります。これらの設定には、トップレベルの`common`パッケージからアクセスします:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの共通設定`autogenerate_session_id`、`product_name`、`readonly`は、`clickhouse_connect.get_client`メソッドでクライアントを作成する前に_必ず_変更してください。クライアント作成後にこれらの設定を変更しても、既存のクライアントの動作には影響しません。
:::

現在定義されているグローバル設定は以下の通りです:

| 設定名                        | デフォルト | オプション                 | 説明                                                                                                                                                                                                                                                   |
| ----------------------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autogenerate_session_id             | True    | True, False             | 各クライアントセッションに対して新しいUUID(1)セッションIDを自動生成します(提供されていない場合)。セッションIDが提供されていない場合(クライアントレベルまたはクエリレベルのいずれでも)、ClickHouseは各クエリに対してランダムな内部IDを生成します。                                            |
| dict_parameter_format               | 'json'  | 'json', 'map'           | パラメータ化されたクエリでPython辞書をJSON構文に変換するか、ClickHouse Map構文に変換するかを制御します。JSON列への挿入には`json`を、ClickHouse Map列には`map`を使用してください。                                                              |
| invalid_setting_action              | 'error' | 'drop', 'send', 'error' | 無効な設定または読み取り専用の設定が提供された場合(クライアントセッションまたはクエリのいずれか)に実行するアクション。`drop`の場合は設定が無視され、`send`の場合は設定がClickHouseに送信され、`error`の場合はクライアント側でProgrammingErrorが発生します。 |
| max_connection_age                  | 600     |                         | HTTP Keep Alive接続が開いたまま/再利用される最大秒数。これにより、ロードバランサー/プロキシの背後にある単一のClickHouseノードへの接続の集中を防ぎます。デフォルトは10分です。                                                     |
| product_name                        |         |                         | ClickHouse Connectを使用しているアプリケーションを追跡するために、クエリと共にClickHouseに渡される文字列。&lt;product name;&gl/&lt;product version&gt;の形式で指定する必要があります。                                                                                       |
| readonly                            | 0       | 0, 1                    | バージョン19.17以前の暗黙的な"read_only" ClickHouse設定。非常に古いClickHouseバージョンでの動作を可能にするために、ClickHouseの"read_only"値に合わせて設定できます。                                                                  |
| send_os_user                        | True    | True, False             | ClickHouseに送信されるクライアント情報(HTTP User-Agent文字列)に、検出されたオペレーティングシステムのユーザーを含めます。                                                                                                                                                 |
| send_integration_tags               | True    | True, False             | ClickHouseに送信されるクライアント情報(HTTP User-Agent文字列)に、使用されている統合ライブラリ/バージョン(例: Pandas/SQLAlchemyなど)を含めます。                                                                                                               |
| use_protocol_version                | True    | True, False             | クライアントプロトコルバージョンを使用します。これは`DateTime`タイムゾーン列に必要ですが、現在のバージョンのchproxyでは動作しません。                                                                                                                               |
| max_error_size                      | 1024    |                         | クライアントエラーメッセージで返される最大文字数。この設定を0にすると、完全なClickHouseエラーメッセージが取得されます。デフォルトは1024文字です。                                                                                  |
| http_buffer_size                    | 10MB    |                         | HTTPストリーミングクエリに使用される「インメモリ」バッファのサイズ(バイト単位)。                                                                                                                                                                                    |
| preserve_pandas_datetime_resolution | False   | True, False             | Trueに設定し、pandas 2.xを使用している場合、datetime64/timedelta64のdtype解像度(例: 's'、'ms'、'us'、'ns')を保持します。Falseの場合(またはpandas &lt;2.xの場合)、互換性のためにナノ秒('ns')解像度に変換されます。                                              |


## 圧縮 {#compression}

ClickHouse Connectは、クエリ結果と挿入の両方において、lz4、zstd、brotli、gzip圧縮をサポートしています。圧縮を使用する際は、ネットワーク帯域幅/転送速度とCPU使用率(クライアントとサーバーの両方)の間にトレードオフが生じることを常に考慮してください。

圧縮されたデータを受信するには、ClickHouseサーバーの`enable_http_compression`を1に設定するか、ユーザーが「クエリごと」にこの設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client`ファクトリメソッドを呼び出す際の`compress`パラメータで制御されます。デフォルトでは、`compress`は`True`に設定されており、デフォルトの圧縮設定が適用されます。`query`、`query_np`、`query_df`クライアントメソッドで実行されるクエリの場合、ClickHouse Connectは`query`クライアントメソッド(および間接的に`query_np`と`query_df`)で実行されるクエリに対して、`lz4`、`zstd`、`br`(brotliライブラリがインストールされている場合はbrotli)、`gzip`、`deflate`エンコーディングを含む`Accept-Encoding`ヘッダーを追加します。(大半のリクエストでは、ClickHouseサーバーは`zstd`圧縮されたペイロードを返します。)挿入の場合、デフォルトでClickHouse Connectは`lz4`圧縮で挿入ブロックを圧縮し、`Content-Encoding: lz4` HTTPヘッダーを送信します。

`get_client`の`compress`パラメータは、`lz4`、`zstd`、`br`、`gzip`のいずれかの特定の圧縮方式に設定することもできます。その方式は、挿入とクエリ結果の両方に使用されます(ClickHouseサーバーがサポートしている場合)。必要な`zstd`および`lz4`圧縮ライブラリは、現在ClickHouse Connectにデフォルトでインストールされています。`br`/brotliを指定する場合は、brotliライブラリを別途インストールする必要があります。

なお、`raw*`クライアントメソッドは、クライアント設定で指定された圧縮を使用しません。

また、`gzip`圧縮の使用は推奨しません。データの圧縮と解凍の両方において、他の方式と比較して大幅に低速であるためです。


## HTTPプロキシのサポート {#http-proxy-support}

ClickHouse Connectは、`urllib3`ライブラリを使用して基本的なHTTPプロキシサポートを提供します。標準の`HTTP_PROXY`および`HTTPS_PROXY`環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client`メソッドで作成されたすべてのクライアントに適用されます。クライアントごとに個別に設定する場合は、get_clientメソッドの`http_proxy`または`https_proxy`引数を使用できます。HTTPプロキシサポートの実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies)のドキュメントを参照してください。

SOCKSプロキシを使用する場合は、`urllib3`の`SOCKSProxyManager`を`get_client`の`pool_mgr`引数として渡します。この場合、PySOCKSライブラリを直接インストールするか、`urllib3`の依存関係として`[socks]`オプションを指定してインストールする必要があります。


## 「旧」JSON データ型 {#old-json-data-type}

実験的な `Object`（または `Object('json')`）データ型は非推奨となっており、本番環境では使用を避けてください。ClickHouse Connect は後方互換性のため、このデータ型に対して限定的なサポートを継続していますが、このサポートには「トップレベル」または「親」の JSON 値を辞書または同等の形式で返すことが想定されるクエリは含まれておらず、そのようなクエリを実行すると例外が発生します。


## 「新しい」Variant/Dynamic/JSONデータ型（実験的機能） {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0リリース以降、`clickhouse-connect`は新しい（同じく実験的な）ClickHouseの型であるVariant、Dynamic、JSONに対する実験的サポートを提供しています。

### 使用上の注意 {#usage-notes}

- JSONデータは、Pythonの辞書型、またはJSONオブジェクト`{}`を含むJSON文字列として挿入できます。その他の形式のJSONデータはサポートされていません。
- これらの型のサブカラム/パスを使用するクエリは、サブカラムの型を返します。
- その他の使用上の注意については、ClickHouseのメイン[ドキュメント](https://clickhouse.com/docs)を参照してください。

### 既知の制限事項 {#known-limitations}

- これらの型を使用する前に、ClickHouseの設定で各型を有効にする必要があります。
- 「新しい」JSON型はClickHouse 24.8リリース以降で利用可能です。
- 内部フォーマットの変更により、`clickhouse-connect`はClickHouse 24.7リリース以降のVariant型とのみ互換性があります。
- 返されるJSONオブジェクトは`max_dynamic_paths`で指定された数の要素のみを返します（デフォルトは1024）。これは将来のリリースで修正される予定です。
- `Dynamic`カラムへの挿入は常にPython値の文字列表現になります。これは https://github.com/ClickHouse/ClickHouse/issues/70395 が修正された後、将来のリリースで修正される予定です。
- 新しい型の実装はCコードで最適化されていないため、よりシンプルで確立されたデータ型と比較してパフォーマンスがやや遅くなる可能性があります。
