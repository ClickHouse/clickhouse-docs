---
slug: /use-cases/observability/clickstack/performance_tuning
title: 'ClickStack - パフォーマンスチューニング'
sidebar_label: 'パフォーマンスチューニング'
description: 'ClickStack のパフォーマンスチューニング - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['clickstack', 'オブザーバビリティ', 'ログ', 'パフォーマンス', '最適化']
---

import BetaBadge from '@theme/badges/BetaBadge';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import trace_filtering from '@site/static/images/clickstack/performance_guide/trace_filtering.png';
import trace_filtering_v2 from '@site/static/images/clickstack/performance_guide/trace_filtering_v2.png';
import select_merge_table from '@site/static/images/clickstack/performance_guide/select_merge_table.png';
import OtelLogsSchema from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_schema_otel_logs.md';
import OtelTracesSchema from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_schema_otel_traces.md';

import Image from '@theme/IdealImage';

## はじめに \{#introduction\}

このガイドでは、ClickStack で最も一般的かつ効果的なパフォーマンス最適化に焦点を当てます。ここで紹介する内容は、実際のオブザーバビリティ ワークロードの大半を最適化するうえで十分なもので、通常は 1 日あたり数十テラバイト規模のデータまで対応できます。

これらの最適化は、最も簡単で効果の大きい手法から始め、より高度で専門的なチューニングへと進むように意図的な順序で紹介しています。初期の最適化はまず最初に適用すべきで、それだけでも大幅な改善が得られることが少なくありません。データ量が増え、ワークロードの要求が厳しくなるにつれて、後半の手法を検討する価値もいっそう高まります。

## ClickHouse の概念 \{#clickhouse-concepts\}

このガイドで説明する最適化を適用する前に、いくつかの中核となる ClickHouse の概念に慣れておくことが重要です。

ClickStack では、各 **データソースは 1 つ以上の ClickHouse テーブルに直接対応** します。OpenTelemetry を使用している場合、ClickStack はログ、トレース、メトリクスデータを保存するための既定テーブル群を作成および管理します。カスタムスキーマを使用している場合や、自分でテーブルを管理している場合は、すでにこれらの概念に慣れている可能性があります。一方、単に OpenTelemetry Collector 経由でデータを送信しているだけであれば、これらのテーブルは自動的に作成され、以下で説明するすべての最適化はこれらのテーブルに対して適用されます。

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

