---
sidebar_label: ClickPipes for Postgres FAQ
description: ClickPipes for Postgresに関するよくある質問。
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
---


# ClickPipes for Postgres FAQ

### アイドリングは私のPostgres CDC ClickPipeにどのように影響しますか？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

ClickHouse Cloudサービスがアイドリング中の場合でも、Postgres CDC ClickPipeはデータの同期を続けます。次の同期インターバルでサービスが起き上がり、受信データを処理します。同期が終了し、アイドリング期間に達すると、サービスはアイドリングに戻ります。

例として、同期インターバルが30分に設定されていて、サービスのアイドリング時間が10分に設定されている場合、サービスは30分ごとに起き上がり、10分間アクティブになります。その後、アイドリングに戻ります。

### PostgresのTOASTカラムはClickPipesでどのように扱われますか？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

詳細については、[TOASTカラムの扱い](./toast)ページをご覧ください。

### Postgresの生成カラムはClickPipesでどのように扱われますか？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

詳細については、[Postgres生成カラム: 注意点とベストプラクティス](./generated_columns)ページをご覧ください。

### テーブルはPostgres CDCの一部になるために主キーを持つ必要がありますか？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

はい、CDCのためには、テーブルは主キーまたは[REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)を持っている必要があります。REPLICA IDENTITYはFULLに設定するか、一意のインデックスを使用するように構成できます。

### Postgres CDCの一部としてパーティション化されたテーブルをサポートしていますか？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

はい、パーティション化されたテーブルは、主キーまたはREPLICA IDENTITYが定義されている限り、標準でサポートされています。主キーとREPLICA IDENTITYは親テーブルとそのパーティションの両方に存在する必要があります。詳細については[こちら](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)をご覧ください。

### 公開IPを持たない、またはプライベートネットワークにあるPostgresデータベースに接続できますか？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

はい！ ClickPipes for Postgresはプライベートネットワーク内のデータベースに接続する方法を2つ提供します：

1. **SSHトンネリング**
   - ほとんどのユースケースでうまく機能します
   - セットアップ手順は[こちら](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)をご覧ください
   - すべてのリージョンで機能します

