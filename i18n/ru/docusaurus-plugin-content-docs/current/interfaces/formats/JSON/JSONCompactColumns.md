---
title: 'JSONCompactColumns'
slug: '/interfaces/formats/JSONCompactColumns'
keywords: ['JSONCompactColumns']
input_format: true
output_format: true
alias: []
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

В этом формате все данные представлены в виде одного JSON массива.

:::note
Выходной формат `JSONCompactColumns` буферизует все данные в памяти, чтобы вывести их в одном блоке, что может привести к высоким затратам памяти.
:::

## Пример использования {#example-usage}

```json
[
	[42, 43, 44],
	["hello", "hello", "hello"],
	[[0,1], [0,1,2], [0,1,2,3]]
]
```

Колонки, отсутствующие в блоке, будут заполнены значениями по умолчанию (вы можете использовать настройку [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) здесь)

## Настройки формата {#format-settings}
