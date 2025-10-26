---
slug: '/interfaces/formats/PrettyCompactNoEscapes'
description: 'Документация для формата PrettyCompactNoEscapes'
title: PrettyCompactNoEscapes
keywords: ['PrettyCompactNoEscapes']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что [последовательности ANSI-escape](http://en.wikipedia.org/wiki/ANSI_escape_code) не используются. Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>