2. **AWS PrivateLink**
   - 3つのAWSリージョンで利用可能：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 詳細なセットアップ手順は、[PrivateLinkのドキュメント](/knowledgebase/aws-privatelink-setup-for-clickpipes#requirements)をご覧ください
   - PrivateLinkが利用できないリージョンでは、SSHトンネリングを使用してください

### UPDATEおよびDELETEはどのように処理されますか？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgresは、PostgresからのINSERTとUPDATEを新しい行としてキャプチャします（異なるバージョンを使用、 `_peerdb_` バージョンカラムを使用）。ReplacingMergeTreeテーブルエンジンは、定期的にバックグラウンドで重複排除を行い（ORDER BYカラムに基づく）、最新の`_peerdb_` バージョンの行のみを保持します。

PostgresからのDELETEは、新しい行として削除されたマークが付けられます（`_peerdb_is_deleted` カラムを使用）。重複排除プロセスは非同期であるため、一時的に重複が表示されることがあります。この問題に対処するには、クエリレイヤーで重複排除を処理する必要があります。

詳細については、以下を参照してください：

* [ReplacingMergeTreeテーブルエンジンのベストプラクティス](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [PostgresからClickHouseへのCDC内部ブログ](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### スキーマの変更をサポートしていますか？ {#do-you-support-schema-changes}

詳細については、[ClickPipes for Postgres: スキーマ変更の伝播サポート](./schema-changes)ページをご覧ください。

### ClickPipes for Postgres CDCのコストはどのくらいですか？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

プレビュー期間中は、ClickPipesは無料です。GA後の価格は未定ですが、外部ETLツールと比較して合理的で競争力のある料金にすることを目指しています。

### 私のレプリケーションスロットサイズが成長している、または減少していないのは何が問題ですか？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgresのレプリケーションスロットのサイズが増加し続ける、または元に戻らない場合、通常は**WAL（Write-Ahead Log）レコードがCDCパイプラインまたはレプリケーションプロセスによって十分に早く消費（または「再生」）されていない**ことを意味します。以下は最も一般的な原因とそれに対処する方法です。

1. **データベース活動の突然のスパイク**  
   - 大規模なバッチ更新、大量挿入、または重要なスキーマ変更は、短期間で多くのWALデータを生成します。  
   - レプリケーションスロットは、これらのWALレコードが消費されるまで保持し、サイズの一時的なスパイクを引き起こします。

2. **長時間実行中のトランザクション**  
   - 開いているトランザクションは、トランザクション開始以降に生成されたすべてのWALセグメントをPostgresが保持させるため、スロットサイズが劇的に増加します。  
   - `statement_timeout` と `idle_in_transaction_session_timeout` を合理的な値に設定して、トランザクションが無期限にオープンし続けないようにします：
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
     このクエリを使用して、異常に長く実行されているトランザクションを特定します。

3. **メンテナンスまたはユーティリティ操作（例：`pg_repack`）**  
   - `pg_repack`などのツールは、テーブル全体を書き換え、短期間で大量のWALデータを生成できます。  
   - トラフィックが少ない時間帯にこれらの操作をスケジュールするか、実行中にWALの使用状況を注意深く監視してください。

4. **VACUUMおよびVACUUM ANALYZE**  
   - データベースの健康維持には必要ですが、特に大きなテーブルをスキャンする場合は余分なWALトラフィックを生成する可能性があります。  
   - 自動バキュームの調整パラメータを使用するか、オフピーク時間帯に手動でVACUUM操作をスケジュールすることを検討してください。

5. **レプリケーションコンシューマがスロットを積極的に読み取っていない**  
   - CDCパイプライン（例：ClickPipes）や他のレプリケーションコンシューマが停止、ポーズ、またはクラッシュする場合、WALデータがスロットに蓄積されます。  
   - パイプラインが継続して実行されていることを確認し、接続性や認証のエラーがないかログを確認してください。

このトピックに関する詳細な説明については、私たちのブログ投稿をチェックしてください：[Postgres Logical Decodingの落とし穴を克服する](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgresデータ型はClickHouseにどのようにマッピングされますか？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgresは、Postgresデータ型をClickHouse側でできるだけネイティブにマッピングすることを目指しています。このドキュメントでは、各データ型とそのマッピングの包括的なリストを提供しています： [データ型マトリクス](https://docs.peerdb.io/datatypes/datatype-matrix)。

### PostgresからClickHouseにデータをレプリケーションする際に、自分自身のデータ型マッピングを定義できますか？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

現在、パイプの一部としてカスタムデータ型マッピングを定義することはサポートしていません。ただし、ClickPipesで使用されるデフォルトのデータ型マッピングは非常にネイティブです。Postgresのほとんどのカラムタイプは、ClickHouseのネイティブの等価物にできるだけ近くにレプリケートされます。たとえば、Postgresの整数配列型はClickHouseで整数配列型としてレプリケートされます。

### JSONおよびJSONBカラムはPostgresからどのようにレプリケートされますか？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSONおよびJSONBカラムは、ClickHouseでString型としてレプリケートされます。ClickHouseはネイティブの[JSON型](/sql-reference/data-types/newjson)をサポートしているため、必要に応じてClickPipesテーブル上にマテリアライズドビューを作成して変換を行うことができます。あるいは、Stringカラムに対して[JSON関数](/sql-reference/functions/json-functions)を直接使用することも可能です。今後、JSONおよびJSONBカラムをClickHouseのJSON型に直接レプリケートする機能に取り組んでおり、この機能は数ヶ月以内に利用可能になる予定です。

### ミラーが一時停止しているとき、挿入はどうなりますか？ {#what-happens-to-inserts-when-a-mirror-is-paused}

ミラーを一時停止すると、メッセージはソースPostgresのレプリケーションスロットにキューイングされ、バッファリングされ、失われることはありません。ただし、ミラーを一時停止および再開すると接続が再確立されるため、ソースによっては時間がかかることがあります。

このプロセス中、同期（Postgresからデータを取得し、ClickHouseの生テーブルにストリーミングする）とノーマライズ（生テーブルからターゲットテーブルへの操作）は中断されますが、耐久的に再開するために必要な状態を保持します。

- 同期が途中でキャンセルされた場合、Postgresの`confirmed_flush_lsn`は進まないため、次の同期は、中止されたものと同じ位置から開始され、データの一貫性が保たれます。
- ノーマライズについては、ReplacingMergeTree挿入順序が重複排除を処理します。

まとめると、同期とノーマライズプロセスは一時停止中に終了しますが、データ損失や不整合なく再開できるため、安全に一時停止できます。

### ClickPipeの作成を自動化したり、APIやCLIを介して行えますか？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

現在のところ、ClickPipeはUIを介してのみ作成できます。ただし、OpenAPIおよびTerraformのエンドポイントを公開するために積極的に取り組んでいます。この機能は近い将来（1ヶ月程度）にリリースされる予定です。この機能のデザインパートナーになりたい場合は、db-integrations-support@clickhouse.comまでご連絡ください。

### 初期読み込みをどうやって速くすることができますか？ {#how-do-i-speed-up-my-initial-load}

すでに実行中の初期読み込みを速くすることはできません。しかし、将来の初期読み込みを最適化するために、特定の設定を調整することができます。デフォルトでは、設定は4つの並列スレッドと、パーティションごとのスナップショット数が100,000に設定されています。これらは高度な設定で、ほとんどのユースケースに対して一般的に十分です。

Postgresバージョン13以下では、CTID範囲スキャンが遅くなるため、これらの設定がより重要になります。そのような場合、パフォーマンスを向上させるために、以下のプロセスを考慮してください：

1. **既存のパイプを削除する**： 新しい設定を適用するために必要です。
2. **ClickHouseの宛先テーブルを削除する**： 前のパイプによって作成されたテーブルが削除されていることを確認してください。
3. **最適化された設定で新しいパイプを作成する**： 通常、パーティションごとのスナップショット数を100万から1000万の間に増やすことを検討します。これは、特定の要件やPostgresインスタンスで処理できる負荷に応じて調整してください。

これらの調整は、特に古いPostgresバージョンでの初期読み込みのパフォーマンスを大幅に向上させるはずです。Postgres 14以降を使用している場合、これらの設定はCTID範囲スキャンの改善により影響が少なくなります。

### レプリケーションを設定する際、私の出版物のスコープはどのように設定すべきですか？ {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipesに出版物を管理させることができます（書き込みアクセスが必要）し、または自分自身で作成することもできます。ClickPipeによって管理される出版物では、パイプを編集するとテーブルの追加と削除が自動的に処理されます。セルフ管理の場合、複製が必要なテーブルだけを含むように、注意深く出版物のスコープを設定してください。不要なテーブルを含めると、PostgresのWALデコーディングが遅くなります。Replicationするつもりがないテーブルは、主キーを持たない場合には含めないようにし、潜在的な複製の遅延を避けてください。

## 推奨 `max_slot_wal_keep_size` 設定 {#recommended-max_slot_wal_keep_size-settings}

- **最低限：** [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)を設定し、少なくとも**2日分**のWALデータを保持する。
- **大規模データベース（高トランザクションボリューム）:** 一日あたりのピークWAL生成の**2-3倍**を保持する。
- **ストレージ制約のある環境:** ディスク枯渇を避けつつ、レプリケーションの安定性を確保するために保守的に調整する。

### 正しい値を計算する方法 {#how-to-calculate-the-right-value}

適切な設定を決定するためには、WAL生成率を測定します：

#### PostgreSQL 10以上の場合: {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### PostgreSQL 9.6以下の場合: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 1日の異なる時間に上記のクエリを実行し、特にトランザクションが多い時間帯に行います。
* 24時間周期で生成されるWALの量を計算します。
* その数値に2または3を掛けて十分な保持期間を提供します。
* `max_slot_wal_keep_size`をMBまたはGBで結果の値に設定します。

#### 例: {#example}

もしあなたのデータベースが1日に100GBのWALを生成するなら、設定します：

```sql
max_slot_wal_keep_size = 200GB
```

### 私のレプリケーションスロットが無効になっています。どうすればよいですか？ {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipeを回復する唯一の方法は、設定ページでリシンクをトリガーすることです。

レプリケーションスロットの無効化の最も一般的な原因は、PostgreSQLデータベースの`max_slot_wal_keep_size`設定が低い（例えば、数GB）であることです。この値の増加をお勧めします。[`max_slot_wal_keep_size`の調整に関するこのセクション](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)を参照してください。理想的には、レプリケーションスロットの無効化を防ぐために、200GB以上に設定する必要があります。

稀に、`max_slot_wal_keep_size`が構成されていなくてもこの問題が発生することがあります。これはPostgreSQL内の複雑で稀なバグによる可能性がありますが、原因は不明のままです。

### ClickHouseでデータを取り込んでいる間にOut Of Memory (OOM)が発生しています。助けてもらえますか？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouseでのOOMの一般的な理由は、サービスが小さすぎることです。これは、現在のサービス構成が取り込み負荷を効果的に処理するためのリソース（メモリやCPU）が不足していることを意味します。ClickPipeのデータ取り込みの需要に応じて、サービスをスケールアップすることを強くお勧めします。

別の理由として、最適化されていない結合を持つ下流のマテリアライズドビューが見られることがあります。

- JOINに対する一般的な最適化テクニックは、右側のテーブルが非常に大きい`LEFT JOIN`を使用している場合です。この場合、クエリを`RIGHT JOIN`に書き換え、大きなテーブルを左側に移動します。これにより、クエリプランナーがよりメモリ効率よくなることが可能です。

- JOINの別の最適化は、`サブクエリ`や`CTE`を通じてテーブルを明示的にフィルタリングし、その後これらのサブクエリを通じて`JOIN`を行うことです。これにより、プランナーに効率的に行をフィルタリングし、JOINを行うためのヒントが提供されます。

### 初期読み込み中に`invalid snapshot identifier`が表示されます。どうすればよいですか？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier`エラーは、ClickPipesとPostgresデータベースの間に接続が切れたときに発生します。これはゲートウェイのタイムアウト、データベースの再起動、または他の一時的な問題によって発生する可能性があります。

初期読み込み中は、Postgresデータベースでのアップグレードや再起動などの影響を与える操作を行わないことが推奨されており、データベースへのネットワーク接続が安定していることを確認してください。

この問題を解決するために、ClickPipes UIからリシンクをトリガーできます。これにより、初期読み込みプロセスが最初から再起動します。
