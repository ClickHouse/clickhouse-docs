---
description: 'ALTER ステートメントのドキュメント'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
---



# ALTER

ほとんどの `ALTER TABLE` クエリは、テーブルの設定またはデータを変更します：

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
ほとんどの `ALTER TABLE` クエリは、[\*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md)、および [Distributed](/engines/table-engines/special/distributed.md) テーブルでのみサポートされています。
:::

これらの `ALTER` ステートメントはビューを操作します：

| ステートメント                                                                           | 説明                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [Materialized view](/sql-reference/statements/create/view) の構造を変更します。                                       |

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
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルのコメントを、以前に設定されていたかどうかに関係なく追加、変更、または削除します。 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md) を変更します。                   |



## ミューテーション {#mutations}

テーブルデータを操作するための`ALTER`クエリは、「ミューテーション」と呼ばれる仕組みで実装されています。代表的なものとして[ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md)と[ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)があります。これらは[MergeTree](/engines/table-engines/mergetree-family/index.md)テーブルにおけるマージと同様の非同期バックグラウンドプロセスであり、パーツの新しい「ミューテーション済み」バージョンを生成します。

`*MergeTree`テーブルでは、ミューテーションは**データパーツ全体を書き換える**ことで実行されます。
原子性はありません。パーツは準備が整い次第、ミューテーション済みパーツに置き換えられ、ミューテーション中に実行を開始した`SELECT`クエリは、既にミューテーション済みのパーツからのデータと、まだミューテーションされていないパーツからのデータの両方を参照します。

ミューテーションは作成順序によって完全に順序付けられ、その順序で各パーツに適用されます。ミューテーションは`INSERT INTO`クエリとも部分的に順序付けられます。ミューテーションが送信される前にテーブルに挿入されたデータはミューテーションされ、その後に挿入されたデータはミューテーションされません。なお、ミューテーションは挿入を一切ブロックしません。

ミューテーションクエリは、ミューテーションエントリが追加された直後に戻ります(レプリケートされたテーブルの場合はZooKeeperに、非レプリケートテーブルの場合はファイルシステムに)。ミューテーション自体はシステムプロファイル設定を使用して非同期に実行されます。ミューテーションの進行状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations)テーブルを使用できます。正常に送信されたミューテーションは、ClickHouseサーバーが再起動されても実行を継続します。一度送信されたミューテーションをロールバックする方法はありませんが、何らかの理由でミューテーションが停止している場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation)クエリでキャンセルできます。

完了したミューテーションのエントリはすぐには削除されません(保持されるエントリ数は`finished_mutations_to_keep`ストレージエンジンパラメータによって決定されます)。古いミューテーションエントリは削除されます。


## ALTERクエリの同期性 {#synchronicity-of-alter-queries}

非レプリケートテーブルでは、すべての`ALTER`クエリが同期的に実行されます。レプリケートテーブルでは、クエリは適切なアクションの指示を`ZooKeeper`に追加するのみで、アクション自体は可能な限り速やかに実行されます。ただし、クエリはこれらのアクションがすべてのレプリカで完了するまで待機することができます。

ミューテーションを作成する`ALTER`クエリ(例: `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC`など)の場合、同期性は[mutations_sync](/operations/settings/settings.md/#mutations_sync)設定によって定義されます。

メタデータのみを変更するその他の`ALTER`クエリの場合、[alter_sync](/operations/settings/settings#alter_sync)設定を使用して待機を設定できます。

非アクティブなレプリカがすべての`ALTER`クエリを実行するまでの待機時間(秒単位)は、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout)設定で指定できます。

:::note
すべての`ALTER`クエリにおいて、`alter_sync = 2`であり、かつ一部のレプリカが`replication_wait_for_inactive_replica_timeout`設定で指定された時間を超えて非アクティブである場合、`UNFINISHED`例外がスローされます。
:::


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
