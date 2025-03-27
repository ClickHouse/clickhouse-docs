---
description: 'Расширение для табличной функции hudi. Позволяет обрабатывать файлы из таблиц Apache Hudi в Amazon S3 параллельно с использованием многих узлов в указанном кластере.'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'Функция таблицы hudiCluster'
---


# Функция таблицы hudiCluster

Это расширение для [функции таблицы hudi](sql-reference/table-functions/hudi.md).

Позволяет обрабатывать файлы из таблиц Apache [Hudi](https://hudi.apache.org/) в Amazon S3 параллельно с использованием многих узлов в указанном кластере. При инициировании создается соединение со всеми узлами кластера, и каждый файл динамически распределяется. На рабочем узле он запрашивает у инициатора следующее задание для обработки и обрабатывает его. Это повторяется, пока все задания не будут завершены.

**Синтаксис**

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для формирования набора адресов и параметров соединения с удаленными и локальными серверами.

- Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной [функции таблицы hudi](sql-reference/table-functions/hudi.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Hudi в S3.

**Смотрите также**

- [Движок Hudi](engines/table-engines/integrations/hudi.md)
- [Функция таблицы Hudi](sql-reference/table-functions/hudi.md)
