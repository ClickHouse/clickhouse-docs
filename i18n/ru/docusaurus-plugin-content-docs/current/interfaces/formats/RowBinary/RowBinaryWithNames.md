---
description: 'Документация для формата RowBinaryWithNames'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Входной | Выходной | Псевдоним |
|---------|----------|-----------|
| ✔       | ✔        |           |

## Описание {#description}

Похож на формат [`RowBinary`](./RowBinary.md), но с добавленным заголовком:

- Число столбцов (N), закодированное с помощью [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N `String`-ов, указывающих имена столбцов.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>

:::note
- Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
столбцы из входных данных будут сопоставлены со столбцами таблицы по их именам, столбцы с неизвестными именами будут пропущены. 
- Если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::
