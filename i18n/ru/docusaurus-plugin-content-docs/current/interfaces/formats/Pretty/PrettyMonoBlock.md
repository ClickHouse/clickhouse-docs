---
alias: []
description: 'Документация о формате PrettyMonoBlock'
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

Отличается от формата [`Pretty`](/interfaces/formats/Pretty) тем, что буферизирует до `10 000` строк,
которые затем выводятся в виде единой таблицы, а не [блоками](/development/architecture#block).


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
