---
title: データ管理
description: 可観測性のためのデータ管理
slug: /observability/managing-data
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---

# データ管理

可観測性のためのClickHouseのデプロイメントは、常に大規模なデータセットを伴い、それを管理する必要があります。ClickHouseはデータ管理を支援するための多くの機能を提供しています。

## パーティション {#partitions}

ClickHouseにおけるパーティショニングは、カラムやSQL式に基づいてディスク上でデータを論理的に分割することを可能にします。データを論理的に分割することで、各パーティションは独立して操作できるようになり、例えば削除することができます。これにより、ユーザーはパーティションを効率的に移動したり、サブセットをストレージ階層間で移動したりできます [データの期限切れ/クラスタからの効率的な削除](/sql-reference/statements/alter/partition)。

パーティショニングは、テーブルが初めて定義される際に`PARTITION BY`句を使用して指定されます。この句は、任意のカラムに関するSQL式を含むことができ、その結果が行が送信されるパーティションを定義します。

<img src={require('./images/observability-14.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

データパーツは（共通のフォルダー名のプレフィックスを介して）ディスク上の各パーティションに論理的に関連付けられ、個別にクエリを実行できます。以下の例では、デフォルトの`otel_logs`スキーマは、式`toDate(Timestamp)`を使用して日ごとにパーティション分割されています。ClickHouseに行が挿入されると、この式は各行に対して評価され、パーティションが存在する場合はそのパーティションにルーティングされます（行がその日の最初のものであれば、パーティションが作成されます）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

[いくつかの操作](/sql-reference/statements/alter/partition)がパーティションに対して実行可能で、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラムの操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、ミューテーション [データの変更](/sql-reference/statements/alter/partition#update-in-partition)/[削除](/sql-reference/statements/alter/partition#delete-in-partition)が行え、[インデックスのクリア]（例えば、セカンダリインデックス）(/sql-reference/statements/alter/partition#clear-index-in-partition)も可能です。

例えば、`otel_logs`テーブルが日ごとにパーティション分割されていると仮定します。構造化されたログデータセットが入ると、これには数日分のデータが含まれます。

```sql
SELECT Timestamp::Date AS day,
	 count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-26 │ 1986456 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

5 rows in set. Elapsed: 0.058 sec. Processed 10.37 million rows, 82.92 MB (177.96 million rows/s., 1.42 GB/s.)
Peak memory usage: 4.41 MiB.
```

現在のパーティションは、簡単なシステムテーブルクエリを使用して見つけることができます。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'otel_logs'

┌─partition──┐
│ 2019-01-22 │
│ 2019-01-23 │
│ 2019-01-24 │
│ 2019-01-25 │
│ 2019-01-26 │
└────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

別のテーブル`otel_logs_archive`があり、古いデータを保存するために使用する場合もあります。データはパーティションごとに効率的にこのテーブルに移動できます（これはメタデータの変更だけです）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--アーカイブテーブルにデータを移動する
ALTER TABLE otel_logs
	(MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--データが移動されたことを確認する
SELECT
	Timestamp::Date AS day,
	count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

4 rows in set. Elapsed: 0.051 sec. Processed 8.38 million rows, 67.03 MB (163.52 million rows/s., 1.31 GB/s.)
Peak memory usage: 4.40 MiB.

SELECT Timestamp::Date AS day,
	count() AS c
FROM otel_logs_archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 row in set. Elapsed: 0.024 sec. Processed 1.99 million rows, 15.89 MB (83.86 million rows/s., 670.87 MB/s.)
Peak memory usage: 4.99 MiB.
```

これは、`INSERT INTO SELECT`を使用し、新しいターゲットテーブルにデータを書き換える必要がある他の手法とは対照的です。

:::note パーティションの移動
[テーブル間のパーティション移動](/sql-reference/statements/alter/partition#move-partition-to-table)には、いくつかの条件が満たされる必要があります。特に、テーブルは同じ構造、パーティションキー、主キー、およびインデックス/プロジェクションを持っている必要があります。`ALTER` DDLにおけるパーティションの指定方法の詳細は[こちら](/sql-reference/statements/alter/partition#how-to-set-partition-expression)をご覧ください。
:::

さらに、データはパーティションごとに効率的に削除することができます。これは代替手法（ミューテーションまたは論理削除）よりも資源効率が高く、推奨されるべきです。

```sql
ALTER TABLE otel_logs
	(DROP PARTITION tuple('2019-01-25'))

SELECT
	Timestamp::Date AS day,
	count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC
┌────────day─┬───────c─┐
│ 2019-01-22 │ 4667954 │
│ 2019-01-23 │ 4653388 │
│ 2019-01-24 │ 3792510 │
└────────────┴─────────┘
```

:::note
この機能は、設定[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)が使用されているときにTTLによって利用されます。詳細は[TTLを使ったデータ管理](#data-management-with-ttl-time-to-live)をご覧ください。
:::

### アプリケーション {#applications}

上記は、パーティションによってデータを効率的に移動および操作できる方法を示しています。実際には、ユーザーは可観測性の使用ケースにおいて、次の2つのシナリオでパーティション操作を利用することが最も多いでしょう：

- **階層化アーキテクチャ** - ストレージ階層間でデータを移動する（[ストレージ階層](#storage-tiers)を参照）、これによりホットコールドアーキテクチャを構築できます。
- **効率的な削除** - データが指定されたTTLに達したとき（[TTLを使ったデータ管理](#data-management-with-ttl-time-to-live)を参照）

これらの詳細について、以下で探ります。

### クエリ性能 {#query-performance}

パーティションはクエリ性能の向上に寄与することができますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には1つ）を対象とする場合、性能が向上する可能性があります。これは通常、パーティショニングキーが主キーに含まれておらず、それでフィルタリングしている場合に限ります。ただし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合に比べてパフォーマンスが低下する可能性があります（パーツの数が多くなる可能性があるためです）。特定のパーティションを対象にするメリットは、パーティショニングキーがすでに主キーの早いエントリである場合にはほとんど無くなるでしょう。パーティショニングは、各パーティション内の値がユニークである場合、[GROUP BYクエリを最適化するために使用されることもあります](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。しかし、一般に、ユーザーは主キーが最適化されていることを確認し、パーティショニングをクエリ最適化手法として例外的なケースでのみ検討するべきです。予測可能なデータの特定のサブセットにアクセスするアクセスパターンがある場合、例えば日ごとにパーティションを分け、多くのクエリが最後の日に行われる場合のようにです。[こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)でこれに関する例が見つかります。

## TTLによるデータ管理 (Time-to-live) {#data-management-with-ttl-time-to-live}

Time-to-Live（TTL）は、ClickHouseによって提供される可観測性ソリューションにおいて、効率的なデータ保持と管理のための重要な機能です。特に、膨大な量のデータが継続的に生成されることを考えると、その実装は重要です。ClickHouseでTTLを実装することで、古いデータの自動期限切れと削除が可能となり、ストレージが最適に使用されることを保証し、手動の介入なしに性能が維持されます。この機能は、データベースをスリムに保ち、ストレージコストを削減し、クエリが最も関連性が高く最近のデータに集中することで、高速かつ効率的に保つために不可欠です。さらに、データ保持ポリシーの遵守を促進し、データライフサイクルの体系的な管理を実現することで、可観測性ソリューションの全体的な持続可能性とスケーラビリティを向上させます。

TTLは、ClickHouse内でテーブルレベルまたはカラムレベルで指定できます。

### テーブルレベルのTTL {#table-level-ttl}

ログおよびトレースのデフォルトスキーマには、指定された期間後にデータを期限切れにするTTLが含まれています。これはClickHouseエクスポーターの`ttl`キーの下に指定されます。例えば：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

この構文は現在[Go言語の期間構文](https://pkg.go.dev/time#ParseDuration)をサポートしています。**ユーザーには`h`を使用し、これがパーティショニングの期間に合致することを推奨します。例えば、日ごとにパーティションを分けている場合、これは日の倍数である必要があります（例えば、24h, 48h, 72h）。** これにより、自動的にTTL条項がテーブルに追加されます。例えば、`ttl: 96h`の場合：

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

デフォルトでは、期限切れのTTLを持つデータは、ClickHouseが[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)際に削除されます。ClickHouseはデータが期限切れであることを検出すると、オフスケジュールのマージを実行します。

:::note スケジュールされたTTL
TTLは直ちに適用されるのではなく、上記のようにスケジュールされます。MergeTreeテーブル設定の`merge_with_ttl_timeout`は、期限切れのTTLでマージを繰り返す前の最小遅延を設定します。デフォルト値は14400秒（4時間）です。しかし、それはただの最小遅延で、TTLマージがトリガーされるまでにより長い時間がかかることがあります。値が低すぎると、オフスケジュールのマージが多数行われ、リソースを多く消費する可能性があります。`ALTER TABLE my_table MATERIALIZE TTL`コマンドを使用してTTLの期限切れを強制することができます。
:::

**重要: 設定[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)の使用を推奨します**（デフォルトスキーマによって適用されます）。この設定が有効な場合、ClickHouseは、すべての行が期限切れになった場合にパーツ全体を削除します。部分的にTTL-d行をクリーニングするのではなく全体的にパーツを削除すること（`ttl_only_drop_parts=0`の場合、リソース集約的なミューテーションによって達成される）は、`merge_with_ttl_timeout`の期間を短くし、システムの性能への影響を低減することを可能にします。データがTTL期限切れを実行する単位でパーティショニングされている場合（例えば日ごと）、パーツは自然に定義されたインターバルからのデータのみを含むことになります。これにより、`ttl_only_drop_parts=1`が効率的に適用されることが保証されます。

### カラムレベルのTTL {#column-level-ttl}

上記の例は、テーブルレベルでデータを期限切れにします。ユーザーはカラムレベルでもデータを期限切れにすることができます。データが古くなるにつれて、調査の中で保持するためのリソースコストを正当化できないカラムを削除するためにこれを使用できます。例えば、新しい動的メタデータが挿入時に抽出されなかった場合に備えて`Body`カラムを保持することを推奨します。たとえば、新しいKubernetesラベルが追加される場合です。一定期間（例えば1か月）後、この追加メタデータが無用であることが明らかになるかもしれません - したがって、`Body`カラムを保持する価値が限られます。

以下に示すのは、30日後に`Body`カラムを削除する方法です。

```sql
CREATE TABLE otel_logs_v2
(
	`Body` String TTL Timestamp + INTERVAL 30 DAY,
	`Timestamp` DateTime,
	...
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note 
カラムレベルのTTLを指定するには、ユーザーが独自のスキーマを指定する必要があります。これはOTelコレクタでは指定できません。
:::

## データの再圧縮 {#recompressing-data}

可観測性データセットには通常`ZSTD(1)`をお勧めしますが、ユーザーは異なる圧縮アルゴリズムやより高い圧縮レベル（例えば`ZSTD(3)`）を試すことができます。スキーマ作成時にこれを指定できるだけでなく、設定された期間後に変更されるように圧縮を構成することもできます。これは、コーデックや圧縮アルゴリズムが圧縮を改善するが、クエリ性能が低下する場合に適切かもしれません。このトレードオフは、調査の頻度が低い古いデータには許容できるかもしれませんが、最近のデータには許容できないかもしれません。

以下に示すのは、4日後に`ZSTD(3)`を使用してデータを圧縮する例です。

```sql
CREATE TABLE default.otel_logs_v2
(
	`Body` String,
	`Timestamp` DateTime,
	`ServiceName` LowCardinality(String),
	`Status` UInt16,
	`RequestProtocol` LowCardinality(String),
	`RunTime` UInt32,
	`Size` UInt32,
	`UserAgent` String,
	`Referer` String,
	`RemoteUser` String,
	`RequestType` LowCardinality(String),
	`RequestPath` String,
	`RemoteAddress` IPv4,
	`RefererDomain` String,
	`RequestPage` String,
	`SeverityText` LowCardinality(String),
	`SeverityNumber` UInt8,
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
TTL Timestamp + INTERVAL 4 DAY RECOMPRESS CODEC(ZSTD(3))
```

:::note 性能の評価
ユーザーは常に異なる圧縮レベルやアルゴリズムが挿入およびクエリ性能に与える影響を評価することをお勧めします。例えば、デルタコーデックはタイムスタンプの圧縮に有効です。しかし、これらが主キーの一部である場合、フィルタリング性能が損なわれる可能性があります。
:::

TTLの構成に関する詳細や例については、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)をご覧ください。TTLがテーブルやカラムに追加および変更される例については、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)をご覧ください。TTLがホット-ウォームアーキテクチャなどのストレージ階層を許可する方法については、[ストレージ階層](#storage-tiers)をご覧ください。

## ストレージ階層 {#storage-tiers}

ClickHouseでは、ユーザーは異なるディスクにストレージ階層を作成できます。例えば、SSDにホット/最近のデータを、古いデータをS3でバックアップできます。このアーキテクチャにより、調査時に使用頻度が低いため、古いデータに対してコストが低いストレージを使用できます。

:::note ClickHouse Cloudには関連しません
ClickHouse Cloudは、S3にバックアップされたデータの単一コピーを使用しており、SSDバックアップのノードキャッシュがあります。したがって、ClickHouse Cloudではストレージ階層は必要ありません。
:::

ストレージ階層を作成するには、ユーザーがディスクを作成し、その後、ストレージポリシーを形成するために使用され、テーブル作成時にボリュームを指定できます。データは、充填率、パーツサイズ、ボリュームの優先度に基づいて自動的にディスク間で移動できます。詳細については、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)をご覧ください。

データは`ALTER TABLE MOVE PARTITION`コマンドを使用してディスク間で手動で移動することもできますが、ボリューム間でのデータの移動もTTLを使用して制御できます。完全な例については[こちら](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)をご覧ください。

## スキーマ変更の管理 {#managing-schema-changes}

ログおよびトレーススキーマは、システムの運用に伴い必然的に変更されます。例えば、ユーザーが異なるメタデータやポッドラベルを持つ新しいシステムを監視する場合です。OTelスキーマを使用してデータを生成し、元のイベントデータを構造化形式でキャプチャすることにより、ClickHouseスキーマはこれらの変更に対して頑健となります。しかし、新しいメタデータが利用可能になり、クエリアクセスパターンが変化するにつれて、ユーザーはこれらの開発を反映するためにスキーマを更新したくなるでしょう。

スキーマ変更中にダウンタイムを回避するために、ユーザーはいくつかのオプションがあり、以下に示します。

### デフォルト値を使用する {#use-default-values}

カラムは、[`DEFAULT`値](/sql-reference/statements/create/table#default)を使用してスキーマに追加できます。指定されたデフォルトは、INSERT時に指定されていない場合に使用されます。

スキーマ変更は、マテリアライズドビューの変換ロジックやOTelコレクタの設定を変更する前に行うことができ、これにより新しいカラムが送信されます。

スキーマが変更された後、ユーザーはOTelコレクタを再構成できます。ユーザーが["SQLで構造を抽出する" ](/observability/schema-design/#extracting-structure-with-sql)で説明される推奨プロセスを使用していると仮定します。この場合、OTelコレクタはNullテーブルエンジンにデータを送信し、マテリアライズドビューがターゲットスキーマを抽出し、その結果をストレージのためのターゲットテーブルに送信します。このビューは次のように[`ALTER TABLE ... MODIFY QUERY`構文](/sql-reference/statements/alter/view)を使用して変更できます。以下に示すターゲットテーブルと、OTel構造化ログからターゲットスキーマを抽出するための対応するマテリアライズドビュー（"SQLで構造を抽出する"で使用されるものと類似）があります。

```sql
CREATE TABLE default.otel_logs_v2
(
	`Body` String,
	`Timestamp` DateTime,
	`ServiceName` LowCardinality(String),
	`Status` UInt16,
	`RequestProtocol` LowCardinality(String),
	`RunTime` UInt32,
	`UserAgent` String,
	`Referer` String,
	`RemoteUser` String,
	`RequestType` LowCardinality(String),
	`RequestPath` String,
	`RemoteAddress` IPv4,
	`RefererDomain` String,
	`RequestPage` String,
	`SeverityText` LowCardinality(String),
	`SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)

CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body, 
	Timestamp::DateTime AS Timestamp,
	ServiceName,
	LogAttributes['status']::UInt16 AS Status,
	LogAttributes['request_protocol'] AS RequestProtocol,
	LogAttributes['run_time'] AS RunTime,
	LogAttributes['user_agent'] AS UserAgent,
	LogAttributes['referer'] AS Referer,
	LogAttributes['remote_user'] AS RemoteUser,
	LogAttributes['request_type'] AS RequestType,
	LogAttributes['request_path'] AS RequestPath,
	LogAttributes['remote_addr'] AS RemoteAddress,
	domain(LogAttributes['referer']) AS RefererDomain,
	path(LogAttributes['request_path']) AS RequestPage,
	multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
	multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

`LogAttributes`から新しいカラム`Size`を抽出したいと仮定します。これを指定するには`ALTER TABLE`でデフォルト値を指定してスキーマに追加できます。

```sql
ALTER TABLE otel_logs_v2
	(ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、デフォルトとして`LogAttributes`の`size`キーを指定しています（存在しない場合は0になります）。これは、このカラムの値が挿入されない行のクエリがMapにアクセスする必要があることを意味し、したがって遅くなります。定数、例えば0を指定することも容易で、値のない行に対する後続のクエリコストを減少させることができます。このテーブルをクエリすると、Mapから期待通りに値が埋め込まれていることが分かります。

```sql
SELECT Size
FROM otel_logs_v2
LIMIT 5
┌──Size─┐
│ 30577 │
│  5667 │
│  5379 │
│  1696 │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.012 sec.
```

今後のデータの挿入時にこの値が挿入されるようにするために、マテリアライズドビューを次のように変更することができます。

```sql
ALTER TABLE otel_logs_mv
	MODIFY QUERY
SELECT
    	Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

その後の行は、挿入時間に`Size`カラムが埋め込まれることになります。

### 新しいテーブルを作成する {#create-new-tables}

上記のプロセスの代わりに、ユーザーは新しいスキーマを持つターゲットテーブルを単純に作成することもできます。その後、すべてのマテリアライズドビューを変更して、新しいテーブルを使用することができます。このアプローチにより、ユーザーはテーブルをバージョン管理することができます（例: `otel_logs_v3`）。

このアプローチでは、ユーザーは複数のテーブルをクエリすることになります。複数のテーブルを横断してクエリするために、ユーザーは[`merge`関数](/sql-reference/table-functions/merge)を使用できます。この関数は、テーブル名のワイルドカードパターンを受け入れます。以下のように、`otel_logs`テーブルのv2およびv3をクエリする例を示します。

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 38319300 │
│	304  │  1360912 │
│	302  │   799340 │
│	404  │   420044 │
│	301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

ユーザーが`merge`関数の使用を避け、複数のテーブルを統合したテーブルをエンドユーザーに公開したい場合は、[Mergeテーブルエンジン](/engines/table-engines/special/merge)を使用できます。以下に示す例は以下の通りです。

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 38319300 │
│	304  │  1360912 │
│	302  │   799340 │
│	404  │   420044 │
│	301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

新しいテーブルが追加されたときは、`EXCHANGE`テーブル構文を使用して更新できます。例えば、v4テーブルを追加するには、新しいテーブルを作成し、以前のバージョンと原子的に交換します。

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│	200  │ 39259996 │
│	304  │  1378564 │
│	302  │   820118 │
│	404  │   429220 │
│	301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
```
