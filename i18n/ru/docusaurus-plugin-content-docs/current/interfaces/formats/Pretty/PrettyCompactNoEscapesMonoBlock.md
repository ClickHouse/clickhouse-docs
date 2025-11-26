---
alias: []
description: 'Документация по формату PrettyCompactNoEscapesMonoBlock'
input_format: false
keywords: ['PrettyCompactNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapesMonoBlock
title: 'PrettyCompactNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) тем, что до `10,000` строк накапливаются в буфере, а затем выводятся как одна таблица, а не по [блокам](/development/architecture#block).



## Примеры использования {#example-usage}



## Параметры форматирования {#format-settings}

<PrettyFormatSettings/>