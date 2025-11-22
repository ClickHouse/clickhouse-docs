---
alias: []
description: 'Документация по формату Npy'
input_format: true
keywords: ['Npy']
output_format: true
slug: /interfaces/formats/Npy
title: 'Npy'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Описание {#description}

Формат `Npy` предназначен для загрузки массива NumPy из файла `.npy` в ClickHouse.
Формат файлов NumPy — это бинарный формат, используемый для эффективного хранения массивов числовых данных.
При импорте ClickHouse рассматривает измерение верхнего уровня как массив строк с одним столбцом.

В таблице ниже приведены поддерживаемые типы данных Npy и соответствующие им типы в ClickHouse:


## Соответствие типов данных {#data_types-matching}

| Тип данных Npy (`INSERT`) | Тип данных ClickHouse                                    | Тип данных Npy (`SELECT`) |
| ------------------------ | ------------------------------------------------------- | ------------------------ |
| `i1`                     | [Int8](/sql-reference/data-types/int-uint.md)           | `i1`                     |
| `i2`                     | [Int16](/sql-reference/data-types/int-uint.md)          | `i2`                     |
| `i4`                     | [Int32](/sql-reference/data-types/int-uint.md)          | `i4`                     |
| `i8`                     | [Int64](/sql-reference/data-types/int-uint.md)          | `i8`                     |
| `u1`, `b1`               | [UInt8](/sql-reference/data-types/int-uint.md)          | `u1`                     |
| `u2`                     | [UInt16](/sql-reference/data-types/int-uint.md)         | `u2`                     |
| `u4`                     | [UInt32](/sql-reference/data-types/int-uint.md)         | `u4`                     |
| `u8`                     | [UInt64](/sql-reference/data-types/int-uint.md)         | `u8`                     |
| `f2`, `f4`               | [Float32](/sql-reference/data-types/float.md)           | `f4`                     |
| `f8`                     | [Float64](/sql-reference/data-types/float.md)           | `f8`                     |
| `S`, `U`                 | [String](/sql-reference/data-types/string.md)           | `S`                      |
|                          | [FixedString](/sql-reference/data-types/fixedstring.md) | `S`                      |


## Примеры использования {#example-usage}

### Сохранение массива в формате .npy с использованием Python {#saving-an-array-in-npy-format-using-python}

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### Чтение файла NumPy в ClickHouse {#reading-a-numpy-file-in-clickhouse}

```sql title="Запрос"
SELECT *
FROM file('example_array.npy', Npy)
```

```response title="Результат"
┌─array─────────┐
│ [[1],[2],[3]] │
│ [[4],[5],[6]] │
└───────────────┘
```

### Выборка данных {#selecting-data}

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в файл в формате Npy, используя следующую команду clickhouse-client:

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```


## Настройки формата {#format-settings}
