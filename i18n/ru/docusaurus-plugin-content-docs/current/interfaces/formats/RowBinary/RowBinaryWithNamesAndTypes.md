---
alias: []
description: 'Документация о формате RowBinaryWithNamesAndTypes'
input_format: true
keywords: ['RowBinaryWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
title: 'RowBinaryWithNamesAndTypes'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |


## Описание \\{#description\\}

Аналогичен формату [RowBinary](./RowBinary.md), но с добавленным заголовком:

- Число столбцов (N), закодированное в формате [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N значений типа `String` с именами столбцов.
- N значений типа `String` с типами столбцов.



## Пример использования \\{#example-usage\\}



## Настройки формата \\{#format-settings\\}

<RowBinaryFormatSettings/>

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в значение `1`,
столбцы из входных данных будут сопоставлены со столбцами таблицы по их именам, а столбцы с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в значение `1`.
В противном случае первая строка будет пропущена.
Если настройка [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в значение `1`,
типы из входных данных будут сравниваться с типами соответствующих столбцов таблицы. В противном случае вторая строка будет пропущена.
:::