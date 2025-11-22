---
alias: []
description: 'Документация о формате PrettySpaceNoEscapes'
input_format: false
keywords: ['PrettySpaceNoEscapes']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapes
title: 'PrettySpaceNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что не использует [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code).
Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки `watch`.


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
