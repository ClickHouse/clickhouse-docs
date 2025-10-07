---
'title': 'データ管理'
'description': '可観測性のためのデータ管理'
'slug': '/observability/managing-data'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';



# データ管理

Observability のために ClickHouse をデプロイする場合、大規模なデータセットを管理する必要があります。ClickHouse はデータ管理を支援するためのさまざまな機能を提供しています。

## パーティション {#partitions}

ClickHouse におけるパーティショニングは、カラムや SQL 式に基づいてディスク上でデータを論理的に分けることを可能にします。データを論理的に分けることにより、各パーティションは独立して操作できるため（例えば、削除など）、ユーザーはパーティションを移動させることができ、したがって、サブセットをストレージ階層間で効率的に移動させることができます。また、[データの有効期限切れ・効率的な削除](/sql-reference/statements/alter/partition)が可能です。

パーティショニングは、`PARTITION BY`句を介してテーブルが初めて定義されるときに指定されます。この句には、任意のカラムに対する SQL 式が含まれることができ、その結果に基づいて行がどのパーティションに送られるかが決まります。

<Image img={observability_14} alt="Partitions" size="md"/>

データパーツは、ディスク上で各パーティションに論理的に関連付けられ（共通のフォルダ名接頭辞を介して）、個別にクエリを実行することができます。以下の例では、デフォルトの `otel_logs` スキーマは、`toDate(Timestamp)` 式を使用して日ごとにパーティションを分けています。行が ClickHouse に挿入されると、この式は各行に対して評価され、存在する場合はその結果のパーティションにルーティングされます（その日の初めての行であれば、パーティションが作成されます）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

