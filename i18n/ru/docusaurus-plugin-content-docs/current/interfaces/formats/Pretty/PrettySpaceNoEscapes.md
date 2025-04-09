---
alias: []
description: 'Документация для формата PrettySpaceNoEscapes'
input_format: false
keywords: ['PrettySpaceNoEscapes']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapes
title: 'PrettySpaceNoEscapes'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code) не используются. 
Это необходимо для отображения этого формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
