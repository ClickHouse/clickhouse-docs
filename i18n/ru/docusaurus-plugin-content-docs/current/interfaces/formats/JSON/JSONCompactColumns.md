---
alias: []
description: 'Документация для формата JSONCompactColumns'
input_format: true
keywords: ['JSONCompactColumns']
output_format: true
slug: /interfaces/formats/JSONCompactColumns
title: 'JSONCompactColumns'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

В этом формате все данные представлены в виде одного JSON массива.

:::note
Выходной формат `JSONCompactColumns` буферизует все данные в памяти, чтобы вывести их как единственный блок, что может привести к высокому потреблению памяти.
:::

## Пример использования {#example-usage}

```json
[
    [42, 43, 44],
    ["hello", "hello", "hello"],
    [[0,1], [0,1,2], [0,1,2,3]]
]
```

Столбцы, отсутствующие в блоке, будут заполнены значениями по умолчанию (вы можете использовать настройку [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) здесь)

## Настройки формата {#format-settings}
