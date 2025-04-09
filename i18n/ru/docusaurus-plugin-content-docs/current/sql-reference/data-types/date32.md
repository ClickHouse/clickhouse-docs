---
description: 'Документация для типа данных Date32 в ClickHouse, который хранит даты
  с расширенным диапазоном по сравнению с Date'
sidebar_label: 'Date32'
sidebar_position: 14
slug: /sql-reference/data-types/date32
title: 'Date32'
---


# Date32

Дата. Поддерживает тот же диапазон дат, что и [DateTime64](../../sql-reference/data-types/datetime64.md). Хранится как знаковое 32-битное целое число в родном порядке байтов, где значение представляет количество дней с 1970-01-01 (0 представляет 1970-01-01, а отрицательные значения представляют дни до 1970 года).

**Примеры**

Создание таблицы с колонкой типа `Date32` и вставка данных в неё:

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Парсинг даты
-- - из строки,
-- - из 'маленького' целого числа, интерпретируемого как количество дней с 1970-01-01, и
-- - из 'большого' целого числа, интерпретируемого как количество секунд с 1970-01-01.
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

```text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
└────────────┴──────────┘
```

**См. Также**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
