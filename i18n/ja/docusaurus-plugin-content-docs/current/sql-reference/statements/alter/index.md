---
slug: /sql-reference/statements/alter/
sidebar_position: 35
sidebar_label: ALTER
---

# ALTER

ほとんどの `ALTER TABLE` クエリは、テーブルの設定またはデータを変更します：

| 修飾子                                                                                   |
|------------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                               |
| [PARTITION](/sql-reference/statements/alter/partition.md)                         |
| [DELETE](/sql-reference/statements/alter/delete.md)                               |
| [UPDATE](/sql-reference/statements/alter/update.md)                               |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                           |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                        |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                       |
| [TTL](/sql-reference/statements/alter/ttl.md)                                     |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                       |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md)       |

:::note
ほとんどの `ALTER TABLE` クエリは、[*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md) および [Distributed](/engines/table-engines/special/distributed.md) テーブルに対してのみサポートされています。
:::

これらの `ALTER` 文は、ビューを操作します：

| 文                                                                                   | 説明                                                                                     |
|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)       | [マテリアライズドビュー](/sql-reference/statements/create/view.md/#materialized) 構造を修正します。                            |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view.md/#alter-live-view)   | [ライブビュー](/sql-reference/statements/create/view.md/#live-view) を更新します。                                          |

これらの `ALTER` 文は、役割ベースのアクセス制御に関連するエンティティを変更します：

| 文                                                                                   |
|--------------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                                |
| [ROLE](/sql-reference/statements/alter/role.md)                                |
| [QUOTA](/sql-reference/statements/alter/quota.md)                              |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)                    |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md)        |

| 文                                                                                   | 説明                                                                                      |
|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルにコメントを追加、修正、または削除します。以前に設定されていたかどうかにかかわらず。                     |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [名前付きコレクション](/operations/named-collections.md) を修正します。                                     |

## Mutations {#mutations}

テーブルデータを操作することを目的とした `ALTER` クエリは、「ミューテーション」と呼ばれるメカニズムで実装されます。特に [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) および [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) が該当します。これらは、[MergeTree](/engines/table-engines/mergetree-family/index.md) テーブルにおけるマージに類似した非同期バックグラウンドプロセスで、新しい「変異した」バージョンのパーツを生成します。

`*MergeTree` テーブルのミューテーションは **全データパーツを再書き込み** することによって実行されます。原子性はありません — パーツは変異したパーツが準備でき次第置き換えられ、ミューテーション中に実行が始まった `SELECT` クエリは、すでに変異したパーツのデータと、まだ変異していないパーツのデータを共に見ることになります。

ミューテーションは作成順に完全に順序付けされ、順序通りに各パーツに適用されます。ミューテーションは `INSERT INTO` クエリとも部分的に順序付けされます：ミューテーションが提出される前にテーブルに挿入されたデータは変異され、その後に挿入されたデータは変異されません。ミューテーションは挿入を何らかの形でブロックすることはありません。

ミューテーションクエリは、ミューテーションエントリが追加された直後に戻ります（レプリケーションテーブルの場合は ZooKeeper に、非レプリケーションテーブルの場合はファイルシステムに）。ミューテーション自体はシステムプロファイル設定を使用して非同期に実行されます。ミューテーションの進行状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations.md/#system_tables-mutations) テーブルを使用できます。正常に提出されたミューテーションは、ClickHouse サーバーが再起動されても実行を続けます。一度提出されたミューテーションを元に戻す方法はありませんが、何らかの理由でミューテーションがスタックした場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリでキャンセルできます。

完了したミューテーションのエントリはすぐには削除されません（保持されるエントリの数は `finished_mutations_to_keep` ストレージエンジンパラメータで決定されます）。古いミューテーションエントリは削除されます。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

非レプリケーションテーブルでは、すべての `ALTER` クエリは同期的に実行されます。レプリケーションテーブルの場合、クエリは適切なアクションの指示を `ZooKeeper` に追加するだけで、アクション自体はできるだけ早く実行されます。ただし、クエリはすべてのレプリカ上でこれらのアクションが完了するのを待つことができます。

ミューテーションを作成する `ALTER` クエリ（例：`UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` など）については、同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを変更する他の `ALTER` クエリについては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機を設定できます。

非アクティブなレプリカがすべての `ALTER` クエリを実行するのを待つ時間（秒単位）を [replication_wait_for_inactive_replica_timeout](/operations/settings/settings.md/#replication-wait-for-inactive-replica-timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリにおいて、`alter_sync = 2` であり、一部のレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えて非アクティブな場合、例外 `UNFINISHED` が発生します。
:::

## Related content {#related-content}

- ブログ: [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