テーブルは ClickHouse 内の [データベース](/sql-reference/statements/create/database) に割り当てられます。デフォルトでは `default` データベースが使用されますが、これは [OpenTelemetry Collector 側で変更可能](/use-cases/observability/clickstack/config#otel-collector) です。

:::important ログとトレースに注力する
多くの場合、パフォーマンスチューニングの中心はログおよびトレースのテーブルになります。メトリクステーブルはフィルタリング向けに最適化することもできますが、スキーマは Prometheus スタイルのワークロード向けにあらかじめ意図的に設計されており、標準的なチャート用途では通常変更の必要はありません。これに対してログおよびトレースは、より広範なアクセスパターンをサポートしているため、チューニングによる恩恵が最も大きくなります。セッションデータについてはユーザー体験が固定されており、スキーマを変更する必要が生じることはほとんどありません。
:::

最低限、次の ClickHouse の基本事項を理解しておく必要があります。

| Concept | Description |
|---------|-------------|
| **Tables** | ClickStack のデータソースが、どのように基盤となる ClickHouse テーブルに対応しているか。ClickHouse のテーブルは主に [MergeTree](/engines/table-engines/mergetree-family/mergetree) エンジンを使用します。 |
| **Parts** | データがどのようにイミュータブルなパーツとして書き込まれ、その後時間とともにマージされるか。 |
| **Partitions** | パーティションは、テーブルのデータパーツを整理された論理単位にまとめます。これらの単位は管理やクエリ、最適化がしやすくなります。 |
| **Merges** | クエリ対象となるパーツ数を減らすために、パーツ同士をマージする内部プロセス。クエリパフォーマンスを維持するうえで不可欠です。 |
| **Granules** | ClickHouse がクエリ実行時に読み取りおよびプルーニングを行う最小単位のデータです。 |
| **Primary (ordering) keys** | `ORDER BY` キーがディスク上でのデータレイアウト、圧縮、およびクエリのプルーニングをどのように決定するか。 |

これらの概念は ClickHouse のパフォーマンスの中核をなすものです。データがどのように書き込まれるか、ディスク上でどのように構造化されるか、そしてクエリ実行時に ClickHouse がどれだけ効率的にデータ読み取りをスキップできるかが、これらによって決まります。このガイドに登場するすべての最適化、たとえば materialized カラム、スキップ索引、プライマリキー、PROJECTION、materialized view などは、すべてこれらのコアメカニズムの上に成り立っています。

チューニングに着手する前に、次の ClickHouse ドキュメントに目を通しておくことを推奨します。

- [Creating tables in ClickHouse](/guides/creating-tables) - テーブルの簡潔な入門。
- [Parts](/parts)
- [Partitions](/partitions)
- [Merges](/merges)
- [Primary keys/indexes](/primary-indexes)
- [How ClickHouse stores data: parts and granules](/guides/best-practices/sparse-primary-indexes) - ClickHouse におけるデータ構造とクエリ方法について、granules やプライマリキーを含めて詳しく解説した上級ガイド。
- [MergeTree](/engines/table-engines/mergetree-family/mergetree)- コマンドや内部仕様の理解に役立つ、MergeTree の上級リファレンスガイド。

- [How ClickHouse stores data: parts and granules](/guides/best-practices/sparse-primary-indexes) - ClickHouse でデータがどのように構造化され、クエリされるかを、granule とプライマリキーの詳細を含めて解説する上級ガイド。

- [MergeTree](/engines/table-engines/mergetree-family/mergetree)- コマンドおよび内部仕様の理解に有用な、MergeTree の高度なリファレンスガイド。

以下で説明するすべての最適化は、標準的な ClickHouse SQL を使用して、[ClickHouse Cloud SQL console](/integrations/sql-clients/sql-console) または [ClickHouse client](/interfaces/cli) から元となるテーブルに直接適用できます。

## 最適化 1. よくクエリされる属性をマテリアライズする \{#materialize-frequently-queried-attributes\}

ClickStack ユーザー向けの最初かつ最も簡単な最適化は、`LogAttributes`、`ScopeAttributes`、`ResourceAttributes` 内で頻繁にクエリされる属性を特定し、マテリアライズドカラムを使ってそれらをトップレベルのカラムとして昇格させることです。

この最適化だけで、ClickStack のデプロイメントを 1 日あたり数十テラバイト規模までスケールさせられることも多く、より高度なチューニング手法を検討する前に適用すべきです。

### 属性をマテリアライズする理由 \{#why-materialize-attributes\}

ClickStack は Kubernetes のラベル、サービスのメタデータ、カスタム属性などのメタデータを `Map(String, String)` カラムに保存します。これは柔軟ですが、Map のサブキーをクエリする場合に重要なパフォーマンス上の影響があります。

Map カラムから単一のキーをクエリする際、ClickHouse はディスクから Map カラム全体を読み込む必要があります。Map に多くのキーが含まれていると、専用カラムを読む場合と比べて不要な IO が発生し、クエリが遅くなります。

頻繁に参照される属性をマテリアライズすると、挿入時に値を抽出して通常のカラムとして保存することで、このオーバーヘッドを回避できます。

マテリアライズドカラム:

- 挿入時に自動的に計算される
- INSERT 文で明示的に設定することはできない
- 任意の ClickHouse 式をサポートする
- String から、より効率的な数値型や日付型への型変換を可能にする
- スキップ索引とプライマリキーの利用を可能にする

### 例 \{#materialize-column-example\}

Kubernetes のメタデータが `ResourceAttributes` に保存されている、トレース用のデフォルトの ClickStack スキーマを考えてみましょう。

<OtelTracesSchema />

ユーザーは、たとえば `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"` のような Lucene 構文を使用してトレースを絞り込むことができます。

<Image img={trace_filtering} size="lg" alt="トレースのフィルタリング" />

これにより、次のような SQL の述語が生成されます。

```sql
ResourceAttributes['k8s.pod.name'] = 'checkout-675775c4cc-f2p9c'
```

これは Map のキーにアクセスするため、ClickHouse は一致する各行に対して `ResourceAttributes` カラム全体を読み出す必要があります。Map に多くのキーが含まれている場合、データ量が非常に大きくなる可能性があります。

この属性が頻繁にクエリされる場合は、トップレベルのカラムとしてマテリアライズしておくべきです。

挿入時にポッド名を抽出するには、マテリアライズドカラムを追加します。

```sql
ALTER TABLE otel_v2.otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

この時点以降、新規に挿入されるデータでは、ポッド名が専用のカラム `PodName` に保存されます。

ユーザーは、たとえば `PodName:"checkout-675775c4cc-f2p9c"` のような Lucene 構文を使用して、ポッド名を効率的にクエリできるようになります。

<Image img={trace_filtering_v2} size="lg" alt="トレースのフィルタリング v2" />

新しく挿入されるデータでは、これにより Map へのアクセスを完全に回避でき、I/O を大幅に削減できます。

ただし、ユーザーが元の属性パス (たとえば `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`) で引き続きクエリする場合でも、**ClickStack は内部的にクエリを自動的に書き換えて**、マテリアライズされた `PodName` カラムを使用します。つまり、次の述語を使用します。

```sql
PodName = 'checkout-675775c4cc-f2p9c'
```

これにより、ユーザーはダッシュボード、アラート、保存済みクエリを変更することなく、この最適化の恩恵を受けられます。

:::note
デフォルトでは、マテリアライズドカラムは `SELECT * クエリ` から除外されます。これにより、クエリ結果は常にテーブルに再挿入できるという不変条件が保たれます。
:::

これにより、ダッシュボード、アラート、保存済みクエリを変更することなく、ユーザーは最適化の恩恵を受けられます。

:::note
デフォルトでは、マテリアライズドカラムは `SELECT *` クエリから除外されます。これにより、クエリ結果を常にテーブルに再挿入できるという性質が保たれます。
:::


### 履歴データのマテリアライズ \{#materializing-historical-data\}

マテリアライズドカラムは、そのカラムが作成された後に挿入されたデータにのみ自動的に適用されます。既存のデータに対しては、マテリアライズドカラムへのクエリは透過的に元のマップの読み取りへフォールバックします。

履歴データに対するパフォーマンスが重要な場合は、次のように mutation を使用してカラムをバックフィルできます。

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
```

これは既存の[パーツ](/parts)を書き換えてカラムを埋めます。ミューテーションはパーツごとにシングルスレッドで実行されるため、大規模なデータセットでは時間がかかる可能性があります。影響を抑えるために、ミューテーションの対象を特定のパーティションに限定できます。

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
IN PARTITION '2026-01-02'
```

ミューテーションの進行状況は、たとえば `system.mutations` テーブルを使用して監視できます。

```sql
SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;

## 最適化 2. スキップ索引の追加

頻繁にクエリされる属性をマテリアライズしたら、次の最適化としてデータスキッピングインデックスを追加し、クエリ実行中に ClickHouse が読み取る必要のあるデータ量をさらに削減します。

スキップ索引を使用すると、一致する値が存在しないと判断できる場合に、ClickHouse はデータブロック全体のスキャンを回避できます。従来のセカンダリ索引と異なり、スキップ索引はグラニュール単位で動作し、クエリのフィルター条件によってデータセットの大部分が除外される場合に最も効果的です。適切に使用すれば、クエリの意味論を変えることなく、高カーディナリティな属性に対するフィルタリングを大幅に高速化できます。

スキップ索引を含む ClickStack のデフォルトのトレーススキーマを次に示します。

<OtelTracesSchema />

これらの索引は、一般的な 3 つのパターンに重点を置いています。

* TraceId、セッション識別子、属性のキーまたは値など、高カーディナリティな文字列のフィルタリング
* [`*AttributeItems`](#map-direct-read-optimization) カラム上の[テキスト索引](#text-indexes)によって高速化される Map のサブキーのフィルタリング
* span の Duration など、数値範囲のフィルタリング

logs テーブルでは、ブルームフィルタの代わりに全体を通して `text(tokenizer = 'array')` 索引を使用し、さらに全文検索用に `lower(Body)` に `text(tokenizer = 'splitByNonAlpha')` 索引を追加しています。完全な DDL については、[&quot;ClickStack で使用されるテーブルとスキーマ&quot;](/use-cases/observability/clickstack/ingesting-data/schemas#logs) を参照してください。

TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

これらの索引は、次の 2 つの一般的なパターンに焦点を当てています。

* TraceId、セッション識別子、属性キーや値などの、高カーディナリティな文字列に対するフィルタリング
* スパンの継続時間などの数値範囲に対するフィルタリング


### ブルームフィルター

ブルームフィルター索引は、ClickStack で最も一般的に使用されるスキップ索引の種類です。これは高カーディナリティ（通常は少なくとも数万件程度の異なる値）を持つ文字列カラムに適しています。偽陽性率 0.01、粒度 1 は、ストレージのオーバーヘッドと効果的なプルーニングとのバランスが取れた、良いデフォルトの出発点です。

Optimization 1 の例を引き続き用いて、Kubernetes のポッド名が ResourceAttributes からマテリアライズされていると仮定します：

```sql
ALTER TABLE otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

その後、Bloom filter を用いたスキップ索引を追加して、このカラムに対するフィルタ処理を高速化できます。

```sql
ALTER TABLE otel_traces
ADD INDEX idx_pod_name PodName
TYPE bloom_filter(0.01)
GRANULARITY 1

### テキスト索引

[テキスト索引](/engines/table-engines/mergetree-family/textindexes)は、ブルームフィルタに代わる選択肢です。ブルームフィルタは、グラニュールを確実に除外できる確率的データ構造ですが、偽陽性率があるため、除外されなかったグラニュールは引き続き読み込んだうえで、`WHERE` 条件に照らして評価する必要があります。テキスト索引は、トークンを part 内の正確なオフセットに対応付ける転置索引です。グラニュールではなくオフセットを評価し、偽陽性も発生しないため、通常は基になるカラムを読み込まずに `WHERE` 条件を満たせます。これは [direct read](https://github.com/ClickHouse/clickhouse-docs/pull/6356/%E2%80%A6) と呼ばれる最適化です。データの読み込みはクエリ時間の大きな割合を占めることが多いため、direct read によってクエリレイテンシを大幅に削減できます。

さらに、テキスト索引自体もクエリできるため、ClickStack でのオートコンプリートやそのほかのイントロスペクションにも活用されます。

2 種類のトークナイザーで、ClickStack のほとんどのパターンをカバーできます。

| トークナイザー           | 用途                                  | 典型的なカラム                           |
| ----------------- | ----------------------------------- | --------------------------------- |
| `array`           | `Array(String)` の要素全体をトークンとして索引付けする | `mapKeys(...)`, `*AttributeItems` |
| `splitByNonAlpha` | 自然文の文字列に対する語単位の全文検索                 | `Body`, `lower(Body)`, `SpanName` |

#### Map と配列カラム向けの Array トークナイザー

デフォルトのログスキーマでは、`mapKeys` とマテリアライズされた item 配列に対して、
`array` トークナイザーで索引を作成します:

```sql
INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE text(tokenizer = 'array'),
INDEX idx_log_attr_items LogAttributeItems TYPE text(tokenizer = 'array')
```

各 Map のキー (または配列要素) は、それぞれ 1 つのトークンになります。既知の
attribute キーでフィルタリングすると、それを含まない行は、周囲の
Map カラムをスキャンすることなく除外されます。これが、[Map direct read 最適化](#map-direct-read-optimization)
を効果的にする仕組みです。

#### ログ本文向けの`splitByNonAlpha`

`Body`カラムに対する全文検索では、`splitByNonAlpha`テキスト
索引を使用すると効果的です。ClickStack ではこの索引を`lower(Body)`に定義しているため、
Lucene の大文字・小文字を区別しない検索で利用できます:

```sql
INDEX idx_lower_body lower(Body) TYPE text(tokenizer = 'splitByNonAlpha')
```

ClickStack は、`lower(Body)` に対する `text(tokenizer = 'splitByNonAlpha')` 索引を検出すると、
`error` や
`"connection refused"` のような暗黙のカラム指定による Lucene クエリを `hasAllTokens(lower(Body), lower(...))` に書き換えます。これにより、
`Body` カラム全体を読み込まずに索引だけで処理できます。ほとんどの
オブザーバビリティのログワークロードでは、これが利用できる
フィルタリング高速化の中で最も大きな効果をもたらします。

:::note テキスト索引と `tokenbf_v1`
古い `tokenbf_v1` 索引タイプ (デフォルトのトレーススキーマでは現在も
`lower(SpanName)` に使われています) は機能的には似ていますが、ClickHouse 26.2
以降では非推奨です。新しいテキスト検索用索引には `text(tokenizer = ...)` を使用してください。
:::

トークナイザーのオプション、プリプロセッサ、検証について詳しくは、[フルテキスト検索ドキュメント](/engines/table-engines/mergetree-family/textindexes)を参照してください。

#### デフォルトの logs スキーマのテキスト索引

アップストリームから同期されるデフォルトの `otel_logs` スキーマには、前述のテキスト索引がすべて含まれています。具体的には、`TraceId`、各 `mapKeys(...)`、および `*AttributeItems` Array に対する `text(tokenizer = 'array')` と、全文検索用の `lower(Body)` に対する `text(tokenizer = 'splitByNonAlpha')` です。正規の DDL については、[&quot;ClickStack で使用されるテーブルとスキーマ&quot;](/use-cases/observability/clickstack/ingesting-data/schemas#logs) を参照してください。同じスキーマを以下に再掲しています。

<OtelLogsSchema />

### Min-max 索引

Minmax 索引は、各 granule ごとに最小値と最大値を保存する、非常に軽量な索引です。特に数値カラムおよび範囲クエリに対して高い効果を発揮します。すべてのクエリが高速化されるとは限りませんが、コストが低く、数値フィールドにはほぼ常に追加する価値があります。

Minmax 索引は、数値が自然な順序で並んでいる場合や、各 part 内で狭い範囲に収まっている場合に最も効果的です。

`SpanAttributes` の Kafka オフセットを頻繁にクエリするとします。

```sql
SpanAttributes['messaging.kafka.offset']
```

この値はマテリアライズして数値型にキャストできます。

```sql
ALTER TABLE otel_traces
ADD COLUMN KafkaOffset UInt64
MATERIALIZED toUInt64(SpanAttributes['messaging.kafka.offset'])
```

続いて、Minmax 索引を追加できます。

```sql
ALTER TABLE otel_traces
ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1
```

これにより、たとえばコンシューマラグのデバッグ時やリプレイ時の挙動を確認する際に Kafka オフセットの範囲で絞り込む場合、ClickHouse はパーツを効率的にスキップできるようになります。

繰り返しになりますが、この索引は利用可能になる前に [マテリアライズ](#materialize-skip-index) する必要があります。

### スキップ索引をマテリアライズする

スキップ索引を追加すると、その効果が適用されるのは新たに取り込まれたデータに対してのみです。明示的にマテリアライズするまで、過去のデータはその索引の効果を受けません。

すでにスキップ索引を追加している場合、たとえば次のように追加している場合は:

```sql
ALTER TABLE otel_traces ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1;
```

既存データに対しては、索引を明示的に作成する必要があります。

```sql
ALTER TABLE otel_traces MATERIALIZE INDEX idx_kafka_offset;
```

:::note[スキップ索引のマテリアライズ]
スキップ索引をマテリアライズする処理は、特に minmax 索引の場合、通常は軽量であり、安全に実行できます。大規模なデータセットに対する ブルームフィルタ 索引については、リソース使用量をより適切に制御するために、パーティション単位でマテリアライズすることを選択する場合があります。

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE INDEX idx_kafka_offset
IN PARTITION '2026-01-02';
```

:::

スキップ索引のマテリアライズは ミューテーション として実行されます。その進行状況は system テーブルで監視できます。

```sql

SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

対応する ミューテーション が `is_done = 1` になるまで待ちます。

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

ゼロ以外の値は、索引が正常にマテリアライズされたことを示します。

重要なのは、スキップ索引のサイズがクエリのパフォーマンスに直接影響するという点です。数十 GB から数百 GB 級の非常に大きなスキップ索引は、クエリ実行中の評価に無視できない時間がかかることがあり、その結果、効果が薄れたり、場合によっては効果を打ち消してしまったりすることもあります。

実際には、minmax 索引は通常非常に小さく、評価コストも低いため、ほとんどの場合は安全にマテリアライズできます。一方、ブルームフィルタ 索引は、カーディナリティ、粒度、偽陽性確率によっては大幅に大きくなることがあります。

ブルームフィルタ のサイズは、許容する偽陽性率を上げることで小さくできます。たとえば、確率パラメータを `0.01` から `0.05` に引き上げると、より小さく、より高速に評価できる索引になりますが、その代わり pruning の積極性は下がります。スキップできる granule は少なくなる可能性がありますが、索引評価が高速になることで、クエリ全体のレイテンシが改善する場合があります。

したがって、ブルームフィルタ パラメータの調整はワークロードに依存する最適化であり、実際のクエリパターンと本番に近いデータ量を使って検証する必要があります。

スキップ索引の詳細については、ガイド [&quot;ClickHouse のデータスキッピングインデックスを理解する&quot;](/optimize/skipping-indexes/examples) を参照してください。

### スキップ索引 の有効性を評価する

スキップ索引 のプルーニング効果を評価する最も確実な方法は `EXPLAIN indexes = 1` を使うことです。これにより、クエリプランニングの各段階で、何個の[パーツ](/parts)と[グラニュール](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)が除外されたかを確認できます。多くの場合、Skip ステージで グラニュール が大きく削減されていることが望ましく、理想的には主キーによって検索空間がすでに縮小された後に起こるのがベストです。スキップ索引 はパーティション pruning と主キープルーニングの後に評価されるため、その効果は、残っているパーツと グラニュール に対する相対的な削減として測定するのが最適です。

`EXPLAIN` によってプルーニングが発生しているかどうかは確認できますが、それだけでトータルとしての高速化が保証されるわけではありません。特に index が大きい場合、スキップ索引 の評価にはコストがかかります。実際のパフォーマンス向上を確認するために、索引を追加してマテリアライズする前後で必ずクエリをベンチマークしてください。

たとえば、デフォルトの Traces スキーマに含まれる TraceId 用のデフォルト Bloom filter スキップ索引 を考えてみます。

```sql
INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1
```

`EXPLAIN indexes = 1` を使用すると、選択性の高いクエリに対してどの程度効果的かを確認できます。

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

このケースでは、まず主キーのフィルタによってデータセットが大幅に削減され (35,898 個の グラニュール から 255 個へ) 、その後 Bloom フィルタがさらにそれを 1 個の グラニュール (1/255) まで絞り込みます。これは スキップ索引 の理想的なパターンであり、主キーによる絞り込みで検索範囲を狭め、その後 スキップ索引 が残りの大部分を除外します。

実際の効果を検証するには、安定した設定でクエリをベンチマークし、実行時間を比較します。結果のシリアライズによるオーバーヘッドを避けるために `FORMAT Null` を使用し、実行の再現性を確保するためにクエリ条件キャッシュを無効にします。

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
SETTINGS use_query_condition_cache = 0
```

```response
2 rows in set. Elapsed: 0.025 sec. Processed 8.52 thousand rows, 299.78 KB (341.22 thousand rows/s., 12.00 MB/s.)
Peak memory usage: 41.97 MiB.
```

次に、スキップインデックスを無効にして同じクエリを実行します：

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
FORMAT Null
SETTINGS use_query_condition_cache = 0, use_skip_indexes = 0;
```

```response
0 rows in set. Elapsed: 0.702 sec. Processed 1.62 million rows, 56.62 MB (2.31 million rows/s., 80.71 MB/s.)
Peak memory usage: 198.39 MiB.
```

`use_query_condition_cache` を無効にすると、結果がキャッシュされたフィルタリング判定の影響を受けないことが保証され、`use_skip_indexes = 0` を設定すると比較のための明確なベースラインが得られます。プルーニングが効果的で、かつ索引評価コストが低ければ、上の例のように、索引を使ったクエリは明確に高速になるはずです。

:::tip
`EXPLAIN` で グラニュール のプルーニングがほとんど行われていないことが示される場合や、スキップ索引が非常に大きい場合は、索引評価のコストによって利点が相殺されることがあります。まず `EXPLAIN indexes = 1` でプルーニングを確認し、その後ベンチマークによってエンドツーエンドの性能向上を確認してください。
:::

### スキップ索引を追加するタイミング

スキップ索引は、ユーザーが最も頻繁に使うフィルタの種類と、パーツおよびグラニュール内でのデータの分布に応じて、選択的に追加する必要があります。目的は、索引自体の評価コストを上回るだけのグラニュールを読み飛ばせるようにすることです。そのため、本番環境に近いデータでのベンチマークが不可欠です。

**フィルタで使う数値カラムには、minmax スキップ索引がほぼ常に有力な選択肢です。** 軽量で評価コストが低く、範囲条件に対して効果的です。特に、値がある程度順序性を持っている場合や、パーツ内で狭い範囲に収まっている場合に有効です。特定のクエリパターンで minmax が役に立たなくても、通常はオーバーヘッドが十分小さいため、そのまま維持する合理性があります。

**文字列カラムでは、サポートされている場合はテキスト索引を優先し、そうでなければブルームフィルタを使ってください。** テキスト索引は、ブルームフィルタと同じ等価条件や `IN` フィルタを高速化できるうえ、全文検索や [Map direct read optimization](#map-direct-read-optimization) で使われるトークンベースの条件 (`hasToken`、`hasAllTokens`、`has`) にも対応できます。まだテキスト索引をサポートしていない古いクラスターでは、ブルームフィルタも引き続き有力な選択肢です。

ブルームフィルタが最も効果を発揮するのは、高カーディナリティな文字列カラムで、各値の出現頻度が比較的低い場合です。つまり、ほとんどのパーツやグラニュールに検索対象の値が含まれていないようなケースです。目安としては、そのカラムに少なくとも 10,000 個の異なる値がある場合に有望で、100,000 個を超える異なる値がある場合に特に高い効果を示すことがよくあります。また、一致する値が少数の連続したパーツに集まっている場合にも、より効果的です。これは通常、そのカラムが 並び順キー と相関しているときに起こります。繰り返しになりますが、効果はケースによって異なるため、実環境での検証に勝るものはありません.

## 最適化 3. Map の直接読み取り

`LogAttributes['k8s.pod.name'] =
'checkout'` のような Map のサブキーでフィルタする場合、ClickHouse はディスクから `LogAttributes` Map カラム全体を読み込み、条件を評価するためにすべての行を展開しなければなりません。[頻繁にクエリされる属性をマテリアライズする](#materialize-frequently-queried-attributes)
ことで、あらかじめ把握しているキーについてはこの問題を解決できますが、ユーザーがその場で任意にフィルタする属性すべてに対してはスケールしません。

スキーマに `mapKeys` と `mapValues` の索引があっても、それらの索引で分かるのは、ある行に特定のキーがあるか、特定の値があるかということだけで、そのキーと値が同じエントリに属しているかどうかは分かりません。言い換えると、`mapKeys` は `mapContainsKey(ResourceAttributes, 'foo')` には答えられ、`mapValues` は `mapContainsValue(ResourceAttributes, 'bar')` には答えられますが、どちらも `ResourceAttributes['foo'] = 'bar'` には答えられません。

キーと値を 1 つの `Array(String)` カラムに連結することで、Map の直接読み取り最適化により、基になる Map を読み込まずに `ResourceAttributes['foo'] = 'bar'` を判定できるようになります。Map は多くの場合サイズが大きく、データ量の増加に伴ってさらに大きくなります。これをアプリケーションレベルのクエリの書き換え と組み合わせることで、任意の Map サブキーに対する等価フィルタは、その索引を利用する単一の `has(...)` 呼び出しに変換され、クエリ時の Map のデシリアライズは不要になります。さらに、追加で必要になるストレージコストはテキスト索引分だけです。基になるカラムは `ALIAS` カラムであり、保存されないためです。

この最適化は自動的に適用されます。ClickStack には、デフォルトのログ テーブルとトレース テーブルに必要なカラムと索引が含まれており、接続先の ClickHouse server が基盤となるプリミティブをサポートしていれば、実行時に Map の添字フィルタを書き換えます。スキーマにこれらのカラムが含まれていない場合や、デフォルト以外にも高速化したい Map カラムがある場合は、このまま読み進めて有効にしてください。

### スキーマ

高速化したい各 Map カラムについて、ClickStack は
各キーと値を `=` で結合した `Array(String)` `ALIAS` カラムを定義します:

```sql
ALTER TABLE otel_logs
ADD COLUMN LogAttributeItems Array(String)
ALIAS arrayMap(
  (arr) -> concat(arr.1, '=', arr.2),
  LogAttributes::Array(Tuple(String, String))
)
```

ALIAS 形式では、その配列によってディスク上の使用量は1バイトも増えません。ClickHouse はこれを
クエリ実行時および索引構築時に計算します。`ALIAS` カラム上の `text(tokenizer = 'array')` スキップ索引は
`key=value` の各ペアにつき1つのトークンを保存し、ClickHouse はこれを使って
元の Map にアクセスすることなくグラニュールを絞り込みます:

```sql
ALTER TABLE otel_logs
ADD INDEX idx_log_attr_items LogAttributeItems
TYPE text(tokenizer = 'array')
```

既存のテーブルに索引を作成したら、履歴データでも使用できるようにマテリアライズします ([&quot;スキップ索引のマテリアライズ&quot;](#materialize-skip-index) を参照) 。

デフォルトの ClickStack スキーマには、以下のカラムと索引が含まれています。

| テーブル          | ALIAS カラム                                                            | テキスト索引                                                             |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `otel_logs`   | `ResourceAttributeItems`, `ScopeAttributeItems`, `LogAttributeItems` | `idx_res_attr_items`, `idx_scope_attr_items`, `idx_log_attr_items` |
| `otel_traces` | `ResourceAttributeItems`, `SpanAttributeItems`                       | `idx_res_attr_items`, `idx_span_attr_items`                        |

### クエリの書き換え

ユーザーが ClickStack UI または SDK を通じて Map のサブキーでフィルタリングすると、ClickStack は次のように書き換えます。

```sql
LogAttributes['k8s.pod.name'] = 'checkout'
```

次のようになります。

```sql
has(LogAttributeItems, concat('k8s.pod.name', '=', 'checkout'))
```

リライト後の形式では `LogAttributeItems` 上のテキスト索引を利用し、`key=value` トークンを含まない
行全体を刈り込み、不一致の行ではソースの `LogAttributes` Map を
デシリアライズしません。高カーディナリティの
オブザーバビリティ ワークロードでは、通常、Map の添字アクセスと比べて I/O を
桁違いに削減できます。

このリライトは自動的に行われるため、`LogAttributes['key']` を参照する保存済みクエリ、ダッシュボード、アラートは
何も変更しなくても高速化の恩恵を受けられます。

### ClickHouse のバージョン要件

このクエリの書き換えには、テキスト索引付きの配列カラムに対する
トークンレベルの直接的な絞り込みをサポートする ClickHouse バージョンが必要です。ClickStack は
接続先サーバーのバージョン (`SELECT version()`、接続ごとにキャッシュ) を検出し、
サーバーがしきい値以上の場合にのみ書き換え後の形式を生成します。古い
サーバーでは、自動的に元の Map 添字形式にフォールバックします。

| ClickHouse ブランチ | 最小バージョン    |
| --------------- | ---------- |
| 26.2            | 26.2.19.43 |
| 26.3            | 26.3.12.3  |
| 26.4            | 26.4.3.37  |
| 26.5+           | すべてのバージョン  |

:::note なぜ MATERIALIZED ではなく ALIAS なのか
items 配列は、すでに Map カラムに存在するデータを参照するためのものです。
Map と配列の両方に保存すると、新しいクエリパターンが使えるようになるわけでもなく、
書き込み I/O だけが 2 倍になります。
`ALIAS` カラム上のテキスト索引は、同じ元データから挿入時に構築されるため、
この最適化でディスク上に追加されるのは索引の使用量だけです。
:::

## Optimization 4. Modifying the primary key

ほとんどのワークロードにおいて、主キーは ClickHouse のパフォーマンスチューニングにおける最も重要な構成要素の 1 つです。これを効果的にチューニングするには、その動作とクエリパターンとの相互作用を理解する必要があります。最終的には、主キーはユーザーがデータへアクセスする方法、特にどのカラムで最も頻繁にフィルタリングされるかに揃えるべきです。

主キーは圧縮やストレージレイアウトにも影響しますが、その主な目的はクエリ性能です。ClickStack では、標準で提供される主キーは、最も一般的なオブザーバビリティのアクセスパターンと高い圧縮効率の両方に対して、すでに最適化されています。ログ、トレース、メトリクステーブルのデフォルトキーは、代表的なワークフローで高い性能を発揮するよう設計されています。

主キーの先頭のほうにあるカラムでフィルタリングするほうが、後ろのカラムでフィルタリングするよりも効率的です。デフォルト構成はほとんどのユーザーにとって十分ですが、特定のワークロードに対しては、主キーを変更することでパフォーマンスが向上する場合があります。

:::note[用語に関する注意]
本ドキュメント全体を通して、用語「並び順キー」は「主キー」と同じ意味で使われています。厳密には、ClickHouse において両者は異なる概念ですが、ClickStack の場合、通常はテーブルの `ORDER BY` 句に指定された同じカラム群を指します。詳細については、ソートキーと異なる主キーを選択する方法についての [ClickHouse ドキュメント](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key) を参照してください。
:::

主キーを変更する前に、ClickHouse における[プライマリ索引の仕組みを理解するガイド](/primary-indexes)に目を通すことを強く推奨します。

主キーのチューニングは、テーブルおよびデータ型ごとに異なります。あるテーブルとデータ型に有効な変更が、他に当てはまるとは限りません。目標は常に、特定のデータ型、たとえばログに対して最適化することです。

**通常、最適化対象となるのはログ用テーブルとトレース用テーブルです。その他のデータ型で主キーの変更が必要になることはまれです。**

以下は、ログ用およびトレース用の ClickStack テーブルにおけるデフォルトの主キーです。

* Logs ([`otel_logs`](/use-cases/observability/clickstack/ingesting-data/schemas#logs)) - `(toStartOfFiveMinutes(Timestamp), ServiceName, Timestamp)`
* Traces ([`otel_traces`](/use-cases/observability/clickstack/ingesting-data/schemas#traces)) - `(ServiceName, SpanName, toDateTime(Timestamp))`

他のデータ型のテーブルで使用される主キーについては、[&quot;Tables and schemas used by ClickStack&quot;](/use-cases/observability/clickstack/ingesting-data/schemas) を参照してください。トレーステーブルは、service name、span name、続いて timestamp でのフィルタリングに最適化されています。ログテーブルでは、先頭に 5 分単位の time bucket を置くことで、時間範囲スキャンが最初にプライマリインデックスに当たり、その後各 bucket 内で service name によって絞り込まれます。これは、一般的な「サービス X で直近 N 分間に何が起きたか」というワークフローに適したレイアウトです。最適なのは主キーの順序どおりにフィルタを適用することですが、ClickHouse が[読み取り前にデータをプルーニング](/optimize/skipping-indexes)するため、これらのカラムのいずれであっても、どの順序でフィルタリングしてもクエリは依然として大きな恩恵を受けます。

主キーを選ぶ際には、カラムの最適な順序を選択するうえで、他にも考慮すべき点があります。[&quot;Choosing a primary key.&quot;](#choosing-a-primary-key) を参照してください。

**主キーは、テーブルごとに切り離して変更するべきです。ログに適したものが、トレースやメトリクスにも適しているとは限りません。**

プライマリキーのチューニングは、テーブルおよびデータ種別ごとに固有です。あるテーブルやデータ種別に有効な変更が、他には当てはまらない場合があります。目標は常に、特定のデータ種別（例: ログ）に対して最適化することです。

**一般的には、ログおよびトレースのテーブルを最適化することになります。その他のデータ種別について、プライマリキーを変更する必要があるケースはまれです。**

以下に、ClickStack におけるログおよびメトリクステーブルのデフォルトのプライマリキーを示します。

- Logs ([`otel_logs`](/use-cases/observability/clickstack/ingesting-data/schemas#logs)) - `(ServiceName, TimestampTime, Timestamp)`
- Traces (['otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)) - `(ServiceName, SpanName, toDateTime(Timestamp))`

他のデータ種別のテーブルで使用されるプライマリキーについては、["Tables and schemas used by ClickStack"](/use-cases/observability/clickstack/ingesting-data/schemas) を参照してください。たとえば、トレーステーブルは、サービス名とスパン名、その後にタイムスタンプおよびトレース ID でフィルタリングする用途に最適化されています。対照的に、ログテーブルはサービス名、次に日付、次にタイムスタンプによるフィルタリングに最適化されています。理想的には、ユーザーがプライマリキーの順序に従ってフィルタを適用することが望ましいですが、これらのカラムのいずれかで任意の順序でフィルタリングした場合でも、ClickHouse が[読み取り前にデータをスキップ（プルーニング）](/optimize/skipping-indexes)するため、クエリは大きな恩恵を受けます。

プライマリキーを選択する際には、カラムの並び順を最適化するために考慮すべき他の点もあります。["Choosing a primary key."](#choosing-a-primary-key) を参照してください。

**プライマリキーの変更はテーブルごとに個別に行う必要があります。ログで意味のあることが、トレースやメトリクスでも意味があるとは限りません。**

### プライマリキーの選択 {#choosing-a-primary-key}

### 主キーの変更

データの取り込み前にアクセスパターンが明確であれば、対象のデータ型についてテーブルを削除して再作成するだけでかまいません。

以下の例は、既存のスキーマはそのままに、新しい主キーとして `ServiceName` の前に `SeverityText` を含めたログテーブルを作成する簡単な方法を示しています。

<VerticalStepper headerLevel="h4">
  #### 新しいテーブルを作成する

  ```sql
  CREATE TABLE otel_logs_temp AS otel_logs
  PRIMARY KEY (SeverityText, ServiceName, Timestamp)
  ORDER BY (SeverityText, ServiceName, Timestamp)
  ```

  :::note 並び順キーと主キー
  上記の例では、`PRIMARY KEY` と `ORDER BY` を指定する必要があります。
  ClickStack では、これらはほとんど常に同一です。
  `ORDER BY` は物理的なデータレイアウトを制御し、`PRIMARY KEY` はスパースインデックスを定義します。
  まれな大規模ワークロードでは両者が異なる場合もありますが、ほとんどのユーザーは両者を揃えておくべきです。
  :::

  #### テーブルの入れ替えと削除

  `EXCHANGE` ステートメントは、テーブル名を[アトミックに](/concepts/glossary#atomicity)入れ替えるために使用されます。一時テーブル (この時点で古いデフォルトテーブルになっています) は削除できます。

  ```sql
  EXCHANGE TABLES otel_logs_temp AND otel_logs
  DROP TABLE otel_logs_temp
  ```
</VerticalStepper>

ただし、**既存テーブルの主キーは変更できません**。変更するには新しいテーブルを作成する必要があります。

以下の手順により、古いデータを保持しつつ透過的にクエリできるようにできます (必要に応じて ClickStack UI では既存のキーを引き続き使用しつつ、新しいデータはユーザーのアクセスパターンに最適化された新しいテーブル経由で公開します) 。この方法により、インジェストパイプラインを変更する必要はなく、データは引き続きデフォルトのテーブル名に送信され、すべての変更はユーザーからは透過的です。

:::note
既存データを新しいテーブルにバックフィルすることは、大規模環境では有益であることはまれです。コンピュートおよび IO コストが高くつくことが多く、そのパフォーマンス上の利点に見合いません。代わりに、古いデータは [有効期限 (TTL)](/use-cases/observability/clickstack/ttl) によって期限切れになるようにし、新しいデータのみが改善されたキーの恩恵を受けるようにします。
:::

<VerticalStepper headerLevel="h4">
  以下でも、主キーの先頭カラムとして `SeverityText` を導入する同じ例を使用します。この場合、新しいデータ用のテーブルを作成し、履歴分析のために古いテーブルを保持します。

  #### 新しいテーブルを作成する

  目的の主キーを持つ新しいテーブルを作成します。`_23_01_2025` の接尾辞に注意してください。これは現在の日付に合わせて変更してください。例:

  ```sql
  CREATE TABLE otel_logs_23_01_2025 AS otel_logs
  PRIMARY KEY (SeverityText, ServiceName, Timestamp)
  ORDER BY (SeverityText, ServiceName, Timestamp)
  ```

  #### Merge テーブルを作成する

  [Merge エンジン](/engines/table-engines/special/merge) (MergeTree と混同しないでください) は自分自身ではデータを保持せず、複数のテーブルから同時に読み取ることを可能にします。

  ```sql
  CREATE TABLE otel_logs_merge
  AS otel_logs
  ENGINE = Merge(currentDatabase(), 'otel_logs*')
  ```

  :::note
  `currentDatabase()` は、コマンドが正しいデータベース上で実行されることを前提としています。そうでない場合は、データベース名を明示的に指定してください。
  :::

  このテーブルをクエリすることで、`otel_logs` からデータが返されることを確認できます。

  #### ClickStack UI を更新して Merge テーブルから読み取る

  ClickStack UI を構成し、ログのログソース用テーブルとして `otel_logs_merge` を使用するようにします。

  <Image img={select_merge_table} size="lg" alt="Select Merge Table" />

  この時点では、書き込みは引き続き元の主キーを持つ `otel_logs` に対して行われ、読み取りは Merge テーブルを経由します。ユーザーから見える変更はなく、インジェストへの影響もありません。

  #### テーブルを入れ替える

  ここで、`EXCHANGE` ステートメントを使用して、`otel_logs` と `otel_logs_23_01_2025` テーブルの名前をアトミックに入れ替えます。

  ```sql
  EXCHANGE TABLES otel_logs AND otel_logs_23_01_2025
  ```

  これ以降、書き込みは更新された主キーを持つ新しい `otel_logs` テーブルに送られます。既存データは `otel_logs_23_01_2025` に残り、Merge テーブル経由で引き続きアクセス可能です。この接尾辞は変更を適用した日付を表し、そのテーブルに含まれる最新のタイムスタンプを示します。

  このプロセスにより、インジェストを中断することなく、かつユーザーから見て影響がない形で主キーを変更できます。
</VerticalStepper>

この手順は、主キーにさらに変更が必要になった場合にも応用できます。たとえば、1 週間後に、`SeverityText` ではなく `SeverityNumber` を主キーに含めるべきだと判断した場合です。以下の手順は、主キーの変更が必要になるたびに何度でも繰り返し適用できます。

<VerticalStepper headerLevel="h4">
  #### 新しいテーブルを作成する

  目的の主キーを持つ新しいテーブルを作成します。
  以下の例では、テーブルの日付を示す接尾辞として `30_01_2025` を使用しています。例:

  ```sql
  CREATE TABLE otel_logs_30_01_2025 AS otel_logs
  PRIMARY KEY (SeverityNumber, ServiceName, TimestampTime)
  ORDER BY (SeverityNumber, ServiceName, TimestampTime)
  ```

  #### テーブルを交換する

  次に、`EXCHANGE` ステートメントを使用して、`otel_logs` テーブルと `otel_logs_30_01_2025` テーブルの名前をアトミックに入れ替えます。

  ```sql
  EXCHANGE TABLES otel_logs AND otel_logs_30_01_2025
  ```

  以降、書き込みは更新後の主キーを持つ新しい `otel_logs` テーブルに送られます。古いデータは `otel_logs_30_01_2025` に残り、マージテーブル経由で引き続きアクセスできます。
</VerticalStepper>

:::note 冗長なテーブル
TTL ポリシーが設定されている場合 (推奨) 、古い主キーを持ち、すでに書き込みを受け付けていないテーブルは、データの有効期限が切れるにつれて徐々に空になります。これらのテーブルは監視し、データがなくなったら定期的にクリーンアップする必要があります。現時点では、このクリーンアップ作業は手動です。
:::

### block カラムによる行ルックアップの高速化

デフォルトの ClickStack のログスキーマでは、クエリのパフォーマンスに直接影響しないものの、
ClickStack UI での行詳細ルックアップを大幅に高速化する
2 つの MergeTree の設定が有効になっています:

```sql
SETTINGS enable_block_number_column = 1, enable_block_offset_column = 1
```

これらの設定により、テーブル内のすべての行は、パート内でその行を一意に識別する暗黙の
`(_block_number, _block_offset)` ペアを持つようになります。詳細パネルを開くために ClickStack UI でログ行をクリックすると、ClickStack
はその 1 行を取得するための追加クエリを発行します。ブロックカラムがない場合、
その行の `WHERE` 句には、その行を一意に特定できるだけのカラム — 通常は主キー
に `Body` と `SeverityText` を加えたもの — を含める必要があります。ブロックカラムがある場合は、
主キーに `_block_number` と `_block_offset` を加えるだけで十分です。`Body` のような大きな
カラムはルックアップ時には読み込まれないため、結果としてクエリが高速化されます。

ClickStack はテーブルの `CREATE` ステートメントからこの設定を検出し、
両方のカラムが有効になっている場合は、より簡潔な `WHERE` 句を自動的に生成します。アプリケーション設定の変更は
必要ありません。

既存のログまたはトレースのテーブルでこの最適化を有効にするには:

```sql
ALTER TABLE otel_logs
MODIFY SETTING enable_block_number_column = 1, enable_block_offset_column = 1
```

この設定は、`ALTER` の後に書き込まれたデータに適用されます。既存のパーツは、
マージで書き換えられるまで、引き続き従来の行単位のルックアップを使用します。

## 最適化 5. materialized viewの活用

<BetaBadge />

ClickStackでは、時間の経過に沿って1分ごとの平均リクエスト所要時間を計算するような、集約負荷の高いクエリを用いる可視化を高速化するために、[インクリメンタルmaterialized view](/materialized-view/incremental-materialized-view)を活用できます。この機能によりクエリパフォーマンスを大幅に向上でき、通常は1日あたり約10 TB以上の大規模環境で特に効果を発揮します。また、1日あたりPB級までのスケーリングも可能になります。インクリメンタルmaterialized viewはベータ版であるため、注意して使用してください。

ClickStackでこの機能を使用する方法の詳細については、専用ガイド[&quot;ClickStack - Materialized Views.&quot;](/use-cases/observability/clickstack/materialized_views)を参照してください。

## 最適化 6. PROJECTIONの活用

PROJECTIONは、materialized columns、スキップ索引、主キー、materialized view を検討したうえで次に考慮できる、最終段階の高度な最適化です。PROJECTIONと materialized view は一見似ていますが、ClickStack では役割が異なり、適した用途も異なります。

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

実際には、**PROJECTIONは、同じ行を** **異なる物理順序で** 保持する、追加の隠れたテーブルコピーと考えることができます。これにより、PROJECTIONは基となるテーブルの `ORDER BY` キーとは異なる独自のプライマリインデックスを持つことができ、元の並び順に合致しないアクセスパターンに対しても、ClickHouse はより効果的にデータを絞り込めます。

materialized view でも、異なる並び順キーを持つ別のターゲットテーブルに行を明示的に書き込むことで、同様の効果を得られます。重要な違いは、**PROJECTIONは ClickHouse によって自動的かつ透過的に維持される**のに対し、materialized view は ClickStack 側で明示的に登録し、意図的に選択して使う必要があるテーブルである点です。

クエリが基となるテーブルを対象とすると、ClickHouse は基底レイアウトと利用可能なPROJECTIONを評価し、それぞれのプライマリインデックスをサンプリングしたうえで、最小のグラニュール読み取りで正しい結果を返せるレイアウトを選択します。この判断はクエリアナライザによって自動的に行われます。

したがって ClickStack では、PROJECTIONは次のような**純粋なデータの並べ替え**に最も適しています。

* アクセスパターンがデフォルトの主キーと本質的に異なる
* 単一の並び順キーですべてのワークフローをカバーするのが現実的でない
* 最適な物理レイアウトを ClickHouse に透過的に選ばせたい

事前集約やメトリクス高速化については、ClickStack は **明示的な materialized view** を強く推奨します。これにより、アプリケーション層が view の選択と利用を完全に制御できます。

詳しくは、以下を参照してください。

* [PROJECTIONに関するガイド](/data-modeling/projections)
* [PROJECTIONを使用すべき場合](/data-modeling/projections#when-to-use-projections)
* [materialized view とPROJECTIONの比較](/managing-data/materialized-views-versus-projections)

### プロジェクションの例

traces テーブルがデフォルトの ClickStack のアクセスパターンに合わせて最適化されているとします。

```sql
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
```

TraceId でフィルタリングすることが多い主要なワークフロー（あるいは TraceId を軸に頻繁にグルーピングやフィルタリングを行うワークフロー）がある場合は、TraceId と時刻でソートされた行を格納する PROJECTION を追加できます。

```sql
ALTER TABLE otel_v2.otel_traces
ADD PROJECTION prj_traceid_time
(
    SELECT *
    ORDER BY (TraceId, toDateTime(Timestamp))
);
```

:::note ワイルドカードを使用する
上記のプロジェクションの例では、ワイルドカード（`SELECT *`）が使用されています。カラムの一部だけを選択すると書き込み時のオーバーヘッドを減らすことはできますが、そのカラムだけでクエリを完全に満たせる場合にしかプロジェクションを利用できないため、利用可能な場面が制限されます。ClickStack では、この制約によりプロジェクションの利用がごく限られたケースにとどまってしまうことがよくあります。このため、一般的には適用可能性を最大化するためにワイルドカードを使用することを推奨します。
:::

他のデータレイアウトの変更と同様に、プロジェクションは新しく書き込まれたパーツにのみ影響します。既存データに対しても構築するには、マテリアライズします。

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE PROJECTION prj_traceid_time;
```

:::note
projection のマテリアライズには長時間を要し、多くのリソースを消費する可能性があります。オブザーバビリティデータには通常 有効期限 (TTL) が設定されているため、これは本当に必要な場合にのみ実施すべきです。ほとんどのケースでは、新たに取り込むデータに対してのみ projection を適用し、直近24時間など、最も頻繁にクエリされる時間範囲を最適化させるだけで十分です。
:::

ClickHouse は、projection のほうがベースレイアウトよりも少ない granule を走査すると推定した場合、自動的にその projection を選択することがあります。projection は、完全な行セット（`SELECT *`）の単純な並べ替えを表しており、かつクエリフィルタが projection の `ORDER BY` と強く整合している場合に最も信頼性が高くなります。

TraceId でフィルタ（特に等価条件）し、かつ時間範囲を含むクエリは、上記の projection の恩恵を受けます。例えば次のようになります。

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

`TraceId` を制約しないクエリや、projection の並び替えキーの先頭ではない別のディメンションを主にフィルタ条件とするクエリは、通常は恩恵を受けません（代わりにベースレイアウト経由で読み込まれる可能性があります）。

:::note
projection には、集計結果を格納することもできます（materialized view に近いイメージです）。しかし ClickStack では、どのレイアウトが選択されるかが ClickHouse のアナライザに依存し、利用状況の制御や挙動の把握が難しくなるため、projection ベースの集計は一般的には推奨されません。代わりに、ClickStack がアプリケーション層で明示的に登録・選択できる materialized view を利用することを推奨します。
:::

実務上、projection は、広い検索結果からトレース中心のドリルダウンに頻繁にピボットするようなワークフロー（たとえば、特定の TraceId に属するすべての span を取得する処理）に最も適しています。

ORDER BY Timestamp;

-- Trace-scoped aggregation
SELECT
  toStartOfMinute(Timestamp) AS t,
  count() AS spans
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
GROUP BY t

### `_part_offset` を用いた軽量 projection {#lightweight-projections}

<BetaBadge/>

:::note[軽量 projection は ClickStack では Beta 機能です]
`_part_offset` ベースの軽量 projection は、ClickStack のワークロードには推奨されません。ストレージと書き込み I/O を削減できる一方で、クエリ実行時のランダムアクセスを増加させる可能性があり、オブザーバビリティ規模での本番環境での挙動については、まだ評価中です。この推奨事項は、機能の成熟と運用データの蓄積に伴い、将来的に変更される可能性があります。
:::

新しい ClickHouse のバージョンでは、projection のソートキーと、ベーステーブルへの `_part_offset` ポインタだけを保持し、完全な行を複製しない、より軽量な projection もサポートされています。これによりストレージのオーバーヘッドを大幅に削減でき、最近の改善により granule レベルでのプルーニングが可能になったことで、実質的なセカンダリ索引に近い挙動をするようになっています。詳細は次を参照してください。

- [`_part_offset` を用いたよりスマートなストレージ](/data-modeling/projections#smarter_storage_with_part_offset)
- [ブログでの解説と例](https://clickhouse.com/blog/projections-secondary-indices#example-combining-multiple-projection-indexes)

### コストと指針 {#projection-costs-and-guidance}

- **挿入時のオーバーヘッド**: 異なる並び替えキーを持つ `SELECT *` の projection は、実質的にデータを 2 回書き込むことになり、書き込み I/O が増加し、インジェストを維持するために追加の CPU およびディスクスループットが必要になる場合があります。
- **慎重に利用する**: projection は、2 つ目の物理的な並び順によって多くのクエリに対して有意なプルーニングが可能になるような、実際に多様なアクセスパターンが存在する場合に限定して利用するのが最適です。例えば、2 つのチームが同じデータセットに対して本質的に異なる方法でクエリを実行するようなケースです。
- **ベンチマークで検証する**: すべてのチューニングと同様に、projection を追加してマテリアライズする前後で、実際のクエリレイテンシーとリソース使用量を比較してください。
