---
sidebar_label: ClickPipes for Postgres FAQ
description: ClickPipes for Postgresに関するよくある質問。
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
---

# ClickPipes for Postgres FAQ

### アイドリングは私のPostgres CDC ClickPipeにどのように影響しますか？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

あなたのClickHouse Cloudサービスがアイドル状態の場合、あなたのPostgres CDC ClickPipeはデータの同期を続けます。サービスは次の同期間隔に従って目覚め、受信したデータを処理します。同期が完了しアイドル期間に達すると、サービスは再びアイドル状態に戻ります。

例として、同期間隔が30分に設定され、サービスのアイドル時間が10分に設定されている場合、サービスは30分ごとに目覚め、10分間アクティブになった後、再びアイドル状態になります。

### ClickPipes for PostgresではTOASTカラムはどのように扱われますか？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

詳細情報については、[TOASTカラムの処理](./toast)ページを参照してください。

### ClickPipes for Postgresでは生成カラムはどのように扱われますか？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

詳細情報については、[Postgres 生成カラム: 注意点とベストプラクティス](./generated_columns)ページを参照してください。

### テーブルはPostgres CDCの一部になるために主キーが必要ですか？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

はい、CDCの場合、テーブルは主キーまたは[レプリカID](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)を持っている必要があります。レプリカIDはFULLに設定することも、ユニークインデックスを使用するように構成することもできます。

### Postgres CDCの一部としてパーティションテーブルをサポートしていますか？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、パーティションテーブルは、主キーまたはレプリカIDが定義されている限り、標準でサポートされています。主キーとレプリカIDは、親テーブルとそのパーティションの両方に存在する必要があります。詳細については[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)をお読みください。

### 公開IPを持たないデータベースやプライベートネットワーク内のPostgresデータベースに接続できますか？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！ ClickPipes for Postgresでは、プライベートネットワーク内のデータベースに接続するために2つの方法を提供しています。

1. **SSHトンネリング**
   - ほとんどのユースケースでうまく機能します
   - セットアップ手順については、[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)を参照してください
   - すべてのリージョンで機能します

