---
title: 'Managing Data'
description: '可観測性のためのデータ管理'
slug: '/observability/managing-data'
keywords:
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';



# データの管理

Observability 用の ClickHouse のデプロイには、管理が必要な大規模なデータセットが不可欠です。ClickHouse はデータ管理を支援するための多くの機能を提供しています。

## パーティション {#partitions}

ClickHouse のパーティショニングは、データをカラムまたは SQL 式に従って論理的にディスク上で分離することを可能にします。データを論理的に分離することで、各パーティションを独立して操作できるようになり、例えば削除することができます。これにより、ユーザーはパーティションを移動し、効率的にストレージ階層間でサブセットを移動することができます。また、[データを期限切れにする/クラスターから効率的に削除する](/sql-reference/statements/alter/partition)ことも可能です。

パーティショニングは、初期に `PARTITION BY` 句を介してテーブルで指定されます。この句には、任意のカラムの SQL 式を含めることができ、その結果が行が送信されるパーティションを定義します。

<Image img={observability_14} alt="パーティション" size="md"/>

データパーツは、ディスク上の各パーティションに論理的に関連付けられ（共通のフォルダ名プレフィックスを介して）、独立してクエリを実行できます。以下の例では、デフォルトの `otel_logs` スキーマは `toDate(Timestamp)` の式を使用して日単位でパーティショニングされています。ClickHouse に行が挿入されると、この式は各行に対して評価され、存在する場合は結果のパーティションにルーティングされます（行がその日の最初のものであれば、パーティションが作成されます）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

