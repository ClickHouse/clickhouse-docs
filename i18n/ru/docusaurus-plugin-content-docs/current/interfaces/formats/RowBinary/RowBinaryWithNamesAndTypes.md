---
alias: []
description: 'Документация для формата RowBinaryWithNamesAndTypes'
input_format: true
keywords: ['RowBinaryWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
title: 'RowBinaryWithNamesAndTypes'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |

## Описание {#description}

Похож на формат [RowBinary](./RowBinary.md), но с добавленным заголовком:

- Число столбцов (N), закодированное с помощью [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N `String`, указывающих имена столбцов.
- N `String`, указывающих типы столбцов.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1,
столбцы из входных данных будут сопоставлены со столбцами из таблицы по их именам, столбцы с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
Если настройка [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сравниваться с типами соответствующих столбцов из таблицы. В противном случае вторая строка будет пропущена.
:::
