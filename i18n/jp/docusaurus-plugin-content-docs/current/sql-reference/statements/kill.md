---
description: 'KILL に関するドキュメント'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'KILL ステートメント'
doc_type: 'reference'
---

`KILL` ステートメントには 2 種類あります。クエリを強制終了するものと、ミューテーションを強制終了するものです。



## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

現在実行中のクエリを強制終了します。
終了対象のクエリは、`KILL`クエリの`WHERE`句で定義された条件に基づいて、system.processesテーブルから選択されます。

例:

まず、未完了のクエリのリストを取得する必要があります。次のSQLクエリは、実行時間が最も長いものから順に表示します:

単一のClickHouseノードからのリスト:

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

ClickHouseクラスタからのリスト:

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
-- 指定されたquery_idを持つすべてのクエリを強制終了します:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 'username'によって実行されたすべてのクエリを同期的に終了します:
KILL QUERY WHERE user='username' SYNC
```

:::tip
ClickHouse Cloudまたはセルフマネージドクラスタでクエリを終了する場合は、すべてのレプリカでクエリが確実に終了されるように、`ON CLUSTER [cluster-name]`オプションを使用してください
:::

読み取り専用ユーザーは、自分自身のクエリのみを停止できます。

デフォルトでは、非同期バージョン(`ASYNC`)が使用され、クエリが停止したことの確認を待機しません。

同期バージョン(`SYNC`)は、すべてのクエリが停止するまで待機し、各プロセスが停止する際にその情報を表示します。
レスポンスには`kill_status`列が含まれ、以下の値を取ることができます:

1.  `finished` – クエリは正常に終了しました。
2.  `waiting` – 終了シグナルを送信した後、クエリの終了を待機しています。
3.  その他の値は、クエリを停止できない理由を説明します。

テストクエリ(`TEST`)は、ユーザーの権限のみをチェックし、停止対象のクエリのリストを表示します。


## KILL MUTATION {#kill-mutation}

長時間実行中または未完了のミューテーションが存在する場合、ClickHouseサービスが適切に動作していないことを示している可能性があります。ミューテーションの非同期的な性質により、システムの利用可能なリソースをすべて消費してしまう場合があります。次のいずれかの対応が必要になることがあります:

- すべての新しいミューテーション、`INSERT`、`SELECT`を一時停止し、ミューテーションキューの完了を待つ。
- または、`KILL`コマンドを送信して、これらのミューテーションの一部を手動で強制終了する。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

現在実行中の[ミューテーション](/sql-reference/statements/alter#mutations)をキャンセルして削除します。キャンセル対象のミューテーションは、`KILL`クエリの`WHERE`句で指定されたフィルタを使用して[`system.mutations`](/operations/system-tables/mutations)テーブルから選択されます。

テストクエリ(`TEST`)は、ユーザーの権限のみを確認し、停止対象のミューテーションのリストを表示します。

例:

未完了のミューテーション数を`count()`で取得する:

単一のClickHouseノードからのミューテーション数:

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

レプリカのClickHouseクラスタからのミューテーション数:

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

未完了のミューテーションのリストをクエリする:

単一のClickHouseノードからのミューテーションのリスト:

```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouseクラスタからのミューテーションのリスト:

```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

必要に応じてミューテーションを強制終了する:

```sql
-- 単一テーブルのすべてのミューテーションをキャンセルして削除:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 特定のミューテーションをキャンセル:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

このクエリは、ミューテーションがスタックして完了できない場合(例えば、ミューテーションクエリ内の関数がテーブルに含まれるデータに適用された際に例外をスローする場合など)に有用です。

ミューテーションによって既に行われた変更はロールバックされません。

:::note
[system.mutations](/operations/system-tables/mutations)テーブルの`is_killed=1`列(ClickHouse Cloudのみ)は、必ずしもミューテーションが完全に終了したことを意味するわけではありません。ミューテーションが`is_killed=1`かつ`is_done=0`の状態で長期間残る可能性があります。これは、別の長時間実行中のミューテーションが強制終了されたミューテーションをブロックしている場合に発生することがあります。これは正常な状態です。
:::
