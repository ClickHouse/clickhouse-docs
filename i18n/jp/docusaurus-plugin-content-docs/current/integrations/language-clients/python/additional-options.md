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

ClickHouse Connect は、高度なユースケースに対応するために、さまざまな追加オプションを提供しています。



## グローバル設定

ClickHouse Connect の動作をグローバルに制御する設定が少数あります。これらには、トップレベルの `common` パッケージからアクセスできます。

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの共通設定 `autogenerate_session_id`、`product_name`、`readonly` は、`clickhouse_connect.get_client` メソッドでクライアントを作成する前に *必ず* 変更してください。クライアント作成後にこれらの設定を変更しても、既存クライアントの動作には影響しません。
:::

現在、次のグローバル設定が定義されています。

| Setting Name                                    | Default         | Options                                         | Description                                                                                                                                                                                      |
| ----------------------------------------------- | --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| autogenerate&#95;session&#95;id                 | True            | True, False                                     | 各クライアントセッションごとに、新しい UUID(1) セッション ID を（指定されていない場合に）自動生成します。セッション ID が（クライアントまたはクエリレベルで）指定されていない場合、ClickHouse はクエリごとにランダムな内部 ID を生成します。                                                           |
| dict&#95;parameter&#95;format                   | &#39;json&#39;  | &#39;json&#39;, &#39;map&#39;                   | パラメータ化されたクエリで、Python の dictionary を JSON に変換するか、ClickHouse の Map 構文に変換するかを制御します。`json` は JSON カラムへの INSERT に、`map` は ClickHouse の Map カラムに対して使用してください。                                           |
| invalid&#95;setting&#95;action                  | &#39;error&#39; | &#39;drop&#39;, &#39;send&#39;, &#39;error&#39; | 無効または readonly の設定が（クライアントセッションまたはクエリに対して）指定された場合に取るアクションです。`drop` の場合、その設定は無視されます。`send` の場合、その設定は ClickHouse に送信されます。`error` の場合、クライアント側で ProgrammingError が送出されます。                            |
| max&#95;connection&#95;age                      | 600             |                                                 | HTTP Keep Alive 接続を開いたまま再利用する最大秒数です。これにより、ロードバランサーやプロキシの背後で単一の ClickHouse ノードに接続が集中することを防ぎます。デフォルトは 10 分です。                                                                                      |
| product&#95;name                                |                 |                                                 | ClickHouse Connect を使用しているアプリケーションを追跡するために、クエリとともに ClickHouse に渡される文字列です。形式は &lt;product name;&amp;gl/&lt;product version&gt; としてください。                                                           |
| readonly                                        | 0               | 0, 1                                            | バージョン 19.17 以前向けの暗黙的な &quot;read&#95;only&quot; ClickHouse 設定です。非常に古い ClickHouse バージョンで動作させるために、ClickHouse の &quot;read&#95;only&quot; 設定値と一致するように設定できます。                                        |
| send&#95;os&#95;user                            | True            | True, False                                     | ClickHouse に送信されるクライアント情報（HTTP User-Agent 文字列）に、検出されたオペレーティングシステムのユーザーを含めます。                                                                                                                     |
| send&#95;integration&#95;tags                   | True            | True, False                                     | ClickHouse に送信されるクライアント情報（HTTP User-Agent 文字列）に、使用しているインテグレーションライブラリ／バージョン（例: Pandas/SQLAlchemy/その他）を含めます。                                                                                       |
| use&#95;protocol&#95;version                    | True            | True, False                                     | クライアントプロトコルバージョンを使用します。これは `DateTime` タイムゾーンカラムに必要ですが、現在の chproxy バージョンでは問題が発生します。                                                                                                               |
| max&#95;error&#95;size                          | 1024            |                                                 | クライアント側のエラーメッセージで返される最大文字数です。この設定に 0 を指定すると、ClickHouse のエラーメッセージ全体を取得できます。デフォルトは 1024 文字です。                                                                                                      |
| http&#95;buffer&#95;size                        | 10MB            |                                                 | HTTP ストリーミングクエリに使用される「インメモリ」バッファのサイズ（バイト単位）です。                                                                                                                                                   |
| preserve&#95;pandas&#95;datetime&#95;resolution | False           | True, False                                     | True かつ pandas 2.x を使用している場合、datetime64/timedelta64 dtype の分解能（例: &#39;s&#39;、&#39;ms&#39;、&#39;us&#39;、&#39;ns&#39;）を保持します。False の場合（または pandas &lt;2.x の場合）、互換性のためにナノ秒（&#39;ns&#39;）分解能に変換します。 |


## 圧縮 {#compression}

ClickHouse Connect は、クエリ結果と挿入の両方に対して lz4、zstd、brotli、gzip による圧縮をサポートしています。圧縮を使用する場合は常に、ネットワーク帯域幅／転送速度と CPU 使用率（クライアント側・サーバー側の両方）のトレードオフがあることを念頭に置いてください。

