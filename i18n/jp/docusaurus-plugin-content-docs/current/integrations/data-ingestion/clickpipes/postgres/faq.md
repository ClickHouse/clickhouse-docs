---
sidebar_label: 'FAQ'
description: 'Postgres 用の ClickPipes に関するよくある質問。'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'Postgres 用の ClickPipes よくある質問'
---
```


# Postgres 用の ClickPipes よくある質問

### idle 時間は Postgres CDC ClickPipe にどのように影響しますか？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

ClickHouse Cloud サービスがアイドル状態の時でも、Postgres CDC ClickPipe はデータ同期を継続します。次の同期インターバルでサービスはウェイクアップし、受信データの処理を行います。同期が完了し、アイドル期間に到達すると、サービスは再びアイドル状態に戻ります。

例として、同期インターバルが 30 分に設定されていて、サービスのアイドル時間が 10 分に設定されている場合、サービスは 30 分ごとにウェイクアップし、10 分間アクティブになり、その後再びアイドル状態に戻ります。

### ClickPipes for Postgres では TOAST カラムはどのように取り扱われますか？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

TOAST カラムの取り扱いについては、[TOAST カラムの取り扱い](./toast) ページを参照してください。

### ClickPipes for Postgres では生成カラムはどのように取り扱われますか？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

生成カラムの取り扱いについては、[Postgres 生成カラム: 注意点とベストプラクティス](./generated_columns) ページを参照してください。

### テーブルは Postgres CDC の一部となるために主キーを持つ必要がありますか？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

はい、CDC のためにはテーブルは主キーまたは [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) を持っている必要があります。REPLICA IDENTITY は FULL に設定するか、一意のインデックスを使用するように構成できます。

### Partitioned Tables を Postgres CDC の一部としてサポートしていますか？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、PARTITIONED TABLE は、主キーまたは REPLICA IDENTITY が定義されている限り、ボックスから出てすぐにサポートされています。主キーと REPLICA IDENTITY は、親テーブルとそのパーティションの両方に存在する必要があります。詳細は、[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) をお読みください。

### 公開 IP を持たない、またはプライベートネットワーク内の Postgres データベースに接続できますか？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！Postgres 用の ClickPipes は、プライベートネットワーク内のデータベースに接続するための 2 つの方法を提供します：

1. **SSH トンネリング**
   - ほとんどのユースケースでうまく機能します
   - 設定手順は [こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection) を参照してください
   - すべてのリージョンで動作します

2. **AWS PrivateLink**
   - 次の 3 つの AWS リージョンで利用可能です：
     - us-east-1
     - us-east-2
     - eu-central-1
   - 詳細な設定手順については、[PrivateLink ドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください
   - PrivateLink が利用できないリージョンでは、SSH トンネリングを使用してください

### UPDATE と DELETE はどのように扱われますか？ {#how-do-you-handle-updates-and-deletes}

Postgres 用の ClickPipes は、INSERT と UPDATE の両方を新しい行としてキャプチャします。ClickHouse では異なるバージョンを持つ行（`_peerdb_` バージョンカラムを使用）として保存されます。ReplacingMergeTree テーブルエンジンは、バックグラウンドで定期的に重複排除を行い、最新の `_peerdb_` バージョンの行のみを保持します。

Postgres からの DELETE は、新しい行として複製され、削除済みとしてマークされます（`_peerdb_is_deleted` カラムを使用）。重複排除プロセスは非同期で行われるため、一時的に重複が表示されることがあります。これに対処するには、クエリ層で重複排除を行う必要があります。

詳細については、以下を参照してください：

* [ReplacingMergeTree テーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres から ClickHouse への CDC インターナルブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### スキーマ変更をサポートしていますか？ {#do-you-support-schema-changes}

スキーマ変更の伝播サポートについては、[Postgres 用 ClickPipes: スキーマ変更の伝播サポート](./schema-changes) ページを参照してください。

### Postgres 用の ClickPipes CDC のコストはどれくらいですか？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

プレビュー期間中、ClickPipes は無料です。GA 後の価格は未定です。目標は、外部 ETL ツールと比較して価格が合理的かつ競争力のあるものにすることです。

### レプリケーションスロットサイズが増加したり減少しにくくなった場合、考えられる問題は何ですか？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgres のレプリケーションスロットのサイズが増加し続けているか、戻らない場合は、通常、**WAL (Write-Ahead Log) レコードがあなたの CDC パイプラインまたはレプリケーションプロセスによって速やかに消費（または「リプレイ」）されていないことを意味します**。以下は、最も一般的な原因と対処方法です。

1. **データベースアクティビティの突然のスパイク**  
   - 大量のバッチ更新、大量挿入、または重要なスキーマ変更が行われると、短期間に大量の WAL データが生成される可能性があります。  
   - レプリケーションスロットは、消費されるまでこれらの WAL レコードを保持し、サイズの一時的なスパイクが発生します。

2. **長時間実行されるトランザクション**  
   - 開いているトランザクションは、トランザクションが開始されて以来生成されたすべての WAL セグメントを Postgres に保持させるため、スロットのサイズが大幅に増加する可能性があります。  
   - `statement_timeout` と `idle_in_transaction_session_timeout` を合理的な値に設定して、トランザクションが無限に開いたままにならないようにしてください：
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
     このクエリを使用して異常に長時間実行されるトランザクションを特定します。

3. **メンテナンスまたはユーティリティ操作（例: `pg_repack`）**  
   - `pg_repack` のようなツールは、テーブル全体を再構築し、短期間で大量の WAL データを生成する場合があります。  
   - これらの操作はトラフィックが少ない期間中にスケジュールするか、実行中に WAL 使用量を注意深く監視してください。

4. **VACUUM と VACUUM ANALYZE**  
   - データベースの健康には必要ですが、特に大きなテーブルをスキャンする場合、これらの操作は追加の WAL トラフィックを生成する可能性があります。  
   - autovacuum チューニングパラメータを使用するか、オフピーク時に手動での VACUUM 操作をスケジュールすることを考慮してください。

5. **レプリケーションコンシューマがスロットをアクティブに読み込まない**  
   - CDC パイプライン（例: ClickPipes）または他のレプリケーションコンシューマが停止、ポーズ、またはクラッシュすると、WAL データはスロットに蓄積されます。  
   - パイプラインが継続的に実行されていることを確認し、接続性や認証エラーについてログを確認してください。

このトピックについての詳細な考察については、私たちのブログをチェックしてください：[Postgres 論理デコーディングの落とし穴を克服する](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres のデータ型は ClickHouse にどのようにマッピングされていますか？ {#how-are-postgres-data-types-mapped-to-clickhouse}

Postgres 用の ClickPipes では、ClickHouse 側で Postgres のデータ型をできるだけネイティブにマップすることを目指しています。このドキュメントでは、各データ型とそのマッピングの包括的なリストを提供しています: [データ型マトリックス](https://docs.peerdb.io/datatypes/datatype-matrix)。

### Postgres から ClickHouse にデータを複製する際に、独自のデータ型マッピングを定義できますか？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現時点では、パイプの一部としてカスタムデータ型マッピングを定義することはサポートしていません。ただし、ClickPipes が使用するデフォルトのデータ型マッピングは非常にネイティブです。Postgres のほとんどのカラムタイプは、ClickHouse のネイティブの同等物にできるだけ近く複製されます。たとえば、Postgres の整数配列タイプは、ClickHouse の整数配列タイプとして複製されます。

### JSON と JSONB カラムは Postgres からどのように複製されますか？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON と JSONB カラムは、ClickHouse では String 型として複製されます。ClickHouse はネイティブな [JSON 型](/sql-reference/data-types/newjson) をサポートしているので、必要に応じて ClickPipes テーブルに対するマテリアライズドビューを作成して翻訳を行うことができます。あるいは、直接 String カラムに対して [JSON 関数](/sql-reference/functions/json-functions) を使用できます。私たちは、ClickHouse において JSON と JSONB カラムを直接 JSON 型に複製する機能に積極的に取り組んでいます。この機能は数ヶ月以内に提供予定です。

### ミラーを一時停止した場合、挿入はどうなりますか？ {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソース Postgres のレプリケーションスロットにキューに積まれ、バッファリングされて失われないようになります。ただし、ミラーを一時停止して再開すると、接続が再確立されるのに時間がかかる場合があります。

このプロセス中、同期（Postgres からデータをプルして ClickHouse の生テーブルにストリーミングする）および正規化（生テーブルからターゲットテーブルへの）操作は中断されます。ただし、耐久的に再開するために必要な状態は保持されます。 

- 同期については、途中でキャンセルされた場合、Postgres の confirmed_flush_lsn は進まないため、次の同期は中断されたところから開始され、データの整合性が確保されます。
- 正規化については、ReplacingMergeTree 挿入順序が重複排除を処理します。

要約すると、同期と正規化プロセスは一時停止中に終了しますが、データの喪失や不整合なしに再開できるため、安全です。

### ClickPipe の作成は自動化できるか、API または CLI 経由で行えますか？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe は、[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) エンドポイントを介して作成および管理することもできます。この機能はベータ版であり、API リファレンスは [こちら](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta) で確認できます。私たちは、Postgres ClickPipes を作成するための Terraform サポートにも取り組んでいます。

### 初回ロードをどのように高速化できますか？ {#how-do-i-speed-up-my-initial-load}

すでに実行中の初回ロードを高速化することはできません。ただし、特定の設定を調整することで将来の初回ロードを最適化できます。デフォルトでは、設定は 4 つの並列スレッドとパーティションごとのスナップショット行数が 100,000 に構成されています。これらは高度な設定であり、ほとんどのユースケースには十分です。

Postgres バージョン 13 またはそれ以前では、CTID の範囲スキャンが遅くなるため、これらの設定がより重要になります。その場合、パフォーマンスを向上させるために以下のプロセスを検討してください：

1. **既存のパイプを削除**: 新しい設定を適用するにはこれが必要です。
2. **ClickHouse 上の宛先テーブルを削除**: 前のパイプで作成されたテーブルが削除されていることを確認してください。
3. **最適化された設定で新しいパイプを作成**: 通常、パーティションごとのスナップショット行数を 100 万から 1000 万の範囲に増やします。これは特定の要件や Postgres インスタンスが処理できる負荷に応じて調整します。

これらの調整により、初回ロードのパフォーマンスが大幅に向上するはずです。特に古い Postgres バージョンのために。Postgres 14 以降を使用している場合、これらの設定の影響は小さくなります。

### レプリケーションを設定する際、公開物のスコープをどのように決定すべきですか？ {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipes に公開物を管理させることもできます（追加の権限が必要）し、または自分で作成することもできます。ClickPipes による管理の公開物の場合、パイプを編集する際にテーブルの追加と削除を自動的に処理します。セルフマネージドの場合は、複製が必要なテーブルのみを含むように公開物のスコープを注意深く設定してください。不要なテーブルを含めると、Postgres WAL デコーディングが遅延します。

公開物にテーブルを含める場合は、必ず主キーまたは `REPLICA IDENTITY FULL` を持っていることを確認してください。主キーを持たないテーブルがある場合、すべてのテーブルに対して公開物を作成すると、そのテーブル上での DELETE および UPDATE 操作が失敗します。

データベース内の主キーを持たないテーブルを特定するには、以下のクエリを使用できます：
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

主キーを持たないテーブルを扱う方法には 2 つのオプションがあります：

1. **ClickPipes から主キーを持たないテーブルを除外する**:
   主キーを持つテーブルのみで公開物を作成します：
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **ClickPipes に主キーなしのテーブルを含める**:
   主キーなしのテーブルを含めたい場合は、そのレプリカアイデンティティを `FULL` に変更する必要があります。これにより、UPDATE および DELETE 操作が正しく機能します：
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
ClickPipes に管理させずに手動で公開物を作成する場合は、公開物を `FOR ALL TABLES` で作成することはお勧めしません。これにより、他のテーブルの変更を ClickPipes に送信するためのトラフィックが増加し、全体的な効率が低下します。

手動で作成した公開物には、パイプに追加する前に公開物に追加したいテーブルを追加してください。
::: 

## 推奨される `max_slot_wal_keep_size` 設定 {#recommended-max_slot_wal_keep_size-settings}

- **最低限:** [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) を設定し、少なくとも **2 日分** の WAL データを保持します。
- **大規模データベース（高トランザクションボリューム）の場合:** 一日あたりの最大 WAL 生成量の **2-3 倍** を保持します。
- **ストレージが制限されている環境の場合:** ディスク枯渇を避けつつレプリケーションを安定させるために、これを保守的に調整します。

### 適切な値を計算する方法 {#how-to-calculate-the-right-value}

適切な設定を決定するには、WAL 生成率を測定します：

#### PostgreSQL 10 以上の場合: {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### PostgreSQL 9.6 以前の場合: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 一日の異なる時間で上記クエリを実行し、特に高トランザクションの期間中をターゲットにします。
* 24 時間あたりに生成される WAL の量を計算します。
* その数値に 2 または 3 を掛けて適切な保管量を確保します。
* `max_slot_wal_keep_size` を MB または GB で得られた値に設定します。

#### 例: {#example}

もしデータベースが 1 日あたり 100 GB の WAL を生成する場合、次のように設定します：

```sql
max_slot_wal_keep_size = 200GB
```

### レプリケーションスロットが無効化されています。どうすればよいですか？ {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipe を回復する唯一の方法は、再同期をトリガーすることです。これを設定画面で行うことができます。

レプリケーションスロットが無効化される最も一般的な原因は、PostgreSQL データベースの `max_slot_wal_keep_size` 設定が低いことです（例: 数ギガバイト）。この値を増やすことをお勧めします。[こちらのセクション](https://docs.peerdb.io/datatypes/datatype-matrix#how-are-postgres-data-types-mapped-to-clickhouse)を参照し、`max_slot_wal_keep_size` のチューニングを行ってください。理想的には、これを少なくとも 200GB に設定してレプリケーションスロットの無効化を防ぎます。

稀に、`max_slot_wal_keep_size` が設定されていない場合でもこの問題が発生することがあります。これは PostgreSQL における複雑で稀なバグによる可能性がありますが、原因は不明のままです。

## ClickHouse でのデータ取り込み中に Out Of Memory (OOM) が発生しています。どうすれば助けてくれますか？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse における OOM の一般的な原因は、サービスが不足していることです。つまり、現在のサービス構成では、取り込みの負荷を適切に処理するためのリソース（メモリや CPU）が不足しています。ClickPipe データの取り込み要求に応じるために、サービスをスケールアップすることを強くお勧めします。

もうひとつの観察された理由は、潜在的に最適化されていない結合を持つ下流の Materialized View の存在です：

- JOIN の一般的な最適化技術は、右側のテーブルが非常に大きい場合の `LEFT JOIN` です。この場合、クエリを `RIGHT JOIN` に書き換え、大きなテーブルを左側に移動すると、クエリプランナーがメモリ効率を高めることができます。

- JOIN に対する別の最適化は、`subqueries` または `CTEs` を通じてテーブルを明示的にフィルタリングし、その後これらのサブクエリ間で `JOIN` を実行することです。これにより、プランナーが行を効率的にフィルタリングし、JOIN を実行するためのヒントを得られます。

## 初回ロード中に `invalid snapshot identifier` が表示される場合、どうすればよいですか？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` エラーは、ClickPipes と Postgres データベース間の接続が切断された場合に発生します。これは、ゲートウェイタイムアウト、データベースの再起動、または他の一時的な問題が原因で発生する可能性があります。

