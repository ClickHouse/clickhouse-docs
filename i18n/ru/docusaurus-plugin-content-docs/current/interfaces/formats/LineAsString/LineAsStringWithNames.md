---
alias: []
description: 'Документация для формата LineAsStringWithNames'
input_format: true
keywords: ['LineAsStringWithNames']
output_format: true
slug: /interfaces/formats/LineAsStringWithNames
title: 'LineAsStringWithNames'
---

| Вход | Выход | Псевдоним |
|-------|--------|-----------|
| ✗     | ✔      |           |

## Описание {#description}

Формат `LineAsStringWithNames` схож с форматом [`LineAsString`](./LineAsString.md), но выводит строку заголовка с именами колонок.

## Пример использования {#example-usage}

```sql title="Запрос"
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNames;
```

```response title="Ответ"
name    value
John    30
Jane    25
Peter    35
```

## Настройки формата {#format-settings}
