---
sidebar_label: 'FAQ'
description: 'ClickPipes for Postgres に関するよくある質問'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres に関する FAQ'
keywords: ['postgres faq', 'clickpipes', 'TOAST 列', 'レプリケーションスロット', 'パブリケーション']
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';

# ClickPipes for Postgres に関する FAQ \{#clickpipes-for-postgres-faq\}

### アイドル状態は Postgres CDC ClickPipe にどのような影響がありますか？ \\{#how-does-idling-affect-my-postgres-cdc-clickpipe\\}

ClickHouse Cloud サービスがアイドル状態になっていても、Postgres CDC ClickPipe はデータの同期を継続し、次の同期間隔でサービスが起動して受信データを処理します。同期が完了し、アイドル時間に達すると、サービスは再びアイドル状態に戻ります。

例えば、同期間隔を 30 分、サービスのアイドル時間を 10 分に設定している場合、サービスは 30 分ごとに起動して 10 分間アクティブになり、その後再びアイドル状態に戻ります。

### ClickPipes for Postgres では TOAST カラムはどのように扱われますか？ \\{#how-are-toast-columns-handled-in-clickpipes-for-postgres\\}

詳細については、[Handling TOAST Columns](./toast) ページをご覧ください。

### ClickPipes for Postgres では生成カラムはどのように扱われますか？ \\{#how-are-generated-columns-handled-in-clickpipes-for-postgres\\}

詳細については、[Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) ページをご覧ください。

### Postgres CDC の対象になるには、テーブルに主キーが必要ですか？ \{#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc\}

ClickPipes for Postgres を使ってテーブルをレプリケートするには、そのテーブルに主キー、または [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) のいずれかが定義されている必要があります。

* **Primary Key**: 最もわかりやすい方法は、テーブルに主キーを定義することです。これは各行を一意に識別するために必要であり、更新や削除を追跡するうえで重要です。この場合、REPLICA IDENTITY は `DEFAULT`（デフォルトの動作）のままにしておくことができます。
* **Replica Identity**: テーブルに主キーがない場合は、Replica Identity を設定できます。Replica Identity を `FULL` に設定すると、変更を識別するために行全体が使用されます。あるいは、テーブル上に一意インデックスが存在する場合はそれを使用するように設定し、そのうえで REPLICA IDENTITY を `USING INDEX index_name` に設定することもできます。
  Replica Identity を `FULL` に設定するには、次の SQL コマンドを使用できます：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

REPLICA IDENTITY FULL は、変更されていない TOAST カラムのレプリケーションも可能にします。詳細については[こちら](./toast)を参照してください。

`REPLICA IDENTITY FULL` を使用すると、パフォーマンスへの影響や WAL の増加ペースが速くなる可能性がある点に注意してください。特に、プライマリキーがなく、更新や削除が頻繁に発生するテーブルでは、各変更に対してより多くのデータをログに記録する必要があるため、その傾向が強くなります。テーブルのプライマリキーや REPLICA IDENTITY の設定に不明点がある場合や支援が必要な場合は、ガイダンスについてサポートチームまでお問い合わせください。

プライマリキーと REPLICA IDENTITY のどちらも定義されていない場合、そのテーブルに対する変更を ClickPipes がレプリケートできず、レプリケーション処理中にエラーが発生する可能性がある点に留意してください。そのため、ClickPipe をセットアップする前に、テーブルスキーマを確認し、これらの要件を満たしていることを必ず確認してください。


### Postgres CDC の一部として、パーティションテーブルはサポートされていますか？ \\{#do-you-support-partitioned-tables-as-part-of-postgres-cdc\\}

はい。PRIMARY KEY または REPLICA IDENTITY が定義されている限り、パーティションテーブルは追加の設定なしでサポートされます。PRIMARY KEY と REPLICA IDENTITY は、親テーブルとその各パーティションの両方に存在している必要があります。詳しくは[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)を参照してください。

### パブリック IP がない、またはプライベートネットワーク内にある Postgres データベースへ接続できますか？ \\{#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks\\}

