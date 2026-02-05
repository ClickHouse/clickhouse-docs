---
slug: /use-cases/observability/clickstack/performance_tuning
title: 'ClickStack - 性能チューニング'
sidebar_label: '性能チューニング'
description: 'ClickStack（ClickHouse オブザーバビリティスタック）の性能チューニング'
doc_type: 'guide'
keywords: ['clickstack', 'オブザーバビリティ', 'ログ', 'パフォーマンス', '最適化']
---

import BetaBadge from '@theme/badges/BetaBadge';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import trace_filtering from '@site/static/images/clickstack/performance_guide/trace_filtering.png';
import trace_filtering_v2 from '@site/static/images/clickstack/performance_guide/trace_filtering_v2.png';
import select_merge_table from '@site/static/images/clickstack/performance_guide/select_merge_table.png';

import Image from '@theme/IdealImage';


## はじめに \{#introduction\}

このガイドでは、ClickStack に対する最も一般的かつ効果的なパフォーマンス最適化手法に焦点を当てます。これらは、実運用のオブザーバビリティワークロードの大半を最適化するのに十分であり、通常は 1 日あたり数十テラバイト規模のデータまでを対象とします。

最適化手法は意図した順序で提示されており、最も単純かつ効果が高いテクニックから始めて、より高度で専門的なチューニングへと進んでいきます。初期段階の最適化は最初に適用すべきものであり、それ単体でも大きな効果をもたらすことがよくあります。データ量が増加し、ワークロードの要求が厳しくなるにつれて、後半で紹介するテクニックを検討する価値が高まっていきます。

## ClickHouse のコンセプト \{#clickhouse-concepts\}

このガイドで説明する最適化を適用する前に、いくつかの中核的な ClickHouse のコンセプトを理解しておくことが重要です。

ClickStack では、各 **データソースが 1 つ以上の ClickHouse テーブルに直接対応**します。OpenTelemetry を使用する場合、ClickStack はログ、トレース、メトリクスデータを保存するための一連のデフォルトテーブルを作成・管理します。カスタムスキーマを使用していたり、自身でテーブルを管理している場合は、すでにこれらのコンセプトに慣れているかもしれません。一方、OpenTelemetry コレクター経由でデータを送信しているだけの場合、これらのテーブルは自動的に作成され、以下で説明するすべての最適化が適用される対象になります。

