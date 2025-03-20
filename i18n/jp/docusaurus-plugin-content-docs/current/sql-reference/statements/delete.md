---
slug: /sql-reference/statements/delete
sidebar_position: 36
sidebar_label: DELETE
description: Lightweight deletes simplify the process of deleting data from the database.
keywords: [delete]
title: The Lightweight DELETE Statement
---

軽量の `DELETE` ステートメントは、式 `expr` に一致する行をテーブル `[db.]table` から削除します。これは *MergeTree テーブルエンジンファミリー* のみで使用可能です。

``` sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

これは、重たいプロセスである [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドとの対比から「軽量 `DELETE`」と呼ばれています。

## 例 {#examples}

```sql
-- `Title` カラムに `hello` というテキストを含む全ての行を `hits` テーブルから削除します
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 軽量 `DELETE` はデータを即座に削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量 `DELETE` は、行を削除済みとしてマークしますが、物理的には即座に削除しない [変異](/sql-reference/statements/alter#mutations) として実装されています。

デフォルトでは、`DELETE` ステートメントは行を削除済みとしてマークするのが完了するまで待機してから返されます。データ量が大きい場合、これには長い時間がかかることがあります。代わりに、設定 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) を使用して非同期にバックグラウンドで実行することができます。無効にすると、`DELETE` ステートメントは即座に返されますが、バックグラウンドでの変異が完了するまでクエリにデータがまだ表示される可能性があります。

変異は、削除済みとしてマークされた行を物理的に削除することはありません。これは次のマージ中にのみ発生します。そのため、指定されていない期間にわたって、データがストレージから実際に削除されず、単に削除済みとしてマークされることがあります。

ストレージからデータを予測可能な時間内に削除することを保証する必要がある場合は、テーブル設定 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) の使用を検討してください。または、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドを使用できます。`ALTER TABLE ... DELETE` を使用してデータを削除することは、影響を受けるすべてのパーツを再作成するため、かなりのリソースを消費する可能性がありますので注意してください。

## 大量のデータを削除する {#deleting-large-amounts-of-data}

大規模な削除は、ClickHouse のパフォーマンスに悪影響を及ぼす可能性があります。もしテーブルからすべての行を削除することを検討しているなら、[`TRUNCATE TABLE`](/sql-reference/statements/truncate) コマンドの使用を考えてみてください。

頻繁に削除が必要とされる場合は、[カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) の使用を検討してください。それにより、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) コマンドを使用して、関連するすべての行を迅速に削除できます。

## 軽量 `DELETE` の制限 {#limitations-of-lightweight-delete}

### 投影を伴う軽量 `DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、`DELETE` は投影を持つテーブルには機能しません。これは、投影内の行が `DELETE` 操作の影響を受ける可能性があるためです。しかし、動作を変更する [MergeTree 設定](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` があります。

## 軽量 `DELETE` を使用する際のパフォーマンス考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量 `DELETE` ステートメントを使用して大量のデータを削除すると、SELECT クエリのパフォーマンスに悪影響を与える可能性があります。**

以下の要因も軽量 `DELETE` パフォーマンスに悪影響を及ぼす可能性があります：

- `DELETE` クエリ内の重い `WHERE` 条件。
- 変異キューが他の多くの変異で満たされている場合、すべての変異がテーブルで順次実行されるため、パフォーマンスの問題が発生する可能性があります。
- 対象テーブルに非常に大量のデータパーツが存在する。
- コンパクトパーツに大量のデータが存在する。コンパクトパーツでは、すべてのカラムが1つのファイルに保存されます。

## 削除権限 {#delete-permissions}

`DELETE` には `ALTER DELETE` 権限が必要です。特定のユーザーに対して特定のテーブルの `DELETE` ステートメントを有効にするには、以下のコマンドを実行してください：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## ClickHouse 内部での軽量 DELETE の動作 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受けた行に「マスク」が適用される**

   `DELETE FROM table ...` クエリが実行されると、ClickHouse は各行を「存在」または「削除済み」としてマークするマスクを保存します。これらの「削除済み」行は、後続のクエリでは省略されます。しかし、実際に行が削除されるのは次のマージの時です。このマスクの書き込みは、`ALTER TABLE ... DELETE` クエリによって行われることに比べてはるかに軽量です。

   マスクは、すべての可視行に対して `True` を保存し、削除された行に対して `False` を保存する隠し `_row_exists` システムカラムとして実装されています。このカラムは、パート内のいくつかの行が削除された場合にのみ存在します。このカラムが存在しないのは、すべての値が `True` である場合です。

2. **`SELECT` クエリはマスクを含むように変換される**

   マスクされたカラムがクエリで使用されると、`SELECT ... FROM table WHERE condition` クエリは内部的に `_row_exists` に基づく述語で拡張されて次のように変換されます：
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   実行時に、カラム `_row_exists` が読み取られ、返すべきでない行を特定します。削除された行が多い場合、ClickHouse は残りのカラムを読み取る際にどのグラニューラを完全にスキップできるかを判断できます。

3. **`DELETE` クエリは `ALTER TABLE ... UPDATE` クエリに変換される**

   `DELETE FROM table WHERE condition` は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` という変異に翻訳されます。

   内部的には、この変異は2段階で実行されます：

   1. 各個別のパートに対して `SELECT count() FROM table WHERE condition` コマンドが実行され、パートが影響を受けるかを判断します。

   2. 上記のコマンドに基づいて、影響を受けたパートが変異され、影響を受けていないパートに対してハードリンクが作成されます。広いパートの場合、各行の `_row_exists` カラムが更新され、他のすべてのカラムのファイルがハードリンクされます。コンパクトパートの場合、すべてのカラムが1つのファイルにまとめて保存されているため、すべて再書き込みされます。

   上記のステップから、軽量 `DELETE` がマスキング技術を使用することで、伝統的な `ALTER TABLE ... DELETE` に比べてパフォーマンスを改善することができることが分かります。これは、影響を受けたパートのすべてのカラムファイルを再書き込みしないためです。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
