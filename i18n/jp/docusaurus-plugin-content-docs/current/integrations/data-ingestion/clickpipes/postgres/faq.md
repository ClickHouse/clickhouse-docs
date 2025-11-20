---
sidebar_label: 'FAQ'
description: 'ClickPipes for Postgres に関するよくある質問'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres FAQ'
keywords: ['postgres faq', 'clickpipes', 'toast columns', 'replication slot', 'publications']
doc_type: 'reference'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# ClickPipes for Postgres FAQ

### アイドリングはPostgres CDC ClickPipeにどのような影響を与えますか？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

ClickHouse Cloudサービスがアイドリング状態の場合でも、Postgres CDC ClickPipeはデータの同期を継続します。次の同期間隔でサービスが起動し、受信データを処理します。同期が完了してアイドル期間に達すると、サービスは再びアイドリング状態に戻ります。

例えば、同期間隔が30分、サービスのアイドル時間が10分に設定されている場合、サービスは30分ごとに起動して10分間アクティブになり、その後再びアイドリング状態に戻ります。

### ClickPipes for PostgresではTOASTカラムはどのように処理されますか？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

詳細については、[TOASTカラムの処理](./toast)ページを参照してください。

### ClickPipes for Postgresでは生成カラムはどのように処理されますか？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

詳細については、[Postgres生成カラム：注意点とベストプラクティス](./generated_columns)ページを参照してください。

### Postgres CDCの対象となるにはテーブルに主キーが必要ですか？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

ClickPipes for Postgresを使用してテーブルをレプリケートするには、主キーまたは[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)のいずれかが定義されている必要があります。

- **主キー**: 最も簡単な方法は、テーブルに主キーを定義することです。これにより各行に一意の識別子が提供され、更新や削除を追跡する上で重要です。この場合、REPLICA IDENTITYは`DEFAULT`（デフォルトの動作）に設定できます。
- **レプリカアイデンティティ**: テーブルに主キーがない場合は、レプリカアイデンティティを設定できます。レプリカアイデンティティを`FULL`に設定すると、行全体が変更の識別に使用されます。または、テーブルに一意インデックスが存在する場合はそれを使用するように設定し、REPLICA IDENTITYを`USING INDEX index_name`に設定することもできます。
  レプリカアイデンティティをFULLに設定するには、次のSQLコマンドを使用します：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

REPLICA IDENTITY FULLは、変更されていないTOASTカラムのレプリケーションも有効にします。詳細は[こちら](./toast)を参照してください。

`REPLICA IDENTITY FULL`の使用は、特に主キーがなく頻繁に更新や削除が行われるテーブルの場合、パフォーマンスへの影響やWALの増加速度が速くなる可能性があることに注意してください。これは、各変更に対してより多くのデータをログに記録する必要があるためです。テーブルの主キーやレプリカアイデンティティの設定について疑問がある場合や支援が必要な場合は、サポートチームにお問い合わせください。

主キーもレプリカアイデンティティも定義されていない場合、ClickPipesはそのテーブルの変更をレプリケートできず、レプリケーション処理中にエラーが発生する可能性があることに注意が必要です。そのため、ClickPipeを設定する前に、テーブルスキーマを確認し、これらの要件を満たしていることを確認することを推奨します。

### Postgres CDCの一部としてパーティションテーブルはサポートされていますか？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、PRIMARY KEYまたはREPLICA IDENTITYが定義されている限り、パーティションテーブルは標準でサポートされています。PRIMARY KEYとREPLICA IDENTITYは、親テーブルとそのパーティションの両方に存在する必要があります。詳細は[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)をご覧ください。

### パブリックIPを持たない、またはプライベートネットワーク内にあるPostgresデータベースに接続できますか？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！ClickPipes for Postgresは、プライベートネットワーク内のデータベースに接続する2つの方法を提供しています：

1. **SSHトンネリング**
   - ほとんどのユースケースで適切に機能します
   - セットアップ手順は[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)を参照してください
   - すべてのリージョンで動作します

