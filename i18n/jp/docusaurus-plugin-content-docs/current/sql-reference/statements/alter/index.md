---
description: 'ALTER のドキュメント'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
---


# ALTER

ほとんどの `ALTER TABLE` クエリは、テーブルの設定やデータを変更します：

| 修飾子                                                                               |
|--------------------------------------------------------------------------------------|
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
ほとんどの `ALTER TABLE` クエリは、[＊MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md)、および [Distributed](/engines/table-engines/special/distributed.md) テーブルのみにサポートされています。
:::

これらの `ALTER` ステートメントは、ビューを操作します：

| ステートメント                                                                         | 説明                                                                                  |
|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [Materialized view](/sql-reference/statements/create/view) 構造を修正します。                                  |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | [Live view](/sql-reference/statements/create/view.md/#live-view) を更新します。          |

これらの `ALTER` ステートメントは、役割ベースのアクセス制御に関連するエンティティを修正します：

| ステートメント                                                                       |
|---------------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| ステートメント                                                                           | 説明                                                                                  |
|-------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルにコメントを追加、修正、または削除します。設定されているかどうかにかかわらず。        |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md) を修正します。                       |

## Mutations {#mutations}

テーブルデータを操作することを目的とした `ALTER` クエリは、「ミューテーション」と呼ばれるメカニズムで実装され、特に [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) と [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) が含まれています。これらは、[MergeTree](/engines/table-engines/mergetree-family/index.md) テーブルのマージに類似した非同期バックグラウンドプロセスで、新しい「突然変異」バージョンのパーツを生成します。

`*MergeTree` テーブルにおいては、ミューテーションは **全データパーツを書き直すこと** によって実行されます。
原子性はありません — パーツは準備ができ次第、突然変異パーツと置き換えられ、ミューテーション中に開始された `SELECT` クエリは、すでに突然変異を受けたパーツのデータとまだ突然変異を受けていないパーツのデータを両方とも見ることになります。

ミューテーションは、その作成順序によって完全に順序付けられ、各パーツにその順序で適用されます。ミューテーションは `INSERT INTO` クエリとも部分的に順序付けされています：ミューテーションが提出される前にテーブルに挿入されたデータは突然変異を受け、ミューテーション後に挿入されたデータは突然変異を受けません。ミューテーションは挿入をどのようにもブロックしないことに注意してください。

ミューテーションクエリは、ミューテーションエントリが追加された時点で直ちに返されます（レプリケートテーブルの場合は ZooKeeper に、非レプリケートテーブルの場合はファイルシステムに）。ミューテーション自体は、システムプロファイル設定を使用して非同期に実行されます。ミューテーションの進行状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations) テーブルを使用できます。正常に提出されたミューテーションは、ClickHouse サーバーが再起動されても実行を続けます。一度提出されたミューテーションはロールバックする手段がありませんが、何らかの理由でミューテーションがスタックした場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリを使用してキャンセルできます。

完了したミューテーションのエントリはすぐには削除されません（保持されるエントリの数は、`finished_mutations_to_keep` ストレージエンジンパラメータによって決まります）。古いミューテーションエントリは削除されます。

## ALTER クエリの同期性 {#synchronicity-of-alter-queries}

非レプリケートテーブルの場合、すべての `ALTER` クエリは同期的に実行されます。レプリケートテーブルの場合、クエリは適切なアクションの指示を `ZooKeeper` に追加するだけで、アクション自体は可能な限り早く実行されます。ただし、クエリはこれらのアクションがすべてのレプリカで完了するのを待つことができます。

ミューテーションを生成する `ALTER` クエリ（例：`UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` を含むがこれに限定されない）の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを修正する他の `ALTER` クエリに対しては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機を設定できます。

非アクティブなレプリカがすべての `ALTER` クエリを実行するのを待機する秒数を [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリに対して、`alter_sync = 2` で、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定した時間以上アクティブでない場合、例外 `UNFINISHED` がスローされます。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
