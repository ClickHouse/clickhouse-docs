---
slug: /use-cases/observability/clickstack/ingesting-data/trace-sampling
title: "トレースサンプリング"
sidebar_label: "トレースサンプリング"
pagination_prev: null
pagination_next: null
description: "ClickStackで、サンプリングされたトレースデータの重み付き集計を設定します。"
doc_type: "guide"
keywords: ["clickstack", "トレースサンプリング", "テールサンプリング", "サンプル率", "重み付き集計", "OpenTelemetry", "SampleRate"]
---

import Image from "@theme/IdealImage"
import trace_sampling_source_settings from "@site/static/images/clickstack/trace-sampling-source-settings.png"

高スループットのサービスでは、1 秒あたり数百万ものスパンが生成されることがあります。すべてのスパンを保存するのは高コストなため、通常、チームは OpenTelemetry Collector の [tail-sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor) を使用して、N 件に 1 件のスパンだけを保持します。保持された各スパンには、N を記録する `SampleRate` 属性が付与されます。

データがサンプリングされると、単純な集計では正しい結果が得られません。`count()` は実際に発生したイベント数より N 倍少ない値を返し、`sum()` と `avg()` には偏りが生じ、パーセンタイルもずれます。その結果、ダッシュボードには、実際より少ないリクエスト数、処理量、エラー率が表示されてしまいます。

ClickStack は、サンプリングを考慮したクエリエンジンによってこの問題を解決します。トレースソースにサンプルレート式を設定すると、クエリビルダーは SQL の集計を書き換え、各スパンがそのサンプルレートに応じて重み付けされるようにします。これは、ダッシュボード、アラート、アドホック検索全体にわたって適用されます。

## 仕組み \{#how-it-works\}

トレースソースに `sampleRateExpression` が設定されている場合、ClickStack は次のようにラップします:

```sql
greatest(toUInt64OrZero(toString(expr)), 1)
```

`SampleRate` 属性を持たないスパンの重みはデフォルトで 1 になるため、サンプリングされていないデータでは元のクエリと同じ結果になります。

その後、クエリビルダーが集計を書き換えます。

| 集計                 | 変更前                | 変更後 (サンプリング補正後)                           |
| ------------------ | ------------------ | ----------------------------------------- |
| count              | `count()`          | `sum(weight)`                             |
| count + condition  | `countIf(cond)`    | `sumIf(weight, cond)`                     |
| avg                | `avg(col)`         | `sum(col * weight) / sum(weight)`         |
| sum                | `sum(col)`         | `sum(col * weight)`                       |
| quantile(p)        | `quantile(p)(col)` | `quantileTDigestWeighted(p)(col, weight)` |
| min / max          | 変更なし               | 変更なし                                      |
| count&#95;distinct | 変更なし               | 変更なし                                      |

:::note
サンプリング時のパーセンタイルには、近似的な T-Digest スケッチである `quantileTDigestWeighted` を使用します。結果は近似値であり、完全に一致するわけではありません。
:::

## サンプルレート式の設定 \{#configuring\}

**Source Settings** でトレースソースを開き、**Sample Rate Expression** フィールドに、スパンごとのサンプルレートを返す ClickHouse 式を入力します。

たとえば、OpenTelemetry の tail-sampling プロセッサがそのレートを `SpanAttributes['SampleRate']` に書き込む場合:

<Image img={trace_sampling_source_settings} alt="ClickStack の Source Settings にある Sample Rate Expression フィールド" size="lg" />

設定が完了すると、すべてのチャート、ダッシュボード、アラート、サービスダッシュボードのパネルに、サンプルレートを重み付けに用いた集計が自動的に適用されます。個々のクエリを変更する必要はありません。