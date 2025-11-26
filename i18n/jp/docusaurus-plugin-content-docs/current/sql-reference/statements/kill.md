---
description: 'KILL に関するドキュメント'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'KILL ステートメント'
doc_type: 'reference'
---

KILL ステートメントには 2 種類あります。クエリを KILL するものと、ミューテーションを KILL するものです。



## KILL QUERY

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <system.processes に対する SELECT クエリの WHERE 句条件式>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリの強制終了を試みます。
終了対象のクエリは、`KILL` クエリの `WHERE` 句で定義された条件に基づいて、system.processes テーブルから選択されます。

例:

まず、未完了のクエリ一覧を取得する必要があります。次の SQL クエリは、実行時間が長いものから順に取得します:

単一の ClickHouse ノードからの一覧:

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

ClickHouse クラスターの一覧:

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

クエリを強制終了する：

```sql
-- 指定されたquery_idを持つすべてのクエリを強制終了します:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username'が実行したすべてのクエリを同期的に終了します:
KILL QUERY WHERE user='username' SYNC
```

:::tip
ClickHouse Cloud または自己管理クラスタでクエリを強制終了する場合は、必ず `ON CLUSTER [cluster-name]` オプションを使用して、すべてのレプリカ上でクエリが確実に停止されるようにしてください。
:::

読み取り専用ユーザーは、自分が実行したクエリのみ停止できます。

デフォルトでは、クエリの非同期バージョン（`ASYNC`）が使用され、クエリが停止したことの確認を待ちません。

同期バージョン（`SYNC`）は、すべてのクエリが停止するまで待機し、各プロセスが停止する際の情報を表示します。
レスポンスには `kill_status` 列が含まれ、次の値を取ることができます。

1. `finished` – クエリは正常に停止しました。
2. `waiting` – 終了シグナル送信後に、クエリが終了するのを待機しています。
3. その他の値は、クエリを停止できない理由を説明します。

テストクエリ（`TEST`）は、ユーザーの権限のみを確認し、停止対象となるクエリの一覧を表示します。


## KILL MUTATION

長時間実行している、または未完了の `MUTATION` が存在する場合、多くの場合は ClickHouse サービスが正常に動作していないことを示しています。`MUTATION` の非同期的な性質により、システム上の利用可能なリソースをすべて消費してしまうことがあります。次のいずれかの対応が必要になる場合があります:

* すべての新しい `MUTATION`、`INSERT`、`SELECT` を一時停止し、キュー内の `MUTATION` が完了するのを待つ。
* もしくは、`KILL` コマンドを送信して、これらの一部の `MUTATION` を手動で強制終了する。

```sql
KILL MUTATION
  WHERE <system.mutationsクエリからSELECTする際のWHERE式>
  [TEST]
  [FORMAT format]
```

現在実行中の [mutation](/sql-reference/statements/alter#mutations) をキャンセルして削除します。キャンセル対象の mutation は、`KILL` クエリの `WHERE` 句で指定されたフィルタを使って、[`system.mutations`](/operations/system-tables/mutations) テーブルから選択されます。

テストクエリ（`TEST`）はユーザーの権限を確認し、停止対象の mutation の一覧だけを表示します。

例：

未完了の mutation の件数を `count()` で取得する：

単一の ClickHouse ノードにおける mutation の件数：

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse レプリカクラスタ内のミューテーション数:

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

未完了のミューテーション一覧を取得する：

単一の ClickHouse ノード上のミューテーション一覧：

```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse クラスターのミューテーション一覧:

```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを終了します：

```sql
-- 単一テーブルのすべてのミューテーションをキャンセルして削除:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセル:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

このクエリは、ミューテーションがスタックして終了できない場合（たとえば、ミューテーションクエリ内のある関数が、テーブルに含まれるデータへ適用された際に例外をスローする場合など）に有用です。

ミューテーションによってすでに行われた変更はロールバックされません。

:::note
[system.mutations](/operations/system-tables/mutations) テーブルの `is_killed=1` 列（ClickHouse Cloud のみ）は、必ずしもミューテーションが完全に完了したことを意味しません。`is_killed=1` かつ `is_done=0` の状態のまま、そのミューテーションが長時間残る可能性があります。これは、他の長時間実行中のミューテーションが kill されたミューテーションをブロックしている場合に発生し得ます。これは正常な状況です。
:::
