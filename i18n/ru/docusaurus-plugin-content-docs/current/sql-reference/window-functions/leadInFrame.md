---
slug: '/sql-reference/window-functions/leadInFrame'
sidebar_label: leadInFrame
sidebar_position: 10
description: 'Документация для функции окна leadInFrame'
title: leadInFrame
doc_type: reference
---
# leadInFrame

Возвращает значение, вычисленное для строки, которая смещена на определенное количество строк после текущей строки внутри упорядоченной области.

:::warning
Поведение функции `leadInFrame` отличается от стандартной SQL функции окна `lead`.
Функция окна ClickHouse `leadInFrame` учитывает рамки окна.
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

Для получения более подробной информации о синтаксисе функций окна смотрите: [Функции окна - Синтаксис](./index.md/#syntax).

**Параметры**
- `x` — Имя колонки.
- `offset` — Смещение для применения. [(U)Int*](../data-types/int-uint.md). (Необязательный - по умолчанию `1`).
- `default` — Значение, которое возвращается, если вычисленная строка превышает границы рамки окна. (Необязательный - значение по умолчанию для типа колонки, если опущено).

**Возвращаемое значение**

- значение, вычисленное для строки, которая смещена на определенное количество строк после текущей строки внутри упорядоченной области.

**Пример**

В этом примере рассматриваются [исторические данные](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data) о лауреатах Нобелевской премии и используется функция `leadInFrame` для возвращения списка последовательных лауреатов в категории физики.

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