パーティションに対しては、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラム操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、ミューテーションによる[データの変更](/sql-reference/statements/alter/partition#update-in-partition)/[削除](/sql-reference/statements/alter/partition#delete-in-partition)、および[インデックスクリア（例：二次インデックス）](/sql-reference/statements/alter/partition#clear-index-in-partition)など、[さまざまな操作](/sql-reference/statements/alter/partition)を行うことができます。

例えば、`otel_logs` テーブルが日単位でパーティショニングされていると仮定します。構造化されたログデータセットで埋められると、これは数日分のデータを含むことになります。

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

現在のパーティションは、シンプルなシステムテーブルクエリを使用して確認できます。

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

別のテーブル `otel_logs_archive` を持っている場合、古いデータを格納するために使用します。このテーブルにデータを効率的に（これはメタデータの変更に過ぎません）移動できます。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--アーカイブテーブルにデータを移動
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--データが移動したことを確認
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

これは、他の技術（`INSERT INTO SELECT` を使用し、新しいターゲットテーブルにデータを書き込む）を使用する必要がある場合とは対照的です。

:::note パーティションの移動
[テーブル間のパーティション移動](/sql-reference/statements/alter/partition#move-partition-to-table)には、いくつかの条件が満たされる必要があります。まず、テーブルは同じ構造、パーティションキー、主キー、インデックス/プロジェクションを持っている必要があります。`ALTER` DDL でパーティションを指定する方法に関する詳細なメモは、[こちら](/sql-reference/statements/alter/partition#how-to-set-partition-expression)で確認できます。
:::

さらに、データはパーティション単位で効率的に削除できます。これは、代替技術（ミューテーションまたは軽量削除）よりもはるかにリソース効率が良く、推奨されるべきです。

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
この機能は、設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を使用した際に TTL によって活用されます。詳細については [TTL を使用したデータ管理](#data-management-with-ttl-time-to-live) を参照してください。
:::

### アプリケーション {#applications}

上記は、データがパーティション単位で効率的に移動および操作可能であることを示しています。実際には、ユーザーは Observability のユースケースでパーティション操作を最も頻繁に利用する場面が二つあります。

- **階層アーキテクチャ** - ストレージ階層間でデータを移動させる（[ストレージ階層](#storage-tiers)を参照）ことによって、ホット・コールドアーキテクチャを構築できるようになります。
- **効率的な削除** - データが指定された TTL に達したとき（[TTL を使用したデータ管理](#data-management-with-ttl-time-to-live)を参照）。

これら二つについて、以下で詳細に探ります。

### クエリパフォーマンス {#query-performance}

パーティションはクエリのパフォーマンスを助けることができますが、これはアクセスパターンに大きく依存します。クエリがごく少数のパーティション（理想的には1つ）だけをターゲットにする場合、パフォーマンスが向上する可能性があります。これは通常、パーティショニングキーが主キーに含まれていない場合で、なおかつそれでフィルタリングを行っている時のみ有益です。しかし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが悪化することがあります（パーツが多くなる可能性があるため）。単一のパーティションを対象とする利点は、パーティショニングキーがすでに主キーの初期項目である場合には、さらに見えづらく、ほとんど存在しないことでしょう。パーティショニングは、もし各パーティション内の値がユニークであれば、[GROUP BY クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも利用できます。しかし、一般にユーザーは主キーが最適化されていることを確認し、特定の予測可能なデータサブセットにアクセスするパターンがあるような例外的な場合にのみクエリの最適化手法としてパーティショニングを検討するべきです。例えば、日ごとにパーティショニングを行い、ほとんどのクエリが最終日のものであるようなケースです。この動作の例については[こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)を参照ください。

## TTL（有効期限）によるデータ管理 {#data-management-with-ttl-time-to-live}

Time-to-Live (TTL) は、ClickHouse によって駆動される Observability ソリューションにおいて、効率的なデータ保持と管理のための重要な機能です。膨大なデータが継続的に生成されている状況下において、TTL を ClickHouse に実装することで、古いデータの自動的な期限切れおよび削除が可能になり、ストレージが最適に使用され、パフォーマンスが維持されることが手動での介入なしに実現できます。この機能は、データベースを引き締めておくため、ストレージコストを削減し、常に最も関連性の高く、最新のデータに焦点を当てることで、クエリが迅速で効率的に保たれることに重要です。さらに、データライフサイクルを体系的に管理することによって、データ保持ポリシーに準拠するのに役立ちます。これにより、Observability ソリューションの全体的な持続可能性とスケーラビリティが向上します。

TTL は、ClickHouse 内でテーブルレベルまたはカラムレベルのいずれかで指定できます。

### テーブルレベル TTL {#table-level-ttl}

ログとトレースのデフォルトスキーマには、指定された期間後にデータが期限切れとなる TTL が含まれています。これは ClickHouse エクスポータの `ttl`キーの下で指定されます。例：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

この構文は現在、[Golang Duration 構文](https://pkg.go.dev/time#ParseDuration)をサポートしています。**ユーザーは `h` を使用し、これがパーティショニング期間と一致するようにすることを推奨します。たとえば、日ごとにパーティショニングを行う場合、72h のように日数の倍数であることを確認してください。** これにより、TTL がテーブルに自動的に追加されます。例として `ttl: 96h` の場合。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

デフォルトでは、有効期限が切れた TTL を持つデータは、ClickHouse が[データパーツをマージする際](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)に削除されます。ClickHouse がデータが期限切れであることを検出すると、オフスケジュールマージを実行します。

:::note スケジュールされた TTL
TTL は即座には適用されず、上で述べたようにスケジュールに基づいて適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、削除 TTL を持つマージを繰り返す前の最小遅延を秒単位で設定します。デフォルト値は 14400 秒（4 時間）です。しかしそれは最小遅延に過ぎず、TTL マージがトリガーされるまでにさらに長い時間がかかることがあります。値が低すぎると、多くのオフスケジュールマージが実行され、多くのリソースを消費する可能性があります。`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用して TTL の期限切れを強制することができます。
:::

**重要:** 設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を使用することを推奨します（デフォルトのスキーマによって適用されます）。この設定が有効な場合、ClickHouse はすべての行が期限切れのときにパーツ全体を削除します。部分的なクリーンアップを行うのではなく（これにはリソース集中的なミューテーションが必要）、全体を削除することで `merge_with_ttl_timeout` の時間を短縮し、システムパフォーマンスへの影響を低くすることができます。データが TTL 有効期限切れを行う単位でパーティショニングされている場合（例えば日単位）、パーツは定義された間隔のデータのみを自然に含むことになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できることが保証されます。

### カラムレベル TTL {#column-level-ttl}

上記の例では、テーブルレベルでデータの有効期限切れを設定しています。ユーザーは、カラムレベルでデータを期限切れにすることも可能です。データが古くなるにつれて、調査での価値がそのリソースオーバーヘッドを正当化しないカラムを削除するために使用されます。たとえば、新しい動的メタデータが挿入時に抽出されていない場合に備え、`Body` カラムを保持することを推奨します（例：新しい Kubernetes ラベル）。一定期間後（例えば 1 か月）、この追加メタデータが役に立たないことが明らかになる場合があるため、`Body` カラムを保持することの価値が低くなります。

以下に、30 日後に `Body` カラムを削除する方法を示します。

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
カラムレベル TTL を指定するためには、ユーザーが独自のスキーマを指定する必要があります。これは OTel コレクタ内では指定できません。
:::

## データの再圧縮 {#recompressing-data}

通常、Observability データセットには `ZSTD(1)` を推奨しますが、ユーザーはさまざまな圧縮アルゴリズムや圧縮レベル（例：`ZSTD(3)`）を試すことができます。これをスキーマ作成時に指定することができるだけでなく、設定された期間の後に変更するように構成することもできます。コーデックや圧縮アルゴリズムが圧縮を改善する一方でクエリパフォーマンスを悪化させる場合に適切であるかもしれません。このトレードオフは、稀にしかクエリされない古いデータには容認できるかもしれませんが、最近のデータには頻繁に使用されるため適さないでしょう。

以下に、データを削除するのではなく、4 日後に `ZSTD(3)` で圧縮する例を示します。

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

:::note パフォーマンスを評価する
ユーザーは常に異なる圧縮レベルやアルゴリズムの挿入およびクエリパフォーマンスへの影響を評価することを推奨します。たとえば、デルタコーデックはタイムスタンプの圧縮に役立つ場合があります。しかし、これらが主キーの一部である場合、フィルタリングパフォーマンスが低下する可能性があります。
:::

TTL の構成に関するさらなる詳細や例については、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)をご覧ください。TTL をテーブルおよびカラムに追加および修正する方法の例については、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)をご覧ください。ホット・ウォームアーキテクチャなどのストレージ階層を TTL が可能にする方法については、[ストレージ階層](#storage-tiers)を参照してください。

## ストレージ階層 {#storage-tiers}

ClickHouse では、ユーザーは異なるディスク上にストレージ階層を作成できます。たとえば、SSD 上のホット/最近データと S3 でバックアップされた古いデータ。これにより、調査での使用が少ないため、古いデータにはより高いクエリ SLA が必要とされる安価なストレージを使用できます。

:::note ClickHouse Cloud に関連しない
ClickHouse Cloud では、S3 にバックアップされたデータの単一コピーを使用し、SSD バックアップされたノードキャッシュがあります。したがって、ClickHouse Cloud におけるストレージ階層は必要ありません。
:::

ストレージ階層を作成するには、ユーザーがディスクを作成し、それを使用してストレージポリシーを策定する必要があります。ボリュームはテーブル作成時に指定できます。データは、フィルレート、パーツサイズ、ボリュームの優先度に基づいて、ディスク間で自動的に移動できます。詳細な情報は、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)をご覧ください。

データは、`ALTER TABLE MOVE PARTITION` コマンドを使用して手動でディスク間で移動できますが、TTL を使用してボリューム間のデータ移動を制御することもできます。完全な例は、[こちら](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)で確認できます。

## スキーマ変更の管理 {#managing-schema-changes}

ログおよびトレースのスキーマは、ユーザーが異なるメタデータやポッドラベルを持つ新しいシステムを監視するにつれて、システムのライフサイクルを通じて必然的に変化します。OTel スキーマを使用してデータを生成し、元のイベントデータを構造化形式でキャプチャすることにより、ClickHouse のスキーマはこれらの変更に対して頑丈になります。しかし、新しいメタデータが利用可能になり、クエリアクセスパターンが変化するにつれて、ユーザーはこれらの開発を反映するためにスキーマを更新したいと考えます。

スキーマ変更を行う際にダウンタイムを避けるために、ユーザーは以下のいくつかのオプションを持っています。

### デフォルト値を使用する {#use-default-values}

カラムに [`DEFAULT` 値](/sql-reference/statements/create/table#default)を使ってスキーマに追加できます。INSERT 時に指定されていない場合は、指定されたデフォルトが使用されます。

スキーマ変更は、これらの新しいカラムが送信される原因となる、マテリアライズドビューの変換ロジックや OTel コレクタ構成を変更する前に行うことができます。

スキーマが変更された後、ユーザーは OTel コレクタを再構成できます。"Extracting structure with SQL"（[こちら](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照）で説明されている推奨プロセスを使用している場合、OTel コレクタは、ターゲットスキーマを抽出し、その結果をストレージ用のターゲットテーブルに送信する責任を持つマテリアライズドビューに Null テーブルエンジンにデータを送信します。このビューは、[`ALTER TABLE ... MODIFY QUERY` 構文](/sql-reference/statements/alter/view)を使用して変更することができます。次のように、OTel 構造化ログからターゲットスキーマを抽出するための対応するマテリアライズドビューを持つターゲットテーブルを仮定します。

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

LogAttributes から新しいカラム `Size` を抽出したい場合、デフォルト値を指定して `ALTER TABLE` でスキーマに追加できます。

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、デフォルトを `LogAttributes` の `size` キーとして指定しています（存在しない場合は 0 になります）。これは、値が挿入されていない行のクエリでは、アクセスする必要があるため、Map にアクセスしあます。そのため、遅くなります。また、定数（例えば 0）として指定することで、値がない行に対する subsequent クエリのコストを削減することができます。このテーブルをクエリすると、Map から期待通りに値が populated されていることが示されます。

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

すべての将来のデータに対してこの値が挿入されることを保証するために、次のように `ALTER TABLE` 構文を使用してマテリアライズドビューを修正できます。

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
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300,                 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

以降の行は、挿入時に `Size` カラムに値が populate されます。

### 新しいテーブルを作成する {#create-new-tables}

上記のプロセスの代わりに、ユーザーは単に新しいターゲットテーブルを新しいスキーマで作成することができます。すべてのマテリアライズドビューは、上記の `ALTER TABLE MODIFY QUERY` を使用して新しいテーブルを使用するように変更することができます。このアプローチにより、ユーザーはテーブルのバージョン管理を行うことができ、例えば `otel_logs_v3` のようにできます。

このアプローチでは、ユーザーはクエリするための複数のテーブルを持つことになります。テーブルを横断してクエリするために、ユーザーはワイルドカードパターンを受け入れる [`merge` 関数](/sql-reference/table-functions/merge) を使用できます。下記は、`otel_logs` テーブルの v2 および v3 をクエリする例です。

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

もし、ユーザーが `merge` 関数を使用せず、複数のテーブルを結合したユーザー向けにテーブルを公開したい場合は、[Merge テーブルエンジン](/engines/table-engines/special/merge)を使用することができます。以下はその例です。

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

新しいテーブルが追加されるたびに、このテーブルは `EXCHANGE` テーブル構文を使用して更新できます。例えば、v4 テーブルを追加するには、新しいテーブルを作成し、前のバージョンと原子性を持って交換することができます。

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
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
```
