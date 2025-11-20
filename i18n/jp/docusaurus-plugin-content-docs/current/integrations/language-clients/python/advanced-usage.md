---
sidebar_label: '高度な使い方'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'ClickHouse Connect の高度な使い方'
slug: /integrations/language-clients/python/advanced-usage
title: '高度な使い方'
doc_type: 'reference'
---



# 高度な使用方法 {#advanced-usage}


## Raw API {#raw-api}

ClickHouseのデータとネイティブまたはサードパーティのデータ型や構造との間で変換が不要なユースケースの場合、ClickHouse ConnectクライアントはClickHouse接続を直接使用するためのメソッドを提供します。

### Client `raw_query` メソッド {#client-rawquery-method}

`Client.raw_query`メソッドは、クライアント接続を使用してClickHouse HTTPクエリインターフェースを直接利用できます。戻り値は未処理の`bytes`オブジェクトです。このメソッドは、最小限のインターフェースでパラメータバインディング、エラー処理、リトライ、設定管理を備えた便利なラッパーを提供します:

| Parameter     | Type             | Default    | Description                                                                                                                                             |
| ------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query         | str              | _必須_ | 任意の有効なClickHouseクエリ                                                                                                                              |
| parameters    | dict or iterable | _None_     | [パラメータの説明](driver-api.md#parameters-argument)を参照してください。                                                                                        |
| settings      | dict             | _None_     | [設定の説明](driver-api.md#settings-argument)を参照してください。                                                                                            |
| fmt           | str              | _None_     | 結果のバイト列に対するClickHouse出力フォーマット。(指定されていない場合、ClickHouseはTSVを使用します)                                                                |
| use_database  | bool             | True       | クエリコンテキストにClickHouse Connectクライアントが割り当てたデータベースを使用します                                                                               |
| external_data | ExternalData     | _None_     | クエリで使用するファイルまたはバイナリデータを含むExternalDataオブジェクト。[高度なクエリ(外部データ)](advanced-querying.md#external-data)を参照してください |

結果の`bytes`オブジェクトの処理は呼び出し側の責任です。なお、`Client.query_arrow`は、ClickHouseの`Arrow`出力フォーマットを使用したこのメソッドの薄いラッパーです。

### Client `raw_stream` メソッド {#client-rawstream-method}

`Client.raw_stream`メソッドは`raw_query`メソッドと同じAPIを持ちますが、`bytes`オブジェクトのジェネレータ/ストリームソースとして使用できる`io.IOBase`オブジェクトを返します。現在、`query_arrow_stream`メソッドで利用されています。

### Client `raw_insert` メソッド {#client-rawinsert-method}

`Client.raw_insert`メソッドは、クライアント接続を使用して`bytes`オブジェクトまたは`bytes`オブジェクトジェネレータを直接挿入できます。挿入ペイロードの処理を行わないため、非常に高性能です。このメソッドは、設定と挿入フォーマットを指定するオプションを提供します:

| Parameter    | Type                                   | Default    | Description                                                                                 |
| ------------ | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| table        | str                                    | _必須_ | シンプルなテーブル名またはデータベース修飾されたテーブル名                                          |
| column_names | Sequence[str]                          | _None_     | 挿入ブロックのカラム名。`fmt`パラメータに名前が含まれていない場合は必須です   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | _必須_ | 挿入するデータ。文字列はクライアントのエンコーディングでエンコードされます。                           |
| settings     | dict                                   | _None_     | [設定の説明](driver-api.md#settings-argument)を参照してください。                                |
| fmt          | str                                    | _None_     | `insert_block`バイト列のClickHouse入力フォーマット。(指定されていない場合、ClickHouseはTSVを使用します) |

`insert_block`が指定されたフォーマットであり、指定された圧縮方法を使用していることを確認するのは呼び出し側の責任です。ClickHouse Connectは、ファイルアップロードやPyArrow Tablesにこれらのraw insertを使用し、解析をClickHouseサーバーに委任します。


## クエリ結果をファイルとして保存する {#saving-query-results-as-files}

`raw_stream`メソッドを使用すると、ClickHouseからローカルファイルシステムへ直接ファイルをストリーミングできます。例えば、クエリ結果をCSVファイルに保存する場合は、以下のコードスニペットを使用します:

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

上記のコードを実行すると、以下の内容を持つ`output.csv`ファイルが生成されます:

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

同様に、[TabSeparated](/interfaces/formats/TabSeparated)やその他の形式でデータを保存することもできます。利用可能なすべての形式オプションの概要については、[入出力データの形式](/interfaces/formats)を参照してください。


## マルチスレッド、マルチプロセス、および非同期/イベント駆動のユースケース {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connectは、マルチスレッド、マルチプロセス、およびイベントループ駆動/非同期アプリケーションで問題なく動作します。すべてのクエリと挿入処理は単一スレッド内で実行されるため、操作は基本的にスレッドセーフです。(低レベルでの一部の操作の並列処理は、単一スレッドによるパフォーマンス低下を克服するための将来的な機能強化の可能性がありますが、その場合でもスレッドセーフ性は維持されます。)

実行される各クエリまたは挿入は、それぞれ独自の`QueryContext`または`InsertContext`オブジェクトで状態を保持するため、これらのヘルパーオブジェクトはスレッドセーフではなく、複数の処理ストリーム間で共有してはいけません。コンテキストオブジェクトに関する詳細については、[QueryContexts](advanced-querying.md#querycontexts)および[InsertContexts](advanced-inserting.md#insertcontexts)のセクションを参照してください。

さらに、同時に2つ以上のクエリや挿入が「実行中」の状態にあるアプリケーションでは、留意すべき2つの追加の考慮事項があります。1つ目はクエリ/挿入に関連付けられたClickHouseの「セッション」であり、2つ目はClickHouse Connectクライアントインスタンスが使用するHTTP接続プールです。


## AsyncClientラッパー {#asyncclient-wrapper}

ClickHouse Connectは、通常の`Client`に対する非同期ラッパーを提供しており、`asyncio`環境でクライアントを使用できます。

`AsyncClient`のインスタンスを取得するには、標準の`get_client`と同じパラメータを受け取る`get_async_client`ファクトリ関数を使用します。

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

`AsyncClient`は、標準の`Client`と同じメソッドと同じパラメータを持ちますが、該当する場合はコルーチンになります。内部的には、I/O操作を実行する`Client`のこれらのメソッドは、[run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor)呼び出しでラップされています。

`AsyncClient`ラッパーを使用すると、I/O操作の完了を待機している間に実行スレッドとGILが解放されるため、マルチスレッドのパフォーマンスが向上します。

注意: 通常の`Client`とは異なり、`AsyncClient`はデフォルトで`autogenerate_session_id`を`False`に設定します。

参照: [run_asyncの例](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py)


## ClickHouseセッションIDの管理 {#managing-clickhouse-session-ids}

各ClickHouseクエリは、ClickHouseの「セッション」のコンテキスト内で実行されます。セッションは現在、以下の2つの目的で使用されています。

- 特定のClickHouse設定を複数のクエリに関連付けるため([ユーザー設定](/operations/settings/settings.md)を参照)。ClickHouseの`SET`コマンドは、ユーザーセッションのスコープ内で設定を変更するために使用されます。
- [一時テーブル](/sql-reference/statements/create/table#temporary-tables)を追跡するため。

デフォルトでは、ClickHouse Connectの`Client`インスタンスで実行される各クエリは、そのクライアントのセッションIDを使用します。単一のクライアントを使用する場合、`SET`ステートメントと一時テーブルは期待通りに動作します。ただし、ClickHouseサーバーは同じセッション内での同時クエリを許可しません(試行するとクライアントは`ProgrammingError`を発生させます)。同時クエリを実行するアプリケーションの場合は、以下のいずれかのパターンを使用してください。

1. セッション分離が必要な各スレッド/プロセス/イベントハンドラに対して、個別の`Client`インスタンスを作成します。これにより、クライアントごとのセッション状態(一時テーブルと`SET`値)が保持されます。
2. 共有セッション状態が不要な場合は、`query`、`command`、または`insert`を呼び出す際に、`settings`引数を介して各クエリに一意の`session_id`を使用します。
3. クライアントを作成する前に`autogenerate_session_id=False`を設定することで、共有クライアントのセッションを無効にします(または`get_client`に直接渡します)。

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # クライアントを作成する前に必ず設定してください
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

または、`get_client(...)`に直接`autogenerate_session_id=False`を渡します。

この場合、ClickHouse Connectは`session_id`を送信しません。サーバーは個別のリクエストを同じセッションに属するものとして扱いません。一時テーブルとセッションレベルの設定は、リクエスト間で保持されません。


## HTTP接続プールのカスタマイズ {#customizing-the-http-connection-pool}

ClickHouse Connectは、サーバーへの基盤となるHTTP接続を処理するために`urllib3`接続プールを使用します。デフォルトでは、すべてのクライアントインスタンスが同じ接続プールを共有しており、これは大半のユースケースで十分です。このデフォルトプールは、アプリケーションが使用する各ClickHouseサーバーに対して最大8つのHTTP Keep Alive接続を維持します。

大規模なマルチスレッドアプリケーションの場合、個別の接続プールが適切な場合があります。カスタマイズされた接続プールは、メインの`clickhouse_connect.get_client`関数に`pool_mgr`キーワード引数として指定できます:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

上記の例で示されているように、クライアントはプールマネージャーを共有することも、各クライアントに対して個別のプールマネージャーを作成することもできます。PoolManagerを作成する際に利用可能なオプションの詳細については、[`urllib3`ドキュメント](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)を参照してください。
