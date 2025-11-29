---
sidebar_label: 'ドライバー API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect ドライバー API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect ドライバー API'
doc_type: 'reference'
---

# ClickHouse Connect ドライバー API {#clickhouse-connect-driver-api}

:::note
指定可能な引数が多く、そのほとんどが任意指定であるため、ほとんどの API メソッドではキーワード引数で渡すことを推奨します。

*ここで説明されていないメソッドは API の一部とは見なされず、削除または変更される可能性があります。*
:::

## クライアントの初期化 {#client-initialization}

`clickhouse_connect.driver.client` クラスは、Python アプリケーションと ClickHouse データベース サーバーとの間の主なインターフェースを提供します。`clickhouse_connect.get_client` 関数を使用して Client インスタンスを取得します。この関数は、次の引数を取ります。

### 接続引数 {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | `http` または `https` でなければなりません。                                                                                                                                                                                                          |
| host                     | str         | localhost                     | ClickHouse サーバーのホスト名または IP アドレス。設定しない場合、`localhost` が使用されます。                                                                                                                                                        |
| port                     | int         | 8123 or 8443                  | ClickHouse の HTTP または HTTPS ポート。設定しない場合は 8123 がデフォルトで使用されますが、*secure*=*True* または *interface*=*https* の場合は 8443 が使用されます。                                                                                |
| username                 | str         | default                       | ClickHouse のユーザー名。設定しない場合、`default` の ClickHouse ユーザーが使用されます。                                                                                                                                                             |
| password                 | str         | *&lt;empty string&gt;*        | *username* のパスワード。                                                                                                                                                                                                                             |
| database                 | str         | *None*                        | 接続のデフォルトデータベース。設定しない場合、ClickHouse Connect は *username* のデフォルトデータベースを使用します。                                                                                                                                |
| secure                   | bool        | False                         | HTTPS/TLS を使用します。これは interface または port 引数から推測される値を上書きします。                                                                                                                                                            |
| dsn                      | str         | *None*                        | 標準的な DSN (Data Source Name) 形式の文字列。設定されていない他の接続値 (host や user など) は、この文字列から抽出されます。                                                                                                                         |
| compress                 | bool or str | True                          | ClickHouse HTTP の insert およびクエリ結果に対して圧縮を有効にします。[Additional Options (Compression)](additional-options.md#compression) を参照してください。                                                                                     |
| query_limit              | int         | 0 (unlimited)                 | 任意の `query` 応答で返される最大行数。無制限に行を返すには 0 を設定します。クエリ結果がストリーミングされない場合、すべての結果が一度にメモリへ読み込まれるため、大きな値を設定するとメモリ不足例外を引き起こす可能性がある点に注意してください。      |
| query_retries            | int         | 2                             | `query` リクエストを再試行する最大回数。「再試行可能」な HTTP レスポンスのみ再試行されます。意図しない重複リクエストを防ぐため、`command` または `insert` リクエストはドライバーによって自動再試行されません。                                        |
| connect_timeout          | int         | 10                            | HTTP 接続のタイムアウト (秒)。                                                                                                                                                                                                                        |
| send_receive_timeout     | int         | 300                           | HTTP 接続の送受信タイムアウト (秒)。                                                                                                                                                                                                                  |
| client_name              | str         | *None*                        | HTTP User Agent ヘッダーに付加される client_name。ClickHouse の system.query_log でクエリ元クライアントを追跡するために設定します。                                                                                                                  |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 使用する `urllib3` ライブラリの PoolManager。複数のホストに対する複数の接続プールを必要とする高度なユースケース向けです。                                                                                                                           |
| http_proxy               | str         | *None*                        | HTTP プロキシアドレス (環境変数 HTTP_PROXY を設定するのと同等)。                                                                                                                                                                                      |
| https_proxy              | str         | *None*                        | HTTPS プロキシアドレス (環境変数 HTTPS_PROXY を設定するのと同等)。                                                                                                                                                                                   |
| apply_server_timezone    | bool        | True                          | タイムゾーン情報を持つクエリ結果に対してサーバーのタイムゾーンを使用します。[Timezone Precedence](advanced-querying.md#time-zones) を参照してください。                                                                                             |
| show_clickhouse_errors   | bool        | True                          | クライアント例外に、詳細な ClickHouse サーバーのエラーメッセージと例外コードを含めます。                                                                                                                                                             |
| autogenerate_session_id  | bool        | *None*                        | グローバルな `autogenerate_session_id` 設定を上書きします。True の場合、セッション ID が指定されていないときに UUID4 のセッション ID を自動生成します。                                                                                               |
| proxy_path               | str         | &lt;empty string&gt;          | プロキシ構成のために ClickHouse サーバー URL に追加する任意のパスプレフィックス。                                                                                                                                                                    |
| form_encode_query_params | bool        | False                         | クエリパラメータを URL パラメータではなく、リクエストボディ内のフォームエンコードされたデータとして送信します。URL 長の制限を超える可能性がある、大きなパラメータセットを持つクエリに有用です。                                                    |
| rename_response_column   | str         | *None*                        | クエリ結果のレスポンス列名を変更するための任意のコールバック関数または列名マッピング。                                                                                                                                                               |

### HTTPS/TLS 引数 {#httpstls-arguments}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLS を使用する場合、ClickHouse サーバーの TLS/SSL 証明書（ホスト名、有効期限など）を検証します。                                                                                                                                                                             |
| ca_cert          | str  | *None*  | *verify*=*True* の場合に、ClickHouse サーバー証明書を検証するための認証局 (Certificate Authority) ルート証明書ファイルへのパス（.pem 形式）。*verify* が *False* の場合は無視されます。ClickHouse サーバー証明書が OS によって検証される、グローバルに信頼されたルート証明書である場合は不要です。 |
| client_cert      | str  | *None*  | TLS クライアント証明書ファイルへのパス（.pem 形式、相互 TLS 認証用）。ファイルには、中間証明書を含む完全な証明書チェーンを含める必要があります。                                                                                                                                 |
| client_cert_key  | str  | *None*  | クライアント証明書用の秘密鍵ファイルへのパス。秘密鍵がクライアント証明書ファイル内に含まれていない場合に必須です。                                                                                                                                                               |
| server_host_name | str  | *None*  | TLS 証明書の CN または SNI によって識別される ClickHouse サーバーのホスト名。別のホスト名を持つプロキシやトンネル経由で接続する際の SSL エラーを回避するために設定します。                                                                                                        |
| tls_mode         | str  | *None*  | 詳細な TLS 動作を制御します。`proxy` と `strict` は ClickHouse の相互 TLS 接続自体は確立しませんが、クライアント証明書と秘密鍵は送信します。`mutual` はクライアント証明書を用いた ClickHouse の相互 TLS 認証を前提とします。*None*/デフォルトの動作は `mutual` です。          |

### settings 引数 {#settings-argument}

最後に、`get_client` の `settings` 引数は、各クライアントリクエストごとにサーバーへ追加の ClickHouse 設定を渡すために使用されます。ほとんどの場合、*readonly*=*1* のアクセス権を持つユーザーはクエリとともに送信される設定を変更できないため、ClickHouse Connect はそのような設定を最終リクエストから削除し、警告をログに記録することに注意してください。以下の設定は、ClickHouse Connect が使用する HTTP クエリ／セッションにのみ適用され、一般的な ClickHouse 設定としてはドキュメント化されていません。

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse サーバーが HTTP チャンネルに書き込む前に使用するバッファサイズ（バイト単位）。                                                                       |
| session_id        | サーバー上で関連するクエリを関連付けるための一意のセッション ID。テンポラリテーブルに必須。                                                                     |
| compress          | ClickHouse サーバーが POST レスポンスデータを圧縮すべきかどうか。この設定は「raw」クエリに対してのみ使用してください。                                          |
| decompress        | ClickHouse サーバーに送信されるデータを伸長する必要があるかどうか。この設定は「raw」インサートに対してのみ使用してください。                                    |
| quota_key         | このリクエストに関連付けられたクオータキー。クオータについては ClickHouse サーバーのドキュメントを参照してください。                                             |
| session_check     | セッションの状態を確認するために使用されます。                                                                                                                   |
| session_timeout   | session_id で識別されるセッションがタイムアウトし、もはや有効と見なされなくなるまでの非アクティブ状態の秒数。デフォルトは 60 秒です。                          |
| wait_end_of_query | 応答全体を ClickHouse サーバー側でバッファリングします。この設定はサマリー情報を返すために必要であり、ストリーミングでないクエリでは自動的に設定されます。     |
| role              | セッションで使用する ClickHouse ロール。クエリコンテキストに含めることができる有効なトランスポート設定です。                                                   |

各クエリとともに送信可能なその他の ClickHouse 設定については、[ClickHouse のドキュメント](/operations/settings/settings.md) を参照してください。

### クライアント作成の例 {#client-creation-examples}

* パラメータを指定しない場合、ClickHouse Connect クライアントは `localhost` のデフォルト HTTP ポートに、デフォルトユーザーでパスワードなしの状態で接続します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# 出力: '22.10.1.98' {#output-2210198}
```

* HTTPS で保護された外部 ClickHouse サーバーへの接続

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# 出力: 'Etc/UTC' {#output-etcutc}
```

* セッション ID やその他のカスタム接続パラメータ、ClickHouse の設定を指定して接続する。

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
# 出力: 'github' {#output-github}
```


## クライアントのライフサイクルとベストプラクティス {#client-lifecycle-and-best-practices}

ClickHouse Connect クライアントの作成は、接続の確立、サーバーのメタデータの取得、設定の初期化などを伴う負荷の高い処理です。最適なパフォーマンスを得るために、次のベストプラクティスに従ってください。

### コア原則 {#core-principles}

- **クライアントを再利用する**: アプリケーション起動時にクライアントを一度だけ作成し、その後のアプリケーションのライフタイム全体で再利用する
- **頻繁な作成を避ける**: クエリやリクエストごとに新しいクライアントを作成しない（各操作ごとに数百ミリ秒を無駄にする）
- **適切にクリーンアップする**: シャットダウン時には必ずクライアントをクローズし、コネクションプールのリソースを解放する
- **可能な限り共有する**: 1 つのクライアントで、そのコネクションプールを通じて多数の同時クエリを処理できる（スレッド処理に関する注意点は以下を参照）

### 基本パターン {#basic-patterns}

**✅ 良い例: 単一のクライアントを再利用する**

```python
import clickhouse_connect

# 起動時に一度作成 {#create-once-at-startup}
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')

# すべてのクエリで再利用 {#reuse-for-all-queries}
for i in range(1000):
    result = client.query('SELECT count() FROM users')

# シャットダウン時にクローズ {#close-on-shutdown}
client.close()
```

**❌ 悪い例: クライアントを毎回新規作成する**

```python
# 悪い例: 1000個のクライアントを作成し、高コストな初期化オーバーヘッドが発生 {#bad-creates-1000-clients-with-expensive-initialization-overhead}
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```


### マルチスレッドアプリケーション {#multi-threaded-applications}

:::warning
クライアントインスタンスは、セッション ID を使用している場合は**スレッドセーフではありません**。デフォルトでは、クライアントには自動生成されたセッション ID が付与されており、同じセッション内でクエリを同時に実行すると `ProgrammingError` が発生します。
:::

スレッド間でクライアントを安全に共有するには、次のようにします。

```python
import clickhouse_connect
import threading

# オプション1: セッションを無効化（共有クライアント使用時に推奨） {#option-1-disable-sessions-recommended-for-shared-clients}
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # スレッドセーフのために必須
)

def worker(thread_id):
    # すべてのスレッドが同じクライアントを安全に使用できる
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
# 出力: {#output}
# Thread 0: 0 {#thread-0-0}
# Thread 7: 7 {#thread-7-7}
# Thread 1: 1 {#thread-1-1}
# Thread 9: 9 {#thread-9-9}
# Thread 4: 4 {#thread-4-4}
# Thread 2: 2 {#thread-2-2}
# Thread 8: 8 {#thread-8-8}
# Thread 5: 5 {#thread-5-5}
# Thread 6: 6 {#thread-6-6}
# Thread 3: 3 {#thread-3-3}
```

**セッションの代替手段:** セッションが必要な場合（例: 一時テーブル用）、スレッドごとに個別のクライアントを作成してください。

```python
def worker(thread_id):
    # 各スレッドは分離されたセッションを持つ独自のクライアントを取得します
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... 一時テーブルを使用 ...
    client.close()
```


### 適切なクリーンアップ {#proper-cleanup}

シャットダウン時には必ずクライアントを閉じてください。`client.close()` は、クライアントが自身のプールマネージャーを所有している場合（たとえばカスタム TLS/プロキシオプションを指定して作成した場合）にのみ、クライアントを解放し、プールされた HTTP 接続を閉じます。デフォルトの共有プールを使用している場合は、`client.close_connections()` を使用してソケットを明示的に閉じてください。そうしない場合でも、接続はアイドル時間の経過およびプロセス終了時に自動的にクリーンアップされます。

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


### 複数のクライアントを使用すべき場合 {#when-to-use-multiple-clients}

複数のクライアントが適切となるケース:

- **異なるサーバー**: 各 ClickHouse サーバーまたはクラスターごとにクライアントを 1 つ用意する場合
- **異なる認証情報**: 利用ユーザーやアクセスレベルごとにクライアントを分けたい場合
- **異なるデータベース**: 複数のデータベースを扱う必要がある場合
- **分離されたセッション**: 一時テーブルやセッション固有の設定のためにセッションを分ける必要がある場合
- **スレッド単位の分離**: 上記のように、各スレッドごとに独立したセッションが必要な場合

## 共通メソッド引数 {#common-method-arguments}

一部のクライアントメソッドでは、共通の `parameters` 引数と `settings` 引数の一方または両方を使用します。これらのキーワード引数について、以下で説明します。

### Parameters 引数 {#parameters-argument}

ClickHouse Connect クライアントの `query*` および `command` メソッドは、Python の式を ClickHouse の値の式にバインドするために使用される、オプションの `parameters` キーワード引数を受け取ります。2 種類のバインド方式が利用できます。

#### サーバーサイドバインディング {#server-side-binding}

ClickHouse は、ほとんどのクエリ値に対して [サーバーサイドバインディング](/interfaces/cli.md#cli-queries-with-parameters) をサポートしており、バインドされた値はクエリとは別に HTTP クエリパラメータとして送信されます。ClickHouse Connect は、`{<name>:<datatype>}` 形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバーサイドバインディングでは、`parameters` 引数には Python の辞書型を指定します。

* Python の辞書型、DateTime 型の値、および文字列値を使用したサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

これにより、サーバー側で次のクエリが生成されます。

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
サーバー側バインディングは、ClickHouse サーバーでは `SELECT` クエリでのみサポートされています。`ALTER`、`DELETE`、`INSERT`、およびその他の種類のクエリでは動作しません。将来的に変更される可能性があります。詳細については [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092) を参照してください。
:::


#### クライアントサイドバインディング {#client-side-binding}

ClickHouse Connect はクライアントサイドでのパラメータバインディングにも対応しており、テンプレート化された SQL クエリを生成する際に、より柔軟にクエリを生成できます。クライアントサイドバインディングでは、`parameters` 引数は辞書またはシーケンスである必要があります。クライアントサイドバインディングでは、パラメータ置換に Python の [&quot;printf&quot; 形式](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)の文字列フォーマットを使用します。

サーバーサイドバインディングとは異なり、クライアントサイドバインディングは、データベース、テーブル、カラム名などのデータベース識別子には使用できない点に注意してください。これは、Python 形式の文字列フォーマットでは異なる種類の文字列を区別できず、それぞれを異なる方法でフォーマットする必要があるためです（データベース識別子にはバッククォートまたは二重引用符、データ値には単一引用符を使用）。

* Python の辞書（Dictionary）、DateTime 値、および文字列エスケープの例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

これにより、サーバー上で以下のクエリが生成されます。

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

サーバー側で生成されるクエリは次のとおりです。

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64 引数（サブ秒精度を持つ ClickHouse の型）をバインドするには、次のいずれか 2 つのカスタム手法の利用が必要です：

* 新しい DT64Param クラスで Python の `datetime.datetime` 値をラップします。例：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書を使ったサーバーサイドのバインド
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストを使ったクライアントサイドのバインド
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * パラメータ値の辞書を使用する場合は、パラメータ名に文字列 `_64` を付加します
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書を使ったサーバーサイドのバインド

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```

:::


### Settings 引数 {#settings-argument-1}

すべての主要な ClickHouse Connect Client の「insert」および「select」メソッドは、指定した SQL ステートメントに対して ClickHouse サーバーの [ユーザー設定](/operations/settings/settings.md) を渡すための、省略可能な `settings` キーワード引数を受け取ります。`settings` 引数は辞書型である必要があります。各要素は ClickHouse の設定名と、その設定に対応する値です。値は、サーバーにクエリパラメータとして送信される際に文字列へ変換される点に注意してください。

クライアントレベルの設定と同様に、ClickHouse Connect はサーバー側で *readonly*=*1* とマークされた設定を、関連するログメッセージとともにすべて破棄します。ClickHouse の HTTP インターフェース経由のクエリにのみ適用される設定は常に有効です。これらの設定については、`get_client` [API](#settings-argument) の項で説明しています。

ClickHouse の設定を使用する例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```


## Client `command` メソッド {#client-command-method}

`Client.command` メソッドを使用して、通常はデータを返さない SQL クエリ、または完全なデータセットではなく単一のプリミティブ値もしくは配列値を返す SQL クエリを ClickHouse サーバーに送信します。このメソッドは次のパラメータを受け取ります:

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | 単一の値、または値の 1 行のみを返す ClickHouse SQL ステートメント。                                                                                           |
| parameters    | dict or iterable | *None*     | [parameters の説明](#parameters-argument) を参照してください。                                                                                                  |
| data          | str or bytes     | *None*     | コマンドに対して POST ボディとして含める任意のデータ。                                                                                                         |
| settings      | dict             | *None*     | [settings の説明](#settings-argument) を参照してください。                                                                                                      |
| use_database  | bool             | True       | クライアントのデータベース（クライアント作成時に指定）を使用します。False の場合、接続ユーザーに対して ClickHouse サーバーのデフォルトデータベースを使用します。 |
| external_data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを格納した `ExternalData` オブジェクト。[高度なクエリ (外部データ)](advanced-querying.md#external-data) を参照してください。 |

### コマンド例 {#command-examples}

#### DDL ステートメント {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# テーブルを作成する {#create-a-table}
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # query_id を含む QuerySummary を返す

# テーブル定義を表示する {#show-table-definition}
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# 出力: {#output}
# CREATE TABLE default.test_command {#create-table-defaulttest_command}
# (
#     `col_1` String, {#col_1-string}
#     `col_2` DateTime {#col_2-datetime}
# )
# ENGINE = MergeTree {#engine-mergetree}
# ORDER BY tuple() {#order-by-tuple}
# SETTINGS index_granularity = 8192 {#settings-index_granularity-8192}

# テーブルを削除する {#drop-table}
client.command("DROP TABLE test_command")
```


#### 単一値を返すシンプルなクエリ {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 単一値の結果 {#single-value-result}
count = client.command("SELECT count() FROM system.tables")
print(count)
# 出力: 151 {#output-151}

# サーバーバージョン {#server-version}
version = client.command("SELECT version()")
print(version)
# 出力: "25.8.2.29" {#output-258229}
```


#### パラメーター付きコマンド {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# クライアント側パラメータを使用 {#using-client-side-parameters}
table_name = "system"
result = client.command(
    "SELECT count() FROM system.tables WHERE database = %(db)s",
    parameters={"db": table_name}
)

# サーバー側パラメータを使用 {#using-server-side-parameters}
result = client.command(
    "SELECT count() FROM system.tables WHERE database = {db:String}",
    parameters={"db": "system"}
)
```


#### 設定付きのコマンド {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 特定の設定でコマンドを実行する {#execute-command-with-specific-settings}
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```


## Client `query` Method {#client-query-method}

`Client.query` メソッドは、ClickHouse サーバーから単一の「バッチ」データセットを取得するための主な手段です。HTTP 経由で Native ClickHouse フォーマットを利用して、大規模なデータセット（最大およそ 100 万行）を効率的に転送します。このメソッドは次のパラメータを受け取ります。

| Parameter           | Type             | Default    | Description                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required* | ClickHouse の SQL `SELECT` または `DESCRIBE` クエリ。                                                                                                                              |
| parameters          | dict or iterable | *None*     | [parameters の説明](#parameters-argument)を参照してください。                                                                                                                     |
| settings            | dict             | *None*     | [settings の説明](#settings-argument)を参照してください。                                                                                                                         |
| query_formats       | dict             | *None*     | 結果値に対するデータ型フォーマット指定。詳細は「高度な利用方法（Read Formats）」を参照してください。                                                                              |
| column_formats      | dict             | *None*     | カラム単位のデータ型フォーマット指定。詳細は「高度な利用方法（Read Formats）」を参照してください。                                                                               |
| encoding            | str              | *None*     | ClickHouse の String カラムを Python 文字列にエンコードする際に使用するエンコーディング。未指定の場合、Python のデフォルトである `UTF-8` が使用されます。                         |
| use_none            | bool             | True       | ClickHouse の NULL 値に対して Python の *None* 型を使用します。False の場合は、ClickHouse の NULL 値に対して（0 などの）データ型のデフォルト値を使用します。注: NumPy/Pandas ではパフォーマンス上の理由からデフォルトは False です。 |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなく、列のシーケンスとして返します。Python データを他の列指向データフォーマットへ変換する場合に有用です。                                                 |
| query_tz            | str              | *None*     | `zoneinfo` データベースに基づくタイムゾーン名。このタイムゾーンが、クエリによって返されるすべての datetime または Pandas Timestamp オブジェクトに適用されます。                  |
| column_tzs          | dict             | *None*     | カラム名からタイムゾーン名への辞書。`query_tz` と同様ですが、カラムごとに異なるタイムゾーンを指定できます。                                                                       |
| use_extended_dtypes | bool             | True       | Pandas の拡張 dtypes（StringArray など）および ClickHouse の NULL 値に対する `pandas.NA` と `pandas.NaT` を使用します。`query_df` および `query_df_stream` メソッドにのみ適用されます。 |
| external_data       | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。詳しくは [高度なクエリ（External Data）](advanced-querying.md#external-data) を参照してください。      |
| context             | QueryContext     | *None*     | 上記のメソッド引数をカプセル化するために再利用可能な QueryContext オブジェクト。詳しくは [高度なクエリ（QueryContexts）](advanced-querying.md#querycontexts) を参照してください。    |

### クエリ例 {#query-examples}

#### 基本クエリ {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# シンプルなSELECTクエリ {#simple-select-query}
result = client.query("SELECT name, database FROM system.tables LIMIT 3")

# 結果を行として取得 {#access-results-as-rows}
for row in result.result_rows:
    print(row)
# 出力: {#output}
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA') {#character_sets-information_schema}
# ('COLLATIONS', 'INFORMATION_SCHEMA') {#collations-information_schema}
# ('COLUMNS', 'INFORMATION_SCHEMA') {#columns-information_schema}

# カラム名と型を取得 {#access-column-names-and-types}
print(result.column_names)
# 出力: ("name", "database") {#output-name-database}
print([col_type.name for col_type in result.column_types])
# 出力: ['String', 'String'] {#output-string-string}
```


#### クエリ結果へのアクセス {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

# 行指向アクセス(デフォルト) {#row-oriented-access-default}
print(result.result_rows)
# 出力: [[0, "0"], [1, "1"], [2, "2"]] {#output-0-0-1-1-2-2}

# 列指向アクセス {#column-oriented-access}
print(result.result_columns)
# 出力: [[0, 1, 2], ["0", "1", "2"]] {#output-0-1-2-0-1-2}

# 名前付き結果(辞書のリスト) {#named-results-list-of-dictionaries}
for row_dict in result.named_results():
    print(row_dict)
# 出力:  {#output}
# {"number": 0, "str": "0"} {#number-0-str-0}
# {"number": 1, "str": "1"} {#number-1-str-1}
# {"number": 2, "str": "2"} {#number-2-str-2}

# 辞書形式で最初の行を取得 {#first-row-as-dictionary}
print(result.first_item)
# 出力: {"number": 0, "str": "0"} {#output-number-0-str-0}

# タプル形式で最初の行を取得 {#first-row-as-tuple}
print(result.first_row)
# 出力: (0, "0") {#output-0-0}
```


#### クライアントサイドパラメータを使用したクエリ {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 辞書パラメータの使用（printf形式） {#using-dictionary-parameters-printf-style}
query = "SELECT * FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)

# タプルパラメータの使用 {#using-tuple-parameters}
query = "SELECT * FROM system.tables WHERE database = %s LIMIT %s"
parameters = ("system", 5)
result = client.query(query, parameters=parameters)
```


#### サーバー側パラメータを使ったクエリ {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# サーバーサイドバインディング(より安全で、SELECTクエリのパフォーマンスが向上) {#server-side-binding-more-secure-better-performance-for-select-queries}
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```


#### 設定付きクエリの実行 {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# クエリと一緒にClickHouse設定を渡す {#pass-clickhouse-settings-with-the-query}
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={
        "max_block_size": 100000,
        "max_execution_time": 30
    }
)
```


### `QueryResult` オブジェクト {#the-queryresult-object}

基本的な `query` メソッドは、次の公開プロパティを持つ `QueryResult` オブジェクトを返します:

- `result_rows` -- 返されるデータを行方向のシーケンスとして表した行列であり、各行要素は列値のシーケンスです。
- `result_columns` -- 返されるデータを列方向のシーケンスとして表した行列であり、各列要素はその列に対応する行値のシーケンスです。
- `column_names` -- `result_set` 内の列名を表す文字列タプル
- `column_types` -- `result_columns` 内の各列に対応する ClickHouse のデータ型を表す ClickHouseType インスタンスのタプル
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブル内でクエリを確認する際に有用）
- `summary` -- `X-ClickHouse-Summary` HTTP レスポンスヘッダによって返される任意のデータ
- `first_item` -- レスポンスの先頭行を辞書として取得するための補助プロパティ（キーは列名）
- `first_row` -- 結果の先頭行を返すための補助プロパティ
- `column_block_stream` -- 列指向フォーマットでクエリ結果を生成するジェネレータ。このプロパティは直接参照しないでください（後述）。
- `row_block_stream` -- 行指向フォーマットでクエリ結果を生成するジェネレータ。このプロパティは直接参照しないでください（後述）。
- `rows_stream` -- 呼び出しごとに 1 行ずつクエリ結果を生成するジェネレータ。このプロパティは直接参照しないでください（後述）。
- `summary` -- `command` メソッドで説明されているとおり、ClickHouse によって返される要約情報の辞書

`*_stream` プロパティは、返されたデータに対してイテレータとして使用できる Python のコンテキストを返します。これらには、Client の `*_stream` メソッドを通してのみ間接的にアクセスするようにしてください。

ストリーミングクエリ結果（StreamContext オブジェクトを使用）の詳細については、[Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries) を参照してください。

## NumPy、Pandas、または Arrow でクエリ結果を扱う {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect は、NumPy、Pandas、Arrow の各データ形式向けに専用のクエリメソッドを提供します。これらのメソッドの使用方法の詳細（例やストリーミング機能、高度な型処理などを含む）については、[高度なクエリ（NumPy、Pandas および Arrow クエリ）](advanced-querying.md#numpy-pandas-and-arrow-queries) を参照してください。

## クライアント向けストリーミングクエリメソッド {#client-streaming-query-methods}

大規模な結果セットをストリーミングする場合、ClickHouse Connect では複数のストリーミングメソッドを利用できます。詳細と例については、[高度なクエリ（ストリーミングクエリ）](advanced-querying.md#streaming-queries) を参照してください。

## Client `insert` メソッド {#client-insert-method}

ClickHouse に複数レコードを挿入する一般的なユースケース向けに、`Client.insert` メソッドが用意されています。次のパラメータを受け取ります:

| Parameter          | Type                              | Default    | Description                                                                                                                                                                                   |
|--------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                               | *Required* | 挿入先の ClickHouse テーブル。データベース名を含む完全修飾テーブル名も指定できます。                                                                                                           |
| data               | Sequence of Sequences             | *Required* | 挿入するデータの行列。行ごとのシーケンス（各行が列値のシーケンス）または列ごとのシーケンス（各列が行値のシーケンス）のいずれかを指定します。                                                     |
| column_names       | Sequence of str, or str           | '*'        | データ行列に対応する column_names のリスト。代わりに '*' を使用した場合、ClickHouse Connect はテーブルのすべてのカラム名を取得するための「事前クエリ」を実行します。                             |
| database           | str                               | ''         | 挿入先のターゲットデータベース。指定しない場合は、クライアントに設定されたデータベースが使用されます。                                                                                          |
| column_types       | Sequence of ClickHouseType        | *None*     | ClickHouseType インスタンスのリスト。column_types と column_type_names のどちらも指定されていない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するための「事前クエリ」を実行します。 |
| column_type_names  | Sequence of ClickHouse type names | *None*     | ClickHouse のデータ型名のリスト。column_types と column_type_names のどちらも指定されていない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するための「事前クエリ」を実行します。     |
| column_oriented    | bool                              | False      | True の場合、`data` 引数は列ごとのシーケンス（この場合、挿入のための「ピボット」は不要）であるとみなされます。False の場合、`data` は行ごとのシーケンスとして解釈されます。                    |
| settings           | dict                              | *None*     | [settings description](#settings-argument) を参照してください。                                                                                                                                |
| context            | InsertContext                     | *None*     | 再利用可能な InsertContext オブジェクトを使用して、上記のメソッド引数をまとめて扱うことができます。詳しくは [Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts) を参照してください。 |
| transport_settings | dict                              | *None*     | トランスポートレベルの設定（HTTP ヘッダなど）のための任意指定の辞書です。                                                                                                                      |

このメソッドは、「command」メソッドの説明にある「クエリサマリ」用の辞書を返します。挿入が何らかの理由で失敗した場合は、例外が送出されます。

Pandas DataFrame、PyArrow Table、Arrow ベースの DataFrame を扱うための、より特化した挿入メソッドについては、[Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods) を参照してください。

:::note
NumPy 配列は有効な「Sequence of Sequences」であり、メインの `insert` メソッドに対する `data` 引数として使用できるため、専用のメソッドは不要です。
:::

### 例 {#examples}

以下の例では、スキーマ `(id UInt32, name String, age UInt8)` を持つ既存のテーブル `users` が存在すると仮定します。

#### 基本的な行指向挿入 {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# 行指向データ: 各内部リストが1行に対応 {#row-oriented-data-each-inner-list-is-a-row}
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert("users", data, column_names=["id", "name", "age"])
```


#### カラム指向の挿入 {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# カラム指向データ: 各内部リストが1つのカラムに対応 {#column-oriented-data-each-inner-list-is-a-column}
data = [
    [1, 2, 3],  # idカラム
    ["Alice", "Bob", "Joe"],  # nameカラム
    [25, 30, 28],  # ageカラム
]

client.insert("users", data, column_names=["id", "name", "age"], column_oriented=True)
```


#### 明示的な列型指定による INSERT {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# サーバーへのDESCRIBEクエリを回避する場合に有用 {#useful-when-you-want-to-avoid-a-describe-query-to-the-server}
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


#### 特定のデータベースに挿入する {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]

# 特定のデータベースのテーブルにデータを挿入 {#insert-into-a-table-in-a-specific-database}
client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    database="production",
)
```


## ファイルからの挿入 {#file-inserts}

ファイルから ClickHouse のテーブルに直接データを挿入する方法については、[高度な挿入（ファイルからの挿入）](advanced-inserting.md#file-inserts) を参照してください。

## Raw API {#raw-api}

型変換を行わずに ClickHouse の HTTP インターフェースに直接アクセスする必要がある高度なユースケースについては、[高度な利用方法（Raw API）](advanced-usage.md#raw-api) を参照してください。

## ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスおよび関数も「公開」`clickhouse-connect` API の一部と見なされ、上記で説明したクラスやメソッドと同様に、マイナーリリース間で互換性が維持されます。これらのクラスおよび関数に互換性を破る変更が行われるのはマイナー（パッチではない）リリース時のみであり、少なくとも 1 回のマイナーリリース分の期間は非推奨ステータスとして提供されます。

### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0 仕様で定義されているものを含む）は、`clickhouse_connect.driver.exceptions` モジュールで定義されています。ドライバーによって実際に検出された例外は、これらのいずれかの型になります。

### ClickHouse SQL ユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュール内の関数と DT64Param クラスは、ClickHouse の SQL クエリを適切に構築し、エスケープするために使用できます。同様に、`clickhouse_connect.driver.parser` モジュール内の関数は、ClickHouse のデータ型名を解析するために使用できます。

## マルチスレッド、マルチプロセス、および非同期／イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

マルチスレッド、マルチプロセス、および非同期／イベント駆動アプリケーションにおける ClickHouse Connect の使用方法については、[高度な使用方法（マルチスレッド、マルチプロセス、および非同期／イベント駆動のユースケース）](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases) を参照してください。

## AsyncClient ラッパー {#asyncclient-wrapper}

asyncio 環境で AsyncClient ラッパーを使用する方法については、[高度な利用方法 (AsyncClient ラッパー)](advanced-usage.md#asyncclient-wrapper) を参照してください。

## ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

マルチスレッドまたは並行処理アプリケーションにおける ClickHouse セッション ID の管理については、[高度な使用方法（ClickHouse セッション ID の管理）](advanced-usage.md#managing-clickhouse-session-ids)を参照してください。

## HTTP 接続プールのカスタマイズ {#customizing-the-http-connection-pool}

大規模なマルチスレッドアプリケーション向けに HTTP 接続プールをカスタマイズする方法については、[高度な利用方法 (HTTP 接続プールのカスタマイズ)](advanced-usage.md#customizing-the-http-connection-pool) を参照してください。