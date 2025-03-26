---
description: 'Это расширение для функции табличного типа deltaLake.'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
---


# функция табличного типа deltaLakeCluster

Это расширение для функции табличного типа [deltaLake](sql-reference/table-functions/deltalake.md).

Позволяет обрабатывать файлы из таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 в параллельном режиме с множества узлов в указанном кластере. На инициаторе создается соединение со всеми узлами в кластере и динамически распределяются файлы. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет ее. Это повторяется до тех пор, пока все задачи не будут завершены.

**Синтаксис**

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.

- Описание всех других аргументов совпадает с описанием аргументов в эквивалентной функции табличного типа [deltaLake](sql-reference/table-functions/deltalake.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Delta Lake в S3.

**Смотрите также**

- [движок deltaLake](engines/table-engines/integrations/deltalake.md)
- [функция табличного типа deltaLake](sql-reference/table-functions/deltalake.md)
