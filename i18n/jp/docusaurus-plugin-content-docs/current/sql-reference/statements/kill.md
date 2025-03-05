---
slug: /sql-reference/statements/kill
sidebar_position: 46
sidebar_label: KILL
title: "KILLステートメント"
---

KILLステートメントには2種類あり、クエリを終了させるものとミューテーションを終了させるものがあります。

## KILL QUERY {#kill-query}

``` sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <system.processes クエリから選択するための where 式>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制的に終了しようとします。
終了するクエリは、`KILL`クエリの`WHERE`句で定義された基準を使用して`system.processes`テーブルから選択されます。

例:

最初に、未完了のクエリのリストを取得する必要があります。このSQLクエリは、最も長く実行されているクエリを提供します。

単一のClickHouseノードからのリスト:
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

ClickHouseクラスタからのリスト:
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

クエリを終了させる:
``` sql
-- 指定されたquery_idを持つすべてのクエリを強制的に終了:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username'によって実行されるすべてのクエリを同期的に終了:
KILL QUERY WHERE user='username' SYNC
```

:::tip 
ClickHouse Cloudまたはセルフマネージドクラスタでクエリを終了させる場合は、すべてのレプリカでクエリが終了することを保証するために、```ON CLUSTER [cluster-name]```オプションを使用してください。
:::

読み取り専用ユーザーは、自分のクエリのみを停止できます。

デフォルトでは、非同期バージョンのクエリが使用されます（`ASYNC`）、これはクエリが停止したとの確認を待機しません。

同期バージョン（`SYNC`）は、すべてのクエリが停止するのを待ち、停止する各プロセスに関する情報を表示します。
応答には`kill_status`列が含まれ、以下の値を取ることができます:

1.  `finished` – クエリは正常に終了しました。
2.  `waiting` – 終了する信号を送った後、クエリが終了するのを待っています。
3.  他の値は、クエリが停止できない理由を説明します。

テストクエリ（`TEST`）はユーザーの権利の確認のみを行い、停止可能なクエリのリストを表示します。

## KILL MUTATION {#kill-mutation}

長時間実行中または未完了のミューテーションの存在は、ClickHouseサービスが正常に動作していないことを示していることがよくあります。ミューテーションの非同期の性質により、システム上の利用可能なすべてのリソースを消費する可能性があります。次のいずれかを行う必要があります:

- すべての新しいミューテーション、`INSERT`、および`SELECT`を一時停止し、ミューテーションのキューを完了させる。
- もしくは、`KILL`コマンドを送信して一部のミューテーションを手動で終了させる。

``` sql
KILL MUTATION
  WHERE <system.mutationsクエリから選択するためのwhere式>
  [TEST]
  [FORMAT format]
```

現在実行中の[ミューテーション](/sql-reference/statements/alter#mutations)をキャンセルして削除しようとします。キャンセルするミューテーションは、`KILL`クエリの`WHERE`句で指定されたフィルターを使用して[`system.mutations`](../../operations/system-tables/mutations.md#system_tables-mutations)テーブルから選択されます。

テストクエリ（`TEST`）はユーザーの権利の確認のみを行い、停止可能なミューテーションのリストを表示します。

例:

未完了のミューテーションの`count()`を取得する:

単一のClickHouseノードからのミューテーションのカウント:
``` sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

ClickHouseレプリカのクラスタからのミューテーションのカウント:
``` sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

未完了のミューテーションのリストをクエリ:

単一のClickHouseノードからのミューテーションのリスト:
``` sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouseクラスタからのミューテーションのリスト:
``` sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを終了:
``` sql
-- 単一テーブルのすべてのミューテーションをキャンセルして削除:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセル:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

ミューテーションがスタックして完了できない場合（例: ミューテーションクエリ内の関数が、テーブル内のデータに適用されるときに例外をスローする場合）にこのクエリは役立ちます。

ミューテーションによって既に行われた変更はロールバックされません。

:::note 
`is_killed=1`列（ClickHouse Cloudのみ）は、[system.mutations](/operations/system-tables/mutations)テーブル内でミューテーションが完全に最終化されていることを必ずしも意味しません。ミューテーションが`is_killed=1`で`is_done=0`の状態のまま長期間残ることがあります。これは、他の長時間実行中のミューテーションがキャンセルされたミューテーションをブロックしている場合に発生する可能性があります。これは通常の状況です。
:::
