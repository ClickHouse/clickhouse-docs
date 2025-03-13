---
title: RowBinaryWithNamesAndTypes
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
keywords: [RowBinaryWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Входящая | Исходящая | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Похож на формат [RowBinary](./RowBinary.md), но с добавленным заголовком:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)-кодированное число колонок (N).
- N `String` для указания имен колонок.
- N `String` для указания типов колонок.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1,
колонки из входных данных будут сопоставлены с колонками из таблицы по их именам, колонки с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
Если настройка [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сравниваться с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::
