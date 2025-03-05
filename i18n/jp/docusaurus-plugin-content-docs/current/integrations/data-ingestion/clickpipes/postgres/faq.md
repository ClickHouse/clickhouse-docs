---
sidebar_label: ClickPipes for Postgres FAQ
description: ClickPipes for Postgresに関するよくある質問。
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
---


# ClickPipes for Postgres FAQ

### Idle時はPostgres CDC ClickPipeにどのように影響しますか？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

ClickHouse Cloudサービスがアイドル状態の時、Postgres CDC ClickPipeはデータの同期を続けます。サービスは次の同期間隔で起動し、受信データを処理します。同期が完了しアイドル期間に達すると、サービスは再びアイドル状態に戻ります。

例えば、同期間隔が30分に設定され、サービスのアイドルタイムが10分に設定されている場合、サービスは30分ごとに起動し、10分間アクティブになり、その後アイドル状態に戻ります。

### ClickPipes for PostgresではTOASTカラムはどのように処理されますか？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

詳細については、[TOASTカラムの処理](./toast)ページを参照してください。

### ClickPipes for Postgresでは生成カラムはどのように処理されますか？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

詳細については、[Postgres 生成カラム: 注意点とベストプラクティス](./generated_columns)ページを参照してください。

### テーブルはPostgres CDCの一部になるために主キーを持つ必要がありますか？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

はい、CDCのためには、テーブルは主キーまたは[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)を持っている必要があります。REPLICA IDENTITYはFULLに設定するか、ユニークインデックスを使用するように構成できます。

### Postgres CDCの一部としてパーティションテーブルはサポートされていますか？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、パーティションテーブルは、主キーまたはREPLICA IDENTITYが定義されている限り、箱から出してすぐにサポートされています。主キーとREPLICA IDENTITYは、親テーブルとそのパーティションの両方に存在する必要があります。詳細については、[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)をご覧ください。

### 公開IPを持たないまたはプライベートネットワークにあるPostgresデータベースに接続できますか？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！ ClickPipes for Postgresは、プライベートネットワークにあるデータベースに接続するための2つの方法を提供します。

1. **SSHトンネリング**
   - ほとんどのユースケースにうまく機能します
   - 設定手順は[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)をご覧ください
   - すべてのリージョンで機能します

