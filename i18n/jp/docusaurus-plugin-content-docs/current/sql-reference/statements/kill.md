---
slug: '/sql-reference/statements/kill'
sidebar_position: 46
sidebar_label: 'KILL'
title: 'KILL Statements'
---

KILL ステートメントには、クエリを停止するためのものとミューテーションを停止するためのものの 2 種類があります。

## KILL QUERY {#kill-query}

``` sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制的に終了しようとします。
終了するクエリは、`KILL` クエリの `WHERE` 句で定義された基準を使用して system.processes テーブルから選択されます。

例：

まず、不完全なクエリのリストを取得する必要があります。この SQL クエリは、実行時間が最も長いものに基づいてそれらを提供します。

単一の ClickHouse ノードからのリスト：
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

ClickHouse クラスターからのリスト：
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

クエリを停止する：
``` sql
-- 指定された query_id を持つすべてのクエリを強制終了します：
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username' によって実行されたすべてのクエリを同期的に終了します：
KILL QUERY WHERE user='username' SYNC
```

:::tip
ClickHouse Cloud またはセルフマネージドクラスターでクエリを停止している場合は、すべてのレプリカでクエリが停止されるように、```ON CLUSTER [cluster-name]``` オプションを必ず使用してください。
:::

読み取り専用ユーザーは自分自身のクエリのみを停止できます。

デフォルトでは、クエリの非同期バージョンが使用されます (`ASYNC`)、これはクエリが停止したとの確認を待ちません。

同期バージョン (`SYNC`) はすべてのクエリが停止するのを待ち、停止するたびに各プロセスに関する情報を表示します。
応答には、以下の値を取ることができる `kill_status` カラムが含まれます：

1.  `finished` - クエリが正常に終了しました。
2.  `waiting` - 終了するようにシグナルを送信した後、クエリが終了するのを待っています。
3.  その他の値は、クエリを停止できない理由を説明します。

テストクエリ (`TEST`) は、ユーザーの権利を確認するだけで、停止するクエリのリストを表示します。

## KILL MUTATION {#kill-mutation}

長時間実行中または不完全なミューテーションの存在は、ClickHouse サービスがうまく動作していないことを示していることがよくあります。ミューテーションの非同期的な性質は、それらがシステム上のすべての利用可能なリソースを消費する原因になります。次のいずれかを行う必要があるかもしれません：

- すべての新しいミューテーション、`INSERT`、および `SELECT` を一時停止し、ミューテーションのキューが完了するのを待つ。
- または、`KILL` コマンドを送信して、これらのミューテーションの一部を手動で終了する。

``` sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

現在実行中の [ミューテーション](/sql-reference/statements/alter#mutations) をキャンセルし削除しようとします。キャンセルするミューテーションは、`KILL` クエリの `WHERE` 句で指定されたフィルタを使用して [`system.mutations`](/operations/system-tables/mutations) テーブルから選択されます。

テストクエリ (`TEST`) は、ユーザーの権利を確認するだけで、停止するミューテーションのリストを表示します。

例：

不完全なミューテーションの数を `count()` で取得：

単一の ClickHouse ノードのミューテーションの数：
``` sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse レプリカのクラスターからのミューテーションの数：
``` sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

不完全なミューテーションのリストを問い合わせる：

単一の ClickHouse ノードからのミューテーションのリスト：
``` sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse クラスターからのミューテーションのリスト：
``` sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを停止する：
``` sql
-- 単一のテーブルのすべてのミューテーションをキャンセルして削除します：
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセル：
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

ミューテーションが停止していて完了できない場合に、このクエリは便利です（例：ミューテーションクエリ内のいくつかの関数がテーブル内のデータに適用されたときに例外をスローする場合）。

ミューテーションによって既に行われた変更は、ロールバックされません。

:::note
`is_killed=1` カラム（ClickHouse Cloud のみ）は、[system.mutations](/operations/system-tables/mutations) テーブルにおいて、そのミューテーションが完全に最終化されたことを必ずしも意味しません。ミューテーションが `is_killed=1` であり、`is_done=0` の状態に長時間留まる可能性があります。これは、別の長時間実行中のミューテーションが、停止されたミューテーションをブロックしている場合に発生する可能性があります。これは通常の状況です。
:::
