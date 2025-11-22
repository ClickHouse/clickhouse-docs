---
description: '軽量 DELETE により、データベースからデータを削除する作業が簡素化されます。'
keywords: ['delete']
sidebar_label: 'DELETE'
sidebar_position: 36
slug: /sql-reference/statements/delete
title: '軽量 DELETE ステートメント'
doc_type: 'reference'
---

軽量な `DELETE` ステートメントは、式 `expr` に一致する `[db.]table` テーブルの行を削除します。これは *MergeTree テーブルエンジンファミリーでのみ使用できます。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

これは、ヘビーウェイトな処理である [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) コマンドと対比して「軽量な `DELETE`」と呼ばれています。


## 例 {#examples}

```sql
-- `Title`列に`hello`というテキストが含まれる`hits`テーブルのすべての行を削除します
DELETE FROM hits WHERE Title LIKE '%hello%';
```


## 軽量`DELETE`はデータを即座に削除しない {#lightweight-delete-does-not-delete-data-immediately}

軽量`DELETE`は、行を削除済みとしてマークする[ミューテーション](/sql-reference/statements/alter#mutations)として実装されていますが、物理的には即座に削除されません。

デフォルトでは、`DELETE`文は行を削除済みとしてマークする処理が完了するまで待機してから結果を返します。データ量が大きい場合、これには長時間かかることがあります。代わりに、[`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync)設定を使用してバックグラウンドで非同期に実行することもできます。この設定を無効にすると、`DELETE`文は即座に結果を返しますが、バックグラウンドのミューテーションが完了するまで、データはクエリから引き続き参照可能な状態となります。

ミューテーションは、削除済みとしてマークされた行を物理的には削除せず、これは次回のマージ時にのみ実行されます。その結果、不定期間、データはストレージから実際には削除されず、削除済みとしてマークされているだけの状態となる可能性があります。

予測可能な時間内にストレージからデータが削除されることを保証する必要がある場合は、テーブル設定[`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)の使用を検討してください。または、[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete)コマンドを使用することもできます。ただし、`ALTER TABLE ... DELETE`を使用したデータ削除は、影響を受けるすべてのパートを再作成するため、大量のリソースを消費する可能性があることに注意してください。


## 大量のデータの削除 {#deleting-large-amounts-of-data}

大規模な削除はClickHouseのパフォーマンスに悪影響を及ぼす可能性があります。テーブルから全ての行を削除する場合は、[`TRUNCATE TABLE`](/sql-reference/statements/truncate)コマンドの使用を検討してください。

頻繁な削除が予想される場合は、[カスタムパーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)の使用を検討してください。その後、[`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart)コマンドを使用して、そのパーティションに関連する全ての行を迅速に削除できます。


## 軽量`DELETE`の制限事項 {#limitations-of-lightweight-delete}

### プロジェクションを使用した軽量`DELETE` {#lightweight-deletes-with-projections}

デフォルトでは、プロジェクションを持つテーブルに対して`DELETE`は動作しません。これは、プロジェクション内の行が`DELETE`操作の影響を受ける可能性があるためです。ただし、この動作を変更するための[MergeTree設定](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode`があります。


## 軽量`DELETE`使用時のパフォーマンスに関する考慮事項 {#performance-considerations-when-using-lightweight-delete}

**軽量`DELETE`文による大量データの削除は、SELECTクエリのパフォーマンスに悪影響を及ぼす可能性があります。**

以下の要因も軽量`DELETE`のパフォーマンスに悪影響を及ぼす可能性があります:

- `DELETE`クエリ内の負荷の高い`WHERE`条件
- ミューテーションキューに多数の他のミューテーションが存在する場合。テーブル上のすべてのミューテーションは順次実行されるため、パフォーマンスの問題を引き起こす可能性があります。
- 対象テーブルが非常に多数のデータパートを保持している場合
- コンパクトパートに大量のデータが存在する場合。コンパクトパートでは、すべてのカラムが単一のファイルに格納されます。


## 削除権限 {#delete-permissions}

`DELETE`には`ALTER DELETE`権限が必要です。特定のユーザーが特定のテーブルに対して`DELETE`文を実行できるようにするには、次のコマンドを実行します:

```sql
GRANT ALTER DELETE ON db.table TO username;
```


## ClickHouseにおける軽量DELETEの内部動作 {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **影響を受ける行に「マスク」が適用される**

   `DELETE FROM table ...`クエリが実行されると、ClickHouseは各行を「存在」または「削除済み」としてマークするマスクを保存します。これらの「削除済み」行は、後続のクエリでは省略されます。ただし、行が実際に削除されるのは、後続のマージ時のみです。このマスクの書き込みは、`ALTER TABLE ... DELETE`クエリで行われる処理よりもはるかに軽量です。

   マスクは、すべての可視行に対して`True`を、削除された行に対して`False`を格納する隠しシステムカラム`_row_exists`として実装されています。このカラムは、パート内の一部の行が削除された場合にのみパートに存在します。パート内のすべての値が`True`の場合、このカラムは存在しません。

2. **`SELECT`クエリがマスクを含むように変換される**

   マスクされたカラムがクエリで使用される場合、`SELECT ... FROM table WHERE condition`クエリは内部的に`_row_exists`の述語によって拡張され、次のように変換されます：

   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```

   実行時に、`_row_exists`カラムが読み取られ、どの行を返すべきでないかが判断されます。削除された行が多数ある場合、ClickHouseは残りのカラムを読み取る際に、どのグラニュールを完全にスキップできるかを判断できます。

3. **`DELETE`クエリが`ALTER TABLE ... UPDATE`クエリに変換される**

   `DELETE FROM table WHERE condition`は、`ALTER TABLE table UPDATE _row_exists = 0 WHERE condition`ミューテーションに変換されます。

   内部的に、このミューテーションは2つのステップで実行されます：
   1. 各個別パートに対して`SELECT count() FROM table WHERE condition`コマンドが実行され、そのパートが影響を受けるかどうかが判断されます。

   2. 上記のコマンドに基づいて、影響を受けるパートがミューテートされ、影響を受けないパートに対してはハードリンクが作成されます。ワイドパートの場合、各行の`_row_exists`カラムが更新され、他のすべてのカラムのファイルはハードリンクされます。コンパクトパートの場合、すべてのカラムが1つのファイルに格納されているため、すべてのカラムが再書き込みされます。

   上記のステップから、マスキング技術を使用した軽量`DELETE`は、影響を受けるパートのすべてのカラムファイルを再書き込みしないため、従来の`ALTER TABLE ... DELETE`よりもパフォーマンスが向上することがわかります。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
