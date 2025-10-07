---
slug: '/interfaces/formats/RowBinaryWithNamesAndTypes'
description: 'Документация для формата RowBinaryWithNamesAndTypes'
title: RowBinaryWithNamesAndTypes
keywords: ['RowBinaryWithNamesAndTypes']
doc_type: reference
input_format: true
output_format: true
---
import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Похож на формат [RowBinary](./RowBinary.md), но с добавленным заголовком:

- Число колонок (N), закодированное с помощью [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N `String`, указывающих названия колонок.
- N `String`, указывающих типы колонок.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<RowBinaryFormatSettings/>

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена на 1,
колонки из входных данных будут сопоставлены с колонками из таблицы по их названиям, колонки с неизвестными названиями будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена на 1.
В противном случае первая строка будет пропущена.
Если настройка [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена на `1`,
типы из входных данных будут сопоставлены с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::