初回ロード中に、Postgres データベースでアップグレードや再起動などの妨害活動を行わないことをお勧めします。また、データベースのネットワーク接続が安定していることを確認してください。 

この問題を解決するには、ClickPipes UI から再同期をトリガーできます。これにより、初回ロードプロセスが最初から再起動されます。

## Postgres で公開物を削除した場合、どうなりますか？ {#what-happens-if-i-drop-a-publication-in-postgres}

Postgres で公開物を削除すると、ClickPipe 接続が切断されます。これは、ClickPipe がソースから変更を取得するために必要だからです。この場合、通常、公開物がもう存在しないことを示すエラーアラートが表示されます。

公開物を削除した後に ClickPipe を回復するには：

1. Postgres で同じ名前と必要なテーブルを持つ新しい公開物を作成します。
2. ClickPipe の設定タブで「テーブルの再同期」ボタンをクリックします。

この再同期は必要です。なぜなら、再作成された公開物は Postgres で異なるオブジェクト識別子（OID）を持つためです。たとえ同じ名前でも。同再同期プロセスは宛先テーブルを更新し、接続を復元します。

また、好みに応じてまったく新しいパイプを作成することもできます。

パーティショニングされたテーブルを使用している場合、適切な設定で公開物を作成することを確認してください：

```sql
CREATE PUBLICATION clickpipes_publication 
FOR TABLE <...>, <...>  
WITH (publish_via_partition_root = true);
```

## `Unexpected Datatype` エラーや `Cannot parse type XX ...` というエラーが表示される場合、どうすればよいですか？ {#what-if-i-am-seeing-unexpected-datatype-errors}

このエラーは、ソース Postgres データベースに取り込み中にマッピングできないデータ型が存在する場合に一般的に発生します。具体的な問題については、以下の可能性を参照してください。

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres の `NUMERIC` 型は非常に高い精度を持っており（小数点の前に最大 131072 桁、小数点の後に最大 16383 桁）、ClickHouse の Decimal 型は最大 (76 桁、39 スケール) です。
システムは、_通常_ サイズがそれほど大きくならないと仮定し、同じソーステーブルが多数の行を持っているか、CDC フェーズ中に行が来る可能性があるため、楽観的なキャストを行います。

現在の回避策は、ClickHouse で NUMERIC 型を文字列にマッピングすることです。これを有効にするには、サポートチームにチケットを提出してください。これにより、ClickPipes 用に有効にされます。
