---
description: 'Документация для операторов ALTER DATABASE ... MODIFY COMMENT'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ИЗМЕНИТЬ'
title: 'Операторы ALTER DATABASE ... MODIFY COMMENT'
---


# ALTER DATABASE ... MODIFY COMMENT

Добавляет, модифицирует или убирает комментарий к базе данных, независимо от того, был ли он установлен ранее или нет. Изменение комментария отражается как в [system.databases](/operations/system-tables/databases.md), так и в запросе `SHOW CREATE DATABASE`.

**Синтаксис**

``` sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

**Примеры**

Создание БАЗЫ ДАННЫХ с комментариями (для получения дополнительной информации смотрите пункт [COMMENT](/sql-reference/statements/create/table#comment-clause)):

``` sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'Временная база данных';
```

Изменение комментария базы данных:

``` sql
ALTER DATABASE database_with_comment MODIFY COMMENT 'новый комментарий к базе данных';
SELECT comment FROM system.databases WHERE name = 'database_with_comment';
```

Вывод нового комментария:

```text
┌─comment─────────────────┐
│ новый комментарий к базе │
└─────────────────────────┘
```

Удаление комментария базы данных:

``` sql
ALTER DATABASE database_with_comment MODIFY COMMENT '';
SELECT comment FROM system.databases WHERE  name = 'database_with_comment';
```

Вывод удаленного комментария:

```text
┌─comment─┐
│         │
└─────────┘
```
