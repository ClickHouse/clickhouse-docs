---
slug: '/interfaces/formats/PrettySpaceNoEscapes'
description: 'Документация для формата PrettySpaceNoEscapes'
title: PrettySpaceNoEscapes
keywords: ['PrettySpaceNoEscapes']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code) не используются. 
Это необходимо для отображения этого формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>