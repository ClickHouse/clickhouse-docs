---
alias: []
description: 'Документация по формату PrettyCompactMonoBlock'
input_format: false
keywords: ['PrettyCompactMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyCompactMonoBlock
title: 'PrettyCompactMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что буферизируется до `10 000` строк,
которые затем выводятся в виде единой таблицы, а не [блоками](/development/architecture#block).


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
