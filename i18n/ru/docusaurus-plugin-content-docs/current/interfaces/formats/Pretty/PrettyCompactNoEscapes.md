---
alias: []
description: 'Документация по формату PrettyCompactNoEscapes'
input_format: false
keywords: ['PrettyCompactNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapes
title: 'PrettyCompactNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что не использует [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code).
Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки `watch`.


## Пример использования {#example-usage}


## Настройки формата {#format-settings}

<PrettyFormatSettings />
