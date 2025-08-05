---
description: 'Documentation for Kill'
sidebar_label: 'KILL'
sidebar_position: 46
slug: '/sql-reference/statements/kill'
title: 'KILL Statements'
---



There are two kinds of kill statements: to kill a query and to kill a mutation

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制的に終了しようとします。
終了するクエリは、`KILL` クエリの `WHERE` 句で定義された条件を使用して、system.processes テーブルから選択されます。

例:

まず、不完全なクエリのリストを取得する必要があります。この SQL クエリは、最も長く実行されているものに基づいてそれらを提供します：

単一の ClickHouse ノードのリスト:
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

ClickHouse クラスターのリスト:
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

クエリを終了する:
```sql
-- 指定された query_id を持つすべてのクエリを強制終了します:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username' によって実行されたすべてのクエリを同期的に終了します:
KILL QUERY WHERE user='username' SYNC
```

:::tip 
ClickHouse Cloud またはセルフマネージド クラスターでクエリを終了する場合は、すべてのレプリカでクエリが終了することを保証するために、```ON CLUSTER [cluster-name]```オプションを使用してください。
:::

読み取り専用ユーザーは自分のクエリのみを停止できます。

デフォルトでは、クエリの非同期バージョンが使用されます（`ASYNC`）、これはクエリが停止したことの確認を待ちません。

同期バージョン（`SYNC`）は、すべてのクエリが停止するまで待機し、停止する各プロセスに関する情報を表示します。
レスポンスには `kill_status` 列が含まれており、以下の値を取ることができます:

1.  `finished` – クエリは正常に終了しました。
2.  `waiting` – クエリの終了を信号を送信した後に待機中です。
3.  その他の値は、クエリを停止できない理由を説明します。

テストクエリ（`TEST`）は、ユーザーの権利のみを確認し、停止するクエリのリストを表示します。

## KILL MUTATION {#kill-mutation}

長時間実行中または不完全なミューテーションの存在は、ClickHouse サービスが正常に動作していないことを示すことがよくあります。ミューテーションの非同期性は、それらがシステム上のすべてのリソースを消費する原因となることがあります。次のいずれかを行う必要があります:

- 新しいミューテーション、`INSERT`、および `SELECT` をすべて一時停止し、ミューテーションのキューが完了するのを許可します。
- または、`KILL` コマンドを送信して、これらのミューテーションのいくつかを手動で終了します。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

現在実行中の [ミューテーション](/sql-reference/statements/alter#mutations) をキャンセルおよび削除しようとします。キャンセルするミューテーションは、`KILL` クエリの `WHERE` 句で指定されたフィルターを使用して [`system.mutations`](/operations/system-tables/mutations) テーブルから選択されます。

テストクエリ (`TEST`) はユーザーの権利のみを確認し、停止すべきミューテーションのリストを表示します。

例:

不完全なミューテーションの数を `count()` で取得します:

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

必要なミューテーションを終了します：
```sql
-- 単一テーブルのすべてのミューテーションをキャンセルおよび削除します:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセルします:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

ミューテーションがスタックしていて完了できない場合（たとえば、ミューテーションクエリ内のいくつかの関数がテーブルに含まれるデータに適用されるときに例外をスローする場合）、このクエリは便利です。

ミューテーションによってすでに行われた変更はロールバックされません。

:::note 
`is_killed=1` 列（ClickHouse Cloud のみ）では、[system.mutations](/operations/system-tables/mutations) テーブルにミューテーションが完全に確定したことを必ずしも意味しません。`is_killed=1` と `is_done=0` の状態のまま長期間残るミューテーションが存在する可能性があります。これは、別の長時間実行中のミューテーションが終了されるミューテーションをブロックしている場合に発生することがあります。これは正常な状況です。
:::
