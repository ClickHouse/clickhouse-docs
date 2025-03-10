---
title: JSONColumns
slug: /interfaces/formats/JSONColumns
keywords: ['JSONColumns']
input_format: true
output_format: true
alias: []
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

:::tip
Вывод форматов JSONColumns* предоставляет имя поля ClickHouse, а затем содержимое каждой строки в таблице для этого поля;
визуально данные повёрнуты на 90 градусов влево.
:::

В этом формате все данные представляются как один JSON объект.

:::note
Формат `JSONColumns` буферизует все данные в памяти и затем выводит их как один блок, поэтому это может привести к высокому потреблению памяти.
:::

## Пример использования {#example-usage}

Пример:

```json
{
	"num": [42, 43, 44],
	"str": ["hello", "hello", "hello"],
	"arr": [[0,1], [0,1,2], [0,1,2,3]]
}
```

## Настройки формата {#format-settings}

При импорте колонки с неизвестными именами будут пропущены, если настройка [`,input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
Колонки, отсутствующие в блоке, будут заполнены значениями по умолчанию (вы можете использовать настройку [`,input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) здесь).
