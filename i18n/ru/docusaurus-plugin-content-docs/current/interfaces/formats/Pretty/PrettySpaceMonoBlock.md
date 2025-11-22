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


## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что буферизируется до `10 000` строк,
которые затем выводятся в виде единой таблицы, а не [блоками](/development/architecture#block).


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
