---
description: '軽量削除はデータベースからデータを削除するプロセスを簡素化します。'
keywords: ['delete']
sidebar_label: 'DELETE'
sidebar_position: 36
slug: /sql-reference/statements/delete
title: '軽量 DELETE ステートメント'
---

軽量 `DELETE` ステートメントは、式 `expr` に一致する行を `[db.]table` テーブルから削除します。これは *MergeTree テーブルエンジンファミリー* のみで利用可能です。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

これは [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドと対照的に "軽量 `DELETE`" と呼ばれています。ALTER TABLE ... DELETE コマンドは重いプロセスです。

## 例 {#examples}

```sql
-- `hits` テーブルから `Title` カラムに `hello` というテキストを含むすべての行を削除します
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 軽量 `DELETE` はデータを即座に削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量 `DELETE` は、行を削除されたとしてマークする [ミューテーション](/sql-reference/statements/alter#mutations) として実装されていますが、即座には物理的に削除されません。

デフォルトでは、`DELETE` ステートメントは、行を削除されたとしてマークする処理が完了するまで待機します。大量のデータの場合、これには時間がかかることがあります。代わりに、設定 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) を使用してバックグラウンドで非同期に実行することができます。無効にすると、`DELETE` ステートメントはすぐに戻りますが、バックグラウンドでのミューテーションが完了するまでデータはクエリに対してまだ表示される可能性があります。

ミューテーションは、削除されたとしてマークされた行を物理的に削除することはありません。これは次のマージでのみ発生します。その結果、未指定の期間、データが実際にはストレージから削除されておらず、削除されたとしてマークされているだけである可能性があります。

ストレージからデータが時刻に基づいて削除されることを保証する必要がある場合は、テーブル設定 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) の使用を検討してください。または、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドを使用することもできます。`ALTER TABLE ... DELETE` を使用したデータ削除は、影響を受けるすべてのパーツを再作成するため、かなりのリソースを消費する可能性があります。

## 大量のデータを削除する {#deleting-large-amounts-of-data}

大量削除は ClickHouse のパフォーマンスに悪影響を及ぼす可能性があります。テーブルからすべての行を削除しようとしている場合は、[`TRUNCATE TABLE`](/sql-reference/statements/truncate) コマンドの使用を検討してください。

頻繁に削除が行われると予想される場合は、[カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) の使用を検討してください。そうすると、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) コマンドを使用して、そのパーティションに関連するすべての行を迅速に削除できます。

## 軽量 `DELETE` の制限 {#limitations-of-lightweight-delete}

### プロジェクションを持つ軽量 `DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、`DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。しかし、`lightweight_mutation_projection_mode` という [MergeTree 設定](/operations/settings/merge-tree-settings) により、動作を変更できます。

## 軽量 `DELETE` 使用時のパフォーマンス考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量 `DELETE` ステートメントを使用して大量のデータを削除すると、SELECT クエリのパフォーマンスに悪影響を及ぼす可能性があります。**

軽量 `DELETE` のパフォーマンスに悪影響を及ぼす可能性のある要因は以下の通りです：

- `DELETE` クエリ内の重い `WHERE` 条件。
- ミューテーションキューが多くの他のミューテーションで満杯の場合、これはパフォーマンスの問題を引き起こす可能性があります。すべてのテーブル内のミューテーションは逐次実行されます。
- 影響を受けるテーブルに非常に多くのデータパーツがある場合。
- コンパクトパーツ内に大量のデータがある場合。コンパクトパーツでは、すべてのカラムが 1 つのファイルに保存されます。

## 削除権限 {#delete-permissions}

`DELETE` には `ALTER DELETE` の権限が必要です。特定のユーザーに特定のテーブルで `DELETE` ステートメントを有効にするには、次のコマンドを実行します：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## ClickHouse 内部での軽量 DELETE の動作 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受ける行に "マスク" が適用される**

   `DELETE FROM table ...` クエリが実行されると、ClickHouse は各行が "存在" または "削除" のいずれかとしてマークされるマスクを保存します。"削除" とマークされた行は、その後のクエリには含まれません。ただし、行は実際には次のマージによってのみ削除されます。このマスクの書き込みは、`ALTER TABLE ... DELETE` クエリによって行われることに比べてはるかに軽量です。

   マスクは、すべての表示行に対して `True`、削除された行に対して `False` を保存する隠し `_row_exists` システムカラムとして実装されています。このカラムは、部分に行が削除された場合にのみ存在します。このカラムは、すべての値が `True` の場合には存在しません。

2. **`SELECT` クエリはマスクを含むように変換される**

   マスクされたカラムがクエリで使用されると、`SELECT ... FROM table WHERE condition` クエリは内部で `_row_exists` に関する述語で拡張され、次のように変換されます：
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   実行時には、列 `_row_exists` が読み込まれ、どの行が返されるべきでないかを判断します。削除された行が多い場合、ClickHouse は残りの列を読み込む際に完全にスキップできるグラニュールを判断できます。

3. **`DELETE` クエリは `ALTER TABLE ... UPDATE` クエリに変換される**

   `DELETE FROM table WHERE condition` は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` ミューテーションに変換されます。

   内部では、このミューテーションは次の 2 つのステップで実行されます：

   1. 影響を受ける部分を特定するために、各個別の部分に対して `SELECT count() FROM table WHERE condition` コマンドが実行されます。

   2. 上記のコマンドに基づいて、影響を受ける部分がミューテーションされ、影響を受けない部分のハードリンクが作成されます。広い部分の場合、各行の `_row_exists` カラムが更新され、他のカラムのファイルはハードリンクされます。コンパクトな部分の場合、すべてのカラムが同じファイルにまとめて保存されているため、すべてのカラムが再書きされます。

   上記のステップから分かるように、マスキング技術を使用した軽量 `DELETE` は、影響を受ける部分のすべてのカラムのファイルを書き直さないため、従来の `ALTER TABLE ... DELETE` よりもパフォーマンスが向上します。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
