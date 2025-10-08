---
slug: '/interfaces/formats/PrettyMonoBlock'
description: 'Документация для формата PrettyMonoBlock'
title: PrettyMonoBlock
keywords: ['PrettyMonoBlock']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`Pretty`](/interfaces/formats/Pretty) тем, что до `10,000` строк буферизуется, 
а затем выводится в виде одной таблицы, а не по [блокам](/development/architecture#block).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>