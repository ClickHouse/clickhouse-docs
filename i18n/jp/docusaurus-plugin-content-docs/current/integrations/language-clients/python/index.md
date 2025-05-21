---
sidebar_label: 'Python'
sidebar_position: 10
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'ClickHouseとPythonを接続するためのClickHouse Connectプロジェクトスイート'
title: 'ClickHouse Connectを使用したPython統合'
---
```

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# ClickHouse Connectを使用したPython統合
## イントロダクション {#introduction}

ClickHouse Connectは、さまざまなPythonアプリケーションとの相互運用性を提供するコアデータベースドライバです。

- 主なインターフェースは、パッケージ `clickhouse_connect.driver`内の`Client`オブジェクトです。このコアパッケージには、ClickHouseサーバーとの通信に使用される各種ヘルパークラスおよびユーティリティ関数と、挿入および選択クエリの高度な管理のための“コンテキスト”実装が含まれています。
- `clickhouse_connect.datatypes`パッケージは、すべての非実験的なClickHouseデータ型のベース実装とサブクラスを提供します。主な機能は、ClickHouseデータをClickHouseの「ネイティブ」バイナリ列指向形式にシリアル化およびデシリアル化することであり、ClickHouseとクライアントアプリケーション間の最も効率的な転送を実現します。
- `clickhouse_connect.cdriver`パッケージのCython/Cクラスは、ピュアPythonに比べて著しく改善されたパフォーマンスのための一般的なシリアル化とデシリアル化の一部を最適化します。
- `clickhouse_connect.cc_sqlalchemy`パッケージには、`datatypes`および`dbi`パッケージを基に構築された制限された[SQLAlchemy](https://www.sqlalchemy.org/)ダイアレクトがあります。この制限された実装は、クエリ/カーソル機能に焦点を当てており、一般にSQLAlchemyのDDLおよびORM操作をサポートしていません。（SQLAlchemyはOLTPデータベース向けに設計されており、ClickHouseのOLAP指向データベースを管理するためのより専門的なツールやフレームワークを推奨します。）
- コアドライバーとClickHouse Connect SQLAlchemyの実装は、ClickHouseをApache Supersetに接続するための推奨方法です。`ClickHouse Connect`データベース接続または`clickhousedb` SQLAlchemyダイアレクト接続文字列を使用してください。

このドキュメントは、ベータリリース0.8.2の時点で最新です。

:::note
公式のClickHouse Connect Pythonドライバーは、ClickHouseサーバーとの通信にHTTPプロトコルを使用します。これには、より優れた柔軟性、HTTPバランサーのサポート、JDBCベースのツールとの互換性の向上などの利点がありますが、圧縮とパフォーマンスのわずかな低下、ネイティブTCPベースプロトコルの一部の複雑な機能のサポートが欠如するという欠点もあります。特定のユースケースでは、ネイティブTCPベースプロトコルを使用する[Community Python drivers](/interfaces/third-party/client-libraries.md)のいずれかを使用することを検討できます。
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


¹ClickHouse Connectは、リストされたプラットフォームに対して明示的にテストされています。さらに、未テストのバイナリホイール（C最適化済み）が、優れた[`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/)プロジェクトによってサポートされているすべてのアーキテクチャ用に構築されています。最終的に、ClickHouse ConnectはピュアPythonでも実行できるため、ソースインストールは最近のPythonインストールで機能するはずです。

²再度、SQLAlchemyのサポートは主にクエリ機能に制限されています。完全なSQLAlchemy APIはサポートされていません。

³ClickHouse Connectは、現在サポートされているすべてのClickHouseバージョンに対してテストされています。HTTPプロトコルを使用しているため、他の多くのClickHouseバージョンでも正常に機能するはずですが、特定の高度なデータ型との互換性の問題がある場合があります。
### インストール {#installation}

PyPIからpipを使用してClickHouse Connectをインストールします:

`pip install clickhouse-connect`

ClickHouse Connectはソースからもインストールできます。
* [GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-connect)を`git clone`します。
* （オプション）`pip install cython`を実行してC/Cythonの最適化をビルドして有効にします。
* プロジェクトのルートディレクトリに`cd`し、`pip install .`を実行します。
### サポートポリシー {#support-policy}

