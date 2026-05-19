---
slug: /use-cases/observability/clickstack/ingesting-data/trace-sampling
title: "Сэмплирование трейсов"
sidebar_label: "Сэмплирование трейсов"
pagination_prev: null
pagination_next: null
description: "Настройте агрегации, взвешенные по коэффициенту выборки, для выборочных данных трейсов в ClickStack."
doc_type: "guide"
keywords: ["ClickStack", "сэмплирование трейсов", "хвостовое сэмплирование", "коэффициент выборки", "взвешенные агрегации", "OpenTelemetry", "SampleRate"]
---

import Image from "@theme/IdealImage"
import trace_sampling_source_settings from "@site/static/images/clickstack/trace-sampling-source-settings.png"

Сервисы с высокой пропускной способностью могут генерировать миллионы спанов в секунду. Хранить каждый спан дорого, поэтому команды обычно используют [процессор tail-sampling](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor) в OpenTelemetry collector, чтобы сохранять только один спан из N. Каждый сохранённый спан несёт атрибут `SampleRate`, в котором записано значение N.

После применения выборки наивные агрегации дают неверный результат: `count()` возвращает в N раз меньше событий, чем произошло на самом деле, `sum()` и `avg()` оказываются смещёнными, а процентильные значения сдвигаются. Дашборды показывают обманчиво низкие значения числа запросов, пропускной способности и частоты ошибок.

ClickStack решает эту проблему с помощью движка запросов, учитывающего выборку. Когда вы настраиваете выражение коэффициента выборки для источника трейсов, конструктор запросов переписывает SQL-агрегации так, чтобы вес каждого спана соответствовал его коэффициенту выборки, — во всех дашбордах, оповещениях и ad hoc-поисках.

## Как это работает \{#how-it-works\}

Если для источника трейсов задано `sampleRateExpression`, ClickStack оборачивает его так:

```sql
greatest(toUInt64OrZero(toString(expr)), 1)
```

Спаны без атрибута `SampleRate` по умолчанию имеют вес 1, поэтому данные без выборки дают те же результаты, что и исходные запросы.

Затем конструктор запросов переписывает агрегатные выражения:

| Агрегация          | До                 | После (с поправкой на выборку)            |
| ------------------ | ------------------ | ----------------------------------------- |
| count              | `count()`          | `sum(weight)`                             |
| count + condition  | `countIf(cond)`    | `sumIf(weight, cond)`                     |
| avg                | `avg(col)`         | `sum(col * weight) / sum(weight)`         |
| sum                | `sum(col)`         | `sum(col * weight)`                       |
| quantile(p)        | `quantile(p)(col)` | `quantileTDigestWeighted(p)(col, weight)` |
| min / max          | без изменений      | без изменений                             |
| count&#95;distinct | без изменений      | без изменений                             |

:::note
Для процентилей при выборке используется `quantileTDigestWeighted` — приближённый скетч T-Digest. Результаты близки к точным, но не совпадают с ними полностью.
:::

## Настройка выражения коэффициента выборки \{#configuring\}

Откройте источник трейсов в **Настройках источника** и введите в поле **Sample Rate Expression** выражение ClickHouse, которое вычисляет коэффициент выборки для каждого спана.

Например, если ваш процессор tail-sampling в OpenTelemetry записывает это значение в `SpanAttributes['SampleRate']`:

<Image img={trace_sampling_source_settings} alt="Поле Sample Rate Expression в настройках источника ClickStack" size="lg" />

После настройки все графики, дашборды, оповещения и панели дашборда сервиса автоматически применяют агрегации с учетом выборки. Отдельные запросы менять не нужно.