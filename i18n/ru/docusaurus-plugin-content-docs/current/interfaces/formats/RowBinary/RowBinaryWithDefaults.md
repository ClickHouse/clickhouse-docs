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

Аналогичен формату [`RowBinary`](./RowBinary.md), но перед каждым столбцом добавляется дополнительный байт, указывающий, следует ли использовать значение по умолчанию.


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

- Для столбца `x` присутствует только один байт `01`, который указывает на необходимость использования значения по умолчанию; после этого байта других данных не предоставляется.
- Для столбца `y` данные начинаются с байта `00`, который указывает, что столбец содержит фактическое значение, которое следует прочитать из последующих данных `01000000`.


## Настройки формата {#format-settings}

<RowBinaryFormatSettings />
