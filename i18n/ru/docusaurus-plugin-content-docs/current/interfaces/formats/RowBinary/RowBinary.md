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

Формат `RowBinary` обрабатывает данные построчно в двоичном формате. 
Строки и значения перечислены последовательно, без разделителей. 
Поскольку данные находятся в двоичном формате, разделитель после `FORMAT RowBinary` строго указан следующим образом: 

- Любое количество пробелов:
  - `' '` (пробел - код `0x20`)
  - `'\t'` (табуляция - код `0x09`)
  - `'\f'` (первая страница - код `0x0C`) 
- За которым следует ровно одна последовательность новой строки:
  - Стиль Windows `"\r\n"` 
  - или стиль Unix `'\n'`
- Сразу за которым следуют двоичные данные.

:::note
Этот формат менее эффективен, чем формат [Native](../Native.md), поскольку он основан на строках.
:::

Для следующих типов данных важно отметить, что:

- [Целые числа](../../../sql-reference/data-types/int-uint.md) используют представление фиксированной длины little-endian. Например, `UInt64` использует 8 байт.
- [DateTime](../../../sql-reference/data-types/datetime.md) представлен как `UInt32`, содержащий значение Unix timestamp.
- [Дата](../../../sql-reference/data-types/date.md) представлена как объект UInt16, который содержит количество дней с даты `1970-01-01`.
- [Строка](../../../sql-reference/data-types/string.md) представлена как целое число переменной длины (varint) (без знака [`LEB128`](https://en.wikipedia.org/wiki/LEB128)), за которым следуют байты строки.
- [FixedString](../../../sql-reference/data-types/fixedstring.md) представлена просто как последовательность байтов.
- [Массивы](../../../sql-reference/data-types/array.md) представлены как целое число переменной длины (varint) (без знака [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которым следуют последовательные элементы массива.

Для поддержки [NULL](/sql-reference/syntax#null) перед каждым значением [Nullable](/sql-reference/data-types/nullable.md) добавляется дополнительный байт, содержащий `1` или `0`. 
- Если `1`, тогда значение является `NULL`, и этот байт интерпретируется как отдельное значение. 
- Если `0`, тогда значение после байта не является `NULL`.

Для сравнения формата `RowBinary` и формата `RawBlob` смотрите: [Сравнение сырых форматов](../RawBLOB.md/#raw-formats-comparison)

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>
