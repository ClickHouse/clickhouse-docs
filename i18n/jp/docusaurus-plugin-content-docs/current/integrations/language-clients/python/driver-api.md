---
sidebar_label: 'ドライバ API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect ドライバ API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect ドライバ API'
doc_type: 'リファレンス'
---

# ClickHouse Connect ドライバー API {#clickhouse-connect-driver-api}

:::note
多くの引数が存在し、その大半がオプションであるため、ほとんどの API メソッドではキーワード引数で渡すことを推奨します。

*ここに記載されていないメソッドは API の一部とは見なされず、削除または変更される可能性があります。*
:::

## クライアントの初期化 {#client-initialization}

`clickhouse_connect.driver.client` クラスは、Python アプリケーションと ClickHouse データベース サーバーの間の主要なインターフェイスを提供します。`clickhouse_connect.get_client` 関数を使用して Client のインスタンスを取得します。この関数は次の引数を受け取ります。

### 接続引数 {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | `http` または `https` である必要があります。                                                                                                                                                                                                          |
| host                     | str         | localhost                     | ClickHouse サーバーのホスト名または IP アドレス。設定されていない場合は `localhost` が使用されます。                                                                                                                                                 |
| port                     | int         | 8123 or 8443                  | ClickHouse の HTTP/HTTPS ポート。設定されていない場合、デフォルトで 8123 が使用されますが、*secure*=*True* または *interface*=*https* の場合は 8443 が使用されます。                                                                                 |
| username                 | str         | default                       | ClickHouse のユーザー名。設定されていない場合、ClickHouse の `default` ユーザーが使用されます。                                                                                                                                                       |
| password                 | str         | *&lt;empty string&gt;*        | *username* 用のパスワード。                                                                                                                                                                                                                           |
| database                 | str         | *None*                        | 接続のデフォルトデータベース。設定されていない場合、ClickHouse Connect は *username* に対するデフォルトデータベースを使用します。                                                                                                                   |
| secure                   | bool        | False                         | HTTPS/TLS を使用します。interface や port 引数から推測される設定よりも優先されます。                                                                                                                                                                  |
| dsn                      | str         | *None*                        | 標準 DSN (Data Source Name) 形式の文字列。その他の接続値 (host や user など) は、個別に設定されていない場合、この文字列から抽出されます。                                                                                                            |
| compress                 | bool or str | True                          | ClickHouse の HTTP `insert` およびクエリ結果に対して圧縮を有効にします。[Additional Options (Compression)](additional-options.md#compression) を参照してください。                                                                                     |
| query_limit              | int         | 0 (unlimited)                 | 任意の `query` 応答で返される最大行数。無制限に行を返すには 0 に設定します。結果がストリーミングされず、一度にすべてメモリに読み込まれるため、大きな上限値はメモリ不足例外を引き起こす可能性がある点に注意してください。                               |
| query_retries            | int         | 2                             | `query` リクエストに対する最大リトライ回数。「リトライ可能な」HTTP 応答のみがリトライされます。意図しないリクエストの重複を防ぐため、`command` や `insert` リクエストはドライバによって自動的にはリトライされません。                                |
| connect_timeout          | int         | 10                            | HTTP 接続タイムアウト (秒)。                                                                                                                                                                                                                         |
| send_receive_timeout     | int         | 300                           | HTTP 接続の送受信タイムアウト (秒)。                                                                                                                                                                                                                  |
| client_name              | str         | *None*                        | HTTP User Agent ヘッダーの先頭に付与される client_name。ClickHouse の system.query_log でクエリ元のクライアントをトラッキングするために設定します。                                                                                                  |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 使用する `urllib3` ライブラリの PoolManager。複数のホスト向けに複数の接続プールが必要となるような高度なユースケース向けです。                                                                                                                       |
| http_proxy               | str         | *None*                        | HTTP プロキシアドレス (HTTP_PROXY 環境変数の設定と同等)。                                                                                                                                                                                            |
| https_proxy              | str         | *None*                        | HTTPS プロキシアドレス (HTTPS_PROXY 環境変数の設定と同等)。                                                                                                                                                                                          |
| apply_server_timezone    | bool        | True                          | タイムゾーン対応クエリ結果に対してサーバーのタイムゾーンを使用します。[Timezone Precedence](advanced-querying.md#time-zones) を参照してください。                                                                                                   |
| show_clickhouse_errors   | bool        | True                          | クライアント例外に、詳細な ClickHouse サーバーのエラーメッセージおよび例外コードを含めます。                                                                                                                                                          |
| autogenerate_session_id  | bool        | *None*                        | グローバルな `autogenerate_session_id` 設定を上書きします。True の場合、セッション ID が指定されていないときに UUID4 セッション ID を自動的に生成します。                                                                                            |
| proxy_path               | str         | &lt;empty string&gt;          | プロキシ構成向けに、ClickHouse サーバー URL に追加する任意のパスプレフィックス。                                                                                                                                                                     |
| form_encode_query_params | bool        | False                         | クエリパラメータを URL パラメータではなく、リクエストボディ内のフォームエンコードされたデータとして送信します。URL 長の制限を超える可能性がある、大量のパラメータを持つクエリに有用です。                                                          |
| rename_response_column   | str         | *None*                        | クエリ結果内のレスポンスカラム名を変更するための、任意のコールバック関数またはカラム名マッピング。                                                                                                                                                   |

### HTTPS/TLS 引数 {#httpstls-arguments}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLS を使用する場合に、ClickHouse サーバーの TLS/SSL 証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True* の場合に、ClickHouse サーバー証明書を検証するための認証局 (CA) ルート証明書ファイルのパス（.pem 形式）を指定します。`verify` が False の場合は無視されます。ClickHouse サーバー証明書が OS によって検証されるグローバルに信頼されたルート証明書である場合には不要です。 |
| client_cert      | str  | *None*  | TLS クライアント証明書（相互 TLS 認証用）のファイルパス（.pem 形式）を指定します。ファイルには、中間証明書を含む完全な証明書チェーンを含める必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書の秘密鍵ファイルのパスを指定します。秘密鍵がクライアント証明書ファイル内に含まれていない場合に必須です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS 証明書の CN または SNI で識別される ClickHouse サーバーのホスト名を指定します。異なるホスト名を持つプロキシやトンネル経由で接続する場合に、この値を設定して SSL エラーを回避します。                                                                                            |
| tls_mode         | str  | *None*  | 高度な TLS 動作を制御します。`proxy` および `strict` は ClickHouse の相互 TLS 接続は確立しませんが、クライアント証明書と鍵は送信します。`mutual` は、クライアント証明書を用いた ClickHouse の相互 TLS 認証を前提とします。*None*／デフォルトの動作は `mutual` です。                                |

### settings 引数 {#settings-argument}

最後に、`get_client` の `settings` 引数は、各クライアントリクエストごとに追加の ClickHouse 設定をサーバーへ渡すために使用されます。ほとんどの場合、*readonly*=*1* アクセスを持つユーザーはクエリとともに送信される設定を変更できないため、ClickHouse Connect はそのような設定を最終リクエストから削除し、警告をログに記録します。以下の設定は、ClickHouse Connect が使用する HTTP クエリ／セッションにのみ適用され、一般的な ClickHouse 設定としてはドキュメント化されていません。

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse サーバーが HTTP チャネルへ書き込む前に使用するバッファサイズ（バイト単位）。                                                                         |
| session_id        | サーバー上で関連クエリを関連付けるための一意のセッション ID。テンポラリテーブルに必須です。                                                                     |
| compress          | ClickHouse サーバーが POST レスポンスデータを圧縮するかどうか。この設定は `raw` クエリに対してのみ使用してください。                                           |
| decompress        | ClickHouse サーバーへ送信されるデータを伸長（解凍）する必要があるかどうか。この設定は `raw` インサートに対してのみ使用してください。                           |
| quota_key         | このリクエストに関連付けられたクォータキー。QUOTA については ClickHouse サーバーのドキュメントを参照してください。                                              |
| session_check     | セッションの状態を確認するために使用されます。                                                                                                                  |
| session_timeout   | session ID で識別されるセッションがタイムアウトし、有効と見なされなくなるまでの非アクティブ状態の継続時間（秒）。デフォルトは 60 秒です。                     |
| wait_end_of_query | レスポンス全体を ClickHouse サーバー側でバッファリングします。この設定はサマリ情報を返すために必須であり、非ストリーミングクエリでは自動的に設定されます。    |
| role              | セッションに使用される ClickHouse ロール。有効なトランスポート設定であり、クエリコンテキストに含めることができます。                                            |

各クエリとともに送信できるその他の ClickHouse 設定については、[ClickHouse のドキュメント](/operations/settings/settings.md)を参照してください。

### クライアント作成の例 {#client-creation-examples}

* パラメータを指定しない場合、ClickHouse Connect クライアントは `localhost` のデフォルト HTTP ポートに、デフォルトユーザーかつパスワードなしで接続します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# Output: '22.10.1.98'
```

* HTTPS で保護された外部 ClickHouse サーバーへの接続

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# Output: 'Etc/UTC'
```

* セッション ID などのカスタム接続パラメータや ClickHouse の設定を指定して接続する。

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host='play.clickhouse.com',
    user='play',
    password='clickhouse',
    port=443,
    session_id='example_session_1',
    connect_timeout=15,
    database='github',
    settings={'distributed_ddl_task_timeout':300},
)
print(client.database)
# Output: 'github'
```


## クライアントのライフサイクルとベストプラクティス {#client-lifecycle-and-best-practices}

ClickHouse Connect クライアントの作成は、接続の確立、サーバーメタデータの取得、各種設定の初期化などを伴う高コストな処理です。最適なパフォーマンスを得るため、次のベストプラクティスに従ってください。

### コア原則 {#core-principles}

- **クライアントを再利用する**: アプリケーションの起動時にクライアントを作成し、アプリケーションのライフサイクル全体で再利用する
- **頻繁な作成を避ける**: クエリやリクエストごとに新しいクライアントを作成しない（この場合、処理ごとに数百ミリ秒のオーバーヘッドが発生する）
- **適切にクリーンアップする**: シャットダウン時には必ずクライアントをクローズして、接続プールのリソースを解放する
- **可能な限り共有する**: 単一のクライアントで、接続プールを通じて多くの同時クエリを処理できる（スレッドに関する注意点は後述）

### 基本的なパターン {#basic-patterns}

**✅ 良い例: 1つのクライアントを再利用する**

```python
import clickhouse_connect

# Create once at startup
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')

# Reuse for all queries
for i in range(1000):
    result = client.query('SELECT count() FROM users')

# Close on shutdown
client.close()
```

**❌ 悪い例: クライアントを毎回新規作成する**

```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```


### マルチスレッドアプリケーション {#multi-threaded-applications}

:::warning
セッション ID を使用している場合、クライアントインスタンスは**スレッドセーフではありません**。デフォルトでは、クライアントには自動生成されたセッション ID が割り当てられ、同じセッション内でクエリを並行実行すると `ProgrammingError` が発生します。
:::

スレッド間でクライアントを安全に共有するには：

```python
import clickhouse_connect
import threading

# Option 1: Disable sessions (recommended for shared clients)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Required for thread safety
)

