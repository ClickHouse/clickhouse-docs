---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about ClickPipes for Postgres.'
slug: '/integrations/clickpipes/postgres/faq'
sidebar_position: 2
title: 'ClickPipes for Postgres FAQ'
---





# ClickPipes for Postgres FAQ

### idlingは私のPostgres CDC ClickPipeにどのように影響しますか？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

あなたのClickHouse Cloudサービスがアイドル状態であっても、Postgres CDC ClickPipeはデータの同期を続けます。次回の同期間隔でサービスが起動して、受信データを処理します。同期が終了しアイドル期間に達すると、サービスは再びアイドル状態に戻ります。

例として、同期間隔が30分に設定され、サービスのアイドル時間が10分に設定されている場合、サービスは30分ごとに起動し、10分間アクティブになり、その後アイドル状態に戻ります。

### ClickPipes for PostgresではTOASTカラムはどのように処理されますか？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

詳細については、[TOASTカラムの処理](./toast)ページをご覧ください。

### ClickPipes for Postgresでは生成されたカラムはどのように処理されますか？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

詳細については、[Postgres生成カラム: 注意点とベストプラクティス](./generated_columns)ページをご覧ください。

### テーブルはPostgres CDCの一部となるために主キーを持っている必要がありますか？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

はい、CDCのためには、テーブルは主キーまたは[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)を持っている必要があります。REPLICA IDENTITYはFULLに設定するか、ユニークインデックスを使用するように構成することができます。

### パーティション化されたテーブルはPostgres CDCの一部としてサポートしていますか？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、主キーまたはREPLICA IDENTITYが定義されている限り、パーティション化されたテーブルは標準でサポートされています。主キーとREPLICA IDENTITYは親テーブルとそのパーティションの両方に存在する必要があります。詳細については[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)をご覧ください。

### 公開IPを持たないPostgresデータベースやプライベートネットワークにあるデータベースに接続できますか？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！ClickPipes for Postgresは、プライベートネットワーク内のデータベースに接続するための2つの方法を提供しています：

1. **SSHトンネリング**
   - ほとんどのユースケースでうまく機能します
   - セットアップ手順については[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)を参照してください
   - すべてのリージョンで機能します

2. **AWS PrivateLink**
   - 次の3つのAWSリージョンで利用可能です： 
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 詳細なセットアップ手順については、[PrivateLinkドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes)をご覧ください
   - PrivateLinkが利用できないリージョンでは、SSHトンネリングを使用してください

### UPDATEおよびDELETEはどのように処理しますか？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgresは、PostgresからのINSERTおよびUPDATEをClickHouse内の異なるバージョンを持つ新しい行としてキャプチャします（`_peerdb_`バージョンカラムを使用）。ReplacingMergeTreeテーブルエンジンは、順序キー（ORDER BYカラム）に基づいて定期的に重複除去をバックグラウンドで実行し、最新の`_peerdb_`バージョンを持つ行のみを保持します。

PostgresからのDELETEは削除されたことを示す新しい行として伝播します（`_peerdb_is_deleted`カラムを使用）。重複除去プロセスは非同期で行われるため、一時的に重複が見られることがあります。これを解決するには、クエリ層で重複除去を処理する必要があります。

詳細については以下を参照してください：

* [ReplacingMergeTreeテーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [PostgresからClickHouseへのCDC内部ブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### スキーマの変更をサポートしていますか？ {#do-you-support-schema-changes}

詳細については、[ClickPipes for Postgres: スキーマ変更の伝播サポート](./schema-changes)ページをご覧ください。

### ClickPipes for Postgres CDCのコストはどのようになりますか？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

プレビュー中はClickPipesは無料です。GA以降の価格はまだ未定です。価格は合理的で、外部ETLツールと比べて非常に競争力のあるものであることを目指しています。

### レプリケーションスロットのサイズが増加したり減少しない場合、問題は何ですか？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgresのレプリケーションスロットのサイズが増加し続けている場合、または減少しない場合、それは通常、**WAL (Write-Ahead Log)レコードがCDCパイプラインまたはレプリケーションプロセスによって十分に早く消費されていないことを意味します**。以下は最も一般的な原因とその対処法です。

1. **データベースのアクティビティの急激なスパイク**  
   - 大規模なバッチ更新、大量の挿入、または重要なスキーマ変更などは、短時間で大量のWALデータを生成する可能性があります。  
   - レプリケーションスロットは、これらのWALレコードが消費されるまで保持し、サイズが一時的に増加します。

2. **長時間実行されるトランザクション**  
   - オープントランザクションにより、Postgresはトランザクションが開始された時点以降に生成されたすべてのWALセグメントを保持する必要があるため、スロットサイズが大幅に増加する可能性があります。  
   - `statement_timeout`および`idle_in_transaction_session_timeout`を合理的な値に設定して、トランザクションが無期限にオープンのままにならないようにします。このクエリを使用して、異常に長いトランザクションを特定できます：
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

3. **メンテナンスまたはユーティリティ操作 (例: `pg_repack`)**  
   - `pg_repack`などのツールは、テーブル全体を書き直すことができ、短時間で大量のWALデータを生成します。  
   - これらの操作は、トラフィックが少ない時間帯にスケジュールするか、実行中にWAL使用量を注意深く監視します。

4. **VACUUMおよびVACUUM ANALYZE**  
   - データベースの健康に必要ですが、特に大きなテーブルをスキャンする場合は、追加のWALトラフィックを生成する可能性があります。  
   - autovacuumの調整パラメータを利用するか、オフピーク時に手動のVACUUM操作をスケジュールすることを検討します。

5. **レプリケーションコンシューマがスロットを積極的に読み取っていない**  
   - CDCパイプライン（例: ClickPipes）または他のレプリケーションコンシューマが停止、休止、またはクラッシュすると、WALデータがスロットに蓄積されます。  
   - パイプラインが継続的に実行されていることを確認し、接続や認証エラーのログをチェックします。

このトピックに関する詳細な分析は、ブログ記事[Postgres Logical Decodingの回避策](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)を参照してください。

### Postgresのデータ型はClickHouseにどのようにマッピングされますか？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgresは、ClickHouse側でPostgresデータ型をできるだけネイティブにマッピングすることを目指しています。この文書では、各データ型とそのマッピングの包括的なリストを提供します：[データ型マトリックス](https://docs.peerdb.io/datatypes/datatype-matrix)。

### PostgresからClickHouseにデータを複製する際に独自のデータ型マッピングを定義できますか？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現在、パイプの一部としてカスタムデータ型マッピングを定義することはサポートしていません。ただし、ClickPipesで使用されるデフォルトのデータ型マッピングは非常にネイティブです。Postgresのほとんどのカラムタイプは、ClickHouseのネイティブな同等物にできるだけ近く複製されます。たとえば、Postgresの整数配列タイプはClickHouseの整数配列タイプとして複製されます。

### JSONおよびJSONBカラムはPostgresからどのように複製されますか？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSONおよびJSONBカラムは、ClickHouseではString型として複製されます。ClickHouseはネイティブな[JSON型](/sql-reference/data-types/newjson)をサポートしているため、必要に応じてClickPipesテーブルの上にマテリアライズドビューを作成して変換を行うことができます。また、Stringカラムに対して[JSON関数](/sql-reference/functions/json-functions)を直接使用することもできます。JSONおよびJSONBカラムを直接ClickHouseのJSON型に複製する機能に取り組んでいます。この機能は数ヶ月内に利用可能になる予定です。

### ミラーが一時停止しているとき、挿入はどうなりますか？ {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソースPostgresのレプリケーションスロットにキューイングされ、バッファリングされて失われることはありません。ただし、ミラーを一時停止して再開すると接続が再確立され、ソースに応じてしばらく時間がかかることがあります。

このプロセス中、同期（PostgresからデータをプルしてClickHouseの生テーブルにストリーミングする操作）と正規化（生テーブルからターゲットテーブルへの操作）が中止されます。ただし、耐久性を持って再開するために必要な状態を保持します。

- 同期については、中途半端にキャンセルされた場合、Postgresのconfirmed_flush_lsnは進んでいないため、次回の同期は中止されたものと同じ位置から開始され、データの一貫性が確保されます。
- 正規化については、ReplacingMergeTreeの挿入順序が重複除去を処理します。

要するに、同期および正規化プロセスは一時停止中に終了しますが、データの損失や不一致なしに再開できるため、安全です。

### ClickPipeの作成は自動化できるか、APIまたはCLIを使用できますか？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipeは、[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)エンドポイントを介して作成および管理することもできます。この機能はベータ版であり、APIリファレンスは[こちら](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)にあります。Postgres ClickPipesを作成するためのTerraformサポートにも積極的に取り組んでいます。

### 初期ロードを高速化するにはどうすればよいですか？ {#how-do-i-speed-up-my-initial-load}

すでに実行中の初期ロードを加速することはできません。ただし、特定の設定を調整することで、今後の初期ロードを最適化できます。デフォルトでは、設定は4つの並列スレッドと、パーティションごとのスナップショット行数が100,000に設定されています。これらは高度な設定であり、ほとんどのユースケースには十分です。

Postgresバージョン13以下では、CTID範囲スキャンが遅く、これらの設定がより重要になります。その場合、パフォーマンスを向上させるために次のプロセスを検討してください：

1. **既存のパイプを削除する**：新しい設定を適用するために必要です。
2. **ClickHouseの宛先テーブルを削除する**：以前のパイプによって作成されたテーブルが削除されていることを確認します。
3. **最適化された設定で新しいパイプを作成する**：一般的には、パーティションごとのスナップショット行数を100万から1000万の範囲に増やします。これは特定の要件とPostgresインスタンスが処理できる負荷に応じて行います。

これらの調整により、特に古いPostgresバージョンの初期ロードのパフォーマンスが大幅に向上します。Postgres 14以降を使用している場合、これらの設定の影響は少なくなります。

### レプリケーションを設定する際に公開物の範囲をどのように設定すべきですか？ {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipesに公開物を管理させることができます（追加の権限が必要）し、自分で作成することもできます。ClickPipesが管理する公開物では、パイプを編集する際にテーブルの追加や削除を自動的に処理します。自己管理する場合は、レプリケーションが必要なテーブルのみを含むように公開物の範囲を注意深く設定してください。不要なテーブルを含めると、PostgresのWALデコードが遅くなります。

公開物にテーブルを含める場合は、そのテーブルに主キーまたは`REPLICA IDENTITY FULL`があることを確認してください。主キーのないテーブルを持っている場合、すべてのテーブルの公開物を作成すると、それらのテーブルに対するDELETEおよびUPDATE操作が失敗します。

データベース内の主キーのないテーブルを特定するには、このクエリを使用できます：
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

主キーのないテーブルを扱う際の選択肢は2つあります：

1. **ClickPipesから主キーのないテーブルを除外する**：
   主キーを持つテーブルだけで公開物を作成します：
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **ClickPipesに主キーのないテーブルを含める**：
   主キーのないテーブルを含めたい場合は、そのレプリカアイデンティティを`FULL`に変更する必要があります。これにより、UPDATEおよびDELETE操作が正しく機能します：
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
ClickPipesが管理するのではなく手動で公開物を作成する場合、`FOR ALL TABLES`という公開物の作成はお勧めしません。これにより、ClickPipesに対するPostgresからのトラフィックが増加し（パイプに含まれていない他のテーブルの変更を送信）全体的な効率が低下します。

手動で作成した公開物の場合は、パイプに追加する前に公開物にテーブルを追加してください。
::: 

## 推奨される`max_slot_wal_keep_size`設定 {#recommended-max_slot_wal_keep_size-settings}

- **最低限**：[`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)を設定して、少なくとも**2日分の**WALデータを保持します。
- **大規模データベース（高トランザクション量）**：1日あたりのピークWAL生成の少なくとも**2～3倍**を保持します。
- **ストレージが制約されている環境**：ディスクの枯渇を避けつつ、レプリケーションの安定性を確保するために、慎重に調整します。

### 正しい値の計算方法 {#how-to-calculate-the-right-value}

適切な設定を決定するために、WAL生成レートを測定します。

#### PostgreSQL 10以上の場合: {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### PostgreSQL 9.6以下の場合: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 上記のクエリを1日の異なる時間に実行し、特にトランザクションが多い時間帯に実行します。
* 24時間あたりに生成されるWALの量を計算します。
* その数値を2または3倍して十分な保持を確保します。
* `max_slot_wal_keep_size`をMBまたはGBで設定します。

#### 例: {#example}

データベースが1日の間に100GBのWALを生成する場合、設定します：

```sql
max_slot_wal_keep_size = 200GB
```

### レプリケーションスロットが無効化されています。どうすればよいですか？ {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipeを回復する唯一の方法は、設定ページでリスイートをトリガーすることです。

レプリケーションスロットの無効化の最も一般的な原因は、PostgreSQLデータベースの`max_slot_wal_keep_size`設定が低すぎることです（例：数GB）。この値を増やすことをお勧めします。[こちらのセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)で`max_slot_wal_keep_size`の調整を参照してください。理想的には、200GB以上に設定して、レプリケーションスロットの無効化を防ぎます。

まれに、`max_slot_wal_keep_size`が設定されていない場合でもこの問題が発生することがあります。これはPostgreSQLの複雑でまれなバグによるものかもしれませんが、原因は不明のままです。

## ClickHouseがデータを取り込んでいる間にOut Of Memory（OOM）が発生しています。助けてくれますか？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouseでのOOMの一般的な理由の1つは、サービスがサイズ不足であることです。これは、現在のサービス設定には、取り込み負荷を効果的に処理するための十分なリソース（例：メモリやCPU）がないことを意味します。ClickPipeデータ取り込みの要求に応じて、サービスのスケールアップを強くお勧めします。

また、下流のマテリアライズドビューに最適化されていない結合が存在することも観察されています：

- JOINの一般的な最適化手法として、右側のテーブルが非常に大きい場合の`LEFT JOIN`があります。この場合、クエリを`RIGHT JOIN`に書き換え、大きなテーブルを左側に移動します。これにより、クエリプランナーがよりメモリ効率的に処理できます。

- JOINの別の最適化手法は、テーブルを`サブクエリ`または`CTE`を介して明示的にフィルタリングし、その後これらのサブクエリ間でJOINを行うことです。これにより、プランナーは行を効率的にフィルタリングおよびJOINを実行するためのヒントを得ることができます。

## 初期ロード中に`invalid snapshot identifier`が表示されます。どうすればよいですか？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier`エラーは、ClickPipesとPostgresデータベース間の接続が断たれた場合に発生します。これは、ゲートウェイタイムアウト、データベースの再起動、またはその他の一時的な問題で発生する可能性があります。

初期ロードが進行中の間、Postgresデータベースでのアップグレードや再起動などの中断する操作を行わず、データベースへのネットワーク接続が安定していることを確認することをお勧めします。 

この問題を解決するには、ClickPipes UIからリスイートをトリガーできます。これにより、初期ロードプロセスが最初から再開されます。

## Postgresで公開物を削除した場合はどうなりますか？ {#what-happens-if-i-drop-a-publication-in-postgres}

Postgresで公開物を削除すると、ClickPipeの接続が切断されます。公開物はClickPipeがソースから変更を取り込むために必要です。この場合、通常は公開物がもはや存在しないことを示すエラーアラートが表示されます。

公開物を削除した後にClickPipeを回復するには：

1. Postgresで同じ名前と必要なテーブルを持つ新しい公開物を作成します。
2. ClickPipeの設定タブで「テーブルをリスイート」ボタンをクリックします。

このリスイートは、再作成された公開物がPostgres内で異なるオブジェクト識別子（OID）を持つために必要です。同じ名前を持っていても、このプロセスは宛先テーブルを更新し、接続を復元します。

別の新しいパイプを作成することも可能です。

パーティション化されたテーブルを扱う場合は、適切な設定で公開物を作成していることを確認してください：

```sql
CREATE PUBLICATION clickpipes_publication 
FOR TABLE <...>, <...>  
WITH (publish_via_partition_root = true);
```

## `Unexpected Datatype`エラーや`Cannot parse type XX ...`が表示される場合は？ {#what-if-i-am-seeing-unexpected-datatype-errors}

このエラーは通常、ソースのPostgresデータベースに取り込み中にマッピングできないデータ型が存在する場合に発生します。より具体的な問題については、以下の可能性を参照してください。

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgresの`NUMERIC`は非常に高い精度（小数点前131072桁、後16383桁まで）を持っており、ClickHouseのDecimal型は最大で（76桁、39スケール）です。システムは通常、そのサイズがそこまで大きくならないと仮定し、CDCフェーズ中に多くの行が来る可能性があるため、楽観的なキャストを行います。

現在の回避策は、ClickHouseでNUMERIC型を文字列にマッピングすることです。これを有効にするには、サポートチームにチケットを提出してください。これにより、あなたのClickPipesで有効化されます。
