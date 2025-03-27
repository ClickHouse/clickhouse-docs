---
alias: []
description: 'Документация для формата PrettySpaceMonoBlock'
input_format: false
keywords: ['PrettySpaceMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceMonoBlock
title: 'PrettySpaceMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что буферизует до `10,000` строк, 
а затем выводит их в виде одной таблицы, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