| Data type                        | Table                                                                                                                  |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------|
| Logs                             | [otel_logs](/use-cases/observability/clickstack/ingesting-data/schemas#logs)                                          |
| Traces                           | [otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)                                       |
| Metrics (gauges)                 | [otel_metrics_gauge](/use-cases/observability/clickstack/ingesting-data/schemas#gauge)                                 |
| Metrics (sums)                   | [otel_metrics_sum](/use-cases/observability/clickstack/ingesting-data/schemas#sum)                                     |
| Metrics (histogram)              | [otel_metrics_histogram](/use-cases/observability/clickstack/ingesting-data/schemas#histogram)                         |
| Metrics (Exponential histograms) | [otel_metrics_exponentialhistogram](/use-cases/observability/clickstack/ingesting-data/schemas#exponential-histograms) |
| Metrics (summary)                | [otel_metrics_summary](/use-cases/observability/clickstack/ingesting-data/schemas#summary-table)                       |
| Sessions                         | [hyperdx_sessions](/use-cases/observability/clickstack/ingesting-data/schemas#sessions)                                |

テーブルは ClickHouse の [データベース](/sql-reference/statements/create/database) に割り当てられます。デフォルトでは `default` データベースが使用されますが、これは [OpenTelemetry コレクターで変更](/use-cases/observability/clickstack/config#otel-collector) できます。

:::important ログとトレースに注力する
多くの場合、パフォーマンスチューニングはログおよびトレーステーブルに焦点を当てます。メトリクステーブルもフィルタリング向けに最適化できますが、そのスキーマは Prometheus スタイルのワークロード向けに意図的に設計されており、標準的なチャート表示のために変更を必要とすることは通常ありません。対照的に、ログとトレースはより広範なアクセスパターンをサポートするため、チューニングによる恩恵が最も大きくなります。セッションデータは固定されたユーザーエクスペリエンスを持ち、そのスキーマが変更を必要とすることは稀です。
:::

最低限、次の ClickHouse の基本事項を理解しておく必要があります。

| Concept | Description |
|---------|-------------|
| **Tables** | ClickStack のデータソースが基盤となる ClickHouse テーブルにどのように対応しているか。ClickHouse のテーブルは主に [MergeTree](/engines/table-engines/mergetree-family/mergetree) エンジンを使用します。 |
| **Parts** | データが不変のパーツとしてどのように書き込まれ、時間とともにマージされるか。 |
| **Partitions** | パーティションは、テーブルのデータパーツを整理された論理ユニットにグループ化します。これにより管理・クエリ・最適化が容易になります。 |
| **Merges** | パーツ数を減らしてクエリ対象のパーツを小さく保つために、パーツ同士を結合する内部プロセス。クエリパフォーマンスを維持するうえで不可欠です。 |
| **Granules** | ClickHouse がクエリ実行中に読み取りおよびスキップ処理（プルーニング）を行う、最小単位のデータ。 |
| **Primary (ordering) keys** | `ORDER BY` キーが、ディスク上のデータレイアウト、圧縮、およびクエリ時のスキップ処理をどのように決定するか。 |

これらのコンセプトは ClickHouse のパフォーマンスの中核をなします。データがどのように書き込まれるか、ディスク上でどのように構造化されるか、そしてクエリ時に ClickHouse がどれだけ効率的に不要なデータ読み取りをスキップできるかを決定します。このガイドに含まれるあらゆる最適化は、マテリアライズドカラム、スキップ索引、プライマリキー、PROJECTION、materialized view など、これらのコアメカニズムの上に成り立っています。

チューニングを行う前に、次の ClickHouse ドキュメントに目を通すことを推奨します。

- [Creating tables in ClickHouse](/guides/creating-tables) - テーブルの簡単なイントロダクション。
- [Parts](/parts)
- [Partitions](/partitions)
- [Merges](/merges)
- [Primary keys/indexes](/primary-indexes)
- [How ClickHouse stores data: parts and granules](/guides/best-practices/sparse-primary-indexes) - ClickHouse におけるデータ構造とクエリ方法について、granule とプライマリキーを詳しく扱う上級ガイド。
- [MergeTree](/engines/table-engines/mergetree-family/mergetree) - コマンドや内部仕様を理解するのに有用な、MergeTree の詳細なリファレンスガイド。

以下で説明する最適化はすべて、標準的な ClickHouse SQL を使って基盤となるテーブルに直接適用できます。これらは [ClickHouse Cloud SQL console](/integrations/sql-clients/sql-console) からでも、[ClickHouse client](/interfaces/cli) 経由でも実行できます。

## 最適化 1. 頻繁にクエリされる属性をマテリアライズする \{#materialize-frequently-queried-attributes\}

ClickStack ユーザー向けの最初で最もシンプルな最適化は、`LogAttributes`、`ScopeAttributes`、`ResourceAttributes` 内で頻繁にクエリされる属性を特定し、マテリアライズドカラムを使ってそれらをトップレベルのカラムへ昇格させることです。

この最適化だけで、ClickStack デプロイメントを 1 日あたり数十テラバイト規模までスケールさせるには十分であることが多く、より高度なチューニング手法を検討する前に適用すべきです。

### 属性をマテリアライズする理由 \{#why-materialize-attributes\}

ClickStack は、Kubernetes ラベル、サービスメタデータ、カスタム属性といったメタデータを `Map(String, String)` カラムに保存します。これは柔軟性を提供しますが、map のサブキーをクエリする場合、パフォーマンスに大きな影響を与えます。

Map カラムから単一のキーをクエリする場合、ClickHouse はディスクから map カラム全体を読み込む必要があります。map に多くのキーが含まれていると、専用のカラムを読む場合と比べて不要な IO が発生し、クエリが遅くなります。

頻繁にアクセスされる属性をマテリアライズすると、挿入時に値を抽出して独立した通常のカラムとして保存することで、このオーバーヘッドを回避できます。

マテリアライズドカラムは次のような特徴があります:

- 挿入時に自動的に計算される
- INSERT 文で明示的に設定することはできない
- 任意の ClickHouse 式をサポートする
- String から、より効率的な数値型や日付型への型変換を可能にする
- スキップ索引や primary key の利用を有効にする
- map 全体へのアクセスを避けることでディスク読み取りを削減する

:::note
ClickStack は、map から抽出されたマテリアライズドカラムを自動的に検出し、ユーザーが元の属性パスに対してクエリを実行し続けていても、クエリ実行時にそれらを透過的に利用します。
:::

### 例 \{#materialize-column-example\}

Kubernetes メタデータが `ResourceAttributes` に保存される、トレース用の ClickStack のデフォルトスキーマを考えてみましょう。

```sql
CREATE TABLE IF NOT EXISTS otel_traces
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `ParentSpanId` String CODEC(ZSTD(1)),
    `TraceState` String CODEC(ZSTD(1)),
    `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
    `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `Duration` UInt64 CODEC(ZSTD(1)),
    `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `StatusMessage` String CODEC(ZSTD(1)),
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `__hdx_materialized_rum.sessionId` String MATERIALIZED ResourceAttributes['rum.sessionId'] CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_rum_session_id __hdx_materialized_rum.sessionId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1,
    INDEX idx_lower_span_name lower(SpanName) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

ユーザーは、たとえば `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"` のような Lucene 構文を使用してトレースをフィルタリングできます。

<Image img={trace_filtering} size="lg" alt="トレースのフィルタリング" />

すると、次のような SQL 述語になります。

```sql
ResourceAttributes['k8s.pod.name'] = 'checkout-675775c4cc-f2p9c'
```

この処理では Map のキーにアクセスするため、条件に一致する各行について `ResourceAttributes` カラム全体を読み出す必要があります。Map に多くのキーが含まれている場合、そのサイズは非常に大きくなる可能性があります。

この属性に対して頻繁にクエリが実行される場合は、トップレベルのカラムとしてマテリアライズする必要があります。

挿入時にポッド名を抽出するには、マテリアライズドカラムを追加します。

```sql
ALTER TABLE otel_v2.otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

この時点以降に取り込まれる **新規** データでは、ポッド名が専用のカラム `PodName` として保存されます。

ユーザーは Lucene 構文を使って、`PodName:"checkout-675775c4cc-f2p9c"` のようにポッド名を効率的にクエリできます。

<Image img={trace_filtering_v2} size="lg" alt="Trace filtering v2" />

新規に挿入されるデータでは、マップへのアクセス自体が不要になり、I/O を大幅に削減できます。


しかし、たとえユーザーが元の属性パス、例：`ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"` を使ってクエリを実行し続けたとしても、**ClickStack は内部的にそのクエリを書き換え**、マテリアライズされた `PodName` カラムを使用するようにします。つまり、次の述語を用いて実行されます：

```sql
PodName = 'checkout-675775c4cc-f2p9c'
```

これにより、ユーザーはダッシュボード、アラート、保存済みクエリを変更することなく、この最適化のメリットを享受できます。

:::note
デフォルトでは、マテリアライズドカラムは `SELECT *` クエリから除外されます。これは、クエリ結果を常にそのままテーブルに再挿入できるという不変条件を維持するためです。
:::


### 履歴データのマテリアライズ \{#materializing-historical-data\}

マテリアライズドカラムは、そのカラムが作成された後に挿入されたデータに対してのみ自動的に適用されます。既存データについては、マテリアライズドカラムへのクエリは透過的に元のマップからの読み取りにフォールバックします。

履歴データのパフォーマンスが重要な場合は、例えばミューテーションを使用してカラムに対して過去データをバックフィルできます。

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
```

これは既存の[パーツ](/parts)を書き換えてカラムを埋めます。ミューテーションはパーツごとに単一スレッドで実行されるため、大規模なデータセットでは時間がかかることがあります。影響を抑えるために、ミューテーションを特定のパーティションに限定できます：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
IN PARTITION '2026-01-02'
```

ミューテーションの進行状況は、`system.mutations` テーブルなどを使って監視できます。

```sql
SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

対応する Mutation の `is_done = 1` になるまで待ちます。

:::important
Mutation は追加の I/O と CPU のオーバーヘッドを伴うため、必要最小限にとどめるべきです。多くの場合、古いデータは自然にエージングアウトするに任せ、新たに取り込まれるデータに対するパフォーマンス改善だけで十分です。
:::


## 最適化 2. スキップインデックスの追加 \{#adding-skip-indices\}

頻繁にクエリされる属性をマテリアライズした後の次の最適化は、データスキッピングインデックスを追加して、クエリ実行時に ClickHouse が読み取る必要のあるデータ量をさらに削減することです。

スキップインデックスを使用すると、一致する値が存在しないと判断できる場合に、ClickHouse はデータブロック全体のスキャンを回避できます。従来のセカンダリ索引とは異なり、スキップインデックスはグラニュールレベルで動作し、クエリフィルタによってデータセットの大部分が除外される場合に最も効果的です。適切に使用すれば、クエリの意味を変更することなく、高カーディナリティ属性に対するフィルタリングを大幅に高速化できます。

ClickStack のデフォルトの traces スキーマには、スキップインデックスが含まれています。

```sql
CREATE TABLE IF NOT EXISTS otel_traces
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `ParentSpanId` String CODEC(ZSTD(1)),
    `TraceState` String CODEC(ZSTD(1)),
    `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
    `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `Duration` UInt64 CODEC(ZSTD(1)),
    `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `StatusMessage` String CODEC(ZSTD(1)),
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `__hdx_materialized_rum.sessionId` String MATERIALIZED ResourceAttributes['rum.sessionId'] CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_rum_session_id __hdx_materialized_rum.sessionId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1,
    INDEX idx_lower_span_name lower(SpanName) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

これらの索引は、次の 2 つの一般的なパターンに対応します。

* TraceId、セッション識別子、属性キーや値などの高カーディナリティの文字列のフィルタリング
* スパンの継続時間などの数値範囲によるフィルタリング


### ブルームフィルタ \{#bloom-filters\}

Bloom filter 索引は、ClickStack で最も一般的に使用されているスキップ索引の種類です。高いカーディナリティ（典型的には数万以上の異なる値）を持つ文字列カラムに適しています。偽陽性率 0.01、粒度（granularity）1 は、ストレージのオーバーヘッドと効果的なプルーニングとのバランスが取れた、デフォルトとして良好な設定値です。

「Optimization 1」の例を続けると、Kubernetes のポッド名が ResourceAttributes からマテリアライズされていると仮定します。

```sql
ALTER TABLE otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

その後、このカラムに対するフィルター処理を高速化するために、Bloom フィルター型スキップ索引を追加できます。

```sql
ALTER TABLE otel_traces
ADD INDEX idx_pod_name PodName
TYPE bloom_filter(0.01)
GRANULARITY 1
```

追加した後は、スキップ索引をマテリアライズする必要があります。詳しくは[「スキップ索引をマテリアライズする」](#materialize-skip-index)を参照してください。

作成およびマテリアライズが完了すると、ClickHouse は、要求されたポッド名を含まないことが保証されているグラニュール全体をスキップできるようになり、`PodName:"checkout-675775c4cc-f2p9c"` のようなクエリで読み取るデータ量を削減できる可能性があります。

Bloom フィルタは、値の分布が「ある値が比較的少数のパーツにしか現れない」ような場合に最も効果的です。これは、多くの場合、オブザーバビリティ系ワークロードにおいて自然に発生します。このようなワークロードでは、ポッド名、トレース ID、セッション識別子といったメタデータが時間と相関付けられており、その結果、テーブルのソートキーによってクラスタ化される傾向があります。

他のすべてのスキップ索引と同様に、Bloom フィルタは選択的に追加し、実際のクエリパターンに対して検証して、測定可能な効果が得られることを確認する必要があります。詳しくは[「スキップ索引の有効性を評価する」](#evaluating-skip-index-effectiveness)を参照してください。


### Min-max 索引 \{#min-max-indices\}

Minmax 索引は、各 granule ごとに最小値と最大値を保存する、非常に軽量な索引です。特に数値カラムや範囲クエリに対して有効です。すべてのクエリが高速化されるわけではありませんが、コストが低く、数値フィールドに対してはほぼ常に追加する価値があります。

Minmax 索引は、数値が自然な順序で並んでいるか、各パート内で狭い範囲に収まっている場合に最も効果的です。

`SpanAttributes` に対して Kafka のオフセットが頻繁にクエリされると仮定します:

```sql
SpanAttributes['messaging.kafka.offset']
```

この値はマテリアライズして、数値型にキャストできます。

```sql
ALTER TABLE otel_traces
ADD COLUMN KafkaOffset UInt64
MATERIALIZED toUInt64(SpanAttributes['messaging.kafka.offset'])
```

次に、minmax 索引を追加します:

```sql
ALTER TABLE otel_traces
ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1
```

これにより、たとえばコンシューマーラグやリプレイ動作をデバッグする際に、Kafka のオフセット範囲でフィルタリングする場合など、ClickHouse はパーツを効率的にスキップできるようになります。

改めてになりますが、索引を利用可能にするには、事前に [マテリアライズ](#materialize-skip-index) しておく必要があります。


### skip index のマテリアライズ \{#materialize-skip-index\}

skip index を追加しても、新たに取り込まれたデータにのみ適用されます。明示的にマテリアライズするまで、既存データはその索引の恩恵を受けません。

すでに skip index を追加している場合、たとえば次のように追加しているとします：

```sql
ALTER TABLE otel_traces ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1;
```

既存データについては、索引を明示的に構築する必要があります。

```sql
ALTER TABLE otel_traces MATERIALIZE INDEX idx_kafka_offset;
```

:::note[スキップインデックスのマテリアライズ]
スキップインデックスのマテリアライズは、一般的に軽量であり、特に minmax インデックスでは安全に実行できます。大規模なデータセットに対する Bloom filter インデックスの場合、リソース使用量をより適切に制御するために、パーティション単位でマテリアライズする方法を選択することもあります（例えば次のとおりです）。

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE INDEX idx_kafka_offset
IN PARTITION '2026-01-02';
```

:::

skip index の materialize 処理は mutation として実行されます。その進行状況は system テーブルで監視できます。

```sql

SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

該当する mutation の `is_done = 1` になるまで待ちます。

完了したら、索引データが作成されたことを確認します。

```sql
SELECT database, table, name,
       data_compressed_bytes,
       data_uncompressed_bytes,
       marks_bytes
FROM system.data_skipping_indices
WHERE database = 'otel'
  AND table = 'otel_traces'
  AND name = 'idx_kafka_offset';
```

0 以外の値は、INDEX が正常にマテリアライズされていることを示します。

データスキッピングインデックスのサイズはクエリパフォーマンスに直接影響するため、注意が必要です。数十 GB から数百 GB 規模の非常に大きなデータスキッピングインデックスは、クエリ実行中の評価に時間を要するため、その効果が低下したり、場合によってはメリットがなくなったりする可能性があります。

実務上、minmax インデックスは通常非常に小さく評価コストも低いため、ほぼ常に安全にマテリアライズできます。一方で Bloom filter インデックスは、カーディナリティ、グラニュラリティ、偽陽性率に応じて大きく肥大化する可能性があります。

Bloom filter のサイズは、許容する偽陽性率を上げることで削減できます。たとえば、probability パラメータを `0.01` から `0.05` に上げると、より小さく、より高速に評価できるインデックスになりますが、その代わりプルーニングの積極性は下がります。スキップされる granule は少なくなるかもしれませんが、インデックス評価が高速になることで、全体のクエリレイテンシーは改善する可能性があります。

したがって、Bloom filter パラメータのチューニングはワークロード依存の最適化であり、実際のクエリパターンと本番同等のデータ量を用いて検証する必要があります。

データスキッピングインデックスの詳細については、ガイド「[Understanding ClickHouse data skipping indexes.](/optimize/skipping-indexes/examples)」を参照してください。


### スキップインデックスの有効性の評価 \{#evaluating-skip-index-effectiveness\}

スキップインデックスによるプルーニングを評価する最も信頼性の高い方法は、`EXPLAIN indexes = 1` を使用することです。これにより、クエリプランニングの各段階で、どれだけ多くの[パーツ](/parts)と[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)が除外されたかが表示されます。多くの場合、Skip 段階でグラニュール数が大きく減少していることが望ましく、理想的にはプライマリキーによって探索空間がすでに縮小された後でそうなっているのが理想です。スキップインデックスはパーティションのプルーニングとプライマリキーのプルーニングの後に評価されるため、その効果は残っているパーツとグラニュールに対する相対的な削減として測定するのが最適です。

`EXPLAIN` によってプルーニングが発生しているかどうかは確認できますが、全体としての高速化が保証されるわけではありません。スキップインデックスの評価にはコストがかかり、とくにインデックスが大きい場合は顕著です。実際の性能改善を確認するために、インデックスを追加してマテリアライズする前後で必ずクエリのベンチマークを実施してください。

たとえば、デフォルトの Traces スキーマに含まれている TraceId 用のデフォルトの Bloom フィルタスキップインデックスを考えてみます。

```sql
INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1
```

選択性の高いクエリに対してどの程度有効かを確認するには、`EXPLAIN indexes = 1` を使用できます。

```sql
EXPLAIN indexes = 1
SELECT *
FROM otel_v2.otel_traces
WHERE (ServiceName = 'accounting')
  AND (TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974');

ReadFromMergeTree (otel_v2.otel_traces)
Indexes:
  PrimaryKey
    Keys:
      ServiceName
    Parts: 6/18
    Granules: 255/35898
  Skip
    Name: idx_trace_id
    Description: bloom_filter GRANULARITY 1
    Parts: 1/6
    Granules: 1/255
```

このケースでは、まずプライマリキーによるフィルタリングによってデータセットが大きく削減されます（35,898 個の granule から 255 個へ）、その後 Bloom filter によってさらに 1 個の granule（255 分の 1）まで絞り込まれます。これは skip index にとって理想的なパターンです。プライマリキーによる絞り込みで検索範囲を狭め、そのうえで skip index が残りの大部分を除外します。

実際の効果を検証するには、安定した SETTING の下でクエリをベンチマークし、実行時間を比較します。結果のシリアライズによるオーバーヘッドを避けるために `FORMAT Null` を使用し、クエリ条件キャッシュを無効化して実行を再現可能にしてください。

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
SETTINGS use_query_condition_cache = 0

2 rows in set. Elapsed: 0.025 sec. Processed 8.52 thousand rows, 299.78 KB (341.22 thousand rows/s., 12.00 MB/s.)
Peak memory usage: 41.97 MiB.
```

次に、スキップ索引を無効にした状態で同じクエリを実行します。

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
FORMAT Null
SETTINGS use_query_condition_cache = 0, use_skip_indexes = 0;

0 rows in set. Elapsed: 0.702 sec. Processed 1.62 million rows, 56.62 MB (2.31 million rows/s., 80.71 MB/s.)
Peak memory usage: 198.39 MiB.
```

`use_query_condition_cache` を無効にすると、キャッシュされたフィルタリング判定によって結果が影響を受けなくなり、`use_skip_indexes = 0` を設定すると比較用のクリーンなベースラインが得られます。プルーニングが有効に機能し、索引の評価コストが低い場合は、上記の例のように索引付きクエリのほうが体感的にも高速になるはずです。

:::tip
`EXPLAIN` で granule のプルーニングがほとんど行われていなかったり、スキップ索引が非常に大きい場合、索引を評価するコストが利点を相殺し得ます。`EXPLAIN indexes = 1` を使ってプルーニング状況を確認し、そのうえでベンチマークを行い、エンドツーエンドのパフォーマンス改善を検証してください。
:::


### スキップ索引を追加するタイミング \{#when-to-add-skip-indexes\}

スキップ索引は、ユーザーが最も頻繁に実行するフィルターの種類と、パーツおよびグラニュール内でのデータの分布に基づいて、選択的に追加する必要があります。目的は、索引そのものを評価するコストを上回るだけのグラニュールを読み飛ばせるようにすることです。そのため、本番相当のデータでベンチマークを行うことが不可欠です。

**フィルターに使用される数値カラムには、`minmax` スキップ索引がほとんど常に有力な選択肢となります。** 軽量で評価コストが低く、レンジ述語に対して効果的になり得ます。特に、値がゆるく順序付けられている場合や、値がパーツ内の狭い範囲に収まっている場合に有効です。特定のクエリパターンに対して `minmax` が効果を発揮しない場合でも、そのオーバーヘッドは一般的に十分小さいため、保持しておくのが妥当であることが多いです。

**文字列カラム: カーディナリティが高く、値がスパースな場合は Bloom filter を使用します。**

Bloom filter は、高カーディナリティで各値の出現頻度が比較的低い文字列カラムに対して最も効果的です。これは、ほとんどのパーツおよびグラニュールに検索対象の値が含まれていないことを意味します。経験則として、カラムに少なくとも 10,000 個の異なる値がある場合に Bloom filter は有望であり、100,000 個以上の異なる値がある場合に最高のパフォーマンスを発揮することが多いです。また、一致する値が少数の連続したパーツにクラスター化されているときに、より高い効果が得られます。この状況は通常、そのカラムがオーダリングキーと相関している場合に発生します。繰り返しになりますが、この点はワークロードによって異なります。実データでの検証に勝るものはありません。

## Optimization 3. Modifying the primary key \{#modifying-the-primary-key\}

プライマリキーは、ほとんどのワークロードにおいて ClickHouse のパフォーマンスチューニングで最も重要なコンポーネントの 1 つです。これを効果的にチューニングするには、その動作とクエリパターンとの相互作用を理解する必要があります。最終的に、プライマリキーはユーザーがデータへアクセスする方法、特にどのカラムで最も頻繁にフィルタリングされるかと整合している必要があります。

プライマリキーは圧縮やストレージレイアウトにも影響しますが、本来の主目的はクエリパフォーマンスです。ClickStack では、同梱されているプライマリキーは、最も一般的なオブザーバビリティ向けのアクセスパターンと高い圧縮率の両方に対して、すでに最適化されています。ログ、トレース、メトリクスの各テーブルに対するデフォルトキーは、典型的なワークフローで高い性能を発揮するよう設計されています。

プライマリキーの先頭に近いカラムでフィルタリングする方が、後ろのカラムでフィルタリングするよりも効率的です。デフォルト構成はほとんどのユーザーにとって十分ですが、特定のワークロードに対してはプライマリキーを変更することでパフォーマンスが向上する場合があります。

:::note[A note on terminology]
本ドキュメント全体を通して、「ordering key」という用語は「primary key」と同じ意味で使用されています。厳密には、ClickHouse において両者は異なる概念ですが、ClickStack では通常、テーブルの `ORDER BY` 句に指定された同じカラムを指します。詳細については、ソートキーと異なるプライマリキーの選択方法について説明している [ClickHouse ドキュメント](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key) を参照してください。
:::

プライマリキーを変更する前に、ClickHouse における[プライマリインデックスの動作を理解するためのガイド](/primary-indexes)に目を通すことを強く推奨します。

プライマリキーのチューニングはテーブルおよびデータ型ごとに固有です。あるテーブルやデータ型で有効な変更が、他には当てはまらない場合があります。常に、特定のデータ型（例: ログ）に最適化することが目的となります。

**通常、最適化の対象となるのはログとトレース用のテーブルです。その他のデータ型でプライマリキーを変更する必要があるケースは稀です。**

以下に、ログおよびメトリクス向けの ClickStack テーブルのデフォルトのプライマリキーを示します。

- Logs ([`otel_logs`](/use-cases/observability/clickstack/ingesting-data/schemas#logs)) - `(ServiceName, TimestampTime, Timestamp)`
- Traces (['otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)) - `(ServiceName, SpanName, toDateTime(Timestamp))`

その他のデータ型向けテーブルで使用されているプライマリキーについては、["Tables and schemas used by ClickStack"](/use-cases/observability/clickstack/ingesting-data/schemas) を参照してください。例えば、トレーステーブルは service name と span name によるフィルタリングに最適化されており、その後に timestamp と trace ID が続きます。対照的に、ログテーブルは service name、次に日付、次に timestamp によるフィルタリングに最適化されています。最適なのはユーザーがプライマリキーの順序通りにフィルタを適用することですが、これらのカラムについては、どの順序でフィルタリングしてもクエリは大きな恩恵を受けます。ClickHouse が[読み取り前にデータをプルーニングする](/optimize/skipping-indexes)ためです。

プライマリキーを選択する際には、カラムの最適な並び順を決めるための他の考慮事項もあります。["Choosing a primary key."](#choosing-a-primary-key) を参照してください。

**プライマリキーはテーブルごとに個別に変更する必要があります。ログで理にかなうことが、トレースやメトリクスに対しても理にかなうとは限りません。**

### プライマリキーの選択 \{#choosing-a-primary-key\}

まず、特定のテーブルについて、アクセスパターンがそのテーブルのデフォルト設定と大きく異なっているかどうかを確認します。例えば、もっとも一般的なログのフィルタリングが、サービス名よりも先に Kubernetes ノードで行われており、それが主要なワークフローを構成している場合、プライマリキーを変更する十分な理由になり得ます。

:::note[デフォルトのプライマリキーを変更する場合]
デフォルトのプライマリキーは、多くの場合において十分です。変更は慎重に行い、クエリパターンを明確に理解している場合にのみ行ってください。プライマリキーを変更すると、他のワークフローのパフォーマンスが低下する可能性があるため、テストは不可欠です。
:::

必要なカラムを抽出できたら、`ORDER BY` / プライマリキーの最適化を開始できます。

オーダリングキーを選択するうえで役立つ、いくつかの単純なルールを適用できます。以下のルールは互いに競合する場合があるため、記載された順番で検討してください。このプロセスから選択するキーは最大 4～5 個に抑えることを目標にします。

1. 一般的なフィルタやアクセスパターンと整合するカラムを選択します。例えば、特定のカラム（例: ポッド名）でフィルタリングするところからオブザーバビリティの調査を始めるのが通常であれば、そのカラムは `WHERE` 句で頻繁に使用されます。このようなカラムを、利用頻度の低いカラムよりも優先してキーに含めてください。
2. フィルタリングした際に、全体の行数の大部分を除外できるカラムを優先します。これにより、読み取る必要のあるデータ量を削減できます。サービス名やステータスコードは、しばしば良い候補になります。ただし後者については、大部分の行を除外する値でフィルタする場合に限ります。例えば、多くのシステムでは 200 コードでフィルタすると大半の行に一致するのに対し、500 エラーであれば、全体のごく一部にしか対応しません。
3. テーブル内の他のカラムと高い相関がある可能性が高いカラムを優先します。これにより、それらの値も連続して保存されやすくなり、圧縮の向上に寄与します。
4. オーダリングキーに含まれるカラムに対する `GROUP BY`（チャート用の集約）および `ORDER BY`（ソート）の操作は、よりメモリ効率よく実行できます。

オーダリングキーとして使用するカラムのサブセットを特定したら、それらは特定の順序で宣言する必要があります。この順序は、クエリでセカンダリキーとなるカラムに対するフィルタリング効率や、テーブルのデータファイルの圧縮率に大きな影響を与えます。一般的には、カーディナリティ（取り得る値の種類数）が小さいものから大きいものへと昇順にキーを並べるのが最善です。ただし、オーダリングキーの後ろのほうに現れるカラムでフィルタする場合、先頭付近のカラムでフィルタする場合に比べて効率が低下することとのバランスも考慮する必要があります。これらの挙動をバランスさせ、自身のアクセスパターンを踏まえて検討してください。何よりも重要なのは、バリエーションをテストすることです。オーダリングキーの理解を深め、その最適化方法についてさらに学ぶには、["Choosing a Primary Key."](/best-practices/choosing-a-primary-key) の一読を推奨します。プライマリキーのチューニングや内部データ構造について、さらに深い洞察が必要な場合は、["A practical introduction to primary indexes in ClickHouse."](/guides/best-practices/sparse-primary-indexes) を参照してください。

### Changing the primary key \{#changing-the-primary-key\}

データのインジェスト前にアクセスパターンが明確であれば、対象のデータ種別のテーブルを一度削除して再作成するだけで十分です。

以下の例は、既存のスキーマを使って新しい logs テーブルを作成しつつ、`ServiceName` の前に `SeverityText` カラムを含めた新しいプライマリキーを設定するシンプルな方法を示しています。

<VerticalStepper headerLevel="h4">

#### Create new table \{#create-new-table-with-key\}

```sql
CREATE TABLE otel_logs_temp AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

:::note Ordering key vs primary key
上記の例では、`PRIMARY KEY` と `ORDER BY` の両方を指定する必要があります。
ClickStack では、これらはほとんど常に同じです。
`ORDER BY` は物理的なデータ配置を制御し、`PRIMARY KEY` はスパースな索引を定義します。
ごくまれに非常に大規模なワークロードでは両者が異なる場合がありますが、ほとんどのユーザーはこれらを揃えておくべきです。
:::

#### Exchange and drop table \{#exhange-and-drop-table\}

`EXCHANGE` ステートメントは、テーブル名を[アトミックに](/concepts/glossary#atomicity)入れ替えるために使われます。テンポラリテーブル（現在の旧デフォルトテーブル）は削除できます。

```sql
EXCHANGE TABLES otel_logs_temp AND otel_logs
DROP TABLE otel_logs_temp
```

</VerticalStepper>

ただし、**既存テーブルのプライマリキーは変更できません**。変更するには新しいテーブルを作成する必要があります。

以下の手順により、古いデータを保持しつつ透過的にクエリ可能にしておくことができます（必要に応じて HyperDX では既存のキーでの利用を継続しながら、新しいデータはユーザーのアクセスパターンに最適化された新しいテーブルを通じて公開されます）。このアプローチでは、インジェストパイプラインを変更する必要がなく、データは引き続きデフォルトのテーブル名に送信され、すべての変更はユーザーからは透過的になります。

:::note
既存データを新しいテーブルにバックフィルすることは、大規模な環境ではほとんど価値がありません。コンピュートおよび IO コストが高くつくことが多く、そのパフォーマンス上のメリットに見合わないためです。代わりに、古いデータは[有効期限 (TTL)](/use-cases/observability/clickstack/ttl) によって期限切れにし、新しいデータのみが改善されたキーの恩恵を受けるようにします。
:::

<VerticalStepper headerLevel="h4">

以下でも、プライマリキーの最初のカラムとして `SeverityText` を導入する同じ例を用います。この場合、新しいデータ用のテーブルを作成し、履歴分析用に古いテーブルを維持します。

#### Create new table \{#create-new-table-with-key-2\}

望むプライマリキーを持つ新しいテーブルを作成します。`_23_01_2025` サフィックスに注目してください。これは現在の日付に合わせて調整してください。例:

```sql
CREATE TABLE otel_logs_23_01_2025 AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

#### Create a Merge table \{#create-merge-table\}

[Merge エンジン](/engines/table-engines/special/merge)（MergeTree と混同しないでください）は自体はデータを保存せず、複数のテーブルから同時に読み取ることを可能にします。

```sql
CREATE TABLE otel_logs_merge
AS otel_logs
ENGINE = Merge(currentDatabase(), 'otel_logs*')
```

:::note
`currentDatabase()` は、コマンドが正しいデータベース上で実行されることを前提としています。それ以外の場合は、データベース名を明示的に指定してください。
:::

このテーブルに対してクエリを実行し、`otel_logs` からデータが返されることを確認できます。

#### Update HyperDX to read from the merge table \{#update-hyperdx-to-read-from-merge-tree\}

HyperDX を構成し、logs データソースのテーブルとして `otel_logs_merge` を使用するようにします。

<Image img={select_merge_table} size="lg" alt="Merge テーブルの選択"/>

この時点で、書き込みは元のプライマリキーを持つ `otel_logs` に対して継続される一方、読み取りは Merge テーブルを使用します。ユーザーから見える変更やインジェストへの影響はありません。

#### Exchange the tables \{#exchange-the-tables\}

ここで `EXCHANGE` ステートメントを使用し、`otel_logs` と `otel_logs_23_01_2025` のテーブル名をアトミックに入れ替えます。

```sql
EXCHANGE TABLES otel_logs AND otel_logs_23_01_2025
```

これ以降、書き込みは更新されたプライマリキーを持つ新しい `otel_logs` テーブルに行われます。既存データは `otel_logs_23_01_2025` に残り、引き続き Merge テーブル経由でアクセス可能です。サフィックスは変更が適用された日付を示し、そのテーブルに格納されている最新のタイムスタンプを表します。

この手順により、インジェストを中断することなく、またユーザーに見える影響なしにプライマリキーを変更できます。

</VerticalStepper>

主キーに対してさらに変更が必要になった場合も、この手順を応用できます。たとえば、1 週間後に「やはり `SeverityText` ではなく `SeverityNumber` を主キーに含めたい」と判断した場合などです。以下の手順は、主キーの変更が必要になるたびに繰り返し適用できます。

<VerticalStepper headerLevel="h4">

#### 新しいテーブルを作成する \{#create-new-table-with-key-3\}

目的の主キーを持つ新しいテーブルを作成します。
次の例では、テーブルの日付を示すサフィックスとして `30_01_2025` を使用しています。例:

```sql
CREATE TABLE otel_logs_30_01_2025 AS otel_logs
PRIMARY KEY (SeverityNumber, ServiceName, TimestampTime)
ORDER BY (SeverityNumber, ServiceName, TimestampTime)
```

#### テーブルを入れ替える \{#exchange-the-tables-v2\}

`EXCHANGE` ステートメントを使用して、`otel_logs` テーブルと `otel_logs_30_01_2025` テーブルの名前をアトミックに入れ替えます。

```sql
EXCHANGE TABLES otel_logs AND otel_logs_30_01_2025
```

これ以降の書き込みは、更新された主キーを持つ新しい `otel_logs` テーブルに対して行われます。古いデータは `otel_logs_30_01_2025` に残り、マージテーブル経由で引き続きアクセスできます。

</VerticalStepper>

:::note 冗長なテーブル
有効期限 (TTL) ポリシーが設定されている場合 (推奨)、もはや書き込みを受け取らない古い主キーを持つテーブルは、データの有効期限切れに伴って徐々に空になっていきます。これらのテーブルは監視し、データが含まれなくなったら定期的にクリーンアップする必要があります。現時点では、このクリーンアップ処理は手動です。
:::

## Optimization 4. materialized view の活用 \{#exploting-materialied-views\}

<BetaBadge/>

ClickStack は、時間経過に伴う 1 分あたりの平均リクエスト処理時間の計算など、集約処理の重いクエリに依存する可視化を高速化するために、[インクリメンタルmaterialized view](/materialized-view/incremental-materialized-view) を活用できます。この機能によりクエリパフォーマンスを大幅に向上でき、1 日あたりおよそ 10 TB 以上の大規模なデプロイメントで特に有益であり、1 日あたり PB 規模までスケールさせることが可能になります。インクリメンタルmaterialized view は Beta 機能であり、慎重に使用する必要があります。

ClickStack におけるこの機能の使用方法の詳細については、専用ガイド「[ClickStack - Materialized Views.](/use-cases/observability/clickstack/materialized_views)」を参照してください。

## Optimization 5. プロジェクションの活用 \{#exploting-projections\}

プロジェクションは、マテリアライズドカラム、スキップ索引、主キー、materialized view を検討し終えた後に考慮できる、最終段階の高度な最適化です。プロジェクションと materialized view は見た目は似ていますが、ClickStack においては異なる目的を持ち、異なるシナリオで使用するのが最適です。

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、**プロジェクションはテーブルの追加の隠れたコピー**と考えることができ、同じ行を**異なる物理的順序**で保存します。これにより、プロジェクションはベーステーブルの `ORDER BY` キーとは異なる独自の主索引を持ち、元の並び順と一致しないアクセスパターンに対して、ClickHouse がより効果的にデータをプルーニングできるようになります。

materialized view でも、異なる並び替えキーを持つ別のターゲットテーブルに行を書き込むことで、同様の効果を得ることができます。大きな違いは、**プロジェクションは ClickHouse によって自動かつ透過的に維持される**のに対し、materialized view は ClickStack によって明示的に登録され、意図的に選択される必要があるテーブルである点です。

クエリがベーステーブルを対象とする場合、ClickHouse はベーステーブルのレイアウトと利用可能なプロジェクションを評価し、それぞれの主索引をサンプリングして、正しい結果を最小限のグラニュール読み取りで生成できるレイアウトを選択します。この決定はクエリアナライザによって自動的に行われます。

したがって ClickStack では、プロジェクションは次のような、**純粋なデータの並び替え**に最も適しています:

- アクセスパターンがデフォルトの主キーと本質的に異なる場合
- 1 つの並び替えキーですべてのワークフローをカバーするのが非現実的な場合
- ClickHouse に最適な物理レイアウトの選択を自動的かつ透過的に任せたい場合

事前集約とメトリクスの高速化については、ClickStack は **明示的な materialized view** を強く推奨します。これにより、アプリケーション層がビューの選択と利用を完全に制御できます。

背景情報については、次を参照してください:

- [プロジェクションに関するガイド](/data-modeling/projections)
- [プロジェクションを使用すべきタイミング](/data-modeling/projections#when-to-use-projections)
- [materialized view とプロジェクションの比較](/managing-data/materialized-views-versus-projections)

### プロジェクションの例 \{#example-projections\}

traces テーブルが、デフォルトの ClickStack のアクセスパターンに最適化されているとします。

```sql
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
```

TraceId でフィルタする（または TraceId を中心に頻繁にグループ化やフィルタを行う）主要なワークフローがある場合は、TraceId と time でソートされた行を保持するプロジェクションを追加できます。

```sql
ALTER TABLE otel_v2.otel_traces
ADD PROJECTION prj_traceid_time
(
    SELECT *
    ORDER BY (TraceId, toDateTime(Timestamp))
);
```

:::note ワイルドカードを使用する
上記の例の projection では、ワイルドカード（`SELECT *`）が使用されています。カラムの一部のみを選択すると書き込みオーバーヘッドを削減できますが、そのカラムだけで完全に満たせるクエリでしか projection を利用できないため、projection の利用用途が制限されます。ClickStack では、この制約により projection の利用がごく限定的なケースに限られてしまうことがよくあります。このため、一般的には適用範囲を最大化する目的でワイルドカードを使用することが推奨されます。
:::

他のデータレイアウト変更と同様に、projection は新規に書き込まれたパーツにしか影響しません。既存データに対して projection を構築するには、マテリアライズします：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE PROJECTION prj_traceid_time;
```

:::note
プロジェクションをマテリアライズする処理は長時間かかり、多くのリソースを消費する可能性があります。オブザーバビリティ・データは通常、有効期限 (TTL) によって期限切れになるため、これは本当に必要な場合にのみ行うべきです。ほとんどの場合、新たに取り込まれたデータにのみプロジェクションを適用し、それによって直近 24 時間など、最も頻繁にクエリされる時間範囲を最適化できれば十分です。
:::

ClickHouse は、プロジェクションのほうがベースのレイアウトよりも少ないグラニュールをスキャンすると推定した場合、自動的にプロジェクションを選択することがあります。プロジェクションは、完全な行セット（`SELECT *`）の単純な並べ替えを表しており、かつクエリのフィルタがプロジェクションの `ORDER BY` とよく一致しているときに最も信頼性が高くなります。

TraceId でフィルタし（特に等価条件）、かつ時間範囲を含むクエリは、上記のプロジェクションの恩恵を受けられます。例えば次のようになります:

```sql
-- Fetch a specific trace quickly
SELECT *
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
ORDER BY Timestamp;

-- Trace-scoped aggregation
SELECT
  toStartOfMinute(Timestamp) AS t,
  count() AS spans
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
GROUP BY t
ORDER BY t;
```

`TraceId` を制約しないクエリや、projection の並び順キーで先頭になっていない別のディメンションを主なフィルタ条件とするクエリは、通常は projection の恩恵を受けず（代わりにベースレイアウト経由で読み取られる可能性があります）。

:::note
Projection は集計結果も格納できます（materialized view と同様）。ただし ClickStack では、集計に projection を用いることは一般的には推奨していません。どのレイアウトが選択されるかが ClickHouse の analyzer に依存し、利用を制御したり挙動を把握したりするのが難しくなるためです。その代わりに、ClickStack がアプリケーションレイヤーで明示的に登録し、意図的に選択できる materialized view を利用することを推奨します。
:::

実務上、projection は、広い検索からトレース中心の詳細調査へ頻繁に切り替えるワークフロー（たとえば、特定の `TraceId` に対するすべての span を取得するケース）に最も適しています。


### コストと指針 \{#projection-costs-and-guidance\}

- **挿入時のオーバーヘッド**: 異なる並び替えキーを持つ `SELECT *` Projection は、実質的にデータを 2 回書き込むことになり、書き込み I/O が増加し、インジェストを維持するために追加の CPU およびディスクスループットが必要になる場合があります。
- **多用しない**: Projections は、2 つ目の物理的な並び順が多くのクエリに対して有意なプルーニング（データの絞り込み）を可能にするような、本当に多様なアクセスパターンが存在するケースに限定して使用するのが最適です。たとえば、2 つのチームが同じデータセットに対して本質的に異なる方法でクエリを実行している場合などです。
- **ベンチマークで検証する**: すべてのチューニングと同様に、Projection を追加してマテリアライズする前後で、実際のクエリレイテンシとリソース使用量を比較してください。

詳細な背景については、次を参照してください:

- [ClickHouse Projections ガイド](/data-modeling/projections#when-to-use-projections)
- [materialized views と Projections の比較](/managing-data/materialized-views-versus-projections)

### `_part_offset` を用いた軽量プロジェクション \{#lightweight-projections\}

<BetaBadge/>

:::note[ClickStack における軽量プロジェクションは Beta 機能です]
`_part_offset` ベースの軽量プロジェクションは、ClickStack のワークロードには推奨されません。ストレージと書き込み I/O は削減できますが、クエリ時のランダムアクセスが増える可能性があり、オブザーバビリティ用途で想定されるスケールでの本番環境における挙動は、まだ評価中です。この推奨事項は、機能が成熟し、より多くの運用データが得られるにつれて変更される可能性があります。
:::

より新しい ClickHouse バージョンでは、完全な行を複製するのではなく、プロジェクションのソートキーとベーステーブルへの `_part_offset` ポインタのみを格納する、より軽量なプロジェクションもサポートしています。これによりストレージのオーバーヘッドを大幅に削減でき、最近の改善によってグラニュール（granule）レベルでのプルーニングが可能になり、実質的にセカンダリ索引のように振る舞うようになりました。詳細は次を参照してください:

- [Smarter storage with _part_offset](/data-modeling/projections#smarter_storage_with_part_offset)
- [ブログでの説明と例](https://clickhouse.com/blog/projections-secondary-indices#example-combining-multiple-projection-indexes)

### 代替案 \{#projection-alternatives\}

複数のソートキーが必要な場合、PROJECTION だけが選択肢ではありません。運用上の制約や、ClickStack によるクエリのルーティング方法に応じて、次の点を検討してください。

- OpenTelemetry collector を構成して、`ORDER BY` キーが異なる 2 つのテーブルに書き込み、それぞれのテーブルに対して別々の ClickStack ソースを作成します。
- materialized view をコピー用パイプラインとして作成します。つまり、メインテーブルに materialized view をアタッチし、生の行データを別のソートキーを持つセカンダリテーブルに選択して書き込みます（非正規化やルーティングのパターン）。このターゲットテーブル用のソースを作成します。例は[こちら](/materialized-view/incremental-materialized-view#filtering-and-transformation)にあります。