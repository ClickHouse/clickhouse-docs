---
'description': 'Документация для функции оконного lead'
'sidebar_label': 'lead'
'sidebar_position': 10
'slug': '/sql-reference/window-functions/lead'
'title': 'lead'
'doc_type': 'reference'
---
# lead

Возвращает значение, вычисленное в строке, которая находится на определённое количество строк после текущей строки в упорядоченной области. Эта функция аналогична [`leadInFrame`](./leadInFrame.md), но всегда использует область `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.

**Синтаксис**

```sql
lead(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Для получения дополнительной информации о синтаксисе функций окон посмотрите: [Window Functions - Syntax](./index.md/#syntax).

**Параметры**

- `x` — Имя колонки.
- `offset` — Смещение, которое нужно применить. [(U)Int*](../data-types/int-uint.md). (Необязательный - по умолчанию `1`).
- `default` — Значение, которое будет возвращено, если вычисленная строка превышает границы оконной области. (Необязательный - значение по умолчанию по типу колонки при пропуске).

**Возвращаемое значение**

- значение, вычисленное в строке, которая находится на смещение строк после текущей строки в упорядоченной области.

**Пример**

В этом примере рассматриваются [исторические данные](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data) о лауреатах Нобелевской премии, и используется функция `lead` для возвращения списка последовательных лауреатов в категории физики.

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