---
slug: '/interfaces/formats/PrettyCompactNoEscapesMonoBlock'
description: 'Документация для формата PrettyCompactNoEscapesMonoBlock'
title: PrettyCompactNoEscapesMonoBlock
keywords: ['PrettyCompactNoEscapesMonoBlock']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettyCompactNoEscapes`](./PrettyCompactNoEscapes.md) тем, что буферизуются до `10,000` строк, 
после чего выводится в виде одной таблицы, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>