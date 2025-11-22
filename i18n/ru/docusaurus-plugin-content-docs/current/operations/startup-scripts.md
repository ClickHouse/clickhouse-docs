---
description: 'Руководство по настройке и использованию SQL-скриптов инициализации в ClickHouse для
  автоматического создания схем и выполнения миграций'
sidebar_label: 'Скрипты инициализации'
slug: /operations/startup-scripts
title: 'Скрипты инициализации'
doc_type: 'guide'
---

# Скрипты запуска

ClickHouse может выполнять произвольные SQL‑запросы из конфигурации сервера во время запуска сервера. Это может быть полезно для миграций или автоматического создания схемы базы данных.

```xml
<clickhouse>
    <startup_scripts>
        <throw_on_error>false</throw_on_error>
        <scripts>
            <query>CREATE ROLE OR REPLACE test_role</query>
        </scripts>
        <scripts>
            <query>CREATE TABLE TestTable (id UInt64) ENGINE=TinyLog</query>
            <condition>SELECT 1;</condition>
        </scripts>
        <scripts>
            <query>CREATE DICTIONARY test_dict (...) SOURCE(CLICKHOUSE(...))</query>
            <user>default</user>
        </scripts>
    </startup_scripts>
</clickhouse>
```

ClickHouse выполняет все запросы из `startup_scripts` последовательно в указанном порядке. Если какой-либо из запросов завершится с ошибкой, выполнение последующих запросов не будет прервано. Однако, если параметр `throw_on_error` установлен в значение `true`,
сервер не запустится, если во время выполнения скрипта произойдет ошибка.

Вы можете указать условный запрос в конфигурации. В этом случае соответствующий запрос выполняется только тогда, когда условный запрос возвращает значение `1` или `true`.

:::note
Если условный запрос возвращает какое-либо другое значение, отличное от `1` или `true`, результат будет интерпретирован как `false`, и соответствующий запрос выполнен не будет.
:::
