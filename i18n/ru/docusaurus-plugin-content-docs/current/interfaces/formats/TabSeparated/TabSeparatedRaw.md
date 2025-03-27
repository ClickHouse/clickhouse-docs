---
alias: ['TSVRaw', 'Raw']
description: 'Документация для формата TabSeparatedRaw'
input_format: true
keywords: ['TabSeparatedRaw']
output_format: true
slug: /interfaces/formats/TabSeparatedRaw
title: 'TabSeparatedRaw'
---

| Вход | Выход | Псевдоним       |
|-------|--------|-----------------|
| ✔     | ✔      | `TSVRaw`, `Raw` |

## Описание {#description}

Отличается от формата [`TabSeparated`](/interfaces/formats/TabSeparated) тем, что строки записываются без экранирования.

:::note
При парсинге с использованием этого формата табуляции или переносы строк не допускаются в каждом поле.
:::

Для сравнения формата `TabSeparatedRaw` и формата `RawBlob` см. [Сравнение сырых форматов](../RawBLOB.md/#raw-formats-comparison)

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
