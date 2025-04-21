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

| Входной | Выходной | Псевдоним |
|---------|----------|-----------|
| ✗       | ✔        |           |

## Описание {#description}

Отличается от формата [`PrettyNoEscapes`](./PrettyNoEscapes.md) тем, что буферизует до `10,000` строк,
и затем выводит их в виде одной таблицы, а не блоками.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
