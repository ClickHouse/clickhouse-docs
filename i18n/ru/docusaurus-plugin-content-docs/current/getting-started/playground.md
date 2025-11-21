---
description: 'ClickHouse Playground позволяет пользователям экспериментировать с ClickHouse,
  выполняя запросы мгновенно и без необходимости настраивать собственный сервер или кластер.'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'Песочница ClickHouse'
slug: /getting-started/playground
title: 'Песочница ClickHouse'
doc_type: 'guide'
---



# Песочница ClickHouse

[ClickHouse Playground](https://sql.clickhouse.com) позволяет экспериментировать с ClickHouse, мгновенно выполняя запросы, без необходимости разворачивать собственный сервер или кластер.
В Playground доступно несколько демонстрационных наборов данных.

Вы можете выполнять запросы к Playground с помощью любого HTTP‑клиента, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или настроить подключение с использованием драйверов [JDBC](../interfaces/jdbc.md) или [ODBC](../interfaces/odbc.md). Более подробная информация о программных продуктах, поддерживающих ClickHouse, доступна [здесь](../integrations/index.mdx).



## Учетные данные {#credentials}

| Параметр            | Значение                           |
| :------------------ | :--------------------------------- |
| HTTPS endpoint      | `https://play.clickhouse.com:443/` |
| Native TCP endpoint | `play.clickhouse.com:9440`         |
| Пользователь        | `explorer` или `play`              |
| Пароль              | (пустой)                           |


## Ограничения {#limitations}

Запросы выполняются от имени пользователя с правами только на чтение. Это накладывает следующие ограничения:

- DDL-запросы не разрешены
- INSERT-запросы не разрешены

Сервис также имеет квоты на его использование.


## Примеры {#examples}

Пример HTTPS-конечной точки с использованием `curl`:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP-конечной точки с использованием [CLI](../interfaces/cli.md):

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Спецификации Playground {#specifications}

Наш ClickHouse Playground работает со следующими характеристиками:

- Размещён в Google Cloud (GCE) в регионе US Central (US-Central-1)
- Конфигурация с 3 репликами
- 256 ГиБ хранилища и 59 виртуальных процессоров на каждую реплику.
