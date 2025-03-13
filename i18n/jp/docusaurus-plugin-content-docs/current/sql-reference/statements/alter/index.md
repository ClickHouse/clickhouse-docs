---
slug: '/sql-reference/statements/alter/'
sidebar_position: 35
sidebar_label: 'ALTER'
---


# ALTER

ほとんどの `ALTER TABLE` クエリはテーブルの設定やデータを変更します：

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
ほとんどの `ALTER TABLE` クエリは、[\*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md)、および [Distributed](/engines/table-engines/special/distributed.md) テーブルに対してのみサポートされています。
:::

これらの `ALTER` ステートメントはビューを操作します：

| ステートメント                                                                           | 説明                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [マテリアライズドビュー](/sql-reference/statements/create/view) 構造を変更します。                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | [ライブビュー](/sql-reference/statements/create/view.md/#live-view) を更新します。|

これらの `ALTER` ステートメントは、ロールベースのアクセス制御に関連するエンティティを変更します：

| ステートメント                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| ステートメント                                                                             | 説明                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルにコメントを追加、変更、または削除します。以前に設定されていたかどうかに関係なく。 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [名前付きコレクション](/operations/named-collections.md) を変更します。                   |

## Mutations {#mutations}

テーブルデータを操作することを目的とした `ALTER` クエリは、「ミューテーション」と呼ばれるメカニズムで実装されます。特に [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) と [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) が含まれます。これらは [MergeTree](/engines/table-engines/mergetree-family/index.md) テーブル内のマージに似た非同期のバックグラウンドプロセスで、新しい「変異」バージョンのパーツを生成します。

`*MergeTree` テーブルでは、ミューテーションは **データの全パーツを書き直すことによって実行されます**。
原子性はありません — パーツは、準備ができ次第、変異したパーツに置き換えられます。変異中に実行を開始した `SELECT` クエリは、まだ変異されていないパーツのデータと、すでに変異されたパーツのデータを見ます。

ミューテーションはその作成順序で完全に順序付けられており、その順序で各パーツに適用されます。ミューテーションは `INSERT INTO` クエリとも部分的に順序付けされています：ミューテーションが提出される前にテーブルに挿入されたデータが変異され、挿入された後のデータは変異されません。ミューテーションは、挿入をいかなる形でもブロックしないことに注意してください。

ミューテーションクエリは、ミューテーションエントリが追加された後すぐに返されます（レプリケーションテーブルの場合は ZooKeeper に、非レプリケーションテーブルの場合はファイルシステムに）。ミューテーション自体は、システムプロファイル設定を使用して非同期に実行されます。ミューテーションの進捗状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations) テーブルを使用できます。正常に提出されたミューテーションは、ClickHouse サーバーが再起動されても実行を続けます。ミューテーションが一度提出された後はロールバックする方法はありませんが、何らかの理由でミューテーションがハングした場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリでキャンセルできます。

終了したミューテーションのエントリはすぐには削除されず（保持するエントリの数は `finished_mutations_to_keep` ストレージエンジンパラメータによって決まります）、古いミューテーションエントリが削除されます。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

非レプリケーションテーブルの場合、すべての `ALTER` クエリは同期的に実行されます。レプリケーションテーブルの場合、クエリは適切なアクションの指示を `ZooKeeper` に追加するだけで、アクション自体は可能な限り早く実行されます。ただし、クエリはすべてのレプリカでこれらのアクションが完了するのを待つことができます。

ミューテーションを作成する `ALTER` クエリ（例：`UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` を含むがこれに限定されない）については、同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを変更する他の `ALTER` クエリについては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機を設定できます。

非アクティブなレプリカがすべての `ALTER` クエリを実行するのを待つ時間（秒単位）を、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリについて、`alter_sync = 2` であり、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間以上非アクティブな場合、`UNFINISHED` という例外がスローされます。
:::

## Related content {#related-content}

- Blog: [Handling Updates and Deletes in ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
