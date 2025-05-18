---
description: 'Playground ClickHouse позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без настройки своего сервера или кластера.'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'Playground ClickHouse'
slug: /getting-started/playground
title: 'Playground ClickHouse'
---


# Playground ClickHouse

[Playground ClickHouse](https://sql.clickhouse.com) позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без настройки своего сервера или кластера. В Playground доступны несколько примерных наборов данных.

Вы можете выполнять запросы в Playground, используя любой HTTP-клиент, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или настроить соединение с помощью драйверов [JDBC](../interfaces/jdbc.md) или [ODBC](../interfaces/odbc.md). Более подробная информация о программных продуктах, поддерживающих ClickHouse, доступна [здесь](../integrations/index.mdx).

## Учетные данные {#credentials}

| Параметр           | Значение                             |
|:--------------------|:-------------------------------------|
| HTTPS endpoint      | `https://play.clickhouse.com:443/`  |
| Native TCP endpoint | `play.clickhouse.com:9440`          |
| Пользователь        | `explorer` или `play`                |
| Пароль             | (пусто)                             |

## Ограничения {#limitations}

Запросы выполняются как пользователем только для чтения. Это предполагает некоторые ограничения:

- Запросы DDL не разрешены
- Запросы INSERT не разрешены

У сервиса также есть квоты на его использование.

## Примеры {#examples}

Пример HTTPS endpoint с использованием `curl`:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP endpoint с [CLI](../interfaces/cli.md):

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## Спецификации Playground {#specifications}

Наш Playground ClickHouse работает с следующими спецификациями:

- Размещен на Google Cloud (GCE) в центральном регионе США (US-Central-1)
- Настройка с 3 репликами
- 256 GiB хранилища и 59 виртуальных CPU каждый.
