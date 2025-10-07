---
slug: '/interfaces/formats/PrettyCompact'
description: 'Документация для формата PrettyCompact'
title: PrettyCompact
keywords: ['PrettyCompact']
doc_type: reference
input_format: false
output_format: true
---
import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от формата [`Pretty`](./Pretty.md) тем, что таблица отображается с сеткой, проведенной между строками. 
Из-за этого результат более компактный.

:::note
Этот формат используется по умолчанию в клиенте командной строки в интерактивном режиме.
:::

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

<PrettyFormatSettings />