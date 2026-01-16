---
alias: []
description: 'Документация по формату LineAsStringWithNamesAndTypes'
input_format: false
keywords: ['LineAsStringWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/LineAsStringWithNamesAndTypes
title: 'LineAsStringWithNamesAndTypes'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание \{#description\}

Формат `LineAsStringWithNames` похож на формат [`LineAsString`](./LineAsString.md), 
но выводит две строки заголовков: одну с именами столбцов, другую — с их типами.

## Пример использования \{#example-usage\}

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

## Параметры формата \{#format-settings\}
