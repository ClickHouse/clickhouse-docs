---
alias: []
description: 'Документация по формату Buffers'
input_format: true
keywords: ['Buffers']
output_format: true
slug: /interfaces/formats/Buffers
title: 'Buffers'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

`Buffers` — это очень простой двоичный формат для **эфемерного** обмена данными, при котором и потребитель, и поставщик уже знают схему и порядок столбцов.

В отличие от [Native](./Native.md), он **не** хранит имена столбцов, типы столбцов или какие-либо дополнительные метаданные.

В этом формате данные записываются и читаются по [блокам](/development/architecture#block) в двоичном виде. Buffers использует то же постолбцовое двоичное представление, что и формат [Native](./Native.md), и использует те же настройки формата Native.

Для каждого блока записывается следующая последовательность:

1. Количество столбцов (UInt64, little-endian).
2. Количество строк (UInt64, little-endian).
3. Для каждого столбца:

- Общий размер сериализованных данных столбца в байтах (UInt64, little-endian).
- Байты сериализованных данных столбца, в точности как в формате [Native](./Native.md).

## Пример использования {#example-usage}

Записать в файл:

```sql
SELECT
    number AS num,
    number * number AS num_square
FROM numbers(10)
INTO OUTFILE 'squares.buffers'
FORMAT Buffers;
```

Прочитать обратно с явным указанием типов столбцов:

```sql
SELECT
    *
FROM file(
    'squares.buffers',
    'Buffers',
    'col_1 UInt64, col_2 UInt64'
);
```

```txt
  ┌─col_1─┬─col_2─┐
  │     0 │     0 │
  │     1 │     1 │
  │     2 │     4 │
  │     3 │     9 │
  │     4 │    16 │
  │     5 │    25 │
  │     6 │    36 │
  │     7 │    49 │
  │     8 │    64 │
  │     9 │    81 │
  └───────┴───────┘
```

Если у вас есть таблица с теми же типами столбцов, её можно заполнить напрямую:

```sql
CREATE TABLE number_squares
(
    a UInt64,
    b UInt64
) ENGINE = Memory;

INSERT INTO number_squares
FROM INFILE 'squares.buffers'
FORMAT Buffers;
```

Просмотрите таблицу:

```sql
SELECT * FROM number_squares;
```

```txt
  ┌─a─┬──b─┐
  │ 0 │  0 │
  │ 1 │  1 │
  │ 2 │  4 │
  │ 3 │  9 │
  │ 4 │ 16 │
  │ 5 │ 25 │
  │ 6 │ 36 │
  │ 7 │ 49 │
  │ 8 │ 64 │
  │ 9 │ 81 │
  └───┴────┘
```


## Настройки формата {#format-settings}