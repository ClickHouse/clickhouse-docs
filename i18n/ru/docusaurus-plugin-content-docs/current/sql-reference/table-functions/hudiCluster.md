---
description: 'Расширение для табличной функции hudi. Позволяет обрабатывать файлы из таблиц Apache Hudi в Amazon S3 параллельно с множеством узлов в указанном кластере.'
sidebar_label: 'hudiCluster'
sidebar_position: 86
slug: /sql-reference/table-functions/hudiCluster
title: 'Табличная функция hudiCluster'
---


# Табличная функция hudiCluster

Это расширение для табличной функции [hudi](sql-reference/table-functions/hudi.md).

Позволяет обрабатывать файлы из таблиц Apache [Hudi](https://hudi.apache.org/) в Amazon S3 параллельно с множеством узлов в указанном кластере. На инициаторе создается подключение ко всем узлам кластера, и каждый файл динамически распределяется. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется, пока все задачи не будут завершены.

**Синтаксис**

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для формирования набора адресов и параметров подключения к удалённым и локальным серверам.

- Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной табличной функции [hudi](sql-reference/table-functions/hudi.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Hudi в S3.

**Смотрите также**

- [Hudi engine](engines/table-engines/integrations/hudi.md)
- [Hudi table function](sql-reference/table-functions/hudi.md)
