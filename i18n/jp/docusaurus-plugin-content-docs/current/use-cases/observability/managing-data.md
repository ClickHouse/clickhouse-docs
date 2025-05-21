---
title: 'データの管理'
description: '可観測性のためのデータの管理'
slug: /observability/managing-data
keywords: ['可観測性', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';



# データの管理

観測のための ClickHouse のデプロイメントは、大規模なデータセットを含むことが不可避であり、これらのデータを管理する必要があります。ClickHouse は、データ管理を助けるためのいくつかの機能を提供しています。

## パーティション {#partitions}

ClickHouse におけるパーティショニングは、カラムまたは SQL 式に基づいてディスク上でデータを論理的に分離することを可能にします。データを論理的に分離することで、各パーティションは独立して操作できるようになり（例えば削除）、これはユーザーがパーティションを移動したり、したがってサブセットを効率的にストレージ階層間で移動できることを意味します。これは、時間に基づいてパーティションを移動したり、[データを有効期限切れにしたり効率的にクラスターから削除する](/sql-reference/statements/alter/partition) ことを可能にします。

パーティショニングは、`PARTITION BY` 句を利用してテーブルを初めて定義する際に指定されます。この句は、任意のカラムに関する SQL 式を含むことができ、その結果が行が送信されるパーティションを決定します。

<Image img={observability_14} alt="パーティション" size="md"/>

データパーツは、ディスク上の各パーティションと論理的に関連付けられており（共通のフォルダ名のプレフィックスを介して）、個別にクエリされることができます。以下の例では、デフォルトの `otel_logs` スキーマは、`toDate(Timestamp)` 式を使用して日ごとにパーティショニングされます。行が ClickHouse に挿入されると、この式は各行に対して評価され、結果のパーティションが存在する場合にそのパーティションにルーティングされます（その日の最初の行の場合は、そのパーティションが作成されます）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

[パーティションに対して多くの操作](/sql-reference/statements/alter/partition) を実行することができ、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラムの操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、変異 [データの変更](/sql-reference/statements/alter/partition#update-in-partition)/[削除](/sql-reference/statements/alter/partition#delete-in-partition)（行ごとに）や、[インデックスのクリア（例：二次インデックス）](/sql-reference/statements/alter/partition#clear-index-in-partition) が含まれます。

例えば、`otel_logs` テーブルが日ごとにパーティショニングされているとします。構造化されたログデータセットで populated されている場合、これは数日間のデータを含むことになります：

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

現在のパーティションを見つけるには、簡単なシステムテーブルクエリを使用します：

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

私たちは、より古いデータを保存するために使用する可能性のある別のテーブル `otel_logs_archive` を持っているかもしれません。データは、このテーブルに効果的に移動することができます（これは単なるメタデータの変更です）。

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

これは、他の技術と対照的であり、他の技術では `INSERT INTO SELECT` の使用と新しいターゲットテーブルへのデータの再書き込みを必要とするでしょう。

:::note パーティションの移動
[テーブル間のパーティションの移動](/sql-reference/statements/alter/partition#move-partition-to-table) には、いくつかの条件が満たされる必要があります。特に、テーブルは同じ構造、パーティションキー、主キー、インデックス/プロジェクションを持たなければなりません。`ALTER` DDL でのパーティションの指定方法に関する詳細なノートは、[ここ](https://clickhouse.com/docs/ja/ru/sql-reference/statements/alter/partition/#how-to-set-partition-expression) にあります。
:::

さらに、データはパーティションで効率的に削除することができます。これは、他の技術（ミューテーションや軽量削除）よりもはるかにリソース効率が良く、推奨されるべきです。

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
この機能は、[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) という設定を使用するときに、TTL によって利用されます。詳細については、[TTL を使用したデータ管理](#data-management-with-ttl-time-to-live) を参照してください。
:::


### アプリケーション {#applications}

上記は、データをパーティションごとに効率的に移動および操作する方法を示しています。実際には、ユーザーが可観測性のユースケースにおいてパーティション操作を利用するシナリオは、主に以下の2つです：

- **ティアードアーキテクチャ** - ストレージ層間でデータを移動して（[ストレージ層](#storage-tiers)を参照）、ホットコールドアーキテクチャを構築できるようにします。
- **効率的な削除** - データが指定された TTL に達したとき（[TTL を使用したデータ管理](#data-management-with-ttl-time-to-live)を参照）

これらの詳細を以下で探ります。

### クエリパフォーマンス {#query-performance}

パーティションはクエリパフォーマンスを助けることができますが、これはアクセスパターンに大きく依存します。クエリがごくわずかのパーティション（理想的には1つだけ）をターゲットとすると、パフォーマンスが改善される可能性があります。これは、主キーにパーティショニングキーが含まれておらず、それでフィルタリングしている場合にのみ通常有用です。ただし、多くのパーティションをカバーする必要があるクエリは、パーティショニングが使用されていない場合よりもパフォーマンスが悪化する可能性があります（パーツがより多く存在する可能性があるため）。単一のパーティションをターゲットにする利点は、パーティショニングキーがすでに主キーの早いエントリになっている場合は、さらに目立たなくなるか、存在しない可能性があります。パーティショニングは、各パーティションの値が一意である場合に、[GROUP BY クエリを最適化するため](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)に使用することもできます。しかし、一般的には、ユーザーは主キーが最適化されていることを確認し、アクセスパターンが特定の予測可能なデータのサブセットにアクセスする特例の場合にのみ、クエリ最適化手法としてパーティショニングを考慮するべきです。例えば、日ごとにパーティショニングし、大半のクエリが最後の日に行われるというケースです。詳細は[こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)にあります。

## TTL（有効期限）を用いたデータ管理 {#data-management-with-ttl-time-to-live}

Time-to-Live（TTL）は、ClickHouse によって強化された可観測性ソリューションにおいて、自動的なデータ保持と管理のための重要な機能であり、特に大量のデータが継続的に生成されている場合に重要です。ClickHouse での TTL の実装は、古いデータの自動的な期限切れと削除を可能にし、ストレージが最適に使用され、パフォーマンスが手動介入なしで維持されることを保証します。この機能は、データベースをスリムに保ち、ストレージコストを削減し、最も関連性の高く最近のデータに焦点を当てることで、クエリが速く効率的であることを保証するために不可欠です。さらに、データ保管ポリシーへのコンプライアンスを助けるために、データライフサイクルを体系的に管理し、可観測性ソリューションの全体的な持続可能性とスケーラビリティを向上させます。

TTL は ClickHouseのテーブルレベルまたはカラムレベルで指定できます。

### テーブルレベルの TTL {#table-level-ttl}

ログとトレースのデフォルトスキーマには、指定された期間後にデータの有効期限を切るための TTL が含まれています。これは、ClickHouse エクスポーターの `ttl` キーで指定されます。例えば：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

この構文は現在、[Golang Duration 構文](https://pkg.go.dev/time#ParseDuration)に対応しています。**ユーザーには `h` を使用し、これがパーティショニング周期と一致することを推奨します。例えば、日ごとにパーティショニングする場合、必ず日数の倍数であること（例：24h、48h、72h）を確保してください。** これは自動的に TTL 句がテーブルに追加されることを保証します。例えば、`ttl: 96h` の場合です。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

デフォルトでは、有効期限が切れた TTL を持つデータは、ClickHouse が[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)際に削除されます。ClickHouse がデータが期限切れであると検出すると、予定外のマージが実行されます。

:::note 予定された TTL
TTL は即座に適用されるのではなく、上記のようにスケジュールで適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、delete TTL を伴うマージを繰り返す前の最小遅延を秒単位で設定します。デフォルト値は 14400 秒（4 時間）ですが、これは最小遅延にすぎず、TTL マージがトリガーされるまでに長くかかる場合があります。値が低すぎると、多くの予定外のマージが行われ、リソースを大量に消費する可能性があります。TTL の有効期限を強制するには、`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用します。
:::

**重要：ユーザーには設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を使用することを推奨します。**（デフォルトスキーマによって適用されます）。この設定が有効な際、ClickHouse は全ての行が期限切れとなると、全体のパーツを削除します。部分的なクリーニング TTL-d 行（`ttl_only_drop_parts=0` のときにリソース集約的なミューテーションによって達成されること）の代わりに全体のパーツを削除することで、`merge_with_ttl_timeout` 時間を短縮し、システムパフォーマンスへの影響を低くすることができます。データが TTL 有効期限切れを実行する単位でパーティショニングされる場合（例：日）、パーツは定義されたインターバルのデータのみを含みます。これは `ttl_only_drop_parts=1` を効率的に適用可能にします。

### カラムレベルの TTL {#column-level-ttl}

上記の例は、テーブルレベルでデータが有効期限切れになることを示しています。ユーザーは、カラムレベルでデータを期限切れにすることもできます。データが経年すると、調査の価値がリソースオーバーヘッドを正当化しないカラムを削除するためにこれを使用できます。例えば、新しい動的メタデータが挿入時に抽出されない Kubernetes ラベルのような新しいラベルが追加される可能性があるため、`Body` カラムを保持することを推奨します。一定の期間（例えば、1 か月）の後、この追加メタデータが役に立たないことが明らかになるかもしれず - したがって `Body` カラムを保持する価値を制限することになります。

以下に、`Body` カラムを 30 日後に削除する方法を示します。

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
カラムレベルの TTL を指定するには、ユーザーが自分のスキーマを指定する必要があります。これは OTel コレクターで指定できません。
:::

## データの再圧縮 {#recompressing-data}

通常、私たちは可観測性のデータセットには `ZSTD(1)` を推奨しますが、ユーザーは異なる圧縮アルゴリズムや、より高い圧縮レベル（例えば `ZSTD(3)`）を試すことができます。これは、スキーマ作成時に指定できるだけでなく、設定された期間の後に変更されるように構成できます。これは、コーデックまたは圧縮アルゴリズムが圧縮を改善するが、クエリパフォーマンスが低下する場合に適切かもしれません。このトレードオフは、あまり頻繁にクエリされない古いデータには許容される場合がありますが、最近のデータには許可されないかもしれません。これは、調査においてより頻繁に使用されるからです。

以下に、データを 4 日後に `ZSTD(3)` を使用して圧縮する例を示します。

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

:::note パフォーマンスの評価
ユーザーには異なる圧縮レベルとアルゴリズムのインサート及びクエリパフォーマンスへの影響を常に評価することを推奨します。例えば、デルタコーデックはタイムスタンプの圧縮に役立ちます。しかし、これらが主キーの一部である場合、フィルタリングパフォーマンスが低下する可能性があります。
:::

TTL の構成に関するさらなる詳細や例については、[こちら](https://clickhouse.com/docs/ja/ru/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)を参照してください。テーブルやカラムに対して TTL を追加したり変更する方法에 대한 예와 동일한例については、[こちら](https://clickhouse.com/docs/ja/ru/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)をご覧ください。TTL がホット-ウォームアーキテクチャといったストレージ階層を可能にする方法については、[ストレージ層](#storage-tiers)を参照してください。

## ストレージ層 {#storage-tiers}

ClickHouse では、ユーザーが異なるディスクにストレージ層を作成できます。例えば、最近のデータを SSD に、古いデータを S3 にバックアップします。このアーキテクチャは、調査における稀な使用のために、古いデータのために低コストのストレージを使用することを可能にします。

:::note ClickHouse Cloud には関連しない
ClickHouse Cloud は、S3 にバックアップされているデータの単一コピーを使用し、SSD にバックアップされたノードキャッシュを使用します。したがって、ClickHouse Cloud ではストレージ層が必要ありません。
:::

ストレージ層を作成するには、ユーザーがディスクを作成し、その後ストレージポリシーを策定する必要があります。この際、テーブル作成中にボリュームが指定されます。データは、充填率、パーツのサイズ、ボリュームの優先度に応じて、ディスク間で自動的に移動されます。さらなる詳細は、[こちら](https://clickhouse.com/docs/ja/ru/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)を参照してください。

データは、`ALTER TABLE MOVE PARTITION` コマンドを使用して手動でディスク間で移動できますが、ボリューム間のデータの移動も TTL によって制御できます。完全な例は[こちら](https://clickhouse.com/docs/ja/ru/guides/developer/ttl#implementing-a-hotwarmcold-architecture)に見つかります。

## スキーマ変更の管理 {#managing-schema-changes}

ログとトレースのスキーマは、ユーザーが異なるメタデータやポッドラベルを監視する新しいシステムを監視する過程で、システムの生涯を通じて必然的に変化します。OTel スキーマを使用してデータを生成し、元のイベントデータを構造化された形式でキャプチャすることにより、ClickHouse のスキーマはこれらの変更に耐障害性を持ちます。しかし、新しいメタデータが利用可能になり、クエリアクセスパターンが変わるにつれて、ユーザーはこれらの発展を反映するためにスキーマを更新したくなるでしょう。

スキーマ変更中にダウンタイムを回避するために、ユーザーにはいくつかのオプションがあります。以下に示します。

### デフォルト値を使用する {#use-default-values}

カラムは、[`DEFAULT`](https://clickhouse.com/docs/ja/ru/sql-reference/statements/create/table#default) 値を使用してスキーマに追加できます。指定されたデフォルト値は、INSERT 時に指定されない場合に使用されます。

スキーマの変更は、これらの新しいカラムが送信される原因となる、いかなるマテリアライズドビューの変換ロジックや OTel コレクターの構成を修正する前に行うことができます。

スキーマが変更されると、ユーザーは OTel コレクターを再構成することができます。ユーザーが、OTel コレクターが Null テーブルエンジンにデータを送信し、マテリアライズドビューがターゲットスキーマを抽出し、その結果をターゲットテーブルに保存する責任を持つという、["SQL で構造を抽出する"（Extracting Structure with SQL）で概説された推奨プロセス](https://clickhouse.com/docs/ja/ru/docs/use-cases/observability/schema-design#extracting-structure-with-sql)を使用していると仮定します。ターゲットテーブルのスキーマ抽出元の OTel 構造化ログから：

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

`LogAttributes` から新しいカラム `Size` を抽出したいとします。この新しいカラムをテーブルに追加するために、`ALTER TABLE` でデフォルト値を指定して追加します。

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、デフォルトを `LogAttributes` の `size` キーとして指定します（存在しない場合は 0 になります）。これは、このカラムの値が挿入されていない行に対してアクセスすると、Map にアクセスする必要があり、そのためクエリが遅くなります。この値を定数（例：0）として指定することも可能で、値が挿入されていない行に対するクエリのコストを減少させることができます。このテーブルをクエリすると、値が期待どおりに Map から populated されていることが示されます：

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

今後のデータの挿入時にこの値が確実に挿入されるように、次のようにマテリアライズドビューを修正できます：

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

以降の行には、新しいカラム `Size` が挿入時に populated されるようになります。

### 新しいテーブルを作成する {#create-new-tables}

上記のプロセスの代わりに、ユーザーは新しいスキーマを持つ新しいターゲットテーブルを単純に作成することができます。すべてのマテリアライズドビューは、新しいテーブルを使用するように、上記の `ALTER TABLE MODIFY QUERY` を使用して変更できます。このアプローチは、ユーザーがテーブルのバージョンを管理することを可能にします（例：`otel_logs_v3`）。

このアプローチを使用すると、ユーザーは複数のテーブルをクエリすることになります。テーブルを跨いでクエリするには、[`merge` 関数](/sql-reference/table-functions/merge)を使って、テーブル名のワイルドカードパターンを受け入れることができます。以下に、`otel_logs` テーブルの v2 と v3 をクエリする例を示します：

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

ユーザーが `merge` 関数を使用せずに、複数のテーブルを結合するテーブルをエンドユーザーに公開したい場合、[Merge テーブルエンジン](/engines/table-engines/special/merge)を使用できます。以下にこの例を示します：

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

新しいテーブルが追加されるたびに、`EXCHANGE` テーブル構文を使ってこのテーブルを更新できます。例えば、v4 テーブルを追加するために新しいテーブルを作成し、これを前のバージョンと原子的に交換します。

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
