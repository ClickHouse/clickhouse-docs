---
slug: /sql-reference/table-functions/hudiCluster
sidebar_position: 86
sidebar_label: hudiCluster
title: "Функция таблицы hudiCluster"
description: "Расширение функции таблицы hudi. Позволяет обрабатывать файлы из таблиц Apache Hudi в Amazon S3 параллельно с множеством узлов в указанном кластере."
---


# Функция таблицы hudiCluster

Это расширение к функции таблицы [hudi](sql-reference/table-functions/hudi.md).

Позволяет обрабатывать файлы из таблиц Apache [Hudi](https://hudi.apache.org/) в Amazon S3 параллельно с множеством узлов в указанном кластере. На инициаторе создается соединение со всеми узлами в кластере и динамически распределяются файлы. На рабочем узле инициатор запрашивает следующую задачу для обработки и выполняет ее. Это повторяется, пока все задачи не будут завершены.

**Синтаксис**

``` sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров подключения к удаленным и локальным серверам.

- Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной функции таблицы [hudi](sql-reference/table-functions/hudi.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Hudi в S3.

**См. Также**

- [Hudi engine](engines/table-engines/integrations/hudi.md)
- [Hudi table function](sql-reference/table-functions/hudi.md)
