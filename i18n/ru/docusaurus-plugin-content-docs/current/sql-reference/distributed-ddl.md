---
description: 'Документация по Distributed DDL'
sidebar_label: 'Distributed DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: 'Распределённые DDL-запросы (предложение ON CLUSTER)'
doc_type: 'reference'
---

По умолчанию запросы `CREATE`, `DROP`, `ALTER` и `RENAME` затрагивают только тот сервер, на котором они выполняются. В кластерной среде такие запросы можно выполнять в распределённом режиме с помощью предложения `ON CLUSTER`.

Например, следующий запрос создаёт таблицу `all_hits` типа `Distributed` на каждом хосте в кластере `cluster`:

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

Для корректного выполнения этих запросов каждый хост должен иметь одинаковое определение кластера (для упрощения синхронизации конфигураций можно использовать подстановки из ZooKeeper). Хосты также должны подключаться к серверам ZooKeeper.

Локальная версия запроса в конечном итоге будет выполнена на каждом хосте в кластере, даже если некоторые хосты в данный момент недоступны.

:::important\
Порядок выполнения запросов на одном хосте гарантирован.
:::
