---
slug: /sql-reference/table-functions/cluster
sidebar_position: 30
sidebar_label: cluster
title: "clusterAllReplicas"
description: "Позволяет получать доступ ко всем шардом (настроенным в разделе `remote_servers`) кластера без создания распределенной таблицы."
---


# Функция таблицы clusterAllReplicas

Позволяет получать доступ ко всем шардом (настроенным в разделе `remote_servers`) кластера без создания [распределенной](../../engines/table-engines/special/distributed.md) таблицы. Запрашивается только одна реплика каждого шарда.

Функция `clusterAllReplicas` — аналогично `cluster`, но запрашиваются все реплики. Каждая реплика в кластере используется как отдельный шард/соединение.

:::note
Все доступные кластеры перечислены в таблице [system.clusters](../../operations/system-tables/clusters.md).
:::

**Синтаксис**

``` sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
**Аргументы**

- `cluster_name` – Имя кластера, которое используется для построения набора адресов и параметров соединения с удаленными и локальными серверами, укажите `default`, если не указано.
- `db.table` или `db`, `table` - Имя базы данных и таблицы.
- `sharding_key` - Ключ шардирования. Необязательно. Необходимо указать, если у кластера более одного шарда.

**Возвращаемое значение**

Набор данных из кластеров.

**Использование макросов**

`cluster_name` может содержать макросы — замену в фигурных скобках. Замененное значение берётся из раздела [макросов](../../operations/server-configuration-parameters/settings.md#macros) конфигурационного файла сервера.

Пример:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**Использование и рекомендации**

Использование функций таблицы `cluster` и `clusterAllReplicas` менее эффективно, чем создание `распределенной` таблицы, так как в этом случае соединение с сервером восстанавливается для каждого запроса. При обработке большого количества запросов всегда создавайте `распределенную` таблицу заранее и не используйте функции таблицы `cluster` и `clusterAllReplicas`.

Функции таблицы `cluster` и `clusterAllReplicas` могут быть полезны в следующих случаях:

- Получение доступа к конкретному кластеру для сравнения данных, отладки и тестирования.
- Запросы к различным кластерам и репликам ClickHouse для исследовательских целей.
- Редкие распределенные запросы, которые выполняются вручную.

Настройки соединения, такие как `host`, `port`, `user`, `password`, `compression`, `secure`, берутся из секции конфигурации `<remote_servers>`. Подробности см. в [распределенном движке](../../engines/table-engines/special/distributed.md).

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