def worker(thread_id):
    # All threads can now safely use the same client
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
# Output:
# Thread 0: 0
# Thread 7: 7
# Thread 1: 1
# Thread 9: 9
# Thread 4: 4
# Thread 2: 2
# Thread 8: 8
# Thread 5: 5
# Thread 6: 6
# Thread 3: 3
```

**セッションの代替方法:** 一時テーブルの利用などでセッションが必要な場合は、スレッドごとに個別のクライアントを作成してください：

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```


### 適切なクリーンアップ {#proper-cleanup}

シャットダウン時には必ずクライアントをクローズしてください。`client.close()` は、クライアントが専用のプールマネージャーを所有している場合にのみ、クライアントを破棄し、プールされた HTTP 接続をクローズします（たとえば、カスタム TLS／プロキシオプション付きで作成された場合）。デフォルトの共有プールを使用している場合は、`client.close_connections()` を使用してソケットを明示的にクリアしてください。そうしない場合でも、接続はアイドルタイムアウトおよびプロセス終了時に自動的に解放されます。

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

または、コンテキストマネージャーを使用します：

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```


### 複数のクライアントをいつ使用するか {#when-to-use-multiple-clients}

複数のクライアントが適しているのは次のような場合です:

- **異なるサーバー**: ClickHouse のサーバーまたはクラスタごとに 1 つのクライアントを使用する場合
- **異なる認証情報**: 異なるユーザーやアクセスレベルごとにクライアントを分ける場合
- **異なるデータベース**: 複数のデータベースを扱う必要がある場合
- **分離されたセッション**: 一時テーブルやセッション固有の設定ごとにセッションを分離する必要がある場合
- **スレッド単位の分離**: スレッドごとに独立したセッションが必要な場合（前述のとおり）

## 共通メソッド引数 {#common-method-arguments}

いくつかのクライアントメソッドでは、共通の引数である `parameters` および `settings` の一方または両方を使用します。これらのキーワード引数について以下で説明します。

### Parameters argument {#parameters-argument}

ClickHouse Connect クライアントの `query*` および `command` メソッドは、Python の式を ClickHouse の値式にバインドするために使用される、オプションのキーワード引数 `parameters` を受け取ります。利用可能なバインディング方法は 2 種類あります。

#### サーバーサイドバインディング {#server-side-binding}

ClickHouse は、ほとんどのクエリ値に対して [サーバーサイドバインディング](/interfaces/cli.md#cli-queries-with-parameters) をサポートしており、バインドされた値はクエリとは別に HTTP クエリパラメータとして送信されます。ClickHouse Connect は、`{<name>:<datatype>}` 形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバーサイドバインディングでは、`parameters` 引数は Python の辞書（dictionary）で指定する必要があります。

* Python の辞書（dictionary）、DateTime 値、文字列値を用いたサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

これによりサーバー上で次のクエリが生成されます。

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
サーバーサイドバインディングは、ClickHouse サーバーでは `SELECT` クエリに対してのみサポートされています。`ALTER`、`DELETE`、`INSERT`、およびその他の種類のクエリでは機能しません。将来的に変更される可能性があります。詳細は [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092) を参照してください。
:::


#### クライアントサイドバインディング {#client-side-binding}

ClickHouse Connect はクライアントサイドでのパラメータバインディングにも対応しており、テンプレート化された SQL クエリを生成する際に、より柔軟に扱うことができます。クライアントサイドバインディングでは、`parameters` 引数は dictionary もしくは sequence である必要があります。クライアントサイドバインディングでは、パラメータの置換に Python の[「printf」スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)の文字列フォーマットを使用します。

サーバーサイドバインディングと異なり、クライアントサイドバインディングは database、table、column 名といったデータベース識別子には使用できない点に注意してください。これは、Python スタイルのフォーマットでは異なる種類の文字列を区別できず、それぞれ異なる形式でフォーマットする必要があるためです（データベース識別子にはバッククォートまたは二重引用符、データ値には単一引用符を使用する必要があります）。

* Python Dictionary、DateTime 値および文字列エスケープを用いた例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

これにより、サーバー側で次のクエリが生成されます。

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

* Python のシーケンス（タプル）、Float64、IPv4Address を使った例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

これによりサーバー側で次のクエリが生成されます。

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64 引数（サブ秒精度を持つ ClickHouse 型）をバインドするには、次の 2 つのカスタム手法のいずれかを使用する必要があります:

* 新しい DT64Param クラスで Python の `datetime.datetime` 値をラップします。例:
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # Server-side binding with dictionary
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client-side binding with list 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * パラメータ値の dictionary（辞書型）を使用している場合、パラメータ名に文字列 `_64` を付加します
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server-side binding with dictionary

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```

