---
description: 'Позволяет получать доступ ко всем шартам (сконфигурированным в разделе `remote_servers`)
  кластера без создания распределенной таблицы.'
sidebar_label: 'кластер'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
---


# Функция таблицы clusterAllReplicas

Позволяет получать доступ ко всем шартам (сконфигурированным в разделе `remote_servers`) кластера без создания [распределенной](../../engines/table-engines/special/distributed.md) таблицы. Запрашивается только одна реплика каждого шарта.

Функция `clusterAllReplicas` — это то же самое, что и `cluster`, но запрашиваются все реплики. Каждая реплика в кластере используется как отдельный шард/соединение.

:::note
Все доступные кластеры перечислены в таблице [system.clusters](../../operations/system-tables/clusters.md).
:::

**Синтаксис**

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
**Аргументы**

- `cluster_name` – Имя кластера, которое используется для построения набора адресов и параметров подключения к удаленным и локальным серверам, установить `default`, если не указано.
- `db.table` или `db`, `table` - Имя базы данных и таблицы.
- `sharding_key` - Ключ шардирования. Необязательный. Необходим для указания, если у кластера более одного шарда.

**Возвращаемое значение**

Набор данных из кластеров.

**Использование макросов**

`cluster_name` может содержать макросы — замену в фигурных скобках. Замененное значение берется из раздела [макросов](../../operations/server-configuration-parameters/settings.md#macros) файла конфигурации сервера.

Пример:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**Использование и рекомендации**

Использование функций таблиц `cluster` и `clusterAllReplicas` менее эффективно, чем создание `распределенной` таблицы, поскольку в этом случае соединение с сервером устанавливается заново для каждого запроса. При обработке большого количества запросов всегда создавайте `распределенную` таблицу заранее и не используйте функции таблиц `cluster` и `clusterAllReplicas`.

Функции таблиц `cluster` и `clusterAllReplicas` могут быть полезны в следующих случаях:

- Доступ к определенному кластеру для сопоставления данных, отладки и тестирования.
- Запросы к различным кластерам и репликам ClickHouse для исследовательских целей.
- Редкие распределенные запросы, которые выполняются вручную.

Настройки подключения, такие как `host`, `port`, `user`, `password`, `compression`, `secure`, берутся из раздела `<remote_servers>` конфигурации. См. детали в [распределенном движке](../../engines/table-engines/special/distributed.md).

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
