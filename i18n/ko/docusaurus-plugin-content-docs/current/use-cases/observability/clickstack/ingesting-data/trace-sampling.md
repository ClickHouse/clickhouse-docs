---
slug: /use-cases/observability/clickstack/ingesting-data/trace-sampling
title: "트레이스 샘플링"
sidebar_label: "트레이스 샘플링"
pagination_prev: null
pagination_next: null
description: "ClickStack에서 샘플링된 트레이스 데이터에 대한 샘플 가중 집계를 구성합니다."
doc_type: "guide"
keywords: ["ClickStack", "트레이스 샘플링", "테일 샘플링", "샘플 비율", "가중 집계", "OpenTelemetry", "SampleRate"]
---

import Image from "@theme/IdealImage"
import trace_sampling_source_settings from "@site/static/images/clickstack/trace-sampling-source-settings.png"

처리량이 높은 서비스는 초당 수백만 개의 스팬을 생성할 수 있습니다. 모든 스팬을 저장하는 것은 비용이 많이 들기 때문에, 일반적으로 OpenTelemetry Collector의 [tail-sampling 프로세서](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)를 실행해 N개 중 1개의 스팬만 유지합니다. 유지된 각 스팬에는 N 값을 기록하는 `SampleRate` 속성이 포함됩니다.

데이터가 샘플링되면 단순 집계는 정확하지 않습니다. `count()`는 실제 발생한 이벤트보다 N배 적은 값을 반환하고, `sum()`과 `avg()`에는 편향이 생기며, 백분위수도 달라집니다. 대시보드에는 요청 수, 처리량, 오류율이 실제보다 낮게 표시되어 오해를 불러올 수 있습니다.

ClickStack은 샘플링을 인식하는 쿼리 엔진으로 이 문제를 해결합니다. 트레이스 소스에 샘플 비율 표현식을 구성하면, 쿼리 빌더가 SQL 집계를 재작성해 각 스팬에 샘플 비율에 따른 가중치를 적용합니다. 이 방식은 대시보드, 알림, 애드혹 검색 전반에 적용됩니다.

## 작동 방식 \{#how-it-works\}

트레이스 소스에 `sampleRateExpression`이 설정되어 있으면 ClickStack은 이를 다음과 같이 래핑합니다:

```sql
greatest(toUInt64OrZero(toString(expr)), 1)
```

`SampleRate` 속성이 없는 스팬은 기본 가중치 1로 처리되므로, 샘플링되지 않은 데이터는 원래 쿼리와 동일한 결과를 반환합니다.

그런 다음 쿼리 빌더는 집계를 재작성합니다:

| 집계                 | 이전                 | 이후 (샘플 보정 후)                              |
| ------------------ | ------------------ | ----------------------------------------- |
| count              | `count()`          | `sum(weight)`                             |
| count + 조건         | `countIf(cond)`    | `sumIf(weight, cond)`                     |
| avg                | `avg(col)`         | `sum(col * weight) / sum(weight)`         |
| sum                | `sum(col)`         | `sum(col * weight)`                       |
| quantile(p)        | `quantile(p)(col)` | `quantileTDigestWeighted(p)(col, weight)` |
| min / max          | 변경 없음              | 변경 없음                                     |
| count&#95;distinct | 변경 없음              | 변경 없음                                     |

:::note
샘플링 시 백분위수는 근사 T-Digest 스케치인 `quantileTDigestWeighted`를 사용합니다. 결과는 유사하지만 정확히 일치하지는 않습니다.
:::

## 샘플 비율 표현식 구성하기 \{#configuring\}

**Source Settings**에서 트레이스 소스를 열고 **Sample Rate Expression** 필드에 스팬별 샘플 비율을 계산하는 ClickHouse 표현식을 입력하십시오.

예를 들어, OpenTelemetry tail-sampling 프로세서가 비율을 `SpanAttributes['SampleRate']`에 기록하는 경우는 다음과 같습니다:

<Image img={trace_sampling_source_settings} alt="ClickStack Source Settings의 Sample Rate Expression 필드" size="lg" />

구성이 완료되면 모든 차트, 대시보드, 경고, 서비스 대시보드 패널에 샘플 가중치가 적용된 집계가 자동으로 적용됩니다. 개별 쿼리를 변경할 필요는 없습니다.