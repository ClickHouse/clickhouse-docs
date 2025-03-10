---
title: LineAsStringWithNamesAndTypes
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
keywords: ['LineAsStringWithNamesAndTypes']
input_format: false
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Формат `LineAsStringWithNames` похож на формат [`LineAsString`](./LineAsString.md), 
но печатает две строки заголовка: одну с именами колонок, другую с типами.

## Пример использования {#example-usage}

```sql
CREATE TABLE example (
    name String,
    value Int32
)
ENGINE = Memory;

INSERT INTO example VALUES ('John', 30), ('Jane', 25), ('Peter', 35);

SELECT * FROM example FORMAT LineAsStringWithNamesAndTypes;
```

```response title="Ответ"
name	value
String	Int32
John	30
Jane	25
Peter	35
```

## Настройки формата {#format-settings}
