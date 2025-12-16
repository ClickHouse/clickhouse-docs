---
description: 'Руководство по настройке и использованию стартовых SQL-скриптов в ClickHouse для
  автоматического создания схем и выполнения миграций'
sidebar_label: 'Стартовые скрипты'
slug: /operations/startup-scripts
title: 'Стартовые скрипты'
doc_type: 'guide'
---

# Скрипты инициализации {#startup-scripts}

ClickHouse может выполнять произвольные SQL‑запросы из конфигурации сервера при запуске. Это может быть полезно для миграций или автоматического создания схемы.

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

ClickHouse выполняет все запросы из `startup_scripts` последовательно в указанном порядке. Если какой-либо из запросов завершится с ошибкой, выполнение последующих запросов не будет прервано. Однако при `throw_on_error = true`
сервер не запустится, если во время выполнения скрипта произойдёт ошибка.

Вы можете задать условный запрос в конфигурации. В этом случае соответствующий запрос будет выполнен только тогда, когда условный запрос вернёт значение `1` или `true`.

:::note
Если условный запрос вернёт любое другое значение, отличное от `1` или `true`, результат будет интерпретирован как `false`, и соответствующий запрос выполнен не будет.
:::
