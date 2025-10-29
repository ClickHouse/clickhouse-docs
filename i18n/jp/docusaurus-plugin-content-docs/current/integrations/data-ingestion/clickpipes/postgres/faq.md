---
'sidebar_label': 'FAQ'
'description': 'Postgres のための ClickPipes に関するよくある質問。'
'slug': '/integrations/clickpipes/postgres/faq'
'sidebar_position': 2
'title': 'Postgres のための ClickPipes FAQ'
'doc_type': 'reference'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';



# ClickPipes for Postgres FAQ

### How does idling affect my Postgres CDC ClickPipe? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

あなたの ClickHouse Cloud サービスがアイドリングしている場合、あなたの Postgres CDC ClickPipe はデータの同期を続け、次の同期間隔でサービスが起動して受信データを処理します。同期が終了しアイドル期間に達すると、サービスは再びアイドリングに戻ります。

例えば、同期間隔が 30 分に設定され、サービスのアイドル時間が 10 分に設定されている場合、サービスは 30 分ごとに起動し、10 分間アクティブになった後、再びアイドリングに戻ります。

### How are TOAST columns handled in ClickPipes for Postgres? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

詳細については、[Handling TOAST Columns](./toast) ページを参照してください。

### How are generated columns handled in ClickPipes for Postgres? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

詳細については、[Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) ページを参照してください。

### Do tables need to have primary keys to be part of Postgres CDC? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

ClickPipes for Postgres を使用してテーブルをレプリケートするには、主キーまたは [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) が定義されている必要があります。

- **主キー**: 最も簡単なアプローチは、テーブルに主キーを定義することです。これは各行の一意の識別子を提供し、更新や削除を追跡するために重要です。この場合、REPLICA IDENTITY を `DEFAULT`（デフォルト動作）に設定できます。
- **レプリカ アイデンティティ**: テーブルに主キーがない場合、レプリカ アイデンティティを設定できます。レプリカ アイデンティティを `FULL` に設定すると、変更を識別するために行全体が使用されます。代わりに、テーブル上に一意のインデックスが存在する場合は、それを使用するように設定し、REPLICA IDENTITY を `USING INDEX index_name` に設定できます。
レプリカ アイデンティティを FULL に設定するには、以下の SQL コマンドを使用できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

REPLICA IDENTITY FULL は、変更されていない TOAST カラムのレプリケーションを有効にします。詳細は [こちら](./toast) をご覧ください。

`REPLICA IDENTITY FULL` を使用すると、パフォーマンスへの影響や、主キーがないテーブルの頻繁な更新や削除により WAL の成長が早くなる可能性があります。これは、各変更に対してより多くのデータをログに記録する必要があるからです。テーブルの主キーやレプリカ アイデンティティの設定に関する疑問や助けが必要な場合は、サポートチームにご連絡ください。

主キーまたはレプリカ アイデンティティが定義されていない場合、ClickPipes はそのテーブルの変更をレプリケートできず、レプリケーションプロセス中にエラーが発生する場合があります。そのため、ClickPipe を設定する前に、テーブルスキーマを確認し、これらの要件を満たしていることを確認することをお勧めします。

### Do you support partitioned tables as part of Postgres CDC? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、パーティションされたテーブルは、主キーまたはレプリカアイデンティティが定義されている限り、デフォルトでサポートされています。主キーとレプリカアイデンティティは、親テーブルとそのパーティションの両方に存在する必要があります。詳細については [こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) をお読みください。

### Can I connect Postgres databases that don't have a public IP or are in private networks? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！ClickPipes for Postgres は、プライベートネットワーク内のデータベースに接続する二つの方法を提供します：

1. **SSH トンネリング**
   - ほとんどのユースケースでうまく機能します
   - セットアップ手順は [こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection) を参照してください
   - すべてのリージョンで動作します

2. **AWS PrivateLink**
   - 次の 3 つの AWS リージョンで利用可能です：
     - us-east-1
     - us-east-2
     - eu-central-1
   - 詳細なセットアップ手順については、[PrivateLink ドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes) を参照してください
   - PrivateLink が利用できないリージョンでは、SSH トンネリングを使用してください