圧縮されたデータを受信するには、ClickHouse サーバーの `enable_http_compression` を 1 に設定するか、ユーザーがクエリ単位でこの設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client` ファクトリメソッドを呼び出す際の `compress` パラメータで制御されます。デフォルトでは `compress` は `True` に設定されており、これによりデフォルトの圧縮設定が有効になります。`query`、`query_np`、`query_df` クライアントメソッドで実行されるクエリに対して、ClickHouse Connect は `lz4`、`zstd`、`br`（brotli ライブラリがインストールされている場合）、`gzip`、`deflate` エンコーディングを含む `Accept-Encoding` ヘッダーを追加します（`query` クライアントメソッドおよびそれを間接的に利用する `query_np` と `query_df` に適用されます）。大半のリクエストでは、ClickHouse サーバーは `zstd` で圧縮されたペイロードを返します。挿入処理については、デフォルトで ClickHouse Connect は挿入ブロックを `lz4` で圧縮し、`Content-Encoding: lz4` HTTP ヘッダーを送信します。

`get_client` の `compress` パラメータは、`lz4`、`zstd`、`br`、`gzip` のいずれかの特定の圧縮方式に設定することもできます。この場合、その方式が ClickHouse サーバーでサポートされていれば、挿入とクエリ結果の両方に対してその方式が使用されます。必須の `zstd` および `lz4` 圧縮ライブラリは、現在では ClickHouse Connect とともにデフォルトでインストールされます。`br`/brotli を指定する場合は、brotli ライブラリを別途インストールする必要があります。

`raw*` クライアントメソッドは、クライアント設定で指定された圧縮を使用しないことに注意してください。

また、`gzip` 圧縮の使用は推奨しません。データの圧縮および解凍の両方において、他の方式と比べて大幅に遅いためです。



## HTTP プロキシ対応 {#http-proxy-support}

ClickHouse Connect は、`urllib3` ライブラリを使用して基本的な HTTP プロキシをサポートします。標準的な `HTTP_PROXY` および `HTTPS_PROXY` 環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client` メソッドで作成されたすべてのクライアントに適用される点に注意してください。クライアント単位で設定するには、`get_client` メソッドに `http_proxy` または `https_proxy` 引数を渡すこともできます。HTTP プロキシ対応の実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) のドキュメントを参照してください。

SOCKS プロキシを使用するには、`urllib3` の `SOCKSProxyManager` を `get_client` の `pool_mgr` 引数として渡します。この場合、PySocks ライブラリを直接インストールするか、`urllib3` の依存関係として `[socks]` オプション付きでインストールする必要がある点に注意してください。



## 「旧」JSON データ型 {#old-json-data-type}

実験的な `Object`（または `Object('json')`）データ型は非推奨であり、本番環境での使用は避けるべきです。ClickHouse Connect は後方互換性のため、このデータ型に対する限定的なサポートを引き続き提供しています。ただし、このサポートには、トップレベルまたは親の JSON 値を辞書型（もしくは同等の形式）として返すことが想定されるクエリは含まれておらず、そのようなクエリでは例外がスローされます。



## 「新しい」Variant/Dynamic/JSON データ型（実験的機能） {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0 リリース以降、`clickhouse-connect` は新しい（同じく実験的な）ClickHouse データ型である Variant、Dynamic、JSON への実験的サポートを提供しています。

### 使用上の注意 {#usage-notes}
- JSON データは、Python の辞書、または JSON オブジェクト `{}` を含む JSON 文字列として挿入できます。その他の形式の JSON データはサポートされません。
- これらの型に対してサブカラム／パスを使用したクエリを実行すると、サブカラムの型が返されます。
- その他の使用上の注意については、ClickHouse のメイン [ドキュメント](https://clickhouse.com/docs) を参照してください。

### 既知の制限事項 {#known-limitations}
- これらの各型は、使用する前に ClickHouse の設定で有効化する必要があります。
- 「新しい」JSON 型は ClickHouse 24.8 リリース以降で利用可能です。
- 内部形式の変更により、`clickhouse-connect` は ClickHouse 24.7 リリース以降の Variant 型としか互換性がありません。
- 返される JSON オブジェクトは、`max_dynamic_paths` の数（デフォルトは 1024）までの要素しか返しません。これは今後のリリースで修正される予定です。
- `Dynamic` カラムへの挿入は、常に Python の値の文字列表現になります。これは、https://github.com/ClickHouse/ClickHouse/issues/70395 が修正された後の将来のリリースで修正される予定です。
- 新しい型の実装は C コードで最適化されていないため、単純で確立されたデータ型と比べてパフォーマンスがやや低下する可能性があります。
