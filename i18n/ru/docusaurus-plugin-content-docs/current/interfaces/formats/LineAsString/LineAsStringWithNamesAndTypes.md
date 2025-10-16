---
slug: '/interfaces/formats/LineAsStringWithNamesAndTypes'
description: 'Документация для формата LineAsStringWithNamesAndTypes'
title: LineAsStringWithNamesAndTypes
keywords: ['LineAsStringWithNamesAndTypes']
doc_type: reference
input_format: false
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Формат `LineAsStringWithNames` подобен формату [`LineAsString`](./LineAsString.md), 
но выводит две строки заголовка: одну с именами колонок, другую с типами.

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

```response title="Response"
name    value
String    Int32
John    30
Jane    25
Peter    35
```

## Настройки формата {#format-settings}