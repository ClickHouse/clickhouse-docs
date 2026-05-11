---
sidebar_label: 'トラブルシューティングとベストプラクティス'
slug: /integrations/fivetran/troubleshooting
sidebar_position: 4
description: 'Fivetran の ClickHouse 宛先に関する一般的なエラー、デバッグのヒント、ベストプラクティス。'
title: 'トラブルシューティングとベストプラクティス'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'トラブルシューティング', 'ベストプラクティス', 'デバッグ']
---

# トラブルシューティングとベストプラクティス \{#troubleshooting-best-practices\}

## よくあるエラー \{#common-errors\}

### 権限テストが失敗した、または権限に関する操作が失敗している \{#grants-test-failed\}

**エラーメッセージ:**

```sh
Test grants failed, cause: user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**原因:** Fivetran ユーザーに必要な特権がありません。このコネクタでは、`*.*` (すべてのデータベースとテーブル) に対する `ALTER`、`CREATE DATABASE`、`CREATE TABLE`、`INSERT`、`SELECT` の権限が必要です。

:::note
特権の確認では `system.grants` を照会し、ユーザーに直接付与された権限のみを照合します。ClickHouse ロール経由で付与された特権は検出されません。詳細は、[role-based grants](/integrations/fivetran/troubleshooting#role-based-grants) セクションを参照してください。
:::

**解決策:**

必要な特権を Fivetran ユーザーに直接付与します。

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

### すべてのmutationの完了を待機中に発生するエラー \{#mutations-not-completed\}

**エラーメッセージ:**

```sh
error while waiting for all mutations to be completed: ... initial cause: ...
```

**原因:** `ALTER TABLE ... UPDATE` または `ALTER TABLE ... DELETE` のmutationが送信されましたが、すべてのレプリカでの完了を待機している間にコネクタがタイムアウトしました。エラーの「initial cause」部分には、元のClickHouseエラー (多くの場合、コード341の「Unfinished」) が含まれていることがあります。

これは、次のような場合に発生することがあります。

* ClickHouse Cloud クラスターに高い負荷がかかっている。
* mutationの実行中に1つ以上のノードが停止した。

**解決策:**

1. **mutationの進行状況を確認する**: 次のクエリを実行して、保留中のmutationがあるか確認します。
   ```sql
   SELECT database, table, mutation_id, command, create_time, is_done
   FROM system.mutations
   WHERE NOT is_done
   ORDER BY create_time DESC;
   ```
2. **クラスターの状態を確認する**: すべてのノードが正常であることを確認します。
3. **待機して再試行する**: クラスターが正常な状態に戻れば、mutationは最終的に完了します。Fivetranは同期を自動的に再試行します。

### カラムの不一致エラー \{#column-mismatch-error\}

**エラーメッセージ:**

ソース側でschemaが変更されると、カラムの不一致によりさまざまなエラーが発生することがあります。例えば:

```sh
columns count in ClickHouse table (8) does not match the input file (6). Expected columns: id, name, ..., got: id, name, ...
```

または:

```sh
column user_email was not found in the table definition. Table columns: ...; input file columns: ...
```

**原因:** ClickHouse の宛先テーブルのカラムが、同期対象データのカラムと一致していません。これは、次のような場合に発生することがあります。

* ClickHouse テーブルにカラムが手動で追加または削除された。
* ソース側の schema の変更が適切に反映されなかった。

**解決策:**

1. **Fivetran が管理するテーブルは手動で変更しないでください。** [best practices](/integrations/fivetran/troubleshooting#dont-modify-tables) を参照してください。
2. **カラムを元に戻す**: そのカラムが本来どの型であるべきか把握している場合は、[type transformation mapping](/integrations/fivetran/reference#type-mapping) を参照しながら、想定される型にカラムを変更し直してください。
3. **テーブルを再同期する**: Fivetran ダッシュボードで、影響を受けているテーブルの履歴再同期をトリガーします。
4. **削除して再作成する**: 最終手段として、宛先テーブルを削除し、次回の同期時に Fivetran に再作成させます。

### AST が大きすぎる (code 168) \{#ast-too-big\}

**エラーメッセージ:**

```sh
code: 168, message: AST is too big. Maximum: 50000
```

または

```sh
code: 62, message: Max query size exceeded
```

**原因:** 大きな UPDATE または DELETE のバッチにより、非常に複雑な抽象構文木を持つ SQL 文が生成されます。列数の多いテーブルや履歴モードが有効な場合によく発生します。

**解決策:**

[詳細設定](/integrations/fivetran/reference#advanced-configuration)ファイルで `mutation_batch_size` と `hard_delete_batch_size` の値を下げてください。どちらのデフォルト値も `1500` で、`200` から `1500` までの値を指定できます。

***

### メモリ制限超過 / OOM (code 241) \{#memory-limit-exceeded\}

**エラーメッセージ:**

```sh
code: 241, message: (total) memory limit exceeded: would use 14.01 GiB
```

**原因:** INSERT 操作で、使用可能なメモリ量を上回るメモリが必要になっています。これは通常、大規模な初回同期、列数の多いテーブル、または並行するバッチ操作中に発生します。

**解決策:**

1. **`write_batch_size` を減らす**: 大規模なテーブルでは、50,000 まで下げてみてください。
2. **データベースの負荷を下げる**: ClickHouse Cloud サービスの負荷を確認し、過負荷になっていないか確認してください。
3. **ClickHouse Cloud サービスをスケールアップする**: より多くのメモリを確保できます。

***

### 予期しない EOF / 接続エラー \{#unexpected-eof\}

**エラーメッセージ:**

```sh
ClickHouse connection error: unexpected EOF
```

または、Fivetran のログにスタックトレースのない `FAILURE_WITH_TASK`。

**原因:**

* IPアクセスリストが設定されておらず、Fivetran からのトラフィックが許可されていない。
* Fivetran と ClickHouse Cloud の間で一時的なネットワークの問題が発生している。
* 破損または無効なソースデータが原因で、送信先コネクタがクラッシュしている。

**解決策:**

1. **IPアクセスリストを確認**: ClickHouse Cloud で **Settings &gt; Security** に移動し、[Fivetran の IP アドレス](https://fivetran.com/docs/using-fivetran/ips)を追加するか、すべてのアクセスを許可します。
2. **再試行**: 最近のコネクタバージョンでは、EOF エラーは自動的に再試行されます。散発的なエラー (1 日に 1～2 回) は、一時的なものである可能性が高いです。
3. **問題が解消しない場合**: エラーが発生した時間帯を添えて、ClickHouse にサポートチケットを提出してください。あわせて、Fivetran サポートにソースデータの品質調査を依頼してください。

***

### UInt64 型をマップできない \{#uint64-type-error\}

**エラーメッセージ:**

```sh
cause: can't map type UInt64 to Fivetran types
```

**原因:** コネクタは `LONG` を `Int64` にマッピングし、`UInt64` にはマッピングしません。このエラーは、Fivetran が管理するテーブルでカラム型が手動で変更された場合に発生します。

**解決策:**

1. Fivetran が管理するテーブルでは、**カラム型を手動で変更しないでください**。
2. **復旧するには**: カラムを想定される型 (例: `Int64`) に戻すか、テーブルを削除して再同期してください。
3. **カスタム型の場合**: Fivetran が管理するテーブルの上に [materialized view](/sql-reference/statements/create/view#materialized-view) を作成してください。

***

### テーブルに主キーがありません \{#no-primary-keys\}

**エラーメッセージ:**

```sh
Failed to alter table ... cause: no primary keys for table
```

**原因:** すべての ClickHouse テーブルでは `ORDER BY` が必要です。ソースに主キーがない場合、Fivetran は自動的に `_fivetran_id` を追加します。このエラーは、ソースで主キーが定義されていても、データにその主キーが含まれていない例外的なケースで発生します。

**解決策:**

1. **Fivetran サポートに問い合わせて**、ソースパイプラインを調査してください。
2. **ソースの schema を確認してください**: 主キーカラムがデータ内に存在することを確認してください。

***

### ロールベースの権限付与に失敗する \{#role-based-grants\}

**エラーメッセージ:**

```sh
user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**原因:** コネクタは次の方法で付与されている権限を確認します:

