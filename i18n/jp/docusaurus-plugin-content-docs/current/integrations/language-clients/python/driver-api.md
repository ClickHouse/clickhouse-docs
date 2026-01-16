---
sidebar_label: 'ドライバー API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect ドライバー API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect ドライバー API'
doc_type: 'reference'
---

# ClickHouse Connect ドライバー API \{#clickhouse-connect-driver-api\}

:::note
指定できる引数の数が多く、その大半がオプションであるため、ほとんどの API メソッドではキーワード引数で指定することを推奨します。

*ここに記載されていないメソッドは API の一部とは見なされず、削除または変更される可能性があります。*
:::

## クライアントの初期化 \{#client-initialization\}

`clickhouse_connect.driver.client` クラスは、Python アプリケーションと ClickHouse データベース サーバーとの間の主なインターフェースとなるクラスです。`clickhouse_connect.get_client` 関数を使用して Client インスタンスを取得します。この関数は次の引数を受け取ります。

### 接続引数 \{#connection-arguments\}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | http または https である必要があります。                                                                                                                                                                                                             |
| host                     | str         | localhost                     | ClickHouse サーバーのホスト名または IP アドレス。設定されていない場合は `localhost` が使用されます。                                                                                                                                              |
| port                     | int         | 8123 or 8443                  | ClickHouse サーバーの HTTP または HTTPS ポート。設定されていない場合は 8123 がデフォルトになり、*secure*=*True* または *interface*=*https* の場合は 8443 が使用されます。                                                                         |
| username                 | str         | default                       | ClickHouse のユーザー名。設定されていない場合、ClickHouse の `default` ユーザーが使用されます。                                                                                                                                                     |
| password                 | str         | *&lt;empty string&gt;*        | *username* のパスワード。                                                                                                                                                                                                                            |
| database                 | str         | *None*                        | 接続に使用するデフォルトのデータベース。設定されていない場合、ClickHouse Connect は *username* に設定されたユーザーのデフォルトデータベースを使用します。                                                                                          |
| secure                   | bool        | False                         | HTTPS/TLS を使用します。interface 引数や port 引数から推論される値を上書きします。                                                                                                                                                                   |
| dsn                      | str         | *None*                        | 標準的な DSN (Data Source Name) 形式の文字列。その他の接続設定値 (host や user など) は、別途設定されていない場合、この文字列から抽出されます。                                                                                                     |
| compress                 | bool or str | True                          | ClickHouse の HTTP insert およびクエリ結果に対して圧縮を有効にします。[Additional Options (Compression)](additional-options.md#compression) を参照してください。                                                                                     |
| query_limit              | int         | 0 (unlimited)                 | 任意の `query` 応答で返す最大行数。無制限の行数を返すには 0 を設定します。結果がストリーミングされない場合、大きな query_limit を設定すると、すべての結果が一度にメモリに読み込まれるため、メモリ不足の例外が発生する可能性がある点に注意してください。 |
| query_retries            | int         | 2                             | `query` リクエストの最大再試行回数。「再試行可能」な HTTP 応答のみが再試行されます。意図しない重複リクエストを防ぐため、`command` や `insert` リクエストはドライバーによって自動再試行されません。                                               |
| connect_timeout          | int         | 10                            | HTTP 接続のタイムアウト (秒)。                                                                                                                                                                                                                       |
| send_receive_timeout     | int         | 300                           | HTTP 接続の送信/受信タイムアウト (秒)。                                                                                                                                                                                                              |
| client_name              | str         | *None*                        | HTTP User-Agent ヘッダーの先頭に付与される client_name。ClickHouse の system.query_log でクライアントクエリをトラッキングするために設定します。                                                                                                   |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 使用する `urllib3` ライブラリの PoolManager。複数のホストに対する複数の接続プールが必要となる高度なユースケース向けです。                                                                                                                          |
| http_proxy               | str         | *None*                        | HTTP プロキシアドレス (HTTP_PROXY 環境変数を設定するのと同等)。                                                                                                                                                                                     |
| https_proxy              | str         | *None*                        | HTTPS プロキシアドレス (HTTPS_PROXY 環境変数を設定するのと同等)。                                                                                                                                                                                   |
| apply_server_timezone    | bool        | True                          | タイムゾーン情報を持つクエリ結果に対してサーバーのタイムゾーンを使用します。[Timezone Precedence](advanced-querying.md#time-zones) を参照してください。                                                                                           |
| show_clickhouse_errors   | bool        | True                          | クライアント側の例外に、詳細な ClickHouse サーバーのエラーメッセージおよび例外コードを含めます。                                                                                                                                                     |
| autogenerate_session_id  | bool        | *None*                        | グローバルな `autogenerate_session_id` 設定を上書きします。True に設定された場合、セッション ID が指定されていないときに UUID4 セッション ID を自動生成します。                                                                                     |
| proxy_path               | str         | &lt;empty string&gt;          | プロキシ構成のために ClickHouse サーバーの URL に追加する任意のパスプレフィックス。                                                                                                                                                                |
| form_encode_query_params | bool        | False                         | クエリパラメータを URL パラメータではなく、リクエストボディ内のフォームエンコードされたデータとして送信します。URL 長の制限を超える可能性のある大きなパラメータセットを持つクエリで便利です。                                                   |
| rename_response_column   | str         | *None*                        | クエリ結果内のレスポンスカラム名を変更するための、任意のコールバック関数またはカラム名マッピング。                                                                                                                                                  |

### HTTPS/TLS 引数 \{#httpstls-arguments\}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLS を使用する場合、ClickHouse サーバーの TLS/SSL 証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True* の場合に使用します。ClickHouse サーバー証明書を検証するための認証局 (Certificate Authority) ルート証明書のファイルパス（.pem 形式）。`verify` が False の場合は無視されます。ClickHouse サーバー証明書が、OS によってグローバルに信頼されたルート証明書として検証される場合は不要です。 |
| client_cert      | str  | *None*  | TLS クライアント証明書（相互 TLS 認証用）のファイルパス（.pem 形式）。ファイルには、中間証明書を含む完全な証明書チェーンを含める必要があります。                                                                                                  |
| client_cert_key  | str  | *None*  | クライアント証明書用の秘密鍵のファイルパス。秘密鍵がクライアント証明書ファイル内に含まれていない場合に必須です。                                                                                                                                             |
| server_host_name | str  | *None*  | TLS 証明書の CN または SNI によって識別される ClickHouse サーバーのホスト名。異なるホスト名を持つプロキシやトンネル経由で接続する際の SSL エラーを回避するために設定します。                                                                                            |
| tls_mode         | str  | *None*  | 高度な TLS の動作を制御します。`proxy` と `strict` は ClickHouse の相互 TLS 接続を開始しませんが、クライアント証明書と鍵は送信します。`mutual` はクライアント証明書を用いた ClickHouse の相互 TLS 認証を前提とします。*None*／デフォルトの動作は `mutual` です。                                |

### settings 引数 \{#settings-argument\}

最後に、`get_client` の `settings` 引数は、各クライアントリクエストごとに追加の ClickHouse の設定をサーバーへ渡すために使用されます。ほとんどの場合、*readonly*=*1* アクセス権を持つユーザーはクエリと一緒に送信される設定を変更できないため、ClickHouse Connect はそのような設定を最終リクエストから削除し、警告をログに記録します。以下の設定は、ClickHouse Connect が使用する HTTP クエリ／セッションにのみ適用され、一般的な ClickHouse の設定としてはドキュメント化されていません。

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse サーバーが HTTP チャネルへ書き込む前に使用するバッファサイズ（バイト単位）。                                                                         |
| session_id        | 関連するクエリをサーバー上で関連付けるための一意のセッション ID。一時テーブルを使用する場合に必須です。                                                         |
| compress          | ClickHouse サーバーが POST レスポンスデータを圧縮するかどうか。この設定は「raw」クエリに対してのみ使用してください。                                           |
| decompress        | ClickHouse サーバーに送信されるデータを伸長（解凍）する必要があるかどうか。この設定は「raw」インサートに対してのみ使用してください。                           |
| quota_key         | このリクエストに関連付けられたクォータキー。QUOTA については ClickHouse サーバーのドキュメントを参照してください。                                             |
| session_check     | セッションの状態を確認するために使用します。                                                                                                                     |
| session_timeout   | session_id で識別されるセッションがタイムアウトし、有効とみなされなくなるまでの非アクティブ状態の秒数。デフォルトは 60 秒です。                                |
| wait_end_of_query | レスポンス全体を ClickHouse サーバー側でバッファします。この設定はサマリ情報を返すために必要であり、非ストリーミングクエリでは自動的に設定されます。           |
| role              | セッションで使用する ClickHouse のロール。クエリコンテキストに含めることができる有効なトランスポート設定です。                                                  |

各クエリと共に送信できるその他の ClickHouse の設定については、[ClickHouse のドキュメント](/operations/settings/settings.md) を参照してください。

### クライアント作成例 \{#client-creation-examples\}

* パラメータを一切指定しない場合、ClickHouse Connect クライアントは、デフォルトユーザー・パスワードなしで `localhost` のデフォルト HTTP ポートに接続します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# Output: '22.10.1.98'
```

* HTTPS を利用したセキュアな外部 ClickHouse サーバーへの接続

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# Output: 'Etc/UTC'
```

* セッション ID、その他のカスタム接続パラメータや ClickHouse の設定を指定して接続する。

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


## クライアントのライフサイクルとベストプラクティス \{#client-lifecycle-and-best-practices\}

ClickHouse Connect クライアントの作成は、接続の確立、サーバーメタデータの取得、各種設定の初期化を伴う高コストな操作です。最適なパフォーマンスを得るために、次のベストプラクティスに従ってください。

### 基本原則 \{#core-principles\}

- **クライアントを再利用する**: クライアントはアプリケーション起動時に一度だけ作成し、その後はアプリケーションの実行期間を通じて再利用します
- **頻繁な作成を避ける**: クエリやリクエストごとに新しいクライアントを作成しないでください（これにより、操作ごとに数百ミリ秒のオーバーヘッドが発生します）
- **適切にクリーンアップする**: シャットダウン時には必ずクライアントをクローズし、コネクションプールのリソースを解放します
- **可能な限り共有する**: 1つのクライアントで、コネクションプールを通じて多数の同時クエリを処理できます（スレッドに関する注意事項は後述を参照してください）

### 基本パターン \{#basic-patterns\}

**✅ 推奨: 単一のクライアントを再利用する**

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

**❌ 悪い例: クライアントを何度も作成する**

```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```


### マルチスレッドアプリケーション \{#multi-threaded-applications\}

:::warning
クライアントインスタンスは、セッション ID を使用している場合、**スレッドセーフではありません**。デフォルトではクライアントには自動生成されたセッション ID が割り当てられ、同じセッション内でクエリを並行実行すると `ProgrammingError` がスローされます。
:::

スレッド間でクライアントを安全に共有するには、次のようにします：

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

**セッション利用時の代替策：** セッション（例：一時テーブルを利用する場合）が必要な場合は、スレッドごとに専用のクライアントを作成してください。

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```


### 適切なクリーンアップ \{#proper-cleanup\}

シャットダウン時には必ずクライアントをクローズしてください。`client.close()` は、クライアントが専用のプールマネージャーを所有している場合にのみ（たとえば、カスタムTLS/プロキシオプション付きで作成された場合などに）、クライアントを破棄し、プールされた HTTP 接続をクローズします。デフォルトの共有プールを使用している場合は、`client.close_connections()` を使用してソケットを積極的にクリアしてください。これを行わない場合でも、接続はアイドル時の有効期限およびプロセス終了時に自動的に解放されます。

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

または、次のようにコンテキストマネージャーを使用します：

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```


### 複数のクライアントを使用するタイミング \{#when-to-use-multiple-clients\}

複数のクライアントが適している状況:

- **異なるサーバー**: ClickHouse のサーバーやクラスタごとにクライアントを 1 つ
- **異なる認証情報**: ユーザーやアクセスレベルごとにクライアントを分離する場合
- **異なるデータベース**: 複数のデータベースを扱う必要がある場合
- **セッションの分離**: 一時テーブルやセッション固有の設定のためにセッションを分けたい場合
- **スレッドごとの分離**: スレッドごとに独立したセッションが必要な場合（前述のとおり）

## 共通のメソッド引数 \{#common-method-arguments\}

一部のクライアントメソッドは、共通の `parameters` 引数および/または `settings` 引数を使用します。これらのキーワード引数について、以下で説明します。

### Parameters 引数 \{#parameters-argument\}

ClickHouse Connect クライアントの `query*` および `command` メソッドは、Python の式を ClickHouse の値式にバインドするために使用される任意指定のキーワード引数 `parameters` を受け取ります。利用可能なバインディング方式は 2 種類あります。

#### サーバー側バインディング \{#server-side-binding\}

ClickHouse は、ほとんどのクエリ値に対して [サーバー側バインディング](/interfaces/cli.md#cli-queries-with-parameters) をサポートしており、バインドされた値はクエリとは別に HTTP のクエリパラメータとして送信されます。ClickHouse Connect は、`{<name>:<datatype>}` 形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバー側バインディングでは、`parameters` 引数には Python の辞書型を指定する必要があります。

* Python の辞書型、DateTime 値、および文字列値を使ったサーバー側バインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

これにより、サーバー側では次のクエリが生成されます。

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
サーバー側バインディングは（ClickHouseサーバーによって）`SELECT` クエリに対してのみサポートされています。`ALTER`、`DELETE`、`INSERT`、その他の種類のクエリでは動作しません。この仕様は将来変更される可能性があります。詳細は [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092) を参照してください。
:::


#### クライアントサイドでのバインディング \{#client-side-binding\}

ClickHouse Connect はクライアントサイドでのパラメータバインディングにも対応しており、テンプレート化された SQL クエリを生成する際に、より柔軟に扱うことができます。クライアントサイドバインディングを行う場合、`parameters` 引数には dictionary もしくは sequence を指定します。クライアントサイドバインディングでは、パラメータの代入に Python の [&quot;printf&quot; スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)の文字列フォーマットを使用します。

サーバーサイドバインディングと異なり、クライアントサイドバインディングは database、table、column 名などのデータベース識別子には使用できない点に注意してください。これは、Python スタイルのフォーマットでは異なる種類の文字列を区別できず、識別子とデータ値で必要なフォーマット（データベース識別子にはバッククォートまたはダブルクォート、データ値にはシングルクォート）が異なるためです。

* Python の Dictionary、DateTime 値、および文字列エスケープを使用した例

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

* Python のシーケンス（タプル）、Float64、および IPv4Address を使った例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

これにより、サーバー側で次のクエリが生成されます：

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64引数(サブ秒精度を持つClickHouseの型)をバインドするには、以下の2つのカスタムアプローチのいずれかを使用する必要があります:

* Pythonの`datetime.datetime`値を新しいDT64Paramクラスでラップします。例:
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # Dictionaryを使用したサーバー側バインディング
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストを使用したクライアント側バインディング
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * パラメータ値のDictionaryを使用する場合は、パラメータ名に文字列`_64`を追加します
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Dictionaryを使用したサーバー側バインディング

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```

:::


### Settings 引数 \{#settings-argument-1\}

主要な ClickHouse Connect Client の &quot;insert&quot; および &quot;select&quot; メソッドはすべて、含まれる SQL ステートメントに対して ClickHouse サーバーの [user settings](/operations/settings/settings.md) を渡すためのオプションの `settings` キーワード引数を受け取ります。`settings` 引数は dictionary である必要があります。各要素は ClickHouse の設定名と、その値のペアにします。値はサーバーにクエリパラメータとして送信される際に文字列に変換されることに注意してください。

クライアントレベルの settings と同様に、ClickHouse Connect はサーバー側で *readonly*=*1* とマークされたすべての settings を、対応するログメッセージとともに無視します。ClickHouse の HTTP インターフェイス経由のクエリにのみ適用される settings は常に有効です。これらの settings については `get_client` [API](#settings-argument) で説明しています。

ClickHouse settings の使用例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```


## Client `command` Method \{#client-command-method\}

`Client.command` メソッドは、通常はデータを返さない SQL クエリや、完全なデータセットではなく単一のプリミティブ値または配列値だけを返す SQL クエリを ClickHouse サーバーに送信するために使用します。このメソッドは次のパラメーターを取ります:

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | 単一の値、または値の 1 行のみを返す ClickHouse SQL ステートメント。                                                                                           |
| parameters    | dict or iterable | *None*     | [parameters description](#parameters-argument) を参照してください。                                                                                             |
| data          | str or bytes     | *None*     | POST ボディとしてコマンドに含める任意の追加データ。                                                                                                           |
| settings      | dict             | *None*     | [settings description](#settings-argument) を参照してください。                                                                                                |
| use_database  | bool             | True       | クライアントのデータベース（クライアント作成時に指定）を使用します。False の場合、このコマンドは接続中のユーザーに対して ClickHouse サーバーのデフォルトデータベースを使用します。 |
| external_data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む `ExternalData` オブジェクト。[Advanced Queries (External Data)](advanced-querying.md#external-data) を参照してください。     |

### コマンドの例 \{#command-examples\}

#### DDL 文 \{#ddl-statements\}

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


#### 単一の値を返す簡単なクエリ \{#simple-queries-returning-single-values\}

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


#### パラメータ付きのコマンド \{#commands-with-parameters\}

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


#### SETTINGS 付きのコマンド \{#commands-with-settings\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```


## Client `query` Method \{#client-query-method\}

`Client.query` メソッドは、ClickHouse サーバーから単一の「バッチ」データセットを取得するための主な方法です。HTTP 経由で Native ClickHouse フォーマットを利用して、大規模なデータセット（およそ 100 万行まで）を効率的に送信します。このメソッドは次のパラメータを受け取ります。

| Parameter           | Type             | Default    | Description                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required* | ClickHouse の SQL SELECT または DESCRIBE クエリ。                                                                                                                                  |
| parameters          | dict or iterable | *None*     | [parameters の説明](#parameters-argument)を参照してください。                                                                                                                       |
| settings            | dict             | *None*     | [settings の説明](#settings-argument)を参照してください。                                                                                                                           |
| query_formats       | dict             | *None*     | 結果値に対するデータ型フォーマット指定。詳細は Advanced Usage (Read Formats) を参照してください。                                                                                   |
| column_formats      | dict             | *None*     | カラムごとのデータ型フォーマット指定。詳細は Advanced Usage (Read Formats) を参照してください。                                                                                     |
| encoding            | str              | *None*     | ClickHouse の String カラムを Python の文字列にエンコードする際に使用する文字エンコーディング。設定されていない場合、Python のデフォルトである `UTF-8` が使用されます。               |
| use_none            | bool             | True       | ClickHouse の null に対して Python の *None* 型を使用します。False の場合、ClickHouse の null には 0 などのデータ型のデフォルト値を使用します。注: パフォーマンス上の理由から、NumPy/Pandas ではデフォルトで False になります。 |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなくカラムのシーケンスとして返します。Python データを他のカラム指向データフォーマットへ変換する際に役立ちます。                                             |
| query_tz            | str              | *None*     | `zoneinfo` データベースにあるタイムゾーン名。このタイムゾーンが、クエリによって返されるすべての datetime または Pandas Timestamp オブジェクトに適用されます。                        |
| column_tzs          | dict             | *None*     | カラム名からタイムゾーン名への Dictionary。`query_tz` と同様ですが、カラムごとに異なるタイムゾーンを指定できます。                                                                 |
| use_extended_dtypes | bool             | True       | Pandas の拡張 dtype（StringArray など）や、ClickHouse の NULL 値に対する pandas.NA および pandas.NaT を使用します。`query_df` および `query_df_stream` メソッドにのみ適用されます。    |
| external_data       | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。[Advanced Queries (External Data)](advanced-querying.md#external-data) を参照してください。           |
| context             | QueryContext     | *None*     | 再利用可能な QueryContext オブジェクト。上記のメソッド引数をカプセル化するために使用できます。[Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts) を参照してください。 |

### クエリの例 \{#query-examples\}

#### 基本的なクエリ \{#basic-query\}

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


#### クエリ結果の取得 \{#accessing-query-results\}

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


#### クライアント側パラメータ付きのクエリ \{#query-with-client-side-parameters\}

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


#### サーバーサイドパラメータ付きクエリ \{#query-with-server-side-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```


#### 設定を指定したクエリ \{#query-with-settings\}

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


### The `QueryResult` object \{#the-queryresult-object\}

基本となる `query` メソッドは、次のパブリックプロパティを持つ `QueryResult` オブジェクトを返します:

- `result_rows` -- 行のシーケンスという形式で返されるデータの行列（2 次元配列）であり、各行要素はカラム値のシーケンスです。
- `result_columns` -- カラムのシーケンスという形式で返されるデータの行列（2 次元配列）であり、各カラム要素はそのカラムに対応する行の値のシーケンスです。
- `column_names` -- `result_set` 内のカラム名を表す文字列のタプル
- `column_types` -- `result_columns` 内の各カラムに対応する ClickHouse のデータ型を表す ClickHouseType インスタンスのタプル
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブル内のクエリを調査する際に有用）
- `summary` -- `X-ClickHouse-Summary` HTTP レスポンスヘッダーによって返される任意のデータ
- `first_item` -- レスポンスの最初の行を辞書として取得するための補助プロパティ（キーはカラム名）
- `first_row` -- 結果の最初の行を返すための補助プロパティ
- `column_block_stream` -- カラム指向形式でクエリ結果を生成するジェネレータ。このプロパティは直接参照すべきではありません（下記参照）。
- `row_block_stream` -- 行指向形式でクエリ結果を生成するジェネレータ。このプロパティは直接参照すべきではありません（下記参照）。
- `rows_stream` -- 呼び出しごとに 1 行ずつクエリ結果を返すジェネレータ。このプロパティは直接参照すべきではありません（下記参照）。
- `summary` -- `command` メソッドの説明にあるように、ClickHouse から返されるサマリ情報の辞書

`*_stream` プロパティは、返されたデータに対してイテレータとして使用できる Python コンテキストを返します。これらは Client の `*_stream` メソッドを通じて間接的にのみアクセスしてください。

ストリーミングクエリ結果（StreamContext オブジェクトの使用）の詳細は、[Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries) を参照してください。

## NumPy、Pandas、Arrow でクエリ結果を取得する \{#consuming-query-results-with-numpy-pandas-or-arrow\}

ClickHouse Connect は、NumPy、Pandas、Arrow データ形式向けの専用クエリメソッドを提供します。これらのメソッドの使用方法の詳細（例、ストリーミング機能、高度な型の取り扱いを含む）については、[高度なクエリ（NumPy、Pandas、Arrow クエリ）](advanced-querying.md#numpy-pandas-and-arrow-queries) を参照してください。

## クライアント ストリーミングクエリメソッド \{#client-streaming-query-methods\}

大きな結果セットをストリーミングする場合、ClickHouse Connect では複数のストリーミングメソッドを利用できます。詳細や例については、[高度なクエリ（ストリーミングクエリ）](advanced-querying.md#streaming-queries) を参照してください。

## Client `insert` メソッド \{#client-insert-method\}

ClickHouse に複数のレコードを挿入する一般的なユースケース向けに、`Client.insert` メソッドがあります。このメソッドは次のパラメータを受け取ります。

| Parameter          | Type                              | Default    | Description                                                                                                                                                                                   |
|--------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                               | *Required* | 挿入先の ClickHouse テーブル。データベースを含むフルテーブル名も指定可能です。                                                                                                               |
| data               | Sequence of Sequences             | *Required* | 挿入するデータの行列。行ごとのシーケンス（各要素がカラム値のシーケンス）か、カラムごとのシーケンス（各要素が行値のシーケンス）のいずれかを指定します。                                         |
| column_names       | Sequence of str, or str           | '*'        | データ行列に対応する column_names のリスト。代わりに '*' を使用した場合、ClickHouse Connect がテーブルのすべてのカラム名を取得するための「事前クエリ」を実行します。                           |
| database           | str                               | ''         | 挿入先のデータベース。指定されていない場合は、その Client に設定されているデータベースが使用されます。                                                                                         |
| column_types       | Sequence of ClickHouseType        | *None*     | ClickHouseType インスタンスのリスト。column_types も column_type_names も指定されていない場合、ClickHouse Connect がテーブルのすべてのカラム型を取得するための「事前クエリ」を実行します。       |
| column_type_names  | Sequence of ClickHouse type names | *None*     | ClickHouse のデータ型名のリスト。column_types も column_type_names も指定されていない場合、ClickHouse Connect がテーブルのすべてのカラム型を取得するための「事前クエリ」を実行します。           |
| column_oriented    | bool                              | False      | True の場合、`data` 引数はカラムごとのシーケンス（データ挿入のための「ピボット」は不要）と見なされます。そうでない場合、`data` は行ごとのシーケンスとして解釈されます。                         |
| settings           | dict                              | *None*     | [settings description](#settings-argument) を参照してください。                                                                                                                                 |
| context            | InsertContext                     | *None*     | 上記メソッド引数をカプセル化する再利用可能な InsertContext オブジェクトを指定できます。詳しくは [Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts) を参照してください。  |
| transport_settings | dict                              | *None*     | トランスポートレベルの設定（HTTP ヘッダーなど）のオプションの辞書です。                                                                                                                        |

このメソッドは、"command" メソッドの説明にある「クエリサマリー」辞書を返します。挿入が何らかの理由で失敗した場合は例外がスローされます。

Pandas DataFrame、PyArrow Table、および Arrow バックエンドの DataFrame を扱う専用の挿入メソッドについては、[Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods) を参照してください。

:::note
NumPy 配列は有効な Sequence of Sequences であり、メインの `insert` メソッドの `data` 引数として使用できるため、専用メソッドは必須ではありません。
:::

### 例 \{#examples\}

以下の例では、スキーマ `(id UInt32, name String, age UInt8)` を持つ既存のテーブル `users` が存在することを前提とします。

#### 基本的な行指向の挿入 \{#basic-row-oriented-insert\}

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


#### カラム指向での挿入 \{#column-oriented-insert\}

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


#### カラム型を明示的に指定して挿入 \{#insert-with-explicit-column-types\}

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


#### 特定のデータベースへのINSERT \{#insert-into-specific-database\}

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


## ファイルからの挿入 \{#file-inserts\}

ファイルから ClickHouse のテーブルへ直接データを挿入する方法については、[高度な挿入（ファイルからの挿入）](advanced-inserting.md#file-inserts) を参照してください。

## Raw API \{#raw-api\}

型変換なしで ClickHouse の HTTP インターフェースに直接アクセスする必要がある高度なユースケースについては、[高度な利用 (Raw API)](advanced-usage.md#raw-api) を参照してください。

## Utility classes and functions \{#utility-classes-and-functions\}

以下のクラスおよび関数も「パブリック」`clickhouse-connect` API の一部と見なされ、上記で説明したクラスやメソッドと同様に、マイナーリリース間で互換性が維持されます。これらのクラスおよび関数に破壊的な変更が行われるのはマイナー（パッチではない）リリース時のみであり、その場合も少なくとも 1 回のマイナーリリースにわたって非推奨ステータスで提供されます。

### 例外 \{#exceptions\}

すべてのカスタム例外（DB API 2.0 仕様で定義されているものを含む）は、`clickhouse_connect.driver.exceptions` モジュールで定義されています。ドライバーによって実際に検出された例外は、これらのいずれかの型になります。

### ClickHouse SQL ユーティリティ \{#clickhouse-sql-utilities\}

`clickhouse_connect.driver.binding` モジュール内の各種関数および DT64Param クラスを使用すると、ClickHouse SQL クエリを適切に構築し、エスケープできます。同様に、`clickhouse_connect.driver.parser` モジュール内の関数を使用して、ClickHouse のデータ型名を解析できます。

## マルチスレッド、マルチプロセス、および非同期／イベント駆動のユースケース \{#multithreaded-multiprocess-and-asyncevent-driven-use-cases\}

ClickHouse Connect をマルチスレッド、マルチプロセス、および非同期／イベント駆動型アプリケーションで使用する方法については、[高度な利用方法（マルチスレッド、マルチプロセス、および非同期／イベント駆動のユースケース）](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases) を参照してください。

## AsyncClient ラッパー \{#asyncclient-wrapper\}

asyncio 環境で AsyncClient ラッパーを利用する方法については、[高度な使い方 (AsyncClient ラッパー)](advanced-usage.md#asyncclient-wrapper) を参照してください。

## ClickHouse セッション ID の管理 \{#managing-clickhouse-session-ids\}

マルチスレッドまたは並行実行のアプリケーションにおける ClickHouse セッション ID の管理については、[高度な使用方法（ClickHouse セッション ID の管理）](advanced-usage.md#managing-clickhouse-session-ids) を参照してください。

## HTTP 接続プールのカスタマイズ \{#customizing-the-http-connection-pool\}

大規模なマルチスレッドアプリケーション向けの HTTP 接続プールのカスタマイズ方法については、[高度な利用方法 (HTTP 接続プールのカスタマイズ)](advanced-usage.md#customizing-the-http-connection-pool) を参照してください。