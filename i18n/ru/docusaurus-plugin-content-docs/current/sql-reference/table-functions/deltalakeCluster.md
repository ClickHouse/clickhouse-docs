---
slug: /sql-reference/table-functions/deltalakeCluster
sidebar_position: 46
sidebar_label: deltaLakeCluster
title: "deltaLakeCluster"
description: "Это расширение функции таблицы deltaLake."
---


# Функция таблицы deltaLakeCluster

Это расширение функции таблицы [deltaLake](sql-reference/table-functions/deltalake.md).

Позволяет обрабатывать файлы из таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 параллельно с нескольких узлов в заданном кластере. На инициаторе создается соединение со всеми узлами кластера, и каждый файл динамически распределяется. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется до тех пор, пока все задачи не будут завершены.

**Синтаксис**

``` sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.

- Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной функции таблицы [deltaLake](sql-reference/table-functions/deltalake.md).

**Возвращаемое значение**

Таблица с заданной структурой для чтения данных из кластера в указанной таблице Delta Lake в S3.

**См. также**

- [движок deltaLake](engines/table-engines/integrations/deltalake.md)
- [функция таблицы deltaLake](sql-reference/table-functions/deltalake.md)
