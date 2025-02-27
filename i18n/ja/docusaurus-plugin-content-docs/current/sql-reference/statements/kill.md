---
slug: /sql-reference/statements/kill
sidebar_position: 46
sidebar_label: KILL
title: "KILL ステートメント"
---

KILL ステートメントには、クエリを停止するためのものとミューテーションを停止するためのものの2種類があります。

## KILL QUERY {#kill-query}

``` sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <system.processes クエリから SELECT するための where 式>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制的に終了しようとします。
終了対象のクエリは、`KILL` クエリの `WHERE` 句で定義された条件を使用して、system.processes テーブルから選択されます。

例:

まず、未完了のクエリのリストを取得する必要があります。この SQL クエリは、最も長く実行されているものに基づいて提供します。

単一の ClickHouse ノードからのリスト:
``` sql
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

ClickHouse クラスターからのリスト:
``` sql
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

クエリを終了する:
``` sql
-- 指定された query_id のすべてのクエリを強制終了します:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username' によって実行されたすべてのクエリを同期的に終了します:
KILL QUERY WHERE user='username' SYNC
```

:::tip 
ClickHouse Cloud またはセルフマネージドクラスターでクエリを終了する場合は、```ON CLUSTER [cluster-name]``` オプションを必ず使用して、すべてのレプリカでクエリが終了されることを保証してください。
:::

読み取り専用ユーザーは、自己のクエリのみを停止できます。

デフォルトでは、クエリの非同期バージョンが使用され (`ASYNC`)、クエリが停止したという確認を待ちません。

同期バージョン (`SYNC`) は、すべてのクエリが停止するのを待ち、停止する各プロセスの情報を表示します。
応答には `kill_status` 列が含まれ、次の値を取ることができます：

1.  `finished` – クエリは正常に終了しました。
2.  `waiting` – 終了信号を送信した後、クエリが終了するのを待っています。
3.  その他の値は、なぜクエリが停止できないのかを説明しています。

テストクエリ (`TEST`) は、ユーザーの権利を確認するだけで、停止するクエリのリストを表示します。

## KILL MUTATION {#kill-mutation}

長時間実行中または未完了のミューテーションが存在することは、ClickHouse サービスが正常に動作していないことを示すことがよくあります。ミューテーションの非同期性により、すべてのリソースを消費する可能性があります。次のいずれかを行う必要があります： 

- 新しいミューテーション、`INSERT`、および `SELECT` を一時停止し、ミューテーションのキューが完了するのを待ちます。
- または、`KILL` コマンドを送信して手動でこれらのミューテーションのいくつかを停止します。

``` sql
KILL MUTATION
  WHERE <system.mutations クエリから SELECT するための where 式>
  [TEST]
  [FORMAT format]
```

現在実行中のミューテーションをキャンセルして削除しようとします。キャンセルするミューテーションは、`KILL` クエリの `WHERE` 句で指定したフィルターを使用して [`system.mutations`](../../operations/system-tables/mutations.md#system_tables-mutations) テーブルから選択されます。

テストクエリ (`TEST`) は、ユーザーの権利を確認するだけで、停止するミューテーションのリストを表示します。

例:

未完了のミューテーションの数を `count()` で取得します。

単一の ClickHouse ノードからのミューテーションのカウント:
``` sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

レプリカの ClickHouse クラスターからのミューテーションのカウント:
``` sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

未完了のミューテーションのリストを照会します：

単一の ClickHouse ノードからのミューテーションのリスト:
``` sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse クラスターからのミューテーションのリスト:
``` sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを終了します：
``` sql
-- 単一のテーブルのすべてのミューテーションをキャンセルして削除します:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセルします:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

ミューテーションが詰まっていて終了できない場合に便利です（例：ミューテーションクエリ内の関数が、テーブル内のデータに適用されると例外をスローする場合）。

ミューテーションによってすでに行われた変更はロールバックされません。

:::note 
`is_killed=1` 列（ClickHouse Cloud のみ）は、[system.mutations](/operations/system-tables/mutations) テーブル内で、ミューテーションが完全に最終化されていることを意味しません。ミューテーションが `is_killed=1` かつ `is_done=0` の状態に長期間留まることは可能です。これは、別の長時間実行中のミューテーションがキャンセルされたミューテーションをブロックしている場合に発生することがあります。これは正常な状況です。
:::
