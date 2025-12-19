---
description: 'ClickHouse Playground позволяет экспериментировать с ClickHouse, мгновенно выполняя запросы без необходимости настраивать собственный сервер или кластер.'
keywords: ['clickhouse', 'песочница', 'быстрый', 'старт', 'документация']
sidebar_label: 'Песочница ClickHouse'
slug: /getting-started/playground
title: 'Песочница ClickHouse'
doc_type: 'guide'
---

# Песочница ClickHouse {#clickhouse-playground}

[ClickHouse Playground](https://sql.clickhouse.com) позволяет экспериментировать с ClickHouse, мгновенно выполняя запросы без необходимости развертывать собственный сервер или кластер.
В Playground доступно несколько примерных наборов данных.

Вы можете отправлять запросы в Playground с помощью любого HTTP‑клиента, например [curl](https://curl.haxx.se) или [wget](https://www.gnu.org/software/wget/), или настроить подключение с использованием драйверов [JDBC](/interfaces/jdbc) или [ODBC](/interfaces/odbc). Дополнительная информация о программном обеспечении, поддерживающем ClickHouse, доступна [здесь](../integrations/index.mdx).

## Учетные данные {#credentials}

| Параметр              | Значение                           |
|:----------------------|:-----------------------------------|
| HTTPS-эндпоинт        | `https://play.clickhouse.com:443/` |
| Нативный TCP-эндпоинт | `play.clickhouse.com:9440`         |
| Пользователь          | `explorer` или `play`              |
| Пароль                | (пустой)                           |

## Ограничения {#limitations}

Запросы выполняются от имени пользователя только с правами чтения. Это накладывает некоторые ограничения:

- DDL-запросы не допускаются
- INSERT-запросы не допускаются

Для использования сервиса также установлены квоты.

## Примеры {#examples}

Пример HTTPS-эндпоинта с использованием `curl`:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

Пример TCP-эндпоинта с помощью [CLI](../interfaces/cli.md):

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Характеристики Playground {#specifications}

Наш ClickHouse Playground работает со следующими характеристиками:

- Размещён в Google Cloud (GCE) в центральном регионе США (US-Central-1)
- Трёхрепликовая конфигурация
- По 256 GiB хранилища и 59 виртуальных ЦП на каждый узел.