---
slug: /use-cases/observability/clickstack/ttl
title: 'TTL管理'
sidebar_label: 'TTL管理'
pagination_prev: null
pagination_next: null
description: 'ClickStack における TTL 管理'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'data retention', 'lifecycle', 'storage management']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## ClickStack における TTL {#ttl-clickstack}

Time-to-Live (TTL) は、特に膨大な量のデータが継続的に生成される状況において、効率的なデータ保持と管理を行うために ClickStack で極めて重要な機能です。TTL により、古いデータを自動的に期限切れとして扱い、自動的に削除できるため、ストレージを最適に活用しつつ、手動での介入なしにパフォーマンスを維持できます。この機能は、データベースをスリムに保ち、ストレージコストを削減し、最も関連性が高く最新のデータにクエリ対象を絞ることで、高速かつ効率的なクエリを実現するうえで不可欠です。さらに、データライフサイクルを体系的に管理することでデータ保持ポリシーへの準拠を支援し、オブザーバビリティソリューション全体の持続可能性とスケーラビリティを高めます。

**デフォルトでは、ClickStack はデータを 3 日間保持します。これを変更するには、[「TTL の変更」](#modifying-ttl) を参照してください。**

TTL は ClickHouse においてテーブル単位で制御されます。例えば、ログ用テーブルのスキーマは次のとおりです。

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TimestampTime` DateTime DEFAULT toDateTime(Timestamp),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt8,
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` UInt8,
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(TimestampTime)
PRIMARY KEY (ServiceName, TimestampTime)
ORDER BY (ServiceName, TimestampTime, Timestamp)
TTL TimestampTime + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

ClickHouse におけるパーティション分割は、ディスク上のデータを列または SQL 式に従って論理的に分離する機能です。データを論理的に分離することで、各パーティションを独立して操作でき、たとえば TTL ポリシーに従って有効期限に達したときに削除するといったことが可能になります。

上記の例に示されているように、パーティション分割はテーブルを最初に定義するときに `PARTITION BY` 句によって指定します。この句には任意のカラムに対する SQL 式を含めることができ、その評価結果に基づいて各行がどのパーティションに送られるかが決まります。これにより、ディスク上では各パーティションごとに共通のフォルダ名プレフィックスを通じてデータが論理的に関連付けられ、パーティション単位で個別にクエリを実行できるようになります。上記の例では、デフォルトの `otel_logs` スキーマは `toDate(Timestamp)` という式を用いて日単位でパーティション分割を行います。行が ClickHouse に挿入されると、この式が各行に対して評価され、該当するパーティションが存在すればそこにルーティングされます（その日付の行が初めての場合は、新しいパーティションが作成されます）。パーティション分割およびその他の用途の詳細については、「[Table Partitions](/partitions)」を参照してください。

<Image img={observability_14} alt="パーティション" size="lg" />

テーブルスキーマには、`TTL TimestampTime + toIntervalDay(3)` と `ttl_only_drop_parts = 1` の設定も含まれます。前者の設定により、データは 3 日を経過すると削除されます。`ttl_only_drop_parts = 1` の設定は、そのパーツ内のすべてのデータが有効期限切れになった場合にのみ、そのパーツを削除することを強制します（行を部分的に削除しようとしない）。日単位でデータが「マージ」されないようにパーティション分割しておくことで、データを効率的に削除できます。

:::important `ttl_only_drop_parts`
設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を常に使用することを推奨します。この設定が有効な場合、ClickHouse は、そのパーツ内のすべての行が有効期限切れになったときに、そのパーツ全体を削除します。パーツ全体を削除する方式は、`ttl_only_drop_parts=0` の場合にリソース集約的な mutation によって行われる、TTL 対象行の部分的なクリーンアップと比べて、`merge_with_ttl_timeout` の時間を短くでき、システムパフォーマンスへの影響も小さくできます。TTL で期限切れを設定している単位（例: 日）と同じ単位でデータをパーティション分割していれば、パーツには自然と定義された区間のデータのみが含まれるようになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できます。
:::

デフォルトでは、TTL が期限切れになったデータは、ClickHouse が[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)際に削除されます。ClickHouse がデータの有効期限切れを検知すると、スケジュール外のマージを実行します。

:::note TTL schedule
TTL は即座には適用されず、上記のとおりスケジュールに従って適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、削除 TTL を伴うマージを再実行するまでの最小遅延時間（秒）を設定します。デフォルト値は 14400 秒（4 時間）です。しかしこれはあくまで最小遅延であり、TTL マージがトリガーされるまでにさらに時間がかかる場合があります。値が小さすぎると、リソースを多く消費するスケジュール外マージが多数発生します。TTL の期限切れは、コマンド `ALTER TABLE my_table MATERIALIZE TTL` を使って強制的に実行できます。
:::

## TTL の変更 {#modifying-ttl}

TTL を変更するには、次のいずれかの方法があります。

1. **テーブルのスキーマを変更する（推奨）**。これには、[clickhouse-client](/interfaces/cli) や [Cloud SQL Console](/cloud/get-started/sql-console) などを使用して ClickHouse インスタンスに接続する必要があります。たとえば、次の DDL を使用して `otel_logs` テーブルの TTL を変更できます。

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTel collector を変更する**。ClickStack OpenTelemetry collector は、存在しない場合に ClickHouse 内にテーブルを自動作成します。これは ClickHouse exporter によって実現されており、デフォルトの TTL 式を制御するために使用できる `ttl` パラメータを公開しています。例:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### カラムレベルの TTL {#column-level-ttl}

上記の例では、テーブルレベルでデータの有効期限を設定しています。データの有効期限は、カラムレベルでも設定できます。データが古くなるにつれて、調査における有用性に対して、保持に必要なリソースコストが見合わなくなったカラムを削除するために利用できます。たとえば、挿入時にまだ抽出されていない新しい動的メタデータ（例: 新しい Kubernetes ラベル）が追加される可能性を考慮し、`Body` カラムは保持しておくことを推奨します。一方で、一定期間（例: 1 か月）が経過すると、この追加メタデータが有用でないことが明らかになり、`Body` カラムを保持し続ける意義が小さいと判断できる場合があります。

以下では、`Body` カラムを 30 日後に削除する方法を示します。

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
カラムレベルで TTL を指定するには、ユーザー自身で独自のスキーマを定義する必要があります。これは OTel collector からは指定できません。
:::