2. **AWS PrivateLink**
   - 3つのAWSリージョンで利用可能：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 詳細な設定手順については、[PrivateLinkドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes#requirements)をご覧ください
   - PrivateLinkが利用できないリージョンでは、SSHトンネリングを使用してください

### UPDATEおよびDELETEはどのように処理されますか？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgresでは、PostgresからのINSERTおよびUPDATEを、ClickHouse内で異なるバージョンの新しい行としてキャプチャします（`_peerdb_` バージョンカラムを使用）。ReplacingMergeTreeテーブルエンジンは、バックグラウンドで部分的に非重複化を行い（ORDER BYカラムに基づいて）、最新の`_peerdb_`バージョンを持つ行のみを保持します。

PostgresからのDELETEは、新しい行として削除済み（`_peerdb_is_deleted`カラムを使用）として伝播します。非重複化プロセスは非同期であるため、一時的に重複が表示されることがあります。これを解決するには、クエリ層で非重複化を処理する必要があります。

詳細については、次を参照してください：

* [ReplacingMergeTreeテーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [PostgresからClickHouse CDCの内部ブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### スキーマの変更はサポートされていますか？ {#do-you-support-schema-changes}

詳細については、[ClickPipes for Postgres: スキーマ変更の伝播サポート](./schema-changes)ページを参照してください。

### ClickPipes for Postgres CDCのコストは何ですか？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

プレビュー期間中、ClickPipesは無料です。GA以降の価格は未定ですが、外部ETLツールと比較して合理的で競争力のある価格設定を目指しています。

### 複製スロットのサイズが増加または減少していないのはなぜですか？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgresの複製スロットのサイズが増加し続けている、または元に戻らない場合、通常は**WAL（Write-Ahead Log）レコードがCDCパイプラインまたは複製プロセスによって十分に消費（または「再生」）されていない**ことを意味します。以下は最も一般的な原因とその対処法です。

1. **データベースアクティビティの突然のスパイク**  
   - 大規模なバッチ更新、大量挿入、または重要なスキーマ変更は、すぐに大量のWALデータを生成する可能性があります。  
   - 複製スロットは、これらのWALレコードが消費されるまで保持され、サイズが一時的にスパイクします。

2. **長時間実行しているトランザクション**  
   - 開いているトランザクションは、トランザクションが開始されて以来生成されたすべてのWALセグメントをPostgresに保持させ、スロットサイズを大幅に増加させます。  
   - トランザクションが無限にオープンにならないように、`statement_timeout`と`idle_in_transaction_session_timeout`を適切な値に設定してください：
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

3. **保守またはユーティリティ操作（例：`pg_repack`）**  
   - `pg_repack`のようなツールは、短期間で大量のWALデータを生成する全テーブルを書き換えることができます。  
   - これらの操作は、より少ないトラフィックの時間帯にスケジュールするか、実行中のWAL使用量を注意深く監視してください。

4. **VACUUMおよびVACUUM ANALYZE**  
   - データベースの健康に必要ですが、これらの操作は特に大規模なテーブルをスキャンする場合、追加のWALトラフィックを生成することがあります。  
   - autovacuum調整パラメータを使用することを検討するか、オフピーク時に手動でVACUUM操作をスケジュールしてください。

5. **複製消費者がスロットをアクティブに読み取っていない**  
   - CDCパイプライン（例：ClickPipes）または他の複製消費者が停止、ポーズ、またはクラッシュすると、WALデータがスロットに蓄積されます。  
   - パイプラインが継続して実行されていることを確認し、接続性や認証エラーのログを確認してください。

このトピックについての詳細な分析については、私たちのブログ記事をチェックしてください：[Postgres Logical Decodingの落とし穴を克服する](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgresのデータ型はClickHouseにどのようにマッピングされますか？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgresは、Postgresのデータ型をできるだけネイティブにClickHouseでマッピングすることを目指しています。このドキュメントは、各データ型とそのマッピングの包括的なリストを提供します：[データ型マトリックス](https://docs.peerdb.io/datatypes/datatype-matrix)。

### PostgresからClickHouseへのデータ複製中にカスタムデータ型マッピングを定義できますか？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現在、パイプの一部としてカスタムデータ型マッピングを定義することはサポートされていません。ただし、ClickPipesで使用されるデフォルトのデータ型マッピングは非常にネイティブであることに注意してください。Postgresのほとんどのカラムタイプは、ClickHouseのネイティブ等価物にできるだけ近く複製されます。たとえば、Postgresの整数配列タイプはClickHouseの整数配列タイプとして複製されます。

### JSONおよびJSONBカラムはPostgresからどのように複製されますか？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSONおよびJSONBカラムはClickHouseでString型として複製されます。ClickHouseはネイティブの[JSON型](/sql-reference/data-types/newjson)をサポートしているため、必要に応じてClickPipesテーブルに対するマテリアライズドビューを作成して変換を行うことができます。別の方法としては、Stringカラムに対して直接[JSON関数](/sql-reference/functions/json-functions)を使用できます。JSONおよびJSONBカラムをClickHouseのJSON型に直接複製する機能に取り組んでいます。この機能は数カ月以内に利用可能になる予定です。

### ミラーが一時停止すると挿入はどうなりますか？ {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソースPostgresの複製スロット内にキューイングされ、バッファされて失われないようにします。ただし、ミラーを一時停止して再開すると、接続が再確立されるため、ソースによっては時間がかかることがあります。

このプロセス中、同期（Postgresからデータを取得してClickHouseの生テーブルにストリーミングする）およびノーマライズ（生テーブルからターゲットテーブルへの操作）は中止されます。ただし、耐久性をもって再開するために必要な状態は保持されます。

- 同期については、途中でキャンセルされた場合、Postgresのconfirmed_flush_lsnは進まないため、次の同期は中止されたものと同じ位置から開始され、データ整合性が保たれます。
- ノーマライズについては、ReplacingMergeTreeの挿入順序が非重複化を処理します。

要約すると、同期とノーマライズプロセスは一時停止中に終了しますが、データ損失や不整合なしに再開可能であるため、安全に行えます。

### ClickPipeの作成を自動化したり、APIまたはCLIを介して行ったりできますか？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

現在、ClickPipeはUIを介してのみ作成できます。ただし、OpenAPIおよびTerraformのエンドポイントを公開する作業を進めています。この機能は近い将来（1か月以内）にリリースされる予定です。この機能のデザインパートナーになりたい場合は、db-integrations-support@clickhouse.comまでご連絡ください。

### 初期ロードを速くするにはどうすればいいですか？ {#how-do-i-speed-up-my-initial-load}

すでに実行中の初期ロードを速くすることはできません。ただし、特定の設定を調整することで将来の初期ロードを最適化できます。デフォルトでは、設定は4つの並列スレッドと、パーティションあたりのスナップショット行数100,000に構成されています。これらは高度な設定であり、通常はほとんどのユースケースに対して十分です。

Postgresバージョン13以下では、CTID範囲スキャンが遅くなり、これらの設定がより重要になります。そのような場合、パフォーマンスを向上させるために以下のプロセスを考慮してください。

1. **既存のパイプを削除**：新しい設定を適用するために必要です。
2. **ClickHouseの宛先テーブルを削除**：前のパイプによって作成されたテーブルが削除されていることを確認してください。
3. **最適化された設定で新しいパイプを作成**：通常は、スナップショットの行数を各パーティションあたり1百万から1千万の間に増やします。具体的な要求とPostgresインスタンスの負荷に応じて調整してください。

これらの調整は、特に古いPostgresバージョンの初期ロードのパフォーマンスを大幅に向上させるべきです。Postgres 14以降を使用している場合、CTID範囲スキャンのサポートが改善されたため、これらの設定はそれほど影響しません。

### 複製を設定する際に公開範囲はどのようにすべきですか？ {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipesに公開範囲を管理させることができます（書き込みアクセスが必要）し、自分で作成することもできます。ClickPipesが管理する公開範囲では、パイプを編集すると自動的にテーブルの追加と削除を処理します。セルフマネジメントを行う場合は、複製が必要なテーブルのみを含めるように公開範囲を注意深く設定してください。不要なテーブルを含めると、Postgres WALのデコーディングが遅くなります。

公開範囲に任意のテーブルを含める場合、そのテーブルには主キーまたは`REPLICA IDENTITY FULL`を持っていることが必要です。主キーを持たないテーブルがある場合、すべてのテーブルの公開範囲を作成すると、そのテーブルではDELETEおよびUPDATE操作が失敗します。

データベース内の主キーがないテーブルを特定するには、次のクエリを使用できます：
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

主キーがないテーブルに対処する際には、2つのオプションがあります：

1. **ClickPipesから主キーがないテーブルを除外**：
   主キーを持つテーブルのみで公開範囲を作成します：
   ```sql
   CREATE PUBLICATION my_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **ClickPipesに主キーがないテーブルを含める**：
   主キーを持たないテーブルを含めたい場合は、そのレプリカアイデンティティを`FULL`に変更する必要があります。これにより、UPDATEおよびDELETE操作が正しく動作します：
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

## 推奨される `max_slot_wal_keep_size` 設定 {#recommended-max_slot_wal_keep_size-settings}

- **最低限**：[`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)を設定して、少なくとも**2日分**のWALデータを保持します。
- **大規模データベース（高トランザクションボリューム向け）**：ピークWAL生成量の少なくとも**2〜3倍**を保持します。
- **ストレージに制約のある環境**：複製の安定性を確保しつつ、**ディスク枯渇を避ける**ように保守的に調整します。

### 適切な値の計算方法 {#how-to-calculate-the-right-value}

適切な設定を決定するには、WAL生成率を測定します：

#### PostgreSQL 10以降の場合: {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### PostgreSQL 9.6およびそれ以前: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 上記のクエリを、特に高いトランザクション期間の異なる時間に実行します。
* 24時間あたりに生成されるWALの量を計算します。
* この数字に2または3を掛けて、十分な保持を提供します。
* `max_slot_wal_keep_size`をMBまたはGBでその値に設定します。

#### 例: {#example}

データベースが1日あたり100GBのWALを生成する場合、次のように設定します：

```sql
max_slot_wal_keep_size = 200GB
```

### 私の複製スロットが無効化されました。どうすればよいですか？ {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipeを回復する唯一の方法は、設定ページでリシンクをトリガーすることです。

複製スロット無効化の最も一般的な原因は、PostgreSQLデータベースでの`max_slot_wal_keep_size`設定が低いこと（例えば数GB）です。この値を増加させることをお勧めします。[このセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)で`max_slot_wal_keep_size`を調整する方法を参照してください。理想的には、これは複製スロットの無効化を防ぐために少なくとも200GBに設定する必要があります。

まれに、`max_slot_wal_keep_size`が設定されていなくてもこの問題が発生する場合があります。これはPostgreSQLの複雑でまれなバグが原因かもしれませんが、その原因は不明です。

### ClickHouseでデータを取り込んでいる間にOut Of Memory (OOMs)が表示されます。手伝ってもらえますか？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouseでのOOMの一般的な理由の一つは、サービスが小さすぎることです。これは、現在のサービス構成が取り込み負荷を効果的に処理するのに十分なリソース（メモリやCPUなど）を持っていないことを意味します。ClickPipeのデータ取り込みの要求に応えるために、サービスをスケールアップすることを強くお勧めします。

もう一つの理由として、非最適化されたジョインを持つ下流のマテリアライズドビューの存在があります：

- ジョインの一般的な最適化手法は、右側のテーブルが非常に大きい場合に`LEFT JOIN`を使用することです。この場合、クエリを書き換えて`RIGHT JOIN`を使用し、大きなテーブルを左側に移すことで、クエリプランナーがよりメモリ効率よくなるようにします。

- ジョインのもう一つの最適化は、`サブクエリ`または`CTE`を通じてテーブルを明示的にフィルタし、その後これらのサブクエリ間で`JOIN`を行うことです。これにより、プランナーに対して行を効率的にフィルタし、`JOIN`を実行する方法にヒントを与えることができます。

### 初期ロード中に`invalid snapshot identifier`が表示されています。どうしたらいいですか？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier`エラーは、ClickPipesとPostgresデータベース間の接続が切断された場合に発生します。これは、ゲートウェイのタイムアウト、データベースの再起動、または他の短期的な問題に起因する可能性があります。

初期ロードが進行中の際に、Postgresデータベースでのアップグレードや再起動などの破壊的な操作を行わず、データベースへのネットワーク接続が安定していることを確認することをお勧めします。

この問題を解決するには、ClickPipes UIからリシンクをトリガーできます。これにより、初期ロードプロセスが最初から再スタートします。
