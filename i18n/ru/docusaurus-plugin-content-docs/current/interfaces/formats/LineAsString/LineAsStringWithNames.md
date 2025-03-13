---
title: LineAsStringWithNames
slug: /interfaces/formats/LineAsStringWithNames
keywords: [LineAsStringWithNames]
input_format: true
output_format: true
alias: []
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Формат `LineAsStringWithNames` похож на формат [`LineAsString`](./LineAsString.md), но выводит строку заголовка с именами колонок.

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
name	value
John	30
Jane	25
Peter	35
```

## Настройки формата {#format-settings}
