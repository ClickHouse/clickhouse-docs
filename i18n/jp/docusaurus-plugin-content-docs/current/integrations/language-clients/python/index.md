---
sidebar_label: Python
sidebar_position: 10
keywords: [clickhouse, python, client, connect, integrate]
slug: /integrations/python
description: ClickHouseにPythonを接続するためのClickHouse Connectプロジェクトのスイート
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# PythonとClickHouse Connectの統合
## はじめに {#introduction}

ClickHouse Connectは、幅広いPythonアプリケーションとの相互運用性を提供するコアデータベースドライバです。

- 主なインターフェースは、パッケージ `clickhouse_connect.driver` の `Client` オブジェクトです。このコアパッケージには、ClickHouseサーバーとの通信に使用されるさまざまなヘルパークラスやユーティリティ関数、および挿入と選択クエリの高度な管理のための "context" 実装が含まれています。
- `clickhouse_connect.datatypes` パッケージは、すべての非実験的なClickHouseデータ型の基本実装およびサブクラスを提供します。その主な機能は、ClickHouseデータをClickHouse "Native" バイナリ列指向フォーマットにシリアル化および逆シリアル化することです。これは、ClickHouseとクライアントアプリケーション間で最も効率的な輸送を達成するために使用されます。
- `clickhouse_connect.cdriver` パッケージのCython/Cクラスは、純粋なPythonよりも大幅に改善されたパフォーマンスを実現するために、最も一般的なシリアル化および逆シリアル化の一部を最適化しています。
- 限定的な[SQLAlchemy](https://www.sqlalchemy.org/)方言が `clickhouse_connect.cc_sqlalchemy` パッケージに存在し、これは `datatypes` および `dbi` パッケージを基にしています。この制限された実装は、クエリ/カーソル機能に焦点を当てており、一般的にSQLAlchemyのDDLおよびORM操作をサポートしていません。（SQLAlchemyはOLTPデータベース向けに設計されており、ClickHouseのOLAP志向データベースを管理するために、より専門化されたツールやフレームワークを推奨します。）
- コアドライバおよびClickHouse Connect SQLAlchemy実装は、ClickHouseをApache Supersetに接続するための推奨方法です。 `ClickHouse Connect` データベース接続、または `clickhousedb` SQLAlchemy方言接続文字列を使用してください。


このドキュメントは、ベータリリース0.8.2の時点で最新です。

:::note
公式のClickHouse Connect Pythonドライバは、ClickHouseサーバーとの通信にHTTPプロトコルを使用します。
この通信方法には、いくつかの利点（柔軟性の向上、HTTPバランサーのサポート、JDBCベースのツールとの互換性の向上など）と欠点（圧縮率とパフォーマンスのわずかな低下、一部のネイティブTCPベースのプロトコルの複雑な機能のサポートがないなど）があります。
特定のユースケースでは、ネイティブTCPベースのプロトコルを使用する[Community Python drivers](/interfaces/third-party/client-libraries.md)のいずれかを使用することを検討してもよいでしょう。
:::
### 要件と互換性 {#requirements-and-compatibility}

|    Python |   |       プラットフォーム¹ |   | ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |
|----------:|:--|----------------:|:--|-----------:|:---|------------:|:--|----------------:|:--|
| 2.x, &lt;3.8 | ❌ |     Linux (x86) | ✅ |     &lt;24.3³ | 🟡 |        &lt;1.3 | ❌ |            &lt;1.4 | ❌ |
|     3.8.x | ✅ | Linux (Aarch64) | ✅ |     24.3.x | ✅  |       1.3.x | ✅ |           1.4.x | ✅ |
|     3.9.x | ✅ |     macOS (x86) | ✅ | 24.4-24.6³ | 🟡 |       1.4.x | ✅ |           1.5.x | ✅ |
|    3.10.x | ✅ |     macOS (ARM) | ✅ |     24.7.x | ✅  |       >=2.x | ❌ |           2.0.x | ✅ |
|    3.11.x | ✅ |         Windows | ✅ |     24.8.x | ✅  |             |   |           2.1.x | ✅ |
|    3.12.x | ✅ |                 |   |     24.9.x | ✅  |             |   |           3.0.x | ✅ |


¹ClickHouse Connectは、リストされたプラットフォームに対して明示的にテストされています。さらに、素晴らしい[`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/)プロジェクトのために、すべてのアーキテクチャに対して未テストのバイナリホイール（C最適化付き）が生成されています。
最後に、ClickHouse Connectは純粋なPythonとしても動作できるため、ソースインストールは最近のPythonインストールで機能するはずです。

²再度、SQLAlchemyのサポートは主にクエリ機能に制限されています。フルSQLAlchemy APIはサポートされていません。

³ClickHouse Connectは、現在サポートされているすべてのClickHouseバージョンに対してテストされています。HTTPプロトコルを使用しているため、他のさまざまなClickHouseバージョンでも正しく動作するはずですが、特定の高度なデータ型に対しては互換性の問題があるかもしれません。
### インストール {#installation}

PyPI経由でpipを使用してClickHouse Connectをインストールします：

`pip install clickhouse-connect`

ClickHouse Connectはソースからもインストールできます：
* [GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-connect)を `git clone` します。
* （オプション）`pip install cython`を実行して、C/Cythonの最適化をビルドして有効にします。
* プロジェクトのルートディレクトリに移動し、`pip install .`を実行します。
### サポートポリシー {#support-policy}

ClickHouse Connectは現在ベータ版で、現在のベータリリースのみが積極的にサポートされています。報告する前に最新バージョンに更新してください。問題は[GitHubプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)に提出してください。ClickHouse Connectの将来のリリースは、リリース時にアクティブにサポートされているClickHouseバージョンと互換性があることが保証されています（一般的に、最新の3つの`stable`および最新の2つの`lts`リリース）。
### 基本的な使用法 {#basic-usage}
### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />
#### 接続を確立する {#establish-a-connection}

ClickHouseへの接続に関する2つの例があります：
- localhost上のClickHouseサーバーへの接続。
- ClickHouse Cloudサービスへの接続。
##### localhostのClickHouseサーバーに接続するためのClickHouse Connectクライアントインスタンスの使用: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### ClickHouse Cloudサービスに接続するためのClickHouse Connectクライアントインスタンスの使用: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
以前に収集した接続情報を使用してください。ClickHouse CloudサービスはTLSを必要とするため、ポート8443を使用してください。
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### データベースとの対話 {#interact-with-your-database}

ClickHouse SQLコマンドを実行するには、クライアントの `command` メソッドを使用します：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、2次元配列の行と値を使用してクライアントの `insert` メソッドを使用します：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQLを使用してデータを取得するには、クライアントの `query` メソッドを使用します：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse ConnectドライバAPI {#clickhouse-connect-driver-api}

***注意:*** ほとんどのAPIメソッドには、可能な引数の数が多いため、キーワード引数を渡すことをお勧めします。このうちほとんどはオプションです。

*ここに文書化されていないメソッドはAPIの一部とは見なされず、削除または変更される可能性があります。*
### クライアント初期化 {#client-initialization}

`clickhouse_connect.driver.client` クラスは、PythonアプリケーションとClickHouseデータベースサーバーとの間の主なインターフェースを提供します。 `clickhouse_connect.get_client` 関数を使用してClientインスタンスを取得し、次の引数を受け付けます：
#### 接続引数 {#connection-arguments}

| パラメーター            | 型         | デフォルト                       | 説明                                                                                                                                                                                                                                            |
|-----------------------|-------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str         | http                          | httpまたはhttpsである必要があります。                                                                                                                                                                                                                                 |
| host                  | str         | localhost                     | ClickHouseサーバーのホスト名またはIPアドレス。設定されていない場合は、`localhost`が使用されます。                                                                                                                                                            |
| port                  | int         | 8123または8443                  | ClickHouseのHTTPまたはHTTPSポート。設定されていない場合は、8123にデフォルト設定されるか、*secure*=*True*または*interface*=*https*の場合は8443にデフォルト設定されます。                                                                                                                              |
| username              | str         | default                       | ClickHouseのユーザー名。設定されていない場合、`default`のClickHouseユーザーが使用されます。                                                                                                                                                                      |
| password              | str         | *&lt;空文字列&gt;*        | *username*のパスワード。                                                                                                                                                                                                                           |
| database              | str         | *None*                        | 接続のデフォルトデータベース。設定されていない場合、ClickHouse Connectは*username*のデフォルトデータベースを使用します。                                                                                                                                  |
| secure                | bool        | False                         | https/TLSを使用します。この設定は、インターフェースまたはポート引数からの推測値をオーバーライドします。                                                                                                                                                                   |
| dsn                   | str         | *None*                        | 標準DSN（データソース名）形式の文字列。他の接続値（ホストやユーザーなど）は、この文字列から抽出されます。                                                                                                                                                           |
| compress              | boolまたはstr | True                          | ClickHouseのHTTP挿入およびクエリ結果のための圧縮を有効にします。[追加オプション（圧縮）](#compression)を参照してください。                                                                                                                                 |
| query_limit           | int         | 0（無制限）                    | `query`応答の最大行数。ゼロに設定すると無制限の行が返されます。大きなクエリ制限は、結果がストリーミングされない場合にメモリ不足の例外が発生する可能性があるため、すべての結果が一度にメモリに読み込まれます。 |
| query_retries         | int         | 2                             | `query`リクエストの最大リトライ回数。リトライ可能なHTTP応答のみがリトライされます。`command`または`insert`リクエストは、自動的にドライバによって再試行されず、意図しない重複リクエストを防ぎます。                                 |
| connect_timeout       | int         | 10                            | HTTP接続のタイムアウト（秒）。                                                                                                                                                                                                                    |
| send_receive_timeout  | int         | 300                           | HTTP接続の送信/受信タイムアウト（秒）。                                                                                                                                                                                               |
| client_name           | str         | *None*                        | HTTPユーザーエージェントヘッダーに追加されるclient_name。ClickHouseのsystem.query_logでクエリを追跡するために設定します。                                                                                                                              |
| pool_mgr              | obj         | *&lt;デフォルトプールマネージャ&gt;* | 使用する`urllib3`ライブラリのプールマネージャ。複数の接続プールを異なるホストに必要とする高度なユースケース向け。                                                                                                                             |
| http_proxy            | str         | *None*                        | HTTPプロキシアドレス（HTTP_PROXY環境変数を設定するのと同等）。                                                                                                                                                                        |
| https_proxy           | str         | *None*                        | HTTPSプロキシアドレス（HTTPS_PROXY環境変数を設定するのと同等）。                                                                                                                                                                      |
| apply_server_timezone | bool        | True                          | タイムゾーンに意識したクエリ結果にサーバーのタイムゾーンを使用します。[タイムゾーン優先度](#time-zones)を参照してください。                                                                                                                                                          |
#### HTTPS/TLS引数 {#httpstls-arguments}

| パラメーター        | 型 | デフォルト | 説明                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLSを使用している場合、ClickHouseサーバーのTLS/SSL証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True*の場合、ClickHouseサーバー証明書を検証するためのCAルートのファイルパス（.pem形式）。verifyがFalseの場合は無視されます。オペレーティングシステムによって確認されたグローバルに信頼されたルートである場合、これは必要ありません。 |
| client_cert      | str  | *None*  | 相互TLS認証用の.pem形式のTLSクライアント証明書へのファイルパス。このファイルは、すべての中間証明書を含む完全な証明書チェーンを含む必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書のプライベートキーへのファイルパス。クライアント証明書キーにプライベートキーが含まれていない場合は必要です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS証明書のCNまたはSNIによって識別されるClickHouseサーバーのホスト名。異なるホスト名を持つプロキシまたはトンネル経由で接続する際にSSLエラーを避けるために設定します。                                                                                           |
| tls_mode         | str  | *None*  | 高度なTLS動作を制御します。`proxy`および`strict`はClickHouseの相互TLS接続を発動しませんが、クライアント証明書とキーは送信されます。`mutual`はClickHouse相互TLS認証をクライアント証明書とともに仮定します。 *None*/デフォルト動作は`mutual`です。                               |
#### 設定引数 {#settings-argument}

最後に、`get_client`の `settings` 引数は、各クライアントリクエストのためにClickHouseサーバーに追加のClickHouse設定を渡すために使用されます。ほとんどの場合、*readonly*=*1*アクセスを持つユーザーはクエリとともに送信される設定を変更できないため、ClickHouse Connectは最終リクエストでそのような設定を削除し、警告をログに記録します。次の設定は、ClickHouse Connectによって使用されるHTTPクエリ/セッションにのみ適用され、一般的なClickHouse設定として文書化されていません。

| 設定           | 説明                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | HTTPチャネルに書き込む前にClickHouseサーバーによって使用されるバッファサイズ（バイト単位）。                                                                             |
| session_id        | サーバー上の関連するクエリを関連付けるための一意のセッションID。一時テーブルには必須です。                                                                   |
| compress          | ClickHouseサーバーがPOST応答データを圧縮するかどうか。この設定は「生」クエリに対してのみ使用されるべきです。                                        |
| decompress        | ClickHouseサーバーに送信されるデータを解凍する必要があるかどうか。この設定は「生」挿入に対してのみ使用されるべきです。                                          |
| quota_key         | このリクエストに関連付けられたクォータキー。クォータに関するClickHouseサーバーのドキュメントを参照してください。                                                                  |
| session_check     | セッションの状態を確認します。                                                                                                                                |
| session_timeout   | セッションIDで識別された無活動状態の秒数が経過すると、タイムアウトし無効と見なされます。デフォルトは60秒です。                  |
| wait_end_of_query | ClickHouseサーバーに対して応答全体をバッファリングします。この設定は、要約情報を返すために必要であり、非ストリーミングクエリでは自動的に設定されます。 |

各クエリとともに送信できる他のClickHouse設定については、[ClickHouseドキュメント](/operations/settings/settings.md)を参照してください。
#### クライアント作成の例 {#client-creation-examples}

- パラメーターなしで、ClickHouse Connectクライアントは`localhost`のデフォルトHTTPポートに接続し、デフォルトユーザーとパスワードなしで接続します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- 安全な（https）外部ClickHouseサーバーに接続

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- セッションIDやその他のカスタム接続パラメーターおよびClickHouse設定で接続。

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com',
                                       user='play',
                                       password='clickhouse',
                                       port=443,
                                       session_id='example_session_1',
                                       connect_timeout=15,
                                       database='github',
                                       settings={'distributed_ddl_task_timeout':300})
client.database
Out[2]: 'github'
```
### 共通メソッド引数 {#common-method-arguments}

いくつかのクライアントメソッドは、共通の `parameters` および `settings` 引数の一方または両方を使用します。これらのキーワード引数については、以下に説明します。
#### パラメーター引数 {#parameters-argument}

ClickHouse Connect Clientの `query*` および `command` メソッドは、Python式をClickHouse値式にバインドするためにオプションの `parameters` キーワード引数を受け付けます。2種類のバインディングが利用可能です。
##### サーバーサイドバインディング {#server-side-binding}

ClickHouseは、ほとんどのクエリ値に対して[サーバーサイドバインディング](/interfaces/cli.md#cli-queries-with-parameters)をサポートしており、バインドされた値はクエリとは別にHTTPクエリパラメータとして送信されます。ClickHouse Connectは、`{&lt;name&gt;:&lt;datatype&gt;}`の形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバーサイドバインディングの場合、`parameters`引数はPythonの辞書である必要があります。

- Python辞書、DateTime値、および文字列値によるサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# サーバー上で次のクエリを生成します

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- サーバーサイドバインディングは、ClickHouseサーバーで `SELECT` クエリにのみサポートされています。`ALTER`、`DELETE`、`INSERT`、またはその他のタイプのクエリでは機能しません。今後これが変更される可能性があります。詳細はhttps://github.com/ClickHouse/ClickHouse/issues/42092を参照してください。
##### クライアントサイドバインディング {#client-side-binding}

ClickHouse Connectは、テンプレート化されたSQLクエリを生成する柔軟性を高めるクライアントサイドのパラメータバインディングもサポートしています。クライアントサイドバインディングの場合、`parameters`引数は辞書またはシーケンスである必要があります。クライアントサイドバインディングは、Pythonの["printf"スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)の文字列フォーマットをパラメータの置き換えに使用します。

サーバーサイドバインディングとは異なり、クライアントサイドバインディングは、データベース識別子（データベース、テーブル、またはカラム名など）には機能しません。なぜなら、Pythonスタイルのフォーマットは異なるタイプの文字列を区別できず、それらは異なる方法でフォーマットする必要があるからです（データベース識別子にはバックティックや二重引用符、データ値には単一引用符が必要です）。

- Python辞書、DateTime値、およびエスケープされた文字列の例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# 次のクエリを生成します：

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- Pythonシーケンス（タプル）、Float64、およびIPv4Addressの例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# 次のクエリを生成します：

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''
```

:::note
DateTime64引数（サブ秒精度を持つClickHouse型）をバインドするには、2つのカスタムアプローチのいずれかを使用する必要があります：
- Pythonの`datetime.datetime`値を新しいDT64Paramクラスでラップします。例えば：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書を使ったサーバーサイドバインディング
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストを使ったクライアントサイドバインディング
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - パラメータ値の辞書を使用する場合は、パラメータ名に文字列 `_64` を追加します。
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書を使ったサーバーサイドバインディング

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::
#### 設定引数 {#settings-argument-1}

すべての主要なClickHouse Connect Clientの "insert" および "select" メソッドは、含まれるSQLステートメントに対するClickHouseサーバーの[ユーザー設定](/operations/settings/settings.md)を渡すためにオプションの `settings` キーワード引数を受け入れます。`settings` 引数は辞書である必要があります。各項目はClickHouse設定名とその関連する値であるべきです。値は、クエリパラメータとしてサーバーに送信されるときに文字列に変換されます。

クライアントレベルの設定と同様に、ClickHouse Connectはサーバーが *readonly*=*1* としてマークした設定を削除します。関連するログメッセージが表示されます。ClickHouse HTTPインターフェースを介してクエリにのみ適用される設定は常に有効です。それらの設定は、`get_client` の[API](#settings-argument)に記載されています。

ClickHouse設定の使用例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### クライアント `command` メソッド {#client-_command_-method}

クライアントの `command` メソッドを使用して、通常はデータを返さないSQLクエリや、完全なデータセットではなく単一のプリミティブまたは配列値を返すSQLクエリをClickHouseサーバーに送信します。このメソッドは次のパラメータを受け取ります：

| パラメータ     | 型             | デフォルト    | 説明                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *必須* | 単一の値または単一行の値を返すClickHouse SQLステートメント。                                                                             |                                                                                                                                                                                                                                                                              |
| parameters    | dictまたはイテラブル | *なし*     | [パラメータの説明](#parameters-argument)を参照してください。                                                                                                           |
| data          | strまたはbytes     | *なし*     | コマンドにPOSTボディとして含めるオプションデータ。                                                                                                   |
| settings      | dict             | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                                               |
| use_database  | bool             | True       | クライアントデータベース（クライアント作成時に指定）。Falseは、コマンドが接続ユーザーのデフォルトのClickHouseサーバーデータベースを使用することを意味します。 |
| external_data | ExternalData     | *なし*     | クエリで使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。  [高度なクエリ（外部データ）](#external-data)を参照してください。                          |

- `command` はDDLステートメントに使用できます。SQL "コマンド"がデータを返さない場合、"クエリ概要" 辞書が代わりに返されます。この辞書には、ClickHouse X-ClickHouse-SummaryおよびX-ClickHouse-Query-Id ヘッダーがカプセル化されており、`written_rows`、`written_bytes`、および`query_id`のキーバリューが含まれます。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- `command` は単一行のみを返す単純なクエリにも使用できます。

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### Client _query_ メソッド {#client-_query_-method}

`Client.query` メソッドは、ClickHouseサーバーから単一の「バッチ」データセットを取得するための主要な方法です。これは、HTTP経由でNative ClickHouseフォーマットを利用し、効率的に大規模データセット（約100万行まで）を送信します。このメソッドは、次のパラメータを受け取ります。

| パラメータ          | タイプ              | デフォルト    | 説明                                                                                                                                                                          |
|---------------------|--------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str                | *必須*       | ClickHouse SQL SELECT または DESCRIBE クエリ。                                                                                                                                 |
| parameters          | dict あるいは iterable | *なし*      | [パラメータの説明](#parameters-argument)を参照してください。                                                                                                                  |
| settings            | dict               | *なし*      | [設定の説明](#settings-argument)を参照してください。                                                                                                                          |
| query_formats       | dict               | *なし*      | 結果値のデータ型フォーマット仕様。詳細は「Advanced Usage (Read Formats)」を参照してください。                                                                                 |
| column_formats      | dict               | *なし*      | 列ごとのデータ型フォーマット。詳細は「Advanced Usage (Read Formats)」を参照してください。                                                                                   |
| encoding            | str                | *なし*      | ClickHouse StringカラムをPython文字列にエンコードするために使用されるエンコーディング。設定されていない場合、Pythonはデフォルトで`UTF-8`を使用します。                              |
| use_none            | bool               | True         | ClickHouseのNULLに対してPythonの*None*タイプを使用します。Falseの場合、ClickHouseのNULLに対してデータ型のデフォルト（例えば0）を使用します。ノート：パフォーマンスの理由から、NumPy/Pandasの場合はデフォルトがFalseになります。|
| column_oriented     | bool               | False        | 結果を行のシーケンスではなく、列のシーケンスとして返します。Pythonデータを他の列指向データフォーマットに変換するのに役立ちます。                                                     |
| query_tz            | str                | *なし*      | `zoneinfo` データベースからのタイムゾーン名。このタイムゾーンは、クエリによって返されたすべてのdatetimeまたはPandasのTimestampオブジェクトに適用されます。                                            |
| column_tzs          | dict               | *なし*      | 列名からタイムゾーン名への辞書。`query_tz`のように、異なるカラムに対して異なるタイムゾーンを指定できるようにします。                                                            |
| use_extended_dtypes | bool               | True         | ClickHouse NULL値に対してPandasの拡張dtypes（StringArrayなど）とpandas.NAおよびpandas.NaTを使用します。`query_df`および`query_df_stream`メソッドのみに適用されます。                           |
| external_data       | ExternalData       | *なし*      | クエリとともに使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。詳細は[Advanced Queries (External Data)](#external-data)を参照してください。                                    |
| context             | QueryContext       | *なし*      | 上記のメソッド引数をカプセル化するために使用できる再利用可能なQueryContextオブジェクト。詳細は[Advanced Queries (QueryContexts)](#querycontexts)を参照してください。                                |

#### QueryResultオブジェクト {#the-queryresult-object}

基本の`query`メソッドは、次の公開プロパティを持つQueryResultオブジェクトを返します：

- `result_rows` -- 行のシーケンスの形式で返されたデータのマトリックスで、各行要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスの形式で返されたデータのマトリックスで、各カラム要素はそのカラムの行値のシーケンスです。
- `column_names` -- `result_set`のカラム名を表す文字列のタプルです。
- `column_types` -- `result_columns`の各カラムのClickHouseデータ型を表すClickHouseTypeインスタンスのタプルです。
- `query_id` -- ClickHouseのquery_id（`system.query_log`テーブルでクエリを調査するのに便利です）。
- `summary` -- `X-ClickHouse-Summary` HTTP応答ヘッダーで返されたデータ。
- `first_item` -- 応答の最初の行を辞書として取得するための便利なプロパティ（キーはカラム名）。
- `first_row` -- 結果の最初の行を返すための便利なプロパティ。
- `column_block_stream` -- 列指向フォーマットのクエリ結果のジェネレーター。このプロパティは直接参照すべきではありません（下記参照）。
- `row_block_stream` -- 行指向フォーマットのクエリ結果のジェネレーター。このプロパティは直接参照すべきではありません（下記参照）。
- `rows_stream` -- 毎回単一の行を生成するクエリ結果のジェネレーター。このプロパティは直接参照すべきではありません（下記参照）。
- `summary` -- `command`メソッドで説明したように、ClickHouseによって返された概要情報の辞書です。

`*_stream`プロパティは、返されたデータのイテレータとして使用できるPython Contextを返します。これらは、クライアントの`*_stream`メソッドを使用して間接的にアクセスする必要があります。

クエリ結果のストリーミングの完全な詳細（StreamContextオブジェクトを使用）は、[Advanced Queries (Streaming Queries)](#streaming-queries)に説明されています。

### NumPy、Pandas、またはArrowでのクエリ結果の消費 {#consuming-query-results-with-numpy-pandas-or-arrow}

主な`query`メソッドの3つの特別なバージョンがあります：

- `query_np` -- このバージョンは、ClickHouse Connect QueryResultではなく、NumPy配列を返します。
- `query_df` -- このバージョンは、ClickHouse Connect QueryResultの代わりにPandas Dataframeを返します。
- `query_arrow` -- このバージョンは、PyArrowテーブルを返します。ClickHouse `Arrow`フォーマットを直接利用しているため、主な`query`メソッドと共通の3つの引数（`query`、`parameters` 、および`settings`）のみを受け取ります。さらに、`use_strings`という引数があり、ClickHouseのString型を文字列として表示するか（Trueの場合）、バイトとして表示するか（Falseの場合）を決定します。

### Client Streaming Query Methods {#client-streaming-query-methods}

ClickHouse Connect Clientは、ストリームとしてデータを取得するための複数のメソッドを提供します（Pythonのジェネレーターとして実装されています）：

- `query_column_block_stream` -- ネイティブPythonオブジェクトを使用して、カラムのシーケンスとしてクエリデータをブロックで返します。
- `query_row_block_stream` -- ネイティブPythonオブジェクトを使用して、行のブロックとしてクエリデータを返します。
- `query_rows_stream` -- ネイティブPythonオブジェクトを使用して、行のシーケンスとしてクエリデータを返します。
- `query_np_stream` -- 各ClickHouseブロックのクエリデータをNumPy配列として返します。
- `query_df_stream` -- 各ClickHouseブロックのクエリデータをPandas Dataframeとして返します。
- `query_arrow_stream` -- PyArrow RecordBlocksでクエリデータを返します。

これらのメソッドはすべて、ストリームを消費するために`with`文を介して開く必要がある`ContextStream`オブジェクトを返します。詳細と例については[Advanced Queries (Streaming Queries)](#streaming-queries)を参照してください。

### Client _insert_ メソッド {#client-_insert_-method}

ClickHouseに複数のレコードを挿入する一般的なユースケースには、`Client.insert`メソッドがあります。次のパラメータを受け取ります：

| パラメータ         | タイプ                                | デフォルト    | 説明                                                                                                                                                                                   |
|-------------------|-----------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *必須*       | 挿入先のClickHouseテーブル。完全なテーブル名（データベースを含む）が許可されます。                                                                                                         |
| data              | シーケンスオブシーケンス             | *必須*       | 挿入するデータのマトリックス。各行はカラム値のシーケンスであるシーケンスの行、または各カラムが行値のシーケンスであるシーケンスのカラムのいずれかです。                                    |
| column_names      | シーケンスのstr、またはstr           | '*'        | データマトリックスのカラム名のリスト。'*'を使用すると、ClickHouse Connectはテーブルのすべてのカラム名を取得する「プレクエリ」を実行します。                                         |
| database          | str                               | ''         | 挿入先のデータベース。指定されない場合、クライアントのデータベースが使用されます。                                                                                                       |
| column_types      | シーケンスのClickHouseType        | *なし*      | ClickHouseTypeインスタンスのリスト。column_typesまたはcolumn_type_namesが指定されていない場合、ClickHouse Connectはテーブルのすべてのカラム型を取得する「プレクエリ」を実行します。               |
| column_type_names | シーケンスのClickHouseデータ型名 | *なし*      | ClickHouseデータ型名のリスト。column_typesまたはcolumn_type_namesが指定されていない場合、ClickHouse Connectはテーブルのすべてのカラム型を取得する「プレクエリ」を実行します。               |
| column_oriented   | bool                              | False      | Trueの場合、`data`引数はカラムのシーケンスであると仮定され、データを挿入するために「ピボット」を必要としません。そうでない場合、`data`は行のシーケンスとして解釈されます。                |
| settings          | dict                              | *なし*      | [設定の説明](#settings-argument)を参照してください。                                                                                                                                    |
| insert_context    | InsertContext                     | *なし*      | 上記のメソッド引数をカプセル化するために使用できる再利用可能なInsertContextオブジェクト。詳細は[Advanced Inserts (InsertContexts)](#insertcontexts)を参照してください。                                |

このメソッドは、「クエリサマリー」辞書を返します。これは「command」メソッドの下で説明されています。挿入が何らかの理由で失敗した場合は、例外が発生します。

主な`insert`メソッドの2つの特別なバージョンがあります：

- `insert_df` -- Pythonのシーケンスオブシーケンス`data`引数の代わりに、このメソッドの第2パラメータにはPandas Dataframeインスタンスである`df`引数が必要です。ClickHouse ConnectはDataframeを自動的に列指向データソースとして処理するため、`column_oriented`パラメータは必要なく、利用できません。
- `insert_arrow` -- Pythonのシーケンスオブシーケンス`data`引数の代わりに、このメソッドには`arrow_table`が必要です。ClickHouse ConnectはArrowテーブルを変更せずにClickHouseサーバーに渡して処理しますので、`table`と`arrow_table`の他に`database`および`settings`引数のみが使用可能です。

*注意:* NumPy配列は有効なシーケンスオブシーケンスであり、主な`insert`メソッドに対して`data`引数として使用できますので、特別なメソッドは不要です。

### ファイル挿入 {#file-inserts}

`clickhouse_connect.driver.tools`には、ファイルシステムから既存のClickHouseテーブルにデータを直接挿入することを可能にする`insert_file`メソッドが含まれています。パースはClickHouseサーバーに委任されています。`insert_file`は次のパラメータを受け入れます：

| パラメータ    | タイプ            | デフォルト         | 説明                                                                                                                           |
|--------------|-----------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *必須*            | 挿入を行うために使用される`driver.Client`                                                                                      |
| table        | str             | *必須*            | 挿入先のClickHouseテーブル。完全なテーブル名（データベースを含む）が許可されます。                                                |
| file_path    | str             | *必須*            | データファイルへのネイティブファイルシステムパス                                                                                |
| fmt          | str             | CSV, CSVWithNames | ファイルのClickHouse入力フォーマット。`column_names`が提供されていない場合、CSVWithNamesが仮定されます。                        |
| column_names | シーケンスのstr | *なし*            | データファイル内のカラム名のリスト。カラム名を含むフォーマットの場合は必要ありません。                                          |
| database     | str             | *なし*            | テーブルのデータベース。テーブルが完全に修飾されている場合は無視されます。指定されない場合、挿入はクライアントデータベースを使用します。 |
| settings     | dict            | *なし*            | [設定の説明](#settings-argument)を参照してください。                                                                             |
| compression  | str             | *なし*            | Content-Encoding HTTPヘッダーに使用される認識されたClickHouse圧縮タイプ（zstd、lz4、gzip）                                     |

不一致なデータや異常なフォーマットの日時値のあるファイルには、データインポートに適用される設定（例えば、`input_format_allow_errors_num`や`input_format_allow_errors_num`）がこのメソッドで認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

### クエリ結果をファイルとして保存 {#saving-query-results-as-files}

`raw_stream`メソッドを使用して、ClickHouseからローカルファイルシステムにファイルを直接ストリーミングできます。例えば、クエリの結果をCSVファイルに保存したい場合、次のコードスニペットを使用できます：

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # または CSV、CSVWithNamesAndTypes、TabSeparated など。
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上記のコードは、次の内容を含む`output.csv`ファイルを生成します：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats#tabseparated)や他のフォーマットでデータを保存することもできます。すべての利用可能なフォーマットオプションの概要については、[Formats for Input and Output Data](/interfaces/formats)を参照してください。

### Raw API {#raw-api}

ClickHouseデータとネイティブまたはサードパーティのデータ型や構造の間の変換が必要ないユースケースのために、ClickHouse ConnectクライアントはClickHouse接続の直接使用のための2つのメソッドを提供します。

#### Client _raw_query_ メソッド {#client-_raw_query_-method}

`Client.raw_query`メソッドは、クライアント接続を使用してClickHouse HTTPクエリインターフェースを直接使用することを可能にします。返される値は未処理の`bytes`オブジェクトです。パラメータバインディング、エラーハンドリング、リトライ、および設定管理をミニマルなインターフェースを使用して便利にラップします：

| パラメータ     | タイプ             | デフォルト    | 説明                                                                                                                                 |
|---------------|-------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------|
| query         | str               | *必須*       | 有効な任意のClickHouseクエリ                                                                                                      |
| parameters    | dict あるいは iterable | *なし*      | [パラメータの説明](#parameters-argument)を参照してください。                                                                        |
| settings      | dict              | *なし*      | [設定の説明](#settings-argument)を参照してください。                                                                                |
| fmt           | str               | *なし*      | 結果のバイトに対するClickHouse出力フォーマット。（指定されていない場合、ClickHouseはTSVを使用します）                                     |
| use_database  | bool              | True         | クエリコンテキストに対してclickhouse-connect Clientに割り当てられたデータベースを使用します。                                        |
| external_data | ExternalData      | *なし*      | クエリに使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。詳細は[Advanced Queries (External Data)](#external-data)を参照してください。 |

結果の`bytes`オブジェクトを処理するのは呼び出し側の責任です。`Client.query_arrow`はこのメソッドの薄いラッパーであり、ClickHouseの`Arrow`出力フォーマットを使用しています。

#### Client _raw_stream_ メソッド {#client-_raw_stream_-method}

`Client.raw_stream`メソッドは、`raw_query`メソッドと同じAPIを持ちますが、`bytes`オブジェクトのストリームソース/ジェネレーターとして使用できる`io.IOBase`オブジェクトを返します。これは現在、`query_arrow_stream`メソッドによって利用されています。

#### Client _raw_insert_ メソッド {#client-_raw_insert_-method}

`Client.raw_insert`メソッドは、クライアント接続を使用して`bytes`オブジェクトまたは`bytes`オブジェクトのジェネレーターを直接挿入することを可能にします。挿入ペイロードの処理を行わないため、非常に高いパフォーマンスを提供します。このメソッドは、設定と挿入フォーマットを指定するためのオプションを提供します：

| パラメータ    | タイプ                                   | デフォルト    | 説明                                                                                                               |
|--------------|---------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------|
| table        | str                                   | *必須*       | 単純またはデータベース修飾テーブル名                                                                             |
| column_names | シーケンス[str]                     | *なし*      | 挿入ブロックのカラム名。`fmt`パラメータが名前を含まない場合は必須                                                  |
| insert_block | str、bytes、Generator[bytes]、BinaryIO | *必須*       | 挿入するデータ。文字列はクライアントエンコーディングでエンコードされます。                                        |
| settings     | dict                                   | *なし*      | [設定の説明](#settings-argument)を参照してください。                                                              |
| fmt          | str                                   | *なし*      | `insert_block`バイトのClickHouse入力フォーマット（指定されていない場合、ClickHouseはTSVを使用します）               |

`insert_block`が指定された形式であり、指定された圧縮方法を使用していることは呼び出し側の責任です。ClickHouse ConnectはファイルのアップロードやPyArrowテーブルのためにこれらの生挿入を使用し、パースをClickHouseサーバーに委ねます。

### ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスおよび関数も「公開」の`clickhouse-connect` APIの一部と見なされ、上記に文書化されたクラスやメソッドと同様に、マイナーリリース間で安定しています。これらのクラスや関数への後方互換性のない変更は、マイナー（パッチではなく）リリースによってのみ発生し、少なくとも1つのマイナーリリースの間に非推奨のステータスで利用可能になります。

#### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0仕様で定義されたものを含む）は、`clickhouse_connect.driver.exceptions`モジュールで定義されています。ドライバーによって実際に検出された例外は、これらの型の1つを使用します。

#### ClickHouse SQLユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding`モジュール内の関数とDT64Paramクラスは、ClickHouse SQLクエリを正しく構築およびエスケープするために使用できます。同様に、`clickhouse_connect.driver.parser`モジュール内の関数は、ClickHouseデータ型名を解析するために使用できます。

### マルチスレッド、マルチプロセス、および非同期/イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connectは、マルチスレッド、マルチプロセス、イベントループ駆動/非同期アプリケーションでうまく機能します。すべてのクエリおよび挿入処理は単一のスレッド内で行われるため、操作は一般にスレッドセーフです。（低レベルでの一部の操作の並列処理は、単一スレッドのパフォーマンスペナルティを克服するための将来の改善の可能性がありますが、その場合でもスレッドセーフは維持されます）。

各クエリまたは挿入は、それぞれ独自のQueryContextまたはInsertContextオブジェクト内で状態を維持します。したがって、これらのヘルパーオブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有されるべきではありません。コンテキストオブジェクトに関する追加の議論は、以下のセクションにあります。

さらに、同時に「インフライト」状態のクエリや挿入が2つ以上あるアプリケーションでは、注意すべき2つの点があります。最初は、クエリ/挿入に関連付けられたClickHouse「セッション」であり、次はClickHouse Connect Clientインスタンスによって使用されるHTTP接続プールです。

### AsyncClientラッパー {#asyncclient-wrapper}

0.7.16以降、ClickHouse Connectは通常の`Client`の非同期ラッパーを提供しています。これにより、`asyncio`環境でクライアントを使用することが可能になります。

`AsyncClient`のインスタンスを取得するには、標準の`get_client`と同じパラメータを受け入れる`get_async_client`ファクトリ関数を使用できます：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient`は、標準の`Client`と同じメソッドおよび同じパラメータを持ちますが、該当する場合はコルーチンです。内部的に、I/O操作を実行するこれらの`Client`メソッドは、[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor)呼び出しでラップされています。

マルチスレッドパフォーマンスは、I/O操作が完了するまで待機中に実行スレッドとGILが解放されるため、`AsyncClient`ラッパーを使用することで向上します。

注意: 通常の`Client`とは異なり、`AsyncClient`はデフォルトで`autogenerate_session_id`が`False`に設定されています。

また、[run_asyncの例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)も参照してください。

### ClickHouseセッションIDの管理 {#managing-clickhouse-session-ids}

各ClickHouseクエリはClickHouse「セッション」のコンテキスト内で実行されます。セッションは現在、2つの目的で使用されています：
- 複数のクエリに特定のClickHouse設定を関連付けるため（[ユーザー設定](/operations/settings/settings.md)を参照）。ClickHouseの`SET`コマンドを使用して、ユーザーセッションのスコープのための設定を変更します。
- [一時テーブル](/sql-reference/statements/create/table#temporary-tables)を追跡するため。

デフォルトでは、ClickHouse Connect Clientインスタンスで実行された各クエリは、同じセッションIDを使用してこのセッション機能を有効にします。すなわち、`SET`ステートメントおよび一時テーブル作業は単一のClickHouseクライアントを使用する場合に期待通り機能します。しかし、設計上、ClickHouseサーバーは同じセッション内で並行クエリを許可していません。結果として、並行クエリを実行するClickHouse Connectアプリケーションには2つのオプションがあります。

- 実行のための各スレッド（スレッド、プロセス、またはイベントハンドラー）に対して個別の`Client`インスタンスを作成し、それぞれが独自のセッションIDを持つ。これは一般的に最良のアプローチであり、各クライアントのセッション状態を保持します。
- 各クエリに対してユニークなセッションIDを使用します。これは、一時テーブルや共有セッション設定が必要ない場合に並行セッションの問題を回避します。（共有設定もクライアント作成時に提供できますが、これらは各リクエストとともに送信され、セッションに関連付けられません）。ユニークなsession_idは、各リクエストの`settings`辞書に追加することができるか、`autogenerate_session_id`共通設定を無効にすることができます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # これはクライアントを作成する前に常に設定する必要があります。
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

この場合、ClickHouse ConnectはセッションIDを送信せず、ClickHouseサーバーによってランダムなセッションIDが生成されます。再度、一時テーブルとセッションレベルの設定は利用できません。

### HTTP接続プールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connectは、サーバーへの基盤となるHTTP接続を処理するために`urllib3`接続プールを使用しています。デフォルトでは、すべてのクライアントインスタンスは同じ接続プールを共有しますが、これはほとんどのユースケースに対して十分です。このデフォルトプールは、アプリケーションによって使用される各ClickHouseサーバーに対して最大8つのHTTP Keep Alive接続を維持します。

大規模なマルチスレッドアプリケーションの場合、別々の接続プールが適切かもしれません。カスタマイズされた接続プールは、主要な`clickhouse_connect.get_client`関数に対して`pool_mgr`キーワード引数として提供することができます：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例から示されるように、クライアントはプールマネージャーを共有するか、各クライアントのために別のプールマネージャーを作成できます。プールマネージャーを作成する際の利用可能なオプションの詳細については、[`urllib3`ドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。

## ClickHouse Connectによるデータクエリ：高度な使用法 {#querying-data-with-clickhouse-connect--advanced-usage}

### QueryContexts {#querycontexts}

ClickHouse Connectは、QueryContext内で標準クエリを実行します。QueryContextは、ClickHouseデータベースに対するクエリを構築するために使用される主要な構造体と、結果をQueryResultまたは他の応答データ構造に処理するために使用される設定を含みます。それには、クエリそのもの、パラメータ、設定、読み取りフォーマット、および他のプロパティが含まれます。

QueryContextは、クライアントの`create_query_context`メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメータを受け取ります。このクエリコンテキストは、そのプロパティのいずれかを`query`、`query_df`、または`query_np`メソッドの引数として渡すことができます。メソッドの呼び出しに指定された追加の引数は、QueryContextのプロパティをオーバーライドします。

QueryContextの最も明確なユースケースは、異なるバインディングパラメータ値で同じクエリを送信することです。すべてのパラメータ値は、辞書を使用して`QueryContext.set_parameters`メソッドを呼び出すことで更新できます。また、任意の単一の値は、`QueryContext.set_parameter`を希望の`key`、`value`ペアで呼び出すことで更新できます。

```python
client.create_query_context(query='SELECT value1, value2 FROM data_table WHERE key = {k:Int32}',
                            parameters={'k': 2},
                            column_oriented=True)
result = client.query(context=qc)
assert result.result_set[1][0] == 'second_value2'
qc.set_parameter('k', 1)
result = test_client.query(context=qc)
assert result.result_set[1][0] == 'first_value2'
```

QueryContextsはスレッドセーフではありませんが、マルチスレッド環境でも、`QueryContext.updated_copy`メソッドを呼び出すことによってコピーを取得できます。

### ストリーミングクエリ {#streaming-queries}
#### データブロック {#data-blocks}
ClickHouse Connectは、`query`メソッドからのすべてのデータをClickHouseサーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouseとの間でカスタム「ネイティブ」形式で送信されます。「ブロック」とは、指定されたデータ型の等しい数のデータ値が含まれるカラムのバイナリデータのシーケンスです。（列指向のデータベースであるClickHouseは、このデータを類似の形式で格納します。）クエリから返されるブロックのサイズは、ユーザープロファイル、ユーザー、セッション、またはクエリの複数のレベルで設定できる2つのユーザー設定によって制御されます。それらは次のとおりです。

- [max_block_size](/operations/settings/settings.md/#setting-max_block_size) -- 行数におけるブロックのサイズの制限。デフォルトは65536。
- [preferred_block_size_bytes](/operations/settings/settings.md/#preferred-block-size-bytes) -- バイト単位でのブロックのサイズのソフト制限。デフォルトは1,000,0000。

`preferred_block_size_setting`に関係なく、各ブロックは決して`max_block_size`行を超えることはありません。クエリの種類によって、実際に返されるブロックは任意のサイズになる可能性があります。たとえば、多くのシャードをカバーする分散テーブルへのクエリは、各シャードから直接取得された小さなブロックを含む場合があります。

Clientの`query_*_stream`メソッドの1つを使用する場合、結果はブロックごとに返されます。ClickHouse Connectは、一度に1つのブロックのみをロードします。これにより、大量のデータを内蔵メモリにすべてロードすることなく処理できます。アプリケーションは、任意の数のブロックを処理する準備ができている必要があり、各ブロックの正確なサイズを制御することはできません。
#### スロープロセス用のHTTPデータバッファ {#http-data-buffer-for-slow-processing}

HTTPプロトコルの制限のため、データがClickHouseサーバーからストリーミングされる速度よりもかなり遅い速度でブロックが処理されると、ClickHouseサーバーは接続を閉じるため、処理スレッド内で例外がスローされます。この一部は、一般的な`http_buffer_size`設定を使用してHTTPストリーミングバッファのバッファサイズを増やすことで軽減できます（デフォルトは10メガバイト）。 大きな`http_buffer_size`の値は、アプリケーションに十分なメモリが利用可能な場合にこの状況で問題ありません。バッファ内のデータは、`lz4`または`zstd`圧縮を使用して圧縮されている場合、圧縮された状態で保存されるため、これらの圧縮タイプを使用すると、全体的なバッファが増加します。
#### ストリームコンテキスト {#streamcontexts}

`query_*_stream`メソッド（たとえば、`query_row_block_stream`）は、ClickHouseの`StreamContext`オブジェクトを返します。これは、結合されたPythonコンテキスト/ジェネレーターです。基本的な使用法は次のとおりです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <各Pythonトリップデータの行に対して何らかの処理を行う>
```

`with`ステートメントなしでStreamContextを使用しようとすると、エラーが発生します。Pythonコンテキストの使用は、すべてのデータが消費されていなくても、または処理中に例外がスローされても、ストリーム（この場合はストリーミングHTTPレスポンス）が正しく閉じられることを保証します。また、StreamContextsはストリームを消費するために一度だけ使用できます。それが終了した後にStreamContextを使用しようとすると、`StreamClosedError`が発生します。

StreamContextの`source`プロパティを使用して、カラム名と型を含む親`QueryResult`オブジェクトにアクセスできます。
#### ストリームタイプ {#stream-types}

`query_column_block_stream`メソッドは、ブロックをネイティブPythonデータ型として格納されたカラムデータのシーケンスとして返します。上記の`taxi_trips`クエリを使用すると、返されるデータはリストであり、リストの各要素は関連するカラムのすべてのデータを含む別のリスト（またはタプル）です。したがって、`block[0]`は何も文字列だけを含むタプルになります。カラム指向のフォーマットは、カラム内のすべての値に対して集計操作を行うために最も一般的に使用されます。たとえば、合計運賃を足すことがそうです。

`query_row_block_stream`メソッドは、ブロックを従来のリレーショナルデータベースのように行のシーケンスとして返します。タクシーの旅行の場合、返されるデータはリストで、リストの各要素はデータの行を表す別のリストです。したがって、`block[0]`には最初のタクシー旅行のすべてのフィールド（順番通り）が含まれ、`block[1]`には2番目のタクシー旅行のすべてのフィールドが含まれ、以下同様になります。行指向の結果は通常、表示または変換処理で使用されます。

`query_row_stream`は、ストリームを反復処理するときに自動的に次のブロックに移動する便利なメソッドです。それ以外の場合、`query_row_block_stream`と同じです。

`query_np_stream`メソッドは、各ブロックを2次元NumPy配列として返します。内部的にNumPy配列は（通常）カラムとして格納されるため、特別な行またはカラムメソッドが必要ありません。NumPy配列の「形状」は（カラム、行）として表現されます。NumPyライブラリは、NumPy配列を操作するための多くのメソッドを提供します。すべてのクエリのカラムが同じNumPy dtypeを共有している場合、返されるNumPy配列もdtypeは1つだけになります。また、内部構造を実際に変更することなく、再形成/回転が可能です。

`query_df_stream`メソッドは、各ClickHouseブロックを2次元Pandasデータフレームとして返します。以下の例は、StreamContextオブジェクトを遅延方式でコンテキストとして使用できることを示しています（ただし、一度のみ）。

最後に、`query_arrow_stream`メソッドは、ClickHouse `ArrowStream`形式の結果をpyarrow.ipc.RecordBatchStreamReaderとして返します。ストリームの各反復は、PyArrow RecordBlockを返します。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <pandas DataFrameに対して何らかの処理を行う>
```
### 読み取りフォーマット {#read-formats}

読み取りフォーマットは、クライアント`query`、`query_np`、および`query_df`メソッドから返される値のデータ型を制御します。（`raw_query`および`query_arrow`はClickHouseから受信するデータを変更しないため、フォーマット制御は適用されません。）たとえば、UUIDの読み取りフォーマットをデフォルトの`native`形式から代わりに`string`形式に変更すると、ClickHouseの`UUID`カラムのクエリが、PythonのUUIDオブジェクトの代わりに文字列値として返されます。

任意のフォーマット関数の「データ型」引数には、ワイルドカードを含めることができます。フォーマットは1つの小文字の文字列です。

読み取りフォーマットは、複数のレベルで設定できます：

- グローバルに、`clickhouse_connect.datatypes.format`パッケージで定義されたメソッドを使用して。これにより、すべてのクエリに対して構成されたデータ型のフォーマットを制御できます。
```python
from clickhouse_connect.datatypes.format import set_read_format


# IPv6およびIPv4の両方の値を文字列として返す
set_read_format('IPv*', 'string')


# すべての日付タイプを基になるエポック秒またはエポック日の形式で返す
set_read_format('Date*', 'int')
```
- クエリ全体に対して、オプションの`query_formats`辞書引数を使用。そうした場合、指定されたデータ型の任意のカラム（またはサブカラム）は、構成されたフォーマットを使用します。
```python

# 任意のUUIDカラムを文字列として返す
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 特定のカラムの値に対して、オプションの`column_formats`辞書引数を使用。キーはClickHouseによって返されたカラム名であり、データカラムやClickHouseタイプ名とクエリフォーマット値の第二レベル「フォーマット」辞書のフォーマットです。この二次辞書は、タプルやマップなどのネストされたカラムタイプに使用できます。
```python

# `dev_address`カラム内のIPv6値を文字列として返す
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### 読み取りフォーマットオプション（Python型） {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type    | Read Formats | Comments                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | Supersetは現在、大きな非負のUInt64値を処理できません                                                   |
| [U]Int[128,256]       | int                   | string       | PandasおよびNumPyのint値は64ビットの最大値であるため、これらは文字列として返されることができます                              |
| Float32               | float                 | -            | すべてのPython floatは内部的に64ビットです                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | bytes        | ClickHouseのStringカラムには固有のエンコーディングがないため、可変長バイナリデータにも使用されます        |
| FixedString           | bytes                 | string       | FixedStringsは固定サイズのバイト配列ですが、時々Pythonの文字列として扱われます                              |
| Enum[8,16]            | string                | string, int  | Python enumsは空の文字列を受け付けないため、すべてのenumsは文字列または基盤となるint値として蓄積されます。 |
| Date                  | datetime.date         | int          | ClickHouseは日付を1970年1月1日からの日数として保存します。この値はintとして利用できます                              |
| Date32                | datetime.date         | int          | Dateと同じですが、より広い日付範囲に対応しています                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouseはDateTimeをエポック秒で保存します。この値はintとして利用できます                                   |
| DateTime64            | datetime.datetime     | int          | Pythonのdatetime.datetimeはマイクロ秒の精度に制限されます。生の64ビットint値が利用可能です               |
| IPv4                  | `ipaddress.IPv4Address` | string       | IPアドレスは文字列として読み取ることができ、正しい形式の文字列はIPアドレスとして挿入できます                |
| IPv6                  | `ipaddress.IPv6Address` | string       | IPアドレスは文字列として読み取ることができ、正しい形式でIPアドレスとして挿入できます                        |
| Tuple                 | dict or tuple         | tuple, json  | 名前付きタプルはデフォルトで辞書として返されます。名前付きタプルはJSON文字列としても返すことができます              |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUIDはRFC 4122に従ってフォーマットされた文字列として読み取ることができます<br/>                                                       |
| JSON                  | dict                  | string       | デフォルトでPythonの辞書が返されます。`string`フォーマットはJSON文字列を返します                        |
| Variant               | object                | -            | 値のために格納されたClickHouseデータ型に対してマッチするPython型が返されます                                 |
| Dynamic               | object                | -            | 値のために格納されたClickHouseデータ型に対してマッチするPython型が返されます                                 |
### 外部データ {#external-data}

ClickHouseクエリは、任意のClickHouse形式の外部データを受け入れることができます。このバイナリデータは、データ処理に使用されるクエリ文字列とともに送信されます。外部データ機能の詳細は[こちら](/engines/table-engines/special/external-data.md)にあります。クライアント`query*`メソッドは、この機能を活用するためにオプションの`external_data`パラメータを受け入れます。`external_data`パラメータの値は、`clickhouse_connect.driver.external.ExternalData`オブジェクトである必要があります。このオブジェクトのコンストラクターは、次の引数を受け入れます。

| 名前      | 型              | 説明                                                                                                                                     |
|-----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | 外部データを読み取るためのローカルシステムパス上のファイルのパス。 `file_path`または`data`のいずれかが必要です                               |
| file_name | str               | 外部データ「ファイル」の名前。提供されていない場合は、`file_path`から（拡張子なしで）決定されます。                            |
| data      | bytes             | 外部データをバイナリ形式で（ファイルからではなく）読み取るためのもの。`data`または`file_path`のいずれかが必要です                                 |
| fmt       | str               | データのClickHouse [入力フォーマット](/sql-reference/formats.mdx)。デフォルトは`TSV`です                                               |
| types     | str or seq of str | 外部データのカラムデータ型のリスト。文字列の場合、型はカンマで区切って提供する必要があります。`types`または`structure`のいずれかが必要です |
| structure | str or seq of str | データ内のカラム名 + データ型のリスト（例を参照）。`structure`または`types`のいずれかが必要です                                        |
| mime_type | str               | ファイルデータのオプションのMIMEタイプ。現在ClickHouseはこのHTTPサブヘッダーを無視します                                                          |

外部CSVファイルに「映画」データを含むクエリを送信し、そのデータをClickHouseサーバー上にすでに存在する`directors`テーブルと組み合わせる場合：

```python
import clickhouse_connect
from clickhouse_connect.driver.external import ExternalData

client = clickhouse_connect.get_client()
ext_data = ExternalData(file_path='/data/movies.csv',
                        fmt='CSV',
                        structure=['movie String', 'year UInt16', 'rating Decimal32(3)', 'director String'])
result = client.query('SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY directors.name',
                      external_data=ext_data).result_rows
```

追加の外部データファイルは、コンストラクターと同じパラメータを取る`add_file`メソッドを使用して最初のExternalDataオブジェクトに追加できます。HTTPでは、すべての外部データは`multi-part/form-data`ファイルアップロードの一部として送信されます。
### タイムゾーン {#time-zones}
ClickHouseのDateTimeおよびDateTime64値にタイムゾーンを適用するためのメカニズムはいくつかあります。内部的に、ClickHouseサーバーは、エポック以来の秒を表すタイムゾーン非依存の数値として任意のDateTimeまたはDateTime64オブジェクトを常に保存します。1970年1月1日00:00:00 UTCの時間。DateTime64値の場合、表現は精度に応じてエポック以来のミリ秒、マイクロ秒、またはナノ秒になります。その結果、タイムゾーンの情報の適用は常にクライアント側で発生します。注意すべきは、これは意味のある追加の計算を伴うため、パフォーマンスクリティカルなアプリケーションでは、ユーザーの表示や変換（たとえば、Pandas Timestampsは常にエポックのナノ秒を表す64ビット整数であるため）を除いて、DateTime型をエポックタイムスタンプとして扱うことをお勧めします。

クエリ内でタイムゾーンを意識したデータ型を使用する場合、特にPythonの`datetime.datetime`オブジェクトの場合、`clickhouse-connect`は次の優先順位規則を使用してクライアント側のタイムゾーンを適用します：

1. クエリ用の`client_tzs`パラメータがクエリに指定されている場合、特定のカラムタイムゾーンが適用されます。
2. ClickHouseカラムにタイムゾーンメタデータがある場合（つまり、DateTime64(3, 'America/Denver')のような型）、ClickHouseカラムのタイムゾーンが適用されます。（このタイムゾーンのメタデータは、ClickHouse 23.2バージョン以前のDateTimeカラムに対して、clickhouse-connectでは利用できません。）
3. クエリ用の`query_tz`パラメータがクエリに指定されている場合、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションにタイムゾーン設定が適用されると、そのタイムゾーンが適用されます。（この機能はまだClickHouseサーバーでリリースされていません）
5. 最後に、クライアントの`apply_server_timezone`パラメータがTrue（デフォルト）に設定されている場合、ClickHouseサーバーのタイムゾーンが適用されます。

これらのルールに基づいて適用されたタイムゾーンがUTCの場合、`clickhouse-connect`は常にタイムゾーンに依存しないPythonの`datetime.datetime`オブジェクトを返します。必要に応じて、アプリケーションコードによってこのタイムゾーンに依存しないオブジェクトに追加のタイムゾーン情報が追加できます。
## ClickHouse Connectを使用したデータの挿入： 高度な使用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connectは、すべての挿入をInsertContext内で実行します。InsertContextには、クライアント`insert`メソッドに引数として送信されたすべての値が含まれます。さらに、InsertContextが最初に構築されるとき、ClickHouse Connectは効率的なネイティブ形式の挿入に必要な挿入カラムのデータ型を取得します。InsertContextを複数の挿入に再利用することにより、この「前クエリ」を回避し、挿入はより迅速かつ効率的に実行されます。

InsertContextは、クライアントの`create_insert_context`メソッドを使用して取得できます。このメソッドは`insert`関数と同じ引数を取ります。再利用のために変更すべきなのは、InsertContextsの`data`プロパティのみであることに注意してください。これは、同じテーブルに新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供することを意図した目的と一致しています。

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data='test_data')
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

InsertContextsには挿入プロセス中に更新される可変状態が含まれているため、スレッドセーフではありません。
### 書き込みフォーマット {#write-formats}
書き込みフォーマットは、現在限られた数の型で実装されています。ほとんどの場合、ClickHouse Connectは最初の（非nullの）データ値の型を確認してカラムに対して正しい書き込みフォーマットを自動的に判断しようとします。たとえば、DateTimeカラムに挿入する場合、カラムの最初の挿入値がPythonの整数であると、ClickHouse Connectはその整数値が実際にはエポック秒であると見なして直接整数値を挿入します。

通常、データタイプの書き込みフォーマットをオーバーライドする必要はありませんが、`clickhouse_connect.datatypes.format`パッケージの関連メソッドを使用してグローバルレベルで行うことができます。
#### 書き込みフォーマットオプション {#write-format-options}

| ClickHouse Type       | Native Python Type    | Write Formats | Comments                                                                                                    |
|-----------------------|-----------------------|---------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                             |
| UInt64                | int                   |               |                                                                                                             |
| [U]Int[128,256]       | int                   |               |                                                                                                             |
| Float32               | float                 |               |                                                                                                             |
| Float64               | float                 |               |                                                                                                             |
| Decimal               | decimal.Decimal       |               |                                                                                                             |
| String                | string                |               |                                                                                                             |
| FixedString           | bytes                 | string        | 文字列として挿入された場合、追加のバイトはゼロに設定されます                                              |
| Enum[8,16]            | string                |               |                                                                                                             |
| Date                  | datetime.date         | int           | ClickHouseでは日付を1970年01月01日からの日数として保存します。intタイプはこの「エポック日」値であると想定されます  |
| Date32                | datetime.date         | int           | Dateと同じですが、より広い日付範囲に対応しています                                                                |
| DateTime              | datetime.datetime     | int           | ClickHouseはDateTimeをエポック秒で保存します。intタイプはこの「エポック秒」値であると想定されます     |
| DateTime64            | datetime.datetime     | int           | Pythonのdatetime.datetimeはマイクロ秒の精度に制限されています。生の64ビットint値が利用可能です         |
| IPv4                  | `ipaddress.IPv4Address` | string        | 適切にフォーマットされた文字列はIPv4アドレスとして挿入できます                                                |
| IPv6                  | `ipaddress.IPv6Address` | string        | 適切にフォーマットされた文字列はIPv6アドレスとして挿入できます                                                |
| Tuple                 | dict or tuple         |               |                                                                                                             |
| Map                   | dict                  |               |                                                                                                             |
| Nested                | Sequence[dict]        |               |                                                                                                             |
| UUID                  | uuid.UUID             | string        | 適切にフォーマットされた文字列はClickHouse UUIDとして挿入できます                                                |
| JSON/Object('json')   | dict                  | string        | 辞書やJSON文字列はJSONカラムに挿入できます（`Object('json')`は非推奨です） |
| Variant               | object                |               | 現在、すべてのvariantは文字列として挿入され、ClickHouseサーバーによって解析されます                    |
| Dynamic               | object                |               | 警告 -- 現在、動的カラムへの挿入はすべてClickHouseの文字列として永続化されます              |
## 追加オプション {#additional-options}

ClickHouse Connectは、高度なユースケースのためにいくつかの追加オプションを提供します。
### グローバル設定 {#global-settings}

ClickHouse Connectの動作をグローバルに制御する設定は少数しかありません。それらは、最上位の`common`パッケージからアクセスされます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの一般設定`autogenerate_session_id`、`product_name`、および`readonly`は、`clickhouse_connect.get_client`メソッドでクライアントを作成する前に_常に_変更されるべきです。クライアント作成後にこれらの設定を変更しても、既存のクライアントの動作には影響しません。
:::

現在、10のグローバル設定が定義されています：

| 設定名                   | デフォルト | オプション               | 説明                                                                                                                                                                                                                                                   |
|-------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | 各クライアントセッションに新しいUUID(1)セッションID（提供されていない場合）を自動生成します。クライアントまたはクエリレベルでセッションIDが提供されていない場合、ClickHouseは各クエリにランダムな内部IDを生成します                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 無効または読み取り専用の設定が提供された場合（クライアントセッションまたはクエリのいずれかに対して）のアクション。`drop`の場合、その設定は無視され、`send`の場合、設定がClickHouseに送信され、`error`の場合、クライアント側のProgrammingErrorが発生します |
| dict_parameter_format   | 'json'  | 'json', 'map'           | パラメータ化されたクエリがPython辞書をJSONまたはClickHouseマップ構文に変換するかどうかを制御します。`json`はJSONカラムへの挿入のために使用され、`map`はClickHouseのマップカラムのために使用されます                                                               |
| product_name            |         |                         | ClickHouseに渡されるクエリにアプリのトラッキングのために使用される文字列。形式は&lt;プロダクト名;&gl/&lt;プロダクトバージョン&gt;                                                                                       |
| max_connection_age      | 600     |                         | HTTPのKeep Alive接続がオープン/再利用される最大秒数。この設定により、ロードバランサー/プロキシの背後にある単一のClickHouseノードに対して接続が集中するのを防ぎます。デフォルトは10分です。                                                   |
| readonly                | 0       | 0, 1                    | 19.17未満のバージョンのClickHouseに対する暗黙の「読み取り専用」設定。非常に古いClickHouseバージョンでの操作を許可するために、ClickHouseの「読み取り専用」値に合わせて設定できます                                                                 |
| use_protocol_version    | True    | True, False             | クライアントプロトコルバージョンを使用します。これは日付時刻のタイムゾーンカラムに必要ですが、現在のchproxyのバージョンでは壊れます                                                                                                                                  |
| max_error_size          | 1024    |                         | クライアントエラーメッセージで返される最大文字数。0に設定すると、完全なClickHouseエラーメッセージが得られます。デフォルトは1024文字です。                                                                                  |
| send_os_user            | True    | True, False             | ClickHouseに送信されるクライアント情報に検出されたオペレーティングシステムユーザーを含めます（HTTP User-Agent文字列）                                                                                                                                                  |
| http_buffer_size        | 10MB    |                         | HTTPストリーミングクエリに使用される「インメモリ」バッファのサイズ（バイト単位）                                                                                                                                                                                     |
### 圧縮 {#compression}

ClickHouse Connectは、クエリ結果と挿入の両方に対して lz4、zstd、brotli、および gzip 圧縮をサポートしています。圧縮を使用することは通常、ネットワーク帯域幅/転送速度と CPU 使用率（クライアントとサーバーの両方）との間のトレードオフを伴うことを常に念頭に置いてください。

圧縮データを受信するには、ClickHouse サーバーの `enable_http_compression` を 1 に設定する必要があります。または、ユーザーは "per query" ベースで設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client` ファクトリーメソッドを呼び出す際に `compress` パラメータによって制御されます。デフォルトでは、`compress` は `True` に設定されており、デフォルトの圧縮設定がトリガーされます。`query`、`query_np`、および `query_df` クライアントメソッドを使用して実行したクエリに対して、ClickHouse Connect は `Accept-Encoding` ヘッダーに `lz4`、`zstd`、`br`（brotli ライブラリがインストールされている場合）、`gzip`、および `deflate` エンコーディングを追加します。最も多くのリクエストに対して、ClickHouse サーバーは `zstd` 圧縮ペイロードで返します。挿入に関しては、デフォルトで ClickHouse Connect は `lz4` 圧縮で挿入ブロックを圧縮し、`Content-Encoding: lz4` HTTP ヘッダーを送信します。

`get_client` の `compress` パラメータは、`lz4`、`zstd`、`br`、または `gzip` の具体的な圧縮方法に設定することもできます。その方法は、挿入とクエリ結果の両方（ClickHouse サーバーでサポートされている場合）に使用されます。必要な `zstd` および `lz4` 圧縮ライブラリは、ClickHouse Connect にデフォルトでインストールされています。`br`/brotli が指定された場合、brotli ライブラリは別途インストールする必要があります。

`raw*` クライアントメソッドは、クライアント設定で指定された圧縮を使用しないことに注意してください。

また、データを圧縮および解凍するために、`gzip` 圧縮の使用は推奨しません。これは、他の代替手段よりも大幅に遅いためです。

### HTTP プロキシサポート {#http-proxy-support}

ClickHouse Connect は、`urllib3` ライブラリを使用して基本的な HTTP プロキシサポートを追加します。標準の `HTTP_PROXY` および `HTTPS_PROXY` 環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client` メソッドで作成されたすべてのクライアントに適用されることに注意してください。代わりに、クライアントごとに構成するには、`get_client` メソッドの `http_proxy` または `https_proxy` 引数を使用できます。HTTP プロキシサポートの実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) ドキュメントを参照してください。

Socks プロキシを使用するには、`urllib3` SOCKSProxyManager を `get_client` の `pool_mgr` 引数として送信します。これには、PySocks ライブラリを直接インストールするか、`urllib3` 依存項目の `[socks]` オプションを使用する必要があることに注意してください。

### "古い" JSON データ型 {#old-json-data-type}

実験的な `Object` （または `Object('json')`）データ型は非推奨であり、運用環境では避けるべきです。ClickHouse Connect は、後方互換性のためにこのデータ型に対する限られたサポートを引き続き提供します。このサポートには、辞書またはその同等の形式として "トップレベル" または "親" JSON 値を返すことが期待されるクエリは含まれておらず、そのようなクエリは例外が発生します。

### "新しい" Variant/Dynamic/JSON データ型（実験的機能） {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0 リリースから、`clickhouse-connect` は新しい（またも実験的な）ClickHouse タイプ Variant、Dynamic、JSON に対する実験的なサポートを提供します。

#### 使用ノート {#usage-notes}
- JSON データは、Python 辞書または JSON オブジェクト `{}` を含む JSON 文字列として挿入できます。その他の形式の JSON データはサポートされていません。
- これらの型のサブカラム/パスを使用したクエリは、サブカラムの型を返します。
- 他の使用ノートについては、メインの ClickHouse ドキュメントを参照してください。

#### 既知の制限事項: {#known-limitations}
- これらの各型は使用前に ClickHouse 設定で有効にする必要があります。
- "新しい" JSON 型は ClickHouse 24.8 リリースから利用可能です。
- 内部フォーマットの変更により、`clickhouse-connect` は ClickHouse 24.7 リリース以降の Variant 型とのみ互換性があります。
- 返された JSON オブジェクトは、`max_dynamic_paths` の要素数（デフォルトは 1024）のみを返します。これは将来のリリースで修正される予定です。
- `Dynamic` カラムへの挿入は常に Python 値の文字列表現になります。これは将来のリリースで修正される予定で、https://github.com/ClickHouse/ClickHouse/issues/70395 が修正され次第対応します。
- 新しい型の実装は C コードで最適化されていないため、既存の単純なデータ型と比較してパフォーマンスが少し遅くなる可能性があります。
