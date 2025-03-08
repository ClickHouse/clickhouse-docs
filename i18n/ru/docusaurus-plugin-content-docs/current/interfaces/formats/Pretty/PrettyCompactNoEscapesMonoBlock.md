---
title: 'PrettyCompactNoEscapesMonoBlock'
slug: '/interfaces/formats/PrettyCompactNoEscapesMonoBlock'
keywords: ['PrettyCompactNoEscapesMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✗              | ✔              |           |

## Описание {#description}

Отличается от формата [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) тем, что буферизуются до `10,000` строк, 
а затем выводятся как одна таблица, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
