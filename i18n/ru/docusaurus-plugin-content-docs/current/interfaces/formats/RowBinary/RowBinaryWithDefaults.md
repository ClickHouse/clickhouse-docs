---
alias: []
description: 'Документация для формата RowBinaryWithDefaults'
input_format: true
keywords: ['RowBinaryWithDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithDefaults
title: 'RowBinaryWithDefaults'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание {#description}

Похож на формат [`RowBinary`](./RowBinary.md), но с дополнительным байтом перед каждым столбцом, который указывает, следует ли использовать значение по умолчанию.

## Пример использования {#example-usage}

Примеры:

```sql title="Запрос"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```
```response title="Ответ"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- Для столбца `x` есть только один байт `01`, который указывает, что следует использовать значение по умолчанию, и после этого байта никаких других данных не предоставляется.
- Для столбца `y` данные начинаются с байта `00`, который указывает, что столбец имеет актуальное значение, которое следует читать из последующих данных `01000000`.

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>
