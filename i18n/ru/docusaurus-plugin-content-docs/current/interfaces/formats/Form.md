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

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |



## Описание {#description}

Формат `Form` используется для чтения одной записи в формате application/x-www-form-urlencoded,
в котором данные представлены в виде `key1=value1&key2=value2`.


## Пример использования {#example-usage}

Рассмотрим файл `data.tmp`, размещенный в директории `user_files`, который содержит URL-кодированные данные:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Запрос"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Результат"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```


## Настройки формата {#format-settings}
