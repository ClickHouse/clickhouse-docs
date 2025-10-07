---
'description': '軽量削除は、データベースからデータを削除するプロセスを簡素化します。'
'keywords':
- 'delete'
'sidebar_label': 'DELETE'
'sidebar_position': 36
'slug': '/sql-reference/statements/delete'
'title': '軽量DELETEステートメント'
'doc_type': 'reference'
---

軽量の `DELETE` ステートメントは、式 `expr` に一致する行をテーブル `[db.]table` から削除します。これは *MergeTree テーブルエンジンファミリー にのみ利用可能です。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

これは、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドと対比させるために「軽量の `DELETE`」と呼ばれています。ALTER TABLE ... DELETE コマンドは重いプロセスです。

## 例 {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 軽量の `DELETE` はデータを即座に削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量の `DELETE` は、行を削除済みとしてマークするが、それらを即座に物理的に削除しない [ミューテーション](/sql-reference/statements/alter#mutations) として実装されています。

デフォルトでは、`DELETE` ステートメントは、行を削除済みとしてマークする処理が完了するまで待機してから返されます。データ量が大きい場合、これには長い時間がかかることがあります。代わりに、設定 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) を使用してバックグラウンドで非同期に実行できます。無効にすると、`DELETE` ステートメントは即座に返されますが、バックグラウンドのミューテーションが完了するまでデータはまだクエリに対して表示される可能性があります。

ミューテーションは、削除済みとしてマークされた行を物理的に削除しません。これは次のマージの際にのみ発生します。その結果として、特定の期間、データがストレージから実際には削除されず、削除済みとしてマークされたままになる可能性があります。

ストレージからデータが予測可能な時間内に削除されることを保証する必要がある場合は、テーブル設定 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) の使用を検討してください。また、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドを使用することもできます。ただし、`ALTER TABLE ... DELETE` を使用してデータを削除すると、影響を受けるすべてのパーツを再作成するため、リソースを大量に消費することがあります。

## 大量のデータを削除することについて {#deleting-large-amounts-of-data}

大量の削除は ClickHouse のパフォーマンスに悪影響を与える可能性があります。テーブルからすべての行を削除しようとする場合は、[`TRUNCATE TABLE`](/sql-reference/statements/truncate) コマンドの使用を検討してください。

頻繁に削除を行うことが予想される場合は、[カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) を使用することを検討してください。その後、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) コマンドを使用して、そのパーティションに関連付けられたすべての行を迅速に削除できます。

## 軽量の `DELETE` の制限 {#limitations-of-lightweight-delete}

### プロジェクションを持つ軽量の `DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、`DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。しかし、動作を変更するための [MergeTree 設定](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` があります。

## 軽量の `DELETE` 使用時のパフォーマンス考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量の `DELETE` ステートメントで大量のデータを削除すると、SELECT クエリのパフォーマンスに悪影響を及ぼす可能性があります。**

以下も軽量の `DELETE` のパフォーマンスに悪影響を与える可能性があります：

- `DELETE` クエリ内の重い `WHERE` 条件。
- ミューテーションキューが別の多くのミューテーションで埋まっている場合、これはテーブル上のすべてのミューテーションが順次実行されるため、パフォーマンスの問題につながる可能性があります。
- 影響を受けるテーブルに非常に多数のデータパーツがある。
- コンパクトパーツに多くのデータがある。コンパクトパーツでは、すべてのカラムが1つのファイルに保存されています。

## 削除権限 {#delete-permissions}

`DELETE` には `ALTER DELETE` 権限が必要です。特定のユーザーの特定のテーブルで `DELETE` ステートメントを有効にするには、以下のコマンドを実行します：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## 軽量の DELETE が ClickHouse 内でどのように機能するか {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受けた行に「マスク」が適用されます**

   `DELETE FROM table ...` クエリが実行されると、ClickHouse は各行が「存在」または「削除済み」としてマークされるマスクを保存します。これらの「削除済み」行は、後続のクエリでは省略されます。しかし、行は実際には次のマージによってのみ削除されます。このマスクを書くことは、`ALTER TABLE ... DELETE` クエリによって行われることに比べてはるかに軽量です。

   このマスクは、すべての可視行に対して `True` を、削除された行に対して `False` を格納する隠れた `_row_exists` システムカラムとして実装されています。このカラムは、パート内の行が削除されたときにのみそのパートに存在します。すべての値が `True` に等しいパートにはこのカラムは存在しません。

2. **`SELECT` クエリはマスクを含めるように変換されます**

   マスクされたカラムがクエリで使用されると、`SELECT ... FROM table WHERE condition` クエリは内部的に `_row_exists` に対する述語によって拡張され、次のように変換されます：
```sql
SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
   実行時に、カラム `_row_exists` が読まれ、返すべきでない行が決定されます。削除済みの行が多い場合、ClickHouse は残りのカラムを読み取る際に完全にスキップできるグラニュールを特定できます。

3. **`DELETE` クエリは `ALTER TABLE ... UPDATE` クエリに変換されます**

   `DELETE FROM table WHERE condition` は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` ミューテーションに変換されます。

   内部的に、このミューテーションは2つのステップで実行されます：

   1. 各個々のパートに対して `SELECT count() FROM table WHERE condition` コマンドが実行され、そのパートが影響を受けているかどうかを確認します。

   2. 上記のコマンドに基づいて、影響を受けたパートがミューテーションされ、影響を受けていないパートのハードリンクが作成されます。幅の広いパートの場合、各行の `_row_exists` カラムが更新され、他のすべてのカラムのファイルがハードリンクされます。コンパクトパートの場合、すべてのカラムが1つのファイルにまとめて保存されているため、すべてのカラムが再書き込みされます。

   上記のステップから、マスキング技術を用いた軽量の `DELETE` が、影響を受けるパートのすべてのカラムファイルを再書き込みせずにパフォーマンスを向上させることができることがわかります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
