---
description: 'Lightweight DELETE ステートメントにより、データベースからのデータ削除処理が簡素化されます。'
keywords: ['delete']
sidebar_label: 'DELETE'
sidebar_position: 36
slug: /sql-reference/statements/delete
title: 'Lightweight DELETE ステートメント'
doc_type: 'reference'
---

軽量な `DELETE` ステートメントは、式 `expr` に一致する行をテーブル `[db.]table` から削除します。これは *MergeTree テーブルエンジンファミリーでのみ使用可能です。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドが重い処理であるのと対比して、これは「軽量な `DELETE`」と呼ばれます。


## 例 {#examples}

```sql
-- `Title` 列に `hello` という文字列を含むすべての行を `hits` テーブルから削除します
DELETE FROM hits WHERE Title LIKE '%hello%';
```


## 軽量 `DELETE` は即座にデータを削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量 `DELETE` は、行を削除済みとしてマークするだけで、即座に物理削除は行わない [mutation](/sql-reference/statements/alter#mutations) として実装されています。

デフォルトでは、`DELETE` ステートメントは行を削除済みとしてマークし終えるまで待ってから制御を返します。データ量が多い場合、この処理には長時間かかることがあります。代わりに、設定 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) を使用してバックグラウンドで非同期に実行することもできます。これを無効にすると、`DELETE` ステートメントは即座に制御を返しますが、バックグラウンドでの mutation が完了するまで、そのデータはクエリから引き続き参照される可能性があります。

mutation は削除済みとマークされた行を物理的には削除せず、次回のマージ時にのみ物理削除が行われます。その結果、しばらくの間（期間は保証されませんが）、データはストレージから実際には削除されず、削除済みとしてマークされているだけの場合があります。

予測可能な時間内にストレージからデータが削除されることを保証する必要がある場合は、テーブル設定 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) の利用を検討してください。あるいは、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドを使用することもできます。`ALTER TABLE ... DELETE` を使用してデータを削除する場合、影響を受けるすべてのパーツを再作成するため、多くのリソースを消費し得る点に注意してください。



## 大量のデータの削除 {#deleting-large-amounts-of-data}

大規模な削除操作は ClickHouse のパフォーマンスに悪影響を与える可能性があります。テーブルからすべての行を削除する場合は、[`TRUNCATE TABLE`](/sql-reference/statements/truncate) コマンドの使用を検討してください。

頻繁に削除を行うことが想定される場合は、[カスタムパーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key) の利用を検討してください。その場合は、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) コマンドを使用して、そのパーティションに属するすべての行を高速に削除できます。



## 軽量な `DELETE` の制限事項 {#limitations-of-lightweight-delete}

### プロジェクションを持つ軽量な `DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、プロジェクションを持つテーブルでは `DELETE` は動作しません。これは、プロジェクション内の行が `DELETE` 操作の影響を受ける可能性があるためです。ただし、この挙動を変更するための [MergeTree 設定](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode` が用意されています。



## 軽量な `DELETE` を使用する際のパフォーマンス上の考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量な `DELETE` 文で大量のデータを削除すると、SELECT クエリのパフォーマンスに悪影響を及ぼす可能性があります。**

次のような点も、軽量な `DELETE` のパフォーマンスに悪影響を与える可能性があります。

- `DELETE` クエリ内の負荷の高い（複雑な）`WHERE` 条件。
- mutations キューが他の多数の mutation で埋まっている場合。テーブル上のすべての mutation は逐次実行されるため、これがパフォーマンス問題につながる可能性があります。
- 対象のテーブルが非常に多くのデータパートを持っている場合。
- Compact パート内に大量のデータがある場合。Compact パートでは、すべてのカラムが 1 つのファイルに格納されます。



## 削除権限 {#delete-permissions}

`DELETE` には `ALTER DELETE` 権限が必要です。特定のユーザーに対して特定のテーブルで `DELETE` 文を有効化するには、次のコマンドを実行します。

```sql
GRANT ALTER DELETE ON db.table TO username;
```


## ClickHouse における軽量な DELETE の内部動作 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受ける行に「マスク」が適用される**

   `DELETE FROM table ...` クエリが実行されると、ClickHouse は各行を「存在する」か「削除済み」としてマークしたマスクを保存します。「削除済み」とマークされた行は、その後のクエリでは結果から除外されます。ただし、行が実際に物理的に削除されるのは、その後のマージ処理によってです。このマスクを書き込む処理は、`ALTER TABLE ... DELETE` クエリで行われる処理と比べてはるかに軽量です。

   マスクは、表示される行には `True`、削除された行には `False` を格納する、隠しシステムカラム `_row_exists` として実装されています。このカラムは、そのパーツ内で一部の行が削除された場合にのみ、そのパーツに存在します。パーツ内のすべての値が `True` の場合、このカラムは存在しません。

2. **`SELECT` クエリはマスクを含むように変換される**

   マスクされた行を含むテーブルがクエリ内で使用されると、`SELECT ... FROM table WHERE condition` クエリは内部的に `_row_exists` に対する述語が付加され、次のように変換されます:
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   実行時には、どの行を返さないかを判断するために `_row_exists` カラムが読み込まれます。削除された行が多数存在する場合、ClickHouse は残りのカラムを読み込む際に完全にスキップできるグラニュールを判定できます。

3. **`DELETE` クエリは `ALTER TABLE ... UPDATE` クエリに変換される**

   `DELETE FROM table WHERE condition` は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` というミューテーションに変換されます。

   内部的には、このミューテーションは次の 2 段階で実行されます:

   1. 各パーツごとに、そのパーツが影響を受けるかどうかを判定するために、`SELECT count() FROM table WHERE condition` コマンドが実行されます。

   2. 上記のコマンド結果に基づいて、影響を受けるパーツにはミューテーションが適用され、影響を受けないパーツにはハードリンクが作成されます。ワイドパーツの場合、各行の `_row_exists` カラムだけが更新され、その他すべてのカラムのファイルはハードリンクされます。コンパクトパーツの場合は、すべてのカラムが 1 つのファイルにまとめて保存されているため、すべてのカラムが書き直されます。

   上記のステップからわかるように、マスキング手法を用いた軽量な `DELETE` は、影響を受けるパーツについてすべてのカラムファイルを書き直さないため、従来の `ALTER TABLE ... DELETE` と比べてパフォーマンスが向上します。



## 関連情報 {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
