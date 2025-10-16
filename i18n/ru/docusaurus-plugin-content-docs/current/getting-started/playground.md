---
slug: '/getting-started/playground'
sidebar_label: 'Playground ClickHouse'
description: 'ClickHouse Playground позволяет людям экспериментировать с ClickHouse,'
title: 'Playground ClickHouse'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
doc_type: guide
---
# Playground ClickHouse

[ClickHouse Playground](https://sql.clickhouse.com) позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без необходимости настройки собственного сервера или кластера. В Playground доступны несколько примеров наборов данных.

Вы можете выполнять запросы к Playground, используя любой HTTP-клиент, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или настроить подключение с помощью драйверов [JDBC](../interfaces/jdbc.md) или [ODBC](../interfaces/odbc.md). Дополнительную информацию о программных продуктах, которые поддерживают ClickHouse, можно найти [здесь](../integrations/index.mdx).

## Учетные данные {#credentials}

| Параметр           | Значение                              |
|:--------------------|:--------------------------------------|
| HTTPS endpoint      | `https://play.clickhouse.com:443/`   |
| Native TCP endpoint | `play.clickhouse.com:9440`           |
| Пользователь        | `explorer` или `play`                |
| Пароль             | (пусто)                             |

## Ограничения {#limitations}

Запросы выполняются от имени пользователя с правами только для чтения, что накладывает определенные ограничения:

- Запросы DDL не разрешены
- Запросы INSERT не разрешены

Сервис также имеет квоты на свое использование.

## Примеры {#examples}

Пример HTTPS endpoint с `curl`:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP endpoint с [CLI](../interfaces/cli.md):

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## Спецификации Playground {#specifications}

Наш ClickHouse Playground работает с следующими спецификациями:

- Хостится в Google Cloud (GCE) в центральном регионе США (US-Central-1)
- Настройка с 3 репликами
- 256 GiB хранилища и 59 виртуальных ЦП каждый.