```sql
SELECT access_type, database, table, column FROM system.grants WHERE user_name = 'my_user'
```

これは、直接付与された特権のみを返します。ClickHouse ロール経由で割り当てられた特権は `user_name = NULL`、`role_name = 'my_role'` となるため、このチェックでは検出されません。

**解決策:**

**Fivetran ユーザーに特権を直接付与**します:

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

***

## ベストプラクティス \{#best-practices\}

### Fivetran 向けの専用 ClickHouse サービス \{#dedicated-service\}

インジェスト負荷が高い場合は、Fivetran の書き込みワークロード専用のサービスを作成するために、ClickHouse Cloud の [compute-compute separation](/cloud/reference/warehouses) の利用を検討してください。これにより、インジェストを分析クエリから分離し、リソース競合を防ぐことができます。

たとえば、次のようなアーキテクチャを採用できます。

* **Service A (writer)**: Fivetran の宛先 + その他のインジェストツール (ClickPipes、Kafka コネクタ)
* **Service B (reader)**: BI ツール、ダッシュボード、アドホッククエリ

### 読み取りクエリの最適化 \{#optimizing-reading-queries\}

ClickHouse では、Fivetran の宛先テーブルに `SharedReplacingMergeTree` を使用します。これは、ClickHouse Cloud における [`ReplacingMergeTree` テーブルエンジン](/guides/replacing-merge-tree) の一種です。同じ主キーを持つ重複行が存在するのは正常です。重複排除はバックグラウンドマージ中に非同期で行われます。読み取り時には、まだ重複排除されていない行が含まれている可能性があるため、重複行を返さないよう注意する必要があります。

