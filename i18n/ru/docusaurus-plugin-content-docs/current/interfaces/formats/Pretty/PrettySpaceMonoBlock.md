---
title: PrettySpaceMonoBlock
slug: /interfaces/formats/PrettySpaceMonoBlock
keywords: ['PrettySpaceMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettySpace`](./PrettySpace.md) тем, что буферизует до `10,000` строк, 
а затем выводит как одну таблицу, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
