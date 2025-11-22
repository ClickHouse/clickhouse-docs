---
alias: []
description: 'Документация по формату PrettyNoEscapes'
input_format: false
keywords: ['PrettyNoEscapes']
output_format: true
slug: /interfaces/formats/PrettyNoEscapes
title: 'PrettyNoEscapes'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✗    | ✔     |           |


## Описание {#description}

Отличается от [Pretty](/interfaces/formats/Pretty) тем, что не используются [ANSI-escape последовательности](http://en.wikipedia.org/wiki/ANSI_escape_code).
Это необходимо для отображения формата в браузере, а также для использования утилиты командной строки `watch`.


## Пример использования {#example-usage}

Пример:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
Для отображения данных в этом формате в браузере можно использовать [HTTP-интерфейс](../../../interfaces/http.md).
:::


## Настройки формата {#format-settings}

<PrettyFormatSettings />
