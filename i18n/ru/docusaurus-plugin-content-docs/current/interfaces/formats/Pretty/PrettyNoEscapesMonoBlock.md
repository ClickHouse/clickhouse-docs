---
alias: []
description: 'Документация для формата PrettyNoEscapesMonoBlock'
input_format: false
keywords: ['PrettyNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyNoEscapesMonoBlock
title: 'PrettyNoEscapesMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход    | Выход   | Псевдоним |
|---------|---------|-----------|
| ✗       | ✔       |           |

## Описание {#description}

Отличается от формата [`PrettyNoEscapes`](./PrettyNoEscapes.md) тем, что до `10,000` строк буферизуются, 
а затем выводятся в виде одной таблицы, а не по блокам.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
