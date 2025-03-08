---
title: PrettyMonoBlock
slug: /interfaces/formats/PrettyMonoBlock
keywords: ['PrettyMonoBlock']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`Pretty`](/interfaces/formats/Pretty) тем, что буферизует до `10,000` строк,
и затем выводит как одну таблицу, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