パーティションに対する[操作の数](/sql-reference/statements/alter/partition)が実行でき、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラム操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、行によるデータの[変更](/sql-reference/statements/alter/partition#update-in-partition)や[削除](/sql-reference/statements/alter/partition#delete-in-partition)、および[インデックスクリアリング（例：セカンダリインデックス）](/sql-reference/statements/alter/partition#clear-index-in-partition)が含まれます。

例えば、`otel_logs` テーブルが日ごとにパーティショニングされていると仮定します。構造化されたログデータセットで populated されている場合、これは数日分のデータを含むことになります。

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

現在のパーティションは簡単なシステムテーブルクエリを使用して見つけることができます。

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

古いデータを保存するために `otel_logs_archive` という別のテーブルがある場合、このテーブルにデータをパーティションごとに効率的に移すことができます（これは単なるメタデータの変更です）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--move data to archive table
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--confirm data has been moved
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

これは、`INSERT INTO SELECT` を使用してデータを新しいターゲットテーブルに書き直さなければならない他の技術とは対照的です。

:::note パーティションの移動
[テーブル間のパーティションの移動](/sql-reference/statements/alter/partition#move-partition-to-table) には、いくつかの条件を満たす必要があります。少なくとも、テーブルは同じ構造、パーティションキー、主キー、およびインデックス/プロジェクションを持たなければなりません。`ALTER` DDL でのパーティションの指定方法に関する詳細なノートは[こちら](/sql-reference/statements/alter/partition#how-to-set-partition-expression)にあります。
:::

さらに、パーティションごとにデータを効率的に削除することができます。これは、代替技術（ミューテーションや軽量削除）よりもはるかにリソース効率が良く、推奨されるべきです。

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
この機能は、設定[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)が使用されるときに TTL によって利用されます。詳細については、[TTL によるデータ管理](#data-management-with-ttl-time-to-live)を参照してください。
:::

### アプリケーション {#applications}

上記は、パーティションごとにデータを効率的に移動し操作する方法を示しています。実際には、ユーザーは Observability のユースケースでパーティション操作を最も頻繁に利用するシナリオは次の 2 つです。

- **階層化アーキテクチャ** - ストレージ階層間でデータを移動する（[ストレージ階層](#storage-tiers)参照）、これによりホット・コールドアーキテクチャを構築できます。
- **効率的な削除** - データが指定された TTL に達したとき（[TTL によるデータ管理](#data-management-with-ttl-time-to-live)参照）

以下でこれらの詳細を探ります。

### クエリパフォーマンス {#query-performance}

パーティションはクエリパフォーマンスを助けることがありますが、これはアクセスパターンに大きく依存します。クエリが数個のパーティション（理想的には 1 つ）のみをターゲットにする場合、パフォーマンスは向上する可能性があります。これは通常、パーティションキーが主キーに含まれておらず、それによってフィルタリングしている場合にのみ有用です。しかし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが悪化することがあります（パーツが増える可能性があるため）。パーティショニングキーがすでに主キーの最初のエントリである場合、単一のパーティションをターゲティングするメリットはさらに小さいか、存在しなくなります。パーティショニングは、各パーティションの値が一意の場合、[GROUP BY クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できます。ただし、一般的にユーザーは主キーが最適化されていることを確認し、アクセスパターンが特定の予測可能なデータのサブセットにアクセスする特例を除いて、クエリ最適化技術としてのパーティショニングを検討すべきです。例としては、データを日ごとにパーティショニングし、大半のクエリが前日内である場合などです。この振る舞いの例については[こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)を参照してください。

## TTL（Time-to-Live）によるデータ管理 {#data-management-with-ttl-time-to-live}

Time-to-Live (TTL) は、ClickHouse による Observability ソリューションでの効率的なデータ保持と管理にとって重要な機能です。特に、大量のデータが継続的に生成されるため、TTL の実装により古いデータの自動的な期限切れと削除が可能になり、ストレージが最適に使用され、手動介入なしにパフォーマンスが維持されます。この機能は、データベースをスリムに保つため、ストレージコストを削減し、クエリが最も関連性が高く最近のデータに焦点を当てることにより高速かつ効率的であることを保証します。さらに、データライフサイクルを体系的に管理することにより、データ保持ポリシーの遵守に役立ち、Observability ソリューションの全体的な持続可能性とスケーラビリティの向上に寄与します。

TTL は、ClickHouse ではテーブルレベルまたはカラムレベルで指定できます。

### テーブルレベル TTL {#table-level-ttl}

ログおよびトレースのデフォルトスキーマには、指定された期間後にデータを期限切れにする TTL が含まれています。これは、ClickHouse エクスポーターの `ttl` キーの下で指定されます。例えば、

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

この構文は現在、[Golang Duration 構文](https://pkg.go.dev/time#ParseDuration)をサポートしています。**ユーザーには `h` を使用し、パーティショニング期間と一致させることを推奨します。例えば、日ごとにパーティショニングする場合は、必ず日数の倍数であること（例：24h、48h、72h）を確認してください。** これにより、自動的に TTL クローズがテーブルに追加されます（例：`ttl: 96h`であれば）。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

デフォルトでは、期限切れの TTL を持つデータは、ClickHouse が[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)際に削除されます。ClickHouse がデータが期限切れであることを検知した場合、スケジュール外でマージを実行します。

:::note スケジュールされた TTL
TTL は直ちには適用されず、上記のようにスケジュールされます。MergeTreeテーブル設定の`merge_with_ttl_timeout`は、削除 TTL でマージを繰り返す前の最小遅延を秒単位で設定します。デフォルト値は 14400 秒（4 時間）です。しかし、これはあくまで最小遅延であり、TTL マージがトリガーされるまでにさらに時間がかかることがあります。値が低すぎると、リソースを多く消費するオフスケジュールマージが行われることになります。`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用して TTL の期限切れを強制することができます。
:::

**重要：設定[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)を使用することを推奨します**（デフォルトスキーマに適用されます）。この設定が有効になると、すべての行が期限切れのパートを削除します。部分クリーニングの TTL-d 行（`ttl_only_drop_parts=0`を使用してリソース集約的なミューテーションを通じて実現）の代わりに全体のパートを削除することで、`merge_with_ttl_timeout` の時間を短縮し、システムパフォーマンスへの影響を軽減できます。データが TTL の期限切れを実行する単位でパーティショニングされている場合（例：日ごと）、パーツは自然に定義された期間のデータのみを含むことになります。これにより、`ttl_only_drop_parts=1` が効率的に適用できるようになります。

### カラムレベル TTL {#column-level-ttl}

上記の例は、テーブルレベルでのデータの有効期限切れを示しています。ユーザーは、カラムレベルでデータを期限切れにすることもできます。データが古くなるにつれて、調査においてその値が保持されるリソースオーバーヘッドを正当化しないカラムを削除するために使用できます。たとえば、新しい動的メタデータが挿入時に抽出されていない場合に備えて `Body` カラムを保持することを推奨します。たとえば、新しい Kubernetes ラベルです。1 か月後には、この追加メタデータが役に立たないことが明らかになるかもしれません - したがって `Body` カラムを保持する価値が制限されることになります。

以下では、`Body` カラムが 30 日後に削除される例を示します。

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
カラムレベルの TTL を指定するには、ユーザーが自分のスキーマを指定する必要があります。これは OTel コレクターで指定することはできません。
:::

## データの再圧縮 {#recompressing-data}

Observability データセットには通常 `ZSTD(1)` を推奨しますが、ユーザーは複数の圧縮アルゴリズムや高い圧縮レベル（例：`ZSTD(3)`）を試すことができます。スキーマ作成時にこれを指定できるだけでなく、設定された期間後に圧縮を変更するように構成することができます。これは、コーデックや圧縮アルゴリズムが圧縮を改善するが、クエリパフォーマンスを悪化させる場合には適切かもしれません。このトレードオフは、頻繁に問い合わせない古いデータには許容されるかもしれませんが、最近のデータには頻繁に使用されるため、許容されないことが多いです。

ここでは、データを 4 日後に `ZSTD(3)` を使用して圧縮する例を示します。

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
ユーザーは、異なる圧縮レベルとアルゴリズムの挿入およびクエリパフォーマンスへの影響を常に評価することを推奨します。例えば、デルタコーデックはタイムスタンプの圧縮に役立ちます。ただし、これらが主キーの一部である場合、フィルタリングのパフォーマンスが悪化する可能性があります。
:::

TTL の設定に関する詳細や例については[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)で確認できます。テーブルやカラムに対して TTL を追加および変更する方法の例については、[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)で確認できます。TTL がホット・ウォームアーキテクチャなどのストレージ階層を有効にする方法については、[ストレージ階層](#storage-tiers)を参照してください。

## ストレージ階層 {#storage-tiers}

ClickHouse では、ユーザーは異なるディスクにストレージ階層を作成できます。例えば、新しいデータを SSD に、古いデータを S3 にバックアップすることができます。このアーキテクチャは古いデータにより安価なストレージを使用でき、調査における使用頻度が低いために高いクエリ SLA を実現します。

:::note ClickHouse Cloud には関連しません
ClickHouse Cloud では、S3 にバックアップされたデータの単一コピーが使用され、SSD バックアップノードキャッシュがあります。したがって、ClickHouse Cloud ではストレージ階層が必要ありません。
:::

ストレージ階層の作成には、ユーザーがディスクを作成し、それを使用してストレージポリシーを策定し、テーブル作成時に指定可能なボリュームを用意する必要があります。データは、充填率やパーツサイズ、ボリュームの優先順位に基づいて自動的にディスク間で移動できます。詳細については[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)で確認できます。

データは手動で `ALTER TABLE MOVE PARTITION` コマンドを使用してディスク間を移動させることができますが、TTL を使ってボリューム間のデータの移動も制御できます。完全な例については[こちら](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)で確認できます。

## スキーマ変更の管理 {#managing-schema-changes}

ログとトレースのスキーマは、ユーザーが異なるメタデータやポッドラベルを持つ新しいシステムを監視する中で、システムのライフサイクル全体で必然的に変更されます。OTel スキーマを用いてデータを生成し、元のイベントデータを構造化された形式でキャプチャすることにより、ClickHouse のスキーマはこれらの変更に対して堅牢です。しかし、新しいメタデータが使用可能になり、クエリアクセスパターンが変わるにつれて、ユーザーはこれらの進展を反映するためにスキーマを更新したいと考えるでしょう。

スキーマ変更中のダウンタイムを避けるために、ユーザーにはいくつかのオプションがあり、以下に示します。

### デフォルト値を使用する {#use-default-values}

カラムは、[`DEFAULT` 値](/sql-reference/statements/create/table#default)を使用してスキーマに追加できます。指定されたデフォルト値は、INSERT 時に指定されていない場合に使用されます。

マテリアライズドビューの変換ロジックまたは OTel コレクターの設定を変更する前にスキーマ変更を行うことができ、これにより新しいカラムを送信できます。

スキーマが変更されたら、ユーザーは OTel コレクターを再構成できます。ユーザーが ["SQL を用いた構造の抽出"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) に記載の推奨手順を使用していると仮定すると、OTel コレクターはデータを Null テーブルエンジンに送信し、マテリアライズドビューがターゲットスキーマを抽出して、ストレージ用のターゲットテーブルに結果を送信する責任を負います。このビューは、[`ALTER TABLE ... MODIFY QUERY` 構文](/sql-reference/statements/alter/view)を使用して変更できます。ターゲットテーブルとその対応するマテリアライズドビュー（"SQL を用いた構造の抽出" で使用されるものに似ています）が以下にあります。

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

`LogAttributes` から新しいカラム `Size` を抽出したい場合、`ALTER TABLE` を使用してこれをスキーマに追加できます。デフォルト値を指定します。

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、`LogAttributes` の `size` キーをデフォルト値として指定しています（存在しない場合は 0 になります）。これは、値が挿入されていない行のこのカラムにアクセスするクエリがマップにアクセスする必要があることを意味し、したがって遅くなります。簡単に0などの定数として指定することもでき、値が挿入されていない行に対するその後のクエリのコストを減らすことができます。このテーブルをクエリすると、値が期待通りにマップから populated されることが示されます。

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

すべての将来のデータにこの値が挿入されることを保証するために、以下のように `ALTER TABLE` 構文を使用してマテリアライズドビューを変更できます。

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

その後の行は、挿入時に `Size` カラムが populated されます。

### 新しいテーブルを作成する {#create-new-tables}

上記のプロセスの代わりに、ユーザーは単に新しいスキーマを持つ新しいターゲットテーブルを作成することができます。その後、上記の `ALTER TABLE MODIFY QUERY` を使用して、新しいテーブルを使用するようにマテリアライズドビューを変更できます。このアプローチにより、ユーザーはテーブルにバージョンを付けることができます（例：`otel_logs_v3`）。

このアプローチでは、ユーザーはクエリするための複数のテーブルを持つことになります。テーブル間をクエリするために、ユーザーはテーブル名のワイルドカードパターンを受け入れる[`merge` 関数](/sql-reference/table-functions/merge)を使用できます。以下に、`otel_logs` テーブルの v2 と v3 をクエリする例を示します。

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

ユーザーが `merge` 関数の使用を避け、複数のテーブルを組み合わせたテーブルをエンドユーザーに公開したい場合は、[Merge テーブルエンジン](/engines/table-engines/special/merge)を使用できます。以下にこれを示します。

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

新しいテーブルが追加されるたびに、`EXCHANGE` テーブル構文を使用してこれを更新できます。たとえば、v4 テーブルを追加するには、新しいテーブルを作成し、前のバージョンと原子的に交換します。

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
