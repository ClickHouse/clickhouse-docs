---
slug: '/interfaces/formats/RowBinaryWithDefaults'
description: 'Документация для формата RowBinaryWithDefaults'
title: RowBinaryWithDefaults
keywords: ['RowBinaryWithDefaults']
doc_type: reference
input_format: true
output_format: false
---
import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание {#description}

Похож на формат [`RowBinary`](./RowBinary.md), но с дополнительным байтом перед каждой колонкой, который указывает, следует ли использовать значение по умолчанию.

## Пример использования {#example-usage}

Примеры:

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```
```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- Для колонки `x` имеется только один байт `01`, который указывает, что следует использовать значение по умолчанию, и никаких других данных после этого байта не предоставляется.
- Для колонки `y` данные начинаются с байта `00`, который указывает, что колонка имеет фактическое значение, которое должно быть прочитано из последующих данных `01000000`.

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>