---
alias: []
description: 'Документация по формату RowBinary'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |


## Описание \\{#description\\}

Формат `RowBinary` разбирает данные по строкам в двоичном виде. 
Строки и значения идут последовательно, без разделителей. 
Поскольку данные представлены в двоичном формате, разделитель после `FORMAT RowBinary` строго задан следующим образом: 

- Произвольное количество пробельных символов:
  - `' '` (пробел — код `0x20`)
  - `'\t'` (табуляция — код `0x09`)
  - `'\f'` (form feed — код `0x0C`) 
- После чего следует ровно одна последовательность перевода строки:
  - в стиле Windows `"\r\n"` 
  - или в стиле Unix `'\n'`
- Сразу после этого идут двоичные данные.

:::note
Этот формат менее эффективен, чем формат [Native](../Native.md), поскольку он построчный.
:::

Для следующих типов данных важно отметить, что:

- [Integers](../../../sql-reference/data-types/int-uint.md) используют фиксированное представление в формате little-endian. Например, `UInt64` использует 8 байт.
- [DateTime](../../../sql-reference/data-types/datetime.md) представляется как `UInt32`, содержащее в качестве значения Unix timestamp.
- [Date](../../../sql-reference/data-types/date.md) представляется как значение типа `UInt16`, которое содержит количество дней, прошедших с `1970-01-01`.
- [String](../../../sql-reference/data-types/string.md) представляется как целое число переменной длины (varint) (беззнаковый [`LEB128`](https://en.wikipedia.org/wiki/LEB128)), за которым следуют байты строки.
- [FixedString](../../../sql-reference/data-types/fixedstring.md) представляется просто как последовательность байт.
- [Arrays](../../../sql-reference/data-types/array.md) представляются как целое число переменной длины (varint) (беззнаковый [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которым следуют элементы массива по порядку.

Для поддержки [NULL](/sql-reference/syntax#null) перед каждым значением типа [Nullable](/sql-reference/data-types/nullable.md) добавляется дополнительный байт, содержащий `1` или `0`. 
- Если `1`, то значение — `NULL`, и этот байт интерпретируется как отдельное значение. 
- Если `0`, значение после байта не является `NULL`.

Для сравнения форматов `RowBinary` и `RawBlob` см. раздел: [Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)



## Пример использования \\{#example-usage\\}



## Параметры формата \\{#format-settings\\}

<RowBinaryFormatSettings/>