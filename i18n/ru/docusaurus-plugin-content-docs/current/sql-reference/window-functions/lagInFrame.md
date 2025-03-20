---
slug: /sql-reference/window-functions/lagInFrame
sidebar_label: lagInFrame
sidebar_position: 9
---


# lagInFrame

Возвращает значение, вычисляемое на строке, которая находится на заданном физическом смещении перед текущей строкой в пределах упорядоченной рамки.

:::warning
Поведение `lagInFrame` отличается от стандартной SQL функции `lag`.
Функция окон `lagInFrame` в ClickHouse учитывает оконную рамку.
Чтобы получить поведение, идентичное `lag`, используйте `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.
:::

**Синтаксис**

```sql
lagInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

Для получения более детальной информации о синтаксисе оконных функций смотрите: [Оконные функции - Синтаксис](./index.md/#syntax).

**Параметры**
- `x` — имя колонки.
- `offset` — смещение, которое необходимо применить. [(U)Int*](../data-types/int-uint.md). (Необязательно - по умолчанию `1`).
- `default` — значение, возвращаемое, если вычисленная строка превышает границы оконной рамки. (Необязательно - значение по умолчанию для типа колонки при пропуске).

**Возвращаемое значение**

- Значение, вычисляемое на строке, которая находится на заданном физическом смещении перед текущей строкой в пределах упорядоченной рамки.

**Пример**

В этом примере рассматриваются исторические данные по конкретной акции и используется функция `lagInFrame`, чтобы вычислить изменение цены закрытия акции от дня к дню и процентное изменение.

Запрос:

```sql
CREATE TABLE stock_prices
(
    `date`   Date,
    `open`   Float32, -- цена открытия
    `high`   Float32, -- дневной максимум
    `low`    Float32, -- дневной минимум
    `close`  Float32, -- цена закрытия
    `volume` UInt32   -- объем торгов
)
Engine = Memory;

INSERT INTO stock_prices FORMAT Values
    ('2024-06-03', 113.62, 115.00, 112.00, 115.00, 438392000),
    ('2024-06-04', 115.72, 116.60, 114.04, 116.44, 403324000),
    ('2024-06-05', 118.37, 122.45, 117.47, 122.44, 528402000),
    ('2024-06-06', 124.05, 125.59, 118.32, 121.00, 664696000),
    ('2024-06-07', 119.77, 121.69, 118.02, 120.89, 412386000);
```

```sql
SELECT
    date,
    close,
    lagInFrame(close, 1, close) OVER (ORDER BY date ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
     ) AS previous_day_close,
    COALESCE(ROUND(close - previous_day_close, 2)) AS delta,
    COALESCE(ROUND((delta / previous_day_close) * 100, 2)) AS percent_change
FROM stock_prices
ORDER BY date DESC
```

Результат:

```response
   ┌───────date─┬──close─┬─previous_day_close─┬─delta─┬─percent_change─┐
1. │ 2024-06-07 │ 120.89 │                121 │ -0.11 │          -0.09 │
2. │ 2024-06-06 │    121 │             122.44 │ -1.44 │          -1.18 │
3. │ 2024-06-05 │ 122.44 │             116.44 │     6 │           5.15 │
4. │ 2024-06-04 │ 116.44 │                115 │  1.44 │           1.25 │
5. │ 2024-06-03 │    115 │                115 │     0 │              0 │
   └────────────┴────────┴────────────────────┴───────┴────────────────┘
```
