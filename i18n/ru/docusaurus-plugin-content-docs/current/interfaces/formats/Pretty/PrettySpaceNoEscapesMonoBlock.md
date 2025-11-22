---
alias: []
description: 'Документация о формате PrettySpaceNoEscapesMonoBlock'
input_format: false
keywords: ['PrettySpaceNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapesMonoBlock
title: 'PrettySpaceNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) тем, что буферизируется до `10 000` строк, которые затем выводятся в виде единой таблицы, а не по [блокам](/development/architecture#block).


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
