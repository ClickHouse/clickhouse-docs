---
title: PrettyCompactNoEscapes
slug: /interfaces/formats/PrettyCompactNoEscapes
keywords: ['PrettyCompactNoEscapes']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Входные данные | Выходные данные  | Псевдоним |
|----------------|------------------|-----------|
| ✗              | ✔                |           |

## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что не используются [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code). 
Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
