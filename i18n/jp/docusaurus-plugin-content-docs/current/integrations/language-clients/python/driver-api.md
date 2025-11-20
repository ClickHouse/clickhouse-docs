---
sidebar_label: 'Driver API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect ドライバ API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect ドライバ API'
doc_type: 'reference'
---



# ClickHouse Connect ドライバー API {#clickhouse-connect-driver-api}

:::note
多くの API メソッドには多数の引数があり、そのほとんどがオプションであるため、キーワード引数を使用することを推奨します。

_ここに記載されていないメソッドは API の一部とは見なされず、削除または変更される可能性があります。_
:::


## クライアントの初期化 {#client-initialization}

`clickhouse_connect.driver.client`クラスは、PythonアプリケーションとClickHouseデータベースサーバー間の主要なインターフェースを提供します。`clickhouse_connect.get_client`関数を使用してClientインスタンスを取得します。この関数は以下の引数を受け付けます:

### 接続引数 {#connection-arguments}

| パラメータ                | 型          | デフォルト                     | 説明                                                                                                                                                                                                                                           |
| ------------------------ | ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| interface                | str         | http                          | httpまたはhttpsである必要があります。                                                                                                                                                                                                                                |
| host                     | str         | localhost                     | ClickHouseサーバーのホスト名またはIPアドレス。設定されていない場合は`localhost`が使用されます。                                                                                                                                                            |
| port                     | int         | 8123 or 8443                  | ClickHouseのHTTPまたはHTTPSポート。設定されていない場合は8123がデフォルトとなり、_secure_=_True_または_interface_=_https_の場合は8443となります。                                                                                                                             |
| username                 | str         | default                       | ClickHouseのユーザー名。設定されていない場合は、`default`ClickHouseユーザーが使用されます。                                                                                                                                                                     |
| password                 | str         | _&lt;empty string&gt;_        | _username_のパスワード。                                                                                                                                                                                                                          |
| database                 | str         | _None_                        | 接続のデフォルトデータベース。設定されていない場合、ClickHouse Connectは_username_のデフォルトデータベースを使用します。                                                                                                                                 |
| secure                   | bool        | False                         | HTTPS/TLSを使用します。これはinterfaceまたはport引数から推測される値を上書きします。                                                                                                                                                                   |
| dsn                      | str         | _None_                        | 標準DSN(Data Source Name)形式の文字列。他の接続値(hostやuserなど)が設定されていない場合、この文字列から抽出されます。                                                                                           |
| compress                 | bool or str | True                          | ClickHouse HTTPの挿入とクエリ結果の圧縮を有効にします。[追加オプション(圧縮)](additional-options.md#compression)を参照してください。                                                                                                           |
| query_limit              | int         | 0 (unlimited)                 | `query`レスポンスで返される最大行数。無制限の行を返すには0に設定します。結果がストリーミングされない場合、すべての結果が一度にメモリに読み込まれるため、大きなクエリ制限はメモリ不足例外を引き起こす可能性があることに注意してください。 |
| query_retries            | int         | 2                             | `query`リクエストの最大再試行回数。「再試行可能な」HTTPレスポンスのみが再試行されます。意図しない重複リクエストを防ぐため、`command`または`insert`リクエストはドライバーによって自動的に再試行されません。                                |
| connect_timeout          | int         | 10                            | HTTP接続タイムアウト(秒単位)。                                                                                                                                                                                                                   |
| send_receive_timeout     | int         | 300                           | HTTP接続の送受信タイムアウト(秒単位)。                                                                                                                                                                                                              |
| client_name              | str         | _None_                        | HTTP User Agentヘッダーの先頭に追加されるclient_name。ClickHouseのsystem.query_logでクライアントクエリを追跡するために設定します。                                                                                                                             |
| pool_mgr                 | obj         | _&lt;default PoolManager&gt;_ | 使用する`urllib3`ライブラリのPoolManager。異なるホストへの複数の接続プールを必要とする高度なユースケース向けです。                                                                                                                              |
| http_proxy               | str         | _None_                        | HTTPプロキシアドレス(HTTP_PROXY環境変数の設定と同等)。                                                                                                                                                                       |
| https_proxy              | str         | _None_                        | HTTPSプロキシアドレス(HTTPS_PROXY環境変数の設定と同等)。                                                                                                                                                                     |
| apply_server_timezone    | bool        | True                          | タイムゾーンを考慮したクエリ結果にサーバーのタイムゾーンを使用します。[タイムゾーンの優先順位](advanced-querying.md#time-zones)を参照してください。                                                                                                                                      |
| show_clickhouse_errors   | bool        | True                          | クライアント例外に詳細なClickHouseサーバーエラーメッセージと例外コードを含めます。                                                                                                                                                           |
| autogenerate_session_id  | bool        | _None_                        | グローバルな`autogenerate_session_id`設定を上書きします。Trueの場合、セッションIDが提供されていないときに自動的にUUID4セッションIDを生成します。                                                                                                                      |
| proxy_path               | str         | &lt;empty string&gt;          | プロキシ構成のためにClickHouseサーバーURLに追加するオプションのパスプレフィックス。                                                                                                                                                                    |
| form_encode_query_params | bool        | False                         | クエリパラメータをURLパラメータではなく、リクエストボディ内のフォームエンコードデータとして送信します。URL長の制限を超える可能性のある大きなパラメータセットを持つクエリに有用です。                                                                           |
| rename_response_column   | str         | _None_                        | クエリ結果のレスポンス列名を変更するためのオプションのコールバック関数または列名マッピング。                                                                                                                                                                        |

### HTTPS/TLS引数 {#httpstls-arguments}


| パラメータ        | 型 | デフォルト | 説明                                                                                                                                                                                                                                                                       |
| ---------------- | ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verify           | bool | True    | HTTPS/TLSを使用する場合、ClickHouseサーバーのTLS/SSL証明書(ホスト名、有効期限など)を検証します。                                                                                                                                                                               |
| ca_cert          | str  | _None_  | _verify_=_True_の場合、ClickHouseサーバー証明書を検証するための認証局ルート証明書への.pem形式のファイルパス。verifyがFalseの場合は無視されます。ClickHouseサーバー証明書がオペレーティングシステムによって検証されたグローバルに信頼されたルート証明書である場合、これは不要です。 |
| client_cert      | str  | _None_  | .pem形式のTLSクライアント証明書へのファイルパス(相互TLS認証用)。ファイルには中間証明書を含む完全な証明書チェーンが含まれている必要があります。                                                                                                  |
| client_cert_key  | str  | _None_  | クライアント証明書の秘密鍵へのファイルパス。秘密鍵がクライアント証明書鍵ファイルに含まれていない場合は必須です。                                                                                                                                             |
| server_host_name | str  | _None_  | TLS証明書のCNまたはSNIで識別されるClickHouseサーバーのホスト名。異なるホスト名のプロキシまたはトンネル経由で接続する際のSSLエラーを回避するために設定します。                                                                                            |
| tls_mode         | str  | _None_  | 高度なTLS動作を制御します。`proxy`と`strict`はClickHouseの相互TLS接続を呼び出しませんが、クライアント証明書と鍵を送信します。`mutual`はクライアント証明書によるClickHouseの相互TLS認証を想定します。_None_/デフォルトの動作は`mutual`です。                                  |

### settings引数 {#settings-argument}

最後に、`get_client`の`settings`引数は、各クライアントリクエストに対してサーバーに追加のClickHouse設定を渡すために使用されます。ほとんどの場合、_readonly_=_1_アクセス権を持つユーザーはクエリと共に送信される設定を変更できないため、ClickHouse Connectは最終リクエストでそのような設定を削除し、警告をログに記録します。以下の設定はClickHouse Connectが使用するHTTPクエリ/セッションにのみ適用され、一般的なClickHouse設定としては文書化されていません。

| 設定           | 説明                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| buffer_size       | HTTPチャネルへの書き込み前にClickHouseサーバーが使用するバッファサイズ(バイト単位)。                                                                         |
| session_id        | サーバー上の関連するクエリを関連付けるための一意のセッションID。一時テーブルには必須です。                                                                   |
| compress          | ClickHouseサーバーがPOSTレスポンスデータを圧縮すべきかどうか。この設定は「raw」クエリにのみ使用すべきです。                                        |
| decompress        | ClickHouseサーバーに送信されるデータを解凍する必要があるかどうか。この設定は「raw」インサートにのみ使用すべきです。                                         |
| quota_key         | このリクエストに関連付けられたクォータキー。クォータに関するClickHouseサーバーのドキュメントを参照してください。                                                                   |
| session_check     | セッションステータスの確認に使用されます。                                                                                                                                |
| session_timeout   | セッションIDで識別されるセッションがタイムアウトし、有効とみなされなくなるまでの非アクティブ時間の秒数。デフォルトは60秒です。         |
| wait_end_of_query | ClickHouseサーバー上でレスポンス全体をバッファリングします。この設定はサマリー情報を返すために必要であり、非ストリーミングクエリでは自動的に設定されます。 |
| role              | セッションに使用するClickHouseロール。クエリコンテキストに含めることができる有効なトランスポート設定です。                                                       |

各クエリと共に送信できる他のClickHouse設定については、[ClickHouseドキュメント](/operations/settings/settings.md)を参照してください。

### クライアント作成例 {#client-creation-examples}

- パラメータを指定しない場合、ClickHouse Connectクライアントはデフォルトユーザーとパスワードなしで`localhost`のデフォルトHTTPポートに接続します:

```python
import clickhouse_connect

```


client = clickhouse&#95;connect.get&#95;client()
print(client.server&#95;version)

# 出力: &#39;22.10.1.98&#39;

````

- セキュアな（HTTPS）外部ClickHouseサーバーへの接続

```python
import clickhouse_connect
````


client = clickhouse&#95;connect.get&#95;client(host=&#39;play.clickhouse.com&#39;, secure=True, port=443, user=&#39;play&#39;, password=&#39;clickhouse&#39;)
print(client.command(&#39;SELECT timezone()&#39;))

# 出力: &#39;Etc/UTC&#39;

````

- セッションIDやその他のカスタム接続パラメータ、ClickHouse設定を使用して接続する。

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


## クライアントのライフサイクルとベストプラクティス {#client-lifecycle-and-best-practices}

ClickHouse Connectクライアントの作成は、接続の確立、サーバーメタデータの取得、設定の初期化を伴うコストの高い操作です。最適なパフォーマンスを実現するために、以下のベストプラクティスに従ってください。

### 基本原則 {#core-principles}

- **クライアントの再利用**: アプリケーション起動時に一度クライアントを作成し、アプリケーションのライフタイム全体で再利用します
- **頻繁な作成を避ける**: クエリやリクエストごとに新しいクライアントを作成しないでください（操作ごとに数百ミリ秒を無駄にします）
- **適切なクリーンアップ**: シャットダウン時には必ずクライアントを閉じて、コネクションプールのリソースを解放します
- **可能な限り共有する**: 単一のクライアントは、コネクションプールを通じて多数の同時クエリを処理できます（以下のスレッドに関する注意事項を参照）

### 基本パターン {#basic-patterns}

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

**❌ 悪い例: クライアントを繰り返し作成する**
```


```python
# 悪い例: 1000個のクライアントを作成し、高コストな初期化オーバーヘッドが発生する
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### マルチスレッドアプリケーション {#multi-threaded-applications}

:::warning
セッションIDを使用する場合、クライアントインスタンスは**スレッドセーフではありません**。デフォルトでは、クライアントは自動生成されたセッションIDを持ち、同一セッション内で並行クエリを実行すると`ProgrammingError`が発生します。
:::

スレッド間でクライアントを安全に共有するには:

```python
import clickhouse_connect
import threading

```


# オプション 1: セッションを無効化する（共有クライアントに推奨）
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # スレッドセーフにするために必須
)

def worker(thread_id):
    # すべてのスレッドが同じ client を安全に利用できる
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

**セッションの代替方法:** セッションが必要な場合（例: 一時テーブル用）は、スレッドごとに個別のクライアントを作成します:

```python
def worker(thread_id):
    # 各スレッドは独立したセッションを持つ専用のクライアントを取得
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... 一時テーブルを使用 ...
    client.close()
````

### 適切なクリーンアップ {#proper-cleanup}

シャットダウン時には必ずクライアントを閉じてください。`client.close()` は、クライアントがプールマネージャーを所有している場合（例: カスタムTLS/プロキシオプションで作成された場合）にのみ、クライアントを破棄しプールされたHTTP接続を閉じることに注意してください。デフォルトの共有プールの場合は、`client.close_connections()` を使用してソケットを積極的にクリアします。それ以外の場合、接続はアイドルタイムアウトまたはプロセス終了時に自動的に回収されます。

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

または、コンテキストマネージャーを使用します:

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```

### 複数のクライアントを使用する場合 {#when-to-use-multiple-clients}

複数のクライアントは以下の場合に適しています:

- **異なるサーバー**: ClickHouseサーバーまたはクラスターごとに1つのクライアント
- **異なる認証情報**: 異なるユーザーまたはアクセスレベルごとに個別のクライアント
- **異なるデータベース**: 複数のデータベースを操作する必要がある場合
- **独立したセッション**: 一時テーブルやセッション固有の設定のために個別のセッションが必要な場合
- **スレッドごとの分離**: スレッドが独立したセッションを必要とする場合（上記の例を参照）


## 共通メソッド引数 {#common-method-arguments}

複数のクライアントメソッドは、共通の `parameters` および `settings` 引数の一方または両方を使用します。これらのキーワード引数について以下に説明します。

### Parameters 引数 {#parameters-argument}

ClickHouse Connect Client の `query*` および `command` メソッドは、Python式をClickHouseの値式にバインドするために使用されるオプションの `parameters` キーワード引数を受け付けます。2種類のバインディングが利用可能です。

#### サーバーサイドバインディング {#server-side-binding}

ClickHouseは、ほとんどのクエリ値に対して[サーバーサイドバインディング](/interfaces/cli.md#cli-queries-with-parameters)をサポートしており、バインドされた値はHTTPクエリパラメータとしてクエリとは別に送信されます。ClickHouse Connectは、`{<name>:<datatype>}` 形式のバインディング式を検出すると、適切なクエリパラメータを追加します。サーバーサイドバインディングの場合、`parameters` 引数はPython辞書である必要があります。

- Python辞書、DateTime値、文字列値を使用したサーバーサイドバインディング

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

これにより、サーバー上で以下のクエリが生成されます:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
サーバーサイドバインディングは、`SELECT` クエリに対してのみ(ClickHouseサーバーによって)サポートされています。`ALTER`、`DELETE`、`INSERT`、その他のタイプのクエリでは機能しません。これは将来変更される可能性があります。https://github.com/ClickHouse/ClickHouse/issues/42092 を参照してください。
:::

#### クライアントサイドバインディング {#client-side-binding}

ClickHouse Connectは、クライアントサイドパラメータバインディングもサポートしており、テンプレート化されたSQLクエリの生成においてより高い柔軟性を提供します。クライアントサイドバインディングの場合、`parameters` 引数は辞書またはシーケンスである必要があります。クライアントサイドバインディングは、パラメータ置換にPythonの["printf"スタイル](https://docs.python.org/3/library/stdtypes.html#old-string-formatting)文字列フォーマットを使用します。

サーバーサイドバインディングとは異なり、クライアントサイドバインディングはデータベース、テーブル、カラム名などのデータベース識別子には使用できないことに注意してください。これは、Pythonスタイルのフォーマットでは異なる種類の文字列を区別できず、それらは異なる方法でフォーマットする必要があるためです(データベース識別子にはバッククォートまたはダブルクォート、データ値にはシングルクォート)。

- Python辞書、DateTime値、文字列エスケープを使用した例

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

これにより、サーバー上で以下のクエリが生成されます:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

- Pythonシーケンス(タプル)、Float64、IPv4Addressを使用した例

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

これにより、サーバー上で以下のクエリが生成されます:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64引数(サブ秒精度を持つClickHouse型)をバインドするには、2つのカスタムアプローチのいずれかが必要です:

- Pythonの `datetime.datetime` 値を新しいDT64Paramクラスでラップします。例:

  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 辞書を使用したサーバーサイドバインディング
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # リストを使用したクライアントサイドバインディング
    parameters=['a string', DT64Param(datetime.now())]
  ```

  - パラメータ値の辞書を使用する場合は、パラメータ名に文字列 `_64` を追加します

  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 辞書を使用したサーバーサイドバインディング

  ```


    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}

````
:::

### Settings引数 {#settings-argument-1}

ClickHouse Connect Clientの主要な「insert」および「select」メソッドはすべて、含まれるSQL文に対してClickHouseサーバーの[ユーザー設定](/operations/settings/settings.md)を渡すためのオプションの`settings`キーワード引数を受け付けます。`settings`引数は辞書形式で指定します。各項目はClickHouseの設定名とそれに対応する値で構成されます。値はクエリパラメータとしてサーバーに送信される際に文字列に変換されることに注意してください。

クライアントレベルの設定と同様に、ClickHouse Connectはサーバーが*readonly*=*1*とマークした設定を、関連するログメッセージとともに除外します。ClickHouse HTTPインターフェース経由のクエリにのみ適用される設定は常に有効です。これらの設定については`get_client` [API](#settings-argument)の項で説明されています。

ClickHouse設定の使用例:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
          'session_id': 'session_1234',
          'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
````


## クライアントの `command` メソッド {#client-command-method}

`Client.command` メソッドを使用して、通常はデータを返さないSQLクエリ、または完全なデータセットではなく単一のプリミティブ値や配列値を返すSQLクエリをClickHouseサーバーに送信します。このメソッドは以下のパラメータを受け取ります:

| パラメータ     | 型               | デフォルト | 説明                                                                                                                                                          |
| ------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cmd           | str              | _必須_     | 単一の値または単一行の値を返すClickHouse SQL文。                                                                                                              |
| parameters    | dict or iterable | _None_     | [parametersの説明](#parameters-argument)を参照してください。                                                                                                  |
| data          | str or bytes     | _None_     | POSTボディとしてコマンドに含めるオプションのデータ。                                                                                                          |
| settings      | dict             | _None_     | [settingsの説明](#settings-argument)を参照してください。                                                                                                      |
| use_database  | bool             | True       | クライアントデータベース(クライアント作成時に指定)を使用します。Falseの場合、コマンドは接続ユーザーのデフォルトClickHouseサーバーデータベースを使用します。    |
| external_data | ExternalData     | _None_     | クエリで使用するファイルまたはバイナリデータを含む`ExternalData`オブジェクト。[高度なクエリ(外部データ)](advanced-querying.md#external-data)を参照してください。 |

### コマンドの例 {#command-examples}

#### DDL文 {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# テーブルを作成する
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # query_id を含む QuerySummary が返されます



# テーブル定義を表示
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

#### 単一の値を返すシンプルなクエリ {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 単一値の結果
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


# クライアント側パラメータの使用

table_name = "system"
result = client.command(
"SELECT count() FROM system.tables WHERE database = %(db)s",
parameters={"db": table_name}
)


# サーバーサイドパラメータの使用

result = client.command(
"SELECT count() FROM system.tables WHERE database = {db:String}",
parameters={"db": "system"}
)

````

#### 設定付きコマンド {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# 特定の設定でコマンドを実行

result = client.command(
"OPTIMIZE TABLE large_table FINAL",
settings={"optimize_throw_if_noop": 1}
)

```

```


## クライアントの `query` メソッド {#client-query-method}

`Client.query` メソッドは、ClickHouseサーバーから単一の「バッチ」データセットを取得するための主要な方法です。HTTP経由でClickHouseネイティブフォーマットを利用し、大規模なデータセット(最大約100万行)を効率的に転送します。このメソッドは以下のパラメータを受け取ります:

| パラメータ           | 型             | デフォルト    | 説明                                                                                                                                                                        |
| ------------------- | ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query               | str              | _必須_ | ClickHouse SQLのSELECTまたはDESCRIBEクエリ。                                                                                                                                       |
| parameters          | dict or iterable | _None_     | [parametersの説明](#parameters-argument)を参照。                                                                                                                                |
| settings            | dict             | _None_     | [settingsの説明](#settings-argument)を参照。                                                                                                                                    |
| query_formats       | dict             | _None_     | 結果値のデータ型フォーマット指定。Advanced Usage (Read Formats)を参照。                                                                                             |
| column_formats      | dict             | _None_     | カラムごとのデータ型フォーマット。Advanced Usage (Read Formats)を参照。                                                                                                                  |
| encoding            | str              | _None_     | ClickHouseのString型カラムをPython文字列にエンコードする際に使用するエンコーディング。未設定の場合、Pythonはデフォルトで`UTF-8`を使用します。                                                                      |
| use_none            | bool             | True       | ClickHouseのnull値にPythonの_None_型を使用します。Falseの場合、ClickHouseのnull値にデータ型のデフォルト値(0など)を使用します。注意 - パフォーマンス上の理由から、NumPy/PandasではデフォルトでFalseになります。 |
| column_oriented     | bool             | False      | 結果を行のシーケンスではなく、カラムのシーケンスとして返します。Pythonデータを他のカラム指向データフォーマットに変換する際に便利です。                            |
| query_tz            | str              | _None_     | `zoneinfo`データベースのタイムゾーン名。このタイムゾーンは、クエリによって返されるすべてのdatetimeまたはPandas Timestampオブジェクトに適用されます。                                     |
| column_tzs          | dict             | _None_     | カラム名からタイムゾーン名へのディクショナリ。`query_tz`と同様ですが、カラムごとに異なるタイムゾーンを指定できます。                                                    |
| use_extended_dtypes | bool             | True       | Pandasの拡張dtype(StringArrayなど)、およびClickHouseのNULL値にpandas.NAとpandas.NaTを使用します。`query_df`および`query_df_stream`メソッドにのみ適用されます。                  |
| external_data       | ExternalData     | _None_     | クエリで使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。[Advanced Queries (External Data)](advanced-querying.md#external-data)を参照。                            |
| context             | QueryContext     | _None_     | 上記のメソッド引数をカプセル化するために使用できる再利用可能なQueryContextオブジェクト。[Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts)を参照。                   |

### クエリの例 {#query-examples}

#### 基本的なクエリ {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# シンプルな SELECT クエリ
result = client.query("SELECT name, database FROM system.tables LIMIT 3")



# 行として結果にアクセスする
for row in result.result_rows:
    print(row)
# 出力:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')



# 列名と型へのアクセス

print(result.column&#95;names)

# 出力: (&quot;name&quot;, &quot;database&quot;)

print([col&#95;type.name for col&#95;type in result.column&#95;types])

# 出力: [&#39;String&#39;, &#39;String&#39;]

````

#### クエリ結果へのアクセス {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")
````


# 行指向アクセス（デフォルト）
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


# 辞書として最初の行を取得

print(result.first_item)

# 出力: {"number": 0, "str": "0"}


# 最初の行をタプルとして取得

print(result.first&#95;row)

# 出力: (0, &quot;0&quot;)

````

#### クライアント側パラメータを使用したクエリ {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 辞書パラメータの使用（printf スタイル）

query = "SELECT \* FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)


# タプルパラメータの利用

query = &quot;SELECT * FROM system.tables WHERE database = %s LIMIT %s&quot;
parameters = (&quot;system&quot;, 5)
result = client.query(query, parameters=parameters)

````

#### サーバー側パラメータを使用したクエリ {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# サーバーサイドバインディング（より安全で、SELECTクエリのパフォーマンスが向上）

query = "SELECT \* FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)

````

#### 設定を使用したクエリ {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# クエリと共にClickHouse設定を渡す

result = client.query(
"SELECT sum(number) FROM numbers(1000000)",
settings={
"max_block_size": 100000,
"max_execution_time": 30
}
)

```

### `QueryResult`オブジェクト {#the-queryresult-object}

基本的な`query`メソッドは、以下のパブリックプロパティを持つ`QueryResult`オブジェクトを返します:

- `result_rows` -- 行のシーケンス形式で返されるデータのマトリックスで、各行要素は列値のシーケンスです。
- `result_columns` -- 列のシーケンス形式で返されるデータのマトリックスで、各列要素はその列の行値のシーケンスです
- `column_names` -- `result_set`内の列名を表す文字列のタプル
- `column_types` -- `result_columns`内の各列のClickHouseデータ型を表すClickHouseTypeインスタンスのタプル
- `query_id` -- ClickHouseのquery_id(`system.query_log`テーブルでクエリを調査する際に有用)
- `summary` -- `X-ClickHouse-Summary` HTTPレスポンスヘッダーによって返されるデータ
- `first_item` -- レスポンスの最初の行を辞書として取得するための便利なプロパティ(キーは列名)
- `first_row` -- 結果の最初の行を返すための便利なプロパティ
- `column_block_stream` -- 列指向形式のクエリ結果のジェネレータ。このプロパティは直接参照すべきではありません(以下を参照)。
- `row_block_stream` -- 行指向形式のクエリ結果のジェネレータ。このプロパティは直接参照すべきではありません(以下を参照)。
- `rows_stream` -- 呼び出しごとに単一の行を生成するクエリ結果のジェネレータ。このプロパティは直接参照すべきではありません(以下を参照)。
- `summary` -- `command`メソッドで説明されているように、ClickHouseによって返されるサマリー情報の辞書

`*_stream`プロパティは、返されたデータのイテレータとして使用できるPython Contextを返します。これらはClientの`*_stream`メソッドを使用して間接的にのみアクセスすべきです。

ストリーミングクエリ結果の完全な詳細(StreamContextオブジェクトの使用)は、[高度なクエリ(ストリーミングクエリ)](advanced-querying.md#streaming-queries)で説明されています。

```


## NumPy、Pandas、Arrowでクエリ結果を利用する {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connectは、NumPy、Pandas、Arrowのデータ形式に対応した専用のクエリメソッドを提供します。これらのメソッドの使用方法、サンプルコード、ストリーミング機能、高度な型処理の詳細については、[高度なクエリ（NumPy、Pandas、Arrowクエリ）](advanced-querying.md#numpy-pandas-and-arrow-queries)を参照してください。


## クライアントストリーミングクエリメソッド {#client-streaming-query-methods}

大規模な結果セットをストリーミングする際、ClickHouse Connectは複数のストリーミングメソッドを提供します。詳細と例については、[高度なクエリ（ストリーミングクエリ）](advanced-querying.md#streaming-queries)を参照してください。


## クライアントの `insert` メソッド {#client-insert-method}

ClickHouseに複数のレコードを挿入する一般的なユースケースには、`Client.insert`メソッドがあります。このメソッドは以下のパラメータを受け取ります:

| パラメータ          | 型                              | デフォルト    | 説明                                                                                                                                                                                   |
| ------------------ | --------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table              | str                               | _必須_ | 挿入先のClickHouseテーブル。データベース名を含む完全なテーブル名を指定できます。                                                                                                   |
| data               | Sequence of Sequences             | _必須_ | 挿入するデータのマトリックス。行のシーケンス(各行は列値のシーケンス)、または列のシーケンス(各列は行値のシーケンス)のいずれかです。                   |
| column_names       | Sequence of str, or str           | '\*'       | データマトリックスの列名のリスト。'\*'を使用した場合、ClickHouse Connectはテーブルのすべての列名を取得するために「事前クエリ」を実行します。                         |
| database           | str                               | ''         | 挿入先のデータベース。指定されていない場合、クライアントのデータベースが使用されます。                                                                                             |
| column_types       | Sequence of ClickHouseType        | _None_     | ClickHouseTypeインスタンスのリスト。column_typesまたはcolumn_type_namesのいずれも指定されていない場合、ClickHouse Connectはテーブルのすべての列型を取得するために「事前クエリ」を実行します。  |
| column_type_names  | Sequence of ClickHouse type names | _None_     | ClickHouseデータ型名のリスト。column_typesまたはcolumn_type_namesのいずれも指定されていない場合、ClickHouse Connectはテーブルのすべての列型を取得するために「事前クエリ」を実行します。 |
| column_oriented    | bool                              | False      | Trueの場合、`data`引数は列のシーケンスとみなされます(データを挿入するために「ピボット」は不要です)。それ以外の場合、`data`は行のシーケンスとして解釈されます。             |
| settings           | dict                              | _None_     | [設定の説明](#settings-argument)を参照してください。                                                                                                                                               |
| context            | InsertContext                     | _None_     | 再利用可能なInsertContextオブジェクトを使用して、上記のメソッド引数をカプセル化できます。[高度な挿入(InsertContexts)](advanced-inserting.md#insertcontexts)を参照してください。                          |
| transport_settings | dict                              | _None_     | トランスポートレベルの設定(HTTPヘッダーなど)のオプション辞書。                                                                                                                          |

このメソッドは、「command」メソッドで説明されている「クエリサマリー」辞書を返します。何らかの理由で挿入が失敗した場合、例外が発生します。

Pandas DataFrame、PyArrow Table、およびArrowベースのDataFrameで動作する特殊な挿入メソッドについては、[高度な挿入(特殊な挿入メソッド)](advanced-inserting.md#specialized-insert-methods)を参照してください。

:::note
NumPy配列は有効なSequence of Sequencesであり、メインの`insert`メソッドの`data`引数として使用できるため、特殊なメソッドは必要ありません。
:::

### 例 {#examples}

以下の例では、スキーマ`(id UInt32, name String, age UInt8)`を持つ既存のテーブル`users`を前提としています。

#### 基本的な行指向の挿入 {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# 行指向データ: 各内側のリストが1行分のデータ

data = [
[1, &quot;Alice&quot;, 25],
[2, &quot;Bob&quot;, 30],
[3, &quot;Joe&quot;, 28],
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;])

````

#### カラム指向の挿入 {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 列指向データ: 各内側のリストが1つの列になる

data = [
[1, 2, 3],  # id 列
[&quot;Alice&quot;, &quot;Bob&quot;, &quot;Joe&quot;],  # name 列
[25, 30, 28],  # age 列
]

client.insert(&quot;users&quot;, data, column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;], column&#95;oriented=True)

````

#### 明示的な列型を使用した挿入 {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# サーバーへの DESCRIBE クエリを避けたい場合に便利

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


# 特定のデータベース内のテーブルへ挿入する

client.insert(
&quot;users&quot;,
data,
column&#95;names=[&quot;id&quot;, &quot;name&quot;, &quot;age&quot;],
database=&quot;production&quot;,
)

```
```


## ファイル挿入 {#file-inserts}

ファイルから直接ClickHouseテーブルへデータを挿入する方法については、[高度な挿入（ファイル挿入）](advanced-inserting.md#file-inserts)を参照してください。


## Raw API {#raw-api}

型変換なしでClickHouse HTTPインターフェースに直接アクセスする必要がある高度なユースケースについては、[高度な使用方法（Raw API）](advanced-usage.md#raw-api)を参照してください。


## ユーティリティクラスと関数 {#utility-classes-and-functions}

以下のクラスと関数も「パブリック」な`clickhouse-connect` APIの一部と見なされ、上記で文書化されたクラスやメソッドと同様に、マイナーリリース間で安定しています。これらのクラスと関数への破壊的変更は、マイナーリリース(パッチリリースではない)でのみ発生し、少なくとも1つのマイナーリリースの間は非推奨ステータスで提供されます。

### 例外 {#exceptions}

すべてのカスタム例外(DB API 2.0仕様で定義されているものを含む)は、`clickhouse_connect.driver.exceptions`モジュールで定義されています。ドライバーによって実際に検出される例外は、これらの型のいずれかが使用されます。

### ClickHouse SQLユーティリティ {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding`モジュールの関数とDT64Paramクラスを使用して、ClickHouse SQLクエリを適切に構築およびエスケープできます。同様に、`clickhouse_connect.driver.parser`モジュールの関数を使用して、ClickHouseデータ型名を解析できます。


## マルチスレッド、マルチプロセス、および非同期/イベント駆動型のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

マルチスレッド、マルチプロセス、および非同期/イベント駆動型アプリケーションでClickHouse Connectを使用する方法については、[高度な使用方法(マルチスレッド、マルチプロセス、および非同期/イベント駆動型のユースケース)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)を参照してください。


## AsyncClientラッパー {#asyncclient-wrapper}

asyncio環境でAsyncClientラッパーを使用する方法については、[高度な使用法（AsyncClientラッパー）](advanced-usage.md#asyncclient-wrapper)を参照してください。


## ClickHouseセッションIDの管理 {#managing-clickhouse-session-ids}

マルチスレッドまたは並行処理を行うアプリケーションでClickHouseセッションIDを管理する方法については、[高度な使用方法（ClickHouseセッションIDの管理）](advanced-usage.md#managing-clickhouse-session-ids)を参照してください。


## HTTP接続プールのカスタマイズ {#customizing-the-http-connection-pool}

大規模なマルチスレッドアプリケーションでHTTP接続プールをカスタマイズする方法については、[高度な使用方法（HTTP接続プールのカスタマイズ）](advanced-usage.md#customizing-the-http-connection-pool)を参照してください。
