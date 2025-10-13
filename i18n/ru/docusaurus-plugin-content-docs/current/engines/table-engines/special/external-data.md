---
slug: '/engines/table-engines/special/external-data'
sidebar_label: 'External Data'
sidebar_position: 130
description: 'ClickHouse позволяет отправлять серверу данные, необходимые для обработки'
title: 'Внешние данные для обработки запросов'
doc_type: reference
---
# Внешние данные для обработки запросов

ClickHouse позволяет отправлять серверу данные, необходимые для обработки запроса, вместе с запросом `SELECT`. Эти данные помещаются во временную таблицу (см. раздел "Временные таблицы") и могут использоваться в запросе (например, в операторах `IN`).

Например, если у вас есть текстовый файл с важными идентификаторами пользователей, вы можете загрузить его на сервер вместе с запросом, который использует фильтрацию по этому списку.

Если вам нужно выполнить более одного запроса с большим объемом внешних данных, не используйте эту функцию. Лучше загрузить данные в БД заранее.

Внешние данные можно загрузить с помощью командной строки (в неинтерактивном режиме) или с помощью HTTP интерфейса.

В командной строке вы можете указать секцию параметров в формате

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

Вы можете иметь несколько таких секций в зависимости от количества передаваемых таблиц.

**–external** – обозначает начало оператора.
**–file** – путь к файлу с дампом таблицы, или -, что ссылается на stdin. 
Можно извлечь только одну таблицу из stdin.

Следующие параметры являются необязательными: **–name**– имя таблицы. Если опущено, используется _data.
**–format** – формат данных в файле. Если опущено, используется TabSeparated.

Один из следующих параметров является обязательным: **–types** – список типов колонок, разделённых запятыми. Например: `UInt64,String`. Колонки будут названы _1, _2, ...
**–structure**– структура таблицы в формате `UserID UInt64`, `URL String`. Определяет имена колонок и типы.

Файлы, указанные в 'file', будут парситься форматом, указанным в 'format', с использованием типов данных, указанных в 'types' или 'structure'. Таблица будет загружена на сервер и будет доступна там как временная таблица с именем из 'name'.

Примеры:

```bash
$ echo -ne "1\n2\n3\n" | clickhouse-client --query="SELECT count() FROM test.visits WHERE TraficSourceID IN _data" --external --file=- --types=Int8
849897
$ cat /etc/passwd | sed 's/:/\t/g' | clickhouse-client --query="SELECT shell, count() AS c FROM passwd GROUP BY shell ORDER BY c DESC" --external --file=- --name=passwd --structure='login String, unused String, uid UInt16, gid UInt16, comment String, home String, shell String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

При использовании HTTP интерфейса внешние данные передаются в формате multipart/form-data. Каждая таблица передаётся как отдельный файл. Имя таблицы берется из имени файла. Параметры `name_format`, `name_types` и `name_structure` передаются в `query_string`, где `name` — это имя таблицы, соответствующее этим параметрам. Значение параметров такое же, как и при использовании клиентской командной строки.

Пример:

```bash
$ cat /etc/passwd | sed 's/:/\t/g' > passwd.tsv

$ curl -F 'passwd=@passwd.tsv;' 'http://localhost:8123/?query=SELECT+shell,+count()+AS+c+FROM+passwd+GROUP+BY+shell+ORDER+BY+c+DESC&passwd_structure=login+String,+unused+String,+uid+UInt16,+gid+UInt16,+comment+String,+home+String,+shell+String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

Для распределенной обработки запросов временные таблицы отправляются на все удаленные серверы.