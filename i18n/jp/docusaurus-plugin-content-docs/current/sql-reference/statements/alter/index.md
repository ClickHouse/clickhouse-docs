---
description: 'ALTER に関するドキュメント'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
---



# ALTER {#alter}

ほとんどの `ALTER TABLE` クエリは、テーブルの設定またはデータを変更します。

| Modifier                                                                            |
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

次の `ALTER` ステートメントはビューを操作します。

| Statement                                                                           | Description                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [マテリアライズドビュー](/sql-reference/statements/create/view) の構造を変更します。                                       |

次の `ALTER` ステートメントは、ロールベースのアクセス制御に関連するエンティティを変更します。

| Statement                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Statement                                                                             | Description                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | コメントがあらかじめ設定されていたかどうかに関係なく、テーブルのコメントを追加、変更、または削除します。 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md) を変更します。                   |



## ミューテーション {#mutations}

テーブルデータを変更するための `ALTER` クエリは、「ミューテーション」と呼ばれるメカニズムで実装されています。代表的なものは [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) や [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) です。これらは [MergeTree](/engines/table-engines/mergetree-family/index.md) テーブルにおけるマージと類似した非同期のバックグラウンドプロセスで、新しい「ミューテートされた」パーツのバージョンを生成します。

`*MergeTree` テーブルでは、ミューテーションは **データパーツ全体を書き換えることによって** 実行されます。
アトミック性はなく、ミューテート済みパーツが準備でき次第、元のパーツはすぐに置き換えられます。そのため、ミューテーション実行中に開始された `SELECT` クエリは、すでにミューテートされたパーツのデータと、まだミューテートされていないパーツのデータの両方を見る可能性があります。

ミューテーションは作成順に完全に順序付けされ、その順序で各パーツに適用されます。また、ミューテーションと `INSERT INTO` クエリとの間には部分的な順序関係もあります。ミューテーションの送信前にテーブルに挿入されたデータはミューテーションの対象となり、その後に挿入されたデータはミューテーションの対象にはなりません。ミューテーションは挿入処理をいかなる形でもブロックしない点に注意してください。

ミューテーションのクエリは、ミューテーションエントリが追加されるとすぐに応答を返します（レプリケートされたテーブルの場合は ZooKeeper に、非レプリケートテーブルの場合はファイルシステムに追加されます）。ミューテーション自体はシステムプロファイル設定を用いて非同期に実行されます。ミューテーションの進行状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations) テーブルを使用できます。正常に送信されたミューテーションは、ClickHouse サーバーが再起動されても実行を継続します。一度送信されたミューテーションをロールバックする方法はありませんが、何らかの理由でミューテーションが停止している場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリでキャンセルできます。

完了したミューテーションのエントリはすぐには削除されません（保持されるエントリ数は `finished_mutations_to_keep` ストレージエンジンパラメータで決まります）。古いミューテーションエントリから順に削除されます。



## ALTER クエリの同期性 {#synchronicity-of-alter-queries}

非レプリケートテーブルに対しては、すべての `ALTER` クエリは同期的に実行されます。レプリケートテーブルに対しては、クエリは該当するアクションの指示を `ZooKeeper` に追加するだけで、アクション自体は可能な限り早く実行されます。ただし、クエリ側で、これらのアクションがすべてのレプリカで完了するまで待機させることも可能です。

ミューテーションを生成する `ALTER` クエリ（例：`UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` など、これらに限定されない）については、その同期動作は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを変更するその他の `ALTER` クエリについては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機動作を設定できます。

非アクティブなレプリカがすべての `ALTER` クエリを実行し終えるまで何秒間待機するかは、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリについて、`alter_sync = 2` であり、かつ一部のレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えて非アクティブな状態の場合、`UNFINISHED` という例外がスローされます。
:::



## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
