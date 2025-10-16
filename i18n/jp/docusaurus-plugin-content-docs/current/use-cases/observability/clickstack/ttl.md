---
'slug': '/use-cases/observability/clickstack/ttl'
'title': 'TTLの管理'
'sidebar_label': 'TTLの管理'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackを使用したTTLの管理'
'doc_type': 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## TTL in ClickStack {#ttl-clickstack}

Time-to-Live (TTL) は、ClickStackにおいて効率的なデータ保持と管理のための重要な機能です。特に、大量のデータが継続的に生成されるため、TTL は自動的に古いデータを期限切れにして削除することを可能にし、ストレージが最適に使用され、パフォーマンスが手動介入なしで維持されることを保証します。この機能は、データベースをスリムに保ち、ストレージコストを削減し、最も関連性の高い最近のデータに焦点を当てることでクエリが迅速かつ効率的であることを確保するために不可欠です。さらに、データライフサイクルを体系的に管理することでデータ保持ポリシーの遵守を助け、観測ソリューションの全体的な持続可能性とスケーラビリティを向上させます。

**デフォルトでは、ClickStack はデータを3日間保持します。これを変更するには、["Modifying TTL"](#modifying-ttl) を参照してください。**

TTL は ClickHouse のテーブルレベルで制御されます。例えば、ログのスキーマは以下のように示されています：

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

ClickHouse のパーティショニングにより、カラムや SQL 式に基づいてディスク上でデータを論理的に分離できます。データを論理的に分離することで、各パーティションは独立して操作でき、例えば、TTL ポリシーに基づいて期限切れの際に削除することができます。

上記の例に示されているように、パーティショニングはテーブルが初めて定義される際に `PARTITION BY` 句を使って指定されます。この句は、任意のカラムに対して SQL 式を含むことができ、その結果が行が送られるパーティションを定義します。これにより、データはディスク上の各パーティションと論理的に関連付けられ、独立してクエリを実行できるようになります。上記の例では、デフォルトの `otel_logs` スキーマは、`toDate(Timestamp)` 式を使用して日単位でパーティショニングを行っています。データが ClickHouse に挿入されると、この式は各行に対して評価され、存在する場合は結果のパーティションにルーティングされます（その日が初めての行である場合、パーティションが作成されます）。パーティショニングとその他の応用についての詳細は、["Table Partitions"](/partitions) を参照してください。

<Image img={observability_14} alt="Partitions" size="lg"/>

テーブルスキーマには `TTL TimestampTime + toIntervalDay(3)` と設定 `ttl_only_drop_parts = 1` も含まれています。前者の句は、データが3日を超えると削除されることを保証します。設定 `ttl_only_drop_parts = 1` は、すべてのデータが期限切れになったデータパーツのみを削除することを強制します（部分的に行を削除しようとするのではなく）。パーティショニングにより異なる日のデータが決して「マージ」されないため、データは効率的に削除できます。

:::important `ttl_only_drop_parts`
設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を使用することを常に推奨します。この設定が有効な場合、ClickHouse はすべての行が期限切れになった際に全体のパートを削除します。部分的に TTL が期限切れの行を削除する代わりに全体のパートを削除すること（`ttl_only_drop_parts=0` の場合にリソース集約的な変更を通じて達成されます）は、短い `merge_with_ttl_timeout` 時間を持ち、システムパフォーマンスへの影響を軽減します。データが TTL 期限切れを実行する単位（例えば日）でパーティション化されている場合、パーツは自ずと定義されたインターバルのデータのみを含むことになります。これにより `ttl_only_drop_parts=1` を効率的に適用できるようになります。
:::

デフォルトでは、期限切れの TTL を持つデータは ClickHouse が [データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) ときに削除されます。 ClickHouse がデータが期限切れであることを検知すると、予定外のマージを実行します。

:::note TTL schedule
TTL は即座に適用されるのではなく、上記のようにスケジュールに従って適用されます。MergeTree テーブル設定の `merge_with_ttl_timeout` は、削除 TTL でマージを繰り返す前の最小遅延（秒単位）を設定します。デフォルト値は 14400 秒（4 時間）です。しかし、これは最小遅延に過ぎず、TTL マージがトリガーされるまでにより長くかかることがあります。値が低すぎると、多くの予定外のマージが実行され、リソースを大量に消費する可能性があります。TTL 期限切れは、コマンド `ALTER TABLE my_table MATERIALIZE TTL` を使用して強制することができます。
:::

## Modifying TTL {#modifying-ttl}

TTL を変更するには、ユーザーは以下のいずれかを行います：

1. **テーブルスキーマを変更する（推奨）**。これには、[clickhouse-client](/interfaces/cli) または [Cloud SQL Console](/cloud/get-started/sql-console) を使用して ClickHouse インスタンスに接続する必要があります。例えば、次の DDL を使用して `otel_logs` テーブルの TTL を変更できます：

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTel コレクタを変更する**。ClickStack OpenTelemetry コレクタは、存在しない場合に ClickHouse にテーブルを作成します。これは、デフォルト TTL 式を制御するために使用される `ttl` パラメータを持つ ClickHouse エクスポーターを介して実現されます。例えば：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### Column level TTL {#column-level-ttl}

上記の例は、テーブルレベルでデータを期限切れにします。ユーザーはカラムレベルでもデータを期限切れにすることができます。データが古くなると、調査においてその価値がリソースのオーバーヘッドに見合わないカラムを削除するためにこれを使用できます。例えば、挿入時に抽出されていない新しい動的メタデータが追加された場合に備えて、`Body` カラムを保持することを推奨します。例えば、Kubernetes の新しいラベルなどです。期間が経過した後（例：1か月後）、この追加のメタデータが役に立たないことが明らかになるかもしれず、したがって `Body` カラムを保持することの意味が限られてきます。

以下に、`Body` カラムを30日後に削除する方法を示します。

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
カラムレベルの TTL を指定するには、ユーザーが自分のスキーマを指定する必要があります。これは OTel コレクタ内では指定できません。
:::