はい。Postgres 用の ClickPipes では、プライベートネットワーク内のデータベースに接続するための 2 つの方法を提供しています。

1. **SSH トンネリング**
   * ほとんどのユースケースで有効に機能します
   * セットアップ手順は[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)を参照してください
   * すべてのリージョンで利用可能です

2. **AWS PrivateLink**
   * 次の 3 つの AWS リージョンで利用可能です:
     * us-east-1
     * us-east-2
     * eu-central-1
   * 詳細なセットアップ手順については、[PrivateLink ドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください
   * PrivateLink が利用できないリージョンでは、SSH トンネリングを使用してください

### UPDATE と DELETE はどのように処理されますか？ \\{#how-do-you-handle-updates-and-deletes\\}

ClickPipes for Postgres は、Postgres からの INSERT と UPDATE の両方を、ClickHouse 側ではバージョン違いの新しい行（`_peerdb_` バージョン列を使用）として取り込みます。ReplacingMergeTree テーブルエンジンは、ORDER BY 句で指定された並び替えキー（ORDER BY 列）に基づいてバックグラウンドで定期的に重複排除を行い、最新の `_peerdb_` バージョンを持つ行のみを保持します。

Postgres からの DELETE は、削除フラグが付いた新しい行（`_peerdb_is_deleted` 列を使用）として伝搬されます。重複排除処理は非同期で行われるため、一時的に重複した行が表示される場合があります。これに対処するには、クエリ側で重複排除を行う必要があります。

また、デフォルトでは Postgres は、DELETE 操作時にプライマリキーまたはレプリカアイデンティティに含まれない列の値を送信しない点にも注意してください。DELETE 時に行全体のデータを取得したい場合は、[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) を FULL に設定できます。

詳細については、以下を参照してください。

* [ReplacingMergeTree テーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC 内部処理に関するブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### PostgreSQL でプライマリキー列を更新できますか？ \\{#can-i-update-primary-key-columns-in-postgresql\\}

:::warning
PostgreSQL におけるプライマリキーの更新は、デフォルトでは ClickHouse 上で正しく再生（リプレイ）することができません。

この制限は、`ReplacingMergeTree` の重複排除が `ORDER BY` 列（通常はプライマリキーに対応）に基づいて動作するために存在します。PostgreSQL 側でプライマリキーが更新されると、ClickHouse では既存行の更新としてではなく、別のキーを持つ新しい行として表現されます。その結果、古いプライマリキー値と新しいプライマリキー値の両方が、ClickHouse テーブル内に存在してしまう可能性があります。
:::

PostgreSQL のデータベース設計において、プライマリキー列を更新することは一般的な運用ではありません。プライマリキーは本来、不変な識別子として設計されているためです。多くのアプリケーションは設計上、プライマリキーの更新を行わないようになっており、そのためこの制限に遭遇するケースは一般的なユースケースではまれです。

プライマリキー更新の処理を有効にできる実験的な設定も用意されていますが、重大なパフォーマンスへの影響を伴うため、慎重な検討なしに本番環境で利用することは推奨されません。

もし、PostgreSQL でプライマリキー列を更新し、その変更を ClickHouse に正しく反映させる必要がある場合は、具体的な要件や考えられる解決策についてご相談いただくために、[db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com) までサポートチームにご連絡ください。

### スキーマ変更はサポートされていますか？ \\{#do-you-support-schema-changes\\}

詳細については、[ClickPipes for Postgres: Schema Changes Propagation Support](./schema-changes) のページを参照してください。

### ClickPipes for Postgres CDC のコストはどのくらいですか？ \\{#what-are-the-costs-for-clickpipes-for-postgres-cdc\\}

料金の詳細については、[メインの課金概要ページ内の ClickPipes for Postgres CDC の料金セクション](/cloud/reference/billing/clickpipes) を参照してください。

### レプリケーションスロットのサイズが増え続ける、または減少しません。何が問題でしょうか？ \\{#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue\\}

Postgres のレプリケーションスロットサイズが増え続けている、あるいは元のサイズに戻らない場合、一般的には **WAL（Write-Ahead Log）レコードが CDC パイプラインまたはレプリケーションプロセスによって十分な速度で消費（「リプレイ」）されていない** ことを意味します。以下に、最も一般的な原因とその対処方法を示します。

1. **データベースアクティビティの急激なスパイク**
   - 大規模なバッチ更新、一括 INSERT、大きなスキーマ変更などは、大量の WAL データを短時間で生成する可能性があります。
   - レプリケーションスロットは、それらの WAL レコードが消費されるまで保持するため、一時的にサイズのスパイクが発生します。

2. **長時間実行中のトランザクション**
   - オープンなトランザクションが存在すると、Postgres はそのトランザクション開始以降に生成されたすべての WAL セグメントを保持する必要があり、スロットサイズが大きく増加する可能性があります。
   - `statement_timeout` および `idle_in_transaction_session_timeout` を適切な値に設定し、トランザクションが無期限に開いたままにならないようにしてください。
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
     このクエリを使用して、異常に長時間実行されているトランザクションを特定します。

3. **メンテナンスやユーティリティ操作（例: `pg_repack`）**
   - `pg_repack` のようなツールはテーブル全体を書き換えることがあり、短時間で大量の WAL データを生成する可能性があります。
   - これらの操作はトラフィックが少ない時間帯にスケジュールするか、実行中は WAL の使用量を注意深く監視してください。

4. **VACUUM および VACUUM ANALYZE**
   - データベースの健全性のために必要な操作ですが、特に大きなテーブルをスキャンする場合には追加の WAL トラフィックを発生させる可能性があります。
   - autovacuum のチューニングパラメータを検討するか、手動で実行する VACUUM 処理をピーク時間帯以外にスケジュールすることを検討してください。

5. **レプリケーションコンシューマがスロットを積極的に読み取っていない**
   - CDC パイプライン（例: ClickPipes）やその他のレプリケーションコンシューマが停止・一時停止・クラッシュした場合、WAL データはスロット内に蓄積されます。
   - パイプラインが継続的に動作していることを確認し、接続エラーや認証エラーがないかログを確認してください。

このトピックの詳細な解説については、次のブログ記事を参照してください: [Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres のデータ型は ClickHouse にどのようにマッピングされますか？ \\{#how-are-postgres-data-types-mapped-to-clickhouse\\}

Postgres 向け ClickPipes は、Postgres のデータ型を ClickHouse 側で可能な限りネイティブにマッピングすることを目的としています。このドキュメントには、各データ型とそのマッピングの包括的な一覧が掲載されています: [Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix)。

### Postgres から ClickHouse へのレプリケーション中に、独自のデータ型マッピングを定義できますか？ \\{#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse\\}

現在、パイプの一部としてカスタムのデータ型マッピングを定義することはサポートしていません。ただし、ClickPipes が使用するデフォルトのデータ型マッピングは、ClickHouse 側のネイティブ型に極力忠実であることに注意してください。Postgres のほとんどのカラム型は、ClickHouse のネイティブな同等型にできるだけ近い形でレプリケートされます。たとえば、Postgres の整数配列型は、ClickHouse でも整数配列型としてレプリケートされます。

### JSON および JSONB カラムは Postgres からどのようにレプリケートされますか？ \\{#how-are-json-and-jsonb-columns-replicated-from-postgres\\}

JSON および JSONB カラムは、ClickHouse では String 型としてレプリケートされます。ClickHouse はネイティブの [JSON 型](/sql-reference/data-types/newjson) をサポートしているため、必要に応じて ClickPipes テーブルの上にマテリアライズドビューを作成し、その型変換を行うことができます。あるいは、[JSON 関数](/sql-reference/functions/json-functions) を String カラムに対して直接利用することもできます。現在、JSON および JSONB カラムを ClickHouse の JSON 型に直接レプリケートする機能に積極的に取り組んでおり、この機能は数か月以内に利用可能になる予定です。

### ミラーを一時停止した場合、INSERT はどうなりますか？ \\{#what-happens-to-inserts-when-a-mirror-is-paused\\}

ミラーを一時停止すると、メッセージはソースの Postgres 上のレプリケーションスロットにキューイングされ、バッファリングされて失われないように保証されます。ただし、ミラーの一時停止と再開により接続が再確立されるため、ソースに依存して多少時間がかかる場合があります。

この処理の間、sync（Postgres からデータを取得して ClickHouse の raw テーブルへストリーミングする処理）と normalize（raw テーブルからターゲットテーブルへの処理）の両方の処理は中断されます。ただし、どちらも確実に再開するために必要な状態は保持されます。

- sync については、途中でキャンセルされた場合、Postgres の `confirmed_flush_lsn` は前進しないため、次回の sync は中断されたものと同じ位置から開始され、データ整合性が確保されます。
- normalize については、`ReplacingMergeTree` の挿入順序によって重複排除が行われます。

要約すると、一時停止中は sync と normalize の処理は終了しますが、データ損失や不整合なく再開できるため、安全に一時停止できます。

### ClickPipe の作成は自動化できますか？または API や CLI から実行できますか？ \\{#can-clickpipe-creation-be-automated-or-done-via-api-or-cli\\}

Postgres 向け ClickPipe は、[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) エンドポイント経由でも作成および管理できます。この機能は現在ベータ版であり、API リファレンスは[こちら](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)にあります。Postgres 向け ClickPipes を作成するための Terraform サポートにも積極的に取り組んでいます。

### 初回ロードを高速化するにはどうすればよいですか？ \\{#how-do-i-speed-up-my-initial-load\\}

既に実行中の初回ロードを高速化することはできません。ただし、特定の設定を調整することで、今後の初回ロードを最適化できます。デフォルトでは、並列スレッド数は 4、パーティションごとのスナップショット行数は 100,000 に設定されています。これらは高度な設定ですが、ほとんどのユースケースでは十分です。

Postgres バージョン 13 以前では CTID レンジスキャンが遅くなり、これらの設定がより重要になります。そのような場合は、次の手順に従ってパフォーマンス向上を検討してください。

1. **既存のパイプを削除する**: 新しい設定を適用するために必要です。
2. **ClickHouse 上の宛先テーブルを削除する**: 以前のパイプによって作成されたテーブルが削除されていることを確認します。
3. **最適化された設定で新しいパイプを作成する**: 通常は、パーティションごとのスナップショット行数を 100 万〜1,000 万の範囲に増やします。具体的な要件と、Postgres インスタンスが処理できる負荷に応じて調整してください。

これらの調整により、特に古い Postgres バージョンで初回ロードのパフォーマンスが大幅に向上するはずです。Postgres 14 以降を使用している場合、CTID レンジスキャンのサポートが改善されているため、これらの設定の影響は小さくなります。

### レプリケーションを設定する際、パブリケーションの範囲はどのように決めるべきですか？ \{#how-should-i-scope-my-publications-when-setting-up-replication\}

ClickPipes にパブリケーションの管理を任せることも（追加の権限が必要）、自分で作成・管理することもできます。ClickPipes が管理するパブリケーションでは、パイプを編集した際のテーブルの追加・削除を自動的に処理します。自分で管理する場合は、レプリケーションが必要なテーブルのみに対象を慎重に絞ってパブリケーションを定義してください。不要なテーブルを含めると、Postgres の WAL デコードが遅くなります。

任意のテーブルをパブリケーションに含める場合は、そのテーブルにプライマリキーがあるか、`REPLICA IDENTITY FULL` が設定されていることを必ず確認してください。プライマリキーのないテーブルがある状態で、すべてのテーブルを対象とするパブリケーションを作成すると、それらのテーブルで DELETE および UPDATE 操作が失敗します。

データベース内でプライマリキーのないテーブルを特定するには、次のクエリを使用できます。

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

主キーのないテーブルを扱う場合、次の 2 つの選択肢があります。

1. **主キーのないテーブルを ClickPipes から除外する**:
   主キーを持つテーブルだけを指定して publication を作成します:
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **主キーのないテーブルを ClickPipes に含める**:
   主キーのないテーブルを含めたい場合は、REPLICA IDENTITY を `FULL` に変更する必要があります。これにより、UPDATE および DELETE 操作が正しく動作するようになります:
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
ClickPipes に publication の管理を任せずに手動で publication を作成する場合、`FOR ALL TABLES` で publication を作成することは推奨しません。これは、パイプに含まれていない他のテーブルの変更も送信することになり、Postgres から ClickPipes へのトラフィックが増加し、全体的な効率が低下するためです。

手動で作成した publication については、パイプに追加する前に、publication に含めたいテーブルをすべて追加してください。
:::

:::warning
Postgres の読み取りレプリカ / ホットスタンバイからレプリケーションを行っている場合は、プライマリインスタンス上で独自の publication を作成する必要があります。この publication は自動的にスタンバイへ伝搬されます。この場合、スタンバイ上では publication を作成できないため、ClickPipe は publication を管理できません。
:::


### 推奨される `max_slot_wal_keep_size` の設定 \\{#recommended-max_slot_wal_keep_size-settings\\}

- **最低限:** WAL データを少なくとも **2 日分** 保持するように、[`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) を設定します。
- **大規模データベース（トランザクション量が多い場合）:** 1 日あたりのピーク WAL 生成量の少なくとも **2〜3 倍** を保持します。
- **ストレージ制約のある環境:** レプリケーションの安定性を確保しつつ、**ディスク枯渇を回避** できるよう、保守的にチューニングします。

#### 適切な値の算出方法 \\{#how-to-calculate-the-right-value\\}

適切な設定値を決定するには、WAL の生成レートを測定します:

##### PostgreSQL 10 以降: \{#for-postgresql-10\}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```


##### PostgreSQL 9.6 以前: \{#for-postgresql-96-and-below\}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 上記のクエリを一日の異なる時間帯、特にトランザクションが集中する時間帯に実行します。
* 24 時間あたりに生成される WAL の量を算出します。
* 十分な保持期間を確保するため、その値に 2〜3 を掛けます。
* `max_slot_wal_keep_size` を、その結果の値（MB または GB）に設定します。


##### 例 \{#example\}

データベースが 1 日あたり 100 GB の WAL を生成する場合は、次のように設定します。

```sql
max_slot_wal_keep_size = 200GB
```


### ログに ReceiveMessage EOF エラーが表示されています。これはどういう意味ですか？ \\{#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean\\}

`ReceiveMessage` は、レプリケーションストリームからメッセージを読み取る PostgreSQL のロジカルデコーディングプロトコル内の関数です。EOF（End of File）エラーは、レプリケーションストリームから読み取ろうとしている最中に、Postgres サーバーへの接続が予期せず閉じられたことを示します。

これは復旧可能で、まったく致命的ではないエラーです。ClickPipes は自動的に再接続を試み、レプリケーション処理を再開します。

このエラーは、次のような理由で発生する可能性があります。

* **`wal_sender_timeout` が小さい:** `wal_sender_timeout` を 5 分以上に設定していることを確認してください。この設定は、サーバーが接続を閉じる前にクライアントからの応答をどれだけ待つかを制御します。タイムアウトが短すぎると、早期の切断につながる可能性があります。
* **ネットワークの問題:** 一時的なネットワーク障害により、接続が切断されることがあります。
* **Postgres サーバーの再起動:** Postgres サーバーが再起動したりクラッシュした場合、接続は失われます。

### レプリケーションスロットが無効化されました。どうすればよいですか？ \\{#my-replication-slot-is-invalidated-what-should-i-do\\}

ClickPipe を復旧する唯一の方法は、再同期をトリガーすることです。これは Settings ページから実行できます。

レプリケーションスロットの無効化の最も一般的な原因は、PostgreSQL データベース上の `max_slot_wal_keep_size` の設定値が低いこと（例: 数 GB 程度）です。この値を引き上げることを推奨します。`max_slot_wal_keep_size` のチューニングについては[このセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)を参照してください。理想的には、レプリケーションスロットの無効化を防ぐために、少なくとも 200GB に設定すべきです。

まれに、`max_slot_wal_keep_size` が設定されていない場合でもこの問題が発生することがあります。これは PostgreSQL 内の入り組んだまれなバグによる可能性がありますが、原因は明確ではありません。

### ClickPipe がデータをインジェストしている間、ClickHouse で out of memory (OOM) が発生しています。どうすればよいですか？ \\{#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help\\}

ClickHouse で OOM が発生する一般的な理由の 1 つは、サービスのサイズが不足していることです。これは、現在のサービス構成ではインジェスト負荷を十分に処理するためのリソース（例: メモリや CPU）が不足していることを意味します。ClickPipe によるデータインジェストの需要を満たすために、サービスをスケールアップすることを強く推奨します。

もう 1 つよく見られる理由として、下流にあるマテリアライズドビューで結合が最適化されていない可能性があります。

- JOIN を最適化する一般的な手法の 1 つは、右側のテーブルが非常に大きい `LEFT JOIN` を行っている場合に適用できます。この場合、クエリを書き換えて `RIGHT JOIN` を使用し、大きいテーブルを左側に移動します。これにより、クエリプランナはよりメモリ効率の高い計画を立てることができます。

- JOIN の別の最適化として、テーブルを `subqueries` や `CTEs` で明示的にフィルタリングし、それらのサブクエリ同士で `JOIN` を行う方法があります。これにより、プランナに対して、どのように行を効率的にフィルタし `JOIN` を実行すべきかのヒントを与えることができます。

### 初期ロード中に `invalid snapshot identifier` が表示されています。どうすればよいですか？ \\{#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do\\}

`invalid snapshot identifier` エラーは、ClickPipes と Postgres データベース間の接続が切断された場合に発生します。これは、ゲートウェイタイムアウト、データベースの再起動、その他の一時的な問題が原因で発生する可能性があります。

Initial Load の実行中は、アップグレードや再起動などの破壊的な操作を Postgres データベース上で行わず、データベースへのネットワーク接続が安定していることを確認することを推奨します。

この問題を解決するには、ClickPipes の UI から再同期をトリガーできます。これにより、初期ロード処理が最初から再開されます。

### Postgres で publication を削除した場合はどうなりますか？ \{#what-happens-if-i-drop-a-publication-in-postgres\}

Postgres で publication を削除すると、ClickPipe はソースから変更を取得する際に publication を必要とするため、ClickPipe との接続が切断されます。この場合、通常は publication が存在しないことを示すエラーアラートを受け取ります。

publication を削除した後に ClickPipe を復旧するには、次の手順を実行します。

1. Postgres で、同じ名前および必要なテーブルを含む新しい publication を作成する
2. ClickPipe の Settings タブで「Resync tables」ボタンをクリックする

再作成された publication は、名前が同じであっても Postgres では異なる Object Identifier (OID) を持つため、この再同期が必要です。再同期プロセスにより、宛先テーブルが更新され、接続が復旧します。

代わりに、必要に応じて新しい ClickPipe を作成することもできます。

パーティション分割されたテーブルを扱っている場合は、publication を適切な設定で作成していることを必ず確認してください。

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```


### `Unexpected Datatype` エラーや `Cannot parse type XX ...` が表示される場合 \\{#what-if-i-am-seeing-unexpected-datatype-errors\\}

このエラーは通常、ソースの Postgres データベースに、インジェスト時にマッピングできないデータ型が存在する場合に発生します。
より具体的な原因については、以下の可能性を確認してください。

### レプリケーション／スロット作成中に `invalid memory alloc request size <XXX>` のようなエラーが表示される \\{#postgres-invalid-memalloc-bug\\}

Postgres のパッチバージョン 17.5/16.9/15.13/14.18/13.21 で導入されたバグにより、特定のワークロードでメモリ使用量が指数関数的に増加し、Postgres が無効と見なす 1GB 超のメモリ割り当て要求が発生することがあります。このバグはすでに[修正済み](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a)であり、次回の Postgres パッチシリーズ (17.6...) に含まれる予定です。このパッチバージョンへのアップグレードがいつ可能になるかについては、利用している Postgres プロバイダーに確認してください。すぐにアップグレードできない場合は、このエラーに遭遇したら ClickPipe の再同期が必要になります。

### ソースの Postgres データベースからデータが削除されても、ClickHouse 側では完全な履歴を保持しておきたいです。Postgres の DELETE および TRUNCATE 操作を ClickPipes で完全に無視することはできますか？ \{#ignore-delete-truncate\}

はい、可能です。Postgres 用 ClickPipe を作成する前に、DELETE 操作を含まない publication を作成してください。例：

```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```

その後、Postgres 用 ClickPipe を[セットアップ](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings)する際に、このパブリケーション名が選択されていることを必ず確認してください。

TRUNCATE 操作は ClickPipes によって無視され、ClickHouse にはレプリケートされないことに注意してください。


### テーブル名にドットが含まれている場合、そのテーブルをレプリケーションできないのはなぜですか？ \\{#replicate-table-dot\\}

PeerDB には現在、ソーステーブルの識別子（スキーマ名またはテーブル名）にドットが含まれている場合、それをレプリケーションでサポートできないという制限があります。PeerDB はドットで文字列を分割してスキーマとテーブルを識別しますが、その場合にどちらがスキーマでどちらがテーブルかを判別できないためです。
この制限を回避するため、スキーマとテーブルを別々に入力できるようにする対応が進められています。

### 初回ロードは完了したのに、ClickHouse にデータがない／足りないのはなぜですか？ \\{#initial-load-issue\\}

初回ロードがエラーなく完了しているにもかかわらず、宛先の ClickHouse テーブルでデータが欠落している場合、ソースの Postgres テーブルで RLS（Row Level Security、行レベルセキュリティ）ポリシーが有効になっている可能性があります。
あわせて次の点も確認してください：

- ユーザーがソーステーブルを読み取るための十分な権限を持っているかどうか。
- ClickHouse 側に、行をフィルタリングしてしまっている可能性のある行ポリシーが存在しないかどうか。

### フェイルオーバーが有効な replication slot を ClickPipe に作成させることはできますか？ \\{#failover-slot\\}

はい。レプリケーションモードが CDC または Snapshot + CDC の Postgres 用 ClickPipe では、ClickPipe を作成する際に `Advanced Settings` セクション内の以下のスイッチを切り替えることで、フェイルオーバーが有効な replication slot を ClickPipes に作成させることができます。この機能を使用するには、Postgres のバージョンが 17 以上である必要があることに注意してください。

<Image img={failover_slot} border size="md" />

ソース側が適切に構成されている場合、Postgres の read replica へのフェイルオーバー後もスロットは保持され、継続的なデータレプリケーションが保証されます。詳しくは[こちら](https://www.postgresql.org/docs/current/logical-replication-failover.html)を参照してください。

### `Internal error encountered during logical decoding of aborted sub-transaction` のようなエラーが発生します \\{#transient-logical-decoding-errors\\}

このエラーは、中止されたサブトランザクションの logical decoding に一時的な問題が発生していることを示しており、Aurora Postgres のカスタム実装に特有のものです。エラーが `ReorderBufferPreserveLastSpilledSnapshot` ルーチンから発生していることから、logical decoding がディスクに書き出された（spilled）スナップショットを読み取れないことが示唆されます。[`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM) をより大きな値に増やしてみる価値があります。

### CDC レプリケーション中に `error converting new tuple to map` や `error parsing logical message` のようなエラーが発生します \\{#logical-message-processing-errors\\}

Postgres は、あらかじめ定められたプロトコルに従ったメッセージ形式で変更情報を送信します。これらのエラーは、ClickPipe が受信したメッセージを、伝送中の破損や不正なメッセージが送信されていることなどが原因でパースできない場合に発生します。具体的な原因はさまざまですが、Neon Postgres をソースとしたケースが複数確認されています。Neon を使用していて同様の問題が発生している場合は、Neon にサポートチケットを提出してください。それ以外の場合は、弊社サポートチームまでお問い合わせください。

### 最初にレプリケーションから除外したカラムを後から含めることはできますか？ \\{#include-excluded-columns\\}

これはまだサポートされていません。代替手段としては、含めたいカラムを持つテーブルを[再同期する](./table_resync.md)ことができます。