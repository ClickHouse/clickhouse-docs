---
alias: []
description: 'Документация для формата PrettyCompactNoEscapes'
input_format: false
keywords: ['PrettyCompactNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapes
title: 'PrettyCompactNoEscapes'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Входные данные | Выходные данные  | Псевдоним |
|----------------|------------------|-----------|
| ✗              | ✔                |           |

## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code) не используются. 
Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
