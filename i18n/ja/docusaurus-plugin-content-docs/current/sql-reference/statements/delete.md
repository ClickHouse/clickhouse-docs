---
slug: /sql-reference/statements/delete
sidebar_position: 36
sidebar_label: DELETE
description: 軽量削除は、データベースからデータを削除するプロセスを簡素化します。
keywords: [delete]
title: 軽量DELETEステートメント
---

軽量の `DELETE` ステートメントは、`expr` に一致する `[db.]table` の行を削除します。これは、*MergeTree テーブルエンジンファミリー* のみに利用可能です。

``` sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

「軽量 `DELETE`」と呼ばれるのは、重いプロセスである [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドとの対比のためです。

## 例 {#examples}

```sql
-- `Title` カラムにテキスト `hello` を含む `hits` テーブルのすべての行を削除します
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 軽量 `DELETE` はデータを即座に削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量 `DELETE` は、行を削除済みとしてマークする [mutation](/sql-reference/statements/alter#mutations) として実装されていますが、物理的には即座に削除されません。

デフォルトでは、`DELETE` ステートメントは、行を削除済みとしてマークする処理が完了するまで待機します。データの量が多い場合、これには時間がかかることがあります。代わりに、設定 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) を使用して非同期でバックグラウンドで実行することができます。無効にした場合、`DELETE` ステートメントは即座に返されますが、バックグラウンドのマージが終了するまでデータはクエリに対してまだ表示可能です。

マージにおいて、削除済みとしてマークされた行が物理的に削除されるのは次回のマージ時のみです。このため、未指定の期間にデータが実際にはストレージから削除されず、削除済みとしてマークされるだけの場合があります。

ストレージからデータが削除されることを長期的に保証したい場合は、テーブル設定 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) の使用を検討してください。あるいは [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドを使用することもできます。ただし、`ALTER TABLE ... DELETE` を使用してデータを削除することは、影響を受けるすべてのパーツを再作成するため、かなりのリソースを消費する可能性があります。

## 大量のデータを削除する {#deleting-large-amounts-of-data}

大量の削除は、ClickHouse のパフォーマンスに悪影響を及ぼす可能性があります。テーブルからすべての行を削除しようとしている場合は、[`TRUNCATE TABLE`](/sql-reference/statements/truncate) コマンドの使用を検討してください。

頻繁に削除が予測される場合は、[カスタムパーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key) の使用を検討してください。その後、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) コマンドを使用して、そのパーティションに関連するすべての行を迅速に削除できます。

## 軽量 `DELETE` の制限 {#limitations-of-lightweight-delete}

### プロジェクションを持つ軽量 `DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、`DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。しかし、動作を変更するための [MergeTree 設定](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` があります。

## 軽量 `DELETE` を使用する際のパフォーマンス考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量 `DELETE` ステートメントを使って大量のデータを削除すると、SELECT クエリのパフォーマンスに悪影響を及ぼす可能性があります。**

以下も軽量 `DELETE` のパフォーマンスに悪影響を与える可能性があります：

- `DELETE` クエリ内の重い `WHERE` 条件。
- ミューテーションキューが多くの他のミューテーションで埋まっている場合、すべてのテーブルに対するミューテーションは逐次的に実行されるため、パフォーマンスの問題につながる可能性があります。
- 影響を受けるテーブルに非常に大量のデータパーツがある。
- コンパクトなパーツに大量のデータがある場合。コンパクトなパーツでは、すべてのカラムが1つのファイルに保存されます。

## 削除権限 {#delete-permissions}

`DELETE` には `ALTER DELETE` 権限が必要です。特定のユーザーに対して特定のテーブルで `DELETE` ステートメントを有効にするには、次のコマンドを実行します。

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 軽量DELETEがClickHouse内部でどのように機能するか {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受ける行に「マスク」が適用されます**

   `DELETE FROM table ...` クエリが実行されると、ClickHouse は各行を「存在」と「削除済み」としてマークしたマスクを保存します。「削除済み」の行は後続のクエリでは省略されます。ただし、実際には行は後続のマージによってのみ削除されます。このマスクを書き込むことは、`ALTER TABLE ... DELETE` クエリによって行われることよりもはるかに軽量です。

   マスクは、すべての可視行に対して `True` を、削除された行に対して `False` を保存する隠し `_row_exists` システムカラムとして実装されています。このカラムは、そのパーツ内にいくつかの行が削除された場合にのみ存在します。このカラムは、すべての値が `True` の場合、パーツには存在しません。

2. **`SELECT` クエリはマスクを含むように変換されます**

   マスクされたカラムがクエリで使用されると、`SELECT ... FROM table WHERE condition` クエリは内部的に `_row_exists` に対する述語で拡張され、次のように変換されます：
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   実行時には、カラム `_row_exists` を読み取って、返すべきでない行を判断します。削除された行が多い場合、ClickHouse は残りのカラムを読み取る際に完全にスキップできるグラニュールを特定できます。

3. **`DELETE` クエリは `ALTER TABLE ... UPDATE` クエリに変換されます**

   `DELETE FROM table WHERE condition` は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` ミューテーションに翻訳されます。

   このミューテーションは、内部的に二つのステップで実行されます：

   1. 各個別パーツに対して `SELECT count() FROM table WHERE condition` コマンドが実行され、そのパーツが影響を受けるかどうかを判断します。

   2. 上記のコマンドに基づいて、影響を受けるパーツがミューテートされ、影響を受けないパーツのハードリンクが作成されます。ワイドなパーツの場合、各行の `_row_exists` カラムが更新され、他のすべてのカラムのファイルがハードリンクされます。コンパクトなパーツの場合、すべてのカラムが一つのファイルに保存されているため、すべてのカラムが再書き込みされます。

   上記のステップから、軽量 `DELETE` はマスキング技術を使用して、影響を受けるパーツのすべてのカラムファイルを再書き込みしないため、従来の `ALTER TABLE ... DELETE` よりもパフォーマンスが向上することがわかります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
