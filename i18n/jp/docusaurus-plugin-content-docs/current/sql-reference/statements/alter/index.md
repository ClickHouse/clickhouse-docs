---
'description': 'ALTERのドキュメント'
'sidebar_label': 'ALTER'
'sidebar_position': 35
'slug': '/sql-reference/statements/alter/'
'title': 'ALTER'
'doc_type': 'reference'
---


# ALTER

ほとんどの `ALTER TABLE` クエリは、テーブルの設定やデータを変更します：

| 修飾子                                                                            |
|-------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                         |
| [PARTITION](/sql-reference/statements/alter/partition.md)                   |
| [DELETE](/sql-reference/statements/alter/delete.md)                         |
| [UPDATE](/sql-reference/statements/alter/update.md)                         |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                     |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                  |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                 |
| [TTL](/sql-reference/statements/alter/ttl.md)                               |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                 |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md) |

:::note
ほとんどの `ALTER TABLE` クエリは、[\*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md)、および [Distributed](/engines/table-engines/special/distributed.md) テーブルのみでサポートされています。
:::

これらの `ALTER` ステートメントはビューを操作します：

| ステートメント                                                                           | 説明                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [Materialized view](/sql-reference/statements/create/view) 構造を変更します。                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | [Live view](/sql-reference/statements/create/view.md/#live-view) を更新します。|

これらの `ALTER` ステートメントは、ロールベースのアクセス制御に関連するエンティティを修正します：

| ステートメント                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| ステートメント                                                                             | 説明                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルへのコメントを追加、修正、または削除します。以前に設定されているかどうかに関係なく。 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md) を修正します。                   |

## Mutations {#mutations}

テーブルデータを操作することを目的とした `ALTER` クエリは「ミューテーション」と呼ばれるメカニズムを使用して実装されています。特に [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) と [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) がこれに該当します。これらは、[MergeTree](/engines/table-engines/mergetree-family/index.md) テーブルのマージに類似した非同期のバックグラウンドプロセスで、新しい「変異」バージョンのパーツを生成します。

`*MergeTree` テーブルのミューテーションは **データパーツ全体を書き換える** ことによって実行されます。原子的ではなく、パーツは準備ができ次第変異パーツに置き換えられ、ミューテーション中に実行を開始した `SELECT` クエリは、すでに変異されたパーツのデータと、まだ変異していないパーツのデータを一緒に見ることになります。

ミューテーションは作成順に完全に順序付けされ、その順序で各パーツに適用されます。ミューテーションは `INSERT INTO` クエリとも部分的に順序付けがされており、ミューテーションが送信される前にテーブルに挿入されたデータは変異されますが、その後に挿入されたデータは変異されません。ミューテーションは挿入を何らかの方法でブロックすることはありません。

ミューテーションクエリは、ミューテーションエントリが追加され次第すぐに戻ります（レプリケートテーブルの場合は ZooKeeper に、非レプリケートテーブルの場合はファイルシステムに）。ミューテーション自体はシステムプロファイル設定を使用して非同期に実行されます。ミューテーションの進捗を追跡するには、[`system.mutations`](/operations/system-tables/mutations) テーブルを使用できます。成功裏に送信されたミューテーションは、ClickHouse サーバーが再起動されても実行を続けます。ミューテーションが送信された後はロールバックする方法はありませんが、何らかの理由でミューテーションがスタックした場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリでキャンセルすることができます。

完了したミューテーションのエントリはすぐには削除されません（保持されるエントリの数は `finished_mutations_to_keep` ストレージエンジンパラメータによって決定されます）。古いミューテーションエントリは削除されます。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

非レプリケートテーブルの場合、すべての `ALTER` クエリは同期的に実行されます。レプリケートテーブルの場合、クエリは ZooKeeper に適切なアクションの指示を追加し、アクションは可能な限り迅速に実行されます。しかし、クエリはこれらのアクションがすべてのレプリカで完了するのを待つことができます。

ミューテーションを作成する `ALTER` クエリ（例えば `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` など）については、同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを変更する他の `ALTER` クエリについては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機を設定できます。

アクティブでないレプリカがすべての `ALTER` クエリを実行するのを待つ時間（秒数）を [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリについて、`alter_sync = 2` であり、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間以上にアクティブでない場合、例外 `UNFINISHED` がスローされます。
:::

## Related content {#related-content}

- Blog: [ClickHouseでの更新と削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
