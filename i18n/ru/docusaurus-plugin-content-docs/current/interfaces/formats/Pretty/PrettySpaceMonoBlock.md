---
alias: []
description: 'Документация о формате PrettySpaceMonoBlock'
input_format: false
keywords: ['PrettySpaceMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceMonoBlock
title: 'PrettySpaceMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание \{#description\}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что до `10,000` строк накапливаются в буфере,
а затем выводятся в виде одной таблицы, а не по [блокам](/development/architecture#block).



## Пример использования \{#example-usage\}



## Настройки форматирования \{#format-settings\}

<PrettyFormatSettings/>