ClickHouse Connectは現在ベータ版であり、現行のベータ版リリースのみが積極的にサポートされています。問題を報告する前に、最新バージョンにアップデートしてください。問題は、[GitHubプロジェクト](https://github.com/ClickHouse/clickhouse-connect/issues)に提出されるべきです。ClickHouse Connectの将来のリリースは、リリース時点でアクティブにサポートされているClickHouseバージョンとの互換性が保証されています（一般的に、最新の3つの「stable」と最新の2つの「lts」リリース）。 
### 基本的な使用法 {#basic-usage}
### 接続詳細を取得する {#gather-your-connection-details}

<ConnectionDetails />
#### 接続を確立する {#establish-a-connection}

ClickHouseへの接続のために、2つの例が示されています。
- localhostのClickHouseサーバーに接続する。
- ClickHouse Cloudサービスに接続する。
##### ClickHouse Connectクライアントインスタンスを使用してlocalhostのClickHouseサーバーに接続する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```
##### ClickHouse Connectクライアントインスタンスを使用してClickHouse Cloudサービスに接続する: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
接続詳細は先に収集されたものを使用します。ClickHouse CloudサービスにはTLSが必要ですので、ポート8443を使用してください。
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```
#### データベースと対話する {#interact-with-your-database}

ClickHouse SQLコマンドを実行するには、クライアントの`command`メソッドを使用します:

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

バッチデータを挿入するには、クライアントの`insert`メソッドを使用し、行と値の2次元配列を渡します:

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQLを使用してデータを取得するには、クライアントの`query`メソッドを使用します:

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```
## ClickHouse ConnectドライバーAPI {#clickhouse-connect-driver-api}

***注意:*** ほとんどのAPIメソッドでは、引数の数が多く、ほとんどがオプションであるため、キーワード引数を渡すことを推奨します。

*ここに文書化されていないメソッドはAPIの一部とは見なされず、削除または変更される可能性があります。*
### クライアントの初期化 {#client-initialization}

`clickhouse_connect.driver.client`クラスは、PythonアプリケーションとClickHouseデータベースサーバーの間の主なインターフェースを提供します。`clickhouse_connect.get_client`関数を使用してClientインスタンスを取得し、次の引数を受け入れます。
#### 接続引数 {#connection-arguments}

| パラメータ             | 型        | デフォルト                       | 説明                                                                                                                                                                                                                                            |
|-----------------------|-------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface             | str         | http                          | httpまたはhttpsである必要があります。                                                                                                                                                                                                                                 |
| host                  | str         | localhost                     | ClickHouseサーバーのホスト名またはIPアドレス。設定されていない場合、`localhost`が使用されます。                                                                                                                                                            |
| port                  | int         | 8123または8443                  | ClickHouseのHTTPまたはHTTPSポート。設定されていない場合、8123がデフォルトで使用されます。また、*secure*=*True*または*interface*=*https*の場合、8443にデフォルトで設定されます。                                                                                                                              |
| username              | str         | default                       | ClickHouseのユーザー名。設定されていない場合、`default`のClickHouseユーザーが使用されます。                                                                                                                                                                      |
| password              | str         | *&lt;空文字列&gt;*        | *username*のパスワード。                                                                                                                                                                                                                           |
| database              | str         | *None*                        | 接続のデフォルトデータベース。設定されていない場合、ClickHouse Connectは*username*のデフォルトデータベースを使用します。                                                                                                                                  |
| secure                | bool        | False                         | https/TLSを使用します。これは、インターフェースまたはポート引数から取得した値を上書きします。                                                                                                                                                                   |
| dsn                   | str         | *None*                        | 標準DSN（データソース名）形式の文字列です。他の接続値（ホストやユーザーなど）は、この文字列から抽出されます。                                                                                           |
| compress              | boolまたはstr | True                          | ClickHouse HTTP挿入およびクエリ結果の圧縮を有効にします。[追加オプション（圧縮）](#compression)を参照してください。                                                                                                                                 |
| query_limit           | int         | 0（無制限）                 | `query`応答の最大行数を返します。ゼロに設定すると無制限の行を返します。大きなクエリ制限は、結果がストリームされない場合、すべての結果がメモリに一度にロードされるため、メモリ不足例外を引き起こす可能性があります。 |
| query_retries         | int         | 2                             | `query`リクエストの最大再試行回数。再試行可能なHTTP応答のみが再試行されます。`command`または`insert`リクエストは、意図しない重複リクエストを防ぐために自動的に再試行されません。                                 |
| connect_timeout       | int         | 10                            | HTTP接続タイムアウト（秒）。                                                                                                                                                                                                                    |
| send_receive_timeout  | int         | 300                           | HTTP接続の送信/受信タイムアウト（秒）。                                                                                                                                                                                               |
| client_name           | str         | *None*                        | HTTPユーザーエージェントヘッダーに前置きされるclient_name。これを設定して、ClickHouseのsystem.query_logでクエリを追跡します。                                                                                                                              |
| pool_mgr              | obj         | *&lt;デフォルトのPoolManager&gt;* | 使用する`urllib3`ライブラリのPoolManager。異なるホストへの複数の接続プールが必要な高度なユースケースの場合。                                                                                                                             |
| http_proxy            | str         | *None*                        | HTTPプロキシアドレス（HTTP_PROXY環境変数を設定することに相当）。                                                                                                                                                                        |
| https_proxy           | str         | *None*                        | HTTPSプロキシアドレス（HTTPS_PROXY環境変数を設定することに相当）。                                                                                                                                                                      |
| apply_server_timezone | bool        | True                          | タイムゾーン対応のクエリ結果にサーバータイムゾーンを使用します。[タイムゾーン優先順位](#time-zones)を参照してください。                                                                                                                                                          |
#### HTTPS/TLS引数 {#httpstls-arguments}

| パラメータ        | 型 | デフォルト | 説明                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLSを使用する場合、ClickHouseサーバーのTLS/SSL証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True*の場合、ClickHouseサーバー証明書を検証するための証明書機関のルートへのファイルパス（.pem形式）。検証がFalseの場合は無視されます。オペレーティングシステムによって確認されたグローバルに信頼されるルートのClickHouseサーバー証明書である場合、これは必要ありません。 |
| client_cert      | str  | *None*  | 相互TLS認証用の.pem形式のTLSクライアント証明書へのファイルパス。このファイルには、中間証明書を含む完全な証明書チェーンが含まれている必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書用の秘密鍵へのファイルパス。クライアント証明書キー ファイルに秘密鍵が含まれていない場合は必要です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS証明書のCNまたはSNIによって識別されるClickHouseサーバーのホスト名。これを設定すると、異なるホスト名を持つプロキシやトンネルを介って接続するときにSSLエラーを回避できます。                                                                                           |
| tls_mode         | str  | *None*  | 高度なTLS動作を制御します。`proxy`と`strict`はClickHouseの相互TLS接続を呼び出さず、クライアント証明書と鍵を送信します。`mutual`はClickHouseの相互TLS認証をクライアント証明書で仮定します。*None*/デフォルトの動作は`mutual`です。                               |
#### 設定引数 {#settings-argument}

最後に、`get_client`の`settings`引数は、各クライアントリクエストに対してサーバーに追加のClickHouse設定を渡すために使用されます。ほとんどのケースでは、*readonly*=*1*アクセスを持つユーザーはクエリと共に送信された設定を変更できないため、ClickHouse Connectは最終リクエストでそのような設定を削除し、警告をログに記録します。以下の設定は、ClickHouse Connectによって使用されるHTTPクエリ/セッションにのみ適用され、一般的なClickHouse設定としては文書化されていません。

| 設定名           | 説明                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouseサーバーがHTTPチャネルに書き込む前に使用するバッファサイズ（バイト単位）。                                                                             |
| session_id        | サーバー上で関連するクエリを関連付けるための一意のセッションID。一時テーブルには必要です。                                                                   |
| compress          | ClickHouseサーバーがPOST応答データを圧縮する必要があるかどうか。この設定は「生」のクエリにのみ使用されるべきです。                                        |
| decompress        | ClickHouseサーバーに送信されるデータをデシリアライズする必要があるかどうか。この設定は「生」の挿入にのみ使用されるべきです。                                          |
| quota_key         | このリクエストに関連付けられたクォータキー。ClickHouseサーバーのクォータに関するドキュメントを参照してください。                                                                  |
| session_check     | セッションの状態を確認するために使用されます。                                                                                                                                |
| session_timeout   | セッションIDで識別されるが無効と見なされる前の不活動の秒数。デフォルトは60秒です。                  |
| wait_end_of_query | ClickHouseサーバーで応答全体をバッファします。この設定は概要情報を返すために必要で、ストリーミングされないクエリの自動設定です。 |

各クエリと共に送信できる他のClickHouse設定については、[ClickHouseのドキュメント](/operations/settings/settings.md)を参照してください。
#### クライアント作成の例 {#client-creation-examples}

- 引数なしで、ClickHouse Connectクライアントは、デフォルトユーザーとパスワードなしで`localhost`のデフォルトHTTPポートに接続します:

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```

- セキュア（https）な外部ClickHouseサーバーに接続する場合。

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- セッションIDやその他のカスタム接続パラメータ、およびClickHouse設定で接続する場合。

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

いくつかのクライアントメソッドでは、共通の`parameters`および`settings`引数のいずれかまたは両方を使用します。これらのキーワード引数は以下に説明されています。
#### パラメータ引数 {#parameters-argument}

ClickHouse Connect Clientの`query*`および`command`メソッドでは、ClickHouseの値式にPython式をバインディングするために使用されるオプションの`parameters`キーワード引数を受け入れます。2種類のバインディングが利用できます。
##### サーバーサイドバインディング {#server-side-binding}

ClickHouseは、HTTPクエリパラメータとしてクエリの境界にバインドされた値が送信される[サーバーサイドバインディング](/interfaces/cli.md#cli-queries-with-parameters)をほとんどのクエリ値に対してサポートしています。ClickHouse Connectは、バインディング式が`{&lt;name&gt;:&lt;datatype&gt;}`形式であることを検出すると、適切なクエリパラメータを追加します。サーバーサイドバインディングの場合、`parameters`引数はPython辞書である必要があります。

- Python辞書、DateTime値、および文字列値を使用したサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)


# サーバーで次のクエリを生成

# SELECT * FROM my_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

**重要** -- サーバーサイドバインディングは、ClickHouseサーバーによって`SELECT`クエリのみにサポートされています。`ALTER`、`DELETE`、`INSERT`、または他のタイプのクエリには機能しません。将来的には変更される可能性があります。詳細はhttps://github.com/ClickHouse/ClickHouse/issues/42092を参照してください。
##### クライアントサイドバインディング {#client-side-binding}

ClickHouse Connectは、テンプレート化されたSQLクエリを生成する際に、より柔軟性を持たせることができるクライアントサイドパラメータバインディングもサポートしています。クライアントサイドバインディングの場合、`parameters`引数は辞書またはシーケンスである必要があります。クライアントサイドバインディングは、Pythonの["printf"スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)文字列フォーマットを使用してパラメータ置換を行います。

サーバーサイドバインディングとは異なり、クライアントサイドバインディングはデータベース識別子（データベース、テーブル、またはカラム名など）では機能しません。なぜなら、Pythonスタイルのフォーマットでは異なる種類の文字列が識別できないため、異なる形式（データベース識別子にはバックティックまたは二重引用符、データ値には単一引用符が必要）でフォーマットする必要があります。

- Python辞書、DateTime値、および文字列エスケープを使用した例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)


# 次のクエリを生成:

# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''
```

- Pythonシーケンス（タプル）、Float64、およびIPv4Addressを使用した例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)


# 次のクエリを生成:

# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''
```

:::note
DateTime64引数をバインドするには（クリックハウス型でサブ秒精度がある場合）、2つのカスタムアプローチのいずれかをラッピングする必要があります。
- Pythonの`datetime.datetime`値を新しいDT64Paramクラスでラップします。例:
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # サーバーサイドバインディングと辞書
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # クライアントサイドバインディングとリスト 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - 辞書のパラメータ値を使用する場合、パラメータ名の末尾に文字列`_64`を付加します。
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # サーバーサイドバインディングと辞書
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::
#### 設定引数 {#settings-argument-1}

すべての主要なClickHouse Connect Clientの“insert”および“select”メソッドは、含まれるSQL文に対してClickHouseサーバーの[ユーザー設定](/operations/settings/settings.md)を渡すためのオプションの`settings`キーワード引数を受け付けます。`settings`引数は辞書である必要があります。各アイテムは、ClickHouse設定名とその関連値である必要があります。値は、クエリパラメータとしてサーバーに送信される際に文字列に変換されます。

クライアントレベルの設定と同様に、ClickHouse Connectはサーバーが*readonly*=*1*としてマークする設定をドロップし、関連するログメッセージを記録します。ClickHouse HTTPインターフェース経由でのクエリにのみ適用される設定は常に有効です。これらの設定については、`get_client`の[API](#settings-argument)で説明されています。

ClickHouse設定を使用する例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
### クライアントの_command_メソッド {#client-_command_-method}

クライアントの`command`メソッドを使用して、データを通常返さないClickHouseサーバーにSQLクエリを送信します。これは、単一のプライミティブまたは配列値が返される場合には、データセット全体ではなく、次のパラメータを受け取ります。

| パラメータ     | 型             | デフォルト    | 説明                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *必須* | 単一の値または単一行の値を返すClickHouse SQL文。                                                                             |                                                                                                                                                                                                                                                                              |
| parameters    | dictまたはイテラブル | *None*     | [パラメータ説明](#parameters-argument)を参照してください。                                                                                                           |
| data          | strまたはbytes   | *None*     | POSTボディとしてコマンドに含めるオプションデータ。                                                                                                   |
| settings      | dict             | *None*     | [設定の説明](#settings-argument)を参照してください。                                                                                                               |
| use_database  | bool             | True       | クライアントデータベースを使用します（クライアント作成時に指定）。Falseは、コマンドが接続ユーザーのデフォルトClickHouseサーバーデータベースを使用することを意味します。 |
| external_data | ExternalData     | *None*     | クエリに使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。  [高度なクエリ（外部データ）](#external-data)を参照してください。                          |

- _command_はDDL文に使用できます。SQL“コマンド”がデータを返さない場合、"クエリの概要"辞書が返されます。この辞書はClickHouseのX-ClickHouse-SummaryおよびX-ClickHouse-Query-Idヘッダーをカプセル化し、`written_rows`、`written_bytes`、および`query_id`のキー/値ペアを含んでいます。

```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_は、単一の行のみを返す単純なクエリにも使用できます。

```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```

### Client _query_ メソッド {#client-_query_-method}

`Client.query` メソッドは、ClickHouse サーバーから単一の "バッチ" データセットを取得するための主要な方法です。これは、HTTP 経由でネイティブ ClickHouse 形式を利用して、大きなデータセット（おおよそ100万行まで）を効率的に転送します。このメソッドは以下のパラメータを取ります。

| パラメータ            | タイプ                | デフォルト  | 説明                                                                                                                                                                            |
|---------------------|------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *必須*     | ClickHouse SQL SELECT または DESCRIBE クエリ。                                                                                                                                       |
| parameters          | dict or iterable | *なし*     | [パラメータの説明](#parameters-argument)を参照してください。                                                                                                                               |
| settings            | dict             | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                                                                  |                                                                                                                                                |
| query_formats       | dict             | *なし*     | 結果値のデータ型フォーマット仕様。詳細は「高度な使用法（読み取りフォーマット）」を参照ください。                                                                                         |
| column_formats      | dict             | *なし*     | 各カラムごとのデータ型フォーマット。詳細は「高度な使用法（読み取りフォーマット）」を参照してください。                                                                                      |
| encoding            | str              | *なし*     | ClickHouse の文字列カラムを Python の文字列にエンコードするために使用されるエンコーディング。設定されていない場合、Python は `UTF-8` をデフォルトとして使用します。                                                            |
| use_none            | bool             | True       | ClickHouse の NULL に対して Python の *None* 型を使用します。False の場合、ClickHouse の NULL に対してデータ型のデフォルト（0 など）を使用します。注意 - パフォーマンス上の理由から NumPy/Pandas のデフォルトは False です。                           |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなく、カラムのシーケンスとして返します。Python データを他の列指向データ形式に変換するのに便利です。                                                                     |
| query_tz            | str              | *なし*     | `zoneinfo` データベースのタイムゾーン名。このタイムゾーンは、クエリによって返されたすべての datetime または Pandas Timestamp オブジェクトに適用されます。                                           |
| column_tzs          | dict             | *なし*     | カラム名からタイムゾーン名への辞書。`query_tz` と同様ですが、異なるカラムに対して異なるタイムゾーンを指定できます。                                                               |
| use_extended_dtypes | bool             | True       | Pandas の拡張データ型（StringArray など）、および ClickHouse の NULL 値に対して pandas.NA と pandas.NaT を使用します。これは `query_df` および `query_df_stream` メソッドのみに適用されます。                          |
| external_data       | ExternalData     | *なし*     | クエリに使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。詳細は [高度なクエリ（外部データ）](#external-data) を参照してください。                                                               |
| context             | QueryContext     | *なし*     | 上記のメソッド引数をカプセル化するための再利用可能な QueryContext オブジェクトです。詳細は [高度なクエリ（QueryContexts）](#querycontexts) を参照してください。                                             |
#### QueryResult オブジェクト {#the-queryresult-object}

基本的な `query` メソッドは、以下の公開プロパティを持つ QueryResult オブジェクトを返します：

- `result_rows` -- 行のシーケンスの形で返されたデータの行列、各行要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスの形で返されたデータの行列、各カラム要素はそのカラムの行値のシーケンスです。
- `column_names` -- `result_set` のカラム名を表す文字列のタプルです。
- `column_types` -- `result_columns` の各カラムに対応する ClickHouse データ型を表す ClickHouseType インスタンスのタプルです。
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブルでクエリを検査するのに便利です）。
- `summary` -- `X-ClickHouse-Summary` HTTP レスポンスヘッダーによって返されたデータ。
- `first_item` -- レスポンスの最初の行を辞書（キーはカラム名）として取得するための便利なプロパティ。
- `first_row` -- 結果の最初の行を返すための便利なプロパティ。
- `column_block_stream` -- 列指向フォーマットのクエリ結果のジェネレータ。このプロパティは直接参照するべきではありません（以下を参照）。
- `row_block_stream` -- 行指向フォーマットのクエリ結果のジェネレータ。このプロパティは直接参照するべきではありません（以下を参照）。
- `rows_stream` -- 呼び出しごとに単一行を提供するクエリ結果のジェネレータ。このプロパティは直接参照するべきではありません（以下を参照）。
- `summary` -- `command` メソッドの下で説明された通り、ClickHouse から返されたサマリー情報の辞書です。

`*_stream` プロパティは、返されたデータに対するイテレータとして使用できる Python のコンテキストを返します。これらは Client の `*_stream` メソッドを使用して間接的にアクセスするべきです。

クエリ結果のストリーミングの詳細（StreamContext オブジェクトを使用）は、[高度なクエリ（ストリーミングクエリ）](#streaming-queries)に記載されています。

### NumPy、Pandas または Arrow でのクエリ結果の消費 {#consuming-query-results-with-numpy-pandas-or-arrow}

メインの `query` メソッドには、3つの専門的なバージョンがあります：

- `query_np` -- このバージョンは ClickHouse Connect QueryResult の代わりに NumPy 配列を返します。
- `query_df` -- このバージョンは ClickHouse Connect QueryResult の代わりに Pandas データフレームを返します。
- `query_arrow` -- このバージョンは PyArrow テーブルを返します。これは ClickHouse の `Arrow` フォーマットを直接利用しており、メインの `query` メソッドと共通の 3 つの引数（`query`、`parameters`、`settings`）のみを受け付けます。さらに、ClickHouse の文字列型を文字列（True の場合）またはバイト（False の場合）として描画するかどうかを決定する追加の引数 `use_strings` があります。

### Client ストリーミングクエリメソッド {#client-streaming-query-methods}

ClickHouse Connect クライアントは、データをストリームとして取得するための複数のメソッドを提供します（Python ジェネレータとして実装されています）：

- `query_column_block_stream` -- ネイティブ Python オブジェクトを使用して、カラムのシーケンスとしてブロックのクエリデータを返します。
- `query_row_block_stream` -- ネイティブ Python オブジェクトを使用して、行のブロックとしてのクエリデータを返します。
- `query_rows_stream` -- ネイティブ Python オブジェクトを使用して、行のシーケンスとしてのクエリデータを返します。
- `query_np_stream` -- 各 ClickHouse ブロックのクエリデータを NumPy 配列として返します。
- `query_df_stream` -- 各 ClickHouse ブロックのクエリデータを Pandas データフレームとして返します。
- `query_arrow_stream` -- PyArrow RecordBlocks の形式でクエリデータを返します。

これらのメソッドのそれぞれは `ContextStream` オブジェクトを返し、ストリームを消費するために `with` ステートメントを使用して開く必要があります。詳細と例については、[高度なクエリ（ストリーミングクエリ）](#streaming-queries)を参照してください。

### Client _insert_ メソッド {#client-_insert_-method}

ClickHouse に複数のレコードを挿入する一般的なユースケースのために、`Client.insert` メソッドがあります。このメソッドは以下のパラメータを取ります：

| パラメータ         | タイプ                              | デフォルト  | 説明                                                                                                                                                                                   |
|-------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *必須*     | 挿入する ClickHouse テーブル。完全なテーブル名（データベースを含む）が許可されています。                                                                                                    |
| data              | Sequence of Sequences             | *必須*     | 挿入するデータの行列。各行はカラム値のシーケンスである行のシーケンス、または各行が行値のシーケンスであるカラムのシーケンスとして表現できます。                                          |
| column_names      | Sequence of str, または str      | '*'        | データ行列のカラム名のリスト。'*' を使用した場合、ClickHouse Connect はテーブルのすべてのカラム名を取得するために "プレクエリ" を実行します。                                                 |
| database          | str                               | ''         | 挿入対象のデータベース。指定されていない場合、クライアントのデータベースが使用されます。                                                                                                  |
| column_types      | Sequence of ClickHouseType        | *なし*     | ClickHouseType インスタンスのリスト。column_types または column_type_names のいずれも指定されていない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するために "プレクエリ" を実行します。                       |
| column_type_names | Sequence of ClickHouse 型名       | *なし*     | ClickHouse データ型名のリスト。column_types または column_type_names のいずれも指定されていない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するために "プレクエリ" を実行します。                               |
| column_oriented   | bool                              | False      | True の場合、`data` 引数はカラムのシーケンスであると想定され、データを挿入するための "ピボット" は必要ありません。そうでない場合、`data` は行のシーケンスとして解釈されます。                                          |
| settings          | dict                              | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                                                                               |
| insert_context    | InsertContext                     | *なし*     | 上記のメソッド引数をカプセル化する再利用可能な InsertContext オブジェクトを使用できます。詳細は [高度な挿入（InsertContexts）](#insertcontexts) を参照してください。                                    |

このメソッドは "クエリの概要" 辞書を返します。これは "command" メソッドの下で説明されています。挿入が何らかの理由で失敗した場合、例外が発生します。

メインの `insert` メソッドには2つの専門的なバージョンがあります：

- `insert_df` -- Python の Sequences of Sequences `data` 引数の代わりに、2番目のパラメータには Pandas データフレームインスタンスである `df` 引数が必要です。ClickHouse Connect はデータフレームを自動的にカラム指向のデータソースとして処理するため、`column_oriented` パラメータは必要ありませんし、使用できません。
- `insert_arrow` -- Python の Sequences of Sequences `data` 引数の代わりに、このメソッドには `arrow_table` が必要です。ClickHouse Connect は Arrow テーブルを変更することなく ClickHouse サーバーに渡すため、`table` および `arrow_table` に加えて `database` と `settings` 引数しか使用できません。

*注:* NumPy 配列は有効な Sequences of Sequences であり、メインの `insert` メソッドに対する `data` 引数として使用できますので、専門的なメソッドは必要ありません。

### ファイル挿入 {#file-inserts}

`clickhouse_connect.driver.tools` には、ファイルシステムから直接データを既存の ClickHouse テーブルに挿入できる `insert_file` メソッドが含まれています。解析は ClickHouse サーバーに委任されます。`insert_file` には以下のパラメータが受け付けられます。

| パラメータ    | タイプ            | デフォルト           | 説明                                                                                                                 |
|--------------|-----------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *必須*            | 挿入を実行するために使用される `driver.Client`                                                                                      |
| table        | str             | *必須*            | 挿入する ClickHouse テーブル。完全なテーブル名（データベースを含む）が許可されています。                                           |
| file_path    | str             | *必須*            | データファイルへのネイティブファイルシステムパス                                                                           |
| fmt          | str             | CSV, CSVWithNames | ファイルの ClickHouse 入力フォーマット。"column_names" が提供されない場合、CSVWithNames が仮定されます。                                 |
| column_names | Sequence of str | *なし*            | データファイル内のカラム名のリスト。カラム名を含まないフォーマットの場合は必要ありません。                                            |
| database     | str             | *なし*            | テーブルのデータベース。テーブルが完全に資格のある場合は無視されます。指定されていない場合、挿入はクライアントのデータベースを使用します。         |
| settings     | dict            | *なし*            | [設定の説明](#settings-argument)を参照してください。                                                                                                             |
| compression  | str             | *なし*            | Content-Encoding HTTP ヘッダーに使用される承認された ClickHouse 圧縮タイプ（zstd、lz4、gzip）                                                        |

不一致のデータや異常なフォーマットの日時値を含むファイルの場合、データインポートに適用される設定（例えば `input_format_allow_errors_num` や `input_format_allow_errors_num`）がこのメソッドで認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

### クエリ結果をファイルとして保存する {#saving-query-results-as-files}

`raw_stream` メソッドを使用して、ClickHouse からローカルファイルシステムに直接ファイルをストリームすることができます。たとえば、クエリの結果を CSV ファイルに保存したい場合は、以下のコードスニペットを使用できます。

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # または CSV、または CSVWithNamesAndTypes、または TabSeparated など。
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

上記のコードは次の内容を持つ `output.csv` ファイルを生成します。

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats#tabseparated) やその他のフォーマットでデータを保存することができます。すべての利用可能なフォーマットオプションの概要については、[データの入力と出力用フォーマット](/interfaces/formats)を参照してください。

### 生 API {#raw-api}

ClickHouse データとネイティブまたはサードパーティのデータタイプおよび構造の間で変換が必要ないユースケースの場合、ClickHouse Connect クライアントは ClickHouse 接続の直接使用のための 2 つのメソッドを提供します。

#### Client _raw_query_ メソッド {#client-_raw_query_-method}

`Client.raw_query` メソッドは、クライアント接続を使用して ClickHouse HTTP クエリインターフェースを直接使用できるようにします。返される値は処理されていない `bytes` オブジェクトです。これは、パラメータバインディング、エラーハンドリング、リトライ、および最小限のインターフェースを使用した設定管理の便利なラッパーを提供します。

| パラメータ     | タイプ             | デフォルト  | 説明                                                                                                                           |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *必須*     | 有効な ClickHouse クエリ                                                                                                            |
| parameters    | dict or iterable | *なし*     | [パラメータの説明](#parameters-argument)を参照してください。                                                                                   |
| settings      | dict             | *なし*     | [設定の説明](#settings-argument)を参照してください。                                                                                       |                                                                                                                                                |
| fmt           | str              | *なし*     | 結果として得られるバイトのための ClickHouse 出力フォーマット（未指定の場合、ClickHouse は TSV を使用）                                             |
| use_database  | bool             | True       | クエリコンテキストに対してクリックハウスコネクトクライアントに割り当てられたデータベースを使用します。                                                             |
| external_data | ExternalData     | *なし*     | クエリに使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。詳細は [高度なクエリ（外部データ）](#external-data) を参照してください।  |

返された `bytes` オブジェクトを処理する責任は呼び出し元にあります。`Client.query_arrow` は ClickHouse の `Arrow` 出力フォーマットを使用したこのメソッドのわずかなラッパーです。

#### Client _raw_stream_ メソッド {#client-_raw_stream_-method}
`Client.raw_stream` メソッドは `raw_query` メソッドと同じ API を持っていますが、`bytes` オブジェクトのジェネレータ/ストリームソースとして使用できる `io.IOBase` オブジェクトを返します。これは現在 `query_arrow_stream` メソッドによって利用されています。

#### Client _raw_insert_ メソッド {#client-_raw_insert_-method}

`Client.raw_insert` メソッドは、クライアント接続を使用して `bytes` オブジェクトまたは `bytes` オブジェクトのジェネレータを直接挿入できるようにします。挿入ペイロードの処理を行わないため、非常に高性能です。このメソッドは、設定と挿入フォーマットを指定するためのオプションを提供します。

| パラメータ    | タイプ                                   | デフォルト  | 説明                                                                                  |
|--------------|----------------------------------------|------------|----------------------------------------------------------------------------------------------|
| table        | str                                    | *必須*     | 簡単なテーブル名またはデータベースの資格を持つテーブル名                                           |
| column_names | Sequence[str]                          | *なし*     | 挿入ブロックのためのカラム名。`fmt` パラメータに名前が含まれていない場合は必須   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *必須*     | 挿入するデータ。文字列はクライアントのエンコーディングでエンコードされます。                          |
| settings     | dict                                   | *なし*     | [設定の説明](#settings-argument)を参照してください。                                              |                                                                                                                                                |
| fmt          | str                                    | *なし*     | `insert_block` バイトの ClickHouse 入力フォーマット（未指定の場合 ClickHouse は TSV を使用） |

`insert_block` が指定されたフォーマット内で、指定された圧縮メソッドを使用されることは呼び出し元の責任です。ClickHouse Connect は、ファイルアップロードや PyArrow テーブルのためにこれらの生挿入を使用し、解析を ClickHouse サーバーに委任します。

### ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスと関数は、「公開」 `clickhouse-connect` API の一部と見なされ、上記で文書化されたクラスおよびメソッドと同様に、マイナーリリースを通じて安定しています。これらのクラスおよび関数への破壊的変更は、マイナー（パッチではなく）リリースでのみ発生し、少なくとも1つのマイナーリリースで非推奨として使用可能になります。

#### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0 規格で定義された例外を含む）は `clickhouse_connect.driver.exceptions` モジュールで定義されています。
ドライバーによって実際に検出された例外は、これらのいずれかの型が使用されます。

#### Clickhouse SQL ユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュール内の関数と DT64Param クラスは、ClickHouse SQL クエリを適切に構築およびエスケープするために使用できます。同様に、`clickhouse_connect.driver.parser` モジュール内の関数は ClickHouse データ型名を解析するために使用されます。

### マルチスレッド、マルチプロセス、非同期/イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect はマルチスレッド、マルチプロセス、およびイベントループ駆動/非同期アプリケーションでうまく機能します。
すべてのクエリおよび挿入処理は単一スレッド内で発生するため、操作は一般的にスレッドセーフです。（低レベルでの一部の操作の並列処理は、単一スレッドのパフォーマンスペナルティを克服するための将来的な強化の可能性がありますが、その場合でもスレッドセーフは維持されます）。

各クエリまたは挿入は、それぞれ独自の QueryContext または InsertContext オブジェクト内で状態を維持するため、これらのヘルパーオブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有するべきではありません。以下のセクションでのコンテキストオブジェクトに関する追加の議論を参照してください。

さらに、同時に「飛行中」の2つ以上のクエリおよび/または挿入を持つアプリケーションでは、考慮すべき2つの追加の点があります。1つは、クエリ/挿入に関連付けられた ClickHouse の「セッション」であり、もう1つは ClickHouse Connect クライアントインスタンスで使用される HTTP 接続プールです。

### AsyncClient ラッパー {#asyncclient-wrapper}

0.7.16 以降、ClickHouse Connect は通常の `Client` の非同期ラッパーを提供し、`asyncio` 環境でクライアントを使用することができます。

`AsyncClient` のインスタンスを取得するには、標準の `get_client` と同じパラメータを受け取る `get_async_client` ファクトリ関数を使用できます。

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)


asyncio.run(main())
```

`AsyncClient` は、標準の `Client` と同様のメソッドとパラメータを持っていますが、適用できる場合はコルーチンです。内部的には、I/O 操作を実行するこれらの Client メソッドは、[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 呼び出しでラップされています。

I/O 操作の完了を待っている間、実行スレッドと GIL が解放されるため、`AsyncClient` ラッパーを使用するとマルチスレッドのパフォーマンスが向上します。

注意: 通常の `Client` と異なり、`AsyncClient` はデフォルトで `autogenerate_session_id` を `False` に設定します。

さらに詳しい情報については、[run_async の例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)を参照してください。

### ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

各 ClickHouse クエリは、ClickHouse の「セッション」の文脈内で発生します。セッションは現在、主に2つの目的で使用されています。
- 特定の ClickHouse 設定を複数のクエリに関連付けるため（[ユーザー設定](/operations/settings/settings.md)を参照）。ClickHouse の `SET` コマンドは、ユーザーセッションのスコープ内で設定を変更するために使用されます。
- [一時テーブル](/sql-reference/statements/create/table#temporary-tables)の追跡。

デフォルトでは、ClickHouse Connect クライアントインスタンスで実行された各クエリは、同じセッション ID を使用してこのセッション機能を有効にします。つまり、`SET` ステートメントと一時テーブルの作業は、単一の ClickHouse クライアントを使用する際も期待通りに機能します。しかし、設計上、ClickHouse サーバーは同じセッション内で同時クエリを許可していません。そのため、同時クエリを実行する ClickHouse Connect アプリケーションには、2つのオプションがあります。

- 実行の各スレッド（スレッド、プロセス、またはイベントハンドラー）に対して別々の `Client` インスタンスを作成します。これにより、それぞれ独自のセッション ID を持つことができます。一般的には、各クライアントのセッション状態を保持できるため、このアプローチが最良です。
- 各クエリに対して一意のセッション ID を使用します。一時テーブルや共有セッション設定が必要ない場合、この方法は同時セッションの問題を回避します（共有設定も提供できますが、これらは各リクエストとともに送信され、セッションとは関連付けられません）。一意の session_id はリクエストごとに `settings` 辞書に追加するか、共通設定の `autogenerate_session_id` を無効にすることができます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)  # これはクライアントを作成する前に常に設定されるべきです
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

この場合、ClickHouse Connect はセッション ID を送信せず、ClickHouse サーバーによってランダムなセッション ID が生成されます。再度、一時テーブルとセッションレベルの設定は使用できません。

### HTTP 接続プールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connect は、サーバーへの基盤となる HTTP 接続を処理するために `urllib3` 接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスが同じ接続プールを共有しており、これは大多数のユースケースに対して十分です。このデフォルトプールは、アプリケーションで使用される各 ClickHouse サーバーに最大 8 の HTTP Keep Alive 接続を維持します。

大規模なマルチスレッドアプリケーションでは、別々の接続プールが適切である場合があります。カスタマイズされた接続プールは、主な `clickhouse_connect.get_client` 関数への `pool_mgr` キーワード引数として提供できます。

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例から示すように、クライアントはプールマネージャーを共有したり、各クライアントに対して別々のプールマネージャーを作成することができます。プールマネージャー作成時のオプションについては、[`urllib3` ドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。

## ClickHouse Connect でのデータクエリ: 高度な使用法 {#querying-data-with-clickhouse-connect--advanced-usage}
### QueryContexts {#querycontexts}

ClickHouse Connect は、QueryContext 内で標準クエリを実行します。QueryContext には、ClickHouse データベースに対するクエリを構築するために使用される主要な構造と、QueryResult または他の応答データ構造に結果を処理するための設定が含まれています。これには、クエリ自体、パラメータ、設定、読み取りフォーマット、その他のプロパティが含まれます。

QueryContext は、クライアントの `create_query_context` メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメータを取ります。このクエリコンテキストは次に `query`、`query_df`、または `query_np` メソッドに `context` キーワード引数として渡すことができ、他の引数の代わりに使用できます。呼び出しのために指定された追加の引数は QueryContext のプロパティを上書きします。

QueryContext の最も明確な使用ケースは、異なるバインディングパラメータ値で同じクエリを送信することです。すべてのパラメータ値を、辞書を引数にした `QueryContext.set_parameters` メソッドを呼び出すことによって更新することができます。また、特定の `key` と `value` のペアで `QueryContext.set_parameter` を呼び出すことによって、単一の値を更新できます。

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

QueryContexts はスレッドセーフではありませんが、マルチスレッド環境では `QueryContext.updated_copy` メソッドを呼び出すことによってコピーを取得できます。

### ストリーミングクエリ {#streaming-queries}
```

#### データブロック {#data-blocks}
ClickHouse Connectは、プライマリ `query` メソッドから受け取ったすべてのデータを、ClickHouseサーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouseとの間でカスタムの「ネイティブ」形式で送信されます。「ブロック」とは、バイナリデータのカラムの連続であり、各カラムには指定したデータ型のデータ値が等しい数だけ含まれています。（列指向データベースであるClickHouseは、同様の形式でこのデータを保存します。）クエリから返されるブロックのサイズは、複数のレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定できる2つのユーザー設定によって制御されます。それらは次のとおりです：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行数におけるブロックのサイズの制限。デフォルトは65536です。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- バイト単位でのブロックサイズのソフトリミット。デフォルトは1,000,0000です。

`preferred_block_size_setting`に関係なく、各ブロックは決して`max_block_size`行を超えることはありません。クエリの種類に応じて、実際に返されるブロックは任意のサイズになる可能性があります。たとえば、多くのシャードをカバーする分散テーブルへのクエリは、各シャードから直接取得した小さなブロックを含むことがあります。

クライアントの`query_*_stream`メソッドのいずれかを使用する場合、結果はブロックごとに返されます。ClickHouse Connectは、一度に1つのブロックしか読み込みません。これにより、大量のデータをメモリにすべての大きな結果セットを読み込むことなく処理できます。アプリケーションは任意の数のブロックを処理できるように準備する必要があり、各ブロックの正確なサイズを制御することはできません。

#### 遅延処理のためのHTTPデータバッファ {#http-data-buffer-for-slow-processing}

HTTPプロトコルの制限のため、ブロックがClickHouseサーバーがデータをストリーミングする速度よりもかなり遅い速度で処理されると、ClickHouseサーバーは接続を閉じ、処理スレッドで例外がスローされます。これの一部は、共通の`http_buffer_size`設定を使用してHTTPストリーミングバッファのバッファサイズを増やすことによって軽減できます（デフォルトは10メガバイトです）。アプリケーションに十分なメモリがある場合、大きな`http_buffer_size`の値はこの状況で問題ないはずです。バッファ内のデータは、`lz4`または`zstd`圧縮を使用して保存されるため、これらの圧縮タイプを使用すると、利用可能な全体的なバッファを増やします。

#### ストリームコンテキスト {#streamcontexts}

各`query_*_stream`メソッド（たとえば`query_row_block_stream`）は、ClickHouseの`StreamContext`オブジェクトを返します。これは、組み合わされたPythonコンテキスト/ジェネレーターです。基本的な使用法は次のとおりです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <各Pythonトリップデータの行で何らかの処理を行う>
```

`with`ステートメントなしでStreamContextを使用しようとすると、エラーが発生します。Pythonコンテキストを使用することで、ストリーム（この場合はストリーミングHTTPレスポンス）が、すべてのデータが消費されなかったり、処理中に例外がスローされた場合でも適切に閉じられます。また、StreamContextsはストリームを消費するために一度だけ使用できます。StreamContextが終了した後に使用しようとすると、`StreamClosedError`が発生します。

StreamContextの`source`プロパティを使用して、カラム名やデータ型を含む親`QueryResult`オブジェクトにアクセスできます。

#### ストリームタイプ {#stream-types}

`query_column_block_stream`メソッドは、ネイティブのPythonデータ型で保存されたカラムデータのシーケンスとしてブロックを返します。上記の`taxi_trips`クエリを使用すると、返されるデータはリストになり、リストの各要素は関連するカラムのすべてのデータを含む別のリスト（またはタプル）になります。したがって、`block[0]`は文字列だけを含むタプルになります。列指向の形式は、カラム内のすべての値に対する集計操作（合計金額を合算するなど）を行うために最も一般的に使用されます。

`query_row_block_stream`メソッドは、従来のリレーショナルデータベースのように行のシーケンスとしてブロックを返します。タクシートリップの場合、返されるデータはリストになり、リストの各要素はデータの行を表す別のリストになります。したがって、`block[0]`には最初のタクシートリップのすべてのフィールド（順序通り）が含まれ、`block[1]`には2回目のタクシートリップのすべてのフィールドの行が含まれます。行指向の結果は通常、表示や変換プロセスに使用されます。

`query_row_stream`は、ストリームをイテレートするときに次のブロックに自動的に移動する便利なメソッドです。それ以外は、`query_row_block_stream`と同じです。

`query_np_stream`メソッドは、各ブロックを二次元のNumPy配列として返します。内部的に、NumPy配列は（通常）カラムとして保存されるため、特別な行またはカラムメソッドは必要ありません。NumPy配列の「形状」は（カラム、行）として表されます。NumPyライブラリは、NumPy配列を操作する多くのメソッドを提供します。クエリ内のすべてのカラムが同じNumPyデータ型を共有している場合、返されるNumPy配列も一つのデータ型のみを持ち、その内部構造を実際に変更することなく形状を変更/回転できます。

`query_df_stream`メソッドは、各ClickHouseブロックを二次元のPandasデータフレームとして返します。以下は、StreamContextオブジェクトを遅延的にコンテキストとして使用できることを示す例です（ただし一度だけ）。

最後に、`query_arrow_stream`メソッドは、ClickHouseの結果を`pyarrow.ipc.RecordBatchStreamReader`でフォーマットされた`ArrowStream`として返し、StreamContextでラップされます。ストリームの各反復は、PyArrow RecordBlockを返します。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <Pandasデータフレームで何らかの処理を行う>
```

### 読み取り形式 {#read-formats}

読み取り形式は、クライアントの`query`、`query_np`、および`query_df`メソッドから返される値のデータ型を制御します。（`raw_query`および`query_arrow`はIncomingデータをClickHouseから変更しないため、形式制御は適用されません。）たとえば、UUIDの読み取り形式がデフォルトの`native`形式から代替の`string`形式に変更された場合、ClickHouseの`UUID`カラムのクエリは、PythonのUUIDオブジェクトではなく、文字列値として返されます。

任意のフォーマット関数に対する「データ型」引数にはワイルドカードを含めることができます。形式は単一の小文字の文字列です。

読み取り形式は、複数のレベルで設定できます：

- `clickhouse_connect.datatypes.format`パッケージで定義されたメソッドを使用して、グローバルに設定できます。これにより、すべてのクエリの構成されたデータ型の形式を制御します。
  
```python
from clickhouse_connect.datatypes.format import set_read_format


# IPv6とIPv4の両方の値を文字列として返します
set_read_format('IPv*', 'string')


# すべての日付型を基本のエポック秒またはエポック日として返します
set_read_format('Date*', 'int')
```

- クエリ全体のために、オプションの`query_formats`辞書引数を使用して設定できます。その場合、指定されたデータ型のいずれかのカラム（またはサブカラム）は、設定された形式を使用します。

```python

# 任意のUUIDカラムを文字列として返します
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```

- 特定のカラムの値に対して、オプションの`column_formats`辞書引数を使用して設定できます。キーは、ClickHouseからの戻り値として表示されるカラム名であり、データカラム用の形式またはClickHouseの型名とクエリ形式の値からなる第二レベルの「形式」辞書です。この二次辞書は、タプルやマップなどのネストされたカラム型に対して使用できます。

```python

# `dev_address`カラムのIPv6値を文字列として返します
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

#### 読み取り形式オプション（Python型） {#read-format-options-python-types}

| ClickHouse型       | ネイティブPython型    | 読み取り形式 | コメント                                                                                                          |
|-------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64            | int                   | signed       | 現在、サブセットは大きな符号なしUInt64値を処理しません                                                   |
| [U]Int[128,256]   | int                   | string       | PandasおよびNumPyのint値は最大64ビットなので、これらは文字列として返すことができます                              |
| Float32           | float                 | -            | すべてのPython floatは内部的に64ビットです                                                                          |
| Float64           | float                 | -            |                                                                                                                   |
| Decimal           | decimal.Decimal       | -            |                                                                                                                   |
| String            | string                | bytes        | ClickHouseのStringカラムには固有のエンコーディングがないため、可変長のバイナリデータにも使用されます        |
| FixedString       | bytes                 | string       | 固定長のFixedStringsは固定サイズのバイト配列ですが、時々Pythonの文字列として扱われます                              |
| Enum[8,16]       | string                | string、int  | Pythonの列挙型は空の文字列を受け入れないため、すべての列挙型は文字列または内部のint値のいずれかとして表現されます。 |
| Date              | datetime.date         | int          | ClickHouseは日付を1970年1月1日からの日数として保存しています。この値はintとして利用できます                              |
| Date32            | datetime.date         | int          | Dateと同様ですが、広範な日付範囲のため                                                                              |
| DateTime          | datetime.datetime     | int          | ClickHouseはエポック秒でDateTimeを保存しています。この値はintとして利用可能です                                   |
| DateTime64        | datetime.datetime     | int          | Pythonのdatetime.datetimeはマイクロ秒の精度に制限されています。生の64ビット整数値が利用可能です               |
| IPv4              | `ipaddress.IPv4Address` | string       | IPアドレスは文字列として読み込め、適切にフォーマットされた文字列はIPアドレスとして挿入できます                |
| IPv6              | `ipaddress.IPv6Address` | string       | IPアドレスは文字列として読み込め、適切にフォーマットされたものはIPアドレスとして挿入できます                   |
| Tuple             | dictまたはtuple         | tuple、json  | 名前付きタプルはデフォルトで辞書として返されます。名前付きタプルもJSON文字列として返すことができます         |
| Map               | dict                  | -            |                                                                                                                   |
| Nested            | Sequence[dict]        | -            |                                                                                                                   |
| UUID              | uuid.UUID             | string       | UUIDはRFC 4122に従ってフォーマットされた文字列として読み込めます<br/>                                           |
| JSON              | dict                  | string       | Pythonの辞書がデフォルトで返されます。`string`形式はJSON文字列を返します                                    |
| Variant           | object                | -            | 値に格納されたClickHouseデータ型に対応するPython型が返されます                                                 |
| Dynamic           | object                | -            | 警告 -- 現在、Dynamicカラムへの挿入はすべてClickHouse Stringとして永続化されます                                   |

### 外部データ {#external-data}

ClickHouseクエリは、任意のClickHouse形式の外部データを受け入れることができます。このバイナリデータは、データを処理するために使用されるクエリ文字列と共に送信されます。外部データ機能の詳細は[こちら](/engines/table-engines/special/external-data.md)にあります。クライアントの`query*`メソッドは、この機能を利用するためにオプションの`external_data`パラメータを受け入れます。`external_data`パラメータの値は、`clickhouse_connect.driver.external.ExternalData`オブジェクトである必要があります。このオブジェクトのコンストラクタは次の引数を受け取ります：

| 名前       | 型               | 説明                                                                                                                                         |
|------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| file_path  | str              | 外部データを読み込むためのローカルシステムパスのファイルへのパス。`file_path`または`data`のいずれかが必要です                               | 
| file_name  | str              | 外部データの「ファイル」の名前。提供されていない場合は、`file_path`（拡張子なし）から決定されます                                          |
| data       | bytes            | 外部データのバイナリ形式（ファイルから読み込むのではなく）。`data`または`file_path`のいずれかが必要です                                   |
| fmt        | str              | データのClickHouse [入力形式](/sql-reference/formats.mdx)。デフォルトは`TSV`                                                                 |
| types      | strまたはstrのシーケンス | 外部データ内のカラムデータ型のリスト。文字列の場合、型はコンマで区切る必要があります。`types`または`structure`のいずれかが必要です                     |
| structure  | strまたはstrのシーケンス | データ内のカラム名+データ型のリスト（例を参照）。`structure`または`types`のいずれかが必要です                                            |
| mime_type  | str              | ファイルデータのオプションのMIMEタイプ。現在、ClickHouseはこのHTTPサブヘッダーを無視します                                                     |

「映画」データを含む外部CSVファイルを使用してクエリを送信し、そのデータを既にClickHouseサーバーに存在する`directors`テーブルと組み合わせるには、次のようにします：

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

追加の外部データファイルは、同じパラメータを取る`add_file`メソッドを使用して、最初のExternalDataオブジェクトに追加できます。HTTPの場合、すべての外部データは`multi-part/form-data`ファイルアップロードの一部として送信されます。

### タイムゾーン {#time-zones}
ClickHouseのDateTimeおよびDateTime64値にタイムゾーンを適用するための複数のメカニズムがあります。内部的に、ClickHouseサーバーは、任意のDateTimeまたはDateTime64オブジェクトを、エポック（1970-01-01 00:00:00 UTC）以降の秒数を表すタイムゾーンナイーブな数として常に保存します。DateTime64値の場合、表現はミリ秒、マイクロ秒、またはエポック以降のナノ秒になる可能性があります。したがって、タイムゾーン情報の適用は常にクライアント側で行われます。これには意味のある追加計算が含まれるため、パフォーマンスが重要なアプリケーションでは、ユーザー表示と変換（例えば、Pandasのタイムスタンプなど）以外は、DateTime型をエポックタイムスタンプとして扱うことが推奨されます。

クエリ内でタイムゾーンに気付いたデータ型を使用する場合、特にPythonの`datetime.datetime`オブジェクトでは、`clickhouse-connect`は次の優先順位ルールを使用してクライアント側のタイムゾーンを適用します：

1. クエリメソッドパラメータ`client_tzs`が指定されている場合、特定のカラムタイムゾーンが適用されます。
2. ClickHouseカラムにタイムゾーンのメタデータがある場合（つまり、DateTime64(3, 'America/Denver')のような型）、ClickHouseカラムのタイムゾーンが適用されます。（このタイムゾーンのメタデータは、ClickHouseバージョン23.2以前のDateTimeカラムに対してはclickhouse-connectからは利用できません）
3. クエリメソッドパラメータ`query_tz`が指定されている場合、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションにタイムゾーン設定が適用されている場合、そのタイムゾーンが適用されます。（この機能はまだClickHouseサーバーでは公開されていません）
5. 最後に、クライアントの`apply_server_timezone`パラメータがTrueに設定されている（デフォルト）場合、ClickHouseサーバーのタイムゾーンが適用されます。

これらのルールに基づいて適用されたタイムゾーンがUTCの場合、`clickhouse-connect`は常にタイムゾーンナイーブなPython `datetime.datetime`オブジェクトを返します。必要に応じて、このタイムゾーンナイーブなオブジェクトに対して追加のタイムゾーン情報をアプリケーションコードで追加できます。

## ClickHouse Connectを使用したデータの挿入：高度な使用法 {#inserting-data-with-clickhouse-connect--advanced-usage}
### 挿入コンテキスト {#insertcontexts}

ClickHouse Connectはすべての挿入をInsertContext内で実行します。InsertContextには、クライアントの`insert`メソッドに渡されたすべての値が含まれます。さらに、InsertContextが最初に構築されるとき、ClickHouse Connectは効率的なネイティブ形式の挿入に必要な挿入カラムのデータ型を取得します。InsertContextを複数の挿入に再利用することにより、この「事前クエリ」が回避され、挿入はより迅速かつ効率的に実行されます。

InsertContextは、クライアントの`create_insert_context`メソッドを使用して取得できます。このメソッドは、`insert`関数と同じ引数を取ります。再利用のために変更すべきは、InsertContextsの`data`プロパティのみであることに注意してください。これは、同じテーブルに新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供するというその目的と一致しています。

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

InsertContextsは、挿入プロセス中に更新される可変状態を含むため、スレッドセーフではありません。

### 書き込み形式 {#write-formats}
書き込み形式は、現在限られた数の型に対して実装されています。ほとんどの場合、ClickHouse Connectは最初の（非NULL）データ値の型をチェックすることでカラムの正しい書き込み形式を自動的に決定しようとします。たとえば、DateTimeカラムに挿入する場合、カラムの最初の挿入値がPythonの整数であると、ClickHouse Connectはその整数値を直接挿入します。これは、実際にエポック秒であると仮定しています。

ほとんどの場合、データ型の書き込み形式を上書きする必要はありませんが、`clickhouse_connect.datatypes.format`パッケージ内の関連メソッドを使用してグローバルレベルでそれを行うことができます。

#### 書き込み形式オプション {#write-format-options}

| ClickHouse型       | ネイティブPython型    | 書き込み形式 | コメント                                                                                                    |
|-------------------|-----------------------|---------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                             |
| UInt64            | int                   |               |                                                                                                             |
| [U]Int[128,256]   | int                   |               |                                                                                                             |
| Float32           | float                 |               |                                                                                                             |
| Float64           | float                 |               |                                                                                                             |
| Decimal           | decimal.Decimal       |               |                                                                                                             |
| String            | string                |               |                                                                                                             |
| FixedString       | bytes                 | string        | 文字列として挿入された場合、追加のバイトはゼロに設定されます                                              |
| Enum[8,16]       | string                |               |                                                                                                             |
| Date              | datetime.date         | int           | ClickHouseは日付を1970年1月1日からの日数として保存しています。int型はこの「エポック日付」値であると見なされます  |
| Date32            | datetime.date         | int           | Dateと同様ですが、より広い日付範囲のため                                                                         |
| DateTime          | datetime.datetime     | int           | ClickHouseはエポック秒でDateTimeを保存しています。int型はこの「エポック秒」値であると見なされます           |
| DateTime64        | datetime.datetime     | int           | Pythonのdatetime.datetimeはマイクロ秒の精度に制限されています。生の64ビット整数値が利用可能です         |
| IPv4              | `ipaddress.IPv4Address` | string       | 適切にフォーマットされた文字列はIPv4アドレスとして挿入可能です                                            |
| IPv6              | `ipaddress.IPv6Address` | string       | 適切にフォーマットされた文字列はIPv6アドレスとして挿入可能です                                            |
| Tuple             | dictまたはtuple         |               |                                                                                                             |
| Map               | dict                  |               |                                                                                                             |
| Nested            | Sequence[dict]        |               |                                                                                                             |
| UUID              | uuid.UUID             | string       | 適切にフォーマットされた文字列はClickHouse UUIDとして挿入可能です                                         |
| JSON/Object('json') | dict                | string       | 辞書またはJSON文字列がJSONカラムに挿入可能です（`Object('json')`は非推奨です）                           |
| Variant           | object                |               | 現在、すべてのバリアントは文字列として挿入され、ClickHouseサーバーによって解析されます                    |
| Dynamic           | object                |               | 警告 -- 現在、Dynamicカラムへの挿入はすべてClickHouse Stringとして永続化されます                          |

## 追加オプション {#additional-options}

ClickHouse Connectは、高度なユースケースのための追加オプションをいくつか提供します。

### グローバル設定 {#global-settings}

ClickHouse Connectの動作をグローバルに制御する少数の設定があります。これは`common`パッケージの最上位からアクセスできます：

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
これらの共通設定`autogenerate_session_id`、`product_name`、および`readonly`は、`clickhouse_connect.get_client`メソッドを使用してクライアントを作成する前に_常に_変更する必要があります。クライアント作成後にこれらの設定を変更しても、既存クライアントの動作には影響しません。
:::

現在定義されているグローバル設定は10個です：

| 設定名                  | デフォルト | オプション                 | 説明                                                                                                                                                                                                                                                   |
|-------------------------|------------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True       | True、False                 | 各クライアントセッションに対して新しいUUID(1)セッションID（提供されていない場合）を自動生成します。セッションIDが提供されない場合（クライアントまたはクエリレベルのいずれかで）、ClickHouseは各クエリに対してランダムな内部IDを生成します。                                             |
| invalid_setting_action  | 'error'    | 'drop'、'send'、'error'     | 無効または読み取り専用の設定が提供された場合（クライアントセッションまたはクエリのいずれか）、実行するアクション。`drop`の場合、設定は無視され、`send`の場合、設定はClickHouseに送信され、`error`の場合、クライアント側でProgrammingErrorが発生します。 |
| dict_parameter_format   | 'json'     | 'json'、'map'               | これは、パラメータ化されたクエリがPython辞書をJSONまたはClickHouseマップ構文に変換するかどうかを制御します。`json`はJSONカラムへの挿入に、`map`はClickHouseマップカラムへの挿入に使用されます。                                             |
| product_name            |            |                             | ClickHouse Connectを使用しているアプリケーションを追跡するために、クエリと共にClickHouseに渡される文字列。形式は&lt;製品名;&gl/&lt;製品バージョン&gt;です。                                                                                |
| max_connection_age      | 600        |                             | HTTPキープアライブ接続が開かれて再利用される最大秒数。この設定により、負荷分散/プロキシの背後で単一のClickHouseノードに対する接続の集中を防ぎます。デフォルトは10分です。                                                                          |
| readonly                | 0          | 0、1                        | 19.17以前のバージョンのClickHouseに対する暗黙の「読み取り専用」設定。非常に古いClickHouseバージョンでも操作を許可するためにClickHouseの「読み取り専用」値に合わせて設定できます。                                                         |
| use_protocol_version    | True       | True、False                 | クライアントプロトコルバージョンを使用します。これはDateTimeタイムゾーンカラムに必要ですが、現在のバージョンのchproxyでは問題があります。                                                                                            |
| max_error_size          | 1024       |                             | クライアントエラーメッセージに返される最大文字数。0に設定することで、この設定からClickHouseエラーメッセージ全体を取得できます。デフォルトは1024文字です。                                                                                        |
| send_os_user            | True       | True、False                 | ClickHouseに送信されるクライアント情報（HTTP User-Agent文字列）に、検出されたオペレーティングシステムユーザーを含めます。                                                                                                                 |
| http_buffer_size        | 10MB       |                             | HTTPストリーミングクエリに使用される「メモリ内」バッファのサイズ（バイト単位）。                                                                                                                                                    |
```

### 圧縮 {#compression}

ClickHouse Connectは、クエリ結果とインサートの両方に対してlzw、zstd、brotli、gzip圧縮をサポートしています。圧縮を使用すると、通常、ネットワーク帯域幅/転送速度とCPU使用率（クライアントとサーバーの両方）の間でトレードオフが発生することを常に念頭に置いてください。

圧縮データを受信するには、ClickHouseサーバーの `enable_http_compression` を1に設定する必要があるか、ユーザーが「クエリごと」に設定を変更する権限を持っている必要があります。

圧縮は、`clickhouse_connect.get_client`ファクトリメソッドを呼び出す際の`compress`パラメータによって制御されます。デフォルトでは、`compress`は`True`に設定されており、これによりデフォルトの圧縮設定がトリガーされます。 `query`、`query_np`、`query_df`クライアントメソッドで実行されたクエリの場合、ClickHouse Connectは、`query`クライアントメソッド（および間接的に`query_np`、`query_df`）で実行されたクエリに、`lz4`、`zstd`、`br`（brotliライブラリがインストールされている場合）、`gzip`、および`deflate`エンコーディングを持つ`Accept-Encoding`ヘッダーを追加します。（大多数のリクエストに対して、ClickHouseサーバーは`zstd`圧縮ペイロードを返します。）インサートの場合、デフォルトでClickHouse Connectは`lz4`圧縮を使用してインサートブロックを圧縮し、`Content-Encoding: lz4` HTTPヘッダーを送信します。

`get_client`の`compress`パラメータは、`lz4`、`zstd`、`br`、または`gzip`の特定の圧縮方式に設定することもできます。その方式はインサートとクエリ結果の両方に使用されます（ClickHouseサーバーがサポートしている場合）。必要な`zstd`および`lz4`圧縮ライブラリは、現在ClickHouse Connectにデフォルトでインストールされています。`br`/brotliが指定されている場合、brotliライブラリは別途インストールする必要があります。

`raw*`クライアントメソッドは、クライアント設定で指定された圧縮を使用しないことに注意してください。

また、データを圧縮および解凍する際に、`gzip`圧縮の使用は避けることをお勧めします。他の選択肢に比べて、圧縮および解凍が大幅に遅いためです。

### HTTPプロキシサポート {#http-proxy-support}

ClickHouse Connectは、`urllib3`ライブラリを使用して基本的なHTTPプロキシサポートを追加します。標準の`HTTP_PROXY`および`HTTPS_PROXY`環境変数を認識します。これらの環境変数を使用すると、`clickhouse_connect.get_client`メソッドで作成されたすべてのクライアントに適用されます。あるいは、クライアントごとに構成するには、`get_client`メソッドに`http_proxy`または`https_proxy`引数を使用できます。HTTPプロキシサポートの実装の詳細については、[urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies)ドキュメントを参照してください。

Socksプロキシを使用するには、`pool_mgr`引数として`get_client`に`urllib3` SOCKSProxyManagerを送信できます。これには、PySocksライブラリを直接インストールするか、`urllib3`依存関係の`[socks]`オプションを使用する必要があります。

### "古い" JSONデータ型 {#old-json-data-type}

実験的な`Object`（または`Object('json')`）データ型は廃止予定であり、運用環境では使用を避けるべきです。ClickHouse Connectは、後方互換性のためにこのデータ型に対して限定的なサポートを提供し続けています。このサポートには、辞書または同等の形式として「トップレベル」または「親」JSON値を返すことが期待されるクエリは含まれず、そのようなクエリは例外を引き起こします。

### "新しい" Variant/Dynamic/JSONデータタイプ（実験的機能） {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0リリース以降、`clickhouse-connect`は新しい（実験的な）ClickHouseタイプであるVariant、Dynamic、およびJSONの実験的サポートを提供します。

#### 使用ノート {#usage-notes}
- JSONデータは、Python辞書またはJSONオブジェクトを含むJSON文字列`{}`として挿入できます。他の形式のJSONデータはサポートされていません。
- これらのタイプのサブカラム/パスを使用するクエリは、サブカラムの型を返します。
- その他の使用ノートについては、主なClickHouseドキュメントを参照してください。

#### 既知の制限: {#known-limitations}
- これらの各タイプは、使用する前にClickHouseの設定で有効にする必要があります。
- 「新しい」JSONタイプは、ClickHouse 24.8リリースから使用可能です。
- 内部フォーマットの変更により、`clickhouse-connect`はClickHouse 24.7リリース以降のVariantタイプにのみ互換性があります。
- 返されるJSONオブジェクトは、`max_dynamic_paths`数の要素のみを返します（デフォルトは1024です）。これは将来のリリースで修正されます。
- `Dynamic`カラムへのインサートは常にPython値の文字列表現になります。これは、https://github.com/ClickHouse/ClickHouse/issues/70395 が修正され次第、将来のリリースで修正されます。
- 新しいタイプの実装はCコードで最適化されていないため、既存のデータ型よりもパフォーマンスが若干遅くなる可能性があります。
