---
'description': 'Kill に関するドキュメント'
'sidebar_label': 'KILL'
'sidebar_position': 46
'slug': '/sql-reference/statements/kill'
'title': 'KILL 文'
'doc_type': 'reference'
---

There are two kinds of kill statements: to kill a query and to kill a mutation

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制終了しようとします。
終了するクエリは、`KILL` クエリの `WHERE` 句で定義された基準を使用して、system.processes テーブルから選択されます。

例:

最初に、不完全なクエリのリストを取得する必要があります。この SQL クエリは、最も長く実行されているものに基づいて提供されます：

単一の ClickHouse ノードからのリスト：
```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM system.processes
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

ClickHouse クラスターからのリスト：
```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM clusterAllReplicas(default, system.processes)
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

クエリを終了する：
```sql
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
ClickHouse Cloud またはセルフマネージドクラスタでクエリを終了する場合は、```
ON CLUSTER [cluster-name]
```オプションを使用して、すべてのレプリカでクエリが終了されることを確認してください。
:::

読み取り専用ユーザーは、自分のクエリのみを停止できます。

デフォルトでは、確認を待たない非同期バージョンのクエリが使用されます（`ASYNC`）。

同期バージョン（`SYNC`）は、すべてのクエリが停止するのを待ち、各プロセスが停止する際の情報を表示します。
レスポンスには、次の値を取ることができる`kill_status`カラムが含まれています：

1.  `finished` – クエリが正常に終了しました。
2.  `waiting` – 終了信号を送信した後、クエリの終了を待機しています。
3.  他の値は、クエリを停止できない理由を説明します。

テストクエリ（`TEST`）は、ユーザーの権限をチェックするだけで、停止するクエリのリストを表示します。

## KILL MUTATION {#kill-mutation}

長時間実行されているか不完全なミューテーションの存在は、ClickHouse サービスが適切に動作していないことを示すことがよくあります。ミューテーションの非同期性は、システム上のすべての利用可能なリソースを消費する可能性があります。次のいずれかを行う必要があります：

- すべての新しいミューテーション、`INSERT`、および `SELECT` を一時停止し、ミューテーションのキューが完了するのを待ちます。
- または、`KILL` コマンドを送信して、これらのミューテーションのいくつかを手動で終了します。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

現在実行中の[ミューテーション](/sql-reference/statements/alter#mutations)をキャンセルして削除しようとします。キャンセルするミューテーションは、`KILL` クエリの `WHERE` 句で指定されたフィルタを使用して、[`system.mutations`](/operations/system-tables/mutations) テーブルから選択されます。

テストクエリ（`TEST`）は、ユーザーの権限を確認するだけで、停止するミューテーションのリストを表示します。

例:

不完全なミューテーションの数を取得する `count()`：

単一の ClickHouse ノードからのミューテーションの数：
```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

レプリカの ClickHouse クラスターからのミューテーションの数：
```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

不完全なミューテーションのリストをクエリします：

単一の ClickHouse ノードからのミューテーションのリスト：
```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse クラスターからのミューテーションのリスト：
```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを終了します：
```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

ミューテーションがスタックしていて完了できない場合に役立つクエリです（例えば、ミューテーションクエリ内の関数がテーブルに含まれるデータに適用されたときに例外をスローする場合など）。

ミューテーションによって既に行われた変更は元に戻されません。

:::note 
`is_killed=1` カラム（ClickHouse Cloud のみ）は、[system.mutations](/operations/system-tables/mutations) テーブルにおいて、ミューテーションが完全に終了したことを必ずしも意味しません。`is_killed=1` で、`is_done=0` の状態が長時間続くことがあります。これは、別の長時間実行中のミューテーションが殺されたミューテーションをブロックしている場合に発生します。これは通常の状況です。
:::
