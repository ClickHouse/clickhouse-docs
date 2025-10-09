---
slug: '/operations/startup-scripts'
sidebar_label: 'Скрипты запуска'
description: 'Руководство по конфигурированию и использованию SQL скриптов запуска'
title: 'Скрипты запуска'
doc_type: guide
---
# Скрипты запуска

ClickHouse может выполнять произвольные SQL-запросы из конфигурации сервера во время запуска. Это может быть полезно для миграций или автоматического создания схем.

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

ClickHouse последовательно выполняет все запросы из `startup_scripts` в указанном порядке. Если один из запросов завершается с ошибкой, выполнение последующих запросов не будет прервано. Однако, если `throw_on_error` установлен в true, сервер не запустится, если во время выполнения скрипта произойдет ошибка.

Вы можете указать условный запрос в конфигурации. В этом случае соответствующий запрос будет выполняться только в том случае, если условный запрос возвращает значение `1` или `true`.

:::note
Если условный запрос возвращает любое другое значение, кроме `1` или `true`, результат будет интерпретирован как `false`, и соответствующий запрос не будет выполнен.
:::