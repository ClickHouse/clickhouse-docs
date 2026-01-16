---
alias: []
description: 'Документация по формату PrettySpaceNoEscapesMonoBlock'
input_format: false
keywords: ['PrettySpaceNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapesMonoBlock
title: 'PrettySpaceNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание \\{#description\\}

Отличается от формата [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) тем, что до `10 000` строк буферизуются, 
а затем выводятся в виде одной таблицы, а не по [блокам](/development/architecture#block).



## Пример использования \\{#example-usage\\}



## Параметры форматирования \\{#format-settings\\}

<PrettyFormatSettings/>