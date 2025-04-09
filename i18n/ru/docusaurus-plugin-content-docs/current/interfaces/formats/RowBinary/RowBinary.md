---
alias: []
description: 'Документация по формату RowBinary'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `RowBinary` разбирает данные по строкам в бинарном формате. 
Строки и значения перечислены последовательно, без разделителей. 
Поскольку данные находятся в бинарном формате, разделитель после `FORMAT RowBinary` строго определяется следующим образом: 

- Любое количество пробелов:
  - `' '` (пробел - код `0x20`)
  - `'\t'` (табуляция - код `0x09`)
  - `'\f'` (разделитель страницы - код `0x0C`) 
- За которым следует ровно одна новая строка:
  - В стиле Windows `"\r\n"` 
  - или в стиле Unix `'\n'`
- Сразу за этим следует бинарные данные.

:::note
Этот формат менее эффективен, чем формат [Native](../Native.md), поскольку он основан на строках.
:::

Для следующих типов данных важно отметить, что:

- [Целые числа](../../../sql-reference/data-types/int-uint.md) используют фиксированное представление в формате little-endian. Например, `UInt64` использует 8 байт.
- [DateTime](../../../sql-reference/data-types/datetime.md) представлен как `UInt32`, содержащий Unix timestamp в качестве значения.
- [Дата](../../../sql-reference/data-types/date.md) представлена как объект UInt16, который содержит количество дней с `1970-01-01` в качестве значения.
- [Строка](../../../sql-reference/data-types/string.md) представлена как целое число переменной длины (varint) (беззнаковое [`LEB128`](https://en.wikipedia.org/wiki/LEB128)), за которым следуют байты строки.
- [FixedString](../../../sql-reference/data-types/fixedstring.md) представляется просто как последовательность байтов.
- [Массивы](../../../sql-reference/data-types/array.md) представлены как целое число переменной длины (varint) (беззнаковое [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которым следуют последующие элементы массива.

Для поддержки [NULL](/sql-reference/syntax#null) добавляется дополнительный байт, содержащий `1` или `0`, перед каждым [Nullable](/sql-reference/data-types/nullable.md) значением. 
- Если `1`, то значение является `NULL`, и этот байт интерпретируется как отдельное значение. 
- Если `0`, значение после байта не является `NULL`.

Для сравнения формата `RowBinary` и формата `RawBlob` см. [Сравнение сырьевых форматов](../RawBLOB.md/#raw-formats-comparison)

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>
