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


## Описание {#description}

Формат `RowBinary` обрабатывает данные построчно в бинарном формате.
Строки и значения перечисляются последовательно, без разделителей.
Поскольку данные представлены в бинарном формате, разделитель после `FORMAT RowBinary` строго определён следующим образом:

- Любое количество пробельных символов:
  - `' '` (пробел — код `0x20`)
  - `'\t'` (табуляция — код `0x09`)
  - `'\f'` (перевод страницы — код `0x0C`)
- За которыми следует ровно одна последовательность перевода строки:
  - в стиле Windows `"\r\n"`
  - или в стиле Unix `'\n'`
- Сразу за которой следуют бинарные данные.

:::note
Этот формат менее эффективен, чем формат [Native](../Native.md), поскольку он основан на построчной обработке.
:::

Для следующих типов данных важно учитывать:

- [Целые числа](../../../sql-reference/data-types/int-uint.md) используют представление фиксированной длины с прямым порядком байтов (little-endian). Например, `UInt64` занимает 8 байт.
- [DateTime](../../../sql-reference/data-types/datetime.md) представлен как `UInt32`, содержащий временную метку Unix в качестве значения.
- [Date](../../../sql-reference/data-types/date.md) представлен как объект UInt16, содержащий количество дней с `1970-01-01` в качестве значения.
- [String](../../../sql-reference/data-types/string.md) представлена как целое число переменной длины (varint) (беззнаковое [`LEB128`](https://en.wikipedia.org/wiki/LEB128)), за которым следуют байты строки.
- [FixedString](../../../sql-reference/data-types/fixedstring.md) представлена просто как последовательность байтов.
- [Массивы](../../../sql-reference/data-types/array.md) представлены как целое число переменной длины (varint) (беззнаковое [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которым следуют последовательные элементы массива.

Для поддержки [NULL](/sql-reference/syntax#null) перед каждым значением [Nullable](/sql-reference/data-types/nullable.md) добавляется дополнительный байт, содержащий `1` или `0`.

- Если `1`, то значение является `NULL`, и этот байт интерпретируется как отдельное значение.
- Если `0`, значение после байта не является `NULL`.

Для сравнения формата `RowBinary` и формата `RawBlob` см.: [Сравнение сырых форматов](../RawBLOB.md/#raw-formats-comparison)


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<RowBinaryFormatSettings />
