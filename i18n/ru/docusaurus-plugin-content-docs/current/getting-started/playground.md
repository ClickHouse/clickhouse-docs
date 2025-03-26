---
description: 'Песочница ClickHouse позволяет пользователям экспериментировать с ClickHouse, мгновенно выполняя запросы без настройки своего сервера или кластера.'
keywords: ['clickhouse', 'песочница', 'начало', 'работы', 'документация']
sidebar_label: 'Песочница ClickHouse'
slug: /getting-started/playground
title: 'Песочница ClickHouse'
---


# Песочница ClickHouse

[Песочница ClickHouse](https://sql.clickhouse.com) позволяет пользователям экспериментировать с ClickHouse, мгновенно выполняя запросы без настройки своего сервера или кластера. В Песочнице доступны несколько примерных наборов данных.

Вы можете выполнять запросы к Песочнице с помощью любого HTTP-клиента, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или настроить соединение с использованием драйверов [JDBC](../interfaces/jdbc.md) или [ODBC](../interfaces/odbc.md). Более подробная информация о программных продуктах, которые поддерживают ClickHouse, доступна [здесь](../integrations/index.mdx).

## Учетные данные {#credentials}

| Параметр           | Значение                              |
|:--------------------|:-------------------------------------|
| HTTPS-эндпоинт     | `https://play.clickhouse.com:443/`  |
| TCP-эндпоинт       | `play.clickhouse.com:9440`           |
| Пользователь        | `explorer` или `play`                |
| Пароль             | (пустой)                             |

## Ограничения {#limitations}

Запросы выполняются как пользователь с правами только для чтения. Это накладывает некоторые ограничения:

- DDL-запросы не разрешены
- INSERT-запросы не разрешены

Сервис также имеет квоты на использование.

## Примеры {#examples}

Пример HTTPS-эндпоинта с `curl`:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP-эндпоинта с [CLI](../interfaces/cli.md):

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```
