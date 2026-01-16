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


## Описание \\{#description\\}

Отличается от [Pretty](/interfaces/formats/Pretty) тем, что не используются [последовательности управляющих кодов ANSI](http://en.wikipedia.org/wiki/ANSI_escape_code).  
Это необходимо для отображения этого формата в браузере, а также для использования с утилитой командной строки `watch`.

## Пример использования \{#example-usage\}

Пример:

```bash
$ watch -n1 "clickhouse-client --query='SELECT event, value FROM system.events FORMAT PrettyCompactNoEscapes'"
```

:::note
[HTTP-интерфейс](/interfaces/http) можно использовать для отображения данного формата в браузере.
:::


## Параметры форматирования \\{#format-settings\\}

<PrettyFormatSettings/>