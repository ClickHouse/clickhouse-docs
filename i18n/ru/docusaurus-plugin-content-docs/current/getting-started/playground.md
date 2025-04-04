---
description: 'Площадка ClickHouse позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без настройки своего сервера или кластера.'
keywords: ['clickhouse', 'площадка', 'начало', 'работы', 'документы']
sidebar_label: 'Площадка ClickHouse'
slug: /getting-started/playground
title: 'Площадка ClickHouse'
---


# Площадка ClickHouse

[Площадка ClickHouse](https://sql.clickhouse.com) позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без настройки своего сервера или кластера. В Площадке доступны несколько примеров наборов данных.

Вы можете делать запросы к Площадке, используя любой HTTP-клиент, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или установить соединение с помощью драйверов [JDBC](../interfaces/jdbc.md) или [ODBC](../interfaces/odbc.md). Больше информации о программных продуктах, поддерживающих ClickHouse, доступно [здесь](../integrations/index.mdx).

## Учетные данные {#credentials}

| Параметр           | Значение                             |
|:--------------------|:-------------------------------------|
| HTTPS endpoint      | `https://play.clickhouse.com:443/`  |
| Native TCP endpoint | `play.clickhouse.com:9440`          |
| Пользователь        | `explorer` или `play`                |
| Пароль             | (пустой)                            |

## Ограничения {#limitations}

Запросы выполняются как пользователь с правами только для чтения. Это подразумевает некоторые ограничения:

- DDL-запросы не допускаются
- INSERT-запросы не допускаются

У службы также есть квоты на использование.

## Примеры {#examples}

Пример HTTPS endpoint с помощью `curl`:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP endpoint с помощью [CLI](../interfaces/cli.md):

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```