### How do you handle UPDATEs and DELETEs? {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres は、Postgres から INSERT と UPDATE を ClickHouse の新しい行としてキャプチャします（異なるバージョンを使用）が、カラムの `_peerdb_` バージョン列を使用します。ReplacingMergeTree テーブルエンジンは、定期的にバックグラウンドで重複排除を行い、最新の `_peerdb_` バージョンの行のみを保持します。

Postgres からの DELETE は、削除されたことを示す新しい行として伝播されます（`_peerdb_is_deleted` カラムを使用）。重複排除プロセスは非同期であるため、一時的に重複を確認することがあります。これを解決するには、クエリ層で重複排除を処理する必要があります。

また、デフォルトでは、Postgres は DELETE 操作中に主キーまたはレプリカ アイデンティティに含まれないカラムの値を送信しません。DELETE 操作の際に完全な行データをキャプチャしたい場合は、[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) を FULL に設定できます。

詳細については、以下を参照してください：

* [ReplacingMergeTree テーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC の内部ブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### Can I update primary key columns in PostgreSQL? {#can-i-update-primary-key-columns-in-postgresql}

:::warning
PostgreSQL における主キーの更新は、デフォルトでは ClickHouse で適切に再生できません。

この制限は、`ReplacingMergeTree` の重複排除が `ORDER BY` カラム（通常は主キーに対応）に基づいているためです。PostgreSQL で主キーが更新されると、ClickHouse では異なるキーを持つ新しい行として表示され、既存の行の更新としては表示されません。これにより、古い主キー値と新しい主キー値の両方が ClickHouse テーブルに存在する可能性があります。
:::

主キーのカラムを更新することは、PostgreSQL データベース設計において一般的な慣行ではありません。主キーは不変の識別子であることを意図しているためです。ほとんどのアプリケーションは、設計上主キーの更新を避けているため、一般的なユースケースではこの制限がほとんど遭遇されません。

主キーの更新処理を有効にする実験的な設定があり、一部のパフォーマンスに重大な影響があるため、慎重に考慮しない限り本番環境での使用はお勧めしません。

もしあなたのユースケースが PostgreSQL における主キーの列を更新し、その変更を ClickHouse に適切に反映させる必要がある場合は、[db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com) までご連絡いただき、具体的な要件や潜在的な解決策について話し合ってください。

### Do you support schema changes? {#do-you-support-schema-changes}

詳細については、[ClickPipes for Postgres: Schema Changes Propagation Support](./schema-changes) ページを参照してください。

### What are the costs for ClickPipes for Postgres CDC? {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

詳細な価格情報については、[ClickPipes for Postgres CDC の料金セクション](/cloud/reference/billing/clickpipes) を参照してください。

### My replication slot size is growing or not decreasing; what might be the issue? {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgres のレプリケーションスロットのサイズが増加し続けている、あるいは減少しない場合、これは通常、**WAL (Write-Ahead Log) レコードが CDC パイプラインまたはレプリケーションプロセスによって速やかに消費されていないことを示しています**。以下は最も一般的な原因とその対処法です。

1. **データベースアクティビティの突然のスパイク**
   - 大規模なバッチ更新、バulk インサート、または重要なスキーマ変更は、すぐに大量の WAL データを生成する可能性があります。
   - レプリケーションスロットは、消費されるまでこれらの WAL レコードを保持し、一時的なサイズのスパイクを引き起こします。

2. **長時間実行中のトランザクション**
   - 開いているトランザクションは、トランザクションが開始されて以来生成されたすべての WAL セグメントを保持するため、スロットサイズが劇的に増加します。
   - トランザクションが無限に開いたままにならないように、`statement_timeout` と `idle_in_transaction_session_timeout` を合理的な値に設定します：

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

3. **メンテナンスまたはユーティリティ操作（例：`pg_repack`）**
   - `pg_repack` のようなツールは、テーブル全体を書き換え、大量の WAL データを短時間で生成する可能性があります。
   - トラフィックが少ない時間にこれらの操作をスケジュールするか、実行中に WAL 使用量を注意深く監視してください。

4. **VACUUM と VACUUM ANALYZE**
   - データベースの健康に必要ですが、特に大きなテーブルをスキャンすると、これらの操作は余分な WAL トラフィックを生成する可能性があります。
   - autovacuum チューニングパラメーターの使用や、ピーク時以外の時間に手動 VACUUM 操作をスケジュールすることを検討してください。

5. **レプリケーション消費者がスロットをアクティブに読み取っていない**
   - CDC パイプライン（例：ClickPipes）または他のレプリケーション消費者が停止、休止、クラッシュすると、WAL データはスロットに蓄積されます。
   - パイプラインが継続して動作していることを確認し、接続または認証エラーのログをチェックしてください。

このトピックについての詳細な深掘りを希望する場合は、私たちのブログ記事をチェックしてください：[Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### How are Postgres data types mapped to ClickHouse? {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres の目的は、Postgres データタイプを可能な限りネイティブに ClickHouse 側にマッピングすることです。この文書は、各データタイプとそのマッピングの包括的なリストを提供します：[Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix)。

### Can I define my own data type mapping while replicating data from Postgres to ClickHouse? {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現在、パイプの一部としてカスタムデータタイプマッピングを定義することはサポートされていません。ただし、ClickPipes によって使用されるデフォルトのデータタイプマッピングは非常にネイティブであることに留意してください。Postgres のほとんどのカラムタイプは、ClickHouse のネイティブな同等物にできるだけ近くレプリケートされます。たとえば、Postgres の整数配列タイプは、ClickHouse でも整数配列タイプとしてレプリケートされます。

### How are JSON and JSONB columns replicated from Postgres? {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON および JSONB カラムは、ClickHouse で String タイプとしてレプリケートされます。ClickHouse はネイティブな [JSON タイプ](/sql-reference/data-types/newjson) をサポートしているため、必要に応じて ClickPipes テーブル上でマテリアライズドビューを作成して変換を実行できます。あるいは、[JSON 関数](/sql-reference/functions/json-functions) を String カラムで直接使用することもできます。私たちは現在、JSON カラムと JSONB カラムを ClickHouse の JSON タイプに直接レプリケートする機能に取り組んでいます。この機能は数ヶ月以内に利用可能になる予定です。

### What happens to inserts when a mirror is paused? {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソース Postgres のレプリケーションスロットにキューアップされ、バッファリングされて失われることはありません。ただし、ミラーを一時停止して再開すると、接続が再確立されるため、ソースによって時間がかかる場合があります。

このプロセスでは、同期（Postgres からデータを引き出して、ClickHouse の生テーブルにストリーミングする）およびノーマライズ（生テーブルからターゲットテーブルへの）操作が中止されます。ただし、耐久性を持たせるために再開するために必要な状態を保持しています。

- 同期が途中でキャンセルされた場合、Postgres の confirmed_flush_lsn は進まないため、次の同期は中止したものの同じ位置から開始され、データの一貫性が保たれます。
- ノーマライズ用の ReplacingMergeTree の挿入順序は、重複排除を処理します。

要約すると、一時停止中に同期およびノーマライズプロセスが終了しても、データの損失や不整合なく再開できるため、安全に実行できます。

### Can ClickPipe creation be automated or done via API or CLI? {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe は、[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) エンドポイントを介して作成および管理することもできます。この機能はベータ版であり、API リファレンスは [こちら](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta) で確認できます。私たちは Postgres ClickPipes を作成するための Terraform サポートにも取り組んでいます。

### How do I speed up my initial load? {#how-do-i-speed-up-my-initial-load}

すでに実行中の初期ロードを加速することはできません。ただし、特定の設定を調整することで将来の初期ロードを最適化できます。デフォルトでは、これらの設定は 4 つの並列スレッドで構成され、各パーティションのスナップショット行数は 100,000 に設定されています。これらは高度な設定であり、一般的にはほとんどのユースケースに十分です。

Postgres バージョン 13 以下では、CTID 範囲スキャンが遅くなるため、これらの設定がより重要になります。その場合、パフォーマンスを向上させるために次のプロセスを検討してください：

1. **既存のパイプを削除**: 新しい設定を適用するためには必要です。
2. **ClickHouse の宛先テーブルを削除**: 前のパイプによって作成されたテーブルを削除します。
3. **最適化された設定で新しいパイプを作成**: 通常、パーティションごとのスナップショットの行数を 100 万から 1000 万の間で増やすことを検討します。これは、特定の要件や Postgres インスタンスが処理できる負荷によります。

これらの調整は、特に古い Postgres バージョンの場合、初期ロードのパフォーマンスを大幅に向上させるはずです。Postgres 14 以降を使用している場合、これらの設定は CTID 範囲スキャンのサポートが改善されたため、影響は少なくなります。

### How should I scope my publications when setting up replication? {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipes による出版物の管理を任せることができます（追加の権限が必要）し、自分で作成することもできます。ClickPipes によって管理される出版物であれば、パイプを編集する際にテーブルの追加と削除を自動的に処理します。自主管理の場合は、レプリケートする必要があるテーブルのみを含めるように出版物を慎重にスコープしてください。不要なテーブルを含めると、Postgres の WAL デコーディングが遅くなります。

出版物に任意のテーブルを含める場合は、それに主キーまたは `REPLICA IDENTITY FULL` があることを確認してください。主キーがないテーブルがある場合、すべてのテーブルのために出版物を作成すると、そのテーブルで DELETE および UPDATE 操作が失敗します。

データベース内の主キーがないテーブルを特定するには、以下のクエリを使用できます：

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

主キーがないテーブルを処理する際には、次の 2 つのオプションがあります：

1. **ClickPipes から主キーがないテーブルを除外する**:
   主キーがあるテーブルのみで出版物を作成します：

```sql
CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
```

2. **ClickPipes に主キーがないテーブルを含める**:
   主キーのないテーブルを含めたい場合は、そのレプリカアイデンティティを `FULL` に変更する必要があります。これにより、UPDATE および DELETE 操作が正しく機能します：

```sql
ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
```

:::tip
ClickPipes が出版物を管理させるのではなく、手動で出版物を作成する場合は、`FOR ALL TABLES` の出版物を作成することはお勧めしません。これにより、Postgres から ClickPipes へのトラフィックが増え（パイプにない他のテーブルの変更を送信するため）全体の効率が低下します。

手動で作成された出版物の場合は、パイプに追加する前に、出版物に必要なテーブルを追加してください。
:::

:::warning
Postgres の読み取りレプリカ/ホットスタンバイからレプリケートしている場合は、プライマリインスタンスで独自の出版物を作成する必要があります。これは、自動的にスタンバイに伝播します。この場合は、ClickPipe が出版物を管理することはできません。なぜなら、スタンバイで出版物を作成できないからです。
:::

### Recommended `max_slot_wal_keep_size` settings {#recommended-max_slot_wal_keep_size-settings}

- **最低限**: [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) を設定して、少なくとも **2 日分** の WAL データを保持します。
- **大規模データベース (高トランザクションボリューム)**: ピーク時の WAL 生成の **2-3 倍** を保持します。
- **ストレージ制約のある環境**: ディスクの枯渇を避けつつ、レプリケーションの安定性を確保するように保守的に調整します。

#### How to calculate the right value {#how-to-calculate-the-right-value}

適切な設定を決定するには、WAL 生成率を測定します：

##### For PostgreSQL 10+ {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

##### For PostgreSQL 9.6 and below: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 日中の異なる時間に上記のクエリを実行し、特にトランザクションが多い時間帯に注意を払います。
* 24 時間あたりに生成される WAL の量を計算します。
* この数値に 2 または 3 を掛けて、十分な保持期間を確保します。
* resulting value を MB または GB で `max_slot_wal_keep_size` に設定します。

##### Example {#example}

データベースが 1 日あたり 100 GB の WAL を生成する場合、次のように設定します：

```sql
max_slot_wal_keep_size = 200GB
```

### I'm seeing a ReceiveMessage EOF error in the logs. What does it mean? {#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean}

`ReceiveMessage` は、Postgres の論理デコーディングプロトコルにおける関数で、レプリケーションストリームからメッセージを読み取ります。EOF（End of File）エラーは、レプリケーションストリームから読み取ろうとしている際に Postgres サーバーへの接続が予期せず閉じられたことを示します。

これは回復可能であり、完全に無害なエラーです。ClickPipes は自動的に再接続を試み、レプリケーションプロセスを再開します。

いくつかの理由で発生することがあります：
- **低い wal_sender_timeout**: `wal_sender_timeout` を 5 分以上に設定してください。この設定は、サーバーがクライアントからの応答を待つ時間を制御し、その間に接続を閉じます。タイムアウトが低すぎると、早期の切断が発生する可能性があります。
- **ネットワークの問題**: 一時的なネットワーク障害が接続のドロップを引き起こす可能性があります。
- **Postgres サーバーの再起動**: Postgres サーバーが再起動またはクラッシュすると、接続が失われます。

### My replication slot is invalidated. What should I do? {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipe を回復する唯一の方法は、設定ページで再同期をトリガーすることです。

レプリケーションスロットの無効化の最も一般的な原因は、PostgreSQL データベースの `max_slot_wal_keep_size` 設定が低いことです（例：数 GB）。この値を増やすことをお勧めします。[ここ](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) を参照して `max_slot_wal_keep_size` の調整について確認してください。理想的には、200GB 以上に設定してレプリケーションスロットの無効化を防ぐ必要があります。

ごくまれに、`max_slot_wal_keep_size` が設定されていない場合にこの問題が発生することもあります。この原因は、PostgreSQL の複雑でまれなバグによるものかもしれませんが、その原因は不明です。

### I am seeing out of memory (OOMs) on ClickHouse while my ClickPipe is ingesting data. Can you help? {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse で OOM が発生する一般的な理由の一つは、あなたのサービスが十分でないことです。これは、現在のサービス構成がデータの取り込み負荷を効果的に処理するのに十分なリソース（メモリや CPU など）がないことを意味します。ClickPipe データの取り込みの要求に応じてサービスをスケールアップすることを強くお勧めします。

別の理由として、最適化されていない結合を持つ下流の Materialized Views の存在があります：

- JOIN の一般的な最適化技法として、右側のテーブルが非常に大きい `LEFT JOIN` がある場合があります。この場合、クエリを `RIGHT JOIN` を使用して書き換え、大きなテーブルを左側に移動します。これにより、クエリプランナーがよりメモリ効率的になります。

- JOIN の別の最適化手法は、`サブクエリ` または `CTEs` を通じてテーブルを明示的にフィルタリングし、それらのサブクエリを通じて `JOIN` を実行することです。これにより、プランナーに対して効率的に行をフィルタリングし、JOIN を実行するためのヒントを提供します。

### I am seeing an `invalid snapshot identifier` during the initial load. What should I do? {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` エラーは、ClickPipes とあなたの Postgres データベース間の接続が切断された場合に発生します。これは、ゲートウェイのタイムアウト、データベースの再起動、その他の一時的な問題が原因で発生する可能性があります。

初期ロードが進行中の間は、Postgres データベースでのアップグレードや再起動などの混乱を伴う操作を実行せず、データベースへのネットワーク接続が安定していることを確認することをお勧めします。

この問題を解決するには、ClickPipes UI から再同期をトリガーすることができます。これにより、初期ロードプロセスは最初から再開されます。

### What happens if I drop a publication in Postgres? {#what-happens-if-i-drop-a-publication-in-postgres}

Postgres で出版物を削除すると、ClickPipe 接続が切断されます。その出版物は、ClickPipe がソースから変更を引き出すのに必要だからです。これが発生すると、通常は、その出版物がもはや存在しないことを示すエラーアラートが表示されます。

出版物を削除した後に ClickPipe を回復するには：

1. Postgres で同じ名前と必要なテーブルを持つ新しい出版物を作成します。
2. ClickPipe の設定タブで「テーブルを再同期」ボタンをクリックします。

この再同期は、再作成された出版物が Postgres で異なるオブジェクト識別子 (OID) を持つため必要です。同じ名前でも、再同期プロセスは宛先テーブルを更新し、接続を復元します。

好ましい場合は、完全に新しいパイプを作成することもできます。

パーティションテーブルを扱う場合は、適切な設定で出版物を作成することを確認してください：

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```

### What if I am seeing `Unexpected Datatype` errors or `Cannot parse type XX ...` {#what-if-i-am-seeing-unexpected-datatype-errors}

このエラーは、通常、ソースの Postgres データベースに、取り込み中にマッピングできないデータ型がある場合に発生します。
より具体的な問題については、以下の可能性を参照してください。

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres の `NUMERIC` は非常に高い精度を持ちます（小数点前最大 131072 桁、小数点後最大 16383 桁まで）。ClickHouse の Decimal タイプは、最大 (76 桁、39 スケール) を許容します。
このシステムは、通常、サイズがそれほど大きくならないと仮定し、ソーステーブルに多くの行が含まれているか、CDC フェーズ中に行が入ってくることを考慮して楽観的なキャストを行います。

現在の回避策は、ClickHouse 上の NUMERIC タイプを文字列にマッピングすることです。これを有効にするには、サポートチームにチケットを提出してください。これにより、ClickPipes に対して有効になります。

### I'm seeing errors like `invalid memory alloc request size <XXX>` during replication/slot creation {#postgres-invalid-memalloc-bug}

Postgres パッチバージョン 17.5/16.9/15.13/14.18/13.21 で導入されたバグにより、特定のワークロードがメモリ使用量を指数関数的に増加させ、1GB を超えるメモリ割り当て要求を引き起こすことがあります。これは Postgres が無効と見なします。このバグは [修正されました](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a) 次の Postgres パッチシリーズ (17.6...) に含まれています。このパッチバージョンがアップグレードのために利用可能になるのはいつか、Postgres プロバイダーに確認してください。アップグレードがすぐに可能でない場合は、エラーが発生した場合は再同期が必要です。

### I need to maintain a complete historical record in ClickHouse, even when the data is deleted from the source Postgres database. Can I completely ignore DELETE and TRUNCATE operations from Postgres in ClickPipes? {#ignore-delete-truncate}

はい！Postgres ClickPipe を作成する前に、DELETE 操作なしで出版物を作成してください。たとえば：
```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```
その後、[設定](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings) の際にこの出版物名が選択されていることを確認してください。

TRUNCATE 操作は ClickPipes によって無視され、ClickHouse に複製されることはありません。

### Why can I not replicate my table which has a dot in it? {#replicate-table-dot}
PeerDB には、ソーステーブル識別子にドットが含まれている場合、レプリケートできない制限があります。これは、PeerDB がその場合にスキーマとテーブルを区別できないためです。スキーマ名とテーブル名を別々に入力できるようにするための支援が行われています。

### Initial load completed but there is no/missing data on ClickHouse. What could be the issue? {#initial-load-issue}
初期ロードがエラーなしで完了したが、宛先 ClickHouse テーブルにデータが欠けている場合、ソース Postgres テーブルに RLS（行レベルセキュリティ）ポリシーが有効になっている可能性があります。
また確認すべき点：
- ユーザーがソーステーブルを読み取るために十分な権限を持っているか。
- ClickHouse 側に、行をフィルタリングする可能性がある行ポリシーがないか。

### Can I have the ClickPipe create a replication slot with failover enabled? {#failover-slot}
はい、CDC またはスナップショット + CDC のレプリケーションモードを持つ Postgres ClickPipe については、ClickPipes がフェイルオーバーを有効にしたレプリケーションスロットを作成できます。ClickPipe を作成する際に、`Advanced Settings` セクションで以下のスイッチを切り替えてください。この機能を使用するには、Postgres バージョンが 17 以上である必要があります。

<Image img={failover_slot} border size="md"/>

ソースが適切に構成されている場合、スロットは Postgres 読み取りレプリカへのフェイルオーバー後も保持され、継続的なデータレプリケーションが確保されます。詳細は [こちら](https://www.postgresql.org/docs/current/logical-replication-failover.html) を参照してください。