2. **AWS PrivateLink**
   - 3つのAWSリージョンで利用可能です：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 詳細なセットアップ手順については、[PrivateLinkドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes#requirements)を参照してください
   - PrivateLinkが利用できないリージョンでは、SSHトンネリングを使用してください

### UPDATEやDELETEはどのように処理しますか？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgresは、PostgresからのINSERTとUPDATEの両方を新しい行としてキャプチャし、異なるバージョン（`_peerdb_`バージョンカラムを使用）をClickHouseに格納します。ReplacingMergeTreeテーブルエンジンは、定期的に整合性を保つためのデデュプリケーションを行い、最新の`_peerdb_`バージョンの行のみを保持します。

PostgresからのDELETEも新しい行として、削除済み（`_peerdb_is_deleted`カラムを使用）として伝播されます。デデュプリケーションプロセスは非同期であるため、一時的に重複が見えることがあります。これを解決するには、クエリレイヤーでデデュプリケーションを処理する必要があります。

詳細については、以下を参照してください：

* [ReplacingMergeTreeテーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [PostgresからClickHouseへのCDC内部ブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### スキーマの変更をサポートしていますか？ {#do-you-support-schema-changes}

詳細情報については、[ClickPipes for Postgres: スキーマ変更の伝播サポート](./schema-changes)ページを参照してください。

### ClickPipes for Postgres CDCのコストはどのようになりますか？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

プレビュー期間中はClickPipesは無料です。GA後の価格は未定です。目標は、外部ETLツールと比較して合理的で競争力のある価格設定を行うことです。

### レプリケーションスロットのサイズが成長しているか、減少していない場合、問題は何ですか？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgresのレプリケーションスロットのサイズが増加し続けているか、減少していない場合、通常は**WAL（Write-Ahead Log）レコードがCDCパイプラインやレプリケーションプロセスによって十分に早く消費（または"再生"）されていない**ことを意味します。以下は、最も一般的な原因とそれに対処する方法です。

1. **データベースアクティビティの急増**  
   - 大規模バッチ更新、バルクインサート、または重要なスキーマ変更は、迅速に大量のWALデータを生成する可能性があります。  
   - レプリケーションスロットは、消費されるまでこれらのWALレコードを保持し、サイズが一時的に急増します。

2. **長時間実行されるトランザクション**  
   - 開いているトランザクションは、トランザクション開始以降に生成されたすべてのWALセグメントをPostgresに保持させるため、スロットサイズが劇的に増加します。  
   - `statement_timeout`と`idle_in_transaction_session_timeout`を適切な値に設定して、トランザクションが無期限に開いたままにならないようにしてください：
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

3. **メンテナンスまたはユーティリティ操作（例：`pg_repack`）**  
   - `pg_repack`のようなツールは、テーブル全体を書き換えることができ、短時間で大量のWALデータを生成します。  
   - これらの操作をトラフィックの少ない時間帯にスケジュールするか、実行中のWAL使用状況を注意深く監視してください。

4. **VACUUMおよびVACUUM ANALYZE**  
   - データベースの健康には必要ですが、これらの操作は特に大きなテーブルをスキャンする場合、追加のWALトラフィックを生成する可能性があります。  
   - autovacuum tuningパラメータを使用するか、オフピーク時間中に手動でVACUUM操作をスケジュールしてください。

5. **レプリケーションコンシューマーがスロットを積極的に読み取っていない**  
   - CDCパイプライン（例：ClickPipes）や他のレプリケーションコンシューマーが停止、停止、またはクラッシュした場合、WALデータがスロットに蓄積されます。  
   - パイプラインが継続的に実行されていることを確認し、接続性や認証エラーのログを確認してください。

このトピックについての詳細な深堀りは、私たちのブログ投稿をチェックしてください： [Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgresのデータ型はClickHouseにどのようにマッピングされますか？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgresは、Postgresデータ型を可能な限りネイティブにClickHouse側でマッピングすることを目指しています。この文書では、各データ型とそのマッピングの包括的なリストを提供します：[データ型マトリックス](https://docs.peerdb.io/datatypes/datatype-matrix)。

### PostgresからClickHouseにデータを複製する際に独自のデータ型マッピングを定義できますか？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現在のところ、パイプの一部としてカスタムデータ型マッピングを定義することはサポートしていません。ただし、ClickPipesが使用するデフォルトのデータ型マッピングは非常にネイティブです。Postgresのほとんどのカラム型は、ClickHouseのネイティブな同等物にできるだけ近く複製されます。たとえば、Postgresの整数配列型はClickHouseの整数配列型として複製されます。

### JSONおよびJSONBカラムはPostgresからどのように複製されますか？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSONおよびJSONBカラムは、ClickHouseでString型として複製されます。ClickHouseはネイティブの[JSON型](/sql-reference/data-types/newjson)をサポートしているため、必要に応じてClickPipesテーブルに対してマテリアライズドビューを作成して変換を実行できます。あるいは、Stringカラムに対して直接[JSON関数](/sql-reference/functions/json-functions)を使用することもできます。私たちは現在、JSONおよびJSONBカラムを直接ClickHouseのJSON型に複製する機能に取り組んでおり、この機能は数ヶ月以内に利用可能になる予定です。

### ミラーを一時停止すると、挿入はどうなりますか？ {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソースPostgresのレプリケーションスロットにキューイングされ、バッファリングされて失われないようにします。ただし、ミラーを一時停止して再開すると、接続が再確立されるため、ソースによっては時間がかかる場合があります。

このプロセス中に、データをPostgresから引き出してClickHouseの生テーブルにストリーミングする同期（pulling）および、（生テーブルからターゲットテーブルへの）正規化操作は中止されます。ただし、それらは耐久性を持って再開するために必要な状態を保持します。

- 同期については、途中でキャンセルされた場合、Postgresのconfirmed_flush_lsnは進まないため、次の同期は中止されたものと同じ位置から開始され、データの整合性が保証されます。
- 正規化については、ReplacingMergeTreeの挿入順序がデデュプリケーションを処理します。

まとめると、同期と正規化プロセスは一時停止中に終了しますが、データの損失や不整合なしに再開できるため、安全です。

### ClickPipeの作成は自動化できますか、またはAPIやCLIを介して行うことができますか？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

現時点では、ClickPipeをUIを介してのみ作成できます。ただし、私たちは現在、OpenAPIおよびTerraformエンドポイントを公開するために取り組んでいます。これは近い将来（1ヶ月以内）にリリースされる予定です。この機能のデザインパートナーになりたい場合は、db-integrations-support@clickhouse.comまでご連絡ください。

### 初期ロードを速くするにはどうすればよいですか？ {#how-do-i-speed-up-my-initial-load}

すでに実行中の初期ロードを速くすることはできません。ただし、特定の設定を調整することで今後の初期ロードを最適化できます。デフォルトでは、設定は4つの並列スレッドと、パーティション当たりのスナップショット行数が100,000に設定されています。これらは高度な設定であり、ほとんどのユースケースに対して十分です。

Postgresのバージョンが13以下の場合、CTIDレンジスキャンは遅くなるため、これらの設定はより重要になります。その場合、パフォーマンスを改善するためのプロセスは次のとおりです。

1. **既存のパイプを削除**: 新しい設定を適用するために必要です。
2. **ClickHouse上の宛先テーブルを削除**: 前のパイプによって作成されたテーブルを削除してください。
3. **最適化された設定で新しいパイプを作成**: 一般的には、パーティション当たりのスナップショット行数を100万〜1000万の範囲に増やしますが、具体的な要件とPostgresインスタンスが処理できる負荷によります。

これらの調整により、特に古いPostgresバージョンの初期ロードのパフォーマンスが大幅に向上するはずです。Postgres 14以降を使用している場合、これらの設定はCTIDレンジスキャンの改善により影響が少なくなります。

### レプリケーションを設定する際に、出版物のスコープはどのように設定すればよいですか？ {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipesに出版物を管理させることができます（書き込みアクセスが必要）し、自分で作成することもできます。ClickPipe管理の出版物を使用すると、パイプを編集する際にテーブルの追加と削除を自動的に処理します。自己管理の場合は、必要なテーブルのみを含むように出版物のスコープを慎重に設定してください。不要なテーブルを含めると、Postgres WALのデコーディングが遅くなります。重要な点は、複製しない場合は主キーのないテーブルを除外することです。これにより、レプリケーションの遅延を避けることができます。


## 推奨される `max_slot_wal_keep_size` 設定 {#recommended-max_slot_wal_keep_size-settings}

- **最低限:** [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)を設定して、少なくとも**2日分の**WALデータを保持します。
- **大規模データベース（高トランザクション量）の場合:** 1日あたりのピークWAL生成の**2-3倍**を保持します。
- **ストレージ制約のある環境では:** ディスク枯渇を避けながらレプリケーションの安定性を確保するために、保守的に調整してください。

### どのようにして適切な値を計算しますか？ {#how-to-calculate-the-right-value}

適切な設定を決定するためには、WAL生成率を測定します：

#### PostgreSQL 10以降の場合: {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### PostgreSQL 9.6以前の場合: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 日の異なる時間に上記のクエリを実行し、特にトランザクションが多い期間に実行します。
* 24時間あたりに生成されるWALの量を計算します。
* その数を2または3倍して十分な保持を提供します。
* `max_slot_wal_keep_size`を得られた値にMBまたはGBで設定します。

#### 例: {#example}

もしあなたのデータベースが1日で100GBのWALを生成している場合、次のように設定します：

```sql
max_slot_wal_keep_size = 200GB
```

### 私のレプリケーションスロットが無効化されました。どうすればよいですか？ {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipeを復旧する唯一の方法は、再同期をトリガーすることです。これは設定ページで行うことができます。

レプリケーションスロットの無効化の最も一般的な原因は、PostgreSQLデータベースの`max_slot_wal_keep_size`設定が低いことです（例：数ギガバイト）。この値を増やすことをお勧めします。[このセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)を参照して`max_slot_wal_keep_size`を調整してください。理想的には、レプリケーションスロットの無効化を防ぐために、200GB以上に設定する必要があります。

まれに、`max_slot_wal_keep_size`が設定されていない場合でもこの問題が発生することがあります。これはPostgreSQLの複雑でまれなバグが原因である可能性がありますが、原因は不明のままです。

### ClickHouseでデータを取り込んでいる際にOut Of Memory (OOMs)が発生しています。助けてもらえますか？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouseでのOOMの一般的な理由の1つは、サービスのサイズが小さいことです。これは、現在のサービス設定が取り込み負荷を効果的に処理するために十分なリソース（メモリやCPUなど）を持っていないことを意味します。ClickPipeデータ取り込みの需要を満たすために、サービスのスケールアップを強くお勧めします。

もう1つの理由は、下流のマテリアライズドビューに最適化されていない結合が存在することです：

- JOINの一般的な最適化技術として、右側のテーブルが非常に大きい場合の`LEFT JOIN`があります。この場合、クエリを`RIGHT JOIN`に書き換え、大きなテーブルを左側に移動します。これにより、クエリプランナーのメモリ効率が向上します。

- JOINの別の最適化方法は、`サブクエリ`や`CTE`を通じてテーブルを明示的にフィルタリングし、これらのサブクエリ間で`JOIN`を実行する方法です。これにより、プランナーが効率的に行をフィルタリングし、JOINを実行する方法についてのヒントを得ることができます。

### 初期ロード中に`invalid snapshot identifier`エラーが表示されます。どうすればよいですか？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier`エラーは、ClickPipesとPostgresデータベースの間で接続が切れたときに発生します。これは、ゲートウェイのタイムアウト、データベースの再起動、その他のトランジェントな問題が原因で発生する可能性があります。

初期ロードが進行中の間、Postgresデータベースでのアップグレードや再起動などの破壊的な操作を行わないようにし、データベースへのネットワーク接続が安定していることを確認することをお勧めします。

この問題を解決するには、ClickPipes UIから再同期をトリガーできます。これにより、初期ロードプロセスが最初から再起動します。
