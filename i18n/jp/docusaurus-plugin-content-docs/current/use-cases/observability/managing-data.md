---
title: データ管理
description: 可観測性のためのデータ管理
slug: /observability/managing-data
keywords: [observability, logs, traces, metrics, OpenTelemetry, Grafana, OTel]
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';


# データ管理

可観測性のための ClickHouse のデプロイメントは、必然的に大量のデータセットを含み、それらを管理する必要があります。ClickHouse はデータ管理を支援するための多くの機能を提供しています。

## パーティション {#partitions}

ClickHouse のパーティショニングにより、データをカラムまたは SQL 式に基づいてディスク上で論理的に分離できます。データを論理的に分離することで、各パーティションを独立して操作できるようになり、例えば削除することができます。これにより、ユーザーはパーティションを移動し、したがってサブセットを効率的にストレージ階層間で移動できます。これは、時間ベースで、あるいは [データの有効期限/クラスターからの効率的な削除](/sql-reference/statements/alter/partition) によって行うことができます。

パーティショニングは、テーブルが最初に定義される際に `PARTITION BY` 句を使用して指定されます。この句には、いずれかのカラムに対する SQL 式を含めることができ、その結果が行が送信されるパーティションを定義します。

<img src={observability_14}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

データのパーツは、ディスク上の各パーティションと論理的に関連付けられており（共通のフォルダー名プレフィックスを介して）、独立してクエリを実行できます。以下の例では、デフォルトの `otel_logs` スキーマが、`toDate(Timestamp)` 式を使用して日ごとにパーティションを分けています。行が ClickHouse に挿入されると、この式は各行に対して評価され、結果のパーティションが存在する場合はそこにルーティングされます（その日の最初の行であれば、パーティションが作成されます）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

