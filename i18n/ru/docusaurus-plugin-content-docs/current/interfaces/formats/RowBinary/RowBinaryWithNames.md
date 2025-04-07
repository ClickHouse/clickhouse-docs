---
description: 'Документация для формата RowBinaryWithNames'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Похож на формат [`RowBinary`](./RowBinary.md), но с добавленным заголовком:

- Число колонок (N), закодированное с помощью [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N `String`'ов, указывающих имена колонок.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>

:::note
- Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`, 
колонки из входных данных будут сопоставлены с колонками таблицы по их именам, колонки с неизвестными именами будут пропущены.
- Если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`. 
В противном случае первая строка будет пропущена.
:::
