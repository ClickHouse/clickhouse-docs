---
title: RowBinaryWithDefaults
slug: /interfaces/formats/RowBinaryWithDefaults
keywords: ['RowBinaryWithDefaults']
input_format: true
output_format: false
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание {#description}

Аналогично формату [`RowBinary`](./RowBinary.md), но с дополнительным байтом перед каждой колонкой, который указывает, следует ли использовать значение по умолчанию.

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

- Для колонки `x` есть только один байт `01`, который указывает, что следует использовать значение по умолчанию, и данные после этого байта не предоставляются.
- Для колонки `y` данные начинаются с байта `00`, который указывает, что колонка содержит фактическое значение, которое следует считать из последующих данных `01000000`.

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>
