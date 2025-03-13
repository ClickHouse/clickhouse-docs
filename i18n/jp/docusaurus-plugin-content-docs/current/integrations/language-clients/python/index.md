---
sidebar_label: Python
sidebar_position: 10
keywords: [clickhouse, python, client, connect, integrate]
slug: /integrations/python
description: ClickHouseにPythonを接続するためのClickHouse Connectプロジェクトスイート
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# PythonとClickHouse Connectの統合
## はじめに {#introduction}

ClickHouse Connectは、さまざまなPythonアプリケーションとの相互運用性を提供するコアデータベースドライバです。

- 主なインターフェースは、パッケージ`clickhouse_connect.driver`の`Client`オブジェクトです。このコアパッケージには、ClickHouseサーバーとの通信に使用されるさまざまなヘルパークラスやユーティリティ関数、挿入および選択クエリの高度な管理に関する"コンテキスト"実装も含まれています。
- `clickhouse_connect.datatypes`パッケージは、すべての非実験的なClickHouseデータ型の基本実装とサブクラスを提供します。その主な機能は、ClickHouseデータをClickHouseの"ネイティブ"バイナリ列指向形式にシリアル化および逆シリアル化することです。この形式は、ClickHouseとクライアントアプリケーション間の最も効率的な転送を実現するために使用されます。
- `clickhouse_connect.cdriver`パッケージ内のCython/Cクラスは、純粋なPythonに比べて大幅に改善されたパフォーマンスを提供するため、最も一般的なシリアル化および逆シリアル化の最適化を行います。
- 限定的な[SQLAlchemy](https://www.sqlalchemy.org/)方言が`clickhouse_connect.cc_sqlalchemy`パッケージにあり、`datatypes`および`dbi`パッケージに基づいて構築されています。この制限された実装は、クエリ/カーソル機能に焦点を当てており、一般にSQLAlchemyのDDLおよびORM操作をサポートしていません。（SQLAlchemyはOLTPデータベースを対象にしており、ClickHouse OLAP指向のデータベースを管理するために、より専門的なツールやフレームワークを推奨します。）
- コアドライバとClickHouse Connect SQLAlchemyの実装は、ClickHouseをApache Supersetに接続するための推奨方法です。`ClickHouse Connect`データベース接続または`clickhousedb` SQLAlchemy方言の接続文字列を使用してください。

このドキュメントは、ベータリリース0.8.2の時点での情報に基づいています。

:::note
公式のClickHouse Connect Pythonドライバは、ClickHouseサーバーとの通信にHTTPプロトコルを使用します。
このプロトコルには利点（柔軟性の向上、HTTPバランサーのサポート、JDBCベースのツールとの互換性の向上など）と欠点（わずかに低い圧縮率とパフォーマンス、ネイティブTCPプロトコルの一部の複雑な機能のサポート不足など）があります。
特定のユースケースでは、ネイティブTCPプロトコルを使用する[Community Python drivers](/interfaces/third-party/client-libraries.md)の一つを使用することを検討しても良いでしょう。
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


¹ClickHouse Connectは、リストされたプラットフォームに対して明示的にテストされています。さらに、優れた[`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/)プロジェクトに対して、すべてのアーキテクチャ向けにテストされていないバイナリホイール（C最適化済み）がビルドされています。
最終的に、ClickHouse Connectは素のPythonとしても実行できるため、ソースからのインストールは最近のPythonインストールで動作するはずです。

²SQLAlchemyのサポートは、主にクエリ機能に限定されています。完全なSQLAlchemy APIはサポートされていません。

³ClickHouse Connectは、現在サポートされているすべてのClickHouseバージョンに対してテストされています。HTTPプロトコルを使用しているため、他のほとんどのClickHouseバージョンでも正しく機能するはずですが、特定の高度なデータ型との間に不整合がある可能性があります。
### インストール {#installation}

PyPIからpipを使用してClickHouse Connectをインストールします。

`pip install clickhouse-connect`

ClickHouse Connectは、ソースからもインストールできます。
* [GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-connect)を`git clone`します。
* （オプション）C/Cythonの最適化をビルドして有効にするために、`pip install cython`を実行します。
* プロジェクトのルートディレクトリに`cd`し、`pip install .`を実行します。
### サポートポリシー {#support-policy}

ClickHouse Connectは現在ベータ版であり、現在のベータリリースのみが積極的にサポートされています。問題を報告する前に、最新バージョンに更新してください。問題は[GitHubプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)にファイルを提出してください。ClickHouse Connectの将来のリリースは、リリース時点でアクティブにサポートされているClickHouseのバージョンとの互換性が保証されます（一般的に、最新の3つの`stable`および2つの最新の`lts`リリース）。
### 基本的な使い方 {#basic-usage}
### 接続情報を集める {#gather-your-connection-details}

<ConnectionDetails />
#### 接続の確立 {#establish-a-connection}

ClickHouseへの接続には2つの例があります。
- localhost上のClickHouseサーバーに接続する。
- ClickHouse Cloudサービスに接続する。
##### localhost上のClickHouseサーバーに接続するためにClickHouse Connectクライアントインスタンスを使用する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### ClickHouse Cloudサービスに接続するためにClickHouse Connectクライアントインスタンスを使用する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
先に集めた接続情報を使用してください。ClickHouse CloudサービスにはTLSが必要なので、ポート8443を使用してください。
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### データベースと対話する {#interact-with-your-database}

ClickHouse SQLコマンドを実行するには、クライアントの`command`メソッドを使用します。

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、2次元配列の行と値を持つクライアントの`insert`メソッドを使用します。

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQLを使用してデータを取得するには、クライアントの`query`メソッドを使用します。

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse Connect Driver API {#clickhouse-connect-driver-api}

***注意:*** 大多数のAPIメソッドにおいて、キーワード引数を渡すことが推奨されます。引数の数が多く、ほとんどがオプションだからです。

*ここに記載されていないメソッドはAPIの一部と見なされておらず、削除または変更される可能性があります。*
### クライアントの初期化 {#client-initialization}

`clickhouse_connect.driver.client`クラスは、PythonアプリケーションとClickHouseデータベースサーバー間の主なインターフェースを提供します。`clickhouse_connect.get_client`関数を使用してClientインスタンスを取得します。この関数は、以下の引数を受け取ります。
#### 接続引数 {#connection-arguments}

| パラメータ             | 型         | デフォルト                       | 説明                                                                                                                                                                                                                                            |
|-----------------------|------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str        | http                          | httpまたはhttpsである必要があります。                                                                                                                                                                                                                                 |
| host                  | str        | localhost                     | ClickHouseサーバーのホスト名またはIPアドレスです。設定されていない場合は、`localhost`が使用されます。                                                                                                                                                            |
| port                  | int        | 8123または8443                  | ClickHouseのHTTPまたはHTTPSポート。設定されていない場合は、8123がデフォルトまたは*secure*=*True*または*interface*=*https*の場合は8443がデフォルトになります。                                                                                                                              |
| username              | str        | default                       | ClickHouseユーザー名。設定されていない場合、`default`のClickHouseユーザーが使用されます。                                                                                                                                                                      |
| password              | str        | *&lt;空文字列&gt;*            | *username*のパスワードです。                                                                                                                                                                                                                           |
| database              | str        | *None*                        | 接続のデフォルトデータベースです。設定されていない場合、ClickHouse Connectは*username*のデフォルトデータベースを使用します。                                                                                                                                  |
| secure                | bool       | False                         | https/TLSを使用します。この設定は、インターフェースやポート引数から推測された値をオーバーライドします。                                                                                                                                                                   |
| dsn                   | str        | *None*                        | 標準DSN（Data Source Name）形式の文字列です。設定されていない場合、この文字列から他の接続値（ホストやユーザーなど）が抽出されます。                                                                                           |
| compress              | boolまたはstr | True                          | ClickHouseのHTTP挿入およびクエリ結果の圧縮を有効にします。 [追加オプション（圧縮）](#compression) を参照してください。                                                                                                                                 |
| query_limit           | int        | 0（制限なし）                   | 任意の`query`応答に対して返される最大行数。これをゼロに設定すると、制限なしで行を返します。大きなクエリの制限は、結果がすべて一度にメモリに読み込まれるため、メモリ不足の例外を引き起こす可能性があります。 |
| query_retries         | int        | 2                             | `query`リクエストの最大再試行次数。再試行可能なHTTP応答のみが再試行されます。`command`や`insert`リクエストは、意図しない重複リクエストを防ぐため、自動的に再試行されません。                                 |
| connect_timeout       | int        | 10                            | HTTP接続のタイムアウト（秒単位）。                                                                                                                                                                                                                    |
| send_receive_timeout  | int        | 300                           | HTTP接続の送受信タイムアウト（秒単位）。                                                                                                                                                                                               |
| client_name           | str        | *None*                        | HTTPユーザーエージェントヘッダーにプレペンドされるclient_nameです。これを設定すると、ClickHouseのsystem.query_logでクエリを追跡できます。                                                                                                                              |
| pool_mgr              | obj        | *&lt;デフォルトプールマネージャ&gt;* | 使用する`urllib3`ライブラリのプールマネージャー。異なるホストに対する複数の接続プールが必要な高度なユースケース向け。                                                                                                                             |
| http_proxy            | str        | *None*                        | HTTPプロキシアドレス（HTTP_PROXY環境変数を設定するのと同等）。                                                                                                                                                                        |
| https_proxy           | str        | *None*                        | HTTPSプロキシアドレス（HTTPS_PROXY環境変数を設定するのと同等）。                                                                                                                                                                      |
| apply_server_timezone | bool       | True                          | タイムゾーンを意識したクエリ結果にサーバーのタイムゾーンを使用します。[タイムゾーンの優先順位](#time-zones)を参照してください。                                                                                                                                                          |
#### HTTPS/TLS引数 {#httpstls-arguments}

| パラメータ        | 型  | デフォルト | 説明                                                                                                                                                                                                                                                                       |
|------------------|-----|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLSを使用している場合、ClickHouseサーバーのTLS/SSL証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True*の場合、ClickHouseサーバー証明書を検証するための証明書機関のルートのファイルパス（.pem形式）。verifyがFalseの場合は無視されます。これは、ClickHouseサーバー証明書がオペレーティングシステムによって確認されたGlobally trusted rootの場合は必要ありません。 |
| client_cert      | str  | *None*  | ミューチャルTLS認証のためのTLSクライアント証明書の.pem形式でのファイルパス。ファイルには、中間証明書を含む完全な証明書チェーンが含まれている必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書のプライベートキーのファイルパス。プライベートキーがクライアント証明書のキー・ファイルに含まれていない場合に必要です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS証明書のCNまたはSNIによって識別されるClickHouseサーバーのホスト名。この設定により、異なるホスト名でプロキシまたはトンネルを通じて接続する際のSSLエラーを回避できます。                                                                                           |
| tls_mode         | str  | *None*  | 高度なTLS動作を制御します。`proxy`および`strict`は、ClickHouseのミューチャルTLS接続を要求せず、クライアント証明書と秘密鍵を送信します。`mutual`はClickHouseのミューチャルTLS認証をクライアント証明書で仮定します。デフォルトの動作は`mutual`です。                               |
#### 設定引数 {#settings-argument}

最後に、`get_client`の`settings`引数は、各クライアントリクエストのためにサーバーに追加のClickHouse設定を送信するために使用されます。ほとんどの場合、*readonly*=*1*アクセスを持つユーザーは、クエリとともに送信された設定を変更できないため、ClickHouse Connectは最終リクエストでそのような設定をドロップし、警告をログに記録します。以下の設定は、ClickHouse Connectによって使用されるHTTPクエリ/セッションにのみ適用され、一般的なClickHouse設定として文書化されていません。

| 設定           | 説明                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse ServerがHTTPチャネルに書き込む前に使用するバッファサイズ（バイト単位）。                                                                             |
| session_id        | サーバー上で関連するクエリを関連付けるためのユニークなセッションID。一時テーブルに必要です。                                                                   |
| compress          | ClickHouseサーバーがPOST応答データを圧縮すべきかどうか。この設定は「生」クエリに対してのみ使用する必要があります。                                        |
| decompress        | ClickHouseサーバーに送信されるデータが逆シリアル化（decompress）される必要があるかどうか。この設定は「生」挿入に対してのみ使用する必要があります。                                          |
| quota_key         | このリクエストに関連付けられたクォータキー。このクォータに関するClickHouseサーバーのドキュメントを参照してください。                                                                  |
| session_check     | セッションステータスを確認するために使用されます。                                                                                                                                |
| session_timeout   | セッションIDによって識別される無活動の秒数。この時間を超えるとタイムアウトし、有効と見なされなくなります。デフォルトは60秒です。                  |
| wait_end_of_query | ClickHouseサーバー上で完全な応答をバッファリングします。この設定はサマリー情報を返すために必要であり、ストリーミングでないクエリでは自動的に設定されます。 |

各クエリに送信できる他のClickHouseの設定については、[ClickHouseのドキュメント](/operations/settings/settings.md)を参照してください。
#### クライアント作成の例 {#client-creation-examples}

- パラメータなしで、ClickHouse Connectクライアントは`localhost`のデフォルトHTTPポートにデフォルトユーザーおよびパスワードなしで接続します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- セキュア（https）の外部ClickHouseサーバーに接続する

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- セッションIDや他のカスタム接続パラメータ、ClickHouse設定を使って接続する。

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
### 一般的なメソッド引数 {#common-method-arguments}

いくつかのクライアントメソッドは、一般的な`parameters`および`settings`引数のいずれかまたは両方を使用します。これらのキーワード引数は以下に説明します。
#### パラメータ引数 {#parameters-argument}

ClickHouse Connect Clientの`query*`および`command`メソッドは、ClickHouseの値式にPythonの式を結びつけるために使用される任意の`parameters`キーワード引数を受け入れます。2種類のバインディングが利用可能です。
##### サーバー側バインディング {#server-side-binding}

ClickHouseは、ほとんどのクエリ値に対して[サーバー側バインディング](/interfaces/cli.md#cli-queries-with-parameters)をサポートしています。バインドされた値は、クエリとは別にHTTPクエリパラメータとして送信されます。ClickHouse Connectは、`{&lt;name&gt;:&lt;datatype&gt;}`形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバー側バインディングの場合、`parameters`引数はPythonの辞書である必要があります。

- Pythonの辞書を用いたサーバー側バインディング、DateTime値と文字列値

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# サーバー上で以下のクエリが生成されます

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- サーバー側バインディングは、ClickHouseサーバーによって`SELECT`クエリのみにサポートされています。`ALTER`、`DELETE`、`INSERT`、および他のタイプのクエリには機能しません。将来的に変更される可能性があります。https://github.com/ClickHouse/ClickHouse/issues/42092を参照してください。
##### クライアント側バインディング {#client-side-binding}

ClickHouse Connectは、より柔軟なテンプレート化されたSQLクエリの生成を可能にするクライアント側パラメータバインディングもサポートしています。クライアント側バインディングの場合、`parameters`引数は辞書またはシーケンスである必要があります。クライアント側バインディングは、Pythonの["printf"スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)文字列フォーマットを使用してパラメータを置き換えます。

サーバー側バインディングとは異なり、クライアント側バインディングは、データベース識別子（データベース、テーブル、またはカラム名など）には機能しません。Pythonスタイルのフォーマットは異なるタイプの文字列を区別できないため、データベース識別子には異なるフォーマットが必要です（データベース識別子にはバックティックまたは二重引用符、データ値には単一引用符）。

- Pythonの辞書、DateTime値と文字列エスケープを使用した例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# 以下のクエリが生成されます：

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- Pythonのシーケンス（タプル）、Float64、IPv4Addressを使用した例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# 以下のクエリが生成されます：

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''
```

:::note
DateTime64引数（サブ秒精度を持つClickHouse型）をバインドするには、次の2つのカスタムアプローチのいずれかが必要です：
- Pythonの`datetime.datetime`値を新しいDT64Paramクラスでラップします。例えば：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書によるサーバー側バインディング
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストによるクライアント側バインディング 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - パラメータ値の辞書を使用する場合、パラメータ名に文字列`_64`を追加します。
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書によるサーバー側バインディング
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::
#### 設定引数 {#settings-argument-1}

すべての主要なClickHouse Connect Clientの"insert"および"select"メソッドは、含まれるSQL文のためにClickHouseサーバーの[ユーザー設定](/operations/settings/settings.md)を渡すためのオプションの`settings`キーワード引数を受け入れます。`settings`引数は、辞書である必要があります。各項目はClickHouse設定名とその関連する値です。値は、クエリパラメータとしてサーバーに送信されるときに文字列に変換されます。

クライアントレベルの設定と同様に、ClickHouse Connectは、サーバーが*readonly*=*1*とマークした設定をドロップし、関連するログメッセージを表示します。ClickHouseのHTTPインターフェースによるクエリにのみ適用される設定は常に有効です。これらの設定は、`get_client`の[API](#settings-argument)で説明されています。

ClickHouse設定の使用例：

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### クライアントの_command_メソッド {#client-_command_-method}

`Client.command`メソッドを使用して、通常はデータを返さないか、完全なデータセットではなく単一のプリミティブまたは配列値を返すClickHouse ServerにSQLクエリを送信します。このメソッドは、以下のパラメータを受け取ります：

| パラメータ     | 型             | デフォルト    | 説明                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *必須*     | 単一の値または単一の値の行を返すClickHouse SQLステートメントです。                                                                             |                                                                                                                                                                                                                                                                              |
| parameters    | dictまたはiterable | *None*     | [parametersの説明](#parameters-argument)を参照してください。                                                                                                           |
| data          | strまたはbytes     | *None*     | コマンドと一緒にPOST本文として含めるオプションのデータです。                                                                                                   |
| settings      | dict             | *None*     | [settingsの説明](#settings-argument)を参照してください。                                                                                                               |
| use_database  | bool             | True       | クライアントデータベース（クライアントを作成する際に指定）を使用します。Falseの場合、コマンドは接続されているユーザーのデフォルトClickHouse Serverデータベースを使用します。 |
| external_data | ExternalData     | *None*     | クエリに使用するファイルまたはバイナリデータを含むExternalDataオブジェクトです。  [高度なクエリ（外部データ）](#external-data)を参照してください。                          |

- _command_はDDLステートメントに使用できます。SQLの"command"がデータを返さない場合、"query summary"辞書が代わりに返されます。この辞書は、ClickHouseのX-ClickHouse-SummaryおよびX-ClickHouse-Query-Idヘッダー、`written_rows`、`written_bytes`、`query_id`というキー/値ペアをカプセル化しています。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_は単一の行のみを返すシンプルなクエリにも使用できます。

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```
### Client _query_ メソッド {#client-_query_-method}

`Client.query` メソッドは、ClickHouse サーバーから単一の「バッチ」データセットを取得するための主要な方法です。これは、HTTP 経由で Native ClickHouse フォーマットを使用して、大規模なデータセット（約 100 万行まで）を効率的に送信します。このメソッドは以下のパラメーターを取ります。

| パラメーター         | 型                 | デフォルト    | 説明                                                                                                                                                                          |
|---------------------|------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必須*      | ClickHouse SQL SELECT または DESCRIBE クエリ。                                                                                                                                       |
| parameters          | dict または iterable | *なし*     | [パラメーターの説明](#parameters-argument)を参照してください。                                                                                                                                |
| settings            | dict             | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                                                                    |                                                                                                                                                |
| query_formats       | dict             | *なし*     | 結果値のデータ型フォーマット仕様。詳細は Advanced Usage (Read Formats) を参照してください。                                                                                             |
| column_formats      | dict             | *なし*     | 各カラムのデータ型フォーマット。詳細は Advanced Usage (Read Formats) を参照してください。                                                                                               |
| encoding            | str              | *なし*     | ClickHouse の String カラムを Python の文字列にエンコードする際に使用するエンコーディング。設定しない場合、Python は `UTF-8` をデフォルトで使用します。                                                      |
| use_none            | bool             | True       | ClickHouse の null 値に対して Python の *None* 型を使用します。False にすると、ClickHouse の null 値に対してデフォルトのデータ型（例：0）を使用します。注意 - NumPy/Pandas ではパフォーマンスの理由からデフォルトが False になります。 |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなく、カラムのシーケンスとして返します。Python データを他の列指向データフォーマットに変換するのに役立ちます。                                                   |
| query_tz            | str              | *なし*     | `zoneinfo` データベースからのタイムゾーン名。このタイムゾーンは、クエリによって返されたすべての datetime または Pandas Timestamp オブジェクトに適用されます。                                       |
| column_tzs          | dict             | *なし*     | カラム名からタイムゾーン名への辞書。`query_tz` と同様ですが、異なるカラムに対して異なるタイムゾーンを指定することができます。                                                     |
| use_extended_dtypes | bool             | True       | Pandas の拡張データ型（StringArray など）や、ClickHouse の NULL 値に対して pandas.NA および pandas.NaT を使用します。`query_df` および `query_df_stream` メソッドにのみ適用されます。                  |
| external_data       | ExternalData     | *なし*     | クエリに使用するファイルやバイナリデータを含む ExternalData オブジェクト。[Advanced Queries (External Data)](#external-data) を参照してください。                                               |
| context             | QueryContext     | *なし*     | 上記のメソッド引数をカプセル化するために使用できる再利用可能な QueryContext オブジェクト。[Advanced Queries (QueryContexts)](#querycontexts) を参照してください。                                       |

#### QueryResult オブジェクト {#the-queryresult-object}

基本的な `query` メソッドは、以下の公共プロパティを持つ QueryResult オブジェクトを返します：

- `result_rows` -- 行のシーケンスとして返されたデータのマトリックスであり、各行要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスとして返されたデータのマトリックスであり、各カラム要素はそのカラムの行値のシーケンスです。
- `column_names` -- `result_set` 内のカラム名を表す文字列のタプルです。
- `column_types` -- `result_columns` 内の各カラムに対する ClickHouse データ型を表す ClickHouseType インスタンスのタプルです。
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブルでクエリを調査するために便利です）
- `summary` -- `X-ClickHouse-Summary` HTTP 応答ヘッダーによって返されたデータ
- `first_item` -- レスポンスの最初の行を辞書として取得するための便利なプロパティ（キーはカラム名です）
- `first_row` -- 結果の最初の行を返すための便利なプロパティ
- `column_block_stream` -- 列指向形式のクエリ結果のジェネレーター。このプロパティは直接参照すべきではありません（下記参照）。
- `row_block_stream` -- 行指向形式のクエリ結果のジェネレーター。このプロパティは直接参照すべきではありません（下記参照）。
- `rows_stream` -- 各呼び出しごとに単一の行を生成するクエリ結果のジェネレーター。このプロパティは直接参照すべきではありません（下記参照）。
- `summary` -- `command` メソッドの下で説明されている、ClickHouse によって返されたサマリー情報の辞書です。

`*_stream` プロパティは、返されたデータのイテレーターとして使用できる Python コンテキストを返します。これらは、クライアントの `*_stream` メソッドを使用して間接的にのみアクセスする必要があります。

ストリーミングクエリ結果の完全な詳細は、[Advanced Queries (Streaming Queries)](#streaming-queries) に記載されています。

### NumPy、Pandas、または Arrow でのクエリ結果の消費 {#consuming-query-results-with-numpy-pandas-or-arrow}

`query` メソッドには、3 つの特殊なバージョンがあります：

- `query_np` -- このバージョンは NumPy 配列を返します。ClickHouse Connect QueryResult ではなく。
- `query_df` -- このバージョンは Pandas DataFrame を返します。ClickHouse Connect QueryResult ではなく。
- `query_arrow` -- このバージョンは PyArrow テーブルを返します。ClickHouse の `Arrow` フォーマットを直接利用しているため、メインの `query` メソッドと共通する 3 つの引数（`query`、`parameters`、`settings`）のみを受け入れます。また、Arrow テーブルが ClickHouse の String タイプを文字列（`True` の場合）またはバイト（`False` の場合）としてレンダリングするかどうかを決定する追加の引数 `use_strings` があります。

### Client Streaming Query メソッド {#client-streaming-query-methods}

ClickHouse Connect クライアントは、データをストリームとして取得するための複数のメソッドを提供しています（Python ジェネレーターとして実装されています）：

- `query_column_block_stream` -- ネイティブ Python オブジェクトを使用して、カラムのシーケンスとしてクエリデータをブロックで返します。
- `query_row_block_stream` -- ネイティブ Python オブジェクトを使用して、行のブロックとしてクエリデータを返します。
- `query_rows_stream` -- ネイティブ Python オブジェクトを使用して、行のシーケンスとしてクエリデータを返します。
- `query_np_stream` -- 各 ClickHouse ブロックのクエリデータを NumPy 配列として返します。
- `query_df_stream` -- 各 ClickHouse ブロックのクエリデータを Pandas DataFrame として返します。
- `query_arrow_stream` -- PyArrow RecordBlocks でクエリデータを返します。

これらのメソッドのそれぞれは、ストリームを消費するために `with` ステートメントを介して開く必要がある `ContextStream` オブジェクトを返します。詳細と例については、[Advanced Queries (Streaming Queries)](#streaming-queries) を参照してください。

### Client _insert_ メソッド {#client-_insert_-method}

ClickHouse に複数のレコードを挿入する一般的な使用ケースのために、`Client.insert` メソッドがあります。これは以下のパラメーターを取ります：

| パラメーター         | 型                              | デフォルト    | 説明                                                                                                                                                                               |
|---------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table               | str                               | *必須*      | 挿入先の ClickHouse テーブル。データベースを含む完全なテーブル名が許可されます。                                                                                                     |
| data                | 行のシーケンス                    | *必須*      | 挿入するデータのマトリックスであり、各行はカラム値のシーケンス、または各カラムが行値のシーケンスであるカラムのシーケンスです。                                                              |
| column_names        | str のシーケンスまたは str         | '*'        | データマトリックスのカラム名のリスト。'*' を使用すると、ClickHouse Connect はテーブルのすべてのカラム名を取得するために「事前クエリ」を実行します。                                            |
| database            | str                               | ''         | 挿入の対象データベース。指定しない場合、クライアントのデータベースが使用されます。                                                                                                 |
| column_types        | Sequence of ClickHouseType        | *なし*     | ClickHouseType インスタンスのリスト。column_types または column_type_names のいずれも指定されない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するために「事前クエリ」を実行します。   |
| column_type_names   | Sequence of ClickHouse 種類名      | *なし*     | ClickHouse データ型名のリスト。column_types または column_type_names のいずれも指定されない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するために「事前クエリ」を実行します。 |
| column_oriented     | bool                              | False      | True の場合、`data` 引数はカラムのシーケンスであると想定され（データを挿入するために「ピボット」する必要はなくなります）、それ以外の場合、`data` は行のシーケンスとして解釈されます。            |
| settings            | dict                              | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                                                                   |
| insert_context      | InsertContext                     | *なし*     | 上記のメソッド引数をカプセル化するために使用できる再利用可能な InsertContext オブジェクトです。[Advanced Inserts (InsertContexts)](#insertcontexts) を参照してください。                             |

このメソッドは、「クエリサマリー」辞書を返します。これは「command」メソッドの下で説明されています。挿入が何らかの理由で失敗した場合、例外が発生します。

メインの `insert` メソッドには、以下の 2 つの特殊なバージョンがあります：

- `insert_df` -- Python の行のシーケンスの `data` 引数の代わりに、このメソッドの 2 番目のパラメーターは Pandas DataFrame インスタンスである必要があります。ClickHouse Connect は DataFrame をカラム指向のデータソースとして自動的に処理するため、`column_oriented` パラメーターは必要ありませんし、利用可能でもありません。
- `insert_arrow` -- Python の行のシーケンスの `data` 引数の代わりに、このメソッドは `arrow_table` を要求します。ClickHouse Connect は Arrow テーブルをそのまま ClickHouse サーバーに渡して処理するため、`table` と `arrow_table` に加えて `database` および `settings` 引数のみが利用可能です。

*注意:* NumPy 配列は有効な行のシーケンスであり、メインの `insert` メソッドの `data` 引数として使用することができます。そのため、特殊なメソッドは必須ではありません。

### ファイル挿入 {#file-inserts}

`clickhouse_connect.driver.tools` には、ファイルシステムから既存の ClickHouse テーブルに直接データを挿入するための `insert_file` メソッドが含まれています。解析は ClickHouse サーバーに委任されます。`insert_file` は以下のパラメーターを受け入れます：

| パラメーター    | 型            | デフォルト           | 説明                                                                                                                                          |
|-----------------|-----------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| client          | Client          | *必須*            | 挿入を実行するための `driver.Client`                                                                                                          |
| table           | str             | *必須*            | 挿入先の ClickHouse テーブル。データベースを含む完全なテーブル名が許可されます。                                                                  |
| file_path       | str             | *必須*            | データファイルへのネイティブファイルシステムパス                                                                                                                                       |
| fmt             | str             | CSV, CSVWithNames | ファイルの ClickHouse 入力フォーマット。`column_names` が提供されない場合は CSVWithNames が仮定されます。                                                      |
| column_names    | str のシーケンス | *なし*            | データファイル内のカラム名のリスト。カラム名を含む形式には必要ありません。                                                                                              |
| database        | str             | *なし*            | テーブルのデータベース。テーブルが完全に修飾されている場合は無視されます。指定しない場合、挿入はクライアントデータベースを使用します。                  |
| settings        | dict            | *なし*            | [設定の説明](#settings-argument) を参照してください。                                                                                                 |
| compression     | str             | *なし*            | Content-Encoding HTTP ヘッダーに使用される認識された ClickHouse 圧縮タイプ （zstd、lz4、gzip）                                                                                       |

不正確なデータや異常な形式の日付/時刻値を含むファイルの場合、データインポートに適用される設定（`input_format_allow_errors_num` や `input_format_allow_errors_num` など）がこのメソッドで認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

### クエリ結果をファイルとして保存 {#saving-query-results-as-files}

`raw_stream` メソッドを使用して、ClickHouse からローカルファイルシステムにファイルをストリームすることができます。たとえば、クエリの結果を CSV ファイルに保存したい場合、次のコードスニペットを使用できます：

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # または CSV、または CSVWithNamesAndTypes、または TabSeparated など
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上記のコードは、以下の内容を持つ `output.csv` ファイルを生成します：

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats#tabseparated) やその他のフォーマットでデータを保存することができます。すべての利用可能なフォーマットオプションの概要については、[Formats for Input and Output Data](/interfaces/formats) を参照してください。

### Raw API {#raw-api}

ClickHouse データとネイティブまたはサードパーティのデータ型や構造の間で変換を必要としないユースケースの場合、ClickHouse Connect クライアントは、ClickHouse 接続を直接使用するための 2 つのメソッドを提供します。

#### Client _raw_query_ メソッド {#client-_raw_query_-method}

`Client.raw_query` メソッドを使用すると、クライアント接続を介して ClickHouse の HTTP クエリインターフェースを直接使用できます。返される値は未処理の `bytes` オブジェクトです。これは、パラメーターバインディング、エラーハンドリング、リトライ、および設定管理を最小限のインターフェースで提供する便利なラッパーです：

| パラメーター     | 型             | デフォルト    | 説明                                                                                                                                      |
|-------------------|------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| query             | str              | *必須*      | 有効な ClickHouse クエリ                                                                                                                 |
| parameters        | dict または iterable | *なし*     | [パラメーターの説明](#parameters-argument)を参照してください。                                                                                   |
| settings          | dict             | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                       |                                                                                                                                                |
| fmt               | str              | *なし*     | 返されたバイトの ClickHouse 出力フォーマット。指定されない場合、ClickHouse は TSV を使用します。                                               |
| use_database      | bool             | True       | クエリコンテキストに対して Clickhouse-connect クライアントに割り当てられたデータベースを使用します                                                                 |
| external_data     | ExternalData     | *なし*     | クエリに使用するファイルやバイナリデータを含む ExternalData オブジェクト。[Advanced Queries (External Data)](#external-data)を参照してください。 |

結果の `bytes` オブジェクトを処理するのは呼び出し元の責任です。`Client.query_arrow` は、このメソッドを ClickHouse の `Arrow` 出力フォーマットを使用するための薄いラッパーであることに注意してください。

#### Client _raw_stream_ メソッド {#client-_raw_stream_-method}

`Client.raw_stream` メソッドは、`raw_query` メソッドと同じ API を持っていますが、`bytes` オブジェクトの生成器/ストリームソースとして使用できる `io.IOBase` オブジェクトを返します。現在、これは `query_arrow_stream` メソッドによって利用されています。

#### Client _raw_insert_ メソッド {#client-_raw_insert_-method}

`Client.raw_insert` メソッドは、クライアント接続を使用して `bytes` オブジェクトや `bytes` オブジェクトのジェネレーターを直接挿入することを許可します。ペイロードの処理を行わないため、非常に高パフォーマンスです。このメソッドでは、設定および挿入フォーマットを指定するオプションを提供します：

| パラメーター    | 型                                   | デフォルト    | 説明                                                                                                                                  |
|-------------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                                    | *必須*      | 簡単なテーブル名またはデータベース修飾付きのテーブル名                                                                                                                                  |
| column_names       | Sequence[str]                          | *なし*     | 挿入ブロックのカラム名。`fmt` パラメーターに名前が含まれていない場合は必須です。                                                                       |
| insert_block       | str、bytes、Generator[bytes]、BinaryIO | *必須*      | 挿入するデータ。文字列はクライアントエンコーディングで符号化されます。                                                                           |
| settings           | dict                                   | *なし*     | [設定の説明](#settings-argument) を参照してください。                                                                                                                |                                                                                                                                                |
| fmt                | str                                    | *なし*     | `insert_block` のバイトの ClickHouse 入力フォーマット。指定されない場合、ClickHouse は TSV を使用します。                                                         |

`insert_block` が指定されたフォーマットおよび圧縮メソッドを使用している責任は呼び出し元にあります。ClickHouse Connect は、ファイルのアップロードや PyArrow テーブルのためにこれらの生挿入を使用し、解析を ClickHouse サーバーに委ねます。

### ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスと関数は、"public" `clickhouse-connect` API の一部とも見なされ、上記で文書化されたクラスとメソッドと同様に、マイナー リリースを通じて安定しています。これらのクラスと関数に対する破壊的な変更は、マイナーリリースによってのみ行われ（パッチリリースではなく）、少なくとも 1 回のマイナーリリースの間、非推奨のステータスで利用可能になります。

#### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0 仕様で定義されたものを含む）は、`clickhouse_connect.driver.exceptions` モジュールで定義されています。ドライバーによって実際に検出された例外は、これらの型のいずれかを使用します。

#### Clickhouse SQLユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュールの関数と DT64Param クラスを使用して、ClickHouse SQL クエリを適切に構築およびエスケープできます。同様に、`clickhouse_connect.driver.parser` モジュールの関数を使用して、ClickHouse データ型名を解析できます。

### マルチスレッド、マルチプロセス、および非同期/イベント駆動型ユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect は、マルチスレッド、マルチプロセス、およびイベントループ駆動/非同期アプリケーションでよく機能します。すべてのクエリおよび挿入処理は単一のスレッド内で行われるため、操作は一般的にスレッドセーフです。（一部の操作の並行処理は、パフォーマンスペナルティを克服するための将来の強化の可能性がありますが、その場合でもスレッドセーフは維持されます）。

各クエリまたは挿入は、それぞれ独自の QueryContext または InsertContext オブジェクト内で状態を保持します。これらの補助オブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有するべきではありません。コンテキストオブジェクトについての追加の議論については、以下のセクションを参照してください。

さらに、同時に 2 つ以上のクエリや挿入が「フライト中」には、次の 2 つの考慮事項があります。最初はクエリ/挿入に関連付けられた ClickHouse「セッション」であり、2 番目は ClickHouse Connect クライアントインスタンスによって使用される HTTP 接続プールです。

### AsyncClient ラッパー {#asyncclient-wrapper}

0.7.16 以降、ClickHouse Connect は、通常の `Client` に対する非同期ラッパーを提供しているため、`asyncio` 環境でクライアントを使用できるようになっています。

`AsyncClient` のインスタンスを取得するには、標準の `get_client` と同じパラメーターを受け入れる `get_async_client` ファクトリ関数を使用できます：

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` は、標準の `Client` と同じメソッドとパラメーターを持っていますが、適用可能な場合はコルーチンです。内部的に、I/O 操作を行う `Client` のメソッドは、[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 呼び出しでラップされています。

`AsyncClient` ラッパーを使用すると、実行スレッドと GIL が I/O 操作の完了を待つ間、解放されるため、マルチスレッドパフォーマンスが向上します。

注意: 通常の `Client` と異なり、`AsyncClient` はデフォルトで `autogenerate_session_id` を `False` に強制します。

参照: [run_async の例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。

### ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

各 ClickHouse クエリは ClickHouse「セッション」のコンテキスト内で実行されます。現在、セッションは 2 つの目的で使用されます：
- 特定の ClickHouse 設定を複数のクエリに関連付けるため（[ユーザー設定](/operations/settings/settings.md)を参照）。ClickHouse の `SET` コマンドを使用して、ユーザーセッションの範囲内で設定を変更します。
- [一時テーブル](/sql-reference/statements/create/table#temporary-tables)を追跡するため。

デフォルトでは、ClickHouse Connect クライアントインスタンスで実行される各クエリは、同じセッション ID を使用してこのセッション機能を有効にします。つまり、`SET` ステートメントや一時テーブルの作業は、単一の ClickHouse クライアントを使用する場合に期待通りに動作します。ただし、設計上、ClickHouse サーバーでは同じセッション内での並行クエリを許可していません。
そのため、同時にクエリを実行する ClickHouse Connect アプリケーションには、2 つのオプションがあります。

- 各実行スレッド（スレッド、プロセス、またはイベントハンドラー）ごとに独自のセッション ID を持つ別の `Client` インスタンスを作成します。これが一般的に最善のアプローチです。各クライアントのセッション状態を保持します。
- 各クエリに対してユニークなセッション ID を使用します。一時テーブルや共有セッション設定が必要ない場合に、同時セッションの問題を回避します。（共有設定はクライアント作成時にも提供できますが、これらは各リクエストと一緒に送信され、セッションに関連付けられません）。ユニークな session_id は、各リクエストの `settings` 辞書に追加することができます。または、共通設定の `autogenerate_session_id` を無効にすることができます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # これはクライアント作成前に常に設定する必要があります
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

この場合、ClickHouse Connect はセッション ID を送信せず、ClickHouse サーバーによってランダムなセッション ID が生成されます。再度、一時テーブルおよびセッションレベルの設定は使用できなくなります。

### HTTP 接続プールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connect は、サーバーへの基礎となる HTTP 接続を処理するために `urllib3` 接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスは同じ接続プールを共有し、これはほとんどのユースケースに対して十分です。このデフォルトプールは、アプリケーションによって使用される各 ClickHouse サーバーに最大 8 の HTTP Keep Alive 接続を維持します。

大規模なマルチスレッドアプリケーションには、別々の接続プールが適している場合があります。カスタマイズされた接続プールは、主な `clickhouse_connect.get_client` 関数への `pool_mgr` キーワード引数として提供できます：

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例で示されているように、クライアントはプールマネージャーを共有することも、各クライアントのために別々のプールマネージャーを作成することもできます。プールマネージャーを作成するときに利用可能なオプションの詳細については、[`urllib3` ドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。

## ClickHouse Connect を使用したデータのクエリ： 高度な使用法 {#querying-data-with-clickhouse-connect--advanced-usage}

### QueryContexts {#querycontexts}

ClickHouse Connect は、QueryContext 内で標準クエリを実行します。QueryContext には、ClickHouse データベースに対してクエリを構築するために使用される重要な構造と、結果を QueryResult または他の応答データ構造に処理するための構成が含まれています。それには、クエリ自体、パラメーター、設定、読み取りフォーマット、その他のプロパティが含まれます。

QueryContext は、クライアントの `create_query_context` メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメーターを取ります。このクエリコンテキストは、その後、`query`、`query_df`、または `query_np` メソッドに、他の引数の代わりに `context` キーワード引数として渡すことができます。メソッド呼び出しのために指定された追加の引数は、QueryContext のプロパティを上書きすることに注意してください。

QueryContext の最も明確な使用ケースは、異なるバインディングパラメーター値で同じクエリを送信することです。すべてのパラメーター値は、`QueryContext.set_parameters` メソッドを呼び出して辞書で更新できます。また、`key`, `value` ペアを持つ `QueryContext.set_parameter` メソッドを呼び出して、単一の値を更新できます。

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

QueryContexts はスレッドセーフではありませんが、`QueryContext.updated_copy` メソッドを呼び出すことによってマルチスレッド環境でコピーを取得できます。

### ストリーミングクエリ {#streaming-queries}
#### データブロック {#data-blocks}
ClickHouse Connect は、主な `クエリ` メソッドからのすべてのデータを、ClickHouse サーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouse との間でカスタムの「ネイティブ」フォーマットで送信されます。「ブロック」とは、指定されたデータ型のデータ値が均等に含まれるバイナリデータのカラムのシーケンスに過ぎません。（列指向のデータベースである ClickHouse は、このデータを同様の形で保存します。） クエリから返されるブロックのサイズは、ユーザー設定に従って決定され、これはいくつかのレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定できます。それらは次の通りです：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行のブロックのサイズに対する制限。デフォルトは 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- バイト単位でのブロックのサイズに対するソフト制限。デフォルトは 1,000,0000。

`preferred_block_size_setting` に関わらず、各ブロックは `max_block_size` 行を超えることはありません。クエリの種類によって、実際に返されるブロックのサイズはさまざまです。たとえば、多くのシャードをカバーする分散テーブルへのクエリは、各シャードから直接取得された小さなブロックを含む場合があります。

クライアントの `query_*_stream` メソッドのいずれかを使用する際は、結果がブロックごとに返されます。ClickHouse Connect は一度に単一のブロックのみをロードします。これにより、大きな結果セット全体をメモリに読み込むことなく、大量のデータを処理できます。アプリケーションは任意の数のブロックを処理する準備をしておく必要があり、各ブロックの正確なサイズを制御することはできません。
#### HTTP データバッファの遅延処理 {#http-data-buffer-for-slow-processing}

HTTP プロトコルの制限により、ブロックが ClickHouse サーバーがデータをストリーミングするレートよりも大幅に遅い速度で処理される場合、ClickHouse サーバーは接続を閉じ、その結果、処理スレッドで例外がスローされます。これの一部は、共通の `http_buffer_size` 設定を使用して、HTTP ストリーミングバッファのバッファサイズを増やすことで緩和できます（デフォルトは 10 メガバイト）。十分なメモリがアプリケーションに利用可能な場合、大きな `http_buffer_size` 値はこの状況で問題ないはずです。バッファ内のデータは、`lz4` または `zstd` 圧縮を使用している場合、圧縮された状態で保存されるため、これらの圧縮タイプを使用することで全体のバッファが増加します。
#### StreamContexts {#streamcontexts}

すべての `query_*_stream` メソッド（`query_row_block_stream` など）は、ClickHouse の `StreamContext` オブジェクトを返します。これは、Python のコンテキスト / ジェネレーターの組み合わせです。基本的な使用法は次のとおりです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <行の各 Python トリップデータを使って何かを行う>
```

StreamContext を `with` 文なしで使用しようとするとエラーが発生します。Python コンテキストを使用することで、ストリーム（この場合、ストリーミング HTTP 応答）がすべてのデータが消費されなかった場合や、処理中に例外が発生した場合でも、適切に閉じられます。また、StreamContexts はストリームを消費するために一度しか使用できません。一度抜けた StreamContext を再利用しようとすると `StreamClosedError` が発生します。

StreamContext の `source` プロパティを使用して、カラム名やタイプを含む親 `QueryResult` オブジェクトにアクセスできます。
#### ストリームタイプ {#stream-types}

`query_column_block_stream` メソッドは、ネイティブの Python データ型で格納されたカラムデータのシーケンスとしてブロックを返します。上記の `taxi_trips` クエリを使用すると、返されたデータは、リストの各要素が関連するカラムのすべてのデータを含む別のリスト（またはタプル）です。したがって、`block[0]` は単なる文字列のみを含むタプルになります。カラム指向のフォーマットは、カラム内のすべての値の集約操作（合計運賃の加算など）を行うのに最も頻繁に使用されます。

`query_row_block_stream` メソッドは、従来のリレーショナルデータベースのように行のシーケンスとしてブロックを返します。タクシートリップの場合、返されたデータは、リストの各要素がデータの行を表す別のリストです。したがって、`block[0]` は最初のタクシートリップのすべてのフィールド（順番どおり）を含み、`block[1]` には 2 番目のタクシートリップにおけるすべてのフィールドの行が含まれます。そしてこのように続きます。行指向の結果は通常、表示または変換プロセスに使用されます。

`query_row_stream` は利便性のためのメソッドで、ストリームを反復しているときに自動的に次のブロックに移動します。それ以外は、`query_row_block_stream` と同一です。

`query_np_stream` メソッドは、各ブロックを 2 次元の NumPy 配列として返します。内部的に NumPy 配列は（通常）カラムとして保存されるため、特別な行またはカラムメソッドは必要ありません。NumPy 配列の「形状」は、(columns, rows) として表されます。NumPy ライブラリは NumPy 配列を操作するための多くのメソッドを提供しています。クエリ内のすべてのカラムが同じ NumPy dtype を共有している場合、返される NumPy 配列もまた単一の dtype を持ち、その内部構造を実際に変更することなく再形成 / 回転することができます。

`query_df_stream` メソッドは、各 ClickHouse ブロックを 2 次元の Pandas DataFrame として返します。以下の例は、StreamContext オブジェクトが遅延的に（しかし一度だけ）コンテキストとして使用されることを示しています。

最後に、`query_arrow_stream` メソッドは、ClickHouse の `ArrowStream` フォーマットの結果を pyarrow.ipc.RecordBatchStreamReader にラップして StreamContext として返します。ストリームの各反復で PyArrow RecordBlock が返されます。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <pandas DataFrame を使って何かを行う>
```
### リードフォーマット {#read-formats}

リードフォーマットは、クライアントの `query`、`query_np`、および `query_df` メソッドから返される値のデータ型を制御します。 (`raw_query` と `query_arrow` は ClickHouse からの受信データを変更しないため、フォーマット制御は適用されません。) たとえば、UUID のリードフォーマットをデフォルトの `native` フォーマットから代替の `string` フォーマットに変更すると、ClickHouse のクエリの `UUID` カラムは Python の UUID オブジェクトの代わりに、文字列値（標準の 8-4-4-4-12 RFC 1422 フォーマットを使用）として返されます。

任意のフォーマット関数に対する「データ型」引数にはワイルドカードを含めることができます。フォーマットは単一の小文字の文字列です。

リードフォーマットは、いくつかのレベルで設定できます：

- グローバルに、`clickhouse_connect.datatypes.format` パッケージで定義されたメソッドを使用して。これにより、すべてのクエリに対する構成されたデータ型のフォーマットが制御されます。
```python
from clickhouse_connect.datatypes.format import set_read_format


# IPv6 と IPv4 の値を文字列として返す
set_read_format('IPv*', 'string')


# すべての Date 型を基になるエポック秒またはエポック日として返す
set_read_format('Date*', 'int')
```
- クエリ全体について、オプションの `query_formats` 辞書引数を使用して。 この場合、指定されたデータ型の任意のカラム（またはサブカラム）は構成されたフォーマットを使用します。
```python

# 任意の UUID カラムを文字列として返す
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- 特定のカラムの値について、オプションの `column_formats` 辞書引数を使用して。キーは ClickHouse によって返されたカラム名で、フォーマットはデータカラム用、または ClickHouse タイプ名とクエリフォーマットの値の第 2 レベルの「フォーマット」辞書です。この二次辞書は、タプルやマップなどのネストされたカラムタイプに使用できます。
```python

# `dev_address` カラムの IPv6 値を文字列として返す
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```
#### リードフォーマットオプション（Python タイプ） {#read-format-options-python-types}

| ClickHouse 型       | ネイティブ Python 型    | リードフォーマット | コメント                                                                                                          |
|--------------------|-----------------------|--------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -                  |                                                                                                                   |
| UInt64             | int                   | signed             | サブセットは現在、大きな符号なしの UInt64 値を扱っていません                                                    |
| [U]Int[128,256]   | int                   | string             | Pandas および NumPy の int 値は最大 64 ビットのため、これらは文字列として返されることがあります                             |
| Float32            | float                 | -                  | すべての Python 浮動小数点数は内部的に 64 ビットです                                                              |
| Float64            | float                 | -                  |                                                                                                                   |
| Decimal            | decimal.Decimal       | -                  |                                                                                                                   |
| String             | string                | bytes              | ClickHouse String カラムには固有のエンコーディングがないため、可変長のバイナリデータにも使用されます                   |
| FixedString        | bytes                 | string             | FixedStrings は固定サイズのバイト配列ですが、Python の文字列として扱われることもあります                        |
| Enum[8,16]        | string                | string, int        | Python の列挙型は空の文字列を受け付けないため、すべての列挙型は文字列または基になる整数値のいずれかとして表示されます。   |
| Date               | datetime.date         | int                | ClickHouse は日付を 1970 年 01 月 01 日以降の日数として保存します。この値は整数として利用可能です                   |
| Date32             | datetime.date         | int                | Date と同様ですが、より広い範囲の日付に対応しています                                                              |
| DateTime           | datetime.datetime     | int                | ClickHouse は DateTime をエポック秒で保存します。この値は整数として利用可能です                                     |
| DateTime64         | datetime.datetime     | int                | Python の datetime.datetime はマイクロ秒精度に制限されています。生の 64 ビット整数値が利用可能です                  |
| IPv4               | `ipaddress.IPv4Address` | string             | IP アドレスは文字列として読み取ることができ、適切にフォーマットされた文字列は IP アドレスとして挿入できます       |
| IPv6               | `ipaddress.IPv6Address` | string             | IP アドレスは文字列として読み取ることができ、適切にフォーマットされたものは IP アドレスとして挿入できます         |
| Tuple              | dict or tuple         | tuple, json        | 名前付きタプルはデフォルトでは辞書として返されます。名前付きタプルは JSON 文字列として返すこともできます            |
| Map                | dict                  | -                  |                                                                                                                   |
| Nested             | Sequence[dict]        | -                  |                                                                                                                   |
| UUID               | uuid.UUID             | string             | UUID は RFC 4122 に従ってフォーマットされた文字列として読み取ることができます<br/>                                   |
| JSON               | dict                  | string             | デフォルトでは Python 辞書が返されます。  `string` フォーマットでは JSON 文字列が返されます                        |
| Variant            | object                | -                  | 値のために格納されている ClickHouse データ型に対する一致する Python タイプが返されます                            |
| Dynamic            | object                | -                  | 値のために格納されている ClickHouse データ型に対する一致する Python タイプが返されます                            |
### 外部データ {#external-data}

ClickHouse のクエリは、任意の ClickHouse フォーマットで外部データを受け入れます。このバイナリデータは、データを処理するために使用されるクエリ文字列と一緒に送信されます。外部データ機能の詳細は [こちら](/engines/table-engines/special/external-data.md) にあります。クライアントの `query*` メソッドは、この機能を利用するためにオプションの `external_data` パラメーターを受け入れます。`external_data` パラメーターの値は、`clickhouse_connect.driver.external.ExternalData` オブジェクトである必要があります。このオブジェクトのコンストラクタは、次の引数を受け取ります：

| 名前      | 型              | 説明                                                                                                                                           |
|-----------|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str              | 外部データを読み取るためのローカルシステムパス上のファイルへのパス。 `file_path` または `data` のいずれかが必要です                             | 
| file_name | str              | 外部データの「ファイル」の名前。提供されない場合は、`file_path` から（拡張子なしで）決定されます                                               |
| data      | bytes            | （ファイルからではなく）バイナリ形式の外部データ。 `data` または `file_path` のいずれかが必要です                                            |
| fmt       | str              | データの ClickHouse [入力フォーマット](/sql-reference/formats.mdx)。デフォルトは `TSV`                                                       |
| types     | str または str のシーケンス | 外部データ内のカラムデータ型のリスト。文字列の場合、型はカンマで区切られるべきです。 `types` または `structure` のいずれかが必要です |
| structure | str または str のシーケンス | データ内のカラム名とデータ型のリスト（例を参照）。 `structure` または `types` のいずれかが必要です                                           |
| mime_type | str              | ファイルデータのオプションの MIME タイプ。現在 ClickHouse はこの HTTP サブヘッダーを無視します                                                    |


外部の CSV ファイルに "movie" データが含まれているクエリを送信し、そのデータを ClickHouse サーバーに既に存在する `directors` テーブルと結合するには、次のようにします：

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

最初の ExternalData オブジェクトに追加の外部データファイルを `add_file` メソッドを使用して追加できます。このメソッドは、コンストラクタと同じパラメータを受け取ります。HTTP の場合、すべての外部データは `multi-part/form-data` ファイルアップロードの一部として送信されます。
### タイムゾーン {#time-zones}
ClickHouse の DateTime および DateTime64 値にタイムゾーンを適用するための複数のメカニズムがあります。内部的に、ClickHouse サーバーは、エポック（1970 年 01 月 01 日 00:00:00 UTC 時間）以来の秒数を表す時間帯に無知な数として、すべての DateTime または DateTime64 オブジェクトを保存します。DateTime64 の値に対しては、精度に応じてエポック以来のミリ秒、マイクロ秒、またはナノ秒の表現が行われます。そのため、タイムゾーン情報の適用は常にクライアント側で行われます。これは重要な追加計算を伴うため、パフォーマンスが重要なアプリケーションでは、ユーザーの表示や変換（例えば、Pandas Timestamps は常にエポックナノ秒を表す64ビット整数を表します）を除いて、DateTime 型をエポックタイムスタンプとして扱うことが推奨されます。

クエリでタイムゾーンを意識したデータ型を使用する場合 - 特に Python の `datetime.datetime` オブジェクト場合 - `clickhouse-connect` は以下の優先順位のルールに従ってクライアント側のタイムゾーンを適用します：

1. クエリメソッドパラメータ `client_tzs` が指定されている場合、特定のカラムタイムゾーンが適用されます
2. ClickHouse カラムにタイムゾーンメタデータがある場合（例： DateTime64(3, 'America/Denver') のように）、ClickHouse カラムタイムゾーンが適用されます。（このタイムゾーンメタデータは、ClickHouse バージョン 23.2 より以前の DateTime カラムに対しては clickhouse-connect で利用できません）
3. クエリメソッドパラメータ `query_tz` が指定されている場合、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションに対してタイムゾーン設定が適用されている場合、そのタイムゾーンが適用されます。（この機能はまだ ClickHouse サーバーでは公開されていません）
5. 最後に、クライアントの `apply_server_timezone` パラメータが True に設定されている場合（デフォルト）、ClickHouse サーバーのタイムゾーンが適用されます。

これらのルールに基づいて適用されたタイムゾーンが UTC の場合、`clickhouse-connect` は _常に_ タイムゾーンに無知な Python の `datetime.datetime` オブジェクトを返します。その後、アプリケーションコードによってこのタイムゾーンに無知なオブジェクトに追加のタイムゾーン情報を追加できます。
## ClickHouse Connect を使用したデータの挿入：高度な使用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### InsertContexts {#insertcontexts}

ClickHouse Connect は、すべての挿入を InsertContext 内で実行します。InsertContext には、クライアントの `insert` メソッドに引数として送信されるすべての値が含まれます。さらに、InsertContext が最初に構築されると、ClickHouse Connect は効率的なネイティブ形式の挿入に必要な挿入カラムのデータ型を取得します。InsertContext を使い回すことで、こうした「事前クエリ」を回避し、挿入はより迅速かつ効率的に実行されます。

InsertContext は、クライアントの `create_insert_context` メソッドを使用して取得できます。このメソッドは `insert` 関数と同じ引数を受け取ります。再利用のために変更すべきは InsertContexts の `data` プロパティのみであることに注意してください。これは、同じテーブルに新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供することが本来の目的に沿っています。

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

InsertContexts には挿入プロセス中に更新される可変状態が含まれているため、スレッドセーフではありません。
### 書き込みフォーマット {#write-formats}
書き込みフォーマットは、現在限られた数の型に対して実装されています。ほとんどのケースで、ClickHouse Connect は最初の（NULL でない）データ値の型をチェックすることで、カラムに対する正しい書き込みフォーマットを自動的に決定しようとします。たとえば、DateTime カラムに挿入する際に、カラムの最初の挿入値が Python 整数の場合、ClickHouse Connect は実際にエポック秒であるとの仮定のもとで、整数値を直接挿入します。

ほとんどのケースでは、データ型の書き込みフォーマットをオーバーライドする必要はありませんが、`clickhouse_connect.datatypes.format` パッケージ内の関連メソッドを使用して、グローバルなレベルで行うことができます。
#### 書き込みフォーマットオプション {#write-format-options}

| ClickHouse 型       | ネイティブ Python 型    | 書き込みフォーマット | コメント                                                                                                      |
|---------------------|-----------------------|---------------------|----------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -                   |                                                                                                                |
| UInt64              | int                   |                     |                                                                                                                |
| [U]Int[128,256]    | int                   |                     |                                                                                                                |
| Float32             | float                 |                     |                                                                                                                |
| Float64             | float                 |                     |                                                                                                                |
| Decimal             | decimal.Decimal       |                     |                                                                                                                |
| String              | string                |                     |                                                                                                                |
| FixedString         | bytes                 | string              | 文字列として挿入された場合、追加のバイトはゼロに設定されます                                                  |
| Enum[8,16]         | string                |                     |                                                                                                                |
| Date                | datetime.date         | int                 | ClickHouse は日付を 1970 年 01 月 01 日以来の日数として保存します。int 型はこの「エポック日」値として仮定されます |
| Date32              | datetime.date         | int                 | Date と同じですが、より広い範囲の日付に対応しています                                                          |
| DateTime            | datetime.datetime     | int                 | ClickHouse は DateTime をエポック秒で保存します。int 型はこの「エポック秒」値として仮定されます                |
| DateTime64          | datetime.datetime     | int                 | Python の datetime.datetime はマイクロ秒精度に制限されています。生の 64 ビット整数値が利用可能です            |
| IPv4                | `ipaddress.IPv4Address` | string              | 適切にフォーマットされた文字列は IPv4 アドレスとして挿入できます                                             |
| IPv6                | `ipaddress.IPv6Address` | string              | 適切にフォーマットされた文字列は IPv6 アドレスとして挿入できます                                             |
| Tuple               | dict or tuple         |                     |                                                                                                                |
| Map                 | dict                  |                     |                                                                                                                |
| Nested              | Sequence[dict]        |                     |                                                                                                                |
| UUID                | uuid.UUID             | string              | 適切にフォーマットされた文字列は ClickHouse UUID として挿入できます                                          |
| JSON/Object('json') | dict                  | string              | 辞書または JSON 文字列は JSON カラムに挿入できます（注： `Object('json')` は非推奨です）                     |
| Variant             | object                |                     | 現在、すべてのバリアントは文字列として挿入され、ClickHouse サーバーによって解析されます                     |
| Dynamic             | object                |                     | 警告 -- 現在、Dynamic カラムへの挿入は ClickHouse String として永続化されます                               |
## 追加オプション {#additional-options}

ClickHouse Connect は、高度なユースケース向けにいくつかの追加オプションを提供します。
### グローバル設定 {#global-settings}

ClickHouse Connect の動作をグローバルに制御する少数の設定があります。これらは、トップレベルの `common` パッケージからアクセスされます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの一般的な設定 `autogenerate_session_id`、`product_name`、および `readonly` は、`clickhouse_connect.get_client` メソッドでクライアントを作成する前に _常に_ 変更する必要があります。クライアント作成後にこれらの設定を変更しても、既存のクライアントの動作には影響しません。
:::

現在、10 のグローバル設定が定義されています：

| 設定名                    | デフォルト | オプション                 | 説明                                                                                                                                                                                                                                                                |
|--------------------------|-----------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id  | True      | True, False               | 提供されていない場合、各クライアントセッションに対して新しい UUID(1) セッション ID を自動生成します。クライアントまたはクエリレベルでセッション ID が提供されていない場合、ClickHouse は各クエリに対してランダムな内部 ID を生成します                                               |
| invalid_setting_action   | 'error'   | 'drop', 'send', 'error'  | 無効または読み取り専用設定が提供された場合のアクション（クライアントセッションまたはクエリのいずれか）。 `drop` の場合、設定は無視されます。 `send` の場合、設定は ClickHouse に送信されます。 `error` の場合、クライアント側の ProgrammingError が発生します |
| dict_parameter_format    | 'json'    | 'json', 'map'             | これにより、パラメータ化クエリが Python 辞書を JSON または ClickHouse マップ構文に変換するかどうかが制御されます。 `json` は JSON カラムへの挿入に、`map` は ClickHouse マップカラムに使用するべきです                                                                  |
| product_name             |           |                           | ClickHouse に対してアプリケーションを追跡するために、クエリと共に渡される文字列。 &lt;製品名;&gl/&lt;製品バージョン&gt; の形式であるべきです                                                                                   |
| max_connection_age       | 600       |                           | HTTP Keep Alive 接続がオープン/再利用される最大秒数。これにより、負荷分散/プロキシの後ろにある単一の ClickHouse ノードへの接続の集中を防ぎます。デフォルトは 10 分です。                                                                                       |
| readonly                 | 0         | 0, 1                      | 19.17 より前のバージョンの ClickHouse における暗黙の「読み取り専用」設定。これを設定することで、非常に古い ClickHouse バージョンとの操作を許可します。                                                                                     |
| use_protocol_version     | True      | True, False               | クライアントプロトコルバージョンを使用します。これは DateTime タイムゾーンカラムに必要ですが、現在の chproxy バージョンとの互換性を壊します                                                                                                 |
| max_error_size           | 1024      |                           | クライアントエラーメッセージで返される最大キャラクター数。0 をこの設定に設定すると、完全な ClickHouse エラーメッセージを取得できます。デフォルトは 1024 文字です。                                                                                   |
| send_os_user             | True      | True, False               | ClickHouse に送信されるクライアント情報に検出されたオペレーティングシステムユーザーを含めます（HTTP User-Agent 文字列）。                                                                                                                    |
| http_buffer_size         | 10MB      |                           | HTTP ストリーミングクエリ用に使用される「メモリ内」バッファのサイズ（バイト単位）。                                                                                                                         |
### 圧縮 {#compression}

ClickHouse Connectは、クエリ結果と挿入の両方に対して、lz4、zstd、brotli、およびgzip圧縮をサポートしています。圧縮を使用することは、ネットワーク帯域幅/転送速度とCPU使用率（クライアントとサーバの両方）との間のトレードオフがあることを常に心に留めておいてください。

圧縮データを受け取るには、ClickHouseサーバの `enable_http_compression` を1に設定する必要があります。または、ユーザーが「クエリごと」に設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client`ファクトリメソッドを呼び出す際の `compress` パラメータで制御されます。 既定では、`compress` は `True` に設定されており、これによりデフォルトの圧縮設定がトリガーされます。 `query`、`query_np`、および `query_df`クライアントメソッドで実行されるクエリの場合、ClickHouse Connectは、`Accept-Encoding` ヘッダーに `lz4`、`zstd`、`br`（brotliライブラリがインストールされている場合）、`gzip`、および `deflate` エンコーディングを追加します。 `query`クライアントメソッドで実行されたクエリに対して（および間接的に `query_np`および `query_df`）。 （リクエストの大部分に対して、ClickHouseサーバは `zstd` 圧縮ペイロードで応答します。） 挿入の場合、ClickHouse Connectはデフォルトで挿入ブロックを `lz4` 圧縮で圧縮し、`Content-Encoding: lz4` HTTPヘッダーを送信します。

`get_client` の `compress` パラメータは、特定の圧縮方法（`lz4`、`zstd`、`br`、または `gzip` のいずれか）に設定することもできます。その方法は、挿入とクエリ結果の両方に使用されます（ClickHouseサーバがサポートしている場合）。 必要な `zstd` および `lz4` 圧縮ライブラリは、現在ClickHouse Connectにデフォルトでインストールされています。 `br`/brotliが指定された場合、brotliライブラリは別途インストールする必要があります。

`raw*`クライアントメソッドは、クライアント設定で指定された圧縮を使用しないことに注意してください。

また、データの圧縮と解凍の両方において、`gzip` 圧縮は代替手段に比べて非常に遅くなるため、使用しないことを推奨します。
### HTTPプロキシサポート {#http-proxy-support}

ClickHouse Connectは、`urllib3`ライブラリを使用して基本的なHTTPプロキシサポートを追加します。 標準の `HTTP_PROXY` および `HTTPS_PROXY` 環境変数を認識します。 これらの環境変数を使用すると、`clickhouse_connect.get_client` メソッドで作成された任意のクライアントに適用されます。 代わりに、クライアントごとに設定するには、`get_client` メソッドの `http_proxy` または `https_proxy` 引数を使用できます。 HTTPプロキシサポートの実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) ドキュメントを参照してください。

Socksプロキシを使用するには、`get_client` に `pool_mgr` 引数として `urllib3` SOCKSProxyManagerを送信します。 これには、PySocksライブラリを直接インストールするか、`urllib3` 依存関係の `[socks]` オプションを使用する必要があります。
### "旧" JSONデータ型 {#old-json-data-type}

実験的な `Object`（または `Object('json')`）データ型は非推奨であり、プロダクション環境では使用を避けるべきです。 ClickHouse Connectは、後方互換性のためにこのデータ型に対する限定的なサポートを提供し続けます。 このサポートには、辞書や同等のものとして返されることが期待される「トップレベル」または「親」JSON値のクエリは含まれず、そのためこれらのクエリは例外を引き起こします。
### "新" バリアント/ダイナミック/JSONデータ型（実験機能） {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0リリース以降、`clickhouse-connect`は、新しい（またもや実験的な）ClickHouseタイプであるVariant、Dynamic、およびJSONのための実験的サポートを提供します。
#### 使用上の注意 {#usage-notes}
- JSONデータは、Python辞書またはJSONオブジェクト `{}` を含むJSON文字列として挿入できます。他の形式のJSONデータはサポートされていません。
- これらのタイプのためにサブカラム/パスを使用するクエリは、サブカラムの型を返します。
- その他の使用上の注意については、ClickHouseのメインドキュメントを参照してください。
#### 既知の制限: {#known-limitations}
- これらのタイプは使用する前にClickHouse設定で有効にする必要があります。
- 「新しい」JSON型は、ClickHouse 24.8リリースから利用可能です。
- 内部フォーマットの変更により、`clickhouse-connect`はClickHouse 24.7リリース以降のVariantタイプにのみ互換性があります。
- 返されるJSONオブジェクトは、`max_dynamic_paths` の数の要素のみを返します（デフォルトは1024）。 これは将来のリリースで修正される予定です。
- `Dynamic` カラムへの挿入は、常にPython値の文字列表現になります。 これは、https://github.com/ClickHouse/ClickHouse/issues/70395 が修正されるまで、将来のリリースで修正される予定です。
- 新しいタイプの実装はCコードで最適化されていないため、パフォーマンスはシンプルで確立されたデータ型よりも若干遅くなる可能性があります。
