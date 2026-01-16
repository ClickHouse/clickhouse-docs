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

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание \\{#description\\}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что в нём не используются [последовательности управляющих кодов ANSI (ANSI escape sequences)](http://en.wikipedia.org/wiki/ANSI_escape_code).  
Это необходимо для корректного отображения этого формата в браузере, а также для использования консольной утилиты `watch`.



## Пример использования \\{#example-usage\\}



## Параметры форматирования \\{#format-settings\\}

<PrettyFormatSettings/>