:::


### Settings 引数 {#settings-argument-1}

すべての主要な ClickHouse Connect Client の `insert` および `select` メソッドは、オプションの `settings` キーワード引数を受け取り、含まれる SQL 文に対して ClickHouse サーバーの[ユーザー設定](/operations/settings/settings.md)を渡すことができます。`settings` 引数は dictionary である必要があります。各要素は ClickHouse の設定名とその値のペアにします。値は、サーバーにクエリパラメーターとして送信される際に文字列へ変換される点に注意してください。

クライアントレベルの設定と同様に、ClickHouse Connect はサーバー側で *readonly*=*1* とマークされている設定を破棄し、その旨のログメッセージを出力します。ClickHouse の HTTP インターフェース経由のクエリにのみ適用される設定は常に有効です。これらの設定については `get_client` [API](#settings-argument) の節で説明されています。

ClickHouse 設定の使用例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```


## Client `command` Method {#client-command-method}

`Client.command` メソッドを使用して、通常はデータを返さない、または完全なデータセットではなく単一のプリミティブ値または配列値を返す SQL クエリを ClickHouse サーバーに送信します。このメソッドは次のパラメータを取ります。

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | 単一の値、または値の 1 行を返す ClickHouse SQL ステートメント。                                                                                               |
| parameters    | dict or iterable | *None*     | [parameters description](#parameters-argument) を参照してください。                                                                                            |
| data          | str or bytes     | *None*     | POST ボディとしてコマンドに含めるオプションのデータ。                                                                                                        |
| settings      | dict             | *None*     | [settings description](#settings-argument) を参照してください。                                                                                                |
| use_database  | bool             | True       | クライアントのデータベース（クライアント作成時に指定）を使用します。False の場合、接続しているユーザーには ClickHouse サーバーのデフォルトデータベースが使用されます。 |
| external_data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む `ExternalData` オブジェクト。[Advanced Queries (External Data)](advanced-querying.md#external-data) を参照してください。 |

### コマンドの例 {#command-examples}

#### DDL 文 {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Create a table
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Returns QuerySummary with query_id

# Show table definition
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# Output:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()

# Drop table
client.command("DROP TABLE test_command")
```


#### 単一値を返す簡単なクエリ {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Single value result
count = client.command("SELECT count() FROM system.tables")
print(count)
# Output: 151

# Server version
version = client.command("SELECT version()")
print(version)
# Output: "25.8.2.29"
```


#### パラメータ付きコマンド {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using client-side parameters
table_name = "system"
result = client.command(
    "SELECT count() FROM system.tables WHERE database = %(db)s",
    parameters={"db": table_name}
)

# Using server-side parameters
result = client.command(
    "SELECT count() FROM system.tables WHERE database = {db:String}",
    parameters={"db": "system"}
)
```


#### 設定を指定するコマンド {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```


## Client `query` Method {#client-query-method}

`Client.query` メソッドは、ClickHouse サーバーから単一の「バッチ」データセットを取得するための主な方法です。HTTP 経由で Native ClickHouse 形式を使用して、大規模なデータセット（最大およそ 100 万行）を効率的に送信します。このメソッドは次のパラメーターを受け取ります：

| Parameter           | Type             | Default    | Description                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required* | ClickHouse の SQL SELECT または DESCRIBE クエリ。                                                                                                                                  |
| parameters          | dict or iterable | *None*     | [parameters の説明](#parameters-argument)を参照。                                                                                                                                  |
| settings            | dict             | *None*     | [settings の説明](#settings-argument)を参照。                                                                                                                                      |
| query_formats       | dict             | *None*     | 結果値に対するデータ型フォーマット指定。詳細は Advanced Usage (Read Formats) を参照。                                                                                             |
| column_formats      | dict             | *None*     | カラム単位でのデータ型フォーマット指定。詳細は Advanced Usage (Read Formats) を参照。                                                                                              |
| encoding            | str              | *None*     | ClickHouse の String カラムを Python の文字列にエンコードする際に使用するエンコーディング。設定されていない場合、Python のデフォルトは `UTF-8`。                                   |
| use_none            | bool             | True       | ClickHouse の NULL に対して Python の *None* 型を使用するかどうか。False の場合、ClickHouse の NULL にはデータ型のデフォルト値（0 など）を使用する。注意: NumPy/Pandas ではパフォーマンス上の理由によりデフォルトは False。 |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなくカラムのシーケンスとして返す。Python のデータを他のカラム指向データフォーマットに変換する際に有用。                                                    |
| query_tz            | str              | *None*     | `zoneinfo` データベースに基づくタイムゾーン名。このタイムゾーンは、クエリで返されるすべての datetime または Pandas Timestamp オブジェクトに適用される。                               |
| column_tzs          | dict             | *None*     | カラム名をキー、タイムゾーン名を値とする Dictionary。`query_tz` と同様だが、カラムごとに異なるタイムゾーンを指定できる。                                                              |
| use_extended_dtypes | bool             | True       | Pandas の拡張 dtype（StringArray など）および、ClickHouse の NULL 値に対して pandas.NA と pandas.NaT を使用する。`query_df` および `query_df_stream` メソッドにのみ適用。          |
| external_data       | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。[Advanced Queries (External Data)](advanced-querying.md#external-data) を参照。                         |
| context             | QueryContext     | *None*     | 上記のメソッド引数をカプセル化するために再利用可能な QueryContext オブジェクト。[Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts) を参照。                       |

### クエリ例 {#query-examples}

#### 基本的なクエリ {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Simple SELECT query
result = client.query("SELECT name, database FROM system.tables LIMIT 3")

# Access results as rows
for row in result.result_rows:
    print(row)
# Output:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')

# Access column names and types
print(result.column_names)
# Output: ("name", "database")
print([col_type.name for col_type in result.column_types])
# Output: ['String', 'String']
```


#### クエリ結果の取得 {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

# Row-oriented access (default)
print(result.result_rows)
# Output: [[0, "0"], [1, "1"], [2, "2"]]

# Column-oriented access
print(result.result_columns)
# Output: [[0, 1, 2], ["0", "1", "2"]]

# Named results (list of dictionaries)
for row_dict in result.named_results():
    print(row_dict)
# Output: 
# {"number": 0, "str": "0"}
# {"number": 1, "str": "1"}
# {"number": 2, "str": "2"}

# First row as dictionary
print(result.first_item)
# Output: {"number": 0, "str": "0"}

# First row as tuple
print(result.first_row)
# Output: (0, "0")
```


#### クライアント側パラメータ付きクエリ {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using dictionary parameters (printf-style)
query = "SELECT * FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)

# Using tuple parameters
query = "SELECT * FROM system.tables WHERE database = %s LIMIT %s"
parameters = ("system", 5)
result = client.query(query, parameters=parameters)
```


#### サーバー側パラメータを利用したクエリ {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```


#### 設定付きクエリ {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Pass ClickHouse settings with the query
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={
        "max_block_size": 100000,
        "max_execution_time": 30
    }
)
```


### `QueryResult` オブジェクト {#the-queryresult-object}

基本的な `query` メソッドは、次のパブリックプロパティを持つ `QueryResult` オブジェクトを返します:

- `result_rows` -- 行のシーケンス形式で返されたデータの2次元配列であり、各行要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンス形式で返されたデータの2次元配列であり、各カラム要素はそのカラムに対応する行の値のシーケンスです。
- `column_names` -- `result_set` 内のカラム名を表す文字列のタプル
- `column_types` -- `result_columns` 内の各カラムに対応する ClickHouse データ型を表す ClickHouseType インスタンスのタプル
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブル内のクエリを調査する際に有用）
- `summary` -- `X-ClickHouse-Summary` HTTPレスポンスヘッダーによって返された任意のデータ
- `first_item` -- 応答の最初の行を、カラム名をキーとする辞書として取得するための補助プロパティ
- `first_row` -- 結果の最初の行を返すための補助プロパティ
- `column_block_stream` -- カラム指向フォーマットでのクエリ結果を生成するジェネレーター。このプロパティを直接参照してはいけません（後述）。
- `row_block_stream` -- 行指向フォーマットでのクエリ結果を生成するジェネレーター。このプロパティを直接参照してはいけません（後述）。
- `rows_stream` -- 呼び出しごとに1行のクエリ結果を生成するジェネレーター。このプロパティを直接参照してはいけません（後述）。
- `summary` -- `command` メソッドで説明したとおり、ClickHouse によって返されるサマリー情報の辞書

`*_stream` プロパティは、返されたデータに対してイテレータとして使用できる Python のコンテキストマネージャを返します。これらには Client の `*_stream` メソッドを介してのみ間接的にアクセスしてください。

ストリーミングクエリ結果（StreamContext オブジェクトを用いる）の詳細については、[Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries) を参照してください。

## NumPy、Pandas、または Arrow でクエリ結果を扱う {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect は、NumPy、Pandas、Arrow の各データ形式向けに専用のクエリメソッドを提供します。これらのメソッドの使用方法の詳細（例、ストリーミング機能、高度な型処理など）については、[高度なクエリ（NumPy、Pandas、Arrow クエリ）](advanced-querying.md#numpy-pandas-and-arrow-queries) を参照してください。

## クライアント向けストリーミングクエリメソッド {#client-streaming-query-methods}

大規模な結果セットをストリーミングするために、ClickHouse Connect には複数のストリーミングメソッドが用意されています。詳細および例については、[高度なクエリ（ストリーミングクエリ）](advanced-querying.md#streaming-queries) を参照してください。

## Client `insert` Method {#client-insert-method}

ClickHouse に複数レコードを挿入するという一般的なユースケース向けに、`Client.insert` メソッドが用意されています。このメソッドは次のパラメータを受け取ります。

| Parameter          | Type                              | Default    | Description                                                                                                                                                                                   |
|--------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                               | *Required* | 挿入先の ClickHouse テーブル。データベース名を含むフルテーブル名も指定できます。                                                                                                             |
| data               | Sequence of Sequences             | *Required* | 挿入するデータの行列。行方向（各要素がカラム値のシーケンス）または列方向（各要素が行値のシーケンス）のいずれかのシーケンスとして指定します。                                                  |
| column_names       | Sequence of str, or str           | '*'        | データ行列に対応するカラム名のリスト。代わりに '*' を使用した場合、ClickHouse Connect が「事前クエリ」を実行して、テーブルのすべてのカラム名を取得します。                                     |
| database           | str                               | ''         | 挿入先のデータベース。指定しない場合、クライアントで設定されているデータベースが使用されます。                                                                                               |
| column_types       | Sequence of ClickHouseType        | *None*     | ClickHouseType インスタンスのリスト。column_types も column_type_names も指定しない場合、ClickHouse Connect が「事前クエリ」を実行して、テーブルのすべてのカラム型を取得します。             |
| column_type_names  | Sequence of ClickHouse type names | *None*     | ClickHouse のデータ型名のリスト。column_types も column_type_names も指定しない場合、ClickHouse Connect が「事前クエリ」を実行して、テーブルのすべてのカラム型を取得します。                 |
| column_oriented    | bool                              | False      | `True` の場合、`data` 引数は列のシーケンス（この場合データ挿入のためのピボット処理は不要）であるとみなされます。それ以外の場合、`data` は行のシーケンスとして解釈されます。                   |
| settings           | dict                              | *None*     | [settings description](#settings-argument) を参照してください。                                                                                                                                |
| context            | InsertContext                     | *None*     | 上記メソッド引数をカプセル化する再利用可能な InsertContext オブジェクトを使用できます。[Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts) を参照してください。       |
| transport_settings | dict                              | *None*     | トランスポートレベルの設定（HTTP ヘッダーなど）を指定する任意の dict です。                                                                                                                  |

このメソッドは "command" メソッドで説明されている「クエリサマリ」dictionary を返します。挿入が何らかの理由で失敗した場合は、例外が送出されます。

Pandas DataFrame、PyArrow Table、および Arrow バックエンドの DataFrame と連携する専用の挿入メソッドについては、[Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods) を参照してください。

:::note
NumPy 配列は有効な Sequence of Sequences であり、メインの `insert` メソッドに対する `data` 引数として使用できるため、専用メソッドを使用する必要はありません。
:::

### 例 {#examples}

以下の例では、スキーマ `(id UInt32, name String, age UInt8)` を持つ既存のテーブル `users` があると仮定します。

#### 基本的な行指向インサート {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Row-oriented data: each inner list is a row
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert("users", data, column_names=["id", "name", "age"])
```


#### カラム指向での挿入 {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Column-oriented data: each inner list is a column
data = [
    [1, 2, 3],  # id column
    ["Alice", "Bob", "Joe"],  # name column
    [25, 30, 28],  # age column
]

client.insert("users", data, column_names=["id", "name", "age"], column_oriented=True)
```


#### カラム型を明示的に指定して挿入 {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Useful when you want to avoid a DESCRIBE query to the server
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    column_type_names=["UInt32", "String", "UInt8"],
)
```


#### 特定のデータベースへの挿入 {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]

# Insert into a table in a specific database
client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    database="production",
)
```


## ファイルからの挿入 {#file-inserts}

ファイルから ClickHouse テーブルにデータを直接挿入する場合は、[高度な挿入（ファイルからの挿入）](advanced-inserting.md#file-inserts) を参照してください。

## Raw API {#raw-api}

型変換を行わずに ClickHouse の HTTP インターフェースに直接アクセスする必要がある高度なユースケースについては、[高度な利用方法（Raw API）](advanced-usage.md#raw-api) を参照してください。

## Utility classes and functions {#utility-classes-and-functions}

以下のクラスおよび関数も「public」な `clickhouse-connect` API の一部と見なされ、上記で説明したクラスおよびメソッドと同様に、マイナーリリース間で安定して提供されます。これらのクラスおよび関数に対する後方互換性を損なう変更は、マイナー（パッチではない）リリースでのみ導入され、その後少なくとも 1 回のマイナーリリースの間は非推奨として提供されます。

### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0 仕様で定義されているものを含む）は、`clickhouse_connect.driver.exceptions` モジュール内で定義されています。ドライバーによって実際に検出される例外は、いずれもこれらの型のいずれかになります。

### ClickHouse SQL ユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュール内の関数および DT64Param クラスは、ClickHouse の SQL クエリを正しく構築し、適切にエスケープするために使用できます。同様に、`clickhouse_connect.driver.parser` モジュール内の関数は、ClickHouse のデータ型名を解析するために使用できます。

## マルチスレッド、マルチプロセス、および非同期／イベント駆動型のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect をマルチスレッド、マルチプロセス、および非同期／イベント駆動型アプリケーションで利用する方法については、[高度な利用方法（マルチスレッド、マルチプロセス、および非同期／イベント駆動型のユースケース）](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases) を参照してください。

## AsyncClient ラッパー {#asyncclient-wrapper}

asyncio 環境向けの AsyncClient ラッパーの利用方法については、[高度な利用 (AsyncClient ラッパー)](advanced-usage.md#asyncclient-wrapper)を参照してください。

## ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

マルチスレッドまたは並行実行されるアプリケーションにおける ClickHouse セッション ID の管理については、[高度な使い方 (ClickHouse セッション ID の管理)](advanced-usage.md#managing-clickhouse-session-ids) を参照してください。

## HTTP 接続プールのカスタマイズ {#customizing-the-http-connection-pool}

大規模なマルチスレッドアプリケーション向け HTTP 接続プールのカスタマイズについては、[高度な利用方法 (HTTP 接続プールのカスタマイズ)](advanced-usage.md#customizing-the-http-connection-pool) を参照してください。