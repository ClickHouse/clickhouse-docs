---
description: 'Руководство по настройке и использованию SQL скриптов запуска в ClickHouse для автоматического создания схем и миграций'
sidebar_label: 'Скрипты запуска'
slug: /operations/startup-scripts
title: 'Скрипты запуска'
---


# Скрипты запуска

ClickHouse может выполнять произвольные SQL запросы из конфигурации сервера во время запуска. Это может быть полезно для миграций или автоматического создания схемы.

```xml
<clickhouse>
    <startup_scripts>
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

ClickHouse выполняет все запросы из `startup_scripts` последовательно в указанном порядке. Если один из запросов завершится неудачей, выполнение последующих запросов не будет прервано.

Вы можете указать условный запрос в конфигурации. В этом случае соответствующий запрос выполняется только тогда, когда условный запрос возвращает значение `1` или `true`.

:::note
Если условный запрос вернет любое другое значение, кроме `1` или `true`, результат будет интерпретироваться как `false`, и соответствующий запрос не будет выполнен.
:::
