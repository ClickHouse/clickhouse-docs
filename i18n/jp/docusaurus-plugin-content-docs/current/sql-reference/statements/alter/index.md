---
description: 'ALTER のドキュメント'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: '/sql-reference/statements/alter/'
title: 'ALTER'
---




# ALTER

ほとんどの `ALTER TABLE` クエリは、テーブルの設定またはデータを変更します：

| モディファイア                                                                       |
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
ほとんどの `ALTER TABLE` クエリは、[＊MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md)、および[Distributed](/engines/table-engines/special/distributed.md) テーブルのみに対応しています。
:::

これらの `ALTER` ステートメントは、ビューを操作します：

| ステートメント                                                                           | 説明                                                                                      |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [Materialized view](/sql-reference/statements/create/view) 構造を変更します。                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | [Live view](/sql-reference/statements/create/view.md/#live-view) を更新します。|

これらの `ALTER` ステートメントは、ロールベースのアクセス制御に関連するエンティティを変更します：

| ステートメント                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| ステートメント                                                                             | 説明                                                                                           |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルにコメントを追加、変更、または削除します。以前に設定されていたかに関わらず。                                        |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md) を変更します。                   |

## Mutations {#mutations}

テーブルデータを操作することを目的とした `ALTER` クエリは、「ミューテーション」と呼ばれるメカニズムで実装されており、特に [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) および [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) が含まれます。これらは、[MergeTree](/engines/table-engines/mergetree-family/index.md) テーブルにおけるマージに似た非同期バックグラウンドプロセスであり、新しい「ミュータント」部分のバージョンを生成します。

`*MergeTree` テーブルに対するミューテーションは、**全データパーツの書き換え**によって実行されます。
原子性はなく、パーツは準備が整い次第、ミュータントパーツに置き換えられ、ミューテーション中に実行され始めた `SELECT` クエリは、既にミュータント化されたパーツからのデータと、まだミュータント化されていないパーツからのデータの両方を確認します。

ミューテーションは、その作成順に全て順序付けされ、順番に各パーツに適用されます。ミューテーションは、`INSERT INTO` クエリとの部分的な順序も持っており、ミューテーションが提出される前にテーブルに挿入されたデータはミュータント化され、ミューテーション以降に挿入されたデータはミュータント化されません。ミューテーションは、挿入を何らかの形でブロックしないことに注意してください。

ミューテーションクエリは、ミューテーションエントリが追加されるとすぐに返されます（レプリケートテーブルの場合は ZooKeeper に、非レプリケートテーブルの場合はファイルシステムに）。ミューテーション自体は、システムプロファイル設定を使用して非同期的に実行されます。ミューテーションの進行状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations) テーブルを使用できます。成功裏に送信されたミューテーションは、ClickHouse サーバーが再起動されても実行を続けます。提出後にミューテーションをロールバックする方法はありませんが、何らかの理由でミューテーションが停止した場合、それは [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリでキャンセル可能です。

完了したミューテーションのエントリはすぐには削除されません（保存されるエントリの数は `finished_mutations_to_keep` ストレージエンジンパラメータによって決定されます）。古いミューテーションエントリは削除されます。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

非レプリケートテーブルの場合、すべての `ALTER` クエリは同期的に実行されます。レプリケートテーブルの場合、クエリは適切なアクションの指示を `ZooKeeper` に追加するだけであり、アクション自体はできるだけ早く実行されます。ただし、このクエリは、すべてのレプリカでこれらのアクションが完了するのを待つことができます。

ミューテーションを作成する `ALTER` クエリ（例えば、`UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` を含むがこれに限られない）の場合、同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを変更する他の `ALTER` クエリに対しては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機を設定できます。

非アクティブなレプリカがすべての `ALTER` クエリを実行するのを待つ時間（秒単位）を、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリに対して、`alter_sync = 2` であり、指定された `replication_wait_for_inactive_replica_timeout` 設定の時間よりも長くアクティブでないレプリカが存在する場合、例外 `UNFINISHED` がスローされます。
:::

## Related content {#related-content}

- ブログ: [ClickHouse における更新と削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
