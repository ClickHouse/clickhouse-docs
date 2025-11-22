---
alias: []
description: 'Документация о формате PrettyNoEscapesMonoBlock'
input_format: false
keywords: ['PrettyNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyNoEscapesMonoBlock
title: 'PrettyNoEscapesMonoBlock'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`PrettyNoEscapes`](./PrettyNoEscapes.md) тем, что буферизируется до `10 000` строк,
которые затем выводятся в виде единой таблицы, а не блоками.


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
