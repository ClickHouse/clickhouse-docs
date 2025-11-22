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

| Вход | Выход | Алиас |
| ---- | ----- | ----- |
| ✗    | ✔     |       |


## Описание {#description}

Отличается от формата [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) тем, что буферизирует до `10 000` строк,
а затем выводит их в виде единой таблицы, а не по [блокам](/development/architecture#block).


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
