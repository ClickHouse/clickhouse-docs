---
title: Формат
slug: /interfaces/formats/Form
keywords: ['Формат']
input_format: true
output_format: false
alias: []
---

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✗      |       |


## Описание {#description}

Формат `Form` может использоваться для чтения одной записи в формате application/x-www-form-urlencoded, в котором данные отформатированы как `key1=value1&key2=value2`.

## Пример использования {#example-usage}

Допустим, имеется файл `data.tmp`, размещенный в пути `user_files`, с некоторыми данными, закодированными в URL:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Запрос"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Ответ"
Строка 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```

## Настройки формата {#format-settings}
