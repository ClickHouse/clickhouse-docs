---
alias: []
description: 'Документация по формату PrettyMonoBlock'
input_format: false
keywords: ['PrettyMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyMonoBlock
title: 'PrettyMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`Pretty`](/interfaces/formats/Pretty) тем, что до `10 000` строк буферизуются, после чего результат выводится в виде одной таблицы, а не по [блокам](/development/architecture#block).



## Пример использования {#example-usage}



## Параметры форматирования {#format-settings}

<PrettyFormatSettings/>