---
'sidebar_label': 'Python'
'sidebar_position': 10
'keywords':
- 'clickhouse'
- 'python'
- 'client'
- 'connect'
- 'integrate'
'slug': '/integrations/python'
'description': 'PythonをClickHouseに接続するためのClickHouse Connectプロジェクトスイート'
'title': 'PythonとClickHouse Connectの統合'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Python Integration with ClickHouse Connect
## Introduction {#introduction}

ClickHouse Connect は、さまざまな Python アプリケーションとの相互運用性を提供するコアデータベースドライバです。

- 主なインターフェースは、パッケージ `clickhouse_connect.driver` にある `Client` オブジェクトです。このコアパッケージには、ClickHouse サーバーとの通信に使用される各種ヘルパークラスとユーティリティ関数、および挿入と選択クエリの高度な管理のための "context" 実装が含まれています。
- `clickhouse_connect.datatypes` パッケージは、すべての非実験的 ClickHouse データ型のベース実装およびサブクラスを提供します。その主な機能は、ClickHouse データを ClickHouse "Native" バイナリ列指向フォーマットにシリアライズおよびデシリアライズすることで、ClickHouse とクライアントアプリケーション間での最も効率的な輸送を実現します。
- `clickhouse_connect.cdriver` パッケージの Cython/C クラスは、いくつかの一般的なシリアル化およびデシリアライズを最適化し、純粋な Python よりも大幅にパフォーマンスを向上させます。
- パッケージ `clickhouse_connect.cc_sqlalchemy` には、`datatypes` および `dbi` パッケージから構築された限定された [SQLAlchemy](https://www.sqlalchemy.org/) ダイアレクトがあります。この制限された実装は、クエリ/カーソル機能に焦点を当てており、一般的には SQLAlchemy の DDL および ORM 操作をサポートしていません。（SQLAlchemy は OLTP データベースを対象としており、ClickHouse の OLAP 指向データベースを管理するには、より専門的なツールやフレームワークを推奨します。）
- コアドライバと ClickHouse Connect SQLAlchemy 実装は、ClickHouse を Apache Superset に接続するための推奨方法です。`ClickHouse Connect` データベース接続、または `clickhousedb` SQLAlchemy ダイアレクト接続文字列を使用してください。

このドキュメンテーションは、ベータリリース 0.8.2 の時点での最新情報です。

:::note
公式の ClickHouse Connect Python ドライバは、ClickHouse サーバーとの通信に HTTP プロトコルを使用します。これは、柔軟性が高く、HTTP バランサーのサポート、JDBC ベースのツールとの互換性が向上するなどの利点がありますが、圧縮およびパフォーマンスがわずかに低下するという欠点（およびネイティブの TCP ベースプロトコルの一部の複雑な機能のサポート不足）があります。特定のユースケースでは、ネイティブの TCP ベースのプロトコルを使用する [Community Python drivers](/interfaces/third-party/client-libraries.md) を使用することを検討してください。
:::
### Requirements and compatibility {#requirements-and-compatibility}

|    Python |   |       Platform¹ |   | ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |
|----------:|:--|----------------:|:--|-----------:|:---|------------:|:--|----------------:|:--|
| 2.x, &lt;3.8 | ❌ |     Linux (x86) | ✅ |     &lt;24.3³ | 🟡 |        &lt;1.3 | ❌ |            &lt;1.4 | ❌ |
|     3.8.x | ✅ | Linux (Aarch64) | ✅ |     24.3.x | ✅  |       1.3.x | ✅ |           1.4.x | ✅ |
|     3.9.x | ✅ |     macOS (x86) | ✅ | 24.4-24.6³ | 🟡 |       1.4.x | ✅ |           1.5.x | ✅ |
|    3.10.x | ✅ |     macOS (ARM) | ✅ |     24.7.x | ✅  |       >=2.x | ❌ |           2.0.x | ✅ |
|    3.11.x | ✅ |         Windows | ✅ |     24.8.x | ✅  |             |   |           2.1.x | ✅ |
|    3.12.x | ✅ |                 |   |     24.9.x | ✅  |             |   |           3.0.x | ✅ |

¹ClickHouse Connect は、リストされているプラットフォームに対して明示的にテストされています。さらに、優れた [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) プロジェクトのために、すべてのアーキテクチャに対して未テストのバイナリホイール（C 最適化付き）がビルドされています。最後に、ClickHouse Connect は純粋な Python としても動作できるため、ソースインストールは最近の Python インストールで動作するはずです。

²再度、SQLAlchemy サポートは主にクエリ機能に制限されています。完全な SQLAlchemy API はサポートされていません。

³ClickHouse Connect は現在サポートされているすべての ClickHouse バージョンに対してテストされています。HTTP プロトコルを使用しているため、ClickHouse の他のバージョンでも正しく動作するはずですが、特定の高度なデータ型において一部の不整合があるかもしれません。
### Installation {#installation}

ClickHouse Connect を PyPI から pip 経由でインストールします：

`pip install clickhouse-connect`

ClickHouse Connect はソースからもインストールできます：
* [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-connect) を `git clone` します。
* （オプション）`pip install cython` を実行して、C/Cython 最適化をビルドおよび有効にします。
* プロジェクトのルートディレクトリに `cd` し、`pip install .` を実行します。
### Support policy {#support-policy}

ClickHouse Connect は現在ベータ版であり、現在のベータリリースのみが積極的にサポートされています。問題を報告する前に最新バージョンにアップデートしてください。問題は [GitHub プロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues) に提出してください。将来の ClickHouse Connect のリリースは、リリース時点で現在アクティブにサポートされている ClickHouse バージョンと互換性があることが保証されています（一般的に、最新の 3 つの `stable` と 2 つの最新の `lts` リリース）。
### Basic usage {#basic-usage}
### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />
#### Establish a connection {#establish-a-connection}

ClickHouse への接続方法には二つの例があります：
- ローカルホストの ClickHouse サーバーへの接続。
- ClickHouse Cloud サービスへの接続。
##### Use a ClickHouse Connect client instance to connect to a ClickHouse server on localhost: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### Use a ClickHouse Connect client instance to connect to a ClickHouse Cloud service: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
前に集めた接続詳細を使用してください。 ClickHouse Cloud サービスには TLS が必要なので、ポート 8443 を使用してください。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### Interact with your database {#interact-with-your-database}

ClickHouse SQL コマンドを実行するには、クライアントの `command` メソッドを使用します：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、行と値の二次元配列を使用してクライアントの `insert` メソッドを使用します：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQL を使用してデータを取得するには、クライアントの `query` メソッドを使用します：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse Connect driver API {#clickhouse-connect-driver-api}

***Note:*** 引数の数が多く（ほとんどはオプションです）大部分の API メソッドにはキーワード引数を渡すことを推奨します。

*ここにドキュメント化されていないメソッドは API の一部とは見なされず、削除または変更される可能性があります。*
### Client Initialization {#client-initialization}

`clickhouse_connect.driver.client` クラスは、Python アプリケーションと ClickHouse データベースサーバーとの間の主要なインターフェースを提供します。 `clickhouse_connect.get_client` 関数を使用して Client インスタンスを取得します。このインスタンスは以下の引数を受け入れます：
#### Connection arguments {#connection-arguments}

| パラメータ                     | タイプ        | デフォルト                       | 説明                                                                                                                                                                                                                                                                                        |
|-------------------------------|-------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                     | str         | http                          | http または https でなければなりません。                                                                                                                                                                                                                                                       |
| host                          | str         | localhost                     | ClickHouse サーバーのホスト名または IP アドレス。設定しなければ、`localhost` が使用されます。                                                                                                                                                                                                |
| port                          | int         | 8123 または 8443                  | ClickHouse HTTP または HTTPS ポート。設定しなければ、デフォルトで 8123 または、*secure*=*True* または *interface*=*https* であれば 8443 が使用されます。                                                                                                                                        |
| username                      | str         | default                       | ClickHouse ユーザー名。設定しなければ、`default` の ClickHouse ユーザーが使用されます。                                                                                                                                                                                                         |
| password                      | str         | *&lt;empty string&gt;*        | *username* のためのパスワード。                                                                                                                                                                                                                                                                      |
| database                      | str         | *None*                        | 接続に対するデフォルトのデータベース。設定しなければ、ClickHouse Connect は *username* のためのデフォルトデータベースを使用します。                                                                                                                                                                   |
| secure                        | bool        | False                         | https/TLS を使用します。この場合、インターフェースまたはポート引数から推測された値が上書きされます。                                                                                                                                                                                                        |
| dsn                           | str         | *None*                        | 標準の DSN（データソース名）フォーマットの文字列。他の接続値（ホストやユーザーなど）は、設定されていない場合はこの文字列から抽出されます。                                                                                                                                               |
| compress                      | bool or str | True                          | ClickHouse HTTP 挿入およびクエリ結果の圧縮を有効にします。 [追加オプション (圧縮)](#compression) を参照してください。                                                                                                                                                                               |
| query_limit                   | int         | 0 (無制限)                     | 任意の `query` 応答に対して返される最大行数。この値をゼロに設定すると、無制限の行が返されます。大量のクエリ制限は、結果がストリーミングされない場合、メモリオーバーの例外の原因となることがあります。すべての結果が一度にメモリに読み込まれます。                       |
| query_retries                 | int         | 2                             | `query` リクエストに対する最大リトライ数。リトライ可能な HTTP 応答のみが再試行されます。`command` または `insert` リクエストは、意図しない重複リクエストを防ぐために自動的にはリトライされません。                                                                                         |
| connect_timeout               | int         | 10                            | 秒単位での HTTP 接続タイムアウト。                                                                                                                                                                                                                                                                         |
| send_receive_timeout          | int         | 300                           | 秒単位の HTTP 接続の送受信タイムアウト。                                                                                                                                                                                                                                                                  |
| client_name                   | str         | *None*                        | HTTP ユーザーエージェントヘッダーに追加される client_name。これを設定することで、ClickHouse の system.query_log でクライアントクエリを追跡できます。                                                                                                                                  |
| pool_mgr                      | obj         | *&lt;default PoolManager&gt;* | 使用する `urllib3` ライブラリの PoolManager。異なるホストへの複数の接続プールを必要とする高度なユースケースに対するものです。                                                                                                                                                         |
| http_proxy                    | str         | *None*                        | HTTP プロキシアドレス（HTTP_PROXY 環境変数を設定するのと同等）。                                                                                                                                                                                                                                          |
| https_proxy                   | str         | *None*                        | HTTPS プロキシアドレス（HTTPS_PROXY 環境変数を設定するのと同等）。                                                                                                                                                                                                                                        |
| apply_server_timezone         | bool        | True                          | タイムゾーンを認識したクエリ結果にサーバータイムゾーンを使用します。 [タイムゾーンの優先順位](#time-zones) を参照してください。                                                                                                                                                  |
#### HTTPS/TLS arguments {#httpstls-arguments}

| パラメータ                | タイプ | デフォルト | 説明                                                                                                                                                                                                                                                     |
|--------------------------|------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify                   | bool | True    | HTTPS/TLS を使用している場合、ClickHouse サーバー TLS/SSL 証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                                     |
| ca_cert                  | str  | *None*  | *verify*=*True* の場合、ClickHouse サーバー証明書を検証するための証明書機関のルートのファイルパスを .pem 形式で指定します。verify が False であれば無視されます。これは、ClickHouse サーバー証明書がオペレーティングシステムによって検証されたグローバルに信頼されたルートの場合は必要ありません。 |
| client_cert              | str  | *None*  | 相互 TLS 認証のための .pem 形式の TLS クライアント証明書のファイルパス。このファイルには、中間証明書を含むフルの証明書チェーンが含まれている必要があります。                                                                                                                                   |
| client_cert_key          | str  | *None*  | クライアント証明書のプライベートキーのファイルパス。プライベートキーがクライアント証明書キーのファイルに含まれていない場合は必須です。                                                                                                                                                               |
| server_host_name         | str  | *None*  | TLS 証明書の CN や SNI によって特定される ClickHouse サーバーのホスト名。異なるホスト名でプロキシやトンネルを通じて接続する際に SSL エラーを回避するためにこれを設定します。                                                                                                     |
| tls_mode                 | str  | *None*  | 高度な TLS 動作を制御します。`proxy` と `strict` は ClickHouse の相互 TLS 接続を呼び出すことがなく、クライアント証明書と鍵を送信します。`mutual` は ClickHouse の相互 TLS 認証をクライアント証明書で想定します。 *None*/デフォルト動作は `mutual` です。                                               |
#### Settings argument {#settings-argument}

最後に、`get_client` への `settings` 引数は、各クライアントリクエストのためにサーバーに追加の ClickHouse 設定を渡すために使用されます。通常の場合、*readonly*=*1* アクセスを持つユーザーは、クエリと共に送信された設定を変更できないため、ClickHouse Connect は最終リクエストでそのような設定を削除し、警告をログに記録します。次の設定は、ClickHouse Connect によって使用される HTTP クエリ/セッションにのみ適用され、一般的な ClickHouse 設定として文書化されていません。

| 設定               | 説明                                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size         | HTTP チャネルに書き込む前に ClickHouse サーバーによって使用されるバッファサイズ（バイト単位）。                                                                                                                                                       |
| session_id          | サーバー上で関連するクエリを関連付けるための一意のセッション ID。 一時テーブルには必須です。                                                                                                                                                       |
| compress            | ClickHouse サーバーが POST 応答データを圧縮する必要があるかどうか。この設定は「生」をクエリに対してのみ使用する必要があります。                                                                                                                   |
| decompress          | ClickHouse サーバーに送信するデータがデシリアライズされている必要があるかどうか。この設定は「生」の挿入のためにのみ使用されるべきです。                                                                                            |
| quota_key           | このリクエストに関連するクォータキー。クォータに関する ClickHouse サーバーのドキュメントを参照してください。                                                                                                                   |
| session_check       | セッションの状態をチェックするために使用されます。                                                                                                                                                                                                      |
| session_timeout     | セッション ID によって特定されたセッションがタイムアウトし、有効ではなくなるまでの非アクティブな秒数。デフォルトは 60 秒です。                                                                                                                              |
| wait_end_of_query   | ClickHouse サーバー上で全応答をバッファリングします。この設定は、要約情報を返すために必要であり、非ストリーミングクエリで自動的に設定されます。                                                                          |

各クエリに送信できる他の ClickHouse 設定については、 [ClickHouse ドキュメント](/operations/settings/settings.md) を参照してください。
#### Client creation examples {#client-creation-examples}

- パラメータなしで ClickHouse Connect クライアントが `localhost` でデフォルトの HTTP ポートに接続し、デフォルトユーザーおよびパスワードなしで接続します：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- セキュア（https）の外部 ClickHouse サーバーへの接続

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- セッション ID および他のカスタム接続パラメータと ClickHouse 設定を使用した接続。

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
### Common method arguments {#common-method-arguments}

いくつかのクライアントメソッドは、共通の `parameters` および `settings` 引数のいずれかまたは両方を使用します。これらのキーワード引数は以下に説明します。
#### Parameters argument {#parameters-argument}

ClickHouse Connect Client の `query*` および `command` メソッドは、ClickHouse 値式に Python 式をバインドするために使用されるオプションの `parameters` キーワード引数を受け入れます。二種類のバインディングが利用可能です。
##### Server side binding {#server-side-binding}

ClickHouse は、バインドされた値がクエリとは別に HTTP クエリパラメータとして送信される、ほとんどのクエリ値に対して [サーバー側バインディング](/interfaces/cli.md#cli-queries-with-parameters) をサポートしています。ClickHouse Connect は、`{<name>:<datatype>}` 形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバー側バインディングでは、`parameters` 引数は Python 辞書である必要があります。

- Python 辞書、DateTime 値および文字列値によるサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# Generates the following query on the server

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- サーバー側バインディングは `SELECT` クエリに対してのみ ClickHouse サーバーによってサポートされています。`ALTER`、`DELETE`、`INSERT`、または他の種類のクエリでは機能しません。将来的に変更される可能性があります。 https://github.com/ClickHouse/ClickHouse/issues/42092 を参照してください。
##### Client side binding {#client-side-binding}

ClickHouse Connect は、テンプレート SQL クエリを生成する際により柔軟性を持つことを可能にするクライアント側パラメータバインディングもサポートしています。クライアント側バインディングでは、`parameters` 引数は辞書またはシーケンスである必要があります。クライアント側バインディングは、パラメータ置換に Python の ["printf" スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) の文字列フォーマットを使用します。

サーバー側バインディングとは異なり、クライアント側バインディングはデータベース識別子（データベース、テーブル、カラム名など）には機能しません。 Python スタイルフォーマッティングは異なる種類の文字列を区別できないため、異なる形式（データベース識別子にはバックティックまたはダブルクォート、データ値にはシングルクォート）でフォーマットする必要があります。

- Python 辞書、DateTime 値および文字列エスケープの例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# Generates the following query:

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- Python シーケンス（タプル）、Float64、および IPv4Address の例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# Generates the following query:

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''
```

:::note
DateTime64 引数をバインドするには（サブ秒精度による ClickHouse 型）、以下の 2 つのカスタムアプローチのいずれかが必要です：
- Python の `datetime.datetime` 値を新しい DT64Param クラスにラップします。例：
```python
query = 'SELECT {p1:DateTime64(3)}'  # Server side binding with dictionary
parameters={'p1': DT64Param(dt_value)}

query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client side binding with list 
parameters=['a string', DT64Param(datetime.now())]
```
  - パラメータ値の辞書を使用する場合、パラメータ名に `_64` の文字列を追加します。
```python
query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server side binding with dictionary

parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
```
:::
#### Settings argument {#settings-argument-1}

すべての重要な ClickHouse Connect Client の "insert" および "select" メソッドは、含まれる SQL 文のために ClickHouse サーバー [ユーザー設定](/operations/settings/settings.md) を渡すためのオプションの `settings` キーワード引数を受け入れます。`settings` 引数は辞書である必要があります。各アイテムは ClickHouse 設定名とそれに関連する値である必要があります。値は、クエリパラメータとしてサーバーに送信されるときに文字列に変換されることに注意してください。

クライアントレベルの設定と同様に、ClickHouse Connect はサーバーが *readonly*=*1* とマークした設定を削除し、関連するログメッセージを出力します。ClickHouse HTTP インターフェースを介してクエリにのみ適用される設定は常に有効です。これらの設定は、`get_client` [API](#settings-argument) の下で詳述されています。

ClickHouse 設定を使用する例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### Client `command` Method {#client-command-method}

`Client.command` メソッドを使用して、通常はデータを返さないか、フルデータセットではなく単一のプリミティブまたは配列値を返す SQL クエリを ClickHouse サーバーに送信します。このメソッドは以下のパラメータを受け取ります：

| パラメータ       | タイプ             | デフォルト    | 説明                                                                                                                                                       |
|------------------|------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd              | str              | *Required*    | 単一の値または単一の行の値を返す ClickHouse SQL ステートメント。                                                                                                                                                                     |
| parameters       | dict or iterable | *None*        | [parameters description](#parameters-argument) を参照してください。                                                                                                                                            |
| data             | str or bytes     | *None*        | コマンドと共に POST ボディとして含めるオプションのデータ。                                                                                                                                                   |
| settings         | dict             | *None*        | [settings description](#settings-argument) を参照してください。                                                                                                                                   |
| use_database     | bool             | True          | クライアントデータベースを使用します（クライアント作成時に指定）。falseは、コマンドが接続されたユーザーのデフォルト ClickHouse サーバーデータベースを使用することを意味します。                                      |
| external_data    | ExternalData     | *None*        | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。 [高度なクエリ (外部データ)](#external-data) を参照してください。 |

- _command_ は DDL ステートメントに使用できます。 SQL "コマンド" がデータを返さない場合、"クエリサマリ" 辞書が代わりに返されます。この辞書は ClickHouse の X-ClickHouse-Summary および X-ClickHouse-Query-Id ヘッダーをカプセル化しており、`written_rows`,`written_bytes` および `query_id` の key/value ペアを含みます。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_ は単一の行のみを返すシンプルなクエリにも使用できます。

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### Client `query` Method {#client-query-method}

`Client.query` メソッドは、ClickHouse サーバーから単一の "バッチ" データセットを取得するための主要な方法です。これは、HTTP 経由でネイティブな ClickHouse 形式を利用して、大規模なデータセット（約 100 万行まで）を効率的に転送します。このメソッドは以下のパラメータを受け取ります。

| パラメータ         | タイプ             | デフォルト    | 説明                                                                                                                                                                                          |
|---------------------|------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required*    | ClickHouse SQL SELECT または DESCRIBE クエリ。                                                                                                                                                  |
| parameters          | dict or iterable | *None*        | [parameters description](#parameters-argument) を参照してください。                                                                                                                              |
| settings            | dict             | *None*        | [settings description](#settings-argument) を参照してください。                                                                                                                                   |
| query_formats       | dict             | *None*        | 結果値のデータ型フォーマッティング仕様。高度な使い方 (Read Formats) を参照してください。                                                                                                                                                  |
| column_formats      | dict             | *None*        | カラムごとのデータ型フォーマッティング。高度な使い方 (Read Formats) を参照してください。                                                                                                                                                            |
| encoding            | str              | *None*        | ClickHouse 文字列カラムを Python 文字列にエンコードするために使用するエンコーディング。設定しなければ Python は `UTF-8` にデフォルトします。                                                                                                    |
| use_none            | bool             | True          | ClickHouse null のために Python の *None* 型を使用します。false の場合、ClickHouse null のためにデータ型デフォルト（たとえば 0）を使用します。注意 - NumPy/Pandas のパフォーマンス上の理由から、デフォルトは false です。                    |
| column_oriented     | bool             | False         | 結果を行の配列ではなく列の配列として返します。Python データを他の列指向データ形式に変換するのに役立ちます。                                                                                      |
| query_tz            | str              | *None*        | `zoneinfo` データベースからのタイムゾーン名。このタイムゾーンは、クエリによって返されるすべての datetime または Pandas Timestamp オブジェクトに適用されます。                                                                                 |
| column_tzs          | dict             | *None*        | カラム名からタイムゾーン名への辞書。`query_tz` と同様ですが、異なるカラムに異なるタイムゾーンを指定できます。                                                                                                                                         |
| use_extended_dtypes  | bool             | True          | Pandas 拡張 dtypes（StringArray など）および ClickHouse NULL 値用の pandas.NA と pandas.NaT を使用します。これらは `query_df` と `query_df_stream` メソッドにのみ適用されます。                                                                                      |
| external_data       | ExternalData     | *None*        | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。 [高度なクエリ (外部データ)](#external-data) を参照してください。                                                                                                                      |
| context             | QueryContext     | *None*        | 上記のメソッド引数をカプセル化するために再利用可能な QueryContext オブジェクトを使用できます。 [高度なクエリ (QueryContexts)](#querycontexts) を参照してください。                                                             |
#### The QueryResult object {#the-queryresult-object}

基本的な `query` メソッドは、次の公開プロパティを持つ QueryResult オブジェクトを返します:

- `result_rows` -- 行のシーケンスの形で返されたデータのマトリックス。各行の要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスの形で返されたデータのマトリックス。各カラムの要素はそのカラムの行値のシーケンスです。
- `column_names` -- `result_set` 内のカラム名を表す文字列のタプル。
- `column_types` -- `result_columns` 内の各カラムに対する ClickHouse データ型を表す ClickHouseType インスタンスのタプル。
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブルでクエリを調べるのに便利です）。
- `summary` -- `X-ClickHouse-Summary` HTTP レスポンスヘッダーによって返されたデータ。
- `first_item` -- レスポンスの最初の行を辞書として取得するための便利なプロパティ（キーはカラム名です）。
- `first_row` -- 結果の最初の行を返すための便利なプロパティ。
- `column_block_stream` -- カラム指向形式のクエリ結果のジェネレータ。このプロパティは直接参照すべきではありません（下記を参照）。
- `row_block_stream` -- 行指向形式のクエリ結果のジェネレータ。このプロパティは直接参照すべきではありません（下記を参照）。
- `rows_stream` -- 各呼び出しで一つの行を返すクエリ結果のジェネレータ。このプロパティは直接参照すべきではありません（下記を参照）。
- `summary` -- `command` メソッドの下で説明されている、ClickHouse が返すサマリー情報の辞書。

`*_stream` プロパティは、返されたデータのイテレータとして使用できる Python コンテキストを返します。これらは Client `*_stream` メソッドを使用して間接的にアクセスする必要があります。

クエリ結果をストリーミングする完全な詳細（StreamContext オブジェクトを使用）は、[Advanced Queries (Streaming Queries)](#streaming-queries) に記載されています。
### Consuming query results with NumPy, Pandas or Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

主な `query` メソッドには、3つの特化したバージョンがあります:

- `query_np` -- このバージョンは、ClickHouse Connect QueryResult の代わりに NumPy 配列を返します。
- `query_df` -- このバージョンは、ClickHouse Connect QueryResult の代わりに Pandas DataFrame を返します。
- `query_arrow` -- このバージョンは、PyArrow テーブルを返します。ClickHouse `Arrow` 形式を直接使用するため、メインの `query` メソッドと共通の 3つの引数：`query`、`parameters`、および `settings` のみを受け付けます。さらに、Arrow テーブルが ClickHouse の文字列型を文字列（Trueの場合）またはバイト（Falseの場合）として表現するかどうかを決定する `use_strings` という追加の引数があります。
### Client streaming query methods {#client-streaming-query-methods}

ClickHouse Connect Client は、ストリームとしてデータを取得するための複数のメソッドを提供します（Python ジェネレータとして実装されています）：

- `query_column_block_stream` -- ネイティブ Python オブジェクトを使用してカラムのシーケンスとしてクエリデータをブロックで返します。
- `query_row_block_stream` -- ネイティブ Python オブジェクトを使用して行のブロックのクエリデータを返します。
- `query_rows_stream` -- ネイティブ Python オブジェクトを使用して行のシーケンスとしてクエリデータを返します。
- `query_np_stream` -- 各 ClickHouse ブロックを NumPy 配列として返します。
- `query_df_stream` -- 各 ClickHouse ブロックを Pandas DataFrame として返します。
- `query_arrow_stream` -- PyArrow RecordBlocks 形式のクエリデータを返します。

これらの各メソッドは、ストリームを消費するために `with` ステートメントを通じて開かれなければならない `ContextStream` オブジェクトを返します。詳細と例については、[Advanced Queries (Streaming Queries)](#streaming-queries) を参照してください。
### Client `insert` method {#client-insert-method}

ClickHouse への複数レコードの挿入という一般的なユースケースのために、`Client.insert` メソッドがあります。以下のパラメータを受け取ります：

| パラメータ        | タイプ                           | デフォルト   | 説明                                                                                                                                                                                       |
|-------------------|----------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                              | *必須*       | 挿入する ClickHouse テーブル。データベースを含むフルテーブル名が許可されています。                                                                                                     |
| data              | Sequence of Sequences            | *必須*       | 挿入するデータのマトリックスで、行のシーケンス（各行がカラム値のシーケンス）またはカラムのシーケンス（各カラムが行値のシーケンス）です。                                              |
| column_names      | Sequence of str, or str          | '*'          | データマトリックスのカラム名のリスト。`'*'` を使用した場合、ClickHouse Connect はテーブルのすべてのカラム名を取得するために「プレクエリ」を実行します。                                   |
| database          | str                              | ''           | 挿入のターゲットデータベース。指定されていない場合、クライアントのデータベースが使用されます。                                                                                           |
| column_types      | Sequence of ClickHouseType       | *なし*       | ClickHouseType インスタンスのリスト。`column_types` もしくは `column_type_names` のいずれも指定されない場合、ClickHouse Connect はテーブルのすべてのカラムタイプを取得するために「プレクエリ」を実行します。  |
| column_type_names | Sequence of ClickHouse 型名      | *なし*       | ClickHouse データ型名のリスト。`column_types` もしくは `column_type_names` のいずれも指定されない場合、ClickHouse Connect はテーブルのすべてのカラムタイプを取得するために「プレクエリ」を実行します。|
| column_oriented   | bool                             | False        | `True` の場合、`data` 引数はカラムのシーケンスであると仮定され（データを挿入するのに「ピボット」が必要ありません）。それ以外の場合、`data` は行のシーケンスとして解釈されます。                                      |
| settings          | dict                             | *なし*       | [settings description](#settings-argument) を参照してください。                                                                                                                                  |
| insert_context    | InsertContext                    | *なし*       | 上記のメソッド引数をカプセル化する再利用可能な InsertContext オブジェクトを使用できます。 [Advanced Inserts (InsertContexts)](#insertcontexts) を参照してください。                       |

このメソッドは、「クエリサマリー」辞書を返します。挿入が何らかの理由で失敗した場合、例外が発生します。

主な `insert` メソッドの2つの特化バージョンがあります：

- `insert_df` -- Python の Sequences of Sequences `data` 引数の代わりに、このメソッドの第2パラメータは Pandas DataFrame インスタンスでなければなりません。ClickHouse Connect は DataFrame をカラム指向のデータソースとして自動的に処理するため、`column_oriented` パラメータは必要ありませんし、利用できません。
- `insert_arrow` -- Python の Sequences of Sequences `data` 引数の代わりに、このメソッドは `arrow_table` を必要とします。ClickHouse Connect は Arrow テーブルを変更せずに ClickHouse サーバーに渡します。そのため、`table` と `arrow_table` に加えて `database` と `settings` の引数のみが利用可能です。

*注:* NumPy 配列は有効な Sequence of Sequences であり、主な `insert` メソッドの `data` 引数として使用することができますので、特化メソッドは必要ありません。
### File Inserts {#file-inserts}

`clickhouse_connect.driver.tools` には、ファイルシステムから既存の ClickHouse テーブルに直接データを挿入する `insert_file` メソッドが含まれています。解析は ClickHouse サーバーに委任されています。`insert_file` は次のパラメータを受け入れます：

| パラメータ    | タイプ            | デフォルト           | 説明                                                                                                                     |
|--------------|-----------------|-------------------|-------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *必須*            | 挿入を実行するために使用する `driver.Client`                                                                              |
| table        | str             | *必須*            | 挿入する ClickHouse テーブル。データベースを含むフルテーブル名が許可されています。                                               |
| file_path    | str             | *必須*            | データファイルへのネイティブファイルシステムパス                                                                           |
| fmt          | str             | CSV, CSVWithNames | ファイルの ClickHouse 入力形式。`column_names` が指定されていない場合は CSVWithNames が仮定されます。                         |
| column_names | Sequence of str | *なし*             | データファイル内のカラム名のリスト。カラム名を含む形式には必要ありません。                                            |
| database     | str             | *なし*             | テーブルのデータベース。完全修飾名の場合無視されます。指定されていない場合、挿入はクライアントデータベースを使用します。                      |
| settings     | dict            | *なし*             | [settings description](#settings-argument) を参照してください。                                                            |
| compression  | str             | *なし*             | Content-Encoding HTTP ヘッダーに使用された認識された ClickHouse 圧縮タイプ（zstd、lz4、gzip）。                               |

不正確なデータや特殊な形式の日付/時間値を含むファイルについては、データインポートに適用される設定（例えば `input_format_allow_errors_num` や `input_format_allow_errors_num`）がこのメソッドでも認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
### Saving query results as files {#saving-query-results-as-files}

ClickHouse からローカルファイルシステムにファイルをストリーム保存するには、`raw_stream` メソッドを使用します。たとえば、クエリの結果を CSV ファイルに保存したい場合、以下のコードスニペットを使用できます：

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # or CSV, or CSVWithNamesAndTypes, or TabSeparated, etc.
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上記のコードは、次の内容を持つ `output.csv` ファイルを生成します：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats#tabseparated) や他の形式でデータを保存できます。利用可能なすべての形式オプションの概要については、[Formats for Input and Output Data](/interfaces/formats) を参照してください。
### Raw API {#raw-api}

ClickHouse データとネイティブまたはサードパーティのデータタイプおよび構造の間の変換を必要としないユースケースのために、ClickHouse Connect クライアントは ClickHouse 接続の直接使用のための2つのメソッドを提供します。
#### Client `raw_query` Method {#client_raw_query_method}

`Client.raw_query` メソッドは、クライアント接続を使用して ClickHouse HTTP クエリインターフェースの直接利用を可能にします。返り値は未処理の `bytes` オブジェクトです。これは引数のバインディング、エラーハンドリング、リトライ、および設定管理を備えた便利なラッパーを提供します：

| パラメータ     | タイプ             | デフォルト     | 説明                                                                                                                                       |
|---------------|-------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str                | *必須*         | 有効な ClickHouse クエリ                                                                                                                 |
| parameters    | dict または iterable | *なし*         | [parameters description](#parameters-argument) を参照してください。                                                                        |
| settings      | dict               | *なし*         | [settings description](#settings-argument) を参照してください。                                                                            |                                                                                                                                                |
| fmt           | str                | *なし*         | 返されたバイトの ClickHouse 出力形式。（指定されていない場合 ClickHouse は TSV を使用します）                                             |
| use_database  | bool               | True           | クエリコンテキストのために clickhouse-connect クライアントが割り当てたデータベースを使用します                                                                 |
| external_data | ExternalData       | *なし*         | クエリに使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。 [Advanced Queries (External Data)](#external-data) を参照してください。  |

結果の `bytes` オブジェクトの処理は呼び出し側の責任です。注意点として、`Client.query_arrow` は ClickHouse の `Arrow` 出力形式を使ったこのメソッドの薄いラッパーであることを指摘しておきます。
#### Client `raw_stream` Method {#client_raw_stream_method}

`Client.raw_stream` メソッドは `raw_query` メソッドと同じ API を持ちますが、`bytes` オブジェクトのジェネレータ/ストリームソースとして使用できる `io.IOBase` オブジェクトを返します。これは `query_arrow_stream` メソッドによって現在利用されています。
#### Client `raw_insert` Method {#client_raw_insert_method}

`Client.raw_insert` メソッドは、クライアント接続を使用して `bytes` オブジェクトまたは `bytes` オブジェクトのジェネレータの直接挿入を可能にします。挿入ペイロードに対する処理を行わないため、高速です。このメソッドは設定や挿入形式を指定するオプションを提供します：

| パラメータ    | タイプ                                | デフォルト     | 説明                                                                                                                                                 |
|--------------|---------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| table        | str                                   | *必須*         | 簡単またはデータベース資格付きのテーブル名のいずれか                                                                                                             |
| column_names | Sequence[str]                         | *なし*         | 挿入ブロックのためのカラム名。`fmt` パラメータに名前が含まれていない場合は必須                                                                                                   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *必須*         | 挿入するデータ。文字列はクライアントエンコーディングでエンコードされます。                                                                                                    |
| settings     | dict                                  | *なし*         | [settings description](#settings-argument) を参照してください。                                                                                                     |                                                                                                                                                |
| fmt          | str                                   | *なし*         | `insert_block` バイトの ClickHouse 入力形式。指定されていない場合 ClickHouse は TSV を使用します。                                                                                 |

呼び出し側は `insert_block` が指定された形式であり、指定された圧縮方法を使用していることを確認する責任があります。ClickHouse Connect はファイルアップロードや PyArrow テーブルのためにこれらの生挿入を使用し、解析を ClickHouse サーバーに委任します。
### Utility classes and functions {#utility-classes-and-functions}

以下のクラスと関数も「公開された」`clickhouse-connect` API の一部と見なされ、上記の文書化されたクラスやメソッドと同様に、マイナーバージョン間で安定しています。これらのクラスや関数に対する破壊的な変更は、マイナー（パッチではなく）リリースでのみ発生し、少なくとも1つのマイナーバージョンで非推奨のステータスで利用可能です。
#### Exceptions {#exceptions}

すべてのカスタム例外（DB API 2.0 仕様で定義されているものを含む）は、`clickhouse_connect.driver.exceptions` モジュールで定義されています。ドライバーによって実際に検出された例外は、これらのタイプのいずれかを使用します。
#### Clickhouse SQL utilities {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュール内の関数と DT64Param クラスは、ClickHouse SQL クエリを適切に構築しエスケープするために使用できます。同様に、`clickhouse_connect.driver.parser` モジュールの関数は ClickHouse データ型名を解析するために使用できます。
### Multithreaded, multiprocess, and async/event driven use cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect はマルチスレッド、マルチプロセス、およびイベントループ駆動/非同期アプリケーションでうまく機能します。すべてのクエリおよび挿入処理は、単一スレッド内で実行されるため、操作は一般にスレッドセーフです。（低レベルでの一部の操作の並行処理は、単一スレッドのパフォーマンスペナルティを克服するための将来の改良の可能性がありますが、その場合でもスレッドセーフは維持されます）。

各クエリまたは挿入は、それぞれ独自の QueryContext または InsertContext オブジェクト内で状態を維持するため、これらのヘルパーオブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有するべきではありません。コンテキストオブジェクトについての追加の議論は、次のセクションで行っています。

また、同時に 2 つ以上のクエリや挿入が「フライト」にあるアプリケーションでは、考慮すべき2つの要素があります。1つ目は、クエリ/挿入に関連付けられた ClickHouse「セッション」であり、2つ目は ClickHouse Connect クライアントインスタンスによって使用される HTTP 接続プールです。
### Asyncclient wrapper {#asyncclient-wrapper}

0.7.16 以降、ClickHouse Connect は通常の `Client` に対する非同期ラッパーを提供しており、`asyncio` 環境でクライアントを使用することが可能です。

`AsyncClient` のインスタンスを取得するには、標準の `get_client` と同じパラメータを受け入れる `get_async_client` ファクトリ関数を使用します：

```python
import asyncio

import clickhouse_connect

async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)

asyncio.run(main())
```

`AsyncClient` は、標準の `Client` と同じメソッドおよびパラメータを持ちますが、それらは適用可能な場合コルーチンです。内部では、I/O 操作を実行する `Client` のこれらのメソッドは、[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) コール内でラップされています。

`AsyncClient` ラッパーを使用することでマルチスレッド性能が向上します。I/O 操作が完了するのを待つ間、実行スレッドと GIL が解放されます。

注: 通常の `Client` とは異なり、`AsyncClient` はデフォルトで `autogenerate_session_id` を `False` に設定します。

参考: [run_async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。
### Managing ClickHouse Session Ids {#managing-clickhouse-session-ids}

各 ClickHouse クエリは ClickHouse「セッション」のコンテキスト内で発生します。セッションは現在、2つの目的で使用されています：
- 複数のクエリに特定の ClickHouse 設定を関連付けるため（[user settings](/operations/settings/settings.md) を参照してください）。ClickHouse の `SET` コマンドはユーザーセッションの範囲の設定を変更するために使用されます。
- [temporary tables](/sql-reference/statements/create/table#temporary-tables) を追跡するため。

デフォルトでは、ClickHouse Connect クライアントインスタンスで実行される各クエリは、同じセッション ID を使用してこのセッション機能を有効にします。つまり、`SET` ステートメントと一時テーブルは、単一の ClickHouse クライアントを使用していると期待通りに動作します。しかし、設計上、ClickHouse サーバーは同じセッション内での同時クエリを許可しません。したがって、同時クエリを実行する ClickHouse Connect アプリケーションには2つのオプションがあります。

- 各実行スレッド（スレッド、プロセス、またはイベントハンドラー）に対して別の `Client` インスタンスを作成し、それぞれが独自のセッション ID を持つようにします。一般的にはこのアプローチが最良です。クライアントごとにセッション状態を維持します。
- 各クエリにユニークなセッション ID を使用します。これにより、一時テーブルや共有セッション設定が不要な場合の同時セッションの問題を回避します。（共有設定はクライアント作成時にも提供できますが、リクエストごとに送信され、セッションとは関連付けられません）。ユニークな session_id は、各リクエストの `settings` 辞書に追加できます。また、`autogenerate_session_id` 一般設定を無効にすることもできます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

この場合、ClickHouse Connect はセッション ID を送信せず、ClickHouse サーバーによってランダムなセッション ID が生成されます。繰り返しますが、一時テーブルおよびセッションレベルの設定は利用できません。
### Customizing the HTTP connection pool {#customizing-the-http-connection-pool}

ClickHouse Connect は、サーバーへの基盤となる HTTP 接続を処理するために `urllib3` 接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスは同じ接続プールを共有し、これは大多数のユースケースには十分です。このデフォルトプールは、アプリケーションで使用する各 ClickHouse サーバーへの最大 8 つの HTTP Keep Alive 接続を維持します。

大規模なマルチスレッドアプリケーションの場合、別々の接続プールが適切な場合があります。カスタマイズされた接続プールは、主な `clickhouse_connect.get_client` 関数に `pool_mgr` キーワード引数として提供できます：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例が示すように、クライアントはプールマネージャを共有することができますし、各クライアントのために別個のプールマネージャを作成することもできます。プールマネージャを作成する際の利用可能なオプションの詳細については、[`urllib3` documentation](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior) を参照してください。
## Querying data with ClickHouse Connect: Advanced usage {#querying-data-with-clickhouse-connect--advanced-usage}
### QueryContexts {#querycontexts}

ClickHouse Connect は標準クエリを QueryContext 内で実行します。QueryContext には、ClickHouse データベースに対してクエリを構築するために使用される主要な構造と、結果を QueryResult やその他のレスポンスデータ構造に処理するための設定が含まれています。それには、クエリ自体、パラメータ、設定、読み取り形式、その他の属性が含まれます。

QueryContext は、クライアントの `create_query_context` メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメータを受け取ります。このクエリコンテキストは、`query`、`query_df`、または `query_np` メソッドに `context` キーワード引数として渡すことができ、これによりこれらのメソッドへの他の引数を一切使用しなくても済みます。注意点として、メソッド呼び出しのために指定された追加の引数は QueryContext のプロパティを上書きします。

QueryContext の最も明確なユースケースは、異なるバインディングパラメータ値で同じクエリを送信することです。すべてのパラメータ値は、`QueryContext.set_parameters` メソッドを辞書で呼び出すことで更新できます。また、任意の単一値は `QueryContext.set_parameter` を desired `key`, `value` ペアで呼び出すことで更新できます。

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

QueryContexts はスレッドセーフではありませんが、マルチスレッド環境で `QueryContext.updated_copy` メソッドを呼び出すことでコピーを取得できます。
### Streaming queries {#streaming-queries}
#### Data blocks {#data-blocks}

ClickHouse Connect は、主な `query` メソッドからのすべてのデータを ClickHouse サーバーから受信するブロックのストリームとして処理します。これらのブロックは、ClickHouse との間でカスタム「ネイティブ」形式で送信されます。「ブロック」は、指定されたデータ型のデータ値の数が等しい各カラムを含むバイナリデータのカラムのシーケンスです。（カラム型データベースとして、ClickHouse は同様の形でこのデータを格納します。）クエリから返されるブロックのサイズは、複数のレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定できる2つのユーザー設定によって制御されます。それは：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行数のブロックのサイズの制限。デフォルトは 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- バイトのブロックのサイズに対するソフトリミット。デフォルトは 1,000,0000。

`preferred_block_size_setting` に関係なく、各ブロックは `max_block_size` 行を超えることは決してありません。クエリのタイプに応じて、実際に返されるブロックは任意のサイズである場合があります。たとえば、多くのシャードをカバーする分散テーブルへのクエリは、各シャードから直接取得された小さなブロックを含む場合があります。

Client `query_*_stream` メソッドの1つを使用する場合、結果はブロックごとに返されます。ClickHouse Connect は単一のブロックを一度にのみロードします。これにより、多くのデータを処理する際に大きな結果セットをすべてメモリにロードする必要がなくなります。アプリケーションは、任意の数のブロックを処理できるように準備する必要があります。各ブロックの正確なサイズを制御することはできません。
#### HTTP data buffer for slow processing {#http-data-buffer-for-slow-processing}

HTTP プロトコルの制限のため、ブロックが ClickHouse サーバーがデータをストリーミングする速度よりも著しく遅い速度で処理される場合、ClickHouse サーバーは接続を閉じ、処理スレッドで例外が発生します。これは、共通の `http_buffer_size` 設定を使用して HTTP ストリーミングバッファのサイズを増やすことで軽減できます（デフォルトは 10 メガバイト）。十分なメモリがアプリケーションに利用可能な場合、大きな `http_buffer_size` 値はこの状況で問題ありません。バッファ内のデータは、`lz4` または `zstd` 圧縮を使用して圧縮されるので、これらの圧縮タイプを使用することで全体のバッファが増加します。
#### StreamContexts {#streamcontexts}

`query_*_stream` メソッドの各メソッド（`query_row_block_stream` のような）は、ClickHouse `StreamContext` オブジェクトを返します。これは、Python コンテキスト/ジェネレータの組み合わせです。基本的な使用法は次のとおりです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

注意：`with` ステートメントなしで StreamContext を使用しようとするとエラーが発生します。Python コンテキストの使用により、ストリーム（この場合、ストリーミング HTTP レスポンス）がすべてのデータが消費されない場合や、処理中に例外が発生した場合でも適切に閉じられることが保証されます。また、StreamContexts はストリームを消費するためにのみ一度使用できます。StreamContext が終了した後に使用しようとすると、`StreamClosedError` が発生します。

StreamContext の `source` プロパティを使用して親の `QueryResult` オブジェクトにアクセスできます。これにはカラム名や型が含まれます。
#### Stream types {#stream-types}

`query_column_block_stream` メソッドは、ネイティブ Python データ型として保存されたカラムデータのシーケンスとしてブロックを返します。上記の `taxi_trips` クエリを使用すると、返されたデータはそれぞれのリストの要素が関連付けられたカラムのすべてのデータを含む別のリスト（またはタプル）になるリストとなります。したがって、`block[0]` は文字列のみを含むタプルです。カラム指向形式は、カラム内のすべての値に対して集約操作を行うためによく使用されます。

`query_row_block_stream` メソッドは、従来の関係データベースのように行のシーケンスとしてブロックを返します。タクシートリップに対する返されたデータは、リストの各要素がデータの行を表す別のリストになります。したがって、`block[0]` は最初のタクシートリップのすべてのフィールド（順序付け）を含んでおり、`block[1]` は2番目のタクシートリップのすべてのフィールドの行を含みます。行指向結果は通常、表示または変換プロセスに使用されます。

`query_row_stream` は便利なメソッドで、ストリームを反復処理する際に自動的に次のブロックに移動します。それ以外は、`query_row_block_stream` と同一です。

`query_np_stream` メソッドは、各ブロックを 2 次元の NumPy 配列として返します。内部では NumPy 配列は（通常）カラムとして保存されるため、特に行またはカラムメソッドは必要ありません。NumPy 配列の「形状」は `(columns, rows)` として表現されます。NumPy ライブラリは、NumPy 配列を操作する多くのメソッドを提供します。すべてのカラムが同じ NumPy dtype を共有している場合、返される NumPy 配列も同じ dtype しか持たず、内部構造を変更せずに再成形/回転できます。

`query_df_stream` メソッドは、各 ClickHouse ブロックを 2 次元の Pandas DataFrame として返します。次に示す例では、StreamContext オブジェクトが遅延的にコンテキストとして使用でき（ただし、1 回のみ）、示されています。

最後に、`query_arrow_stream` メソッドは ClickHouse の `ArrowStream` 形式の結果を pyarrow.ipc.RecordBatchStreamReader として返します。ストリームの各反復は PyArrow RecordBlock を返します。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```
### Read formats {#read-formats}

読み取り形式は、クライアントの `query`、`query_np`、および `query_df` メソッドから返された値のデータ型を制御します。（`raw_query` と `query_arrow` は ClickHouse からの受信データを変更しないため、形式制御は適用されません。）たとえば、UUID の読み取り形式をデフォルトの `native` 形式から代替の `string` 形式に変更すると、ClickHouse の `UUID` カラムに対するクエリは Python UUID オブジェクトの代わりに文字列値（標準の 8-4-4-4-12 RFC 1422 形式）として返されます。

形式設定関数の「データ型」引数には、ワイルドカードを含めることができます。形式は単一の小文字の文字列です。

読み取り形式は、いくつかのレベルで設定できます：

- `clickhouse_connect.datatypes.format` パッケージで定義されたメソッドを使用してグローバルに設定します。これにより、すべてのクエリに対して設定されたデータ型の形式が制御されます。
```python
from clickhouse_connect.datatypes.format import set_read_format


# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')


# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- クエリ全体に対して、オプションの `query_formats` 辞書引数を使用します。その場合、特定のデータ型のいずれかのカラム（またはサブカラム）は設定された形式を使用します。
```python

# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 特定のカラムの値に対しては、オプションの `column_formats` 辞書引数を使用します。キーは ClickHouse によって返されたカラム名で、データカラムの形式や ClickHouse 型名の 2 番目のレベル「形式」辞書とその値を持ちます。この二次辞書は、タプルやマップなどのネストされたカラム型のためにも使用できます。
```python

# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### Read format options (Python types) {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type    | Read Formats | Comments                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | Supersetは現在、大きな符号なしUInt64値を処理できません                                                   |
| [U]Int[128,256]       | int                   | string       | PandasおよびNumPyのint値は最大64ビットのため、これらは文字列として返されます                              |
| Float32               | float                 | -            | すべてのPython浮動小数点数は内部的に64ビットです                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | bytes        | ClickHouseのStringカラムは固有のエンコーディングを持たず、可変長のバイナリデータにも使用されます        |
| FixedString           | bytes                 | string       | FixedStringsは固定サイズのバイト配列ですが、時々Pythonの文字列として扱われることがあります                          |
| Enum[8,16]            | string                | string, int  | Pythonの列挙型は空の文字列を受け入れないため、すべての列挙型は文字列または基になるint値のいずれかとして表示されます。 |
| Date                  | datetime.date         | int          | ClickHouseは日付を1970年1月1日からの日数として保存します。この値はint型として利用可能                            |
| Date32                | datetime.date         | int          | Dateと同じですが、より広い範囲の日付用です                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouseはDateTimeをエポック秒として保存します。この値はint型として利用可能                                   |
| DateTime64            | datetime.datetime     | int          | Pythonのdatetime.datetimeはマイクロ秒精度に制限されています。生の64ビットint値が利用可能です               |
| IPv4                  | `ipaddress.IPv4Address` | string       | IPアドレスは文字列として読み取られ、正しくフォーマットされた文字列はIPアドレスとして挿入できます                |
| IPv6                  | `ipaddress.IPv6Address` | string       | IPアドレスは文字列として読み取られ、正しくフォーマットされたものはIPアドレスとして挿入できます                |
| Tuple                 | dict or tuple         | tuple, json  | 名前付きタプルはデフォルトで辞書として返されます。名前付きタプルはJSON文字列としても返されることがあります      |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUIDはRFC 4122に従った形式の文字列として読み取ることができます<br/>                                                       |
| JSON                  | dict                  | string       | デフォルトでPythonの辞書が返されます。`string`フォーマットはJSON文字列を返します                        |
| Variant               | object                | -            | 値のために保存されたClickHouseデータ型に対して一致するPython型を返します                                 |
| Dynamic               | object                | -            | 値のために保存されたClickHouseデータ型に対して一致するPython型を返します                                 |
### External data {#external-data}

ClickHouseのクエリは、任意のClickHouseフォーマットの外部データを受け入れることができます。このバイナリデータは、データを処理するためにクエリ文字列と共に送信されます。外部データ機能の詳細は[こちら](/engines/table-engines/special/external-data.md)で確認できます。クライアントの`query*`メソッドは、この機能を利用するためにオプショナルな`external_data`パラメータを受け入れます。`external_data`パラメータの値は、`clickhouse_connect.driver.external.ExternalData`オブジェクトである必要があります。そのオブジェクトのコンストラクタは次の引数を受け入れます：

| Name      | Type              | Description                                                                                                                                     |
|-----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | 外部データを読み取るためのローカルシステムパスにあるファイルのパス。`file_path`または`data`のいずれかが必要です                               | 
| file_name | str               | 外部データの「ファイル」の名前。指定されない場合は、`file_path`（拡張子なし）から決定されます                            |
| data      | bytes             | ファイルから読み取る代わりに、バイナリ形式の外部データ。`data`または`file_path`のいずれかが必要です                                 |
| fmt       | str               | データのClickHouse [Input Format](/sql-reference/formats.mdx)。デフォルトは`TSV`                                                        |
| types     | str or seq of str | 外部データ内のカラムデータ型のリスト。文字列の場合、型はカンマで区切る必要があります。`types`または`structure`のいずれかが必要です |
| structure | str or seq of str | データ内のカラム名とデータ型のリスト（例を参照）。`structure`または`types`のいずれかが必要です                                     |
| mime_type | str               | ファイルデータのオプションのMIMEタイプ。現在、ClickHouseはこのHTTPサブヘッダーを無視します                                                          |

"映画"データを含む外部CSVファイルを使ってクエリを送信し、そのデータをClickHouseサーバ上に既存の`directors`テーブルと結合する方法：

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

初期のExternalDataオブジェクトに追加の外部データファイルを追加するには、コンストラクタと同じパラメータを受け入れる`add_file`メソッドを使用します。HTTPの場合、すべての外部データは`multi-part/form-data`ファイルアップロードの一部として送信されます。
### Time zones {#time-zones}
ClickHouseのDateTimeおよびDateTime64値にタイムゾーンを適用するための複数のメカニズムがあります。内部的に、ClickHouseサーバは、すべてのDateTimeまたはDateTime64オブジェクトをエポック（1970-01-01 00:00:00 UTC時間）以降の秒数を表す、タイムゾーンに依存しない数値として保存します。DateTime64値の場合、表現は精度に応じてエポック以降のミリ秒、マイクロ秒、またはナノ秒となることがあります。そのため、タイムゾーン情報の適用は常にクライアント側で行われます。この計算は重要な追加計算を伴うため、パフォーマンスが重要なアプリケーションでは、ユーザー表示と変換（たとえば、PandasのTimestampsなど）を除いて、DateTime型をエポックタイムスタンプとして扱うことをお勧めします。

タイムゾーンを意識したデータ型をクエリで使用する場合 - 特にPythonの`datetime.datetime`オブジェクトで -- `clickhouse-connect`は次の優先順位ルールに従ってクライアント側のタイムゾーンを適用します：

1. クエリのメソッドパラメータ`client_tzs`が指定されている場合、特定のカラムタイムゾーンが適用されます。
2. ClickHouseのカラムにタイムゾーンメタデータがある場合（すなわち、DateTime64(3, 'America/Denver')のような型の場合）、そのClickHouseのカラムタイムゾーンが適用されます。（このタイムゾーンメタデータは、ClickHouseバージョン23.2より前のDateTimeカラムに対してclickhouse-connectでは利用できません）
3. クエリメソッドパラメータ`query_tz`が指定されている場合、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションにタイムゾーン設定が適用された場合、そのタイムゾーンが適用されます。（この機能は現在のClickHouseサーバにはまだリリースされていません）
5. 最後に、クライアントの`apply_server_timezone`パラメータがTrueに設定されている場合（デフォルト）、ClickHouseサーバのタイムゾーンが適用されます。

これらのルールに基づいて適用されたタイムゾーンがUTCである場合、`clickhouse-connect`は常にタイムゾーンに依存しないPythonの`datetime.datetime`オブジェクトを返します。このタイムゾーンに依存しないオブジェクトには、必要に応じてアプリケーションコードで追加のタイムゾーン情報を加えることができます。
## Inserting data with ClickHouse Connect:  Advanced usage {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connectは、すべての挿入操作をInsertContext内で実行します。InsertContextには、クライアントの`insert`メソッドに引数として渡されるすべての値が含まれています。さらに、InsertContextが元々構築されるとき、ClickHouse Connectは効果的なネイティブフォーマットの挿入に必要な挿入カラムのデータ型を取得します。複数の挿入にInsertContextを再利用することで、この「前クエリ」を回避し、挿入をより迅速かつ効率的に実行できます。

InsertContextは、クライアントの`create_insert_context`メソッドを使用して取得できます。このメソッドは、`insert`関数と同じ引数を受け取ります。InsertContextsは、再利用のためにデータプロパティが変更されるべきであることに注意してください。これは、同じテーブルに新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供するという意図した目的に一致しています。

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data=test_data)
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

InsertContextsは、挿入プロセス中に更新される可変状態を含むため、スレッドセーフではありません。
### Write formats {#write-formats}
書き込みフォーマットは、現在限られた数の型に対して実装されています。ほとんどの場合、ClickHouse Connectは最初の（非null）データ値の型を確認することによって各カラムの正しい書き込みフォーマットを自動的に判断しようとします。たとえば、DateTimeカラムに挿入する場合、そのカラムの最初の挿入値がPythonの整数であれば、ClickHouse Connectはそれが実際にはエポック秒であるという仮定の下、その整数値を直接挿入します。

ほとんどの場合、データ型の書き込みフォーマットをオーバーライドする必要はありませんが、`clickhouse_connect.datatypes.format`パッケージ内の関連メソッドを使用してグローバルレベルで行うことができます。
#### Write format options {#write-format-options}

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
| Date                  | datetime.date         | int           | ClickHouseは日付を1970年1月1日からの日数として保存します。int型の値はこの「エポック日付」値と見なされます  |
| Date32                | datetime.date         | int           | Dateと同じですが、より広い範囲の日付用です                                                                |
| DateTime              | datetime.datetime     | int           | ClickHouseはDateTimeをエポック秒として保存します。int型の値はこの「エポック秒」値と見なされます     |
| DateTime64            | datetime.datetime     | int           | Pythonのdatetime.datetimeはマイクロ秒精度に制限されています。生の64ビットint値が利用可能です         |
| IPv4                  | `ipaddress.IPv4Address` | string        | 正しくフォーマットされた文字列はIPv4アドレスとして挿入できます                                                |
| IPv6                  | `ipaddress.IPv6Address` | string        | 正しくフォーマットされた文字列はIPv6アドレスとして挿入できます                                                |
| Tuple                 | dict or tuple         |               |                                                                                                             |
| Map                   | dict                  |               |                                                                                                             |
| Nested                | Sequence[dict]        |               |                                                                                                             |
| UUID                  | uuid.UUID             | string        | 正しくフォーマットされた文字列はClickHouseのUUIDとして挿入できます                                              |
| JSON/Object('json')   | dict                  | string        | 辞書またはJSON文字列はJSONカラムに挿入できます（`Object('json')`は非推奨です） |
| Variant               | object                |               | 現在すべてのバリアントは文字列として挿入され、ClickHouseサーバによって解析されます                    |
| Dynamic               | object                |               | 警告 -- 現在、Dynamicカラムへの挿入はClickHouseの文字列として保持されます              |
## Additional options {#additional-options}

ClickHouse Connectは、高度な使用ケースのための追加のオプションを多数提供します。
### Global settings {#global-settings}

ClickHouse Connectの動作をグローバルに制御する設定が少数あります。それらは最上位の`common`パッケージからアクセスされます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの共通設定`autogenerate_session_id`、`product_name`、および`readonly`は、必ずクライアントを`clickhouse_connect.get_client`メソッドで作成する前に変更する必要があります。クライアント作成後にこれらの設定を変更しても、既存のクライアントの動作には影響しません。
:::

現在定義されているグローバル設定は10個です：

| Setting Name            | Default | Options                 | Description                                                                                                                                                                                                                                                   |
|-------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | 各クライアントセッションのために新しいUUID(1)セッションIDを自動生成します（提供されていない場合）。セッションIDが提供されない場合（クライアントまたはクエリレベルのいずれかで）、ClickHouseは各クエリのためにランダムな内部IDを生成します                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 無効または読み取り専用設定が提供された場合のアクション（クライアントセッションまたはクエリのいずれかに）。`drop`の場合、設定は無視され、`send`の場合、設定はClickHouseに送信され、`error`の場合、クライアント側のProgrammingErrorが発生します |
| dict_parameter_format   | 'json'  | 'json', 'map'           | これは、パラメータ化されたクエリがPython辞書をJSONまたはClickHouseマップ構文に変換するかどうかを制御します。JSONカラムへの挿入には`json`を使用し、ClickHouseマップカラムには`map`を使用します                                                               |
| product_name            |         |                         | ClickHouseに渡すクエリに追跡用のアプリケーション名が含まれた文字列です。形式は`<product_name>/<product_version>`であるべきです                                                                                       |
| max_connection_age      | 600     |                         | HTTP Keep Alive接続がオープン/再利用される最大秒数。この設定は、負荷分散装置/プロキシの背後にある単一のClickHouseノードを対処するために、接続のバンチを防ぎます。デフォルトは10分です。                                                   |
| readonly                | 0       | 0, 1                    | 19.17以前のバージョン用の暗黙的な"read_only" ClickHouse設定。非常に古いClickHouseバージョンと連携するために、ClickHouseの"read_only"値に合わせて設定できます                                                                  |
| use_protocol_version    | True    | True, False             | クライアントプロトコルバージョンを使用します。これが必要なのはDateTimeタイムゾーンクラムですが、現在のchproxyのバージョンでは壊れます                                                                                                                                  |
| max_error_size          | 1024    |                         | クライアントエラーメッセージに返される最大文字数。この設定のために0を設定することで、完全なClickHouseエラーメッセージを得ることができます。デフォルトは1024文字です。                                                                                  |
| send_os_user            | True    | True, False             | ClickHouseに送信されるクライアント情報に検出されたオペレーティングシステムユーザーを含めます（HTTP User-Agent文字列）                                                                                                                                                  |
| http_buffer_size        | 10MB    |                         | HTTPストリーミングクエリのために使用される「メモリ内」バッファのサイズ（バイト単位）                                                                                                                                                                                     |
### Compression {#compression}

ClickHouse Connectは、クエリ結果と挿入の両方のためのlz4、zstd、brotli、gzip圧縮をサポートしています。圧縮を使用することは通常、ネットワーク帯域幅/転送速度とCPU使用率（クライアントとサーバの両方）とのトレードオフを伴うことを常に念頭に置いてください。

圧縮されたデータを受け取るためには、ClickHouseサーバの`enable_http_compression`を1に設定する必要があります。または、ユーザーは「クエリごと」の基準で設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client`ファクトリメソッドを呼び出す際の`compress`パラメータで制御されます。デフォルトでは、`compress`は`True`に設定されており、これがデフォルトの圧縮設定をトリガーします。`query`、`query_np`、および`query_df`クライアントメソッドで実行されたクエリに対して、ClickHouse Connectは`Accept-Encoding`ヘッダーを追加し、`lz4`、`zstd`、`br`（brotli、brotliライブラリがインストールされている場合）、`gzip`、および`deflate`エンコーディングを`query`クライアントメソッドで直接実行します（そして間接的に、`query_np`および`query_df`）。 （ほとんどのリクエストの場合、ClickHouseサーバは`zstd`で圧縮されたペイロードを返します。）挿入に関しては、デフォルトでClickHouse Connectは挿入ブロックを`lz4`圧縮で圧縮し、`Content-Encoding: lz4` HTTPヘッダーを送信します。

`get_client`の`compress`パラメータも、`lz4`、`zstd`、`br`、または`gzip`のいずれか特定の圧縮メソッドに設定できます。そのメソッドは、挿入とクエリ結果の両方に使用されます（ClickHouseサーバがサポートする場合）。 必要な`zstd`および`lz4`圧縮ライブラリは現在ClickHouse Connectにデフォルトでインストールされています。`br`/brotliが指定された場合、brotliライブラリは別途インストールする必要があります。

`raw*`クライアントメソッドはクライアント設定で指定された圧縮を使用しないことに注意してください。

`gzip`圧縮の使用は推奨されません。なぜなら、データの圧縮と解凍の両方で代替手段に比べて著しく遅いためです。
### HTTP proxy support {#http-proxy-support}

ClickHouse Connectは、`urllib`3`ライブラリを使用して基本的なHTTPプロキシサポートを追加します。標準の`HTTP_PROXY`および`HTTPS_PROXY`環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client`メソッドで作成されたクライアントに適用されます。別の方法として、各クライアントに対して構成するには、`get_client`メソッドの`http_proxy`または`https_proxy`引数を使用できます。HTTPプロキシサポートの実装に関する詳細は、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies)のドキュメントを参照してください。

Socksプロキシを使用するには、`urllib3`のSOCKSProxyManagerを`get_client`の`pool_mgr`引数として送信できます。これは、PySocksライブラリを直接インストールするか、`urllib3`の依存関係に対して`[socks]`オプションを使用することを必要とします。
### "Old" JSON data type {#old-json-data-type}

実験的な`Object`（または`Object('json')`）データ型は非推奨であり、本番環境での使用は避けるべきです。ClickHouse Connectは後方互換性のためにこのデータ型に対する制限されたサポートを提供し続けています。ただし、このサポートには、辞書や等価物として返される「トップレベル」または「親」JSON値を期待するクエリは含まれておらず、そのようなクエリは例外を引き起こします。
### "New" Variant/Dynamic/JSON datatypes (experimental feature) {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0リリースから、`clickhouse-connect`は新しい（実験的な）ClickHouse型であるVariant、Dynamic、JSONのサポートを提供します。
#### Usage notes {#usage-notes}
- JSONデータは、Python辞書またはJSONオブジェクト`{}`を含むJSON文字列として挿入できます。他の形式のJSONデータはサポートされていません。
- これらの型のためのサブカラム/パスを使用するクエリは、サブカラムの型を返します。
- その他の使用ノートについては、主要なClickHouseドキュメントを参照してください。
#### Known limitations {#known-limitations}
- これらの型は使用する前にClickHouse設定で有効にする必要があります。
- 「新しい」JSON型はClickHouse 24.8リリースから利用可能です。
- 内部フォーマットの変更により、`clickhouse-connect`はClickHouse 24.7リリース以降のVariant型とのみ互換性があります。
- 返されたJSONオブジェクトは、`max_dynamic_paths`数の要素のみを返します（デフォルトは1024）。これは将来のリリースで修正される予定です。
- `Dynamic`カラムへの挿入は常にPython値の文字列表現となります。これは、https://github.com/ClickHouse/ClickHouse/issues/70395が修正されると、将来のリリースで修正される予定です。
- 新しい型の実装はCコードで最適化されていないため、パフォーマンスは単純で確立されたデータ型よりもやや遅くなるかもしれません。
