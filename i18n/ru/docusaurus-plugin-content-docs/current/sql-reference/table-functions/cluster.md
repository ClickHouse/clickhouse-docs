---
description: 'Позволяет обращаться ко всем шардам (настроенным в разделе `remote_servers`)
  кластера без создания таблицы типа Distributed.'
sidebar_label: 'кластер'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---



# Табличная функция clusterAllReplicas

Позволяет обращаться ко всем шардам кластера (настроенным в разделе `remote_servers`) без создания таблицы [Distributed](../../engines/table-engines/special/distributed.md). Запрашивается только одна реплика каждого шарда.

Функция `clusterAllReplicas` — то же, что и `cluster`, но запрашиваются все реплики. Каждая реплика кластера используется как отдельный шард и отдельное соединение.

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

## Аргументы

| Аргументы                    | Тип                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`               | Имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам; укажите значение `default`, если не задано. |
| `db.table` или `db`, `table` | Имя базы данных и таблицы.                                                                                                                                        |
| `sharding_key`               | Ключ шардинга. Необязательный параметр. Должен быть указан, если кластер содержит более одного шарда.                                                             |


## Возвращаемое значение {#returned_value}

Набор данных, полученный из кластеров.



## Использование макросов

`cluster_name` может содержать макросы — подстановки в фигурных скобках. Значение подстановки берётся из раздела [macros](../../operations/server-configuration-parameters/settings.md#macros) файла конфигурации сервера.

Пример:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```


## Использование и рекомендации {#usage_recommendations}

Использование табличных функций `cluster` и `clusterAllReplicas` менее эффективно, чем создание таблицы `Distributed`, потому что в этом случае соединение с сервером заново устанавливается для каждого запроса. При обработке большого количества запросов всегда заранее создавайте таблицу `Distributed` и не используйте табличные функции `cluster` и `clusterAllReplicas`.

Табличные функции `cluster` и `clusterAllReplicas` могут быть полезны в следующих случаях:

- Доступ к конкретному кластеру для сравнения данных, отладки и тестирования.
- Запросы к различным кластерам и репликам ClickHouse в исследовательских целях.
- Редкие распределённые запросы, выполняемые вручную.

Параметры подключения, такие как `host`, `port`, `user`, `password`, `compression`, `secure`, берутся из секции конфигурации `<remote_servers>`. Подробности см. в описании [движка Distributed](../../engines/table-engines/special/distributed.md).



## См. также {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