重複行を回避する最も簡単な方法は、`FINAL` キーワードを使用することです。これにより、まだ重複排除されていない行が読み取り時に強制的にマージされます。

```sql
SELECT * FROM schema.table FINAL WHERE ...
```

この `FINAL` 操作は、いくつかの方法で最適化できます。たとえば、`WHERE` 条件を使ってキーカラムで絞り込む方法があります。詳細については、ReplacingMergeTree ガイドの [FINAL performance](/guides/replacing-merge-tree#final-performance) セクションを参照してください。

これらの最適化だけでは不十分な場合でも、重複を正しく処理しつつ `FINAL` を使わない追加の方法があります。

* 常に増加する数値カラムをクエリする場合は、[`max(the_column)` を使用できます](/guides/developer/deduplication#avoiding-final)。
* 特定のキーについて、一部のカラムの最新の値を取得する必要がある場合は、[`argMax(the_column, _fivetran_id)`](https://clickhouse.com/blog/10-best-practice-tips#perfecting_replacingmergetree) を使用できます。

### 主キーとORDER BYの最適化 \{#primary-key-optimization\}

Fivetran は、ソーステーブルの主キーを ClickHouse の `ORDER BY` 句としてそのまま複製します。ソースに PK がない場合は、`_fivetran_id` (UUID) がソートキーになります。ClickHouse は `ORDER BY` のカラムから[スパース主索引](/guides/best-practices/sparse-primary-indexes)を構築するため、これによりクエリパフォーマンスが低下する可能性があります。

**ほかの最適化でも不十分な場合の推奨事項:**

1. **Fivetran テーブルは生のステージングテーブルとして扱ってください。** 分析用途で直接クエリしないでください。
2. **それでもクエリパフォーマンスが十分でない場合**は、[リフレッシャブルmaterialized view](/materialized-view/refreshable-materialized-view)を使用して、クエリパターンに合わせて `ORDER BY` を最適化したテーブルのコピーを作成してください。インクリメンタルmaterialized view とは異なり、リフレッシャブルmaterialized view はスケジュールに従ってクエリ全体を再実行するため、Fivetran が同期中に発行する `UPDATE` および `DELETE` 操作を正しく処理できます。

   ```sql
   CREATE MATERIALIZED VIEW schema.table_optimized
   REFRESH EVERY 1 HOUR
   ENGINE = ReplacingMergeTree()
   ORDER BY (user_id, event_date)
   AS SELECT * FROM schema.table_raw FINAL;
   ```

   :::note
   Fivetran 管理テーブルでは、インクリメンタル (非リフレッシュ型) のmaterialized view は避けてください。Fivetran はデータの同期を保つために `UPDATE` と `DELETE` 操作を発行するため、インクリメンタルmaterialized view にはこれらの変更が反映されず、古いデータや不正確なデータが含まれることになります。
   :::

### Fivetran が管理するテーブルを手動で変更しないでください \{#dont-modify-tables\}

Fivetran が管理するテーブルに対する手動の DDL 変更 (例: `ALTER TABLE ... MODIFY COLUMN`) は避けてください。コネクタは、Fivetran が作成した schema を前提としています。手動で変更すると、[型マッピングエラー](#uint64-type-error) や schema の不一致による失敗を引き起こす可能性があります。

カスタム変換には materialized view を使用してください。

## デバッグ操作 \{#debugging\}

障害を診断する際は:

* サーバー側の問題については、ClickHouse の `system.query_log` を確認してください。
* クライアント側の問題については、Fivetran にサポートを依頼してください。

コネクタのバグについては、[GitHub issue を作成](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues)するか、[ClickHouse Support](/about-us/support) にお問い合わせください。

### Fivetran同期のデバッグ \{#debugging-fivetran-syncs\}

ClickHouse側で同期の失敗を診断するには、以下のクエリを使用します。

#### Fivetran に関連する最近の ClickHouse のエラーを確認する \{#check-errors\}

```sql
SELECT event_time, query, exception_code, exception
FROM system.query_log
WHERE client_name LIKE 'fivetran-destination%'
  AND exception_code > 0
ORDER BY event_time DESC
LIMIT 50;
```

#### 最近のFivetranユーザーのアクティビティを確認する \{#check-activity\}

```sql
SELECT event_time, query_kind, query, exception_code, exception
FROM system.query_log
WHERE user = '{fivetran_user}'
ORDER BY event_time DESC
LIMIT 100;
```
