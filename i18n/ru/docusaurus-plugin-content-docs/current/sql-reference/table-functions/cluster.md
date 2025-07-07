---
description: 'Позволяет получать доступ ко всем шартам (настроенным в разделе `remote_servers`)
  кластера без создания таблицы [Distributed](../../engines/table-engines/special/distributed.md).'
sidebar_label: 'кластер'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
---


# Функция Таблицы clusterAllReplicas

Позволяет получать доступ ко всем шартам (настроенным в разделе `remote_servers`) кластера без создания таблицы [Distributed](../../engines/table-engines/special/distributed.md). Запрашивается только одна реплика из каждого шарда.

Функция `clusterAllReplicas` — то же самое, что и `cluster`, но запрашиваются все реплики. Каждая реплика в кластере используется как отдельный шард/соединение.

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

- `cluster_name` – Название кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам, установите `default`, если не указано.
- `db.table` или `db`, `table` - Название базы данных и таблицы.
- `sharding_key` - Ключ шардирования. Необязательный. Необходимо указать, если кластер имеет более одного шарда.

**Возвращаемое значение**

Набор данных из кластеров.

**Использование Макросов**

`cluster_name` может содержать макросы — подстановки в фигурных скобках. Подставляемое значение берется из раздела [макросов](../../operations/server-configuration-parameters/settings.md#macros) файла конфигурации сервера.

Пример:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**Использование и Рекомендации**

Использование функций таблиц `cluster` и `clusterAllReplicas` менее эффективно, чем создание таблицы `Distributed`, поскольку в этом случае соединение с сервером восстанавливается для каждого запроса. При обработке большого количества запросов всегда создавайте таблицу `Distributed` заранее и не используйте функции таблиц `cluster` и `clusterAllReplicas`.

Функции таблиц `cluster` и `clusterAllReplicas` могут быть полезны в следующих случаях:

- Доступ к конкретному кластеру для сравнения данных, отладки и тестирования.
- Запросы к различным кластерам ClickHouse и репликам для исследовательских целей.
- Редкие распределенные запросы, выполняемые вручную.

Настройки соединения, такие как `host`, `port`, `user`, `password`, `compression`, `secure`, берутся из секции конфигурации `<remote_servers>`. См. детали в [Distributed engine](../../engines/table-engines/special/distributed.md).

**Смотрите также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
