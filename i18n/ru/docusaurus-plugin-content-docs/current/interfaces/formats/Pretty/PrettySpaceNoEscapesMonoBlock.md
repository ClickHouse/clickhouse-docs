---
alias: []
description: 'Документация для формата PrettySpaceNoEscapesMonoBlock'
input_format: false
keywords: ['PrettySpaceNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettySpaceNoEscapesMonoBlock
title: 'PrettySpaceNoEscapesMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|------|--------|-----------|
| ✗    | ✔      |           |

## Описание {#description}

Отличается от формата [`PrettySpaceNoEscapes`](./PrettySpaceNoEscapes.md) тем, что до `10,000` строк буферизуются, 
и затем выводятся как одна таблица, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