[パーティションに対してさまざまな操作](/sql-reference/statements/alter/partition)を実行できます。これには、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラムの操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、行によるデータの変異（[変更](/sql-reference/statements/alter/partition#update-in-partition)/[削除](/sql-reference/statements/alter/partition#delete-in-partition)）および [インデックスクリアリング（例：セカンダリインデックス）](/sql-reference/statements/alter/partition#clear-index-in-partition)が含まれます。

例として、`otel_logs` テーブルが日ごとにパーティション化されているとします。構造化されたログデータセットで populated された場合、これは数日間のデータを含むことになります。

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

現在のパーティションは、システムテーブルのクエリを使用して簡単に見つけることができます。

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

`otel_logs_archive` という別のテーブルがあり、古いデータを格納するために使用できます。データは、パーティションごとにこのテーブルに効率的に移動できます（これは単なるメタデータの変更です）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--アーカイブテーブルにデータを移動
ALTER TABLE otel_logs
	(MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--データが移動されたことを確認
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

これは、データを新しいターゲットテーブルに書き換える必要がある `INSERT INTO SELECT` を使用することを要求される他の技術とは対照的です。

:::note パーティションの移動
[テーブル間のパーティション移動](/sql-reference/statements/alter/partition#move-partition-to-table) には、いくつかの条件を満たす必要があります。少なくともテーブルは同じ構造、パーティションキー、主キー、およびインデックス/プロジェクションを持たなければなりません。`ALTER` DDL でのパーティション指定の詳細は、[こちら](/sql-reference/statements/alter/partition#how-to-set-partition-expression)で確認できます。
:::

さらに、データはパーティションごとに効率的に削除できます。これは、他の技術（変異または論理削除）よりもずっとリソース効率が良く、推奨されるべきです。

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
この機能は、設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) が使用されている TTL によって活用されます。詳細は [TTL を用いたデータ管理](#data-management-with-ttl-time-to-live) を参照してください。
:::


### アプリケーション {#applications}

上記は、パーティションごとにデータを効率的に移動および操作する方法を示しています。実際には、ユーザーは可観測性のユースケースでパーティション操作を主に次の二つのシナリオで利用することが多いでしょう。

- **テイアードアーキテクチャ** - ストレージ階層間でデータを移動させること（[ストレージ階層](#storage-tiers)を参照）、これによりホット・コールドアーキテクチャを構築できるようになります。
- **効率的な削除** - データが指定された TTL に達した時（[TTL を用いたデータ管理](#data-management-with-ttl-time-to-live)を参照）

これらについて詳しく探っていきます。

### クエリパフォーマンス {#query-performance}

パーティションはクエリパフォーマンスを助けることができますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には1つ）を対象とする場合、パフォーマンスが改善される可能性があります。これは、パーティショニングキーが主キーに含まれておらず、それによってフィルタリングを行っている場合にのみ、一般的に有用です。ただし、多くのパーティションをカバーしなければならないクエリは、パーティショニングを使用しない場合よりもパフォーマンスが悪化するかもしれません（より多くのパーツが存在する可能性があるため）。単一のパーティションをターゲットにすることの利点は、パーティショニングキーがすでに主キーの初期エントリである場合にはさらにあいまいまたは存在しなくなります。パーティショニングは、各パーティション内の値がユニークな場合に [GROUP BY クエリを最適化するために](https://engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) 使用できます。しかし、一般的に、ユーザーは主キーが最適化されていることを確認し、アクセスパターンが特定の予測可能なデータのサブセットにアクセスする場合（例：日ごとにパーティショニングし、最後の日のクエリがほとんどの場合において）にのみ、パーティショニングをクエリ最適化技術として考慮すべきです。これについての例は [こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4) で確認できます。

## TTL(有効期限)を用いたデータ管理 {#data-management-with-ttl-time-to-live}

Time-to-Live (TTL) は、ClickHouse によって支えられた可観測性ソリューションにおいて効率的なデータ保持と管理の重要な機能です。特に、膨大な量のデータが継続的に生成されるため、この機能が重要です。ClickHouse で TTL を実装することで、古いデータの自動的な期限切れと削除が可能になり、ストレージが最適に利用され、手動による介入なしでパフォーマンスが維持されます。この機能は、データベースをスリムに保つため、ストレージコストを削減するために、また、最も関連性が高く最近のデータに焦点を当てることでクエリが迅速かつ効率的に保たれるために必須です。さらに、データライフサイクルの体系的な管理により、データ保持ポリシーの遵守を助け、可観測性ソリューションの全体的な持続可能性とスケーラビリティを向上させます。

TTL は、ClickHouse でテーブルレベルまたはカラムレベルで指定できます。

### テーブルレベル TTL {#table-level-ttl}

ログとトレースのデフォルトスキーマには、特定の期間を経過したデータを期限切れにする TTL が含まれています。これは、ClickHouse エクスポーターの `ttl` キーの下に指定されます。

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

この構文は現在 [Golang Duration syntax](https://pkg.go.dev/time#ParseDuration) をサポートしています。**ユーザーには `h` を使用することをお勧めし、これがパーティショニング期間と一致することを確認してください。たとえば、日ごとにパーティション化する場合は、24 時間、48 時間、72 時間など日数の倍数である必要があります。** これにより、`ttl: 96h` の場合のように、TTL 句がテーブルに自動的に追加されます。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

デフォルトでは、有効期限が切れた TTL を持つデータは、ClickHouse が [データパーツをマージする際](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) に削除されます。ClickHouse がデータが期限切れであることを検出すると、スケジュール外のマージを実行します。

:::note スケジュールされた TTL
TTL は即座に適用されるのではなく、スケジュールに基づいて適用されます。前述のように、MergeTree テーブルの設定 `merge_with_ttl_timeout` は、削除 TTL を持つマージを繰り返す前の最小遅延を秒単位で設定します。デフォルト値は 14400 秒（4 時間）です。しかし、これは単なる最小遅延であり、TTL マージがトリガーされるまでに長くかかる可能性があります。値が低すぎると、多くのスケジュール外のマージが実行され、多くのリソースを消費する可能性があります。TTL の期限切れは、`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用して強制できます。
:::

**重要：設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) の使用をお勧めします**（デフォルトスキーマによって適用されます）。この設定が有効である場合、ClickHouse は、すべての行が期限切れである場合に、パーツ全体を削除します。部分的な TTL 行のクリー二ングを行う代わりに、全体のパーツを削除する（これには `ttl_only_drop_parts=0` の場合、リソース集約型の変異が必要）ことは、より短い `merge_with_ttl_timeout` 時間を持ち、システムパフォーマンスに与える影響を低減させることができます。データが TTL の期限切れを実施する単位でパーティション化されている場合（たとえば、日単位）、パーツは自然に定義されたインターバルのデータのみを含むことになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できるようになります。

### カラムレベル TTL {#column-level-ttl}

上記の例では、データがテーブルレベルで期限切れになります。ユーザーはカラムレベルでもデータを期限切れにすることができます。データが経年するにつれて、調査でその価値を支えるリソースのオーバーヘッドを保持する正当性がないカラムを削除するためにこれを使用することができます。たとえば、新しい動的メタデータが挿入時に抽出されていない場合に備えて、`Body` カラムを保持することをお勧めします。たとえば、新しい Kubernetes ラベルです。1 か月後の一定の期間後に、この追加のメタデータが役に立たないことが明らかになるかもしれません。したがって、`Body` カラムの保持は価値を制限することになります。

以下に、30 日後に `Body` カラムを削除できる方法を示します。

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
カラムレベルの TTL を指定するには、ユーザーが独自のスキーマを指定する必要があります。これは OTel コレクターでは指定できません。
:::

## データの再圧縮 {#recompressing-data}

可観測性データセットには通常 `ZSTD(1)` の使用を推奨していますが、ユーザーはさまざまな圧縮アルゴリズムや高い圧縮レベル（たとえば `ZSTD(3)`）を試すことができます。スキーマ作成時にこれを指定できるだけでなく、設定された期間後に変更するように構成することも可能です。これは、コーデックや圧縮アルゴリズムが圧縮を改善するが、クエリパフォーマンスを悪化させる場合に適しているかもしれません。このトレードオフは、調査でそれほど頻繁にはクエリされない古いデータには許容できるかもしれませんが、最近のデータには許容できません。このデータは、調査でより頻繁に使用されるためです。

以下の例は、データを削除するのではなく、4 日後に `ZSTD(3)` を使用して圧縮する方法を示しています。

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

:::note パフォーマンス評価
ユーザーには常に、さまざまな圧縮レベルとアルゴリズムの挿入およびクエリパフォーマンスへの影響を評価することをお勧めします。たとえば、デルタコーデックはタイムスタンプの圧縮に役立つ場合があります。ただし、これらが主キーの一部である場合、フィルタリングパフォーマンスに影響を与える可能性があります。
:::

TTL の設定に関するさらなる詳細や例は、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) で確認できます。テーブルやカラムの TTL を追加および変更する方法に関する例は、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) で確認できます。 TTL がホット・ウォームアーキテクチャなどのストレージ階層を可能にする方法については、[ストレージ階層](#storage-tiers)を参照してください。

## ストレージ階層 {#storage-tiers}

ClickHouse では、ユーザーは異なるディスク上でストレージ階層を作成できます。たとえば、SSD 上にホット/最近のデータを配置し、古いデータを S3 にバックアップする構造です。このアーキテクチャにより、古いデータにはコストが低いストレージを使用できるようになり、調査での利用頻度が低いため、より高いクエリ SLA を確保できます。

:::note ClickHouse Cloud に関連しない
ClickHouse Cloud は、S3 にバックアップされたデータの単一コピーを使用し、SSD バックアップのノードキャッシュを持っています。したがって、ClickHouse Cloud でのストレージ階層は必要ありません。
:::

ストレージ階層の作成には、ユーザーがディスクを作成し、次にそれらを使用してストレージポリシーを形成する必要があります。ボリュームはテーブル作成時に指定できます。データは、充填率、パートサイズ、およびボリュームの優先度に基づいて自動的にディスク間で移動されます。さらなる詳細は、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)で確認できます。

ユーザーは、`ALTER TABLE MOVE PARTITION` コマンドを使用してディスク間でデータを手動で移動することもできますが、ボリューム間でのデータの移動も TTL を使用して制御できます。フル例は、[こちら](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)で確認できます。

## スキーマ変更の管理 {#managing-schema-changes}

ログおよびトレーススキーマは、システムのライフサイクルを通じて必然的に変更されます。ユーザーが異なるメタデータやポッドラベルを持つ新しいシステムを監視するにつれてです。OTel スキーマを使用してデータを生成し、元のイベントデータを構造化した形式でキャプチャすることで、ClickHouse スキーマはこれらの変更に対して堅牢になります。ただし、新しいメタデータが利用可能になり、クエリアクセスパターンが変わると、ユーザーはこれらの展開を反映するためにスキーマを更新したくなることがあります。

スキーマ変更中のダウンタイムを回避するために、ユーザーにはいくつかのオプションがあります。以下に示します。

### デフォルト値を使用する {#use-default-values}

カラムは、[`DEFAULT` 値](/sql-reference/statements/create/table#default) を使用してスキーマに追加できます。指定されたデフォルト値は、INSERT 中に指定されていない場合に使用されます。

スキーマ変更は、これらの新しいカラムが送信される原因となるマテリアライズドビューの変換ロジックや OTel コレクターの設定を変更する前に行うことができます。

スキーマが変更されたら、ユーザーは OTel コレクターを再構成できます。ユーザーが ["SQL での構造抽出"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) に記載されている推奨プロセスを使用している場合、OTel コレクターは、ターゲットスキーマを抽出し、結果をストレージ用のターゲットテーブルに送信する責任がある Null テーブルエンジンにデータを送信します。このビューは、[`ALTER TABLE ... MODIFY QUERY` 構文](/sql-reference/statements/alter/view)を使用して変更できます。以下に、ターゲットテーブルと、その対応するマテリアライズドビュー（"SQL での構造抽出" に使用されるものと似ています）を示します。

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

私たちが `LogAttributes` から抽出したい新しいカラム `Size` を追加したいとします。以下の `ALTER TABLE` を使って、デフォルト値を指定してスキーマに追加できます。

```sql
ALTER TABLE otel_logs_v2
	(ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、指定されたデフォルト値は、`LogAttributes` の `size` キー（存在しない場合は 0 になります）です。これは、このカラムの値が挿入されていない行にアクセスするクエリはマップにアクセスしなければならず、したがって遅くなることを意味します。この値を定数、たとえば 0 として容易に指定することで、値を持たない行に対する後続のクエリのコストを減少させることができます。このテーブルをクエリすると、期待通りにマップから値が取得されていることがわかります。

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

すべての将来のデータにこの値が挿入されることを確認するために、以下の `ALTER TABLE` 構文を使用してマテリアライズドビューを変更することができます。

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

その後の行は、挿入時に `Size` カラムがポピュレートされるようになります。

### 新しいテーブルを作成する {#create-new-tables}

上記のプロセスの代わりに、ユーザーは新しいスキーマを持つ新しいターゲットテーブルを簡単に作成できます。その後、マテリアライズドビューを変更して、新しいテーブルを使用することができます。これにより、ユーザーはテーブルをバージョン化して、たとえば `otel_logs_v3` を作成できます。

このアプローチにより、ユーザーはクエリ対象のテーブルが複数になる可能性があります。他のテーブルをクエリするには、[`merge` 関数](/sql-reference/table-functions/merge) を使用し、テーブル名にワイルドカードパターンを受け入れることができます。以下に示すように、`otel_logs` テーブルの v2 と v3 をクエリしています。

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

ユーザーが `merge` 関数を使用しないことを望む場合、複数のテーブルを結合したテーブルをエンドユーザーに公開するために、[Merge テーブルエンジン](/engines/table-engines/special/merge)を使用できます。以下に示します。

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

新しいテーブルが追加されるたびに、`EXCHANGE` テーブル構文を使用してこれを更新できます。たとえば、v4 テーブルを追加するには、新しいテーブルを作成し、それを以前のバージョンと原子的に交換することができます。

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
