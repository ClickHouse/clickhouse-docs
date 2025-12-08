---
sidebar_label: '高度な利用'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'ClickHouse Connect を使った高度な利用'
slug: /integrations/language-clients/python/advanced-usage
title: '高度な利用'
doc_type: 'reference'
---

# 高度な使い方 {#advanced-usage}

## Raw API {#raw-api}

ClickHouse データとネイティブまたはサードパーティのデータ型や構造との間で変換を行う必要がないユースケース向けに、ClickHouse Connect クライアントは ClickHouse 接続をそのまま利用するためのメソッドを提供します。

### Client `raw_query` メソッド {#client-rawquery-method}

`Client.raw_query` メソッドは、クライアント接続を使用して ClickHouse の HTTP クエリインターフェイスを直接利用できるようにします。戻り値は未処理の `bytes` オブジェクトです。パラメータバインディング、エラーハンドリング、リトライ、および設定管理を、最小限のインターフェイスで提供する便利なラッパーです。

| Parameter     | Type             | Default    | Description                                                                                                                                             |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | 任意の有効な ClickHouse クエリ                                                                                                                          |
| parameters    | dict or iterable | *None*     | [parameters の説明](driver-api.md#parameters-argument) を参照してください。                                                                                |
| settings      | dict             | *None*     | [settings の説明](driver-api.md#settings-argument) を参照してください。                                                                                    |
| fmt           | str              | *None*     | 結果として返されるバイト列に対する ClickHouse の出力フォーマットです（指定しない場合、ClickHouse は TSV を使用します）。                                     |
| use_database  | bool             | True       | クエリコンテキストとして、ClickHouse Connect クライアントで割り当てられたデータベースを使用します                                                          |
| external_data | ExternalData     | *None*     | クエリで使用するファイルまたはバイナリデータを含む ExternalData オブジェクト。[高度なクエリ (External Data)](advanced-querying.md#external-data) を参照してください |

呼び出し側は、返される `bytes` オブジェクトを適切に処理する責任があります。`Client.query_arrow` は、このメソッドに対して ClickHouse の `Arrow` 出力フォーマットを利用するだけの薄いラッパーであることに注意してください。

### Client `raw_stream` メソッド {#client-rawstream-method}

`Client.raw_stream` メソッドは `raw_query` メソッドと同じ API を持ちますが、`bytes` オブジェクトのジェネレーターやストリームのソースとして使用できる `io.IOBase` オブジェクトを返します。現在は `query_arrow_stream` メソッドで利用されています。

### クライアントの `raw_insert` メソッド {#client-rawinsert-method}

`Client.raw_insert` メソッドは、クライアント接続を使用して `bytes` オブジェクトまたは `bytes` オブジェクトのジェネレーターを直接挿入するためのものです。挿入ペイロードの処理を一切行わないため、非常に高いパフォーマンスを発揮します。このメソッドでは、設定および挿入フォーマットを指定するためのオプションを提供します。

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | シンプルなテーブル名、またはデータベース指定付きのテーブル名のいずれか                      |
| column_names | Sequence[str]                          | *None*     | 挿入ブロックのカラム名。`fmt` パラメータにカラム名が含まれていない場合は必須です            |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | 挿入するデータ。文字列はクライアントのエンコーディングでエンコードされます。               |
| settings     | dict                                   | *None*     | [設定の説明](driver-api.md#settings-argument) を参照してください。                          |
| fmt          | str                                    | *None*     | `insert_block` の bytes に対する ClickHouse の Input Format。（指定されていない場合、ClickHouse は TSV を使用します） |

指定されたフォーマットおよび圧縮方式に `insert_block` が従っていることを保証する責任は呼び出し側にあります。ClickHouse Connect は、ファイルアップロードや PyArrow Tables に対してこれらの `raw_insert` を使用し、パース処理を ClickHouse サーバーに委譲します。

## クエリ結果をファイルとして保存する {#saving-query-results-as-files}

`raw_stream` メソッドを使用すると、ClickHouse からローカルファイルシステムへファイルを直接ストリーミングできます。たとえば、クエリ結果を CSV ファイルとして保存する場合は、次のコードスニペットを使用します。

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

上記のコードを実行すると、以下の内容の `output.csv` ファイルが生成されます。

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、データを [TabSeparated](/interfaces/formats/TabSeparated) やその他の形式で保存することもできます。利用可能なすべてのフォーマットの概要については、[入力および出力データのフォーマット](/interfaces/formats) を参照してください。

## マルチスレッド、マルチプロセス、および非同期／イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect は、マルチスレッド、マルチプロセス、さらにイベントループ駆動／非同期アプリケーションでも良好に動作します。すべてのクエリおよび INSERT の処理は単一スレッド内で実行されるため、操作は一般的にスレッドセーフです。（一部の処理を低レベルで並列化し、単一スレッドであることに起因する性能上のペナルティを解消する将来的な拡張の可能性はありますが、その場合でもスレッドセーフであることは維持されます。）

それぞれのクエリまたは INSERT は、それぞれ固有の `QueryContext` または `InsertContext` オブジェクト内に状態を保持するため、これらのヘルパーオブジェクト自体はスレッドセーフではなく、複数の処理フロー間で共有すべきではありません。コンテキストオブジェクトについての詳細は、[QueryContexts](advanced-querying.md#querycontexts) および [InsertContexts](advanced-inserting.md#insertcontexts) のセクションを参照してください。

さらに、2 つ以上のクエリや INSERT が同時に実行中のアプリケーションでは、念頭に置くべき点が 2 つあります。1 つ目はクエリ／INSERT に関連付けられた ClickHouse の「セッション」であり、2 つ目は ClickHouse Connect クライアントインスタンスによって使用される HTTP 接続プールです。

## AsyncClient ラッパー {#asyncclient-wrapper}

ClickHouse Connect は通常の `Client` に対する非同期ラッパーを提供しており、`asyncio` 環境でクライアントを使用できるようにします。

`AsyncClient` インスタンスを取得するには、標準の `get_client` と同じパラメータを受け取るファクトリ関数 `get_async_client` を使用できます。

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

`AsyncClient` は、標準の `Client` と同一のメソッドおよびパラメータを持ちますが、該当する場合にはそれらがコルーチンになります。内部的には、`Client` のうち I/O 処理を行うメソッドは、[run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 呼び出しでラップされています。

`AsyncClient` ラッパーを使用すると、I/O 処理の完了待ちの間に実行スレッドおよび GIL が解放されるため、マルチスレッド時のパフォーマンスが向上します。

注意: 通常の `Client` と異なり、`AsyncClient` では `autogenerate_session_id` がデフォルトで `False` に強制されます。

関連項目: [run&#95;async の例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)。

## ClickHouse セッション ID の管理 {#managing-clickhouse-session-ids}

各 ClickHouse クエリは、ClickHouse の「セッション」コンテキスト内で実行されます。セッションは現在、次の 2 つの目的で使用されています。

* 複数のクエリに特定の ClickHouse 設定を関連付けるため（[ユーザー設定](/operations/settings/settings.md) を参照）。ClickHouse の `SET` コマンドは、ユーザーセッションのスコープ内で設定を変更するために使用されます。
* [一時テーブル](/sql-reference/statements/create/table#temporary-tables) を管理するため。

デフォルトでは、ClickHouse Connect の `Client` インスタンスで実行される各クエリは、そのクライアントのセッション ID を使用します。単一クライアントを使用する場合、`SET` 文や一時テーブルは期待どおりに動作します。ただし、ClickHouse サーバーは同一セッション内でのクエリの同時実行を許可しません（試みるとクライアント側で `ProgrammingError` が発生します）。クエリを同時実行するアプリケーションでは、次のいずれかのパターンを使用してください。

1. セッション分離が必要な各スレッド／プロセス／イベントハンドラごとに、個別の `Client` インスタンスを作成します。これにより、クライアントごとのセッション状態（一時テーブルおよび `SET` 値）が保持されます。
2. 共有セッション状態が不要な場合は、`query`、`command`、`insert` を呼び出す際に `settings` 引数を介して、クエリごとに一意の `session_id` を使用します。
3. クライアント作成前に `autogenerate_session_id=False` を設定する（または `get_client` に直接渡す）ことで、共有クライアントでセッション機能を無効化します。

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

または、`autogenerate_session_id=False` を直接 `get_client(...)` に渡します。

この場合、ClickHouse Connect は `session_id` を送信せず、サーバーは個々のリクエストを同じセッションに属するものとして扱いません。一時テーブルおよびセッションレベルの設定は、リクエスト間で保持されません。

## HTTP コネクションプールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connect は、サーバーへの下位レベルの HTTP 接続を処理するために `urllib3` のコネクションプールを使用します。デフォルトでは、すべてのクライアントインスタンスが同じコネクションプールを共有しており、これはほとんどのユースケースに対して十分です。このデフォルトプールは、アプリケーションで使用される各 ClickHouse サーバーごとに最大 8 個の HTTP Keep-Alive 接続を維持します。

大規模なマルチスレッドアプリケーションでは、個別のコネクションプールを用意した方が適切な場合があります。カスタマイズされたコネクションプールは、メインの `clickhouse_connect.get_client` 関数に `pool_mgr` キーワード引数として渡せます。

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例で示したように、複数のクライアントでプールマネージャーを共有することも、各クライアントごとに個別のプールマネージャーを作成することもできます。`PoolManager` を作成する際に利用可能なオプションの詳細については、[`urllib3` のドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。
