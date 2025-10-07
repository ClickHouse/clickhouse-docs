---
slug: '/interfaces/formats/PrettyNoEscapesMonoBlock'
description: 'Документация для формата PrettyNoEscapesMonoBlock'
title: PrettyNoEscapesMonoBlock
keywords: ['PrettyNoEscapesMonoBlock']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`PrettyNoEscapes`](./PrettyNoEscapes.md) тем, что до `10,000` строк буферизуются, 
а затем выводятся в виде одной таблицы, а не по блокам.

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings/>