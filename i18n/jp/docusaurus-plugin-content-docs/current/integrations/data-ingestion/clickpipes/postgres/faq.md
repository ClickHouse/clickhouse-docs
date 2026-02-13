---
sidebar_label: 'FAQ'
description: 'ClickPipes for Postgres に関する FAQ（よくある質問）です。'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres FAQ'
keywords: ['postgres faq', 'clickpipes', 'toast カラム', 'replication slot', 'publications']
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# Postgres 向け ClickPipes に関するよくある質問 \{#clickpipes-for-postgres-faq\}

### アイドル状態は Postgres CDC ClickPipe にどのような影響がありますか？ \{#how-does-idling-affect-my-postgres-cdc-clickpipe\}

ClickHouse Cloud サービスがアイドル状態でも、Postgres CDC ClickPipe はデータの同期を継続し、次の同期間隔になるとサービスが起動して受信データを処理します。同期が完了し、設定されたアイドル時間に達すると、サービスは再びアイドル状態に戻ります。

たとえば、同期間隔が 30 分、サービスのアイドル時間が 10 分に設定されている場合、サービスは 30 分ごとに起動して 10 分間アクティブになり、その後再びアイドル状態に戻ります。

### ClickPipes for Postgres では TOAST カラムはどのように扱われますか？ \{#how-are-toast-columns-handled-in-clickpipes-for-postgres\}

詳細については、[Handling TOAST Columns](./toast) のページを参照してください。

### ClickPipes for Postgres では生成カラムはどのように扱われますか？ \{#how-are-generated-columns-handled-in-clickpipes-for-postgres\}

詳しくは、[Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) ページを参照してください。

### Postgres CDC に含めるテーブルには主キーが必要ですか？ \{#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc\}

ClickPipes for Postgres を使ってテーブルをレプリケートするには、テーブルに主キーがあるか、[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) が定義されている必要があります。

* **Primary Key（主キー）**: 最も分かりやすい方法は、テーブルに主キーを定義することです。主キーは各行を一意に識別するためのもので、更新や削除を追跡するうえで重要です。この場合、REPLICA IDENTITY は `DEFAULT`（デフォルト動作）のままにしておくことができます。
* **Replica Identity（レプリカアイデンティティ）**: テーブルに主キーがない場合は、replica identity を設定できます。replica identity を `FULL` に設定すると、行全体が変更の識別に使用されます。あるいは、そのテーブルに一意な索引が存在する場合、その索引を使うように設定し、REPLICA IDENTITY を `USING INDEX index_name` に設定することもできます。
  replica identity を FULL に設定するには、次の SQL コマンドを使用できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

REPLICA IDENTITY FULL は、変更されていない TOAST カラムのレプリケーションも可能にします。詳細は[こちら](./toast)を参照してください。

`REPLICA IDENTITY FULL` を使用すると、特にプライマリキーを持たず、更新や削除が頻繁に行われるテーブルでは、パフォーマンスへの影響や WAL の急速な増大を招く可能性がある点に注意してください。これは、各変更に対してより多くのデータをログに記録する必要があるためです。テーブルに対するプライマリキーや replica identity の設定について不明点がある場合や支援が必要な場合は、サポートチームまでお問い合わせください。

プライマリキーも replica identity も定義されていない場合、そのテーブルに対する変更を ClickPipes はレプリケーションできず、レプリケーション処理中にエラーが発生する可能性があることに留意することが重要です。そのため、ClickPipe をセットアップする前に、テーブルスキーマを確認し、これらの要件を満たしていることを必ず確認することをお勧めします。


### Postgres CDC でパーティションテーブルはサポートされていますか？ \{#do-you-support-partitioned-tables-as-part-of-postgres-cdc\}

はい、`PRIMARY KEY` または `REPLICA IDENTITY` が定義されている限り、パーティションテーブルはデフォルトでサポートされています。`PRIMARY KEY` と `REPLICA IDENTITY` は、親テーブルとそのパーティションの両方に存在している必要があります。詳細は[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)を参照してください。

