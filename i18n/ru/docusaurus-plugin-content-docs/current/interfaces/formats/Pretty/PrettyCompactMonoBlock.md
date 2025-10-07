---
slug: '/interfaces/formats/PrettyCompactMonoBlock'
description: 'Документация для формата PrettyCompactMonoBlock'
title: PrettyCompactMonoBlock
keywords: ['PrettyCompactMonoBlock']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettyCompact`](./PrettyCompact.md) тем, что до `10,000` строк буферизуются, 
а затем выводятся в виде единой таблицы, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>