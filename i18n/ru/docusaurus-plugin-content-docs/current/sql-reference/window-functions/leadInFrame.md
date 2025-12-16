---
description: 'Документация по оконной функции leadInFrame'
sidebar_label: 'leadInFrame'
sidebar_position: 10
slug: /sql-reference/window-functions/leadInFrame
title: 'leadInFrame'
doc_type: 'reference'
---

# leadInFrame {#leadinframe}

Возвращает значение, вычисленное для строки, которая находится через `offset` строк после текущей строки в упорядоченной рамке окна.

:::warning
Поведение `leadInFrame` отличается от стандартной оконной функции SQL `lead`.
Оконная функция ClickHouse `leadInFrame` учитывает рамку окна.
Чтобы получить поведение, идентичное `lead`, используйте `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.
:::

**Синтаксис**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Для более подробной информации о синтаксисе оконных функций см. раздел [Window Functions - Syntax](./index.md/#syntax).

**Параметры**

* `x` — имя столбца.
* `offset` — смещение, которое нужно применить. [(U)Int*](../data-types/int-uint.md). (Необязательный параметр — по умолчанию `1`).
* `default` — значение, возвращаемое, если рассчитанная строка выходит за границы оконного фрейма. (Необязательный параметр — при отсутствии используется значение по умолчанию для типа столбца).

**Возвращаемое значение**

* значение, вычисленное для строки, которая расположена на `offset` строк после текущей строки внутри упорядоченного фрейма.

**Пример**

В этом примере используется [исторический набор данных](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data) по лауреатам Нобелевской премии и функция `leadInFrame` для вывода списка последовательных лауреатов в категории «Физика».

Запрос:

```sql
CREATE OR REPLACE VIEW nobel_prize_laureates
AS SELECT *
FROM file('nobel_laureates_data.csv');
```

```sql
SELECT
    fullName,
    leadInFrame(year, 1, year) OVER (PARTITION BY category ORDER BY year ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS year,
    category,
    motivation
FROM nobel_prize_laureates
WHERE category = 'physics'
ORDER BY year DESC
LIMIT 9
```

Результат:

```response
   ┌─fullName─────────┬─year─┬─category─┬─motivation─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
2. │ Pierre Agostini  │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
3. │ Ferenc Krausz    │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
4. │ Alain Aspect     │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
5. │ Anton Zeilinger  │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
6. │ John Clauser     │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
7. │ Giorgio Parisi   │ 2021 │ physics  │ for the discovery of the interplay of disorder and fluctuations in physical systems from atomic to planetary scales                │
8. │ Klaus Hasselmann │ 2021 │ physics  │ for the physical modelling of Earths climate quantifying variability and reliably predicting global warming                        │
9. │ Syukuro Manabe   │ 2021 │ physics  │ for the physical modelling of Earths climate quantifying variability and reliably predicting global warming                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
