---
sidebar_label: Python
sidebar_position: 10
keywords: [clickhouse, python, client, connect, integrate]
slug: /integrations/python
description: ClickHouseとPythonを接続するためのClickHouse Connectプロジェクトスイート
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# PythonとClickHouse Connectの統合

## はじめに {#introduction}

ClickHouse Connectは、幅広いPythonアプリケーションとの相互運用性を提供するコアデータベースドライバです。

- 主なインターフェースは、`clickhouse_connect.driver`パッケージ内の`Client`オブジェクトです。このコアパッケージには、ClickHouseサーバとの通信に使用されるさまざまなヘルパークラスやユーティリティ関数、挿入および選択クエリの高度な管理のための“context”実装も含まれています。
- `clickhouse_connect.datatypes`パッケージは、実験的でないすべてのClickHouseデータ型のベース実装およびサブクラスを提供しています。その主な機能は、ClickHouseデータをClickHouseの“Native”バイナリ列指向形式にシリアライズおよびデシリアライズすることにより、ClickHouseとクライアントアプリケーション間の最も効率的な輸送を実現することです。
- `clickhouse_connect.cdriver`パッケージ内のCython / Cクラスは、純粋なPythonよりも大幅なパフォーマンス向上のために、最も一般的なシリアリゼーションおよびデシリアリゼーションのいくつかを最適化します。
- `clickhouse_connect.cc_sqlalchemy`パッケージには制限された[SQLAlchemy](https://www.sqlalchemy.org/)方言が含まれており、`datatypes`と`dbi`パッケージに基づいて構築されています。この制限された実装は、クエリ/カーソル機能に焦点を当てており、一般的にはSQLAlchemy DDLおよびORM操作をサポートしていません。（SQLAlchemyはOLTPデータベースを対象としており、ClickHouseのOLAP指向データベースを管理するためには、より専門的なツールやフレームワークを推奨します。）
- コアドライバとClickHouse Connect SQLAlchemy実装は、ClickHouseをApache Supersetに接続するための推奨方法です。`ClickHouse Connect`データベース接続または`clickhousedb` SQLAlchemy方言接続文字列を使用してください。

このドキュメントは、ベータリリース0.8.2の時点での最新情報を反映しています。

:::note
公式のClickHouse Connect Pythonドライバは、ClickHouseサーバとの通信にHTTPプロトコルを使用します。それにはいくつかの利点（柔軟性の向上、HTTPバランサのサポート、JDBCベースのツールとのより良い互換性など）と不利な点（圧縮およびパフォーマンスがやや低下すること、ネイティブTCPベースのプロトコルの一部の複雑な機能がサポートされないことなど）が存在します。特定のユースケースにおいては、ネイティブTCPベースのプロトコルを使用する[コミュニティPythonドライバ](/interfaces/third-party/client-libraries.md)のいずれかの使用を検討してください。
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


¹ClickHouse Connectは、リストされているプラットフォームに対して明示的にテストされています。また、優れた[`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/)プロジェクトのためにすべてのアーキテクチャに対して未テストのバイナリホイール(C最適化付き)がビルドされています。最後に、ClickHouse Connectは純粋なPythonとしても実行可能なため、ソースインストールは最近のPythonインストールで動作するはずです。

²SQLAlchemyのサポートは、主にクエリ機能に制限されています。完全なSQLAlchemy APIはサポートされていません。

³ClickHouse Connectは、現在サポートされているすべてのClickHouseバージョンに対してテストされています。HTTPプロトコルを使用するため、ほとんどの他のバージョンのClickHouseでも正しく動作するはずですが、特定の高度なデータ型に関しては互換性の問題が発生する可能性があります。

### インストール {#installation}

PyPI経由でpipを使用してClickHouse Connectをインストールします：

`pip install clickhouse-connect`

ClickHouse Connectはソースからもインストールできます：
* [GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-connect)を`git clone`します。
* （オプション）C/Cython最適化を有効にするために`pip install cython`を実行します。
* プロジェクトルートディレクトリに`cd`し、`pip install .`を実行します。

### サポートポリシー {#support-policy}

ClickHouse Connectは現在ベータ版であり、現在のベータリリースのみが積極的にサポートされています。問題を報告する前に最新バージョンに更新してください。問題は[GitHubプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)に提出してください。ClickHouse Connectの将来のリリースは、リリース時にアクティブにサポートされているClickHouseバージョンと互換性があることが保証されています（一般的には最近の3つの`stable`と2つの最近の`lts`リリースを含む）。

### 基本的な使用法 {#basic-usage}

### 接続の詳細を収集する {#gather-your-connection-details}

<ConnectionDetails />

#### 接続を確立する {#establish-a-connection}

ClickHouseに接続するための2つの例が示されています：
- localhost上のClickHouseサーバに接続する。
- ClickHouse Cloudサービスに接続する。

##### localhost上のClickHouseサーバに接続するためにClickHouse Connectクライアントインスタンスを使用する： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

##### ClickHouse Cloudサービスに接続するためにClickHouse Connectクライアントインスタンスを使用する： {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
前に収集した接続の詳細を使用します。ClickHouse CloudサービスはTLSを必要とするため、ポート8443を使用します。
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

#### データベースと対話する {#interact-with-your-database}

ClickHouse SQLコマンドを実行するには、クライアントの`command`メソッドを使用します：

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、2次元配列の行と値を使用してクライアントの`insert`メソッドを使用します：

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQLを使用してデータを取得するには、クライアントの`query`メソッドを使用します：

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```


## ClickHouse ConnectドライバAPI {#clickhouse-connect-driver-api}

***注意:*** 引数の数が多く、ほとんどがオプションであるため、ほとんどのAPIメソッドではキーワード引数を使用することが推奨されます。

*ここに文書化されていないメソッドはAPIの一部とは見なされず、削除または変更される可能性があります。*

### クライアント初期化 {#client-initialization}

`clickhouse_connect.driver.client`クラスは、PythonアプリケーションとClickHouseデータベースサーバとの主なインターフェースを提供します。`clickhouse_connect.get_client`関数を使用して、次の引数を受け入れるClientインスタンスを取得します：

#### 接続引数 {#connection-arguments}

| パラメータ             | タイプ        | デフォルト                       | 説明                                                                                                                                                                                                                                            |
|-----------------------|-------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str         | http                          | httpまたはhttpsでなければなりません。                                                                                                                                                                                                                                 |
| host                  | str         | localhost                     | ClickHouseサーバのホスト名またはIPアドレスです。設定されていない場合は、`localhost`が使用されます。                                                                                                                                                            |
| port                  | int         | 8123または8443                  | ClickHouseのHTTPまたはHTTPSポートです。設定されていない場合は8123をデフォルトとして使用しますが、*secure*=*True*または*interface*=*https*の場合は8443になります。                                                                                                                              |
| username              | str         | default                       | ClickHouseのユーザー名です。設定されていない場合は、`default`のClickHouseユーザーが使用されます。                                                                                                                                                                      |
| password              | str         | *&lt;空文字列&gt;*        | *username*のパスワードです。                                                                                                                                                                                                                           |
| database              | str         | *None*                        | 接続のデフォルトデータベースです。設定されていない場合、ClickHouse Connectは*username*のデフォルトデータベースを使用します。                                                                                                                                  |
| secure                | bool        | False                         | https/TLSを使用します。これは、インターフェースまたはポート引数からの推測値を上書きします。                                                                                                                                                                   |
| dsn                   | str         | *None*                        | 標準DSN（データソース名）形式の文字列です。他の接続値（ホストやユーザーなど）が設定されていない場合、この文字列から抽出されます。                                                                                           |
| compress              | boolまたはstr | True                          | ClickHouse HTTP挿入およびクエリ結果の圧縮を有効にします。[追加オプション（圧縮）](#compression)を参照してください。                                                                                                                                 |
| query_limit           | int         | 0（無制限）                    | 任意の`query`応答に対して返される行の最大数です。これをゼロに設定すると無制限の行を返します。ただし、大きなクエリ制限は、結果がストリーミングされない場合にメモリ不足の例外を引き起こす可能性があるため注意が必要です。 |
| query_retries         | int         | 2                             | `query`リクエストの最大リトライ回数です。“retryable”なHTTPレスポンスのみがリトライされます。`command`または`insert`リクエストは、意図しない重複リクエストを防ぐために自動的にはリトライされません。                                 |
| connect_timeout       | int         | 10                            | HTTP接続タイムアウト（秒単位）。                                                                                                                                                                                                                    |
| send_receive_timeout  | int         | 300                           | HTTP接続の送信/受信タイムアウト（秒単位）。                                                                                                                                                                                               |
| client_name           | str         | *None*                        | HTTPユーザーエージェントヘッダーにプレフィックスされるclient_nameです。ClickHouseのsystem.query_log内でクエリを追跡するために設定します。                                                                                                                              |
| pool_mgr              | obj         | *&lt;デフォルトPoolManager&gt;* | 使用する`urllib3`ライブラリのPoolManagerです。複数の接続プールが異なるホストに必要な高度なユースケースの場合です。                                                                                                                             |
| http_proxy            | str         | *None*                        | HTTPプロキシアドレス（HTTP_PROXY環境変数を設定することに相当）。                                                                                                                                                                        |
| https_proxy           | str         | *None*                        | HTTPSプロキシアドレス（HTTPS_PROXY環境変数を設定することに相当）。                                                                                                                                                                      |
| apply_server_timezone | bool        | True                          | タイムゾーンに対応したクエリ結果のためにサーバのタイムゾーンを使用します。[タイムゾーンの優先順位](#time-zones)を参照してください。                                                                                                                                                          |

#### HTTPS/TLS引数 {#httpstls-arguments}

| パラメータ        | タイプ | デフォルト | 説明                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLSを使用する場合、ClickHouseサーバのTLS/SSL証明書（ホスト名、期限切れなど）を検証します。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True*の場合、-ClickHouseサーバの証明書を検証するための証明書機関（CA）のルートファイルパス（.pem形式）。verifyがFalseの場合は無視されます。これは、ClickHouseサーバの証明書がオペレーティングシステムによって検証されたグローバリに信頼されたルートである場合は必要ありません。 |
| client_cert      | str  | *None*  | TLSクライアント証明書のファイルパス（.pem形式、相互TLS認証用）。ファイルには、すべての中間証明書を含む完全な証明書チェーンが含まれている必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書のプライベートキーのファイルパス。クライアント証明書のキーにプライベートキーが含まれていない場合は必要です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS証明書のCNまたはSNIによって識別されるClickHouseサーバのホスト名。この設定により、異なるホスト名を持つプロキシやトンネルを通じて接続する際のSSLエラーを回避できます。                                                                                           |
| tls_mode         | str  | *None*  | 高度なTLS挙動を制御します。`proxy`および`strict`はClickHouseの相互TLS接続を呼び出さず、クライアント証明書およびキーを送信します。`mutual`はClickHouseの相互TLS認証をクライアント証明書で仮定します。*None*/デフォルトの挙動は`mutual`です。                               |

#### 設定引数 {#settings-argument}

最後に、`get_client`への`settings`引数は、各クライアントリクエストのためにサーバーに追加のClickHouse設定を渡すために使用されます。ほとんどのケースでは、*readonly*=*1*アクセスを持つユーザーはクエリで送信された設定を変更できないため、ClickHouse Connectはそのような設定を最終リクエストから削除し、警告をログに記録します。次の設定は、ClickHouse Connectによって使用されるHTTPクエリ/セッションのみに適用され、一般的なClickHouse設定としてはドキュメント化されていません。

| 設定               | 説明                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouseサーバがHTTPチャネルに書き込む前に使用するバッファサイズ（バイト単位）。                                                                             |
| session_id        | サーバ上で関連するクエリに関連付けるための一意のセッションID。一時テーブルには必要です。                                                                   |
| compress          | ClickHouseサーバがPOST応答データを圧縮すべきかどうか。この設定は「生」クエリにのみ使用されるべきです。                                        |
| decompress        | ClickHouseサーバに送信されるデータがデシリアライズされる必要があるかどうか。この設定は「生」挿入にのみ使用されるべきです。                                          |
| quota_key         | このリクエストに関連付けられたクォータキー。クォータに関するClickHouseサーバのドキュメントを参照してください。                                                                  |
| session_check     | セッションの状態を確認するために使用されます。                                                                                                                                |
| session_timeout   | セッションIDによって識別された動作が有効でなくなる前の非活動時間を秒単位で指定します。デフォルトは60秒です。                  |
| wait_end_of_query | ClickHouseサーバ上の全応答をバッファします。この設定はサマリー情報を返すために必要であり、ストリーミングされないクエリでは自動的に設定されます。 |

各クエリで送信できる他のClickHouse設定については、[ClickHouseドキュメント](https://clickhouse.com/docs/ja/operations/settings/settings)を参照してください。

#### クライアント作成例 {#client-creation-examples}

- パラメータなしで、ClickHouse Connectクライアントは、デフォルトのHTTPポートで`localhost`に接続し、デフォルトのユーザーおよびパスワードなしで接続します：

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- セキュア（https)な外部ClickHouseサーバに接続する：

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- セッションIDおよびその他のカスタム接続パラメータとClickHouse設定を使用して接続します。

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

複数のクライアントメソッドでは、共通の`parameters`および`settings`引数のいずれかまたは両方を使用します。これらのキーワード引数は、以下に説明されています。

#### パラメータ引数 {#parameters-argument}

ClickHouse Connectクライアントの`query*`および`command`メソッドは、ClickHouseの値の式にPythonの式をバインドするのに使用されるオプションの`parameters`キーワード引数を受け入れます。バインディングには2種類の方法があります。

##### サーバー側バインディング {#server-side-binding}

ClickHouseは、ほとんどのクエリ値に対して[サーバー側のバインディング](/interfaces/cli.md#cli-queries-with-parameters)をサポートしており、バインドされた値がクエリとは別にHTTPクエリパラメータとして送信されます。ClickHouse Connectは、`{&lt;name&gt;:&lt;datatype&gt;}`形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバー側バインディングでは、`parameters`引数はPython辞書である必要があります。

- Python辞書、DateTime値、文字列値を使用したサーバー側バインディング：

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)

# サーバー上で生成されるクエリ
# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- サーバー側バインディングは、ClickHouseサーバによって、`SELECT`クエリにのみサポートされています。`ALTER`、`DELETE`、`INSERT`、またはその他のタイプのクエリには機能しません。将来的には変更される可能性がありますので、https://github.com/ClickHouse/ClickHouse/issues/42092を参照してください。

##### クライアント側バインディング {#client-side-binding}

ClickHouse Connectはまた、クライアント側のパラメータバインディングもサポートしており、テンプレート化されたSQLクエリを生成する上での柔軟性を提供します。クライアント側バインディングでは、`parameters`引数は辞書または配列である必要があります。クライアント側バインディングは、Pythonの["printf"スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)文字列フォーマットをパラメータ置換のために使用します。

サーバー側バインディングとは異なり、クライアント側バインディングは、データベース識別子（データベース、テーブル、またはカラム名など）には機能しません。Pythonスタイルフォーマットでは異なる種類の文字列を区別できず、異なる形式（データベース識別子にはバックティックまたは二重引用符、データ値には単一引用符）でフォーマットする必要があります。

- Python辞書、DateTime値、文字列エスケープの例：

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)

# 生成されるクエリ：
# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- Pythonシーケンス（タプル）、Float64、およびIPv4アドレスの例：

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)

# 生成されるクエリ：
# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254'
```

:::note
DateTime64引数（サブ秒精度を持つClickHouse型）をバインドするには、次の2つのカスタムアプローチのいずれかが必要です。
- Pythonの`datetime.datetime`値を新しいDT64Paramクラスでラップします。例：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書でのサーバー側バインディング
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # クライアント側バインディングでのリスト 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - 値の辞書を使用する場合は、parameter名に文字列`_64`を追加します。
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書でのサーバー側バインディング
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::

#### 設定引数 {#settings-argument-1}

すべての主要なClickHouse Connectクライアントの“insert”および“select”メソッドは、含まれるSQLステートメントのためにClickHouseサーバの[ユーザー設定](/operations/settings/settings.md)を渡すためのオプションの`settings`キーワード引数を受け入れます。`settings`引数は辞書である必要があります。各アイテムはClickHouse設定名とその関連値である必要があります。値はクエリパラメータとしてサーバに送信される際に文字列に変換されます。

クライアントレベルの設定と同様に、ClickHouse Connectはサーバが*readonly*=*1*としてマークした設定を削除し、関連するログメッセージを記録します。ClickHouse HTTPインターフェース経由のクエリにのみ適用される設定は常に有効です。そのような設定は`get_client`[API](#settings-argument)の下で説明されています。

ClickHouse設定の使用例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```

### クライアント _command_ メソッド {#client-_command_-method}

`Client.command`メソッドを使用して、通常はデータを返さないか、単一のプリミティブまたは配列値を返すClickHouseサーバへのSQLクエリを送信します。このメソッドは次のパラメータを取ります：

| パラメータ     | タイプ             | デフォルト    | 説明                                                                                                                                                   |
|---------------|--------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str                | *必須* | 単一の値または単一の値の行を返すClickHouse SQLステートメント。                                                                             |                                                                                                                                                                                                                                                                              |
| parameters    | dict または iterable | *None*     | [パラメータの説明](#parameters-argument)を参照してください。                                                                                                           |
| data          | str または bytes   | *None*     | コマンドとともにPOSTボディとして含めるオプションのデータ。                                                                                                   |
| settings      | dict               | *None*     | [設定の説明](#settings-argument)を参照してください。                                                                                                               |
| use_database  | bool               | True       | クライアントデータベース（クライアント作成時に指定）を使用します。Falseは、コマンドが接続されているユーザーのデフォルトClickHouseサーバデータベースを使用することを意味します。 |
| external_data | ExternalData       | *None*     | クエリで使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。詳細は[高度なクエリ（外部データ）](#external-data)を参照してください。                          |

- _command_はDDLステートメントにも使用できます。もしSQL“コマンド”がデータを返さない場合、代わりに“クエリサマリー”辞書が返されます。この辞書はClickHouse X-ClickHouse-SummaryおよびX-ClickHouse-Query-Idヘッダーをカプセル化し、`written_rows`、`written_bytes`、および`query_id`のキー/値ペアを含みます。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_は単一の行だけを返すシンプルなクエリにも使用できます：

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```

### クライアント _query_ メソッド {#client-_query_-method}

`Client.query`メソッドは、ClickHouseサーバから単一の"バッチ"データセットを取得するための主な方法です。これは、HTTPを介してネイティブClickHouseフォーマットを利用して大規模データセット（約100万行まで）を効率的に送信します。このメソッドは次のパラメータを取ります。

| パラメータ           | タイプ             | デフォルト    | 説明                                                                                                                                                                        |
|---------------------|--------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

| query               | str              | *必須*     | ClickHouse SQLのSELECTまたはDESCRIBEクエリ。                                                                                                                                       |
| parameters          | dict or iterable | *なし*     | [parametersの説明](#parameters-argument)を参照してください。                                                                                                                                |
| settings            | dict             | *なし*     | [settingsの説明](#settings-argument)を参照してください。                                                                                                                                    |                                                                                                                                                |
| query_formats       | dict             | *なし*     | 結果値のデータ型フォーマット仕様。詳細は「Advanced Usage (Read Formats)」を参照してください。                                                                                             |
| column_formats      | dict             | *なし*     | カラムごとのデータ型フォーマット。詳細は「Advanced Usage (Read Formats)」を参照してください。                                                                                                                  |
| encoding            | str              | *なし*     | ClickHouseのStringカラムをPythonの文字列にエンコードするために使用されるエンコーディング。設定されていない場合、Pythonはデフォルトで`UTF-8`を使用します。                                                                     |
| use_none            | bool             | True       | ClickHouseのNULLに対してPythonの*None*型を使用します。Falseの場合、ClickHouseのNULLに対してデフォルトのデータ型（例えば0）を使用します。注意：パフォーマンス上の理由から、NumPy/PandasではデフォルトでFalseです。 |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなくカラムのシーケンスとして返します。Pythonデータを他の列指向データフォーマットに変換するのに便利です。                           |
| query_tz            | str              | *なし*     | `zoneinfo`データベースからのタイムゾーン名。このタイムゾーンは、クエリによって返されるすべてのdatetimeまたはPandas Timestampオブジェクトに適用されます。                                      |
| column_tzs          | dict             | *なし*     | カラム名とタイムゾーン名の辞書。`query_tz`のように動作しますが、異なるカラムに異なるタイムゾーンを指定できます。                                                   |
| use_extended_dtypes | bool             | True       | Pandasの拡張データ型（StringArrayなど）を使用し、ClickHouseのNULL値に対してpandas.NAおよびpandas.NaTを使用します。 `query_df`および`query_df_stream`メソッドにのみ適用されます。                  |
| external_data       | ExternalData     | *なし*     | クエリに使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。詳細は [Advanced Queries (External Data)](#external-data) を参照してください。                                               |
| context             | QueryContext     | *なし*     | 上記のメソッド引数をカプセル化するために再利用可能なQueryContextオブジェクトを使用できます。詳細は [Advanced Queries (QueryContexts)](#querycontexts) を参照してください。                                       |

#### QueryResultオブジェクト {#the-queryresult-object}

基本の`query`メソッドは、次の公開プロパティを持つQueryResultオブジェクトを返します。

- `result_rows` -- 行のシーケンスとして返されたデータのマトリックスであり、各行の要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスとして返されたデータのマトリックスであり、各カラムの要素はそのカラムの行値のシーケンスです。
- `column_names` -- `result_set`内のカラム名を表す文字列のタプル。
- `column_types` -- `result_columns`内の各カラムに対応するClickHouseデータ型を表すClickHouseTypeインスタンスのタプル。
- `query_id` -- ClickHouseのquery_id（`system.query_log`テーブル内のクエリを調査するのに便利です）
- `summary` -- `X-ClickHouse-Summary` HTTP応答ヘッダーによって返されたデータ。
- `first_item` -- 応答の最初の行を辞書として取得するための便利なプロパティ（キーはカラム名）。
- `first_row` -- 結果の最初の行を返すための便利なプロパティ。
- `column_block_stream` -- カラム指向形式のクエリ結果の生成子。このプロパティには直接参照しないことをお勧めします（以下参照）。
- `row_block_stream` -- 行指向形式のクエリ結果の生成子。このプロパティには直接参照しないことをお勧めします（以下参照）。
- `rows_stream` -- 1回の呼び出しで単一の行を返すクエリ結果の生成子。このプロパティには直接参照しないことをお勧めします（以下参照）。
- `summary` -- `command`メソッドの下で説明されている通り、ClickHouseによって返されたサマリー情報の辞書。

`*_stream`プロパティは、返されたデータのイテレータとして使用できるPythonのコンテキストを返します。これらは、クライアントの`*_stream`メソッドを介して間接的にアクセスされるべきです。

クエリ結果のストリーミングの完全な詳細（StreamContextオブジェクトを使用）は、[Advanced Queries (Streaming Queries)](#streaming-queries)で説明されています。

### NumPy、PandasまたはArrowによるクエリ結果の消費 {#consuming-query-results-with-numpy-pandas-or-arrow}

主要な`query`メソッドには3つの専門的なバージョンがあります：

- `query_np` -- このバージョンは、ClickHouse Connect QueryResultの代わりにNumPy配列を返します。
- `query_df` -- このバージョンは、ClickHouse Connect QueryResultの代わりにPandas Dataframeを返します。
- `query_arrow` -- このバージョンは、PyArrowテーブルを返します。ClickHouseの`Arrow`フォーマットを直接利用するため、主要な`query`メソッドと共通する3つの引数のみを受け入れます：`query`、`parameters`、`settings`。さらに、ClickHouseのString型を文字列（Trueの場合）またはバイト（Falseの場合）として描画するかどうかを決定する追加の引数`use_strings`があります。

### クライアントストリーミングクエリメソッド {#client-streaming-query-methods}

ClickHouse Connectクライアントは、ストリームとしてデータを取得するための複数のメソッドを提供します（Python生成子として実装されています）：

- `query_column_block_stream` -- ネイティブPythonオブジェクトを使ってカラムのシーケンスとしてクエリデータをブロックで返します。
- `query_row_block_stream` -- ネイティブPythonオブジェクトを使って行のブロックとしてクエリデータを返します。
- `query_rows_stream` -- ネイティブPythonオブジェクトを使って行のシーケンスとしてクエリデータを返します。
- `query_np_stream` -- 各ClickHouseブロックのクエリデータをNumPy配列として返します。
- `query_df_stream` -- 各ClickHouse BlockのクエリデータをPandas Dataframeとして返します。
- `query_arrow_stream` -- PyArrow RecordBlocksでクエリデータを返します。

これらのメソッドの各々は、ストリームの消費を開始するために`with`ステートメントを介して開かれなければならない`ContextStream`オブジェクトを返します。詳細と例については、[Advanced Queries (Streaming Queries)](#streaming-queries)を参照してください。

### クライアント_insertメソッド {#client-_insert_-method}

ClickHouseに複数のレコードを挿入する一般的な使用ケースのために、`Client.insert`メソッドがあります。次のパラメータを取ります：

| パラメータ         | 型                             | デフォルト   | 説明                                                                                                                                                                             |
|-------------------|--------------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                            | *必須*      | 挿入するClickHouseのテーブル。完全なテーブル名（データベースを含む）は許可されます。                                                                                               |
| data              | Sequence of Sequences          | *必須*      | 挿入するデータのマトリックスであり、各行がカラム値のシーケンスである行のシーケンス、または各カラムが行値のシーケンスであるカラムのシーケンスです。                                  |
| column_names      | Sequence of str, or str        | '*'         | データマトリックスのカラム名のリスト。代わりに'*'を使用する場合、ClickHouse Connectはテーブルのすべてのカラム名を取得するための「プレクエリ」を実行します。                           |
| database          | str                            | ''           | 挿入の対象データベース。指定されていない場合、クライアントのデータベースが使用されます。                                                                                           |
| column_types      | Sequence of ClickHouseType      | *なし*      | ClickHouseTypeインスタンスのリスト。`column_types`または`column_type_names`のいずれも指定されていない場合、ClickHouse Connectはテーブルのすべてのカラムタイプを取得するための「プレクエリ」を実行します。 |
| column_type_names | Sequence of ClickHouse type names | *なし*      | ClickHouseのデータ型名のリスト。`column_types`または`column_type_names`のいずれも指定されていない場合、ClickHouse Connectはテーブルのすべてのカラムタイプを取得するための「プレクエリ」を実行します。 |
| column_oriented   | bool                            | False        | Trueの場合、`data`引数がカラムのシーケンスであるとみなされ（データを挿入するために「ピボット」を必要としません）、そうでない場合は`data`は行のシーケンスとして解釈されます。                       |
| settings          | dict                            | *なし*      | [settingsの説明](#settings-argument)を参照してください。                                                                                                                                               |
| insert_context    | InsertContext                  | *なし*      | 上記のメソッド引数をカプセル化するために再利用可能なInsertContextオブジェクトを使用できます。詳細は [Advanced Inserts (InsertContexts)](#insertcontexts) を参照してください。                                              |

このメソッドは、「クエリサマリー」辞書を返します。挿入が何らかの理由で失敗した場合、例外が発生します。

主要な`insert`メソッドには2つの専門的なバージョンがあります：

- `insert_df` -- Pythonのシーケンスのシーケンス`data`引数の代わりに、このメソッドの2番目のパラメータにはPandas Dataframeインスタンスである必要がある`df`引数が要求されます。ClickHouse Connectは自動的にDataframeをカラム指向のデータソースとして処理しますので、`column_oriented`パラメータは必要なく、利用できません。
- `insert_arrow` -- Pythonのシーケンスのシーケンス`data`引数の代わりに、このメソッドは`arrow_table`を要求します。ClickHouse ConnectはArrowテーブルを変更せずにClickHouseサーバーに処理を委任するので、`database`と`settings`引数は`table`および`arrow_table`に加えてのみ利用可能です。

*注意:* NumPy配列は有効なシーケンスのシーケンスであり、主要な`insert`メソッドの`data`引数として使用できるため、専門的なメソッドは必要ありません。

### ファイル挿入 {#file-inserts}

`clickhouse_connect.driver.tools`には、ファイルシステムから既存のClickHouseテーブルに直接データを挿入するための`insert_file`メソッドが含まれています。パースはClickHouseサーバーに委任されます。`insert_file`は次のパラメータを受け入れます：

| パラメータ    | 型            | デフォルト            | 説明                                                                                                                                   |
|--------------|-----------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *必須*            | 挿入を実行するために使用される`driver.Client`                                                                                     |
| table        | str             | *必須*            | 挿入するClickHouseのテーブル。完全なテーブル名（データベースを含む）は許可されます。                                               |
| file_path    | str             | *必須*            | データファイルへのネイティブファイルシステムパス                                                                                        |
| fmt          | str             | CSV, CSVWithNames | ファイルのClickHouse入力フォーマット。`column_names`が提供されない場合、CSVWithNamesが仮定されます                                  |
| column_names | Sequence of str | *なし*            | データファイル内のカラム名のリスト。カラム名を含むフォーマットに対しては必要ありません。                                          |
| database     | str             | *なし*            | テーブルのデータベース。テーブルが完全に指定されている場合は無視されます。指定されない場合、挿入はクライアントデータベースを使用します。        |
| settings     | dict            | *なし*            | [settingsの説明](#settings-argument)を参照してください。                                                                          |
| compression  | str             | *なし*            | Content-Encoding HTTPヘッダーに使用される認識されたClickHouse圧縮タイプ（zstd、lz4、gzip）。                                    |

不規則なデータや異常な形式の日時値を持つファイルについては、データインポートに適用される設定（例えば、`input_format_allow_errors_num`や`input_format_allow_errors_ratio`）がこのメソッドで認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

### クエリ結果をファイルとして保存 {#saving-query-results-as-files}

`raw_stream`メソッドを使用して、ClickHouseからローカルファイルシステムへのファイルをストリーミングできます。たとえば、クエリの結果をCSVファイルに保存したい場合、次のコードスニペットを使用できます。

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # またはCSV、CSVWithNamesAndTypes、TabSeparatedなど
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上記のコードは、次の内容を持つ`output.csv`ファイルを生成します：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、他のフォーマットでのデータ保存も可能です。詳細なフォーマットオプションについては、[Input and Output Dataのフォーマット](/interfaces/formats)を参照してください。

### 生API {#raw-api}

ClickHouseデータとネイティブまたはサードパーティデータ型および構造間の変換を必要としないユースケースのために、ClickHouse ConnectクライアントはClickHouse接続の直接使用のための2つのメソッドを提供します。

#### クライアント_raw_queryメソッド {#client-_raw_query_-method}

`Client.raw_query`メソッドは、クライアント接続を使用してClickHouse HTTPクエリインターフェイスの直接使用を可能にします。返り値は未処理の`bytes`オブジェクトです。パラメータバインディング、エラーハンドリング、リトライ、および設定管理を最小限のインターフェースで提供する便利なラッパーを提供します：

| パラメータ     | 型                 | デフォルト   | 説明                                                                                                                                                                  |
|---------------|---------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str                  | *必須*      | 有効なClickHouseクエリ                                                                                                                                                |
| parameters    | dict or iterable     | *なし*      | [parametersの説明](#parameters-argument)を参照してください。                                                                                                           |
| settings      | dict                 | *なし*      | [settingsの説明](#settings-argument)を参照してください。                                                                                                             |
| fmt           | str                  | *なし*      | 生成されるバイトのClickHouse出力フォーマット。未指定の場合、ClickHouseはTSVを使用します。                                                                              |
| use_database  | bool                 | True         | クエリコンテキストのためにclickhouse-connectクライアントに割り当てられたデータベースを使用します                                                                                         |
| external_data | ExternalData         | *なし*      | クエリに使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。詳細は [Advanced Queries (External Data)](#external-data) を参照してください。  |

結果の`bytes`オブジェクトを処理するのは呼び出し側の責任です。`Client.query_arrow`は、このメソッドを単純にラップしたものであり、ClickHouseの`Arrow`出力フォーマットを使用しています。

#### クライアント_raw_streamメソッド {#client-_raw_stream_-method}

`Client.raw_stream`メソッドは`raw_query`メソッドと同じAPIを持ちますが、`bytes`オブジェクトのジェネレーター/ストリームソースとして使用できる`io.IOBase`オブジェクトを返します。これは現在`query_arrow_stream`メソッドによって利用されています。

#### クライアント_raw_insertメソッド {#client-_raw_insert_-method}

`Client.raw_insert`メソッドは、クライアント接続を使用して`bytes`オブジェクトまたは`bytes`オブジェクトジェネレーターを直接挿入することを可能にします。ペイロードの処理を行わないため、高速です。このメソッドは、設定と挿入フォーマットを指定するオプションを提供します：

| パラメータ    | 型                                       | デフォルト   | 説明                                                                                                       |
|--------------|------------------------------------------|--------------|------------------------------------------------------------------------------------------------------------|
| table        | str                                      | *必須*      | 簡易またはデータベース指定のテーブル名                                                                         |
| column_names | Sequence[str]                           | *なし*      | 挿入ブロックのカラム名。`fmt`パラメータが名前を含まない場合は必須です                                                |
| insert_block | str, bytes, Generator[bytes], BinaryIO  | *必須*      | 挿入するデータ。文字列はクライアントエンコーディングでエンコードされます。                                       |
| settings     | dict                                     | *なし*      | [settingsの説明](#settings-argument)を参照してください。                                                       |
| fmt          | str                                      | *なし*      | `insert_block`バイトのClickHouse入力フォーマット。未指定の場合、ClickHouseはTSVを使用します。                      |

`insert_block`が指定のフォーマットで指定の圧縮メソッドを使用していることを確認するのは呼び出し側の責任です。ClickHouse Connectは、ファイルアップロードやPyArrowテーブルのためにこれらの生の挿入を使用し、パースをClickHouseサーバーに委任します。

### ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスおよび関数は、「公開」`clickhouse-connect` APIの一部と見なされ、上記で文書化されたクラスやメソッドと同様に、マイナーリリースにわたって安定しています。これらのクラスや関数への破壊的変更は、マイナー（パッチではない）リリースでのみ発生し、少なくとも1つのマイナーリリースの間は廃止された状態で利用可能になります。

#### 例外 {#exceptions}

DB API 2.0仕様で定義されたものを含むすべてのカスタム例外は、`clickhouse_connect.driver.exceptions`モジュールに定義されています。ドライバーによって実際に検出された例外は、これらのいずれかのタイプを使用します。

#### ClickHouse SQLユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding`モジュールにある関数とDT64Paramクラスは、ClickHouse SQLクエリを適切に構築し、エスケープするために使用できます。同様に、`clickhouse_connect.driver.parser`モジュールの関数は、ClickHouseデータ型名をパースするために使用できます。

### マルチスレッド、マルチプロセス、および非同期/イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connectは、マルチスレッド、マルチプロセス、イベントループ駆動/非同期アプリケーションでうまく機能します。すべてのクエリおよび挿入処理は単一のスレッド内で行われるため、操作は一般的にスレッドセーフです。（低レベルでの一部の操作の並行処理は、単一スレッドのパフォーマンスペナルティを克服するための将来的な強化の可能性がありますが、その場合でもスレッドセーフ性は維持されます）。

各クエリまたは挿入は、それぞれ自身のQueryContextまたはInsertContextオブジェクト内で状態を維持するため、これらのヘルパーオブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有しないことをお勧めします。コンテキストオブジェクトに関する追加の議論は、次のセクションで説明されます。

加えて、同時に2つ以上のクエリや挿入が「フライト」しているアプリケーションでは、考慮すべき2つの追加の考慮事項があります。最初は、クエリ/挿入に関連するClickHouse「セッション」であり、次はClickHouse Connectクライアントインスタンスが使用するHTTP接続プールです。

### AsyncClientラッパー {#asyncclient-wrapper}

0.7.16以降、ClickHouse Connectは通常の`Client`に対する非同期ラッパーを提供しており、`asyncio`環境でクライアントを使用できるようになります。

`AsyncClient`のインスタンスを取得するには、標準の`get_client`と同じパラメータを受け取る`get_async_client`ファクトリーファンクションを使用できます：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient`は、標準の`Client`と同じメソッドを持ち、パラメータも同じですが、適用可能な場合はコルーチンになります。内部的には、I/O操作を実行する`Client`のメソッドは[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor)コールでラップされます。

`AsyncClient`ラッパーを使用することで、スレッドの実行とGILがI/O操作の完了を待機している間に解放されるため、マルチスレッドのパフォーマンスが向上します。

注：通常の`Client`とは異なり、`AsyncClient`はデフォルトで`autogenerate_session_id`を`False`に強制します。

また、[run_asyncの例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)も参照ください。

### ClickHouseセッションIDの管理 {#managing-clickhouse-session-ids}

各ClickHouseクエリは、ClickHouseの「セッション」のコンテキスト内で発生します。セッションは現在、次の2つの目的で使用されています：
- 複数のクエリに特定のClickHouse設定を関連付けるため（[user settings](/operations/settings/settings.md)を参照）。ClickHouseの`SET`コマンドを使用してユーザーセッションのスコープ内で設定を変更します。
- [一時テーブル](/sql-reference/statements/create/table#temporary-tables)の追跡。

デフォルトでは、ClickHouse Connectクライアントインスタンスを使用して実行された各クエリは、セッション機能を有効にするために同じセッションIDを使用します。つまり、`SET`ステートメントと一時テーブルの作業は、単一のClickHouseクライアントを使用する際に期待通りに機能します。 ただし、設計上、ClickHouseサーバーは同じセッション内での同時クエリを許可していません。結果として、並行クエリを実行するClickHouse Connectアプリケーションには2つのオプションがあります。

- 各実行スレッド（スレッド、プロセス、またはイベントハンドラー）ごとに別の`Client`インスタンスを作成することで、それぞれが独自のセッションIDを持つことができます。これは一般的に最良のアプローチであり、各クライアントのセッション状態を保持します。
- 各クエリに対してユニークなセッションIDを使用します。この方法は、一時テーブルや共有セッション設定が必要ない状況において、同時セッションの問題を回避します。共有設定もクライアント作成時に提供できますが、これらは各リクエストとともに送信され、セッションには関連付けられません。ユニークなsession_idは、各リクエストのために`settings`辞書に追加できます、または`autogenerate_session_id`共通設定を無効にすることができます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # これはクライアントを作成する前に常に設定されるべきです
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

この場合、ClickHouse ConnectはセッションIDを送信せず、ClickHouseサーバーによってランダムなセッションIDが生成されます。再度、一時テーブルやセッションレベルの設定は利用できません。

### HTTP接続プールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connectは、サーバーへの基礎となるHTTP接続を処理するために`urllib3`接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスが同じ接続プールを共有し、これはほとんどのユースケースに対して十分です。このデフォルトプールは、アプリケーションが使用する各ClickHouseサーバーに対して最大8つのHTTP Keep Alive接続を維持します。

大規模なマルチスレッドアプリケーションの場合、別々の接続プールが適切かもしれません。カスタマイズされた接続プールは、主要な`clickhouse_connect.get_client`関数への`pool_mgr`キーワード引数として提供できます：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例のように、クライアントはプールマネージャーを共有するか、各クライアント用に別のプールマネージャーを作成できます。プールマネージャー作成時に利用可能なオプションの詳細については、[`urllib3`のドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。

## ClickHouse Connectを使用したデータのクエリ：高度な使用法 {#querying-data-with-clickhouse-connect--advanced-usage}

### QueryContexts {#querycontexts}

ClickHouse Connectは、標準クエリをQueryContext内で実行します。QueryContextは、ClickHouseデータベースに対してクエリを構築するために使用される重要な構造と、結果をQueryResultまたは他の応答データ構造に処理するための構成を含んでいます。それには、クエリ自体、パラメータ、設定、読み取りフォーマット、およびその他のプロパティが含まれます。

QueryContextは、クライアントの`create_query_context`メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメータを取ります。このクエリコンテキストは、その後`query`、`query_df`、または`query_np`メソッドに`context`キーワード引数として渡すことができ、これらのメソッドの他の引数のいずれかを置き換えることができます。メソッド呼び出しに指定された追加の引数は、QueryContextのプロパティを上書きします。

QueryContextの最も明確な使用ケースは、異なるバインディングパラメータ値を持つ同じクエリを送信することです。すべてのパラメータ値は、`QueryContext.set_parameters`メソッドを呼び出して辞書で更新できます。または、`QueryContext.set_parameter`を呼び出して必要な`key`、`value`ペアで単一の値を更新できます。

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

QueryContextsはスレッドセーフではないことに注意してください。ただし、`QueryContext.updated_copy`メソッドを呼び出すことで、マルチスレッド環境でコピーを取得できます。

### ストリーミングクエリ {#streaming-queries}

#### データブロック {#data-blocks}
ClickHouse Connectは、主要な`query`メソッドからのすべてのデータを、ClickHouseサーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouseとの間でカスタム「Native」フォーマットで送信されます。「ブロック」とは、指定されたデータ型のデータ値を等しい数で含むバイナリデータのカラムシーケンスのことです。（列指向のデータベースであるため、ClickHouseはこのデータを類似の形で格納しています。）クエリから返されるブロックのサイズは、いくつかのレベルで設定できる2つのユーザー設定によって governed されます（ユーザープロファイル、ユーザー、セッション、またはクエリ）。それらは：

- [max_block_size](/operations/settings/settings.md/#setting-max_block_size) -- 行のサイズの制限。デフォルトは65536です。
- [preferred_block_size_bytes](/operations/settings/settings.md/#preferred-block-size-bytes) -- バイト単位でのブロックサイズのソフト制限。デフォルトは1,000,000です。

`preferred_block_size_setting`にかかわらず、各ブロックは`max_block_size`行を超えることはありません。クエリの種類に応じて、返される実際のブロックのサイズは異なる場合があります。たとえば、複数のシャードをカバーする分散テーブルへのクエリは、各シャードから直接取得した小さなブロックを含む場合があります。

クライアントの`query_*_stream`メソッドのいずれかを使用する場合、結果はブロックごとに返されます。ClickHouse Connectは、一度に1つのブロックしか読み込みません。これにより、大量のデータを処理することができ、大きな結果セット全体をメモリに読み込む必要がありません。アプリケーションは、任意の数のブロックを処理する準備をしておく必要があり、各ブロックの正確なサイズを制御することはできません。

#### HTTPデータバッファの遅延処理 {#http-data-buffer-for-slow-processing}
HTTPプロトコルの制限のため、ClickHouseサーバーがデータストリーミングを行っている速度よりもブロックの処理速度が著しく遅い場合、ClickHouseサーバーは接続を閉じ、処理スレッドで例外がスローされます。この問題の一部は、一般的な `http_buffer_size` 設定を使用して、HTTPストリーミングバッファのバッファサイズ（デフォルトは10メガバイト）を増加させることで軽減できます。アプリケーションに十分なメモリがある場合、大きな `http_buffer_size` の値はこの状況では問題ありません。バッファ内のデータは、`lz4` または `zstd` 圧縮を使用している場合は圧縮されて保存されるため、これらの圧縮タイプを使用するとバッファ全体が増加します。

#### StreamContexts {#streamcontexts}

すべての `query_*_stream` メソッド（`query_row_block_stream` のような）は、ClickHouseの `StreamContext` オブジェクトを返します。これは、Pythonのコンテキスト/ジェネレーターです。基本的な使用例は以下の通りです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <各行のPython Tripデータで何かを行う>
```

`with` ステートメントなしでStreamContextを使用しようとするとエラーが発生することに注意してください。Pythonコンテキストを使用することで、ストリーム（この場合、ストリーミングHTTPレスポンス）は、すべてのデータが消費されていない場合や処理中に例外が発生した場合でも適切に閉じられます。また、StreamContextはストリームを消費するために一度だけ使用できます。終了した後にStreamContextを使用しようとすると、`StreamClosedError` が発生します。

StreamContextの `source` プロパティを使用して、カラム名やタイプを含む親 `QueryResult` オブジェクトにアクセスできます。

#### Stream Types {#stream-types}

`query_column_block_stream` メソッドは、ブロックをネイティブPythonデータ型として保存されたカラムデータのシーケンスとして返します。上記の `taxi_trips` クエリを使用すると、返されるデータはリストになり、そのリストの各要素は関連付けられたカラムのすべてのデータを含む別のリスト（またはタプル）となります。したがって、`block[0]` は文字列のみを含むタプルになります。カラム指向のフォーマットは、合計運賃を合算するなど、カラム内のすべての値に対して集計操作を行うために最も多く使用されます。

`query_row_block_stream` メソッドは、ブロックを従来のリレーショナルデータベースのように行のシーケンスとして返します。タクシーのトリップの場合、返されるデータはリストになり、そのリストの各要素はデータの行を表す別のリストになります。したがって、`block[0]` には最初のタクシーのトリップのすべてのフィールド（順序通り）が含まれ、`block[1]` には2番目のトリップのすべてのフィールドの行が含まれます。行指向の結果は通常、表示や変換プロセスに使用されます。

`query_row_stream` は、ストリームを繰り返し処理する際に自動的に次のブロックに移動する便利なメソッドです。それ以外の場合は、`query_row_block_stream` と同じです。

`query_np_stream` メソッドは、各ブロックを2次元NumPy配列として返します。内部的に、NumPy配列は（通常）カラムとして保存されるため、特別な行やカラムメソッドは必要ありません。NumPy配列の「形状」は（カラム数、行数）として表現されます。NumPyライブラリは、NumPy配列を操作するための多くのメソッドを提供しています。クエリ内のすべてのカラムが同じNumPyデータ型を共有している場合、返されるNumPy配列も1つのデータ型のみを持ち、実際の内部構造を変更せずに再構築/回転できます。

`query_df_stream` メソッドは、各ClickHouseブロックを2次元のPandasデータフレームとして返します。以下は、StreamContextオブジェクトを1回のみ遅延させて使用できることを示す例です。

最後に、`query_arrow_stream` メソッドは、ClickHouseの `ArrowStream` フォーマットされた結果を `pyarrow.ipc.RecordBatchStreamReader` として返し、それをStreamContextでラップします。ストリームの各反復で、PyArrow RecordBlockが返されます。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <Pandas DataFrameで何かを行う>
```

### Read Formats {#read-formats}

リードフォーマットは、クライアントの `query`、`query_np`、および `query_df` メソッドから返される値のデータ型を制御します。 (`raw_query` と `query_arrow` は、ClickHouseからの受信データを変更しないため、フォーマット制御は適用されません)。たとえば、UUIDのリードフォーマットがデフォルトの `native` フォーマットから代替の `string` フォーマットに変更された場合、`UUID` カラムのClickHouseクエリは、PythonのUUIDオブジェクトの代わりに、文字列値（標準の8-4-4-4-12 RFC 1422フォーマットを使用）として返されます。

すべてのフォーマット関数の「データタイプ」引数にはワイルドカードを含めることができます。フォーマットは小文字の単一の文字列です。

リードフォーマットは、いくつかのレベルで設定できます：

- グローバルに、`clickhouse_connect.datatypes.format` パッケージに定義されたメソッドを使用します。これにより、すべてのクエリの構成データ型のフォーマットが制御されます。
```python
from clickhouse_connect.datatypes.format import set_read_format

# IPv6とIPv4の値を両方とも文字列として返す
set_read_format('IPv*', 'string')

# すべての日付型を基になるエポック秒またはエポック日として返す
set_read_format('Date*', 'int')
```
- クエリ全体について、オプションの `query_formats` 辞書引数を使用します。この場合、指定したデータタイプの任意のカラム（またはサブカラム）が構成されたフォーマットを使用します。
```python
# 任意のUUIDカラムを文字列として返す
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 特定のカラム内の値について、オプションの `column_formats` 辞書引数を使用します。キーはClickHouseによって返されるカラム名であり、データカラムまたはClickHouseタイプ名とクエリフォーマットの値からなる第二レベルの「フォーマット」辞書のフォーマットです。この二次辞書は、タプルやマップなどのネストされたカラムタイプに対して使用できます。
```python
# `dev_address` カラムのIPv6値を文字列として返す
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

#### Read Format Options (Python Types) {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type    | Read Formats | Comments                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | Superset does not currently handle large unsigned UInt64 values                                                   |
| [U]Int[128,256]       | int                   | string       | Pandas and NumPy int values are 64 bits maximum, so these can be returned as strings                              |
| Float32               | float                 | -            | All Python floats are 64 bits internally                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | bytes        | ClickHouse String columns have no inherent encoding, so they are also used for variable length binary data        |
| FixedString           | bytes                 | string       | FixedStrings are fixed size byte arrays, but sometimes are treated as Python strings                              |
| Enum[8,16]            | string                | string, int  | Python enums don't accept empty strings, so all enums are rendered as either strings or the underlying int value. |
| Date                  | datetime.date         | int          | ClickHouse stores Dates as days since 01/01/1970.  This value is available as an int                              |
| Date32                | datetime.date         | int          | Same as Date, but for a wider range of dates                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouse stores DateTime in epoch seconds.  This value is available as an int                                   |
| DateTime64            | datetime.datetime     | int          | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available               |
| IPv4                  | `ipaddress.IPv4Address` | string       | IP addresses can be read as strings and properly formatted strings can be inserted as IP addresses                |
| IPv6                  | `ipaddress.IPv6Address` | string       | IP addresses can be read as strings and properly formatted can be inserted as IP addresses                        |
| Tuple                 | dict or tuple         | tuple, json  | Named tuples returned as dictionaries by default.  Named tuples can also be returned as JSON strings              |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUIDs can be read as strings formatted as per RFC 4122<br/>                                                       |
| JSON                  | dict                  | string       | A python dictionary is returned by default.  The `string` format will return a JSON string                        |
| Variant               | object                | -            | Returns the matching Python type for the ClickHouse datatype stored for the value                                 |
| Dynamic               | object                | -            | Returns the matching Python type for the ClickHouse datatype stored for the value                                 |

### External Data {#external-data}

ClickHouseクエリは、任意のClickHouseフォーマットの外部データを受け入れることができます。このバイナリデータは、データを処理するために使用されるクエリ文字列とともに送信されます。外部データ機能の詳細はこちらにあります [here](/engines/table-engines/special/external-data.md)。クライアントの `query*` メソッドは、この機能を利用するためのオプションの `external_data` パラメータを受け入れます。 `external_data` パラメータの値は、`clickhouse_connect.driver.external.ExternalData` オブジェクトである必要があります。そのオブジェクトのコンストラクタは以下の引数を受け取ります：

| Name      | Type              | Description                                                                                                                                     |
|-----------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | 外部データを読み込むためのローカルシステムパスのファイルパス。`file_path` または `data` のいずれかが必要です。                               | 
| file_name | str               | 外部データ「ファイル」の名前。指定しない場合、`file_path` から（拡張子なしで）決定されます。                                               |
| data      | bytes             | バイナリ形式の外部データ（ファイルから読み込む代わりに）。`data` または `file_path` のいずれかが必要です。                                 |
| fmt       | str               | データのClickHouse [Input Format](/sql-reference/formats.mdx)。デフォルトは `TSV` です。                                              |
| types     | str or seq of str | 外部データのカラムデータ型のリスト。文字列の場合、種類はカンマで区切るべきです。`types` または `structure` のいずれかが必要です。  |
| structure | str or seq of str | データ内のカラム名 + データ型のリスト（例を参照）。`structure` または `types` のいずれかが必要です。                                       |
| mime_type | str               | ファイルデータのオプションのMIMEタイプ。現在、ClickHouseはこのHTTPサブヘッダーを無視します。                                               |

外部の「映画」データを含むCSVファイルを持つクエリを送信し、そのデータをClickHouseサーバーに既に存在する `directors` テーブルと結合するには、次のようにします：

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

追加の外部データファイルは、コンストラクタと同じパラメータを取る `add_file` メソッドを使用して最初のExternalDataオブジェクトに追加できます。HTTPの場合、すべての外部データは `multi-part/form-data` ファイルアップロードの一部として送信されます。

### Time Zones {#time-zones}

ClickHouse DateTimeおよびDateTime64値にタイムゾーンを適用するためのメカニズムは複数あります。内部的に、ClickHouseサーバーは、DateTimeまたはDateTime64オブジェクトを常にエポック（1970-01-01 00:00:00 UTC時間）以来の秒数を表すタイムゾーンに依存しない数として保存します。DateTime64値については、表現はエポック以来のミリ秒、マイクロ秒、またはナノ秒で、精度に応じます。その結果、タイムゾーン情報の適用は常にクライアント側で行われます。このことは重要な追加計算を伴うため、パフォーマンスが重要なアプリケーションでは、ユーザーの表示および変換（例えば、Pandasのタイムスタンプ）が行われる場合を除き、DateTime型をエポックタイムスタンプとして扱うことが推奨されています。

クエリ内でタイムゾーン認識データ型を使用する場合、特にPythonの `datetime.datetime` オブジェクトの場合、`clickhouse-connect` は次の優先順位ルールに従ってクライアント側のタイムゾーンを適用します：

1. クエリのためのクエリメソッドパラメータ `client_tzs` が指定されている場合は、特定のカラムタイムゾーンが適用されます。
2. ClickHouseカラムにタイムゾーンメタデータがある場合（例：DateTime64(3, 'America/Denver')のような型）、ClickHouseカラムのタイムゾーンが適用されます。（注：このタイムゾーンメタデータは、ClickHouseバージョン23.2以前のDateTimeカラムには`clickhouse-connect`に対して利用可能ではありません）
3. クエリメソッドパラメータ `query_tz` が指定されている場合は、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションにタイムゾーン設定が適用されている場合、そのタイムゾーンが適用されます。（この機能は現在ClickHouseサーバーにはリリースされていません）
5. 最後に、クライアントの `apply_server_timezone` パラメータがTrue（デフォルト）に設定されている場合、ClickHouseサーバーのタイムゾーンが適用されます。

これらのルールに基づいて適用されたタイムゾーンがUTCである場合、`clickhouse-connect` は常にタイムゾーンに依存しないPythonの `datetime.datetime` オブジェクトを返します。必要に応じて、追加のタイムゾーン情報はアプリケーションコードによってこのタイムゾーンに依存しないオブジェクトに追加することができます。

## ClickHouse Connectによるデータ挿入：高度な使用法 {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContexts {#insertcontexts}

ClickHouse Connectは、すべての挿入をInsertContext内で実行します。InsertContextには、クライアントの `insert` メソッドに引数として送信されたすべての値が含まれています。さらに、InsertContextが最初に構築されるとき、ClickHouse Connectは効率的なネイティブフォーマット挿入に必要な挿入カラムのデータ型を取得します。複数の挿入に対してInsertContextを再利用することで、この「事前クエリ」を避け、挿入がより迅速かつ効率的に実行されます。

InsertContextは、クライアントの `create_insert_context` メソッドを使用して取得できます。このメソッドは `insert` 関数と同じ引数を取ります。再利用するためには、InsertContextsの `data` プロパティのみを変更する必要があります。これは、同じテーブルに新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供するという意図に沿ったものです。

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

InsertContextsは挿入プロセス中に更新される可変状態を含むため、スレッドセーフではありません。

### Write Formats {#write-formats}

書き込みフォーマットは、現在限られた数のタイプに対して実装されています。ほとんどの場合、ClickHouse Connectは、最初の（非null）データ値のタイプを検査して、カラムに対する正しい書き込みフォーマットを自動的に決定しようとします。たとえば、DateTimeカラムに挿入する際、最初の挿入値がPythonの整数である場合、ClickHouse Connectはその整数値を直接挿入します。これは、実際にはエポック秒であると仮定しています。

ほとんどの場合、データ型の書き込みフォーマットをオーバーライドする必要はありませんが、`clickhouse_connect.datatypes.format` パッケージ内の関連メソッドを使用してグローバルレベルで行うことができます。

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
| FixedString           | bytes                 | string        | If inserted as a string, additional bytes will be set to zeros                                              |
| Enum[8,16]            | string                |               |                                                                                                             |
| Date                  | datetime.date         | int           | ClickHouse stores Dates as days since 01/01/1970.  int types will be assumed to be this "epoch date" value  |
| Date32                | datetime.date         | int           | Same as Date, but for a wider range of dates                                                                |
| DateTime              | datetime.datetime     | int           | ClickHouse stores DateTime in epoch seconds.  int types will be assumed to be this "epoch second" value     |
| DateTime64            | datetime.datetime     | int           | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available         |
| IPv4                  | `ipaddress.IPv4Address` | string        | Properly formatted strings can be inserted as IPv4 addresses                                                |
| IPv6                  | `ipaddress.IPv6Address` | string        | Properly formatted strings can be inserted as IPv6 addresses                                                |
| Tuple                 | dict or tuple         |               |                                                                                                             |
| Map                   | dict                  |               |                                                                                                             |
| Nested                | Sequence[dict]        |               |                                                                                                             |
| UUID                  | uuid.UUID             | string        | Properly formatted strings can be inserted as ClickHouse UUIDs                                              |
| JSON/Object('json')   | dict                  | string        | Either dictionaries or JSON strings can be inserted into JSON Columns (note `Object('json')` is deprecated) |
| Variant               | object                |               | At this time on all variants are inserted as Strings and parsed by the ClickHouse server                    |
| Dynamic               | object                |               | Warning -- at this time any inserts into a Dynamic column are persisted as a ClickHouse String              |


## Additional Options {#additional-options}

ClickHouse Connectは、高度な使用ケースのためにいくつかの追加オプションを提供します。

### Global Settings {#global-settings}

ClickHouse Connectの動作をグローバルに制御する設定は少数あります。これらは、トップレベルの `common` パッケージからアクセスされます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの一般的な設定 `autogenerate_session_id` 、`product_name` 、および `readonly` は、クライアントを `clickhouse_connect.get_client` メソッドで作成する前に _常に_ 修正する必要があります。クライアント作成後にこれらの設定を変更しても、既存のクライアントの動作には影響しません。
:::

現在、10のグローバル設定が定義されています：

| 設定名                | デフォルト | オプション               | 説明                                                                                                                                                                                                                                                   |
|---------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | 各クライアントセッションのために新しいUUID(1)セッションID（提供されていない場合）を自動生成します。セッションIDが提供されていない場合（クライアントレベルまたはクエリレベルのいずれか）、ClickHouseは各クエリに対してランダムな内部IDを生成します。           |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | 無効または読み取り専用の設定が提供された場合（クライアントセッションまたはクエリ用）、実行するアクションです。`drop` の場合、設定は無視されます。`send` の場合、その設定がClickHouseに送信されます。`error` の場合、クライアント側のProgrammingErrorが発生します。 |
| dict_parameter_format   | 'json'  | 'json', 'map'           | この設定は、パラメータ化クエリがPython辞書をJSONまたはClickHouseマップ構文に変換するかどうかを制御します。`json` はJSONカラムへの挿入に使用され、`map` はClickHouseマップカラムに対して使用されます。                                      |
| product_name            |         |                         | ClickHouse Connectを使用してアプリケーションを追跡するためにClickHouseにクエリの際に渡される文字列。形式は &lt;product name;&gl/&lt;product version&gt; であるべきです。                                                                 |
| max_connection_age      | 600     |                         | HTTP Keep Alive接続がオープン/再利用される最大秒数。この設定により、ロードバランサ/プロキシの背後にある単一のClickHouseノードに接続が一括するのを防ぎます。デフォルトは10分間です。                                 |
| readonly                | 0       | 0, 1                    | ClickHouseのバージョン19.17以前の暗黙の「読み取り専用」設定。非常に古いClickHouseバージョンと操作を許可するためにClickHouseの「読み取り専用」値と一致するように設定できます。                                           |
| use_protocol_version    | True    | True, False             | クライアントプロトコルバージョンを使用します。これは、DateTimeタイムゾーンカラムに必要ですが、現在のchproxyバージョンでは壊れます。                                                                                                   |
| max_error_size          | 1024    |                         | クライアントエラーメッセージに返される最大文字数。この設定を0に設定すると、完全なClickHouseエラーメッセージが取得されます。デフォルトは1024文字です。                                                                                     |
| send_os_user            | True    | True, False             | ClickHouseに送信されるクライアント情報に検出されたオペレーティングシステムユーザーを含めます（HTTP User-Agent文字列）。                                                                                                                                          |
| http_buffer_size        | 10MB    |                         | HTTPストリーミングクエリに使用される「インメモリ」バッファのサイズ（バイト数）。                                                                                                                                                                |

### Compression {#compression}

ClickHouse Connectは、クエリ結果と挿入の両方に対してlz4、zstd、brotli、およびgzip圧縮をサポートしています。圧縮を使用することは通常、ネットワーク帯域幅/転送速度とCPU使用量（クライアントおよびサーバーの両方）との間でトレードオフを伴うことを常に考慮してください。

圧縮されたデータを受信するには、ClickHouseサーバーの `enable_http_compression` を1に設定するか、ユーザーが「クエリごと」に設定を変更する許可を持っている必要があります。

圧縮は、`clickhouse_connect.get_client` ファクトリメソッドを呼び出す際の `compress` パラメータによって制御されます。デフォルトでは、`compress` は `True` に設定されており、これによりデフォルトの圧縮設定がトリガーされます。`query`、`query_np`、および `query_df` クライアントメソッドで実行されるクエリに対して、ClickHouse Connectは、`lz4`、`zstd`、`br`（brotliがインストールされている場合）、`gzip`、`deflate` エンコーディングを持つ `Accept-Encoding` ヘッダーを追加します（`query` クライアントメソッドで実行され、間接的に `query_np` および `query_df` も同様に）。大多数のリクエストについて、ClickHouseサーバーは `zstd` 圧縮ペイロードを返します。挿入に関しては、デフォルトでClickHouse Connectは `lz4` 圧縮を使用して挿入ブロックを圧縮し、`Content-Encoding: lz4` HTTPヘッダーを送信します。

`get_client` の `compress` パラメータも特定の圧縮方法、`lz4`、`zstd`、`br`、または `gzip` の1つに設定できます。その方法が挿入およびクエリ結果に使用されます（ClickHouseサーバーがサポートしている場合）。必要な `zstd` および `lz4` 圧縮ライブラリは、ClickHouse Connectとともに既定でインストールされています。`br` /brotliが指定された場合、brotliライブラリは別途インストールする必要があります。

クライアント設定で指定された圧縮を使用しない `raw*` クライアントメソッドには注意してください。

また、圧縮と解凍の両方が他の方法よりも大幅に遅いため、`gzip` 圧縮の使用を推奨しないことも示唆します。

### HTTP Proxy Support {#http-proxy-support}

ClickHouse Connectは、`urllib3`ライブラリを使用して基本的なHTTPプロキシサポートを追加します。標準の `HTTP_PROXY` および `HTTPS_PROXY` 環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client` メソッドで生成された任意のクライアントに適用されます。代わりに、クライアントごとに設定するには、get_clientメソッドの`http_proxy`または`https_proxy`引数を使用できます。HTTPプロキシサポートの実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) のドキュメントを参照してください。

ソックスプロキシを使用するには、引数 `pool_mgr` に `urllib3` SOCKSProxyManagerを `get_client` に送信できます。この場合、PySocksライブラリを直接インストールするか、`urllib3` の依存関係に対して `[socks]` オプションを使用してインストールする必要があります。

### "Old" JSON Data Type {#old-json-data-type}
```html
実験的な `Object` (または `Object('json')`) データ型は廃止されており、本番環境での使用は避けるべきです。  
ClickHouse Connect は、後方互換性のためにこのデータ型に対して限られたサポートを提供し続けています。このサポートには、辞書やそれに相当するものとして返されることが期待される「トップレベル」または「親」JSON値を返すクエリは含まれていないことに注意してください。そのため、そのようなクエリは例外を引き起こします。

### "新しい" Variant/Dynamic/JSON データ型 (実験的機能) {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0 リリース以降、`clickhouse-connect` は新しい（またも実験的な）ClickHouse 型である Variant、Dynamic、および JSON のサポートを実験的に提供しています。

#### 使用上の注意点 {#usage-notes}
- JSON データは、Python 辞書または JSON オブジェクト `{}` を含む JSON 文字列として挿入できます。その他の形式の JSON データはサポートされていません。
- これらの型に対してサブカラム/パスを使用したクエリは、サブカラムの型を返します。
- 他の使用上の注意については、主な ClickHouse ドキュメントを参照してください。

#### 知られている制限事項: {#known-limitations}
- これらの型は使用する前に ClickHouse 設定で有効にする必要があります。
- 「新しい」JSON型は ClickHouse 24.8 リリース以降から利用可能です。
- 内部フォーマットの変更により、`clickhouse-connect` は ClickHouse 24.7 リリース以降の Variant 型とのみ互換性があります。
- 返された JSON オブジェクトは `max_dynamic_paths` の数の要素のみを返します (デフォルトは 1024 です)。これは将来的なリリースで修正される予定です。
- `Dynamic` カラムへの挿入は常に Python 値の文字列表現となります。これは、https://github.com/ClickHouse/ClickHouse/issues/70395 が修正されると、将来的なリリースで修正される予定です。
- 新しい型の実装は C コードで最適化されていないため、既存の単純なデータ型よりもパフォーマンスがやや遅くなる可能性があります。
```
