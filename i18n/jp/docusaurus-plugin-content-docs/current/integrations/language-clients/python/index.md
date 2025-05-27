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
'description': 'The ClickHouse Connect project suite for connecting Python to ClickHouse'
'title': 'Python Integration with ClickHouse Connect'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Python Integration with ClickHouse Connect
## Introduction {#introduction}

ClickHouse Connectは、広範囲なPythonアプリケーションとの相互運用性を提供するコアデータベースドライバです。

- 主なインターフェースは、パッケージ `clickhouse_connect.driver` にある `Client` オブジェクトです。このコアパッケージには、ClickHouseサーバと通信するためのさまざまなヘルパークラスやユーティリティ関数、そして挿入および選択クエリの高度な管理のための「context」実装が含まれています。
- `clickhouse_connect.datatypes` パッケージは、すべての非実験的なClickHouseデータ型の基本実装とサブクラスを提供します。その主な機能は、ClickHouseのデータをClickHouseの「ネイティブ」バイナリ列形式にシリアル化および逆シリアル化することです。この形式は、ClickHouseとクライアントアプリケーション間での効率的なデータ転送を実現します。
- `clickhouse_connect.cdriver` パッケージのCython/Cクラスは、最も一般的なシリアル化および逆シリアル化を最適化し、純粋なPythonよりも大幅にパフォーマンスを向上させます。
- パッケージ `clickhouse_connect.cc_sqlalchemy` には、`datatypes` および `dbi` パッケージに基づいて構築された制限付きの [SQLAlchemy](https://www.sqlalchemy.org/) ダイアレクトがあります。この制限された実装は、クエリ/カーソル機能に焦点を当てており、一般的にはSQLAlchemy DDLおよびORM操作をサポートしません。（SQLAlchemyはOLTPデータベースを対象としており、ClickHouseのOLAP指向データベースを管理するためには、より専門的なツールとフレームワークを推奨します。）
- コアドライバとClickHouse Connect SQLAlchemy実装は、ClickHouseをApache Supersetに接続するための推奨方法です。`ClickHouse Connect` データベース接続または `clickhousedb` SQLAlchemyダイアレクト接続文字列を使用してください。

このドキュメントは、ベータリリース0.8.2の時点において最新のものです。

:::note
公式のClickHouse Connect Pythonドライバは、ClickHouseサーバーとの通信にHTTPプロトコルを使用しています。これには、柔軟性の向上、HTTPバランサのサポート、JDBCベースのツールとの互換性向上などの利点があり、一方で、圧縮やパフォーマンスがわずかに低下することや、ネイティブTCPプロトコルの一部の複雑な機能がサポートされていないなどの欠点があります。一部のユースケースでは、ネイティブTCPプロトコルを使用する[Community Python drivers](/interfaces/third-party/client-libraries.md)の使用を検討することができます。
:::
### Requirements and Compatibility {#requirements-and-compatibility}

|    Python |   |       Platform¹ |   | ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |
|----------:|:--|----------------:|:--|-----------:|:---|------------:|:--|----------------:|:--|
| 2.x, &lt;3.8 | ❌ |     Linux (x86) | ✅ |     &lt;24.3³ | 🟡 |        &lt;1.3 | ❌ |            &lt;1.4 | ❌ |
|     3.8.x | ✅ | Linux (Aarch64) | ✅ |     24.3.x | ✅  |       1.3.x | ✅ |           1.4.x | ✅ |
|     3.9.x | ✅ |     macOS (x86) | ✅ | 24.4-24.6³ | 🟡 |       1.4.x | ✅ |           1.5.x | ✅ |
|    3.10.x | ✅ |     macOS (ARM) | ✅ |     24.7.x | ✅  |       >=2.x | ❌ |           2.0.x | ✅ |
|    3.11.x | ✅ |         Windows | ✅ |     24.8.x | ✅  |             |   |           2.1.x | ✅ |
|    3.12.x | ✅ |                 |   |     24.9.x | ✅  |             |   |           3.0.x | ✅ |

¹ClickHouse Connectは、リストされたプラットフォームに対して明示的にテストされています。さらに、優れた [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) プロジェクトに対して、すべてのアーキテクチャに対する未テストのバイナリホイール（C最適化）も構築されています。最後に、ClickHouse Connectは純粋なPythonとしても動作できるため、ソースインストールは最近のPythonインストールでも機能するはずです。

²SQLAlchemyのサポートは主にクエリ機能に限られています。完全なSQLAlchemy APIはサポートされていません。

³ClickHouse Connectは、現在サポートされているすべてのClickHouseバージョンに対してテストされています。HTTPプロトコルを使用しているため、ほとんどのその他のClickHouseバージョンでも正常に動作するはずですが、特定の高度なデータ型に対していくつかの不整合があるかもしれません。
### Installation {#installation}

PyPIからpipを使用してClickHouse Connectをインストールします：

`pip install clickhouse-connect`

ClickHouse Connectはソースからもインストールできます：
* [GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-connect)を`git clone`します。
* （オプション）C/Cythonの最適化をビルドして有効にするために、`pip install cython`を実行します。
* プロジェクトのルートディレクトリに`cd`し、`pip install .`を実行します。
### Support Policy {#support-policy}

ClickHouse Connectは現在ベータ版であり、現在のベータリリースのみが積極的にサポートされています。問題を報告する前に、最新のバージョンに更新してください。問題は[GitHubプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)に提出してください。ClickHouse Connectの将来のリリースは、リリース時点でアクティブにサポートされているClickHouseバージョンと互換性があることが保証されています（通常、最新の3つの `stable` と2つの最新の `lts` リリース）。
### Basic Usage {#basic-usage}
### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />
#### Establish a connection {#establish-a-connection}

ClickHouseへの接続には2つの例が示されています：
- localhostでのClickHouseサーバーへの接続。
- ClickHouse Cloudサービスへの接続。
##### Use a ClickHouse Connect client instance to connect to a ClickHouse server on localhost: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### Use a ClickHouse Connect client instance to connect to a ClickHouse Cloud service: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
前に収集した接続詳細を使用してください。ClickHouse CloudサービスではTLSが必要なため、ポート8443を使用します。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### Interact with your database {#interact-with-your-database}

ClickHouse SQLコマンドを実行するには、クライアントの`command` メソッドを使用します：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、クライアントの`insert` メソッドを使用して、行と値の二次元配列を指定します：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQLを使用してデータを取得するには、クライアントの`query` メソッドを使用します：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse Connect Driver API {#clickhouse-connect-driver-api}

***Note:*** ほとんどのAPIメソッドはオプション引数が多くあるため、キーワード引数を渡すことを推奨します。

*ここに文書化されていないメソッドはAPIの一部とは見なされず、削除または変更される可能性があります。*
### Client Initialization {#client-initialization}

`clickhouse_connect.driver.client` クラスは、PythonアプリケーションとClickHouseデータベースサーバー間の主なインターフェースを提供します。`clickhouse_connect.get_client` 関数を使用してClientインスタンスを取得し、以下の引数を受け取ります：
#### Connection Arguments {#connection-arguments}

| Parameter             | Type        | Default                       | Description                                                                                                                                                                                                                                            |
|-----------------------|-------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str         | http                          | httpまたはhttpsである必要があります。                                                                                                                                                                                                                                  |
| host                  | str         | localhost                     | ClickHouseサーバーのホスト名またはIPアドレス。設定しない場合、`localhost` が使用されます。                                                                                                                                                                   |
| port                  | int         | 8123または8443                | ClickHouseのHTTPまたはHTTPSポート。設定しない場合は8123にデフォルト設定され、*secure*=*True*または*interface*=*https*の場合は8443に設定されます。                                                                                                      |
| username              | str         | default                       | ClickHouseユーザー名。設定しない場合、`default`のClickHouseユーザーが使用されます。                                                                                                                                                                       |
| password              | str         | *&lt;空文字列&gt;*         | *username* のパスワード。                                                                                                                                                                                                                                  |
| database              | str         | *None*                        | 接続のデフォルトデータベース。設定しない場合、ClickHouse Connectは*username* に対してデフォルトのデータベースを使用します。                                                                                                                               |
| secure                | bool        | False                         | https/TLSを使用します。これにより、インターフェースまたはポート引数からの推測値が上書きされます。                                                                                                                                                         |
| dsn                   | str         | *None*                        | 標準DSN（データソース名）形式の文字列。この文字列から他の接続値（ホストやユーザーなど）が抽出されます。                                                                                                                        |
| compress              | bool or str | True                          | ClickHouseのHTTP挿入およびクエリ結果に対して圧縮を有効にします。[追加オプション（圧縮）](#compression)を参照してください。                                                                                                                               |
| query_limit           | int         | 0（無制限）                   | 任意の`query`応答に対して返される最大行数。この値をゼロに設定すると無制限の行が返されます。大きなクエリ制限は、結果がストリームされない場合、すべての結果が一度にメモリに読み込まれるため、メモリエラーが発生する可能性があります。                      |
| query_retries         | int         | 2                             | `query`リクエストの最大再試行回数。再試行可能なHTTP応答のみが再試行されます。`command`または`insert`リクエストは、意図しない重複リクエストを防ぐために自動的には再試行されません。                                                        |
| connect_timeout       | int         | 10                            | HTTP接続のタイムアウト（秒）。                                                                                                                                                                                                                                |
| send_receive_timeout  | int         | 300                           | HTTP接続の送受信タイムアウト（秒）。                                                                                                                                                                                                                          |
| client_name           | str         | *None*                        | HTTPユーザーエージェントヘッダーに付加されるclient_name。この設定を使用してClickHouseのsystem.query_logでクライアントクエリを追跡します。                                                                                                                              |
| pool_mgr              | obj         | *&lt;デフォルトのPoolManager&gt;* | 使用する`urllib3`ライブラリのPoolManager。異なるホストに対する複数の接続プールが必要な高度なユースケース向け。                                                                                                                                                 |
| http_proxy            | str         | *None*                        | HTTPプロキシアドレス（HTTP_PROXY環境変数を設定するのと同等）。                                                                                                                                                                                            |
| https_proxy           | str         | *None*                        | HTTPSプロキシアドレス（HTTPS_PROXY環境変数を設定するのと同等）。                                                                                                                                                                                         |
| apply_server_timezone | bool        | True                          | タイムゾーンに対応したクエリ結果にサーバーのタイムゾーンを使用します。[タイムゾーンの優先順位](#time-zones)を参照してください。                                                                                                                |
#### HTTPS/TLS Arguments {#httpstls-arguments}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLSを使用している場合にClickHouseサーバーTLS/SSL証明書を検証します（ホスト名、有効期限など）。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True*の場合、ClickHouseサーバー証明書を検証するための認証局のルートを含むファイルパス（.pem形式）。verifyがFalseの場合は無視されます。これが不要なのはClickHouseサーバー証明書がオペレーティングシステムによって確認されたグローバルに信頼されたルートである場合です。 |
| client_cert      | str  | *None*  | TLSクライアント証明書のファイルパス（.pem形式、相互TLS認証用）。ファイルには、中間証明書を含む完全な証明書チェーンが含まれている必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書のプライベートキーのファイルパス。プライベートキーがクライアント証明書のキー・ファイルに含まれていない場合は必要です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS証明書のCNまたはSNIで識別されたClickHouseサーバーのホスト名。これを設定すると、異なるホスト名でプロキシやトンネルを介して接続する際のSSLエラーを回避できます。                                                                                          |
| tls_mode         | str  | *None*  | 高度なTLS動作を制御します。`proxy`および `strict` はClickHouseの相互TLS接続を呼び出しませんが、クライアント証明書とキーを送信します。`mutual`はClickHouse相互TLS認証をクライアント証明書で前提とします。 *None* /デフォルト動作は`mutual`です。                               |
#### Settings Argument {#settings-argument}

最後に、`get_client`への`settings`引数は、各クライアントリクエストのために追加のClickHouse設定をサーバーに渡すために使用されます。一般的に、*readonly*=*1* アクセスを持つユーザーはクエリと共に送信された設定を変更できないため、ClickHouse Connectはそのような設定を最終リクエストで削除し、警告をログに記録します。以下の設定は、ClickHouse Connectによって使用されるHTTPクエリ/セッションにのみ適用され、一般的なClickHouse設定として文書化されていません。

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | HTTPチャネルに書き込む前にClickHouseサーバーによって使用されるバッファサイズ（バイト）。                                                                             |
| session_id        | サーバー上で関連するクエリを関連付けるための一意のセッションID。一時テーブルには必須です。                                                                   |
| compress          | ClickHouseサーバーがPOSTレスポンスデータを圧縮するかどうか。これは「生」クエリに対してのみ使用する必要があります。                                        |
| decompress        | ClickHouseサーバーに送信されたデータが逆シリアル化されるべきかどうか。この設定は「生」挿入に対してのみ使用する必要があります。                                          |
| quota_key         | このリクエストに関連付けられているクォータキー。クォータに関するClickHouseサーバーのドキュメントを参照してください。                                                                  |
| session_check     | セッションの状態を確認するために使用されます。                                                                                                                                |
| session_timeout   | セッションIDで識別されたセッションがタイムアウトし、もはや有効と見なされなくなるまでの非アクティブ状態の秒数。デフォルトは60秒です。                  |
| wait_end_of_query | ClickHouseサーバー上の応答全体をバッファする。この設定はサマリー情報を返すために必要であり、非ストリーミングクエリに対して自動的に設定されます。 |

各クエリと共に送信される他のClickHouse設定については、[ClickHouseのドキュメント](/operations/settings/settings.md)を参照してください。
#### Client Creation Examples {#client-creation-examples}

- 引数なしで、ClickHouse Connectクライアントは`localhost`のデフォルトHTTPポートにデフォルトユーザー（パスワードなし）で接続します：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- セキュア（https）な外部ClickHouseサーバーへの接続

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- セッションIDやその他のカスタム接続パラメータ、ClickHouse設定を使用した接続。

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
### Common Method Arguments {#common-method-arguments}

いくつかのクライアントメソッドは、共通の`parameters`および`settings`引数のいずれかまたは両方を使用します。これらのキーワード引数は以下に説明します。
#### Parameters Argument {#parameters-argument}

ClickHouse Connect Clientの`query*`および`command`メソッドは、ClickHouseの値式にPython式をバインドするためにオプションの`parameters`キーワード引数を受け取ります。バインディングには2種類あります。
##### Server Side Binding {#server-side-binding}

ClickHouseはほとんどのクエリ値に対して[サーバー側のバインディング](/interfaces/cli.md#cli-queries-with-parameters)をサポートしており、バインドされた値はクエリとは別にHTTPクエリパラメータとして送信されます。ClickHouse Connectは、`{&lt;name&gt;:&lt;datatype&gt;}`の形式のバインディング式を検出した場合、適切なクエリパラメータを追加します。サーバー側のバインディングでは、`parameters`引数はPythonの辞書である必要があります。

- Python辞書、DateTime値、文字列値を用いたサーバー側のバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# サーバー上で以下のクエリが生成されます

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- サーバー側のバインディングはClickHouseサーバーによって`SELECT`クエリのみにサポートされています。`ALTER`、`DELETE`、`INSERT`、または他の種類のクエリには機能しません。将来的に変更される可能性がありますので、https://github.com/ClickHouse/ClickHouse/issues/42092を参照してください。
##### Client Side Binding {#client-side-binding}

ClickHouse Connectはまた、クライアント側のパラメータバインディングもサポートし、テンプレート化されたSQLクエリ生成での柔軟性を高めることができます。クライアント側のバインディングでは、`parameters`引数は辞書またはシーケンスである必要があります。クライアント側のバインディングは、パラメータの置き換えにPythonの["printf"スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)の文字列整形を使用します。

サーバー側のバインディングとは異なり、クライアント側のバインディングは、データベース識別子（データベース、テーブル、カラム名など）には機能しません。Python式整形は異なるタイプの文字列を区別できないため、これらは異なる形で整形する必要があります（データベース識別子にはバックティックまたは二重引用符、データ値には単一引用符を使用します）。

- Python辞書、DateTime値、および文字列エスケープの例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# 以下のクエリが生成されます：

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- Pythonシーケンス（タプル）、Float64、およびIPv4アドレスの例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# 以下のクエリが生成されます：

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''
```

:::note
DateTime64引数をバインドする（サブ秒精度を持つClickHouseタイプ）には、次の2つのカスタムアプローチのいずれかが必要です：
- Pythonの`datetime.datetime`値を新しいDT64Paramクラスでラップする。
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書を使用したサーバー側のバインディング
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストを使用したクライアント側のバインディング 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - パラメータ名の末尾に`_64`を付加して辞書のパラメータ値を使用する場合
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書を使用したサーバー側のバインディング
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::
#### Settings Argument {#settings-argument-1}

すべての主要なClickHouse Connect Clientの「insert」と「select」メソッドは、含まれるSQLステートメントに対してClickHouseサーバーの[ユーザー設定](/operations/settings/settings.md)を渡すためのオプションの`settings`キーワード引数を受け取ります。`settings`引数は辞書でなければなりません。各アイテムはClickHouse設定名とその関連値でなければなりません。値は、クエリパラメータとしてサーバーに送信される際に文字列に変換されます。

クライアントレベルの設定と同様に、ClickHouse Connectはサーバーによって*readonly*=*1*とマークされた設定を削除し、関連するログメッセージを記録します。ClickHouse HTTPインターフェースを介ってのクエリにのみ適用される設定は常に有効です。これらの設定は、`get_client` [API](#settings-argument)の下で説明されています。

ClickHouse設定を使用する例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### Client _command_ Method {#client-_command_-method}

`Client.command`メソッドを使用して、通常はデータを返さないか、単一のプリミティブまたは配列値を返すClickHouseサーバーにSQLクエリを送信します。このメソッドは以下のパラメータを取ります：

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *必須*      | 単一の値または単一行の値を返すClickHouse SQLステートメント。                                                                                                      |                                                                                                                                                                                                                                                                              |
| parameters    | dict or iterable | *None*     | [parametersの説明](#parameters-argument)を参照してください。                                                                                                   |
| data          | str or bytes     | *None*     | POSTボディとしてコマンドに含めるオプションデータ。                                                                                                           |
| settings      | dict             | *None*     | [settingsの説明](#settings-argument)を参照してください。                                                                                                       |
| use_database  | bool             | True       | クライアントデータベースを使用します（クライアント作成時に指定）。Falseの場合、接続ユーザーのためにデフォルトのClickHouseサーバーデータベースが使用されます。 |
| external_data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。詳細は[高度なクエリ（外部データ）](#external-data)を参照してください。                          |

- `_command_`はDDL文にも使用できます。SQL "コマンド" がデータを返さない場合、"query summary" 辞書が代わりに返されます。この辞書は、ClickHouseのX-ClickHouse-SummaryおよびX-ClickHouse-Query-Idヘッダーをカプセル化しており、`written_rows`、`written_bytes`、`query_id`のキー/値ペアを含みます。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- `_command_`は、単一行のみを返す簡単なクエリにも使用できます。

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### Client _query_ メソッド {#client-_query_-method}

`Client.query` メソッドは、ClickHouse Server から単一の「バッチ」データセットを取得する主な方法です。このメソッドは、HTTP 経由でネイティブ ClickHouse フォーマットを利用して大規模なデータセット（約 100 万行まで）を効率的に送信します。このメソッドは次のパラメータを受け取ります。

| パラメータ           | 型               | デフォルト    | 説明                                                                                                                                                                 |
|---------------------|------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必須*       | ClickHouse SQL SELECT または DESCRIBE クエリ。                                                                                                                            |
| parameters          | dict or iterable | *なし*       | [パラメータの説明](#parameters-argument)を参照してください。                                                                                                            |
| settings            | dict             | *なし*       | [設定の説明](#settings-argument)を参照してください。                                                                                                                  |
| query_formats       | dict             | *なし*       | 結果値のデータ型フォーマット仕様。詳細については、Advanced Usage (Read Formats) を参照してください。                                                                          |
| column_formats      | dict             | *なし*       | カラムごとのデータ型フォーマット。詳細については、Advanced Usage (Read Formats) を参照してください。                                                                              |
| encoding            | str              | *なし*       | ClickHouse String カラムを Python 文字列にエンコードするために使用されるエンコーディング。設定しない場合、Python は `UTF-8` をデフォルトで使用します。                                    |
| use_none            | bool             | True          | ClickHouse の null に対して Python の *None* 型を使用します。False の場合、ClickHouse の null に対してデフォルトのデータ型（例えば 0）を使用します。NumPy/Pandas の場合、性能の理由からデフォルトは False に設定されています。 |
| column_oriented     | bool             | False         | 結果を行のシーケンスではなく、カラムのシーケンスとして返します。Python データを他の列指向データ形式に変換するのに役立ちます。                                                    |
| query_tz            | str              | *なし*       | `zoneinfo` データベースのタイムゾーン名。このタイムゾーンは、クエリによって返されるすべての datetime または Pandas Timestamp オブジェクトに適用されます。                                   |
| column_tzs          | dict             | *なし*       | カラム名とタイムゾーン名の辞書。`query_tz` のように、異なるカラムに異なるタイムゾーンを指定することができます。                                                          |
| use_extended_dtypes | bool             | True          | Pandas の拡張データ型（例えば StringArray）や ClickHouse の NULL 値に対して pandas.NA および pandas.NaT を使用します。これは `query_df` および `query_df_stream` メソッドにのみ適用されます。              |
| external_data       | ExternalData     | *なし*       | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。詳細については、[Advanced Queries (External Data)](#external-data)を参照してください。                                   |
| context             | QueryContext     | *なし*       | 上記のメソッド引数をカプセル化するために使用できる再利用可能な QueryContext オブジェクト。[Advanced Queries (QueryContexts)](#querycontexts)を参照してください。                                     |

#### QueryResult オブジェクト {#the-queryresult-object}

基本の `query` メソッドは、次の公開プロパティを持つ QueryResult オブジェクトを返します。

- `result_rows` -- 行のシーケンスの形式で返されたデータのマトリクス。各行要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスの形式で返されたデータのマトリクス。各カラム要素は、そのカラムの行値のシーケンスです。
- `column_names` -- `result_set` 内のカラム名を表す文字列のタプル。
- `column_types` -- `result_columns` 内の各カラムに対する ClickHouse 型を表す ClickHouseType インスタンスのタプル。
- `query_id` -- ClickHouseの query_id（`system.query_log` テーブルでクエリを調査するのに便利）。
- `summary` -- `X-ClickHouse-Summary` HTTP レスポンスヘッダーによって返されたデータ。
- `first_item` -- レスポンスの最初の行を辞書として取得するための便利なプロパティ（キーはカラム名です）。
- `first_row` -- 結果の最初の行を返す便利なプロパティ。
- `column_block_stream` -- カラム指向形式でのクエリ結果のジェネレーター。このプロパティは直接参照するべきではありません（下記参照）。
- `row_block_stream` -- 行指向形式でのクエリ結果のジェネレーター。このプロパティは直接参照するべきではありません（下記参照）。
- `rows_stream` -- 呼び出しごとに単一の行を生成するクエリ結果のジェネレーター。このプロパティは直接参照するべきではありません（下記参照）。
- `summary` -- `command` メソッドの下で説明される ClickHouse によって返されたサマリー情報の辞書。

`*_stream` プロパティは、返されたデータのイテレータとして使用できる Python コンテキストを返します。これらは、Client の `*_stream` メソッドを通じて間接的にアクセスすべきです。

クエリ結果のストリーミングの完全な詳細（StreamContext オブジェクトを使用）は、[Advanced Queries (Streaming Queries)](#streaming-queries) に詳述されています。

### NumPy、Pandas または Arrow でのクエリ結果の消費 {#consuming-query-results-with-numpy-pandas-or-arrow}

メインの `query` メソッドには、3つの特殊化バージョンがあります。

- `query_np` -- このバージョンは、ClickHouse Connect QueryResult の代わりに NumPy Array を返します。
- `query_df` -- このバージョンは、ClickHouse Connect QueryResult の代わりに Pandas Dataframe を返します。
- `query_arrow` -- このバージョンは、PyArrow テーブルを返します。ClickHouse の `Arrow` フォーマットを直接利用しているため、メインの `query` メソッドと共通して受け付ける引数は `query`、`parameters`、`settings` の3つです。さらに、Arrow テーブルが ClickHouse の String 型を文字列（True の場合）またはバイト（False の場合）としてレンダリングするかどうかを決定する追加の引数 `use_strings` があります。

### Client ストリーミングクエリメソッド {#client-streaming-query-methods}

ClickHouse Connect Client は、データをストリームとして取得するための複数のメソッドを提供します（Python ジェネレーターとして実装されています）。

- `query_column_block_stream` -- ネイティブ Python オブジェクトを使用したカラムのシーケンスとしてクエリデータをブロックで返します。
- `query_row_block_stream` -- ネイティブ Python オブジェクトを使用した行のブロックとしてクエリデータを返します。
- `query_rows_stream` -- ネイティブ Python オブジェクトを使用した行のシーケンスとしてクエリデータを返します。
- `query_np_stream` -- 各 ClickHouse ブロックのクエリデータを NumPy 配列として返します。
- `query_df_stream` -- 各 ClickHouse ブロックのクエリデータを Pandas Dataframe として返します。
- `query_arrow_stream` -- PyArrow RecordBlocks でクエリデータを返します。

これらの各メソッドは、ストリームの消費を開始するために `with` ステートメントを使用して開く必要のある `ContextStream` オブジェクトを返します。詳細と例については、[Advanced Queries (Streaming Queries)](#streaming-queries) を参照してください。

### Client _insert_ メソッド {#client-_insert_-method}

ClickHouse に複数のレコードを挿入する一般的なユースケースのために `Client.insert` メソッドがあります。このメソッドは次のパラメータを受け取ります。

| パラメータ         | 型                              | デフォルト    | 説明                                                                                                                                                                      |
|-------------------|-----------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *必須*       | 挿入先の ClickHouse テーブル。完全なテーブル名（データベースを含む）を指定できます。                                                                                      |
| data              | Sequence of Sequences             | *必須*       | 挿入するデータのマトリクス。各行がカラム値のシーケンスである行のシーケンス、または各カラムが行値のシーケンスであるカラムのシーケンスのいずれかです。                                   |
| column_names      | Sequence of str, or str           | '*'           | データマトリクスのカラム名のリスト。`'*'` を使用すると、ClickHouse Connect がテーブルのすべてのカラム名を取得する「プレクエリ」を実行します。                               |
| database          | str                               | ''            | 挿入の対象データベース。指定しない場合、クライアントのデータベースが使用されます。                                                                                      |
| column_types      | Sequence of ClickHouseType        | *なし*       | ClickHouseType インスタンスのリスト。`column_types` または `column_type_names` のいずれも指定しない場合、ClickHouse Connect がテーブルのすべてのカラム型を取得する「プレクエリ」を実行します。         |
| column_type_names | Sequence of ClickHouse type names | *なし*       | ClickHouse データ型名のリスト。`column_types` または `column_type_names` のいずれも指定しない場合、ClickHouse Connect がテーブルのすべてのカラム型を取得する「プレクエリ」を実行します。    |
| column_oriented   | bool                              | False         | True の場合、`data` 引数はカラムのシーケンスであると見なされ（データを挿入するために「ピボット」を行う必要はありません）、それ以外は `data` は行のシーケンスとして解釈されます。                      |
| settings          | dict                              | *なし*       | [設定の説明](#settings-argument)を参照してください。                                                                                                                        |
| insert_context    | InsertContext                     | *なし*       | 上記のメソッド引数をカプセル化するために使用できる再利用可能な InsertContext オブジェクト。[Advanced Inserts (InsertContexts)](#insertcontexts)を参照してください。                         |

このメソッドは、「クエリサマリー」辞書を返します。挿入が何らかの理由で失敗した場合、例外が発生します。

メインの `insert` メソッドの特殊化バージョンが2つあります。

- `insert_df` -- Python の Sequences of Sequences `data` 引数の代わりに、このメソッドの2番目のパラメータは Pandas Dataframe インスタンスである必要がある `df` 引数を要求します。ClickHouse Connect は Dataframe をカラム指向のデータソースとして自動的に処理するため、`column_oriented` パラメータは必要ありませんし、利用可能でもありません。
- `insert_arrow` -- Python の Sequences of Sequences `data` 引数の代わりに、このメソッドは `arrow_table` を要求します。ClickHouse Connect は Arrow テーブルを変更せずに ClickHouse サーバーに渡して処理するため、`database` と `settings` 引数は `table` と `arrow_table` に加えて利用可能です。

*注意:* NumPy 配列は有効な Sequences of Sequences であり、メインの `insert` メソッドの `data` 引数として使用できるため、特殊なメソッドは必要ありません。

### ファイル挿入 {#file-inserts}

`clickhouse_connect.driver.tools` には、ファイルシステムから既存の ClickHouse テーブルに直接データを挿入する `insert_file` メソッドが含まれています。解析は ClickHouse サーバーに委任されます。`insert_file` は次のパラメータを受け取ります。

| パラメータ    | 型            | デフォルト           | 説明                                                                                                                                      |
|--------------|----------------|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| client       | Client         | *必須*             | 挿入を実行するために使用する `driver.Client`                                                                                              |
| table        | str            | *必須*             | 挿入先の ClickHouse テーブル。完全なテーブル名（データベースを含む）も指定できます。                                                        |
| file_path    | str            | *必須*             | データファイルへのネイティブファイルシステムパス                                                                                         |
| fmt          | str            | CSV, CSVWithNames   | ファイルの ClickHouse 入力フォーマット。`column_names` が指定されていない場合は CSVWithNames が暗黙的に仮定されます。                               |
| column_names | Sequence of str | *なし*             | データファイル内のカラム名のリスト。カラム名を含むフォーマットには必要ありません。                                                                |
| database     | str            | *なし*             | テーブルのデータベース。テーブルが完全に指定されている場合は無視されます。指定されていない場合、挿入はクライアントデータベースを使用します。             |
| settings     | dict           | *なし*             | [設定の説明](#settings-argument)を参照してください。                                                                                        |
| compression  | str            | *なし*             | Content-Encoding HTTP ヘッダーに使用される認識された ClickHouse 圧縮タイプ（zstd、lz4、gzip）。                                                 |

不一致なデータや異常なフォーマットの日付/時間の値を持つファイルの場合、データインポートに適用される設定（`input_format_allow_errors_num` や `input_format_allow_errors_num` など）がこのメソッドで認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

### クエリ結果をファイルとして保存する {#saving-query-results-as-files}

クエリの結果を CSV ファイルに保存したい場合、`raw_stream` メソッドを使用して ClickHouse からローカルファイルシステムにファイルをストリーミングすることができます。例えば、以下のコードスニペットを使用できます。

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

上記のコードは、次の内容を持つ `output.csv` ファイルを生成します。

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats#tabseparated) や他のフォーマットでデータを保存することもできます。利用可能なすべてのフォーマットオプションの概要については、[Input and Output Data のフォーマット](/interfaces/formats) を参照してください。

### Raw API {#raw-api}

ClickHouse データとネイティブまたはサードパーティデータ型および構造の間での変換を必要としないユースケース向けに、ClickHouse Connect クライアントは ClickHouse 接続の直接使用のための 2 つのメソッドを提供します。

#### Client _raw_query_ メソッド {#client-_raw_query_-method}

`Client.raw_query` メソッドは、クライアント接続を使用して ClickHouse HTTP クエリインターフェイスを直接使用することを可能にします。返り値は未処理の `bytes` オブジェクトです。パラメータバインディング、エラーハンドリング、リトライ、および設定管理を最小限のインターフェースで行うための便利なラッパーを提供します。

| パラメータ     | 型             | デフォルト    | 説明                                                                                                                                            |
|---------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *必須*       | 有効な ClickHouse クエリ                                                                                                                        |
| parameters    | dict or iterable | *なし*       | [パラメータの説明](#parameters-argument)を参照してください。                                                                                      |
| settings      | dict             | *なし*       | [設定の説明](#settings-argument)を参照してください。                                                                                           |                                                                                                                                                |
| fmt           | str              | *なし*       | 結果のバイト用の ClickHouse 出力フォーマット。（指定しない場合、ClickHouse は TSV を使用します）                                                              |
| use_database  | bool             | True         | クエリコンテキストのために clickhouse-connect クライアントで割り当てられたデータベースを使用します。                                                   |
| external_data | ExternalData     | *なし*       | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。詳細については、[Advanced Queries (External Data)](#external-data)を参照してください。   |

結果の `bytes` オブジェクトの管理は呼び出し元の責任です。`Client.query_arrow` は、このメソッドをクリックハウスの `Arrow` 出力フォーマットを使用してラップしたものであることに注意してください。

#### Client _raw_stream_ メソッド {#client-_raw_stream_-method}

`Client.raw_stream` メソッドは `raw_query` メソッドと同じ API を持っていますが、`bytes` オブジェクトのジェネレーター/ストリームソースとして使用できる `io.IOBase` オブジェクトを返します。これは現在 `query_arrow_stream` メソッドによって利用されています。

#### Client _raw_insert_ メソッド {#client-_raw_insert_-method}

`Client.raw_insert` メソッドは、クライアント接続を使用して `bytes` オブジェクトまたは `bytes` オブジェクトジェネレーターを直接挿入できるようにします。挿入ペイロードを処理しないため、非常に高いパフォーマンスを実現しています。このメソッドは、設定と挿入形式を指定するためのオプションを提供します。

| パラメータ    | 型                                   | デフォルト    | 説明                                                                                                                             |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------|
| table        | str                                    | *必須*       | シンプルまたはデータベース修飾されたテーブル名                                                                                         |
| column_names | Sequence[str]                          | *なし*       | 挿入ブロックのためのカラム名。`fmt` パラメータに名前が含まれていない場合、必須です                                                       |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *必須*       | 挿入するデータ。文字列はクライアントエンコーディングでエンコードされます。                                                         |
| settings     | dict                                   | *なし*       | [設定の説明](#settings-argument)を参照してください。                                                                                     |                                                                                                                                                |
| fmt          | str                                    | *なし*       | `insert_block` バイトの ClickHouse 入力フォーマット。（指定しない場合、ClickHouse は TSV を使用します）                        |

`insert_block` が指定されたフォーマットと圧縮方式を使用していることは、呼び出し元の責任です。ClickHouse Connect はファイルアップロードや PyArrow テーブルのためにこれらの生挿入を使用し、解析は ClickHouse サーバーに委任しています。

### ユーティリティクラスと関数 {#utility-classes-and-functions}

次のクラスと関数も「公開」`clickhouse-connect` APIの一部と見なされ、上記に文書化されたクラスとメソッドと同様にマイナーリリース間で安定しています。これらのクラスと関数への破壊的変更は、マイナーリリース（パッチリリースではない）でのみ発生し、少なくとも 1 回のマイナーリリースで非推奨の状態で利用可能です。

#### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0 仕様で定義されたものを含む）は、`clickhouse_connect.driver.exceptions` モジュールで定義されています。実際にドライバーによって検出された例外は、これらの型のいずれかを使用します。

#### Clickhouse SQL ユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュール内の関数および DT64Param クラスを使用して、ClickHouse SQL クエリを適切に構築しエスケープできます。同様に、`clickhouse_connect.driver.parser` モジュール内の関数を使用して ClickHouse データ型名を解析できます。

### マルチスレッド、マルチプロセス、非同期/イベント駆動型ユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect はマルチスレッド、マルチプロセス、イベントループ駆動型/非同期アプリケーションでうまく機能します。すべてのクエリおよび挿入処理は単一のスレッド内で行われるため、オペレーションは一般的にスレッドセーフです。 （低レベルでの一部のオペレーションの並列処理は、単一スレッドのパフォーマンスペナルティを克服するための将来の改善の可能性がありますが、その場合でもスレッドの安全性は維持されます。）

各クエリまたは挿入がそれぞれ独自の QueryContext または InsertContext オブジェクト内に状態を維持するため、これらのヘルパーオブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有するべきではありません。コンテキストオブジェクトに関する追加の議論は、次のセクションで行います。

さらに、同時に「進行中」の2つ以上のクエリおよび/または挿入があるアプリケーションの場合、以下の2つの考慮事項があります。最初は、クエリ/挿入に関連付けられた ClickHouse「セッション」であり、2つ目は、ClickHouse Connect Client インスタンスによって使用される HTTP 接続プールです。

### AsyncClient ラッパー {#asyncclient-wrapper}

0.7.16 以降、ClickHouse Connect は通常の `Client` の非同期ラッパーを提供し、`asyncio` 環境でクライアントを使用できるようにしました。

`AsyncClient` のインスタンスを取得するには、標準の `get_client` と同じパラメータを受け付ける `get_async_client` ファクトリ関数を使用できます。

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` は、標準の `Client` と同じメソッドとパラメータを持っていますが、適用可能な場合はコルーチンです。内部的には、I/O 操作を実行する `Client` のこれらのメソッドは、[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 呼び出しでラップされています。

I/O 操作が完了するのを待っている間に実行スレッドと GIL が解放されるため、`AsyncClient` ラッパーを使用することでマルチスレッドパフォーマンスが向上します。

注意: 通常の `Client` とは異なり、`AsyncClient` はデフォルトで `autogenerate_session_id` を `False` に設定します。

詳しくは: [run_async の例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)を参照してください。

### ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

各 ClickHouse クエリは ClickHouse の「セッション」のコンテキスト内で発生します。セッションは現在、2つの目的に使用されています。

- 複数のクエリに特定の ClickHouse 設定を関連付けるため（[ユーザー設定](/operations/settings/settings.md)を参照）。ClickHouse の `SET` コマンドを使用して、ユーザーセッションのスコープに設定を変更できます。
- [一時テーブル](/sql-reference/statements/create/table#temporary-tables)を追跡します。

デフォルトでは、ClickHouse Connect クライアントインスタンスで実行される各クエリは、セッション機能を有効にするために同じセッション ID を使用します。つまり、`SET` 文や一時テーブルは、単一の ClickHouse クライアントを使用している場合に予想どおりに機能します。ただし、設計上、ClickHouse サーバーは同じセッション内での同時クエリを許可していません。この結果、同時にクエリを実行する ClickHouse Connect アプリケーションには 2 つのオプションがあります。

- 各実行スレッド（スレッド、プロセス、またはイベントハンドラー）ごとに別の `Client` インスタンスを作成し、それぞれが独自のセッション ID を持つようにします。これが一般に最良のアプローチであり、各クライアントのセッション状態を保持します。
- 各クエリにユニークなセッション ID を使用します。これは、一時テーブルや共有セッション設定が必要ない状況で同時セッションの問題を回避します。（共有設定はクライアント作成時に提供することもできますが、これらは各リクエストと共に送信され、セッションに関連付けられません）。ユニークな session_id は、各リクエストの `settings` 辞書に追加できるか、`autogenerate_session_id` 共通設定を無効にすることができます。

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # クライアントを作成する前に常に設定してください
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

この場合、ClickHouse Connect はセッション ID を送信せず、ClickHouse サーバーによってランダムなセッション ID が生成されます。再度、一時テーブルとセッションレベル設定は利用できません。

### HTTP 接続プールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connect は、サーバーへの基礎となる HTTP 接続を処理するために `urllib3` 接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスは同じ接続プールを共有し、これはほとんどのユースケースに十分です。このデフォルトプールは、アプリケーションによって使用される各 ClickHouse サーバーに最大 8 の HTTP Keep Alive 接続を維持します。

大規模なマルチスレッドアプリケーションには、別々の接続プールが適切な場合があります。カスタマイズされた接続プールは、メインの `clickhouse_connect.get_client` 関数の `pool_mgr` キーワード引数として提供できます。

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例のように、クライアントはプールマネージャを共有することも、各クライアントのために別々のプールマネージャを作成することもできます。プールマネージャの作成時に利用可能なオプションの詳細については、[`urllib3` ドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。

## ClickHouse Connect でのデータクエリ: 高度な使用法 {#querying-data-with-clickhouse-connect--advanced-usage}

### QueryContexts {#querycontexts}

ClickHouse Connect は標準クエリを QueryContext 内で実行します。QueryContext には、ClickHouse データベースに対してクエリを構築するために使用される主要な構造体と、クエリ結果を QueryResult またはその他の応答データ構造に変換するために使用される設定が含まれています。これには、クエリ自体、パラメータ、設定、読み取りフォーマット、およびその他の属性が含まれます。

QueryContext は、クライアントの `create_query_context` メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメータを受け取ります。このクエリコンテキストは、他のすべての引数の代わりに`context` キーワード引数として `query`、`query_df`、または `query_np` メソッドに渡すことができます。メソッド呼び出しに指定された追加の引数は、QueryContext のプロパティをオーバーライドします。

QueryContext の明確なユースケースは、異なるバインディングパラメータ値で同じクエリを送信することです。すべてのパラメータ値は、辞書を持って `QueryContext.set_parameters` メソッドを呼び出すことで更新できます。または、`key` と `value` のペアで `QueryContext.set_parameter` を呼び出すことで、単一の値を更新できます。

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

QueryContexts はスレッドセーフではないことに注意してください。ただし、`QueryContext.updated_copy` メソッドを呼び出すことで、マルチスレッド環境でコピーを取得できます。

### ストリーミングクエリ {#streaming-queries}
#### Data Blocks {#data-blocks}
ClickHouse Connect は、すべてのデータを ClickHouse サーバーから受け取るブロックのストリームとして、主な `query` メソッドから処理します。これらのブロックは、ClickHouse との間でカスタム「ネイティブ」形式で送信されます。「ブロック」とは、バイナリデータのカラムのシーケンスに過ぎず、各カラムには指定されたデータ型のデータ値が同数含まれています。（列指向データベースである ClickHouse は、このデータを同様の形で保存します。）クエリから返されるブロックのサイズは、いくつかのレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定できる 2 つのユーザー設定によって制御されます。それらは次のとおりです：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行数におけるブロックサイズの制限。デフォルトは 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- バイト単位のソフトリミット。デフォルトは 1,000,0000。

`preferred_block_size_setting` に関係なく、各ブロックは `max_block_size` 行を超えることはありません。クエリのタイプに応じて、実際に返されるブロックは任意のサイズになる可能性があります。例えば、多くのシャードをカバーする分散テーブルへのクエリは、各シャードから直接取得された小さなブロックを含む場合があります。

Client `query_*_stream` メソッドのいずれかを使用するとき、結果はブロックごとに返されます。ClickHouse Connect は一度に1つのブロックだけを読み込みます。これにより、大きな結果セットのすべてをメモリに読み込むことなく、大量のデータを処理できます。アプリケーションは、任意の数のブロックを処理する準備が必要であり、各ブロックの正確なサイズを制御することはできません。

#### HTTP Data Buffer for Slow Processing {#http-data-buffer-for-slow-processing}

HTTP プロトコルの制限により、ブロックが ClickHouse サーバーがデータをストリーミングしている速度よりもかなり遅い速度で処理されると、ClickHouse サーバーは接続を閉じ、結果として処理スレッドで例外がスローされます。これの一部は、一般的な `http_buffer_size` 設定を使用して、HTTP ストリーミングバッファのバッファサイズを増やすことで軽減できます（デフォルトは 10 メガバイト）。十分なメモリがアプリケーションに割り当てられている場合、大きな `http_buffer_size` 値は問題ありません。バッファ内のデータは、`lz4` または `zstd` 圧縮を使用して圧縮されているため、これらの圧縮形式を使用することで、全体のバッファが増加します。

#### StreamContexts {#streamcontexts}

各 `query_*_stream` メソッド（例えば `query_row_block_stream`）は、ClickHouse の `StreamContext` オブジェクトを返します。これは、Python のコンテキスト／ジェネレーターを組み合わせたものです。基本的な使用法は次の通りです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <データに対して何かをする>
```

`with` ステートメントなしで StreamContext を使用しようとするとエラーが発生することに注意してください。Python コンテキストの使用は、ストリーム（この場合、ストリーミング HTTP レスポンス）が完全に消費されない場合や処理中に例外が発生する場合でも、適切に閉じられることを保証します。また、StreamContexts は、ストリームを消費するために一度だけ使用することができます。Exit した後に StreamContext を使用しようとすると `StreamClosedError` が発生します。

StreamContext の `source` プロパティを使用すると、カラム名と型を含む親 `QueryResult` オブジェクトにアクセスできます。

#### Stream Types {#stream-types}

`query_column_block_stream` メソッドは、ブロックをネイティブ Python データ型として保存されたカラムデータのシーケンスとして返します。上記の `taxi_trips` クエリを使用すると、返されるデータはリストで、それぞれのリストの要素は関連するカラムのすべてのデータを含む別のリスト（またはタプル）になります。したがって、`block[0]` は文字列のみを含むタプルになります。カラム指向の形式は、カラム内のすべての値に対して集計操作を行うために最もよく使用されます。

`query_row_block_stream` メソッドは、従来のリレーショナルデータベースのように、行のシーケンスとしてブロックを返します。タクシーの旅行の場合、返されるデータはリストであり、それぞれのリストの要素はデータの行を表す別のリストになります。したがって、`block[0]` には最初のタクシー旅行のすべてのフィールド（順番通り）が含まれ、`block[1]` には2番目のタクシー旅行のすべてのフィールドの行が含まれます。行指向の結果は通常、表示または変換プロセスに使用されます。

`query_row_stream` は、ストリームを反復処理する際に自動的に次のブロックに移動する便利なメソッドです。それ以外は、`query_row_block_stream` と同じです。

`query_np_stream` メソッドは、各ブロックを二次元 NumPy 配列として返します。内部的に NumPy 配列は（通常）カラムとして保存されるため、明示的な行またはカラムメソッドは必要ありません。NumPy 配列の「形状」は (カラム, 行) として表現されます。NumPy ライブラリは、NumPy 配列を操作するための多くのメソッドを提供します。すべてのカラムが同じ NumPy dtype を共有している場合、返された NumPy 配列も単一の dtype となり、内部構造を変更することなく再形成／回転が可能です。

`query_df_stream` メソッドは、各 ClickHouse ブロックを二次元 Pandas Dataframe として返します。次の例は、StreamContext オブジェクトが遅延的にコンテキストとして使用できることを示しています（ただし、一度だけ）。

最後に、`query_arrow_stream` メソッドは、ClickHouse の `ArrowStream` 形式の結果を pyarrow.ipc.RecordBatchStreamReader として StreamContext にラップして返します。ストリームの各反復は、PyArrow RecordBlock を返します。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <pandas DataFrame に対して何かをする>
```

### Read Formats {#read-formats}

読み取り形式は、クライアント `query`、`query_np`、および `query_df` メソッドから返される値のデータ型を制御します。（`raw_query` と `query_arrow` は、ClickHouse からの受信データを変更しないため、形式制御は適用されません。）例えば、UUID の読み取り形式がデフォルトの `native` 形式から代替の `string` 形式に変更されると、ClickHouse の `UUID` カラムのクエリが Python の UUID オブジェクトではなく、文字列値（標準の 8-4-4-4-12 RFC 1422 形式）として返されます。

任意のフォーマット関数の「データ型」引数にはワイルドカードを含めることができます。形式は単一の小文字の文字列です。

読み取り形式は、いくつかのレベルで設定できます：

- グローバルに、`clickhouse_connect.datatypes.format` パッケージに定義されたメソッドを使用して。これにより、すべてのクエリに対して構成されたデータ型の形式が制御されます。
```python
from clickhouse_connect.datatypes.format import set_read_format


# IPv6 と IPv4 の値を文字列として返す
set_read_format('IPv*', 'string')


# すべての Date 型を基礎となるエポック秒またはエポック日として返す
set_read_format('Date*', 'int')
```
- 全体のクエリについて、オプションの `query_formats` 辞書引数を使用して。この場合、指定されたデータ型の任意のカラム（またはサブカラム）は、構成された形式を使用します。
```python

# すべての UUID カラムを文字列として返す
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 特定のカラムの値について、オプションの `column_formats` 辞書引数を使用することもできます。キーは ClickHouse によって返されるカラム名で、データカラムや ClickHouse の型名およびクエリ形式の値の二次元の「フォーマット」辞書の形式を指定します。この二次元辞書は、タプルやマップのようなネスト型にも使用できます。
```python

# `dev_address` カラムの IPv6 値を文字列として返す
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

#### Read Format Options (Python Types) {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type    | Read Formats | Comments                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | Superset は現在、大きな符号なし UInt64 値を処理していません                                                          |
| [U]Int[128,256]       | int                   | string       | Pandas および NumPy の int 値は最大 64 ビットまでなので、これらは文字列として返される可能性があります                            |
| Float32               | float                 | -            | すべての Python float は内部的に 64 ビットです                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | bytes        | ClickHouse の String カラムには固有のエンコーディングはないため、可変長のバイナリデータにも使用されます                     |
| FixedString           | bytes                 | string       | FixedStrings は固定サイズのバイト配列ですが、時々 Python の文字列として扱われます                                    |
| Enum[8,16]            | string                | string, int  | Python の enum は空文字列を受け付けないので、すべての enum は文字列または基になる int 値のいずれかとして表示されます。          |
| Date                  | datetime.date         | int          | ClickHouse は、日付を 1970 年 01 月 01 日からの日数として保存します。この値は int として利用可能です                     |
| Date32                | datetime.date         | int          | Date と同様ですが、より広範囲の日付用です                                                                               |
| DateTime              | datetime.datetime     | int          | ClickHouse は DateTime をエポック秒で保存します。この値は int として利用可能です                                       |
| DateTime64            | datetime.datetime     | int          | Python の datetime.datetime はマイクロ秒の精度に限定されています。生の 64 ビット int 値が利用可能です                   |
| IPv4                  | `ipaddress.IPv4Address` | string       | IP アドレスは文字列として読み取り、適切にフォーマットされた文字列は IP アドレスとして挿入できます                      |
| IPv6                  | `ipaddress.IPv6Address` | string       | IP アドレスは文字列として読み取り、適切にフォーマットされた文字列は IP アドレスとして挿入できます                      |
| Tuple                 | dict or tuple         | tuple, json  | 指名付きタプルはデフォルトでは辞書として返されます。指名付きタプルは JSON 文字列として返すこともできます              |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUID は RFC 4122 に従ってフォーマットされた文字列として読み取ることができます。                                          |
| JSON                  | dict                  | string       | デフォルトで Python 辞書が返されます。`string` 形式では JSON 文字列が返されます                                     |
| Variant               | object                | -            | 値に格納されている ClickHouse データ型に対する一致する Python 型を返します                                             |
| Dynamic               | object                | -            | 値に格納されている ClickHouse データ型に対する一致する Python 型を返します                                             |

### External Data {#external-data}

ClickHouse のクエリは、任意の ClickHouse 形式の外部データを受け入れることができます。このバイナリデータは、データの処理に使用されるクエリ文字列とともに送信されます。外部データ機能の詳細は [こちら](/engines/table-engines/special/external-data.md) です。クライアント `query*` メソッドは、これらの機能を利用するためのオプションの `external_data` パラメータを受け入れます。`external_data` パラメータの値は、`clickhouse_connect.driver.external.ExternalData` オブジェクトである必要があります。そのオブジェクトのコンストラクタは、次の引数を受け付けます：

| 名前         | 型                   | 説明                                                                                                                                     |
|--------------|----------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| file_path    | str                  | 外部データを読むためのローカルシステムパスにあるファイルのパス。`file_path` か `data` のどちらかが必要です                             | 
| file_name    | str                  | 外部データ「ファイル」の名前。提供されない場合は、`file_path` から決定されます（拡張子なし）                                            |
| data         | bytes                | ファイルからではなく、バイナリ形式での外部データ。この場合は、`data` か `file_path` のどちらかが必要です                               |
| fmt          | str                  | データの ClickHouse [Input Format](/sql-reference/formats.mdx)。デフォルトは `TSV`                                                       |
| types        | str または seq of str| 外部データのカラムデータ型のリスト。文字列の場合はコンマで区切ります。`types` または `structure` のどちらかが必要です                   |
| structure    | str または seq of str| データ内のカラム名 + データ型のリスト（例を参照）。 `structure` または `types` のどちらかが必要です                                     |
| mime_type    | str                  | ファイルデータのオプション MIME タイプ。現在 ClickHouse はこの HTTP サブヘッダーを無視します                                        |

外部 CSV ファイルに「映画」データを含め、ClickHouse サーバーに既に存在する `directors` テーブルとそのデータを結合してクエリを送信するには、次のようにします：

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

初期の ExternalData オブジェクトに追加の外部データファイルを追加するには、コンストラクタと同じパラメータを受け付ける `add_file` メソッドを使用します。HTTP の場合、すべての外部データは `multi-part/form-data` ファイルのアップロードの一部として送信されます。

### Time Zones {#time-zones}
ClickHouse DateTime および DateTime64 値にタイムゾーンを適用するための複数のメカニズムがあります。内部的に、ClickHouse サーバーは、任意の DateTime または DateTime64 オブジェクトをエポック（1970 年 01 月 01 日 00:00:00 UTC 時間）以降の秒を表すタイムゾーンナイーブな数として常に保存します。DateTime64 値の場合、表現は精度に応じてエポック以降のミリ秒、マイクロ秒、またはナノ秒になります。そのため、任意のタイムゾーン情報の適用は常にクライアント側で発生します。これは意味のある追加の計算を伴うため、パフォーマンスが重要なアプリケーションでは、ユーザー表示または変換（例えば、Pandas Timestamps は、パフォーマンスを向上させるために常にエポックナノ秒を表す 64 ビット整数として扱われる際を除いて）を除き、DateTime 型をエポック タイムスタンプとして扱うことが推奨されます。

クエリ中にタイムゾーンを意識したデータ型（特に Python `datetime.datetime` オブジェクト）を使用すると、`clickhouse-connect` は次の優先ルールを使用してクライアント側のタイムゾーンを適用します：

1. クエリのために指定された `client_tzs` クエリメソッドパラメータが指定された場合は、特定のカラムのタイムゾーンが適用されます。
2. ClickHouse カラムにタイムゾーンメタデータがある場合（つまり、`DateTime64(3, 'America/Denver')` のような型）、ClickHouse カラムのタイムゾーンが適用されます。（このクリックハウスのカラムのタイムゾーンメタデータは、ClickHouse バージョン 23.2 より前の DateTime カラムに対しては clickhouse-connect に対しては利用できません。）
3. クエリメソッドパラメータ `query_tz` が指定されたクエリには、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションに適用されるタイムゾーン設定がある場合には、そのタイムゾーンが適用されます。（この機能はまだ ClickHouse サーバーにリリースされていません。）
5. 最後に、クライアントの `apply_server_timezone` パラメータが True に設定されている場合（デフォルトの場合）、ClickHouse サーバーのタイムゾーンが適用されます。

これらのルールに基づいて適用されたタイムゾーンが UTC の場合、`clickhouse-connect` は常にタイムゾーンナイーブな Python `datetime.datetime` オブジェクトを返します。その後、このタイムゾーンナイーブなオブジェクトに任意で追加のタイムゾーン情報をアプリケーションコードによって追加することができます。

## Inserting Data with ClickHouse Connect:  Advanced Usage {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connect は、すべての挿入を InsertContext 内で実行します。InsertContext には、クライアント `insert` メソッドに送信されたすべての値が引数として含まれます。さらに、InsertContext がもともと構築される際に、ClickHouse Connect はネイティブ形式の挿入を効率的に行うために必要な挿入カラムのデータ型を取得します。InsertContext を複数の挿入に再利用することで、この「事前クエリ」を回避し、より迅速かつ効率的に挿入が実行されます。

InsertContext は、クライアント `create_insert_context` メソッドを使用して取得できます。このメソッドは、`insert` 関数と同じ引数を取ります。再利用のために InsertContexts の `data` プロパティだけを変更することに注意してください。これは新しいデータの同じテーブルへの繰り返し挿入のために再利用可能なオブジェクトを提供する目的と一致しています。

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

InsertContexts には、挿入プロセス中に更新される可変状態が含まれているため、スレッドセーフではありません。

### Write Formats {#write-formats}
書き込み形式は、現在限られた数の型に対して実装されています。ほとんどの場合、ClickHouse Connect は、最初の（非 null）データ値の型を確認することで列に対する適切な書き込み形式を自動的に決定しようとします。たとえば、DateTime カラムに挿入する際に、カラムの最初の挿入値が Python の整数である場合、ClickHouse Connect は、その整数値がエポック秒であると仮定して直接整数値を挿入します。

ほとんどの場合、データ型の書き込み形式をオーバーライドする必要はありませんが、`clickhouse_connect.datatypes.format` パッケージの関連メソッドを使用してグローバルレベルで行うことができます。

#### Write Format Options {#write-format-options}

| ClickHouse Type       | Native Python Type    | Write Formats | Comments                                                                                                    |
|-----------------------|-----------------------|---------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                             |
| UInt64                | int                   |               |                                                                                                             |
| [U]Int[128,256]       | int                   |               |                                                                                                             |
| Float32               | float                 |               |                                                                                                             |
| Float64               | float                 |               |                                                                                                             |
| Decimal               | decimal.Decimal       |               |                                                                                                             |
| String                | string                |               |                                                                                                             |
| FixedString           | bytes                 | string        | 文字列として挿入される場合、追加のバイトはゼロに設定されます                                                       |
| Enum[8,16]            | string                |               |                                                                                                             |
| Date                  | datetime.date         | int           | ClickHouse は日付を 1970 年 01 月 01 日からの日数として保存します。int 型はこの「エポック日付」値であると見なされます|
| Date32                | datetime.date         | int           | Date と同様ですが、より広範囲の日付用です                                                                |
| DateTime              | datetime.datetime     | int           | ClickHouse は DateTime をエポック秒で保存します。int 型はこの「エポック秒」の値であると見なされます |
| DateTime64            | datetime.datetime     | int           | Python の datetime.datetime はマイクロ秒の精度に限定されています。生の 64 ビット int 値が利用可能です         |
| IPv4                  | `ipaddress.IPv4Address` | string        | 適切にフォーマットされた文字列は IPv4 アドレスとして挿入できます                                            |
| IPv6                  | `ipaddress.IPv6Address` | string        | 適切にフォーマットされた文字列は IPv6 アドレスとして挿入できます                                            |
| Tuple                 | dict or tuple         |               |                                                                                                             |
| Map                   | dict                  |               |                                                                                                             |
| Nested                | Sequence[dict]        |               |                                                                                                             |
| UUID                  | uuid.UUID             | string        | 適切にフォーマットされた文字列は ClickHouse UUID として挿入できます                                          |
| JSON/Object('json')   | dict                  | string        | 辞書または JSON 文字列が JSON カラムに挿入できます（注意：`Object('json')` は非推奨）                        |
| Variant               | object                |               | 現在すべてのバリアントは文字列として挿入され、ClickHouse サーバーによって解析されます                          |
| Dynamic               | object                |               | 警告：現在 Dynamic カラムへの挿入は ClickHouse String として保存されます                                       |

## Additional Options {#additional-options}

ClickHouse Connect は、高度なユースケースに対する追加のオプションを多数提供します。

### Global Settings {#global-settings}

ClickHouse Connect の動作をグローバルに制御する少しの設定があります。これらは、最上位 `common` パッケージからアクセスされます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの共通設定 `autogenerate_session_id`、`product_name`、および `readonly` は、`clickhouse_connect.get_client` メソッドを使ってクライアントを作成する前に必ず変更されるべきです。クライアント作成後にこれらの設定を変更しても、既存のクライアントの動作には影響しません。
:::

現在、10 のグローバル設定が定義されています：

| Setting Name            | Default | Options                 | Description                                                                                                                                                                                                                                                   |
|-------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | 各クライアントセッションのための新しい UUID(1) セッション ID を自動生成します（提供されていない場合）。セッション ID が提供されない場合（クライアントまたはクエリレベルのいずれかで）、ClickHouse は各クエリのためのランダムな内部 ID を生成します。                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 無効または読み取り専用の設定が提供された場合（クライアントセッションまたはクエリのいずれかに対して）、どのアクションを取るか。`drop` の場合、その設定は無視され、`send` の場合は設定が ClickHouse に送信され、`error` の場合はクライアント側で ProgrammingError がスローされます。|
| dict_parameter_format   | 'json'  | 'json', 'map'           | これは、パラメータ化されたクエリが Python 辞書を JSON 形式または ClickHouse マップ構文に変換するかを制御します。`json` は JSON カラムへの挿入のために使用され、`map` は ClickHouse マップカラムのために使用されます。                                   |
| product_name            |         |                         | ClickHouse にクエリを渡す際に、ClickHouse Connect を使用するアプリを追跡するために渡される文字列。形式は &lt;product name;&gl/&lt;product version&gt; にするべきです。                                                                    |
| max_connection_age      | 600     |                         | HTTP Keep Alive 接続が開かれて再利用される最大秒数。この設定により、負荷分散装置/プロキシの背後にある単一の ClickHouse ノードへの接続の束を防ぎます。デフォルトは 10 分です。                                                             |
| readonly                | 0       | 0, 1                    | 19.17 より前のバージョンに対する暗黙の「read_only」ClickHouse 設定。 ClickHouse の「read_only」値に一致させるために設定でき、非常に古い ClickHouse バージョンとの操作を許可します。                                                      |
| use_protocol_version    | True    | True, False             | クライアントプロトコルバージョンを使用します。これは DateTime タイムゾーンカラムに必要ですが、現在の chproxy のバージョンでは壊れます。                                                                                                      |
| max_error_size          | 1024    |                         | クライアントエラーメッセージで返される最大文字数。この設定を 0 にすると、完全な ClickHouse エラーメッセージが取得されます。デフォルトは 1024 文字です。                                                                                     |
| send_os_user            | True    | True, False             | ClickHouse に送信されるクライアント情報に検出されたオペレーティングシステムユーザーを含めます（HTTP User-Agent 文字列）。                                                                                                                |
| http_buffer_size        | 10MB    |                         | HTTP ストリーミングクエリ用の「メモリ内」バッファのサイズ（バイト単位）。                                                                                                                                                                                    |
### 圧縮 {#compression}

ClickHouse Connect は、クエリ結果とインサートの両方に対して lz4、zstd、brotli、gzip 圧縮をサポートしています。圧縮を使用することは、ネットワーク帯域幅/転送速度と CPU 使用率（クライアントおよびサーバーの両方）との間で通常トレードオフがあることを常に念頭に置いてください。

圧縮されたデータを受け取るには、ClickHouse サーバーの `enable_http_compression` を 1 に設定する必要があるか、ユーザーがクエリごとに設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client` ファクトリメソッドを呼び出す際の `compress` パラメータによって制御されます。デフォルトでは `compress` は `True` に設定されており、これによりデフォルトの圧縮設定がトリガーされます。`query`、`query_np`、`query_df` クライアントメソッドを使用して実行されたクエリに対して、ClickHouse Connect は `Accept-Encoding` ヘッダーに `lz4`、`zstd`、`br`（brotli、brotli ライブラリがインストールされている場合）、`gzip`、および `deflate` エンコーディングを追加します。 （ほとんどのリクエストに対して、ClickHouse サーバーは `zstd` 圧縮ペイロードで応答します。）インサートに関しては、デフォルトで ClickHouse Connect はインサートブロックを `lz4` 圧縮で圧縮し、`Content-Encoding: lz4` HTTP ヘッダーを送信します。

`get_client` の `compress` パラメータは、`lz4`、`zstd`、`br`、または `gzip` の特定の圧縮方法に設定することもできます。その方法は、インサートとクエリ結果の両方に使用されます（ClickHouse サーバーがサポートしている場合）。必要な `zstd` および `lz4` 圧縮ライブラリは、ClickHouse Connect のデフォルトでインストールされています。`br`/brotli が指定されている場合、brotli ライブラリは別途インストールする必要があります。

`raw*` クライアントメソッドは、クライアント設定によって指定された圧縮を使用しないことに注意してください。

また、データの圧縮と解凍の両方において、代替手段よりも大幅に遅くなるため、`gzip` 圧縮の使用は推奨されません。

### HTTP プロキシサポート {#http-proxy-support}

ClickHouse Connect は、`urllib3` ライブラリを使用して基本的な HTTP プロキシサポートを追加します。標準の `HTTP_PROXY` および `HTTPS_PROXY` 環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client` メソッドで作成された任意のクライアントに適用されます。代わりに、クライアントごとに構成する場合は、get_client メソッドの `http_proxy` または `https_proxy` 引数を使用できます。HTTP プロキシサポートの実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) ドキュメントを参照してください。

Socks プロキシを使用する場合は、`urllib3` SOCKSProxyManager を `get_client` の `pool_mgr` 引数として送信できます。この場合、PySocks ライブラリを直接インストールするか、`urllib3` 依存関係の `[socks]` オプションを使用する必要があります。

### "古い" JSON データ型 {#old-json-data-type}

実験的な `Object`（または `Object('json')`）データ型は非推奨であり、生産環境では避けるべきです。ClickHouse Connect は後方互換性のためにこのデータ型の制限されたサポートを提供し続けます。注意すべきことは、このサポートには、辞書やそれに相当するものとして「トップレベル」または「親」JSON 値を返すことが期待されるクエリが含まれておらず、そのようなクエリは例外を引き起こすことです。

### "新しい" Variant/Dynamic/JSON データ型（実験的機能） {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0 リリースから、`clickhouse-connect` は新しい（非実験的でもある）ClickHouse 型の Variant、Dynamic、JSON に対する実験的なサポートを提供します。

#### 使用上の注意 {#usage-notes}
- JSON データは、Python 辞書または JSON オブジェクト `{}` を含む JSON 文字列として挿入できます。他の形式の JSON データはサポートされていません。
- これらの型のサブカラム/パスを使用したクエリは、サブカラムの型を返します。
- 他の使用上の注意については、主な ClickHouse ドキュメントを参照してください。

#### 既知の制限事項: {#known-limitations}
- これらの型のそれぞれは、使用する前に ClickHouse 設定で有効にする必要があります。
- 「新しい」JSON 型は、ClickHouse 24.8 リリースから使用可能です。
- 内部フォーマットの変更により、`clickhouse-connect` は ClickHouse 24.7 リリースから始まる Variant 型とのみ互換性があります。
- 返された JSON オブジェクトは、`max_dynamic_paths` 数の要素のみを返します（デフォルトは 1024）。これは将来のリリースで修正されます。
- `Dynamic` カラムへのインサートは、Python 値の文字列表現となります。これは将来のリリースで修正される予定で、https://github.com/ClickHouse/ClickHouse/issues/70395 が修正された後に行われます。
- 新しい型の実装は C コードで最適化されていないため、従来のシンプルなデータ型よりも性能がわずかに遅くなる場合があります。
