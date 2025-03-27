---
alias: []
description: 'Документация для формата PrettyCompactNoEscapesMonoBlock'
input_format: false
keywords: ['PrettyCompactNoEscapesMonoBlock']
output_format: true
slug: /interfaces/formats/PrettyCompactNoEscapesMonoBlock
title: 'PrettyCompactNoEscapesMonoBlock'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход   | Выход   | Псевдоним |
|--------|---------|-----------|
| ✗      | ✔       |           |

## Описание {#description}

Отличается от формата [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) тем, что буферизует до `10,000` строк, 
и затем выводит их как одну таблицу, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
