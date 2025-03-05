---
slug: /sql-reference/statements/alter/
sidebar_position: 35
sidebar_label: ALTER
---


# ALTER

ほとんどの `ALTER TABLE` クエリはテーブルの設定またはデータを変更します：

| 修飾子                                                                            |
|-----------------------------------------------------------------------------------|
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
ほとんどの `ALTER TABLE` クエリは [\*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md)、および [Distributed](/engines/table-engines/special/distributed.md) テーブルのみに対応しています。
:::

これらの `ALTER` ステートメントはビューを操作します：

| ステートメント                                                                       | 説明                                                                                   |
|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | [Materialized view](/sql-reference/statements/create/view) 構造を変更します。               |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view.md/#alter-live-view) | [Live view](/sql-reference/statements/create/view.md/#live-view) をリフレッシュします。 |

これらの `ALTER` ステートメントは、役割ベースのアクセス制御に関連するエンティティを変更します：

| ステートメント                                                                   |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| ステートメント                                                                             | 説明                                                                                      |
|--------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | テーブルにコメントを追加、変更、または削除します。既に設定されていたかどうかに関わらず。                  |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | [Named Collections](/operations/named-collections.md) を変更します。                         |

## 変異 {#mutations}

テーブルデータを操作することを目的とした `ALTER` クエリは、「変異」というメカニズムを使用して実装されます。特に [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) や [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md) が該当します。これらは、[MergeTree](/engines/table-engines/mergetree-family/index.md) テーブルにおけるマージに似た非同期のバックグラウンドプロセスであり、新しい「変異」パーツのバージョンを生成します。

`*MergeTree` テーブルの変異は **データパーツ全体を再記述することによって実行されます**。 
原子的な操作はありません — パーツは変異されたパーツが準備ができ次第、置き換えられます。変異中に実行され始めた `SELECT` クエリは、既に変異されたパーツのデータと、まだ変異されていないパーツのデータの両方を参照します。

変異はその作成順序によって完全に順序付けられ、各パーツにその順序で適用されます。変異はまた `INSERT INTO` クエリと部分的に順序付けられます：変異が送信される前にテーブルに挿入されたデータは変異され、後に挿入されたデータは変異されません。なお、変異は挿入を一切ブロックしません。

変異クエリは、変異エントリが追加された後すぐに返されます（レプリケートされたテーブルの場合は ZooKeeper に、非レプリケートのテーブルの場合はファイルシステムに）。変異自体は、システムプロファイル設定を使用して非同期で実行されます。変異の進行状況を追跡するには、[`system.mutations`](/operations/system-tables/mutations.md/#system_tables-mutations) テーブルを利用できます。成功した変異は、ClickHouse サーバーが再起動された場合でも実行を続けます。一度送信された変異はロールバックすることはできませんが、何らかの理由で変異がスタックした場合は、[`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) クエリでキャンセルできます。

完了した変異のエントリはすぐには削除されません（保存されるエントリの数は `finished_mutations_to_keep` ストレージエンジンパラメーターによって決まります）。古い変異エントリは削除されます。

## ALTERクエリの同期性 {#synchronicity-of-alter-queries}

非レプリケートテーブルの場合、すべての `ALTER` クエリは同期的に実行されます。レプリケートテーブルの場合、クエリは適切なアクションの指示を `ZooKeeper` に追加するだけであり、アクション自体は可能な限り早く実行されます。ただし、クエリはすべてのレプリカでこれらのアクションが完了するのを待つことができます。

変異を生成する `ALTER` クエリ（例えば、`UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC` を含むがこれに限りません）については、同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。

メタデータのみを変更する他の `ALTER` クエリについては、[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して待機を設定できます。

非アクティブなレプリカがすべての `ALTER` クエリを実行するまでの待機時間（秒単位）を [replication_wait_for_inactive_replica_timeout](/operations/settings/settings.md/#replication-wait-for-inactive-replica-timeout) 設定で指定できます。

:::note
すべての `ALTER` クエリについて、`alter_sync = 2` で、`replication_wait_for_inactive_replica_timeout` 設定で指定された時間以上に非アクティブなレプリカがある場合、`UNFINISHED` という例外がスローされます。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
