---
description: 'Документация по Distributed DDL'
sidebar_label: 'Distributed DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: 'Распределённые DDL-запросы (клауза ON CLUSTER)'
doc_type: 'reference'
---

По умолчанию запросы `CREATE`, `DROP`, `ALTER` и `RENAME` затрагивают только тот сервер, на котором они выполняются. В кластерной конфигурации такие запросы можно выполнять распределённо с помощью клаузы `ON CLUSTER`.

Например, следующий запрос создаёт таблицу `all_hits` типа `Distributed` на каждом узле в кластере `cluster`:

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

Чтобы корректно выполнять эти запросы, каждый хост должен иметь одинаковое определение кластера (для упрощения синхронизации конфигураций можно использовать подстановки из ZooKeeper). Они также должны быть подключены к серверам ZooKeeper.

Локальная версия запроса в конечном итоге будет выполнена на каждом хосте в кластере, даже если некоторые хосты в данный момент недоступны.

:::important\
Порядок выполнения запросов на одном хосте гарантирован.
:::
