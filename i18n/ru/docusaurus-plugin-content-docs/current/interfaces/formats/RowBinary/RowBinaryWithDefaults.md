---
alias: []
description: 'Документация по формату RowBinaryWithDefaults'
input_format: true
keywords: ['RowBinaryWithDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithDefaults
title: 'RowBinaryWithDefaults'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✗     |           |

## Описание {#description}

Аналогичен формату [`RowBinary`](./RowBinary.md), но с дополнительным байтом перед каждым столбцом, который указывает, следует ли использовать значение по умолчанию.

## Примеры использования {#example-usage}

Примеры:

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```

```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

* Для столбца `x` есть только один байт `01`, который указывает, что должно быть использовано значение по умолчанию, и после этого байта не передаётся никаких других данных.
* Для столбца `y` данные начинаются с байта `00`, который указывает, что у столбца есть реальное значение, которое нужно прочитать из следующих данных `01000000`.

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>
