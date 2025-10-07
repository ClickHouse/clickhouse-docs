---
slug: '/sql-reference/table-functions/cluster'
sidebar_label: кластер
sidebar_position: 30
description: 'Позволяет получать доступ ко всем шардовым узлам (настроенным в разделе'
title: clusterAllReplicas
doc_type: reference
---
# Функция табличного мира clusterAllReplicas

Позволяет получать доступ ко всем шардом (настроенным в разделе `remote_servers`) кластера без создания таблицы [Distributed](../../engines/table-engines/special/distributed.md). Запрашивается только одна реплика каждого шара.

Функция `clusterAllReplicas` аналогична `cluster`, но запрашивает все реплики. Каждая реплика в кластере используется как отдельный шард/соединение.

:::note
Все доступные кластеры перечислены в таблице [system.clusters](../../operations/system-tables/clusters.md).
:::

## Синтаксис {#syntax}

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
## Аргументы {#arguments}

| Аргументы                  | Тип                                                                                                                                              |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`             | Имя кластера, которое используется для формирования набора адресов и параметров соединения с удаленными и локальными серверами, установите `default`, если не указано. |
| `db.table` или `db`, `table` | Имя базы данных и таблицы.                                                                                                                   |
| `sharding_key`             | Ключ шардирования. Необязательный. Должен быть указан, если у кластера более одного шара.                                                           |

## Возвращаемое значение {#returned_value}

Набор данных из кластеров.

## Использование макросов {#using_macros}

`cluster_name` может содержать макросы — замены в фигурных скобках. Заменяемое значение берется из секции [macros](../../operations/server-configuration-parameters/settings.md#macros) файла конфигурации сервера.

Пример:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## Использование и рекомендации {#usage_recommendations}

Использование функций табличного мира `cluster` и `clusterAllReplicas` менее эффективно, чем создание таблицы `Distributed`, потому что в этом случае соединение с сервером восстанавливается для каждого запроса. При обработке большого количества запросов всегда создавайте таблицу `Distributed` заранее и не используйте функции табличного мира `cluster` и `clusterAllReplicas`.

Функции табличного мира `cluster` и `clusterAllReplicas` могут быть полезны в следующих случаях:

- Доступ к конкретному кластеру для сравнения данных, отладки и тестирования.
- Запросы к различным кластерам и репликам ClickHouse в исследовательских целях.
- Редкие распределенные запросы, которые выполняются вручную.

Настройки соединения, такие как `host`, `port`, `user`, `password`, `compression`, `secure`, берутся из конфигурационного раздела `<remote_servers>`. См. детали в [Distributed engine](../../engines/table-engines/special/distributed.md).

## Связанные материалы {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)