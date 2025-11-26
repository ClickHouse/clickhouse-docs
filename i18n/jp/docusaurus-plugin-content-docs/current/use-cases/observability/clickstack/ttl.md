---
slug: /use-cases/observability/clickstack/ttl
title: 'TTL の管理'
sidebar_label: 'TTL の管理'
pagination_prev: null
pagination_next: null
description: 'ClickStack での TTL 管理'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'データ保持', 'ライフサイクル', 'ストレージ管理']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


## ClickStack における TTL

Time-to-Live (TTL) は、特に膨大なデータが継続的に生成される環境において、効率的なデータ保持と管理のために ClickStack で極めて重要な機能です。TTL により、古くなったデータを自動的に期限切れとして削除できるため、ストレージを最適に活用しつつ、手動の介入なしにパフォーマンスを維持できます。この機能は、データベースをスリムに保ち、ストレージコストを削減し、最も関連性が高く最新のデータを対象とすることでクエリを高速かつ効率的に保つうえで不可欠です。さらに、データのライフサイクルを体系的に管理することでデータ保持ポリシーへの準拠を支援し、オブザーバビリティソリューション全体の持続可能性とスケーラビリティを向上させます。

**ClickStack はデフォルトでデータを 3 日間保持します。これを変更するには、[「TTL の変更」](#modifying-ttl) を参照してください。**

TTL は ClickHouse ではテーブルレベルで制御されます。たとえば、ログ用のスキーマは次のとおりです。

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

ClickHouse におけるパーティショニングは、ディスク上のデータを、あるカラムまたは SQL 式に従って論理的に分割する仕組みです。データを論理的に分割することで、各パーティションを独立して操作できるようになります。例えば、TTL ポリシーに従って有効期限を迎えたタイミングで削除するといった操作が可能です。

上記の例に示すように、パーティショニングはテーブルを定義する際に `PARTITION BY` 句で指定します。この句には任意のカラムに対する SQL 式を含めることができ、その結果によって各行がどのパーティションに格納されるかが決まります。これにより、ディスク上の各パーティションは（共通のフォルダ名プレフィックスを通じて）論理的にデータと関連付けられ、個別にクエリできます。上記の例では、デフォルトの `otel_logs` スキーマは `toDate(Timestamp)` 式を使って日単位でパーティショニングしています。行が ClickHouse に挿入されると、この式が各行に対して評価され、対応するパーティションが存在する場合はそこにルーティングされます（その日最初の行であれば、新しいパーティションが作成されます）。パーティショニングの詳細およびその他の用途については、[&quot;Table Partitions&quot;](/partitions) を参照してください。

<Image img={observability_14} alt="パーティション" size="lg" />


テーブルスキーマには `TTL TimestampTime + toIntervalDay(3)` と `ttl_only_drop_parts = 1` の設定も含まれています。前者の指定により、データは 3 日より古くなった時点で削除されます。`ttl_only_drop_parts = 1` の設定は、（行を部分的に削除しようとするのではなく）すべてのデータが期限切れになったデータパーツだけを削除することを強制します。パーティション分割によって異なる日のデータが決して「マージ」されないようにすることで、データを効率的に削除できます。 

:::important `ttl_only_drop_parts`
[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) の設定を常に使用することを推奨します。この設定が有効な場合、ClickHouse は、その中のすべての行が期限切れになったときにパーツ全体を削除します。部分的な TTL 対応クリーンアップ（`ttl_only_drop_parts=0` のときにリソース集約的な mutation によって実現）ではなくパーツ全体を削除することで、`merge_with_ttl_timeout` をより短くでき、システムパフォーマンスへの影響を低減できます。データが TTL 期限切れ処理を行う単位（例: 日）でパーティション分割されている場合、パーツには自然と定義された間隔のデータのみが含まれるようになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できるようになります。
:::

デフォルトでは、TTL が期限切れになったデータは、ClickHouse が[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)際に削除されます。ClickHouse がデータの期限切れを検知すると、スケジュール外のマージを実行します。

:::note TTL schedule
TTL は即時には適用されず、前述のとおりスケジュールに従って適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、削除 TTL 付きマージを再実行するまでの最小遅延時間（秒）を設定します。デフォルト値は 14400 秒（4 時間）です。ただし、これはあくまで最小遅延であり、TTL マージがトリガーされるまでにさらに時間がかかる場合があります。この値が小さすぎると、リソースを大量に消費しうるスケジュール外マージが多数実行されることになります。TTL の期限切れ適用は、`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用して強制的に実行できます。
:::



## TTL の変更

TTL を変更するには、次のいずれかの方法があります。

1. **テーブルのスキーマを変更する（推奨）**。これには、[clickhouse-client](/interfaces/cli) や [Cloud SQL Console](/cloud/get-started/sql-console) などを使用して ClickHouse インスタンスに接続する必要があります。たとえば、次の DDL を使用して `otel_logs` テーブルの TTL を変更できます。

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTel collector を変更する**。ClickStack OpenTelemetry collector は、テーブルが存在しない場合は ClickHouse 内にテーブルを作成します。これは ClickHouse exporter によって行われ、exporter 自体がデフォルトの TTL 式を制御するために使用される `ttl` パラメータを公開しています。例:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### 列レベルの TTL

上記の例では、テーブルレベルでデータの有効期限を設定しています。ユーザーは列レベルでも有効期限を設定できます。データが古くなるにつれ、調査時の有用性に対して保持のためのリソースコストが見合わない列を削除するために利用できます。たとえば、挿入時にまだ抽出されていない新しい動的メタデータ（例：新しい Kubernetes ラベル）が追加される可能性に備えて、`Body` 列を保持しておくことを推奨します。一定期間、例えば 1 か月が経過すると、この追加メタデータが有用でないことが明らかになる場合があり、その場合は `Body` 列を保持し続ける価値は限定的です。

以下に、`Body` 列を 30 日経過後に削除する方法を示します。

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
列レベルの TTL を設定するには、ユーザー自身でスキーマを定義する必要があります。これは OTel collector では指定できません。
:::
