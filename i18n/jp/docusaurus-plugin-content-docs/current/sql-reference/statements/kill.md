---
description: 'Killに関するドキュメント'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'KILLステートメント'
---

KILLステートメントには、クエリを中止するためのものと、ミューテーションを中止するためのものの2種類があります。

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <system.processesクエリからSELECTするためのwhere式>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制的に終了させる試みを行います。終了させるクエリは、`KILL`クエリの`WHERE`句で定義された基準を使用して`system.processes`テーブルから選択されます。

例：

まず、不完全なクエリのリストを取得する必要があります。このSQLクエリは、最も長く実行されているクエリに従って提供します：

単一のClickHouseノードからのリスト：
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

ClickHouseクラスタからのリスト：
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

クエリを中止する：
```sql
-- 指定されたquery_idを持つすべてのクエリを強制終了します：
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username'によって実行されたすべてのクエリを同期的に終了します：
KILL QUERY WHERE user='username' SYNC
```

:::tip 
ClickHouse Cloudまたはセルフマネージドクラスタでクエリを中止する場合は、すべてのレプリカでクエリが中止されることを保証するために```ON CLUSTER [cluster-name]```オプションを使用してください。
:::

読み取り専用ユーザーは、自分のクエリのみを停止できます。

デフォルトでは、クエリの非同期バージョンが使用されます（`ASYNC`）、これはクエリが停止したという確認を待たずに実行されます。

同期バージョン（`SYNC`）は、すべてのクエリが停止するのを待ち、それぞれのプロセスが停止する際の情報を表示します。応答には`kill_status`カラムが含まれ、以下の値を取ることができます：

1.  `finished` – クエリは正常に終了しました。
2.  `waiting` – クエリを終了するための信号を送信した後、クエリの終了を待っています。
3.  他の値は、クエリが停止できない理由を説明します。

テストクエリ（`TEST`）は、ユーザーの権利を確認し、停止するクエリのリストを表示するだけです。

## KILL MUTATION {#kill-mutation}

長時間実行中または不完全なミューテーションは、ClickHouseサービスが正常に動作していないことを示す場合があります。ミューテーションの非同期的な性質は、システム上のすべての利用可能なリソースを消費する原因となることがあります。次のいずれかを行う必要があります：

- 新しいミューテーション、`INSERT`、および`SELECT`をすべて一時停止し、ミューテーションのキューが完了するのを待つ。
- または、`KILL`コマンドを送信してこれらのミューテーションのいくつかを手動で中止する。

```sql
KILL MUTATION
  WHERE <system.mutationsクエリからSELECTするためのwhere式>
  [TEST]
  [FORMAT format]
```

現在実行中の[ミューテーション](/sql-reference/statements/alter#mutations)をキャンセルして削除しようとします。キャンセルするミューテーションは、`KILL`クエリの`WHERE`句で指定されたフィルターを使用して[`system.mutations`](/operations/system-tables/mutations)テーブルから選択されます。

テストクエリ（`TEST`）は、ユーザーの権利を確認し、停止するミューテーションのリストを表示するだけです。

例：

不完全なミューテーションの数を`count()`で取得します：

単一のClickHouseノードからのミューテーションのカウント：
```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

レプリカのClickHouseクラスタからのミューテーションのカウント：
```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

不完全なミューテーションのリストを照会します：

単一のClickHouseノードからのミューテーションのリスト：
```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouseクラスタからのミューテーションのリスト：
```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを中止します：
```sql
-- 単一のテーブルのすべてのミューテーションをキャンセルして削除します：
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセルします：
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

ミューテーションがスタックしており、終了できない場合にクエリが役立ちます（例えば、ミューテーションクエリのいくつかの関数が、テーブルに含まれるデータに適用されるときに例外をスローする場合など）。

ミューテーションによって既に行われた変更はロールバックされません。

:::note 
`is_killed=1`カラム（ClickHouse Cloud専用）は、[system.mutations](/operations/system-tables/mutations)テーブルでミューテーションが完全に終了したことを意味するわけではありません。`is_killed=1`で`is_done=0`の状態のまま長期間留まるミューテーションが存在する可能性があります。これは、別の長時間実行中のミューテーションがキルされたミューテーションをブロックしている場合に発生することがあります。これは通常の状況です。
:::
