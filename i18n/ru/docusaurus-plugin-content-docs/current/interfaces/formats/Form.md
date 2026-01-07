---
alias: []
description: 'Документация по формату Form'
input_format: true
keywords: ['Form']
output_format: false
slug: /interfaces/formats/Form
title: 'Form'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |

## Описание {#description}

Формат `Form` можно использовать для чтения одной записи в формате application/x-www-form-urlencoded, 
в котором данные представлены в виде `key1=value1&key2=value2`.

## Пример использования {#example-usage}

Предположим, что файл `data.tmp` находится в каталоге `user_files` и содержит некоторые данные в URL-кодировке:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Query"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Response"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```

## Параметры форматирования {#format-settings}