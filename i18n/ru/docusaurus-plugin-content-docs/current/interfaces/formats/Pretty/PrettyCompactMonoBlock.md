---
alias: []
description: 'Документация о формате PrettyCompactMonoBlock'
input_format: false
keywords: ['PrettyCompactMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyCompactMonoBlock
title: 'PrettyCompactMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание \\{#description\\}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что до `10 000` строк накапливаются в буфере, 
а затем выводятся в виде одной таблицы, а не по [блокам](/development/architecture#block).



## Пример использования \\{#example-usage\\}



## Параметры форматирования \\{#format-settings\\}

<PrettyFormatSettings/>