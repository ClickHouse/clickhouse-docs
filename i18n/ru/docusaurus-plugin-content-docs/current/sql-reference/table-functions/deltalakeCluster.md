---
description: 'Это расширение для табличной функции deltaLake.'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
---


# Табличная функция deltaLakeCluster

Это расширение для [табличной функции deltaLake](sql-reference/table-functions/deltalake.md).

Позволяет обрабатывать файлы из таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 параллельно с множества узлов в заданном кластере. На инициаторе создаётся соединение со всеми узлами в кластере и динамически распределяются файлы. На рабочем узле инициатор запрашивает следующую задачу на обработку и выполняет её. Это повторяется, пока все задачи не будут выполнены.

**Синтаксис**

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**Аргументы**

- `cluster_name` — Имя кластера, который используется для построения набора адресов и параметров соединения с удалёнными и локальными серверами.

- Описание всех других аргументов совпадает с описанием аргументов в эквивалентной табличной функции [deltaLake](sql-reference/table-functions/deltalake.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Delta Lake в S3.

**См. также**

- [движок deltaLake](engines/table-engines/integrations/deltalake.md)
- [табличная функция deltaLake](sql-reference/table-functions/deltalake.md)
