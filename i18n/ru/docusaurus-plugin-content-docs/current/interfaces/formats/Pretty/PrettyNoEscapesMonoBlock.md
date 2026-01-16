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


## Описание \\{#description\\}

Отличается от формата [`PrettyNoEscapes`](./PrettyNoEscapes.md) тем, что до `10 000` строк сохраняются в буфере, 
а затем выводятся как одна таблица, а не блоками.



## Пример использования \\{#example-usage\\}



## Настройки форматирования \\{#format-settings\\}

<PrettyFormatSettings/>