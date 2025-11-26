---
sidebar_label: '高度な使い方'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'ClickHouse Connect の高度な使い方'
slug: /integrations/language-clients/python/advanced-usage
title: '高度な使い方'
doc_type: 'reference'
---



# 高度な使い方 {#advanced-usage}



## Raw API {#raw-api}

ClickHouse のデータとネイティブまたはサードパーティ製のデータ型/構造との間で変換を必要としないユースケース向けに、ClickHouse Connect クライアントは ClickHouse への接続を直接利用するためのメソッドを提供します。

### Client `raw_query` method {#client-rawquery-method}

`Client.raw_query` メソッドは、クライアント接続を介して ClickHouse の HTTP クエリインターフェースを直接利用できるようにします。戻り値は未処理の `bytes` オブジェクトです。パラメータバインディング、エラー処理、リトライ、設定管理を、最小限のインターフェースで提供する便利なラッパーです。

| Parameter     | Type             | Default    | Description                                                                                                                                             |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | 任意の有効な ClickHouse クエリ                                                                                                                         |
| parameters    | dict or iterable | *None*     | [parameters description](driver-api.md#parameters-argument) を参照してください。                                                                        |
| settings      | dict             | *None*     | [settings description](driver-api.md#settings-argument) を参照してください。                                                                            |
| fmt           | str              | *None*     | 返却される bytes の ClickHouse Output Format。（指定されていない場合、ClickHouse は TSV を使用）                                                       |
| use_database  | bool             | True       | クエリコンテキストとして、ClickHouse Connect クライアントで指定されたデータベースを使用                                                                |
| external_data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。[Advanced Queries (External Data)](advanced-querying.md#external-data) を参照してください |

生成された `bytes` オブジェクトを処理する責任は呼び出し元にあります。`Client.query_arrow` は、ClickHouse の `Arrow` 出力フォーマットを用いてこのメソッドを呼び出す、薄いラッパーに過ぎない点に注意してください。

### Client `raw_stream` method {#client-rawstream-method}
`Client.raw_stream` メソッドは `raw_query` メソッドと同じ API を持ちますが、`bytes` オブジェクトのジェネレーター/ストリームソースとして利用できる `io.IOBase` オブジェクトを返します。現在は `query_arrow_stream` メソッドによって利用されています。

### Client `raw_insert` method {#client-rawinsert-method}

`Client.raw_insert` メソッドは、クライアント接続を使用して `bytes` オブジェクトまたは `bytes` オブジェクトのジェネレーターを直接挿入できるようにします。挿入ペイロードの処理を行わないため、非常に高いパフォーマンスを発揮します。このメソッドは、設定および挿入フォーマットを指定するためのオプションを提供します。

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | シンプルなテーブル名またはデータベース修飾されたテーブル名のいずれか                                                         |
| column_names | Sequence[str]                          | *None*     | 挿入ブロックのカラム名。`fmt` パラメータにカラム名が含まれない場合は必須                                                       |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | 挿入するデータ。文字列はクライアントのエンコーディングでエンコードされます。                                                  |
| settings     | dict                                   | *None*     | [settings description](driver-api.md#settings-argument) を参照してください。                                                    |
| fmt          | str                                    | *None*     | `insert_block` bytes の ClickHouse Input Format。（指定されていない場合、ClickHouse は TSV を使用）                           |

`insert_block` が指定されたフォーマットおよび圧縮方式を使用していることを保証する責任は呼び出し元にあります。ClickHouse Connect は、ファイルアップロードおよび PyArrow テーブルに対してこれらの raw insert を使用し、パース処理を ClickHouse サーバーに委譲します。



## クエリ結果をファイルとして保存する

`raw_stream` メソッドを使用すると、ClickHouse からローカルのファイルシステムへ直接ファイルをストリーミングできます。たとえば、クエリ結果を CSV ファイルとして保存したい場合は、次のコードスニペットを使用します。

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

上記のコードにより、内容が次のような `output.csv` ファイルが生成されます。

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats/TabSeparated) やその他の形式でデータを保存できます。利用可能なすべての形式の概要については、[入力および出力データ用フォーマット](/interfaces/formats) を参照してください。


## マルチスレッド、マルチプロセス、および非同期／イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect は、マルチスレッド、マルチプロセス、およびイベントループ駆動／非同期アプリケーションで問題なく動作します。すべてのクエリおよび挿入処理は単一スレッド内で実行されるため、一般的に操作はスレッドセーフです。（一部の処理を低レベルで並列化し、単一スレッドによるパフォーマンス上の制約を克服する将来的な拡張の可能性はありますが、その場合でもスレッドセーフ性は維持されます。）

各クエリまたは挿入は、それぞれ独自の `QueryContext` または `InsertContext` オブジェクト内に状態を保持するため、これらのヘルパーオブジェクト自体はスレッドセーフではなく、複数の処理ストリーム間で共有すべきではありません。コンテキストオブジェクトに関する詳細については、[QueryContexts](advanced-querying.md#querycontexts) および [InsertContexts](advanced-inserting.md#insertcontexts) の各セクションを参照してください。

さらに、同時に 2 つ以上のクエリや挿入が「実行中（in flight）」となるアプリケーションでは、考慮すべき点がさらに 2 つあります。1 つ目はクエリ／挿入に関連付けられた ClickHouse の「セッション」であり、2 つ目は ClickHouse Connect クライアントインスタンスによって使用される HTTP コネクションプールです。



## AsyncClient ラッパー

ClickHouse Connect は通常の `Client` 向けの非同期ラッパーを提供しており、`asyncio` 環境でクライアントを使用できるようにします。

`AsyncClient` のインスタンスを取得するには、`get_async_client` ファクトリ関数を使用します。この関数は標準の `get_client` と同じパラメータを受け取ります。

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # 出力:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient` は標準の `Client` と同じメソッドを同じ引数で提供しますが、該当するものはコルーチンとして実装されています。内部的には、`Client` において I/O 処理を行うこれらのメソッドは、[run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 呼び出しでラップされています。

`AsyncClient` ラッパーを使用すると、I/O 処理の完了待機中に実行スレッドと GIL が解放されるため、マルチスレッド時のパフォーマンスが向上します。

注意: 通常の `Client` と異なり、`AsyncClient` では `autogenerate_session_id` はデフォルトで `False` に強制されます。

関連項目: [run&#95;async example](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。


## ClickHouse セッション ID の管理

各 ClickHouse クエリは、ClickHouse の「セッション」のコンテキスト内で実行されます。セッションは現在、次の 2 つの目的で使用されています。

* 複数のクエリに対して特定の ClickHouse 設定を関連付けるため（[ユーザー設定](/operations/settings/settings.md) を参照）。ユーザーセッションのスコープ内で設定を変更するには、ClickHouse の `SET` コマンドを使用します。
* [一時テーブル](/sql-reference/statements/create/table#temporary-tables) を追跡するため。

デフォルトでは、ClickHouse Connect の `Client` インスタンスで実行される各クエリは、そのクライアントのセッション ID を使用します。単一のクライアントを使用している場合、`SET` ステートメントと一時テーブルは期待どおりに動作します。ただし、ClickHouse サーバーは同一セッション内でのクエリの同時実行を許可しません（試行するとクライアント側で `ProgrammingError` が発生します）。クエリを並行実行するアプリケーションでは、次のいずれかのパターンを使用してください。

1. セッション分離が必要なスレッド／プロセス／イベントハンドラーごとに、個別の `Client` インスタンスを作成します。これにより、クライアントごとのセッション状態（一時テーブルおよび `SET` の値）が保持されます。
2. 共有セッション状態が不要な場合は、`query`、`command`、または `insert` を呼び出すときに、`settings` 引数経由でクエリごとに一意の `session_id` を使用します。
3. クライアント作成前に `autogenerate_session_id=False` を設定する（または `get_client` に直接渡す）ことで、共有クライアントでセッションを無効にします。

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # クライアント作成前に必ず設定してください
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

別の方法として、`autogenerate_session_id=False` を直接 `get_client(...)` に渡します。

この場合、ClickHouse Connect は `session_id` を送信せず、サーバーは個々のリクエストを同じセッションに属するものとして扱いません。一時テーブルやセッションレベルの設定は、リクエスト間で保持されません。


## HTTP 接続プールのカスタマイズ

ClickHouse Connect は、サーバーへの下位レベルの HTTP 接続を処理するために `urllib3` の接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスは同じ接続プールを共有し、これはほとんどのユースケースには十分です。このデフォルトプールは、アプリケーションで使用される各 ClickHouse サーバーに対して最大 8 個の HTTP Keep-Alive 接続を維持します。

大規模なマルチスレッドアプリケーションでは、個別の接続プールを用意した方がよい場合があります。カスタマイズした接続プールは、メインの `clickhouse_connect.get_client` 関数に `pool_mgr` キーワード引数として渡すことができます。

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例が示すように、クライアント間でプールマネージャーを共有することも、各クライアントごとに個別のプールマネージャーを作成することもできます。PoolManager 作成時に指定可能なオプションの詳細については、[`urllib3` のドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。
