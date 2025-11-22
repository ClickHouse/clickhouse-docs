---
description: 'Документация по формату RowBinaryWithNames'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |


## Description {#description}

Аналогичен формату [`RowBinary`](./RowBinary.md), но с добавленным заголовком:

- Количество столбцов (N), закодированное в [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N строк типа `String`, задающих имена столбцов.


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<RowBinaryFormatSettings />

:::note

- Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) имеет значение `1`,
  столбцы из входных данных будут сопоставлены со столбцами таблицы по именам, столбцы с неизвестными именами будут пропущены.
- Если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) имеет значение `1`.
  В противном случае первая строка будет пропущена.
  :::
