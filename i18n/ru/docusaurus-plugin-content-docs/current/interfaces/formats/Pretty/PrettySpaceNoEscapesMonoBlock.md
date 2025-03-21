---
title: PrettySpaceNoEscapesMonoBlock
slug: /interfaces/formats/PrettySpaceNoEscapesMonoBlock
keywords: ['PrettySpaceNoEscapesMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) тем, что до `10,000` строк буферизуются, 
а затем выводятся как одна таблица, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
