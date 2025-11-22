---
description: 'Позволяет получить доступ ко всем шардам (настроенным в разделе `remote_servers`)
  кластера без необходимости создавать таблицу Distributed.'
sidebar_label: 'кластер'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---



# Табличная функция clusterAllReplicas

Позволяет обращаться ко всем шардам кластера (описанным в разделе конфигурации `remote_servers`) без создания таблицы [Distributed](../../engines/table-engines/special/distributed.md). Запрашивается только одна реплика каждого шарда.

Функция `clusterAllReplicas` аналогична `cluster`, но опрашиваются все реплики. Каждая реплика в кластере используется как отдельный шард/соединение.

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

| Аргумент                   | Описание                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`              | Имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам. По умолчанию используется значение `default`. |
| `db.table` или `db`, `table` | Имя базы данных и таблицы.                                                                                                                   |
| `sharding_key`              | Ключ шардирования. Необязательный параметр. Необходимо указывать, если кластер содержит более одного шарда.                                                           |


## Возвращаемое значение {#returned_value}

Набор данных из кластеров.


## Использование макросов {#using_macros}

`cluster_name` может содержать макросы — подстановки в фигурных скобках. Подставляемое значение берётся из секции [macros](../../operations/server-configuration-parameters/settings.md#macros) конфигурационного файла сервера.

Пример:

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```


## Использование и рекомендации {#usage_recommendations}

Использование табличных функций `cluster` и `clusterAllReplicas` менее эффективно, чем создание таблицы `Distributed`, поскольку в этом случае соединение с сервером устанавливается заново для каждого запроса. При обработке большого количества запросов всегда создавайте таблицу `Distributed` заранее и не используйте табличные функции `cluster` и `clusterAllReplicas`.

Табличные функции `cluster` и `clusterAllReplicas` могут быть полезны в следующих случаях:

- Доступ к конкретному кластеру для сравнения данных, отладки и тестирования.
- Запросы к различным кластерам и репликам ClickHouse в исследовательских целях.
- Нечастые распределённые запросы, выполняемые вручную.

Параметры соединения, такие как `host`, `port`, `user`, `password`, `compression`, `secure`, берутся из секции конфигурации `<remote_servers>`. Подробности см. в разделе [Движок Distributed](../../engines/table-engines/special/distributed.md).


## См. также {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
