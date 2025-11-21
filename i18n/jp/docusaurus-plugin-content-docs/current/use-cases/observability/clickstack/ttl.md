---
slug: /use-cases/observability/clickstack/ttl
title: 'TTL の管理'
sidebar_label: 'TTL の管理'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した TTL 管理'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'データ保持', 'ライフサイクル', 'ストレージ管理']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


## ClickStackにおけるTTL {#ttl-clickstack}

Time-to-Live(TTL)は、膨大な量のデータが継続的に生成される環境において、効率的なデータ保持と管理を実現するClickStackの重要な機能です。TTLにより古いデータの自動的な期限切れと削除が可能になり、手動介入なしでストレージが最適に使用され、パフォーマンスが維持されます。この機能は、データベースを軽量に保ち、ストレージコストを削減し、最も関連性の高い最新のデータに焦点を当てることでクエリを高速かつ効率的に保つために不可欠です。さらに、データライフサイクルを体系的に管理することで、データ保持ポリシーへの準拠を支援し、オブザーバビリティソリューション全体の持続可能性とスケーラビリティを向上させます。

**デフォルトでは、ClickStackはデータを3日間保持します。これを変更するには、["TTLの変更"](#modifying-ttl)を参照してください。**

TTLはClickHouseのテーブルレベルで制御されます。例えば、ログのスキーマは以下の通りです:

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

ClickHouseのパーティショニングは、カラムまたはSQL式に従ってディスク上でデータを論理的に分離することを可能にします。データを論理的に分離することで、各パーティションは独立して操作できます。例えば、TTLポリシーに従って期限切れになった際に削除することができます。

上記の例に示されているように、パーティショニングは`PARTITION BY`句を使用してテーブルが最初に定義される際に指定されます。この句には任意のカラムに対するSQL式を含めることができ、その結果によって行がどのパーティションに送られるかが決定されます。これにより、データはディスク上の各パーティションと(共通のフォルダ名プレフィックスを介して)論理的に関連付けられ、個別にクエリを実行できるようになります。上記の例では、デフォルトの`otel_logs`スキーマは`toDate(Timestamp)`という式を使用して日単位でパーティション分割されます。行がClickHouseに挿入されると、この式が各行に対して評価され、結果として得られるパーティションが存在する場合はそこにルーティングされます(その日の最初の行である場合は、パーティションが作成されます)。パーティショニングとその他の用途の詳細については、["テーブルパーティション"](/partitions)を参照してください。

<Image img={observability_14} alt='Partitions' size='lg' />


テーブルスキーマには、`TTL TimestampTime + toIntervalDay(3)` と `ttl_only_drop_parts = 1` の設定も含まれます。前者の指定により、データは 3 日を経過すると削除されます。`ttl_only_drop_parts = 1` の設定は、（行を部分的に削除しようとするのではなく）すべてのデータが期限切れとなったデータパーツのみを削除対象とすることを強制します。パーティション分割によって別々の日付のデータが決して「マージ」されないようにすることで、データを効率的に削除できます。 

:::important `ttl_only_drop_parts`
設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を常に使用することを推奨します。この設定が有効な場合、ClickHouse は、その中のすべての行が期限切れになったときに、そのパーツ全体を削除します。`ttl_only_drop_parts=0` の場合にリソース集約的な mutation によって実現される、TTL 対象行の部分的なクリーンアップではなく、パーツ全体を削除することで、`merge_with_ttl_timeout` の時間を短く保ち、システムパフォーマンスへの影響を抑えることができます。データが TTL 期限切れ処理を行う単位、例えば日単位でパーティション分割されている場合、各パーツは自然とその定義された間隔のデータだけを含むようになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できるようになります。
:::

デフォルトでは、TTL が期限切れになったデータは、ClickHouse が[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)ときに削除されます。ClickHouse がデータの期限切れを検出すると、スケジュール外のマージを実行します。

:::note TTL schedule
TTL は即座には適用されず、上記のとおりスケジュールに従って適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、削除 TTL を伴うマージを繰り返すまでの最小遅延時間（秒）を設定します。デフォルト値は 14400 秒（4 時間）です。ただし、これはあくまで最小遅延であり、TTL マージがトリガーされるまでにさらに時間がかかる可能性があります。値が低すぎると、多数のスケジュール外マージが実行され、多くのリソースを消費するおそれがあります。TTL の期限切れ処理は、`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用して強制的に実行することができます。
:::



## TTLの変更 {#modifying-ttl}

TTLを変更するには、次のいずれかの方法を使用します:

1. **テーブルスキーマを変更する(推奨)**。[clickhouse-client](/interfaces/cli)や[Cloud SQLコンソール](/cloud/get-started/sql-console)などを使用してClickHouseインスタンスに接続する必要があります。例えば、次のDDLを使用して`otel_logs`テーブルのTTLを変更できます:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTelコレクターを変更する**。ClickStack OpenTelemetryコレクターは、テーブルが存在しない場合にClickHouseにテーブルを作成します。これはClickHouseエクスポーターを介して実現され、デフォルトのTTL式を制御するための`ttl`パラメータが公開されています。例:

```yaml
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    ttl: 72h
```

### カラムレベルのTTL {#column-level-ttl}

上記の例では、テーブルレベルでデータを期限切れにしています。カラムレベルでもデータを期限切れにすることができます。データが古くなるにつれて、調査における価値が保持に必要なリソースオーバーヘッドを正当化しないカラムを削除するために使用できます。例えば、挿入時に抽出されていない新しい動的メタデータ(新しいKubernetesラベルなど)が追加される場合に備えて、`Body`カラムを保持することを推奨しています。一定期間(1ヶ月など)経過後、この追加メタデータが有用でないことが明らかになる場合があり、その結果`Body`カラムを保持する価値が限定的になります。

以下に、30日後に`Body`カラムを削除する方法を示します。

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
カラムレベルのTTLを指定するには、独自のスキーマを指定する必要があります。これはOTelコレクターでは指定できません。
:::
