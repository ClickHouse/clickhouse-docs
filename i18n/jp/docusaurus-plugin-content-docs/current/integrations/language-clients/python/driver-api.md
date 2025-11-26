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
指定可能な引数の数が多く、その多くが任意であるため、ほとんどの API メソッドではキーワード引数で渡すことを推奨します。

*ここに記載されていないメソッドは API の一部とは見なされず、削除または変更される場合があります。*
:::



## クライアントの初期化 {#client-initialization}

`clickhouse_connect.driver.client` クラスは、Python アプリケーションと ClickHouse データベースサーバー間の主なインターフェイスを提供します。`clickhouse_connect.get_client` 関数を使用して Client インスタンスを取得します。この関数は次の引数を受け取ります。

### 接続引数 {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | http または https でなければなりません。                                                                                                                                                                                                              |
| host                     | str         | localhost                     | ClickHouse サーバーのホスト名または IP アドレス。設定されていない場合は `localhost` が使用されます。                                                                                                                                                   |
| port                     | int         | 8123 or 8443                  | ClickHouse の HTTP または HTTPS ポート。設定されていない場合は 8123 がデフォルトになり、*secure*=*True* または *interface*=*https* の場合は 8443 が使用されます。                                                                                      |
| username                 | str         | default                       | ClickHouse のユーザー名。設定されていない場合は、`default` ClickHouse ユーザーが使用されます。                                                                                                                                                        |
| password                 | str         | *&lt;empty string&gt;*        | *username* のパスワード。                                                                                                                                                                                                                             |
| database                 | str         | *None*                        | 接続のデフォルトデータベース。設定されていない場合、ClickHouse Connect は *username* に対応するデフォルトデータベースを使用します。                                                                                                                   |
| secure                   | bool        | False                         | HTTPS/TLS を使用します。これは interface または port 引数から推論される値を上書きします。                                                                                                                                                             |
| dsn                      | str         | *None*                        | 標準 DSN (Data Source Name) 形式の文字列。その他の接続値 (host や user など) は、別途設定されていない場合、この文字列から抽出されます。                                                                                                                 |
| compress                 | bool or str | True                          | ClickHouse HTTP の insert およびクエリ結果に対して圧縮を有効にします。[Additional Options (Compression)](additional-options.md#compression) を参照してください。                                                                                       |
| query_limit              | int         | 0 (unlimited)                 | 任意の `query` 応答で返される最大行数。無制限に行を返すには 0 を設定します。クエリの上限値を大きく設定すると、結果がストリームされず一度にすべてメモリに読み込まれるため、メモリ不足例外が発生する可能性がある点に注意してください。                         |
| query_retries            | int         | 2                             | `query` リクエストの最大再試行回数。「再試行可能な」HTTP 応答のみが再試行されます。`command` や `insert` リクエストは、意図しない重複リクエストを防ぐため、ドライバーによって自動的には再試行されません。                                               |
| connect_timeout          | int         | 10                            | HTTP 接続タイムアウト (秒)。                                                                                                                                                                                                                          |
| send_receive_timeout     | int         | 300                           | HTTP 接続における送受信タイムアウト (秒)。                                                                                                                                                                                                            |
| client_name              | str         | *None*                        | HTTP User-Agent ヘッダーの先頭に付ける client_name。ClickHouse の system.query_log でクエリを発行したクライアントを追跡する場合に設定します。                                                                                                         |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 使用する `urllib3` ライブラリの PoolManager。複数の接続プールを異なるホストに対して必要とする高度なユースケース向けです。                                                                                                                            |
| http_proxy               | str         | *None*                        | HTTP プロキシアドレス (HTTP_PROXY 環境変数の設定と同等)。                                                                                                                                                                                             |
| https_proxy              | str         | *None*                        | HTTPS プロキシアドレス (HTTPS_PROXY 環境変数の設定と同等)。                                                                                                                                                                                           |
| apply_server_timezone    | bool        | True                          | タイムゾーン対応クエリ結果に対してサーバーのタイムゾーンを使用します。[Timezone Precedence](advanced-querying.md#time-zones) を参照してください。                                                                                                     |
| show_clickhouse_errors   | bool        | True                          | クライアント側の例外に、詳細な ClickHouse サーバーのエラーメッセージおよび例外コードを含めます。                                                                                                                                                      |
| autogenerate_session_id  | bool        | *None*                        | グローバルな `autogenerate_session_id` 設定を上書きします。True の場合、セッション ID が指定されていないときに UUID4 セッション ID を自動生成します。                                                                                                  |
| proxy_path               | str         | &lt;empty string&gt;          | プロキシ構成のために ClickHouse サーバー URL に追加する任意のパスプレフィックス。                                                                                                                                                                     |
| form_encode_query_params | bool        | False                         | クエリパラメータを URL パラメータではなく、リクエストボディ内のフォームエンコードされたデータとして送信します。URL 長制限を超える可能性がある大きなパラメータセットを持つクエリに便利です。                                                          |
| rename_response_column   | str         | *None*                        | クエリ結果内のレスポンスカラム名を変更するための任意のコールバック関数またはカラム名マッピング。                                                                                                                                                      |

### HTTPS/TLS 引数 {#httpstls-arguments}



| Parameter                | Type | Default | Description                                                                                                                                                                  |
| ------------------------ | ---- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verify                   | bool | True    | HTTPS/TLS を使用する場合に、ClickHouse サーバーの TLS/SSL 証明書（ホスト名、有効期限など）を検証します。                                                                                                          |
| ca&#95;cert              | str  | *None*  | *verify*=*True* の場合に、ClickHouse サーバー証明書を検証するための認証局 (CA) ルート証明書のファイルパス（.pem 形式）。verify が False の場合は無視されます。ClickHouse サーバー証明書が OS によって検証されるグローバルに信頼されたルート証明書である場合は不要です。        |
| client&#95;cert          | str  | *None*  | TLS クライアント証明書（相互 TLS 認証用）のファイルパス（.pem 形式）。中間証明書を含む、完全な証明書チェーンをファイル内に含める必要があります。                                                                                              |
| client&#95;cert&#95;key  | str  | *None*  | クライアント証明書用の秘密鍵ファイルのパス。秘密鍵がクライアント証明書の鍵ファイル内に含まれていない場合に必須です。                                                                                                                   |
| server&#95;host&#95;name | str  | *None*  | TLS 証明書の CN または SNI で識別される ClickHouse サーバーのホスト名。異なるホスト名を持つプロキシやトンネル経由で接続する際の SSL エラーを避けるために設定します。                                                                            |
| tls&#95;mode             | str  | *None*  | 高度な TLS 動作を制御します。`proxy` および `strict` は ClickHouse の相互 TLS 接続を開始しませんが、クライアント証明書とキーは送信します。`mutual` は、クライアント証明書を用いた ClickHouse の相互 TLS 認証を前提とします。*None*/デフォルトの動作は `mutual` です。 |

### Settings argument

最後に、`get_client` の `settings` 引数は、各クライアントリクエストごとに追加の ClickHouse 設定をサーバーに渡すために使用されます。多くの場合、*readonly*=*1* のアクセス権しか持たないユーザーはクエリとともに送信される設定を変更できないため、ClickHouse Connect はそのような設定を最終リクエストから削除し、警告をログに記録します。以下の設定は ClickHouse Connect が使用する HTTP クエリ/セッションにのみ適用され、一般的な ClickHouse 設定としてはドキュメント化されていません。

| Setting                       | Description                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| buffer&#95;size               | ClickHouse サーバーが HTTP チャネルに書き込む前に使用するバッファサイズ（バイト単位）。                                    |
| session&#95;id                | サーバー上で関連するクエリを紐付けるための一意なセッション ID。一時テーブルを使用する場合に必須です。                                    |
| compress                      | ClickHouse サーバーが POST レスポンスデータを圧縮するかどうか。この設定は「raw」クエリに対してのみ使用する必要があります。                 |
| decompress                    | ClickHouse サーバーに送信されるデータを解凍（伸長）する必要があるかどうか。この設定は「raw」インサートに対してのみ使用する必要があります。            |
| quota&#95;key                 | このリクエストに関連付けられるクオータキー。クオータに関する ClickHouse サーバーのドキュメントを参照してください。                         |
| session&#95;check             | セッションの状態を確認するために使用されます。                                                                 |
| session&#95;timeout           | セッション ID で識別されるセッションがタイムアウトし、もはや有効と見なされなくなるまでの非アクティブ状態の秒数。デフォルトは 60 秒です。                |
| wait&#95;end&#95;of&#95;query | レスポンス全体を ClickHouse サーバー側でバッファリングします。この設定はサマリー情報を返すために必要であり、ストリーミングではないクエリでは自動的に設定されます。 |
| role                          | セッションで使用される ClickHouse のロール。クエリコンテキストに含めることができる有効なトランスポート設定です。                          |

各クエリとともに送信できるその他の ClickHouse 設定については、[ClickHouse ドキュメント](/operations/settings/settings.md) を参照してください。

### Client creation examples

* パラメータを指定しない場合、ClickHouse Connect クライアントは `localhost` のデフォルト HTTP ポートに、デフォルトユーザーおよびパスワードなしで接続します。

```python
import clickhouse_connect
```


client = clickhouse&#95;connect.get&#95;client()
print(client.server&#95;version)

# 出力: &#39;22.10.1.98&#39;

````

- HTTPS で保護された外部 ClickHouse サーバーへの接続

```python
import clickhouse_connect
````


client = clickhouse&#95;connect.get&#95;client(host=&#39;play.clickhouse.com&#39;, secure=True, port=443, user=&#39;play&#39;, password=&#39;clickhouse&#39;)
print(client.command(&#39;SELECT timezone()&#39;))

# 出力: &#39;Etc/UTC&#39;

````

- セッション ID などのカスタム接続パラメータや ClickHouse の設定を指定して接続する。

```python
import clickhouse_connect
````


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

# 出力: 'github'

```

```


## クライアントのライフサイクルとベストプラクティス

ClickHouse Connect クライアントの作成は、接続の確立、サーバーメタデータの取得、設定の初期化などを伴うコストの高い操作です。最適なパフォーマンスのために、次のベストプラクティスに従ってください。

### 基本原則

* **クライアントを再利用する**: アプリケーションの起動時にクライアントを一度作成し、アプリケーションのライフサイクル全体を通して再利用する
* **頻繁な作成を避ける**: クエリやリクエストごとに新しいクライアントを作成しない（この方法では、操作ごとに数百ミリ秒を無駄にします）
* **適切にクリーンアップする**: アプリケーションの終了時には必ずクライアントをクローズして、コネクションプールのリソースを解放する
* **可能な限り共有する**: 単一のクライアントであっても、そのコネクションプールを通じて多数の同時クエリを処理できます（後述のスレッドに関する注意を参照）

### 基本パターン

**✅ 良い例: 単一のクライアントを再利用する**

```python
import clickhouse_connect
```


# 起動時に一度だけクライアントを作成する
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')



# すべてのクエリで再利用
for i in range(1000):
    result = client.query('SELECT count() FROM users')



# シャットダウン時にクライアントをクローズする

client.close()

```

**❌ 悪い例: クライアントを毎回作成する**
```


```python
# 悪い例: 初期化コストの高いクライアントを1000個生成してしまう
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### マルチスレッドアプリケーション

:::warning
クライアントインスタンスは、セッション ID を使用している場合は**スレッドセーフではありません**。デフォルトでは、クライアントには自動生成されたセッション ID が割り当てられており、同一セッション内でクエリを並行実行すると `ProgrammingError` が発生します。
:::

スレッド間でクライアントを安全に共有するには、次のようにします。

```python
import clickhouse_connect
import threading
```


# オプション 1: セッションを無効化する（共有クライアントに推奨）
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # スレッドセーフ性を確保するために必須
)

def worker(thread_id):
    # すべてのスレッドで同じクライアントを安全に共有できる
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()



client.close()

# 出力:

# スレッド 0: 0

# スレッド 7: 7

# スレッド 1: 1

# スレッド 9: 9

# スレッド 4: 4

# スレッド 2: 2

# スレッド 8: 8

# スレッド 5: 5

# スレッド 6: 6

# スレッド 3: 3

````

**セッションが必要な場合の代替方法:** セッションが必要な場合（例: 一時テーブルの利用など）は、スレッドごとに別のクライアントを作成してください:

```python
def worker(thread_id):
    # 各スレッドごとにセッションが分離された専用クライアントを作成する
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... 一時テーブルを使用 ...
    client.close()
````

### 適切なクリーンアップ

シャットダウン時には必ずクライアントをクローズしてください。`client.close()` は、クライアントが専有のプールマネージャーを所有している場合（たとえば、カスタムの TLS/プロキシオプションを指定して作成された場合）にのみ、クライアントを破棄し、プールされた HTTP 接続を閉じます。デフォルトの共有プールを利用している場合は、ソケットを積極的にクリアするために `client.close_connections()` を使用してください。これを呼び出さなくても、接続はアイドル時間の経過やプロセス終了時に自動的に回収されます。

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

### 複数のクライアントを使うべきタイミング

複数のクライアントが適している場面:

* **異なるサーバー**: ClickHouse サーバーまたはクラスターごとにクライアントを 1 つ用意する場合
* **異なる認証情報**: ユーザーやアクセスレベルごとにクライアントを分ける場合
* **異なるデータベース**: 複数のデータベースを扱う必要がある場合
* **分離されたセッション**: 一時テーブルやセッション固有の設定ごとにセッションを分ける必要がある場合
* **スレッドごとの分離**: スレッドごとに独立したセッションが必要な場合（上記の例のように）


## 共通のメソッド引数

いくつかのクライアントメソッドは、共通の `parameters` 引数と `settings` 引数の一方または両方を使用します。これらのキーワード引数について以下で説明します。

### Parameters 引数

ClickHouse Connect Client の `query*` および `command` メソッドは、Python の式を ClickHouse の値式にバインドするために使用される、オプションの `parameters` キーワード引数を受け取ります。利用可能なバインド方法は 2 種類あります。

#### サーバーサイドバインディング

ClickHouse は、バインドされた値をクエリとは別に HTTP のクエリパラメータとして送信する、ほとんどのクエリ値向けの[サーバーサイドバインディング](/interfaces/cli.md#cli-queries-with-parameters)をサポートしています。ClickHouse Connect は、`{<name>:<datatype>}` 形式のバインド式を検出すると、適切なクエリパラメータを追加します。サーバーサイドバインディングでは、`parameters` 引数には Python の辞書を指定する必要があります。

* Python の辞書、DateTime 値、文字列値を用いたサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "シングルクォーテーションを含む文字列'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

これにより、サーバー側で次のクエリが生成されます。

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'シングルクォート（\'）を含む文字列\''
```

:::warning
サーバーサイドバインディングは（ClickHouse サーバーによって）`SELECT` クエリに対してのみサポートされています。`ALTER`、`DELETE`、`INSERT` など、その他の種類のクエリでは動作しません。将来的に変更される可能性があります。詳細は [https://github.com/ClickHouse/ClickHouse/issues/42092](https://github.com/ClickHouse/ClickHouse/issues/42092) を参照してください。
:::

#### クライアントサイドバインディング

ClickHouse Connect はクライアントサイドのパラメータバインディングにも対応しており、テンプレート化された SQL クエリを生成する際に、より柔軟に扱うことができます。クライアントサイドバインディングでは、`parameters` 引数は辞書またはシーケンスである必要があります。クライアントサイドバインディングでは、パラメータの埋め込みに Python の「printf スタイル」の[文字列フォーマット](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)が使用されます。

サーバーサイドバインディングとは異なり、クライアントサイドバインディングは、データベース、テーブル、カラム名などのデータベース識別子には使用できない点に注意してください。これは、Python スタイルのフォーマットでは異なる種類の文字列を区別できず、それぞれ異なる形式でフォーマットする必要があるためです（データベース識別子にはバッククォートまたはダブルクォート、データ値にはシングルクォートが必要です）。

* Python の辞書型（dict）、DateTime 値、および文字列エスケープを用いた例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "シングルクォートを含む文字列'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

これにより、サーバー側で次のクエリが生成されます。

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'シングルクォートを含む文字列\''
```

* Python のシーケンス（タプル）、Float64、IPv4Address を使った例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

これにより、サーバー側で次のクエリが生成されます。

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64 引数（サブ秒精度の ClickHouse 型）をバインドするには、2 つのカスタム アプローチのうちいずれかを使用する必要があります：

* Python の `datetime.datetime` 値を新しい DT64Param クラスでラップします。例：
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書を使用したサーバーサイドのバインディング
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストを使用したクライアントサイドのバインディング 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * パラメータ値の辞書を使用する場合、パラメータ名に文字列 `_64` を追加します
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書を使用したサーバーサイドのバインディング
  ```


    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}

````
:::

### `settings` 引数 {#settings-argument-1}

主要な ClickHouse Connect Client の "insert" および "select" メソッドはすべて、含まれる SQL ステートメントに対して ClickHouse サーバーの[ユーザー設定](/operations/settings/settings.md)を渡すための、オプションの `settings` キーワード引数を受け取ります。`settings` 引数は辞書型である必要があります。各要素は ClickHouse の設定名と、その対応する値である必要があります。値は、サーバーにクエリパラメータとして送信される際に文字列へ変換されることに注意してください。

クライアントレベルの設定と同様に、ClickHouse Connect はサーバー側で *readonly*=*1* とマークされた設定をすべて無視し、その旨をログメッセージとして出力します。ClickHouse の HTTP インターフェイス経由のクエリにのみ適用される設定は常に有効です。これらの設定については、`get_client` [API](#settings-argument) で説明されています。

ClickHouse 設定の使用例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
          'session_id': 'session_1234',
          'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
````


## Client `command` メソッド

`Client.command` メソッドを使用して、通常はデータを返さない SQL クエリ、または完全なデータセットではなく単一のプリミティブ値または配列値のみを返す SQL クエリを ClickHouse サーバーに送信します。このメソッドは次のパラメータを受け取ります。

| Parameter         | Type             | Default    | Description                                                                                                    |
| ----------------- | ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| cmd               | str              | *Required* | 単一の値、または 1 行分の値のみを返す ClickHouse の SQL ステートメント。                                                                 |
| parameters        | dict or iterable | *None*     | [parameters の説明](#parameters-argument) を参照してください。                                                              |
| data              | str or bytes     | *None*     | コマンドとともに POST ボディとして送信する任意のデータ。                                                                                |
| settings          | dict             | *None*     | [settings の説明](#settings-argument) を参照してください。                                                                  |
| use&#95;database  | bool             | True       | クライアント作成時に指定したデータベースを使用します。False の場合、そのコマンドは接続ユーザーに対する ClickHouse サーバーのデフォルトデータベースを使用します。                      |
| external&#95;data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む `ExternalData` オブジェクト。[高度なクエリ（外部データ）](advanced-querying.md#external-data) を参照してください。 |

### コマンド例

#### DDL ステートメント

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# テーブルを作成する
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # query_id を含む QuerySummary を返します



# テーブル定義を表示する
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# 出力:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()
# SETTINGS index_granularity = 8192



# テーブルを削除する

client.command(&quot;DROP TABLE test&#95;command&quot;)

````

#### 単一の値を返す簡単なクエリ {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 単一の値の結果
count = client.command("SELECT count() FROM system.tables")
print(count)
# 出力: 151



# サーバーのバージョン

version = client.command(&quot;SELECT version()&quot;)
print(version)

# 出力: &quot;25.8.2.29&quot;

````

#### パラメータ付きコマンド {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クライアント側パラメーターの利用

table_name = "system"
result = client.command(
"SELECT count() FROM system.tables WHERE database = %(db)s",
parameters={"db": table_name}
)


# サーバー側パラメータの利用

result = client.command(
"SELECT count() FROM system.tables WHERE database = {db:String}",
parameters={"db": "system"}
)

````

#### 設定を指定したコマンド {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# 特定の設定を指定してコマンドを実行する

result = client.command(
"OPTIMIZE TABLE large_table FINAL",
settings={"optimize_throw_if_noop": 1}
)

```

```


## Client `query` Method

`Client.query` メソッドは、ClickHouse サーバーから単一の「バッチ」データセットを取得するための主な手段です。HTTP 経由で ClickHouse ネイティブフォーマットを利用して、大規模なデータセット（およそ 100 万行まで）を効率的に転送します。このメソッドは次のパラメータを受け取ります:

| Parameter                   | Type             | Default    | Description                                                                                                                                               |
| --------------------------- | ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query                       | str              | *Required* | ClickHouse の SQL SELECT または DESCRIBE クエリ。                                                                                                                 |
| parameters                  | dict or iterable | *None*     | [parameters description](#parameters-argument) を参照してください。                                                                                                 |
| settings                    | dict             | *None*     | [settings description](#settings-argument) を参照してください。                                                                                                     |
| query&#95;formats           | dict             | *None*     | 結果値のデータ型フォーマット指定。Advanced Usage (Read Formats) を参照してください。                                                                                                 |
| column&#95;formats          | dict             | *None*     | 列ごとのデータ型フォーマット指定。Advanced Usage (Read Formats) を参照してください。                                                                                                 |
| encoding                    | str              | *None*     | ClickHouse の String 列を Python の文字列へエンコードする際に使用するエンコーディング。設定しない場合、Python のデフォルトは `UTF-8` です。                                                               |
| use&#95;none                | bool             | True       | ClickHouse の null に対して Python の *None* 型を使用します。False の場合、ClickHouse の null にはデータ型のデフォルト値（0 など）を使用します。注: パフォーマンス上の理由により、NumPy/Pandas ではデフォルトで False になります。 |
| column&#95;oriented         | bool             | False      | 結果を行のシーケンスではなく列のシーケンスとして返します。Python データをほかのカラム指向のデータフォーマットに変換する場合に便利です。                                                                                   |
| query&#95;tz                | str              | *None*     | `zoneinfo` データベースに含まれるタイムゾーン名。このタイムゾーンが、クエリで返されるすべての datetime または Pandas Timestamp オブジェクトに適用されます。                                                         |
| column&#95;tzs              | dict             | *None*     | 列名からタイムゾーン名へのマッピングを表す辞書。`query_tz` と同様ですが、列ごとに異なるタイムゾーンを指定できます。                                                                                           |
| use&#95;extended&#95;dtypes | bool             | True       | Pandas の拡張 dtypes（StringArray など）および ClickHouse の NULL 値に対する pandas.NA と pandas.NaT を使用します。`query_df` および `query_df_stream` メソッドにのみ適用されます。                |
| external&#95;data           | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクトです。[Advanced Queries (External Data)](advanced-querying.md#external-data) を参照してください。                         |
| context                     | QueryContext     | *None*     | 上記のメソッド引数をカプセル化するために再利用可能な QueryContext オブジェクトです。[Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts) を参照してください。                        |

### Query examples

#### Basic query

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 簡単な SELECT クエリ
result = client.query("SELECT name, database FROM system.tables LIMIT 3")



# 行ごとに結果へアクセス
for row in result.result_rows:
    print(row)
# 出力:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')



# 列名と型の取得

print(result.column&#95;names)

# 出力: (&quot;name&quot;, &quot;database&quot;)

print([col&#95;type.name for col&#95;type in result.column&#95;types])

# 出力: [&#39;String&#39;, &#39;String&#39;]

````

#### クエリ結果の取得 {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")
````


# 行指向アクセス (デフォルト)
print(result.result_rows)
# 出力: [[0, "0"], [1, "1"], [2, "2"]]



# 列指向アクセス
print(result.result_columns)
# 出力: [[0, 1, 2], ["0", "1", "2"]]



# 名前付き結果（辞書のリスト）

for row_dict in result.named_results():
print(row_dict)

# 出力:

# {"number": 0, "str": "0"}

# {"number": 1, "str": "1"}

# {"number": 2, "str": "2"}


# 先頭行を辞書として取得

print(result.first_item)

# 出力: {"number": 0, "str": "0"}


# 先頭行をタプルとして取得

print(result.first&#95;row)

# 出力: (0, &quot;0&quot;)

````

#### クライアント側のパラメータを使用したクエリ {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 辞書形式のパラメータの使用（printf形式）

query = "SELECT \* FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)


# タプルパラメータの使用

query = &quot;SELECT * FROM system.tables WHERE database = %s LIMIT %s&quot;
parameters = (&quot;system&quot;, 5)
result = client.query(query, parameters=parameters)

````

#### サーバー側パラメーターを使用したクエリ {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# サーバー側バインディング（より安全で、SELECT クエリのパフォーマンスに優れる）

query = "SELECT \* FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)

````

#### 設定付きクエリ {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# クエリとともに ClickHouse の設定を渡す

result = client.query(
"SELECT sum(number) FROM numbers(1000000)",
settings={
"max_block_size": 100000,
"max_execution_time": 30
}
)

```

### `QueryResult` オブジェクト {#the-queryresult-object}

基本的な `query` メソッドは、次の公開プロパティを持つ `QueryResult` オブジェクトを返します。

- `result_rows` -- 行のシーケンスとして返されるデータの行列であり、各行要素は列値のシーケンスです。
- `result_columns` -- 列のシーケンスとして返されるデータの行列であり、各列要素はその列に対応する行値のシーケンスです。
- `column_names` -- `result_set` 内の列名を表す文字列のタプル
- `column_types` -- `result_columns` 内の各列に対応する ClickHouse のデータ型を表す ClickHouseType インスタンスのタプル
- `query_id` -- ClickHouse の query_id（`system.query_log` テーブルでクエリを調査する際に有用）
- `summary` -- `X-ClickHouse-Summary` HTTP レスポンスヘッダーによって返される任意のデータ
- `first_item` -- レスポンスの最初の行を辞書として取得するための補助プロパティ（キーは列名）
- `first_row` -- 結果の最初の行を返すための補助プロパティ
- `column_block_stream` -- 列指向フォーマットでクエリ結果を生成するジェネレーター。このプロパティは直接参照しないでください（後述）。
- `row_block_stream` -- 行指向フォーマットでクエリ結果を生成するジェネレーター。このプロパティは直接参照しないでください（後述）。
- `rows_stream` -- 呼び出しごとに 1 行ずつクエリ結果を生成するジェネレーター。このプロパティは直接参照しないでください（後述）。
- `summary` -- `command` メソッドで説明されているとおり、ClickHouse によって返されるサマリー情報の辞書

`*_stream` プロパティは、返されたデータに対してイテレーターとして使用できる Python のコンテキストを返します。これらには、Client の `*_stream` メソッドを介して間接的にのみアクセスしてください。

StreamContext オブジェクトを使用したストリーミングクエリ結果の詳細については、[高度なクエリ（ストリーミングクエリ）](advanced-querying.md#streaming-queries) を参照してください。

```


## NumPy、Pandas、または Arrow でクエリ結果を利用する {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect は、NumPy、Pandas、Arrow の各データ形式向けに専用のクエリメソッドを提供します。これらのメソッドの使用方法（サンプル、ストリーミング機能、より高度な型の扱いを含む）についての詳細は、[高度なクエリ（NumPy、Pandas、Arrow クエリ）](advanced-querying.md#numpy-pandas-and-arrow-queries) を参照してください。



## クライアント側ストリーミングクエリメソッド {#client-streaming-query-methods}

大規模な結果セットをストリーミングする場合、ClickHouse Connect では複数のストリーミングメソッドを利用できます。詳細および例については、[高度なクエリ（ストリーミングクエリ）](advanced-querying.md#streaming-queries) を参照してください。



## クライアントの `insert` メソッド

ClickHouse に複数レコードを挿入する一般的なユースケースでは、`Client.insert` メソッドを使用します。このメソッドは次のパラメータを受け取ります:

| Parameter                 | Type                              | Default     | Description                                                                                                                                   |
| ------------------------- | --------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| table                     | str                               | *Required*  | 挿入先の ClickHouse テーブル。データベースを含む完全修飾テーブル名を指定することもできます。                                                                                          |
| data                      | Sequence of Sequences             | *Required*  | 挿入するデータの行列。行指向の場合は「各行がカラム値のシーケンス」であるシーケンス、列指向の場合は「各列が行値のシーケンス」であるシーケンスを指定します。                                                                 |
| column&#95;names          | Sequence of str, or str           | &#39;*&#39; | データ行列に対応する column&#95;names のリスト。代わりに &#39;*&#39; を使用した場合、ClickHouse Connect はテーブルのすべてのカラム名を取得するための「事前クエリ」を実行します。                             |
| database                  | str                               | &#39;&#39;  | 挿入先のデータベース。指定しない場合は、クライアントに設定されているデータベースが使用されます。                                                                                              |
| column&#95;types          | Sequence of ClickHouseType        | *None*      | ClickHouseType インスタンスのリスト。column&#95;types と column&#95;type&#95;names のどちらも指定されない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するための「事前クエリ」を実行します。  |
| column&#95;type&#95;names | Sequence of ClickHouse type names | *None*      | ClickHouse データ型名のリスト。column&#95;types と column&#95;type&#95;names のどちらも指定されない場合、ClickHouse Connect はテーブルのすべてのカラム型を取得するための「事前クエリ」を実行します。       |
| column&#95;oriented       | bool                              | False       | True の場合、`data` 引数は列のシーケンスであるとみなされ（データを挿入するための「ピボット」は不要になり）、それ以外の場合は `data` は行のシーケンスとして解釈されます。                                                |
| settings                  | dict                              | *None*      | [settings description](#settings-argument) を参照してください。                                                                                         |
| context                   | InsertContext                     | *None*      | 上記のメソッド引数をカプセル化する再利用可能な InsertContext オブジェクトを使用できます。詳しくは [Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts) を参照してください。 |
| transport&#95;settings    | dict                              | *None*      | トランスポートレベルの設定（HTTP ヘッダーなど）のオプション辞書。                                                                                                           |

このメソッドは、「command」メソッドで説明されている「クエリサマリ」ディクショナリを返します。何らかの理由で insert に失敗した場合は、例外が送出されます。

Pandas DataFrame、PyArrow Table、および Arrow バックエンドの DataFrame に対応した専用の insert メソッドについては、[Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods) を参照してください。

:::note
NumPy 配列は有効な「Sequence of Sequences」であり、メインの `insert` メソッドの `data` 引数として使用できるため、専用メソッドは必須ではありません。
:::

### 例

以下の例では、スキーマ `(id UInt32, name String, age UInt8)` を持つ既存テーブル `users` を前提とします。

#### 基本的な行指向の insert

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 行指向データ: 各内側リストが1行を表す

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;])

````

#### 列指向インサート {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 列指向データ: 内側の各リストが 1 列

data = [
[1, 2, 3],  # id 列
[&quot;Alice&quot;, &quot;Bob&quot;, &quot;Joe&quot;],  # name 列
[25, 30, 28],  # age 列
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;], column&#95;oriented=True)

````

#### 明示的な列型を指定して挿入 {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# サーバーに対する DESCRIBE クエリを避けたい場合に便利です

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
column&#95;type&#95;names=[&quot;UInt32&quot;, &quot;String&quot;, &quot;UInt8&quot;],
)

````

#### 特定のデータベースへの挿入 {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]
````


# 特定のデータベースのテーブルにデータを挿入する

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
database=&quot;production&quot;,
)

```
```


## ファイル挿入 {#file-inserts}

ファイルから ClickHouse のテーブルに直接データを挿入する方法については、[高度な挿入（ファイル挿入）](advanced-inserting.md#file-inserts) を参照してください。



## Raw API {#raw-api}

型変換を行わずに ClickHouse の HTTP インターフェイスへ直接アクセスする高度なユースケースについては、[高度な利用方法 (Raw API)](advanced-usage.md#raw-api) を参照してください。



## ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスおよび関数も、「公開」`clickhouse-connect` API の一部と見なされ、上記で説明したクラスやメソッドと同様に、マイナーリリース間で安定しています。これらのクラスおよび関数に対する互換性を壊す変更は、マイナーリリース（パッチリリースではない）のタイミングでのみ行われ、少なくとも 1 回分のマイナーリリース期間については、非推奨ステータスのまま利用可能です。

### 例外 {#exceptions}

すべてのカスタム例外（DB API 2.0 仕様で定義されているものを含む）は、`clickhouse_connect.driver.exceptions` モジュールで定義されています。ドライバーによって実際に検出される例外は、これらのいずれかの型になります。

### ClickHouse SQL ユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` モジュール内の関数および DT64Param クラスは、ClickHouse の SQL クエリを正しく構築し、エスケープするために使用できます。同様に、`clickhouse_connect.driver.parser` モジュール内の関数は、ClickHouse のデータ型名を解析するために使用できます。



## マルチスレッド、マルチプロセス、非同期／イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

マルチスレッド、マルチプロセス、または非同期／イベント駆動アプリケーションで ClickHouse Connect を使用する方法については、[高度な利用方法（マルチスレッド、マルチプロセス、非同期／イベント駆動のユースケース）](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)を参照してください。



## AsyncClient ラッパー {#asyncclient-wrapper}

asyncio 環境で AsyncClient ラッパーを利用する方法については、[高度な利用方法 (AsyncClient ラッパー)](advanced-usage.md#asyncclient-wrapper) を参照してください。



## ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

マルチスレッドまたは同時実行アプリケーションにおける ClickHouse セッション ID の管理については、[高度な利用方法（ClickHouse セッション ID の管理）](advanced-usage.md#managing-clickhouse-session-ids) を参照してください。



## HTTP 接続プールのカスタマイズ {#customizing-the-http-connection-pool}

大規模なマルチスレッドアプリケーション向けの HTTP 接続プールのカスタマイズ方法については、[高度な利用方法（HTTP 接続プールのカスタマイズ）](advanced-usage.md#customizing-the-http-connection-pool) を参照してください。