2. **AWS PrivateLink**
   - 3つのAWSリージョンで利用可能：
     - us-east-1
     - us-east-2
     - eu-central-1
   - 詳細なセットアップ手順については、[PrivateLinkドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください
   - PrivateLinkが利用できないリージョンでは、SSHトンネリングを使用してください


### UPDATEとDELETEはどのように処理されますか？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for PostgresはPostgresからのINSERTとUPDATEの両方を、異なるバージョンを持つ新しい行として（`_peerdb_`バージョン列を使用して）ClickHouseに取り込みます。ReplacingMergeTreeテーブルエンジンは、順序キー(ORDER BY列)に基づいてバックグラウンドで定期的に重複排除を実行し、最新の`_peerdb_`バージョンを持つ行のみを保持します。

PostgresからのDELETEは、削除済みとしてマークされた新しい行として（`_peerdb_is_deleted`列を使用して）伝播されます。重複排除プロセスは非同期であるため、一時的に重複が表示される場合があります。これに対処するには、クエリレイヤーで重複排除を処理する必要があります。

また、デフォルトでは、PostgresはDELETE操作時にプライマリキーまたはレプリカアイデンティティの一部ではない列の値を送信しないことに注意してください。DELETE時に完全な行データを取得したい場合は、[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)をFULLに設定できます。

詳細については、以下を参照してください:

- [ReplacingMergeTreeテーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
- [PostgresからClickHouseへのCDC内部構造に関するブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### PostgreSQLでプライマリキー列を更新できますか？ {#can-i-update-primary-key-columns-in-postgresql}

:::warning
デフォルトでは、PostgreSQLでのプライマリキーの更新はClickHouseで適切に再現できません。

この制限は、`ReplacingMergeTree`の重複排除が`ORDER BY`列(通常はプライマリキーに対応)に基づいて動作するために存在します。PostgreSQLでプライマリキーが更新されると、既存の行の更新ではなく、異なるキーを持つ新しい行としてClickHouseに表示されます。これにより、古いプライマリキー値と新しいプライマリキー値の両方がClickHouseテーブルに存在する可能性があります。
:::

プライマリキー列の更新は、プライマリキーが不変の識別子として意図されているため、PostgreSQLデータベース設計では一般的な慣行ではないことに注意してください。ほとんどのアプリケーションは設計上プライマリキーの更新を避けているため、この制限は典型的なユースケースではほとんど遭遇しません。

プライマリキー更新の処理を有効にできる実験的な設定がありますが、パフォーマンスへの大きな影響を伴うため、慎重な検討なしに本番環境での使用は推奨されません。

PostgreSQLでプライマリキー列を更新し、それらの変更をClickHouseに適切に反映させる必要があるユースケースの場合は、具体的な要件と潜在的な解決策について議論するため、[db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com)のサポートチームまでお問い合わせください。

### スキーマ変更はサポートされていますか？ {#do-you-support-schema-changes}

詳細については、[ClickPipes for Postgres: スキーマ変更の伝播サポート](./schema-changes)ページを参照してください。

### ClickPipes for Postgres CDCのコストはどのくらいですか？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

詳細な価格情報については、[メイン請求概要ページのClickPipes for Postgres CDC価格セクション](/cloud/reference/billing/clickpipes)を参照してください。

### レプリケーションスロットのサイズが増加している、または減少しない場合、何が問題でしょうか？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgresレプリケーションスロットのサイズが増加し続けている、または減少しない場合、通常は**WAL(Write-Ahead Log)レコードがCDCパイプラインまたはレプリケーションプロセスによって十分に速く消費(または「再生」)されていない**ことを意味します。以下は最も一般的な原因とその対処方法です。

1. **データベースアクティビティの急激な増加**
   - 大規模なバッチ更新、一括挿入、または重要なスキーマ変更により、大量のWALデータが迅速に生成される可能性があります。
   - レプリケーションスロットは、これらのWALレコードが消費されるまで保持するため、サイズの一時的な急増を引き起こします。

2. **長時間実行されるトランザクション**
   - オープンなトランザクションは、トランザクション開始以降に生成されたすべてのWALセグメントをPostgresに保持させるため、スロットサイズが劇的に増加する可能性があります。
   - トランザクションが無期限にオープンのままにならないように、`statement_timeout`と`idle_in_transaction_session_timeout`を適切な値に設定してください:
     ```sql
     SELECT
         pid,
         state,
         age(now(), xact_start) AS transaction_duration,
         query AS current_query
     FROM
         pg_stat_activity
     WHERE
         xact_start IS NOT NULL
     ORDER BY
         age(now(), xact_start) DESC;
     ```
     このクエリを使用して、異常に長時間実行されているトランザクションを特定してください。


3. **メンテナンスまたはユーティリティ操作(例:`pg_repack`)**
   - `pg_repack`のようなツールはテーブル全体を書き換えることができ、短時間で大量のWALデータを生成します。
   - これらの操作はトラフィックが少ない時間帯にスケジュールするか、実行中はWAL使用量を注意深く監視してください。

4. **VACUUMおよびVACUUM ANALYZE**
   - データベースの健全性には必要ですが、これらの操作は追加のWALトラフィックを生成する可能性があります。特に大きなテーブルをスキャンする場合は顕著です。
   - autovacuumのチューニングパラメータを使用するか、手動のVACUUM操作をオフピーク時にスケジュールすることを検討してください。

5. **レプリケーションコンシューマーがスロットをアクティブに読み取っていない**
   - CDCパイプライン(例:ClickPipes)または他のレプリケーションコンシューマーが停止、一時停止、またはクラッシュした場合、WALデータはスロット内に蓄積されます。
   - パイプラインが継続的に実行されていることを確認し、接続または認証エラーのログを確認してください。

このトピックの詳細については、ブログ記事をご覧ください:[Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)

### Postgresのデータ型はClickHouseにどのようにマッピングされますか? {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for PostgresはPostgresのデータ型をClickHouse側でできるだけネイティブにマッピングすることを目指しています。このドキュメントでは、各データ型とそのマッピングの包括的なリストを提供しています:[Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix)

### PostgresからClickHouseへデータをレプリケートする際に、独自のデータ型マッピングを定義できますか? {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現在、パイプの一部としてカスタムデータ型マッピングを定義することはサポートしていません。ただし、ClickPipesが使用するデフォルトのデータ型マッピングは非常にネイティブであることに注意してください。Postgresのほとんどのカラム型は、ClickHouse上のネイティブな同等物にできるだけ近い形でレプリケートされます。例えば、Postgresの整数配列型は、ClickHouseでも整数配列型としてレプリケートされます。

### PostgresからのJSONおよびJSONBカラムはどのようにレプリケートされますか? {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSONおよびJSONBカラムは、ClickHouseではString型としてレプリケートされます。ClickHouseはネイティブな[JSON型](/sql-reference/data-types/newjson)をサポートしているため、必要に応じてClickPipesテーブル上にマテリアライズドビューを作成して変換を実行できます。または、Stringカラムに対して直接[JSON関数](/sql-reference/functions/json-functions)を使用することもできます。現在、JSONおよびJSONBカラムをClickHouseのJSON型に直接レプリケートする機能を積極的に開発中です。この機能は数か月以内に利用可能になる予定です。

### ミラーが一時停止されたときに挿入はどうなりますか? {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソースPostgresのレプリケーションスロットにキューイングされ、バッファリングされて失われないことが保証されます。ただし、ミラーを一時停止して再開すると接続が再確立されるため、ソースによっては時間がかかる場合があります。

このプロセス中、sync(Postgresからデータを取得してClickHouseのrawテーブルにストリーミング)とnormalize(rawテーブルからターゲットテーブルへ)の両方の操作が中止されます。ただし、永続的に再開するために必要な状態は保持されます。

- syncの場合、途中でキャンセルされても、Postgresのconfirmed_flush_lsnは進められないため、次のsyncは中止されたものと同じ位置から開始され、データの一貫性が保証されます。
- normalizeの場合、ReplacingMergeTreeの挿入順序が重複排除を処理します。

要約すると、一時停止中にsyncとnormalizeのプロセスは終了しますが、データの損失や不整合なしに再開できるため、安全に実行できます。

### ClickPipeの作成を自動化したり、APIまたはCLI経由で実行できますか? {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipeは[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)エンドポイント経由でも作成および管理できます。この機能はベータ版であり、APIリファレンスは[こちら](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)で確認できます。また、Postgres ClickPipesを作成するためのTerraformサポートも積極的に開発中です。

### 初期ロードを高速化するにはどうすればよいですか? {#how-do-i-speed-up-my-initial-load}


既に実行中の初期ロードを高速化することはできません。ただし、特定の設定を調整することで、今後の初期ロードを最適化できます。デフォルトでは、4つの並列スレッドと、パーティションあたりのスナップショット行数が100,000に設定されています。これらは高度な設定であり、ほとんどのユースケースには十分です。

Postgresバージョン13以前では、CTIDレンジスキャンが遅く、これらの設定がより重要になります。このような場合、パフォーマンスを向上させるために次のプロセスを検討してください:

1. **既存のパイプを削除する**: 新しい設定を適用するために必要です。
2. **ClickHouse上の宛先テーブルを削除する**: 以前のパイプによって作成されたテーブルが削除されていることを確認してください。
3. **最適化された設定で新しいパイプを作成する**: 通常、特定の要件とPostgresインスタンスが処理できる負荷に応じて、パーティションあたりのスナップショット行数を100万から1000万の間に増やします。

これらの調整により、特に古いPostgresバージョンでは初期ロードのパフォーマンスが大幅に向上します。Postgres 14以降を使用している場合、CTIDレンジスキャンのサポートが改善されているため、これらの設定の影響は小さくなります。

### レプリケーションを設定する際、パブリケーションのスコープをどのように設定すべきですか? {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipesにパブリケーションを管理させる(追加の権限が必要)か、自分で作成することができます。ClickPipes管理のパブリケーションでは、パイプを編集する際にテーブルの追加と削除を自動的に処理します。自己管理する場合は、レプリケーションが必要なテーブルのみを含むようにパブリケーションのスコープを慎重に設定してください。不要なテーブルを含めると、PostgresのWALデコードが遅くなります。

パブリケーションにテーブルを含める場合は、そのテーブルに主キーまたは`REPLICA IDENTITY FULL`のいずれかが設定されていることを確認してください。主キーのないテーブルがある場合、すべてのテーブルに対してパブリケーションを作成すると、それらのテーブルでDELETEおよびUPDATE操作が失敗します。

データベース内で主キーのないテーブルを特定するには、次のクエリを使用できます:

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE
    (table_catalog, table_schema, table_name) NOT IN (
        SELECT table_catalog, table_schema, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'PRIMARY KEY') AND
    table_schema NOT IN ('information_schema', 'pg_catalog', 'pgq', 'londiste');
```

主キーのないテーブルを扱う場合、2つのオプションがあります:

1. **主キーのないテーブルをClickPipesから除外する**:
   主キーを持つテーブルのみでパブリケーションを作成します:

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **主キーのないテーブルをClickPipesに含める**:
   主キーのないテーブルを含める場合は、そのレプリカアイデンティティを`FULL`に変更する必要があります。これにより、UPDATEおよびDELETE操作が正しく動作することが保証されます:
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
ClickPipesに管理させる代わりに手動でパブリケーションを作成する場合、`FOR ALL TABLES`でパブリケーションを作成することは推奨しません。これにより、PostgresからClickPipesへのトラフィックが増加し(パイプに含まれていない他のテーブルの変更を送信するため)、全体的な効率が低下します。

手動で作成したパブリケーションの場合、パイプに追加する前に、必要なテーブルをパブリケーションに追加してください。
:::

:::warning
Postgresのリードレプリカ/ホットスタンバイからレプリケーションする場合、プライマリインスタンス上で独自のパブリケーションを作成する必要があります。これは自動的にスタンバイに伝播されます。この場合、スタンバイ上でパブリケーションを作成できないため、ClickPipeはパブリケーションを管理できません。
:::

### 推奨される`max_slot_wal_keep_size`設定 {#recommended-max_slot_wal_keep_size-settings}

- **最低限:** [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)を設定して、少なくとも**2日分**のWALデータを保持します。
- **大規模データベース(高トランザクション量)の場合:** 1日あたりのピークWAL生成量の少なくとも**2〜3倍**を保持します。
- **ストレージに制約のある環境の場合:** レプリケーションの安定性を確保しながら、**ディスク容量の枯渇を回避する**ために、この設定を控えめに調整します。

#### 適切な値を計算する方法 {#how-to-calculate-the-right-value}

適切な設定を決定するには、WAL生成レートを測定します:

##### PostgreSQL 10以降の場合 {#for-postgresql-10}


```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

##### PostgreSQL 9.6以前の場合: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

- 上記のクエリを1日の異なる時間帯、特にトランザクションが集中する時間帯に実行します。
- 24時間あたりに生成されるWALの量を計算します。
- その数値に2または3を掛けて、十分な保持容量を確保します。
- `max_slot_wal_keep_size`を算出された値(MBまたはGB単位)に設定します。

##### 例 {#example}

データベースが1日あたり100 GBのWALを生成する場合、次のように設定します:

```sql
max_slot_wal_keep_size = 200GB
```

### ログにReceiveMessage EOFエラーが表示されます。これは何を意味しますか? {#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean}

`ReceiveMessage`はPostgresの論理デコーディングプロトコルにおける関数で、レプリケーションストリームからメッセージを読み取ります。EOF(End of File)エラーは、レプリケーションストリームからの読み取り中にPostgresサーバーへの接続が予期せず切断されたことを示します。

これは回復可能な非致命的エラーです。ClickPipesは自動的に再接続を試み、レプリケーションプロセスを再開します。

このエラーはいくつかの理由で発生する可能性があります:

- **wal_sender_timeoutが低い:** `wal_sender_timeout`が5分以上に設定されていることを確認してください。この設定は、接続を切断する前にサーバーがクライアントからの応答を待機する時間を制御します。タイムアウトが低すぎると、早期の切断につながる可能性があります。
- **ネットワークの問題:** 一時的なネットワークの中断により、接続が切断される可能性があります。
- **Postgresサーバーの再起動:** Postgresサーバーが再起動またはクラッシュすると、接続が失われます。

### レプリケーションスロットが無効化されました。どうすればよいですか? {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipeを復旧する唯一の方法は、設定ページで再同期をトリガーすることです。

レプリケーションスロット無効化の最も一般的な原因は、PostgreSQLデータベースの`max_slot_wal_keep_size`設定が低い(例: 数ギガバイト)ことです。この値を増やすことをお勧めします。`max_slot_wal_keep_size`のチューニングについては、[このセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)を参照してください。理想的には、レプリケーションスロットの無効化を防ぐために、少なくとも200GBに設定する必要があります。

まれなケースですが、`max_slot_wal_keep_size`が設定されていない場合でもこの問題が発生することがあります。これはPostgreSQLの複雑でまれなバグによるものである可能性がありますが、原因は不明です。

### ClickPipeがデータを取り込んでいる間にClickHouseでメモリ不足(OOM)が発生しています。対処方法を教えてください。 {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouseでOOMが発生する一般的な理由の1つは、サービスのリソースが不足していることです。これは、現在のサービス構成が取り込み負荷を効果的に処理するのに十分なリソース(メモリやCPUなど)を持っていないことを意味します。ClickPipeのデータ取り込みの要求を満たすために、サービスをスケールアップすることを強くお勧めします。

もう1つの理由として、最適化されていない可能性のある結合を含む下流のマテリアライズドビューの存在が挙げられます:

- JOINの一般的な最適化手法として、右側のテーブルが非常に大きい`LEFT JOIN`がある場合、クエリを`RIGHT JOIN`を使用するように書き換え、より大きなテーブルを左側に移動します。これにより、クエリプランナーがよりメモリ効率的になります。

- JOINのもう1つの最適化は、`サブクエリ`または`CTE`を通じてテーブルを明示的にフィルタリングし、これらのサブクエリ間で`JOIN`を実行することです。これにより、プランナーに行を効率的にフィルタリングして`JOIN`を実行する方法のヒントが提供されます。

### 初期ロード中に`invalid snapshot identifier`が表示されます。どうすればよいですか? {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier`エラーは、ClickPipesとPostgresデータベース間で接続が切断された場合に発生します。これは、ゲートウェイタイムアウト、データベースの再起動、またはその他の一時的な問題により発生する可能性があります。

初期ロードの進行中は、Postgresデータベースでアップグレードや再起動などの中断を伴う操作を実行せず、データベースへのネットワーク接続が安定していることを確認することをお勧めします。


この問題を解決するには、ClickPipes UIから再同期をトリガーできます。これにより、初期ロードプロセスが最初から再開されます。

### Postgresでパブリケーションを削除するとどうなりますか？ {#what-happens-if-i-drop-a-publication-in-postgres}

Postgresでパブリケーションを削除すると、ClickPipeがソースから変更を取得するためにパブリケーションが必要なため、ClickPipe接続が切断されます。この場合、通常、パブリケーションが存在しなくなったことを示すエラーアラートを受け取ります。

パブリケーションを削除した後にClickPipeを復旧するには：

1. Postgresで同じ名前と必要なテーブルを持つ新しいパブリケーションを作成します
2. ClickPipeの設定タブで「テーブルを再同期」ボタンをクリックします

この再同期が必要なのは、再作成されたパブリケーションは同じ名前であっても、Postgresで異なるオブジェクト識別子（OID）を持つためです。再同期プロセスにより、宛先テーブルが更新され、接続が復元されます。

または、必要に応じて完全に新しいパイプを作成することもできます。

パーティションテーブルを使用している場合は、適切な設定でパブリケーションを作成してください：

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```

### `Unexpected Datatype`エラーまたは`Cannot parse type XX ...`が表示される場合はどうすればよいですか？ {#what-if-i-am-seeing-unexpected-datatype-errors}

このエラーは通常、ソースのPostgresデータベースに取り込み時にマッピングできないデータ型がある場合に発生します。
より具体的な問題については、以下の可能性を参照してください。

### レプリケーション/スロット作成時に`invalid memory alloc request size <XXX>`のようなエラーが表示されます {#postgres-invalid-memalloc-bug}

Postgresパッチバージョン17.5/16.9/15.13/14.18/13.21で導入されたバグにより、特定のワークロードでメモリ使用量が指数関数的に増加し、Postgresが無効と見なす1GBを超えるメモリ割り当て要求が発生する可能性がありました。このバグは[修正されており](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a)、次のPostgresパッチシリーズ（17.6...）に含まれる予定です。このパッチバージョンがアップグレード可能になる時期については、Postgresプロバイダーに確認してください。すぐにアップグレードできない場合は、エラーが発生した時点でパイプの再同期が必要になります。

### ソースのPostgresデータベースからデータが削除された場合でも、ClickHouseで完全な履歴記録を維持する必要があります。ClickPipesでPostgresからのDELETEおよびTRUNCATE操作を完全に無視できますか？ {#ignore-delete-truncate}

はい！Postgres ClickPipeを作成する前に、DELETE操作を含まないパブリケーションを作成してください。例：

```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```

その後、Postgres ClickPipeを[セットアップ](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings)する際に、このパブリケーション名が選択されていることを確認してください。

なお、TRUNCATE操作はClickPipesによって無視され、ClickHouseにレプリケートされません。

### ドットを含むテーブルをレプリケートできないのはなぜですか？ {#replicate-table-dot}

PeerDBには現在、ソーステーブル識別子（スキーマ名またはテーブル名）にドットが含まれている場合、レプリケーションがサポートされないという制限があります。これは、PeerDBがドットで分割する際に、どれがスキーマでどれがテーブルかを識別できないためです。
この制限を回避するために、スキーマとテーブルを個別に入力できるようにする取り組みが進められています。

### 初期ロードが完了しましたが、ClickHouseにデータがない/欠落しています。何が問題でしょうか？ {#initial-load-issue}

初期ロードがエラーなく完了したにもかかわらず、宛先のClickHouseテーブルにデータが欠落している場合、ソースのPostgresテーブルでRLS（行レベルセキュリティ）ポリシーが有効になっている可能性があります。
また、以下も確認する価値があります：

- ユーザーがソーステーブルを読み取るための十分な権限を持っているか
- ClickHouse側に行をフィルタリングしている可能性のある行ポリシーがあるか

### ClickPipeでフェイルオーバーを有効にしたレプリケーションスロットを作成できますか？ {#failover-slot}

はい、レプリケーションモードがCDCまたはSnapshot + CDCのPostgres ClickPipeの場合、ClickPipe作成時に`詳細設定`セクションで以下のスイッチを切り替えることで、フェイルオーバーを有効にしたレプリケーションスロットをClickPipesに作成させることができます。この機能を使用するには、Postgresバージョンが17以上である必要があります。

<Image img={failover_slot} border size='md' />


ソースが適切に設定されている場合、Postgresリードレプリカへのフェイルオーバー後もスロットが保持され、継続的なデータレプリケーションが確保されます。詳細は[こちら](https://www.postgresql.org/docs/current/logical-replication-failover.html)をご覧ください。

### `Internal error encountered during logical decoding of aborted sub-transaction`のようなエラーが表示される {#transient-logical-decoding-errors}

このエラーは、中止されたサブトランザクションの論理デコードに関する一時的な問題を示しており、Aurora Postgresのカスタム実装に特有のものです。エラーが`ReorderBufferPreserveLastSpilledSnapshot`ルーチンから発生していることから、論理デコードがディスクに書き出されたスナップショットを読み取れないことが示唆されます。[`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM)をより高い値に増やすことを試してみる価値があるでしょう。

### CDCレプリケーション中に`error converting new tuple to map`や`error parsing logical message`のようなエラーが表示される {#logical-message-processing-errors}

Postgresは固定プロトコルを持つメッセージ形式で変更に関する情報を送信します。これらのエラーは、転送中の破損または無効なメッセージの送信により、ClickPipeが解析できないメッセージを受信した場合に発生します。正確な問題は状況によって異なりますが、Neon Postgresソースからいくつかのケースを確認しています。Neonでもこの問題が発生している場合は、Neonにサポートチケットを提出してください。その他の場合は、ガイダンスについて当社のサポートチームにお問い合わせください。
