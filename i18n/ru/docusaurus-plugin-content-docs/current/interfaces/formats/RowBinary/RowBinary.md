---
slug: '/interfaces/formats/RowBinary'
description: 'Документация для формата RowBinary'
title: RowBinary
keywords: ['RowBinary']
doc_type: reference
input_format: true
output_format: true
---
import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Формат `RowBinary` анализирует данные построчно в двоичном формате. 
Строки и значения перечисляются последовательно, без разделителей. 
Поскольку данные находятся в двоичном формате, разделитель после `FORMAT RowBinary` строго задается следующим образом: 

- Любое количество пробелов:
  - `' '` (пробел - код `0x20`)
  - `'\t'` (табуляция - код `0x09`)
  - `'\f'` (перевод страницы - код `0x0C`) 
- За которым следует ровно одна последовательность новой строки:
  - Windows-стиль `"\r\n"` 
  - или Unix-стиль `'\n'`
- Сразу за этим следует двоичные данные.

:::note
Этот формат менее эффективен, чем формат [Native](../Native.md), так как он основан на строках.
:::

Для следующих типов данных важно отметить, что:

- [Целые числа](../../../sql-reference/data-types/int-uint.md) используют представление с фиксированной длиной в порядке little-endian. Например, `UInt64` использует 8 байт.
- [DateTime](../../../sql-reference/data-types/datetime.md) представлен как `UInt32`, содержащий временной штамп Unix как значение.
- [Дата](../../../sql-reference/data-types/date.md) представлена как объект UInt16, который содержит количество дней с `1970-01-01` как значение.
- [Строка](../../../sql-reference/data-types/string.md) представлена как целое число переменной ширины (varint) (беззнаковое [`LEB128`](https://en.wikipedia.org/wiki/LEB128)), за которым следуют байты строки.
- [FixedString](../../../sql-reference/data-types/fixedstring.md) представлена просто как последовательность байтов.
- [Массивы](../../../sql-reference/data-types/array.md) представлены как целое число переменной ширины (varint) (беззнаковое [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которым следуют последовательные элементы массива.

Для поддержки [NULL](/sql-reference/syntax#null) перед каждым значением [Nullable](/sql-reference/data-types/nullable.md) добавляется дополнительный байт, содержащий `1` или `0`. 
- Если `1`, то значение `NULL`, и этот байт интерпретируется как отдельное значение. 
- Если `0`, значение после байта не `NULL`.

Для сравнения формата `RowBinary` и формата `RawBlob` смотрите: [Сравнение сырьевых форматов](../RawBLOB.md/#raw-formats-comparison)

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>