---
sidebar_label: 'Площадка ClickHouse'
sidebar_position: 2
keywords: ['clickhouse', 'площадка', 'начало', 'работы', 'документация']
description: 'Площадка ClickHouse позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без настройки своего сервера или кластера.'
slug: /getting-started/playground
---


# Площадка ClickHouse

[Площадка ClickHouse](https://sql.clickhouse.com) позволяет пользователям экспериментировать с ClickHouse, выполняя запросы мгновенно, без настройки своего сервера или кластера. В Площадке доступны несколько примерных наборов данных.

Вы можете выполнять запросы к Площадке с помощью любого HTTP-клиента, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или настроить соединение с помощью драйверов [JDBC](../interfaces/jdbc.md) или [ODBC](../interfaces/odbc.md). Более подробную информацию о программных продуктах, поддерживающих ClickHouse, можно найти [здесь](../integrations/index.mdx).

## Учетные данные {#credentials}

| Параметр           | Значение                              |
|:-------------------|:-------------------------------------|
| HTTPS endpoint      | `https://play.clickhouse.com:443/`  |
| Native TCP endpoint | `play.clickhouse.com:9440`          |
| Пользователь       | `explorer` или `play`                |
| Пароль             | (пусто)                             |

## Ограничения {#limitations}

Запросы выполняются от имени пользователя с правами только на чтение. Это подразумевает некоторые ограничения:

- DDL-запросы не разрешены
- INSERT-запросы не разрешены

У сервиса также есть квоты на использование.

## Примеры {#examples}

Пример HTTPS-эндпоинта с использованием `curl`:

``` bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP-эндпоинта с помощью [CLI](../interfaces/cli.md):

``` bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```
