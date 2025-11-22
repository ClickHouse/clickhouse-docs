---
alias: []
description: 'Документация по формату LineAsStringWithNames'
input_format: true
keywords: ['LineAsStringWithNames']
output_format: true
slug: /interfaces/formats/LineAsStringWithNames
title: 'LineAsStringWithNames'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |



## Описание {#description}

Формат `LineAsStringWithNames` аналогичен формату [`LineAsString`](./LineAsString.md), но дополнительно выводит строку заголовка с именами столбцов.


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
