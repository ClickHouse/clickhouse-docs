---
title: PrettyNoEscapes
slug: /interfaces/formats/PrettyNoEscapes
keywords: [PrettyNoEscapes]
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход  | Псевдоним |
|-------|---------|-------|
| ✗     | ✔       |       |

## Описание {#description}

Отличается от [Pretty](/interfaces/formats/Pretty) тем, что [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code) не используются. 
Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки 'watch'.

## Пример использования {#example-usage}

Пример:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP интерфейс](../../../interfaces/http.md) может быть использован для отображения этого формата в браузере.
:::

## Настройки формата {#format-settings}

<PrettyFormatSettings/>
