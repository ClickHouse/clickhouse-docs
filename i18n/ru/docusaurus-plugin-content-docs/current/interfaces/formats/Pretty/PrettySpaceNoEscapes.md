---
title: 'PrettySpaceNoEscapes'
slug: '/interfaces/formats/PrettySpaceNoEscapes'
keywords: ['PrettySpaceNoEscapes']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход  | Выход   | Псевдоним |
|-------|---------|-----------|
| ✗     | ✔       |           |

## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code) не используются. 
Это необходимо для отображения этого формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
