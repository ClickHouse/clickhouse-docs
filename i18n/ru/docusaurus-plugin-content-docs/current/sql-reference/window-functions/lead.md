---
description: 'Документация об оконной функции lead'
sidebar_label: 'lead'
sidebar_position: 10
slug: /sql-reference/window-functions/lead
title: 'lead'
doc_type: 'reference'
---

# lead \\{#lead\\}

Возвращает значение, вычисленное в строке, которая находится на `offset` строк ниже текущей строки в упорядоченном окне.
Эта функция похожа на [`leadInFrame`](./leadInFrame.md), но всегда использует окно `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.

**Синтаксис**

```sql
lead(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Для получения более подробной информации о синтаксисе оконных функций см. [Window Functions - Syntax](./index.md/#syntax).

**Параметры**

* `x` — имя столбца.
* `offset` — смещение, которое нужно применить. [(U)Int*](../data-types/int-uint.md). (Необязательный параметр — по умолчанию `1`).
* `default` — значение, которое возвращается, если вычисленная строка выходит за границы окна. (Необязательный параметр — при отсутствии используется значение по умолчанию для типа столбца).

**Возвращаемое значение**

* значение, вычисленное в строке, которая находится на `offset` строк после текущей строки в пределах упорядоченного фрейма.

**Пример**

В этом примере рассматриваются [исторические данные](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data) о лауреатах Нобелевской премии и используется функция `lead` для получения списка последующих лауреатов в категории «Физика».

```sql title="Query"
CREATE OR REPLACE VIEW nobel_prize_laureates
AS SELECT *
FROM file('nobel_laureates_data.csv');
```

```sql title="Query"
SELECT
    fullName,
    lead(year, 1, year) OVER (PARTITION BY category ORDER BY year ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS year,
    category,
    motivation
FROM nobel_prize_laureates
WHERE category = 'physics'
ORDER BY year DESC
LIMIT 9
```

```response title="Query"
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
