---
title: PrettyCompactMonoBlock
slug: /interfaces/formats/PrettyCompactMonoBlock
keywords: ['PrettyCompactMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что буферизуется до `10,000` строк, 
а затем выводится в виде одной таблицы, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