### パブリック IP アドレスがない、またはプライベートネットワーク内にある Postgres データベースに接続できますか？ \{#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

はい。ClickPipes for Postgres では、プライベートネットワーク内のデータベースに接続する方法を 2 通り提供しています。

1. **SSH Tunneling**
   - ほとんどのユースケースで問題なく機能します
   - セットアップ手順については[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)を参照してください
   - すべてのリージョンで利用可能です

2. **AWS PrivateLink**
   - 次の 3 つの AWS リージョンで利用可能です:
     - us-east-1
     - us-east-2
     - eu-central-1
   - 詳細なセットアップ手順については、[PrivateLink ドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください
   - PrivateLink が利用できないリージョンでは、SSH トンネリングを使用してください

### UPDATE と DELETE はどのように処理されますか？ \{#how-do-you-handle-updates-and-deletes\}

ClickPipes for Postgres は、Postgres からの INSERT と UPDATE の両方を、ClickHouse 上では異なるバージョンを持つ新しい行（`_peerdb_` バージョンカラムを使用）として取り込みます。ReplacingMergeTree テーブルエンジンは、ORDER BY カラムである並び替えキーに基づいてバックグラウンドで定期的に重複排除を実行し、最新の `_peerdb_` バージョンを持つ行のみを保持します。

Postgres からの DELETE は、削除フラグが付与された新しい行（`_peerdb_is_deleted` カラムを使用）として伝搬されます。重複排除処理は非同期で行われるため、一時的に重複した行が表示される場合があります。これに対処するには、クエリレイヤーで重複排除を行う必要があります。

また、デフォルトでは、Postgres は DELETE 操作時に、プライマリキーまたは replica identity に含まれないカラムの値を送信しない点にも注意してください。DELETE 時に完全な行データを取得したい場合は、[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) を FULL に設定できます。

詳細については、以下を参照してください。

* [ReplacingMergeTree テーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres から ClickHouse への CDC の内部動作に関するブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### PostgreSQL でプライマリキーのカラムを更新できますか？ \{#can-i-update-primary-key-columns-in-postgresql\}

:::warning
PostgreSQL におけるプライマリキーの更新は、デフォルトでは ClickHouse に正しく反映（リプレイ）できません。

この制限は、`ReplacingMergeTree` の重複排除が `ORDER BY` カラム（通常はプライマリキーに対応）を基準に動作することに起因します。PostgreSQL でプライマリキーが更新されると、ClickHouse では既存の行の更新としてではなく、異なるキーを持つ新しい行として扱われます。その結果、古いプライマリキーと新しいプライマリキーの両方の値が、ClickHouse のテーブル内に存在してしまう可能性があります。
:::

PostgreSQL のデータベース設計において、プライマリキーのカラムを更新することは一般的なプラクティスではない点に注意してください。プライマリキーは不変な識別子として設計されており、多くのアプリケーションでは設計上プライマリキーの更新を避けているため、この制限に遭遇するケースは典型的なユースケースではまれです。

プライマリキーの更新処理を有効化できる実験的な設定が存在しますが、重大なパフォーマンスへの影響を伴うため、十分な検討なしに本番環境での利用は推奨されません。

もし、PostgreSQL のプライマリキーのカラムを更新し、その変更を ClickHouse 側でも正しく反映させる必要があるユースケースをお持ちの場合は、具体的な要件や潜在的な解決策について検討するために、[db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com) までサポートチームへお問い合わせください。

### スキーマ変更に対応していますか？ \{#do-you-support-schema-changes\}

詳しくは、[ClickPipes for Postgres: Schema Changes Propagation Support](./schema-changes) のページを参照してください。

### ClickPipes for Postgres CDC の料金はどのくらいですか？ \{#what-are-the-costs-for-clickpipes-for-postgres-cdc\}

詳細な料金情報については、[メインの請求概要ページにある ClickPipes for Postgres CDC の料金セクション](/cloud/reference/billing/clickpipes)を参照してください。

### レプリケーションスロットのサイズが増え続ける、または減らないのですが、何が問題でしょうか？ \{#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue\}

Postgres のレプリケーションスロットのサイズが増え続けている、あるいは減少しない場合、通常は **WAL（Write-Ahead Log）のレコードが CDC（変更データキャプチャ）パイプラインやレプリケーション処理によって十分な速度で消費（または「リプレイ」）されていない** ことを意味します。以下に、最も一般的な原因とその対処方法を示します。

1. **データベースアクティビティの急激なスパイク**
   - 大量のバッチ更新、バルクインサート、大きなスキーマ変更などは、短時間で大量の WAL データを生成する可能性があります。
   - レプリケーションスロットは、それらの WAL レコードが消費されるまで保持するため、一時的にスロットサイズが急増します。

2. **長時間実行中のトランザクション**
   - オープンなトランザクションが存在すると、そのトランザクション開始以降に生成されたすべての WAL セグメントを Postgres は保持する必要があり、スロットサイズが大きく増加する可能性があります。
   - トランザクションが無期限にオープンなままにならないように、`statement_timeout` と `idle_in_transaction_session_timeout` を妥当な値に設定してください:
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

3. **メンテナンスまたはユーティリティ処理（例: `pg_repack`）**
   - `pg_repack` のようなツールはテーブル全体を書き換えることがあり、短時間で大量の WAL データを生成します。
   - これらの処理はトラフィックが少ない時間帯にスケジューリングするか、実行中は WAL の使用状況を継続的に監視してください。

4. **VACUUM および VACUUM ANALYZE**
   - データベースの健全性維持には必須ですが、特に大きなテーブルをスキャンする場合には追加の WAL トラフィックを発生させる可能性があります。
   - autovacuum のチューニングパラメータを検討するか、手動の VACUUM 処理をピーク外の時間帯にスケジューリングすることを検討してください。

5. **レプリケーションコンシューマがスロットを積極的に読み取っていない**
   - CDC パイプライン（例: ClickPipes）やその他のレプリケーションコンシューマが停止、一時停止、クラッシュしている場合、WAL データはスロット内に蓄積されていきます。
   - パイプラインが継続的に稼働していることを確認し、接続性や認証エラーについてログを確認してください。

このトピックについての詳細な解説は、次のブログ記事を参照してください: [Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres のデータ型は ClickHouse にどのようにマッピングされますか？ \{#how-are-postgres-data-types-mapped-to-clickhouse\}

ClickPipes for Postgres は、Postgres のデータ型を ClickHouse 側で可能な限りネイティブに近い形でマッピングすることを目的としています。各データ型とそのマッピングの包括的な一覧については、次のドキュメントを参照してください: [Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix)。

### Postgres から ClickHouse へのデータレプリケーション時に、データ型マッピングを独自に定義できますか？ \{#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse\}

現在、パイプの一部としてカスタムのデータ型マッピングを定義することはサポートしていません。ただし、ClickPipes によって使用されるデフォルトのデータ型マッピングは、ClickHouse のネイティブ型に強く寄せたものになっている点に注意してください。Postgres のほとんどのカラム型は、ClickHouse 上のネイティブな同等型に、可能な限り近い形でレプリケートされます。たとえば、Postgres の整数配列型は、ClickHouse 上でも整数配列型としてレプリケートされます。

### Postgres から JSON および JSONB カラムはどのようにレプリケートされますか？ \{#how-are-json-and-jsonb-columns-replicated-from-postgres\}

JSON および JSONB カラムは、ClickHouse では String 型としてレプリケートされます。ClickHouse はネイティブな [JSON type](/sql-reference/data-types/newjson) をサポートしているため、必要に応じて ClickPipes のテーブルに対して materialized view を作成し、変換処理を行うことができます。あるいは、String カラムに対して直接 [JSON functions](/sql-reference/functions/json-functions) を使用することも可能です。現在、JSON および JSONB カラムを ClickHouse の JSON type に直接レプリケートする機能を開発中であり、この機能は今後数か月以内に利用可能になる見込みです。

### ミラーを一時停止した場合、INSERT はどうなりますか？ \{#what-happens-to-inserts-when-a-mirror-is-paused\}

ミラーを一時停止すると、メッセージはソース側の Postgres の replication slot にキューイングされ、バッファされて失われないように保証されます。ただし、ミラーの一時停止と再開時には接続が再確立されるため、ソースによっては再接続に時間がかかる場合があります。

この処理の間、sync（Postgres からデータを取得して ClickHouse の raw テーブルへストリーミングする処理）と normalize（raw テーブルから target テーブルへの処理）の両方のオペレーションは中断されます。ただし、どちらも確実に再開するために必要な状態は保持されます。

- sync については、途中でキャンセルされた場合、Postgres の `confirmed_flush_lsn` は進まないため、次回の sync は中断された時点と同じ位置から開始され、データ整合性が確保されます。
- normalize については、ReplacingMergeTree の INSERT 順序により重複排除が行われます。

まとめると、一時停止中は sync と normalize の処理はいったん停止されますが、データ損失や不整合を生じることなく安全に再開できるため、一時停止しても問題ありません。

### ClickPipe の作成は自動化できますか？また、API や CLI から実行できますか？ \{#can-clickpipe-creation-be-automated-or-done-via-api-or-cli\}

Postgres ClickPipe は、[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) エンドポイント経由で作成および管理することもできます。この機能は現在ベータ版であり、API リファレンスは[こちら](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)から参照できます。Postgres ClickPipes を作成するための Terraform サポートの追加にも、現在積極的に取り組んでいます。

### 初回ロードを高速化するにはどうすればよいですか？ \{#how-do-i-speed-up-my-initial-load\}

すでに実行中の初回ロードを高速化することはできません。ただし、特定の設定を調整することで、今後の初回ロードを最適化できます。デフォルトでは、4 つの並列スレッドが使用され、パーティションごとのスナップショットの行数は 100,000 に設定されています。これらは高度な設定ですが、ほとんどのユースケースにおいては十分です。

Postgres バージョン 13 以前では CTID レンジスキャンが非常に遅いため、ClickPipes はそれを使用しません。その代わりに、テーブル全体を 1 つのパーティションとして読み取り、実質的に単一スレッド実行となります（そのため、パーティションごとの行数設定および並列スレッド数設定は無視されます）。この場合に初回ロードを高速化するには、`snapshot number of tables in parallel` を増やすか、大規模テーブル向けにカスタムの索引付きパーティションカラムを指定してください。

### レプリケーションを設定する際、publication のスコープはどのように決めればよいですか？ \{#how-should-i-scope-my-publications-when-setting-up-replication\}

ClickPipes に publication の管理を任せることも（追加の権限が必要）、自分で作成・管理することもできます。ClickPipes 管理の publication を使用する場合、pipe を編集するときにテーブルの追加および削除は自動的に処理されます。自前で管理する場合は、レプリケーションが必要なテーブルのみに絞るよう、publication のスコープを慎重に設定してください。不要なテーブルを含めると、Postgres の WAL デコード処理が遅くなります。

任意のテーブルを publication に含める場合、そのテーブルには必ず主キーまたは `REPLICA IDENTITY FULL` のいずれかが設定されていることを確認してください。主キーを持たないテーブルがある状態で、全テーブルを対象とする publication を作成すると、それらのテーブルでは DELETE および UPDATE 操作が失敗します。

データベース内で主キーを持たないテーブルを特定するには、次のクエリを使用できます。

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
   主キーを持つテーブルだけを含めて publication を作成します:
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **主キーのないテーブルを ClickPipes に含める**:
   主キーのないテーブルも含めたい場合は、`REPLICA IDENTITY` を `FULL` に変更する必要があります。これにより、UPDATE および DELETE 操作が正しく動作するようになります:
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
ClickPipes に publication を管理させるのではなく手動で publication を作成する場合、`FOR ALL TABLES` で publication を作成することは推奨しません。パイプに含まれていない他のテーブルの変更も送信することになり、Postgres から ClickPipes へのトラフィックが増加して全体的な効率が低下するためです。

手動で作成した publication の場合は、パイプに追加する前に、レプリケーション対象としたいテーブルをすべて publication に追加してください。
:::

:::warning
Postgres のリードレプリカ/ホットスタンバイからレプリケーションを行う場合は、プライマリインスタンス上に独自の publication を作成する必要があります。この publication はスタンバイに自動的に伝播します。この場合、スタンバイ上では publication を作成できないため、ClickPipe は publication を管理できません。
:::


### 推奨される `max_slot_wal_keep_size` 設定 \{#recommended-max_slot_wal_keep_size-settings\}

- **最低限:** WAL データを少なくとも **2 日分** 保持するように、[`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) を設定します。
- **大規模データベース（トランザクション量が多い場合）:** 1 日あたりのピーク時の WAL 生成量の **2～3 倍** に相当する量を、少なくとも保持するように設定します。
- **ストレージに制約のある環境:** レプリケーションの安定性を確保しつつ **ディスク枯渇を回避** できるよう、この値を保守的にチューニングします。

#### 適切な値を計算する方法 \{#how-to-calculate-the-right-value\}

適切な設定値を求めるには、WAL の生成速度を測定します。

##### PostgreSQL 10 以上の場合 \{#for-postgresql-10\}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```


##### PostgreSQL 9.6 およびそれ以前のバージョンの場合： \{#for-postgresql-96-and-below\}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 上記のクエリを 1 日の異なる時間帯、特にトランザクションが多い時間帯に実行します。
* 24 時間あたりに生成される WAL の量を算出します。
* 十分な保持期間を確保するため、その値に 2～3 を掛けます。
* `max_slot_wal_keep_size` を、その結果の値（MB または GB）に設定します。


##### 例 \{#example\}

データベースが1日あたり100 GBのWALを生成する場合、次のように設定します：

```sql
max_slot_wal_keep_size = 200GB
```


### ログに ReceiveMessage EOF エラーが表示されています。これは何を意味しますか？ \{#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean\}

`ReceiveMessage` は、レプリケーションストリームからメッセージを読み取るために使用される Postgres の論理デコードプロトコル内の関数です。EOF (End of File) エラーは、レプリケーションストリームから読み取ろうとしている最中に、Postgres サーバーへの接続が予期せず閉じられたことを示します。

これは復旧可能で、致命的なものではないエラーです。ClickPipes は自動的に再接続を試み、レプリケーション処理を再開します。

このエラーは、いくつかの理由で発生する可能性があります。

- **`wal_sender_timeout` の値が低い:** `wal_sender_timeout` を 5 分以上に設定してください。この設定は、サーバーが接続を切断する前にクライアントからの応答をどの程度の時間待機するかを制御します。タイムアウトが短すぎると、接続が早期に切断される原因になります。
- **ネットワークの問題:** 一時的なネットワーク障害によって接続が切断される可能性があります。
- **Postgres サーバーの再起動:** Postgres サーバーが再起動されたりクラッシュした場合、接続は失われます。

### レプリケーションスロットが無効化されました。どうすればよいですか？ \{#my-replication-slot-is-invalidated-what-should-i-do\}

ClickPipe を復旧する唯一の方法は、再同期をトリガーすることです。これは Settings ページから実行できます。

レプリケーションスロットが無効化される最も一般的な原因は、PostgreSQL データベースの `max_slot_wal_keep_size` 設定値が小さすぎることです（例：数 GB 程度）。この値を増やすことを推奨します。`max_slot_wal_keep_size` のチューニングについては[このセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)を参照してください。理想的には、レプリケーションスロットの無効化を防ぐために、少なくとも 200GB に設定することを推奨します。

まれなケースですが、`max_slot_wal_keep_size` が設定されていない場合でも、この問題が発生することがあります。これは PostgreSQL の複雑でまれなバグが原因である可能性がありますが、現時点では原因は明確ではありません。

### ClickPipe がデータをインジェストしている間、ClickHouse で out of memory (OOM) が発生しています。対処方法を教えてください。 \{#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help\}

ClickHouse で OOM が発生する一般的な原因の 1 つは、サービスのリソース不足です。これは、現在のサービス構成ではインジェスト負荷を処理するためのリソース（例: メモリや CPU）が十分ではないことを意味します。ClickPipe によるデータインジェストの需要を満たせるよう、サービスをスケールアップすることを強く推奨します。

もう 1 つ、よく見られる原因として、下流側の materialized view で JOIN が十分に最適化されていないケースがあります。

- 一般的な JOIN の最適化手法として、`LEFT JOIN` の右側のテーブルが非常に大きい場合には、クエリを書き換えて `RIGHT JOIN` を使用し、大きなテーブルを左側に移動します。これにより、クエリプランナーがメモリをより効率的に使用できるようになります。

- JOIN の別の最適化方法として、テーブルを `subqueries` や `CTEs` で明示的にフィルタリングし、そのサブクエリ同士で `JOIN` を実行する方法があります。これにより、プランナーに対して、どのように行を効率的にフィルタリングし、`JOIN` を実行すべきかのヒントを与えることができます。

### 初回ロード中に `invalid snapshot identifier` エラーが発生します。どうすればよいですか？ \{#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do\}

`invalid snapshot identifier` エラーは、ClickPipes とお使いの Postgres データベースとの接続が切断されたときに発生します。これは、ゲートウェイタイムアウト、データベースの再起動、その他の一時的な問題によって発生する可能性があります。

Initial Load の実行中は、Postgres データベースに対してアップグレードや再起動などの破壊的な操作を行わず、データベースへのネットワーク接続が安定していることを確認することを推奨します。

この問題を解決するには、ClickPipes の UI から resync を実行してください。これにより、初回ロード処理が最初から再開されます。

### Postgres で publication を削除した場合はどうなりますか？ \{#what-happens-if-i-drop-a-publication-in-postgres\}

Postgres で publication を削除すると、ClickPipe がソースから変更を取得するために publication を必要とするため、ClickPipe の接続が切断されてしまいます。この状況になると、通常は publication が存在しなくなったことを示すエラーアラートを受け取ります。

publication を削除した後に ClickPipe を復旧するには、次の手順を実行します。

1. Postgres で同じ名前と必要なテーブルを含む新しい publication を作成する
2. ClickPipe の「Settings」タブで「Resync tables」ボタンをクリックする

再同期が必要なのは、同じ名前であっても、再作成された publication には Postgres 内で異なる Object Identifier (OID) が割り当てられるためです。再同期プロセスでは、宛先テーブルが更新され、接続が復元されます。

必要であれば、まったく新しい ClickPipe を作成することも可能です。

パーティション化テーブルを扱っている場合は、適切な設定で publication を作成していることを必ず確認してください。

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```


### `Unexpected Datatype` エラーや `Cannot parse type XX ...` が表示される場合はどうすればよいですか \{#what-if-i-am-seeing-unexpected-datatype-errors\}

このエラーは通常、ソースの Postgres データベースに、インジェスト時にマッピングできないデータ型が存在する場合に発生します。
より具体的な原因については、以下の可能性を参照してください。

### レプリケーションやスロット作成中に `invalid memory alloc request size <XXX>` のようなエラーが発生します \{#postgres-invalid-memalloc-bug\}

Postgres のパッチバージョン 17.5/16.9/15.13/14.18/13.21 で導入されたバグにより、特定のワークロードでメモリ使用量が指数関数的に増加し、Postgres が無効と見なす 1GB 超のメモリアロケーション要求が発生する場合があります。このバグはすでに[修正済み](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a)であり、次の Postgres パッチシリーズ (17.6...) に含まれる予定です。このパッチバージョンへのアップグレードがいつ可能になるか、Postgres プロバイダに確認してください。すぐにアップグレードできない場合は、このエラーに遭遇するたびに対象の ClickPipe の再同期が必要になります。

### ソースの Postgres データベースからデータが削除された場合でも、ClickHouse で完全な履歴を保持する必要があります。ClickPipes で Postgres からの DELETE および TRUNCATE 操作を完全に無視できますか？ \{#ignore-delete-truncate\}

はい、可能です。Postgres 用 ClickPipe を作成する前に、DELETE 操作を含まないパブリケーションを作成してください。例：

```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```

その後、Postgres の ClickPipe を[セットアップ](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings)する際に、このパブリケーション名が選択されていることを確認してください。

TRUNCATE 操作は ClickPipes によって無視され、ClickHouse にはレプリケートされないことに注意してください。


### テーブル名にドットが含まれている場合、なぜレプリケーションできないのですか？ \{#replicate-table-dot\}

PeerDB には現時点での制限があり、ソーステーブル識別子（スキーマ名またはテーブル名）の中にドットが含まれている場合、レプリケーションをサポートしていません。これは、ドットで分割した際に、どれがスキーマでどれがテーブルかを PeerDB が判別できないためです。
この制限を回避するために、スキーマとテーブルを別々に入力できるようにする対応が進められています。

### 初期ロードは完了したが ClickHouse にデータがない／一部欠落している。何が問題でしょうか？ \{#initial-load-issue\}

初期ロードがエラーなく完了しているにもかかわらず、転送先の ClickHouse テーブルにデータが存在しない場合、ソースの Postgres テーブルで RLS（Row Level Security）ポリシーが有効になっている可能性があります。
あわせて次の点も確認してください:

- ユーザーがソーステーブルを読み取るのに十分な権限を持っているかどうか。
- ClickHouse 側で行をフィルタリングしてしまうような行ポリシー（Row Policy）が存在しないかどうか。

### フェイルオーバーが有効なレプリケーションスロットを ClickPipe に作成させることはできますか？ \{#failover-slot\}

はい、レプリケーションモードが CDC または Snapshot + CDC の Postgres 向け ClickPipe では、ClickPipe の作成時に `Advanced Settings` セクション内の以下のスイッチを切り替えることで、フェイルオーバーが有効なレプリケーションスロットを ClickPipes に作成させることができます。この機能を使用するには、Postgres のバージョンが 17 以上である必要があります。

<Image img={failover_slot} border size="md"/>

ソースが上記のように構成されている場合、Postgres のリードレプリカへのフェイルオーバー後もスロットは保持され、継続的なデータレプリケーションが維持されます。詳細は[こちら](https://www.postgresql.org/docs/current/logical-replication-failover.html)を参照してください。

### `Internal error encountered during logical decoding of aborted sub-transaction` のようなエラーが表示されます \{#transient-logical-decoding-errors\}

このエラーは、中断されたサブトランザクションのロジカルデコード処理に一時的な問題が発生していることを示しており、Aurora Postgres のカスタム実装に特有のものです。エラーが `ReorderBufferPreserveLastSpilledSnapshot` ルーチンから出ていることから、ロジカルデコードがディスクにスピルされたスナップショットを読み取れていないことが示唆されます。[`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM) をより大きな値に増やすことを検討してください。

### CDC レプリケーション中に `error converting new tuple to map` や `error parsing logical message` のようなエラーが表示されます \{#logical-message-processing-errors\}

Postgres は、あらかじめ定義されたプロトコルに基づくメッセージとして変更内容を送信します。これらのエラーは、ClickPipe がメッセージをパースできない場合に発生し、その原因としては転送中の破損や不正なメッセージが送信されていることなどが考えられます。具体的な原因はさまざまですが、Neon Postgres をソースとしたケースがいくつか確認されています。Neon で同様の問題が発生している場合は、Neon 側にサポートチケットを起票してください。それ以外の場合は、当社のサポートチームまでお問い合わせいただき、対応方法についてご相談ください。

### レプリケーションから最初に除外していたカラムを含めることはできますか？ \{#include-excluded-columns\}

これは現在サポートされていません。代替手段としては、含めたいカラムがあるテーブルを[再同期する](./table_resync.md)方法があります。

### ClickPipe が Snapshot フェーズに入っているのにデータが取り込まれていないことに気づきました。何が問題でしょうか？ \{#snapshot-no-data-flow\}

これはいくつかの理由が考えられますが、主にスナップショット取得の前提条件の一部に通常より時間がかかっていることが原因です。詳細については、並列スナップショットに関するドキュメントを[こちら](./parallel_initial_load.md)から参照してください。

#### 並列スナップショットでパーティションの取得に時間がかかっている \{#parallel-snapshotting-taking-time\}

並列スナップショットでは、テーブルに対して論理的なパーティションを取得するために、いくつかの初期ステップが実行されます。テーブルが小さい場合は数秒で完了しますが、非常に大きな（テラバイト単位の）テーブルでは、これに時間がかかることがあります。スナップショット用のパーティション取得に関連する長時間実行中のクエリがないか確認するには、**Source** タブで Postgres ソースのクエリ実行状況を監視してください。パーティションが取得されると、データの取り込みが開始されます。

#### レプリケーションスロットの作成がトランザクションロックによってブロックされている \{#replication-slot-creation-transaction-locked\}

**Source** タブの Activity セクションでは、`CREATE_REPLICATION_SLOT` クエリが `Lock` 状態のままになっているのが確認できます。これは、Postgres がレプリケーションスロットを作成する際に使用するオブジェクトに対して、別のトランザクションがロックを保持していることが原因の可能性があります。
ブロックしているクエリを確認するには、Postgres ソース上で以下のクエリを実行します。

```sql
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  blocking.state AS blocking_state
FROM pg_locks blocked_lock
JOIN pg_stat_activity blocked
  ON blocked_lock.pid = blocked.pid
JOIN pg_locks blocking_lock
  ON blocking_lock.locktype = blocked_lock.locktype
  AND blocking_lock.database IS NOT DISTINCT FROM blocked_lock.database
  AND blocking_lock.relation IS NOT DISTINCT FROM blocked_lock.relation
  AND blocking_lock.page IS NOT DISTINCT FROM blocked_lock.page
  AND blocking_lock.tuple IS NOT DISTINCT FROM blocked_lock.tuple
  AND blocking_lock.virtualxid IS NOT DISTINCT FROM blocked_lock.virtualxid
  AND blocking_lock.transactionid IS NOT DISTINCT FROM blocked_lock.transactionid
  AND blocking_lock.classid IS NOT DISTINCT FROM blocked_lock.classid
  AND blocking_lock.objid IS NOT DISTINCT FROM blocked_lock.objid
  AND blocking_lock.objsubid IS NOT DISTINCT FROM blocked_lock.objsubid
  AND blocking_lock.pid != blocked_lock.pid
JOIN pg_stat_activity blocking
  ON blocking_lock.pid = blocking.pid
WHERE NOT blocked_lock.granted;
```

ブロッキングしているクエリを特定したら、その完了を待つか、重要でない場合はキャンセルするかを判断できます。ブロッキングしているクエリが解消された後は、レプリケーションスロットの作成が進み、スナップショットが開始されてデータの取り込みが始まるはずです。
