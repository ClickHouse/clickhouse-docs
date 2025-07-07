---
'description': '軽量削除はデータベースからデータを削除するプロセスを簡素化します。'
'keywords':
- 'delete'
'sidebar_label': '削除'
'sidebar_position': 36
'slug': '/sql-reference/statements/delete'
'title': '軽量削除ステートメント'
---



軽量の `DELETE` 文は、式 `expr` に一致する `[db.]table` テーブルから行を削除します。これは *MergeTree テーブルエンジンファミリー* のみで使用可能です。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

これは、重いプロセスである [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドと対比するために「軽量 `DELETE`」と呼ばれています。

## 例 {#examples}

```sql
-- `Title` カラムに `hello` というテキストが含まれている `hits` テーブルのすべての行を削除します
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## 軽量 `DELETE` はデータを即座に削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量 `DELETE` は、行を削除済みとしてマークするが、物理的に即座に削除はしない [ミューテーション](/sql-reference/statements/alter#mutations) として実装されています。

デフォルトでは、`DELETE` 文は、行を削除済みとしてマークする処理が完了するまで待機します。データ量が多いと、これには長い時間がかかることがあります。代わりに、設定 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) を使用して非同期的にバックグラウンドで実行できます。これを無効にすると、`DELETE` 文は即座に返されますが、バックグラウンドのミューテーションが終了するまで、データはクエリに対して依然として表示される可能性があります。

ミューテーションは、削除済みとしてマークされた行を物理的に削除することはなく、これは次のマージ時にのみ発生します。その結果、特定の期間中、データは実際にはストレージから削除されず、単に削除済みとしてマークされる可能性があります。

ストレージからデータが予測可能な時間内に削除されることを保証したい場合は、テーブル設定 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) を使用することを検討してください。または、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドを使用することができます。`ALTER TABLE ... DELETE` を使用してデータを削除すると、影響を受けたすべてのパーツが再作成されるため、かなりのリソースを消費することに注意してください。

## 大量のデータの削除 {#deleting-large-amounts-of-data}

大量削除は ClickHouse のパフォーマンスに悪影響を与える可能性があります。テーブルからすべての行を削除しようとする場合は、[`TRUNCATE TABLE`](/sql-reference/statements/truncate) コマンドの使用を検討してください。

頻繁に削除を行うことが予想される場合は、[カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) の使用を考慮してください。その後、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) コマンドを使って、そのパーティションに関連するすべての行を迅速に削除できます。

## 軽量 `DELETE` の制限 {#limitations-of-lightweight-delete}

### プロジェクションを持つ軽量 `DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、`DELETE` はプロジェクションを持つテーブルでは機能しません。これは、プロジェクション内の行が `DELETE` 操作に影響を受ける可能性があるためです。ただし、動作を変更するための [MergeTree 設定](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` があります。

## 軽量 `DELETE` 使用時のパフォーマンスに関する考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量 `DELETE` 文で大量のデータを削除すると、SELECT クエリのパフォーマンスに悪影響を与える可能性があります。**

次の要因も軽量 `DELETE` のパフォーマンスに悪影響を及ぼすことがあります：

- `DELETE` クエリにおける重い `WHERE` 条件。
- ミューテーションキューが他の多くのミューテーションで満たされている場合、すべてのテーブルに対するミューテーションは逐次的に実行されるため、パフォーマンスの問題を引き起こす可能性があります。
- 影響を受けるテーブルに非常に多くのデータパーツがあること。
- コンパクトパーツに多くのデータがあること。コンパクトパーツでは、すべてのカラムは1つのファイルに格納されます。

## 削除権限 {#delete-permissions}

`DELETE` には `ALTER DELETE` 権限が必要です。特定のユーザーに対し、特定のテーブルで `DELETE` 文を有効にするには、次のコマンドを実行します：

```sql
GRANT ALTER DELETE ON db.table to username;
```

## ClickHouse での軽量 DELETE が内部的にどのように機能するか {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受ける行に「マスク」が適用される**

   `DELETE FROM table ...` クエリが実行されると、ClickHouse は各行が「存在している」または「削除された」とマークされたマスクを保存します。その「削除された」行は、後続のクエリで省略されます。しかし、行は実際には次のマージによってのみ削除されます。このマスクを保存することは、`ALTER TABLE ... DELETE` クエリによって行われることに比べて、はるかに軽量です。

   マスクは、すべての可視行に対して `True` を、削除された行に対して `False` を保存する隠しシステムカラム `_row_exists` として実装されています。このカラムは、パート内の行が削除された場合にのみ存在します。このカラムが存在しない場合、すべての値が `True` のパートです。

2. **`SELECT` クエリがマスクを含むように変換される**

   マスクされたカラムがクエリで使用されると、`SELECT ... FROM table WHERE condition` クエリは、内部的に `_row_exists` の述語で拡張され、次のように変換されます：
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   実行時に、カラム `_row_exists` が読み込まれ、返されない行を決定します。削除された行が多い場合、ClickHouse は、他のカラムを読み込む際に完全にスキップできるグラニュールを決定できます。

3. **`DELETE` クエリが `ALTER TABLE ... UPDATE` クエリに変換される**

   `DELETE FROM table WHERE condition` は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` ミューテーションに変換されます。

   このミューテーションは内部で2つのステップで実行されます：

   1. 影響を受けたパートを判断するために、各パートに対して `SELECT count() FROM table WHERE condition` コマンドが実行されます。

   2. 上記のコマンドに基づいて、影響を受けたパートがミューテートされ、影響を受けていないパートにはハードリンクが作成されます。広範なパーツの場合、各行の `_row_exists` カラムが更新され、他のすべてのカラムのファイルはハードリンクされます。コンパクトパーツの場合、すべてのカラムが1つのファイルに一緒に格納されているため、すべてのカラムが再書き込まれます。

   上記のステップから、マスキング技術を使用した軽量 `DELETE` は、影響を受けたパーツのすべてのカラムのファイルを再書き込むことがないため、従来の `ALTER TABLE ... DELETE` よりもパフォーマンスが向上することがわかります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
