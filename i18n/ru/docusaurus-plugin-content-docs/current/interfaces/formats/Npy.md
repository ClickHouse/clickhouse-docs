---
alias: []
description: 'Документация формата Npy'
input_format: true
keywords: ['Npy']
output_format: true
slug: /interfaces/formats/Npy
title: 'Npy'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |



## Описание {#description}

Формат `Npy` предназначен для загрузки массива NumPy из файла `.npy` в ClickHouse. 
Формат файла NumPy — это бинарный формат, используемый для эффективного хранения массивов числовых данных. 
Во время импорта ClickHouse рассматривает внешнюю размерность массива как массив строк с одним столбцом. 

В таблице ниже приведены поддерживаемые типы данных Npy и соответствующие им типы в ClickHouse:



## Соответствие типов данных {#data_types-matching}

| Тип данных Npy (`INSERT`) | Тип данных ClickHouse                                         | Тип данных Npy (`SELECT`) |
|---------------------------|----------------------------------------------------------------|---------------------------|
| `i1`                      | [Int8](/sql-reference/data-types/int-uint.md)                 | `i1`                      |
| `i2`                      | [Int16](/sql-reference/data-types/int-uint.md)                | `i2`                      |
| `i4`                      | [Int32](/sql-reference/data-types/int-uint.md)                | `i4`                      |
| `i8`                      | [Int64](/sql-reference/data-types/int-uint.md)                | `i8`                      |
| `u1`, `b1`                | [UInt8](/sql-reference/data-types/int-uint.md)                | `u1`                      |
| `u2`                      | [UInt16](/sql-reference/data-types/int-uint.md)               | `u2`                      |
| `u4`                      | [UInt32](/sql-reference/data-types/int-uint.md)               | `u4`                      |
| `u8`                      | [UInt64](/sql-reference/data-types/int-uint.md)               | `u8`                      |
| `f2`, `f4`                | [Float32](/sql-reference/data-types/float.md)                 | `f4`                      |
| `f8`                      | [Float64](/sql-reference/data-types/float.md)                 | `f8`                      |
| `S`, `U`                  | [String](/sql-reference/data-types/string.md)                 | `S`                       |
|                           | [FixedString](/sql-reference/data-types/fixedstring.md)       | `S`                       |



## Пример использования

### Сохранение массива в формате .npy на Python

```Python
import numpy as np
arr = np.array([[[1],[2],[3]],[[4],[5],[6]]])
np.save('example_array.npy', arr)
```

### Чтение файлов NumPy в ClickHouse

```sql title="Query"
SELECT *
FROM file('example_array.npy', Npy)
```

```response title="Response"
┌─array─────────┐
│ [[1],[2],[3]] │
│ [[4],[5],[6]] │
└───────────────┘
```

### Выбор данных

Вы можете выбрать данные из таблицы ClickHouse и сохранить их в файл формата Npy с помощью следующей команды clickhouse-client:

```bash
$ clickhouse-client --query="SELECT {column} FROM {some_table} FORMAT Npy" > {filename.npy}
```


## Настройки формата {#format-settings}
