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


## Описание \{#description\}

Аналогично формату [`RowBinary`](./RowBinary.md), но с добавленным заголовком:

- Количество столбцов (N), закодированное в формате [`LEB128`](https://en.wikipedia.org/wiki/LEB128).
- N строк (`String`), задающих имена столбцов.



## Пример использования \{#example-usage\}



## Настройки формата \{#format-settings\}

<RowBinaryFormatSettings/>

:::note
- Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в значение `1`,
столбцы из входных данных будут сопоставлены со столбцами таблицы по их именам, а столбцы с неизвестными именами будут пропущены. 
- Если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в значение `1`, в противном случае первая строка будет пропущена.
:::