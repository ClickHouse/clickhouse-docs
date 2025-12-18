---
description: 'Руководство по настройке и управлению квотами использования ресурсов в ClickHouse'
sidebar_label: 'Квоты'
sidebar_position: 51
slug: /operations/quotas
title: 'Квоты'
doc_type: 'guide'
---

:::note Квоты в ClickHouse Cloud
Квоты поддерживаются в ClickHouse Cloud, но должны создаваться с использованием [DDL-синтаксиса](/sql-reference/statements/create/quota). Подход с XML-конфигурацией, описанный ниже, **не поддерживается**.
:::

Квоты позволяют ограничивать или отслеживать использование ресурсов за определённый период времени.
Квоты настраиваются в конфигурации пользователей, которая обычно называется &#39;users.xml&#39;.

В системе также есть возможность ограничивать сложность одного запроса. См. раздел [Ограничения на сложность запросов](../operations/settings/query-complexity.md).

В отличие от ограничений на сложность запросов, квоты:

* Ограничивают набор запросов, которые можно выполнить за период времени, вместо ограничения одного запроса.
* Учитывают ресурсы, затраченные на всех удалённых серверах при распределённой обработке запросов.

Рассмотрим раздел файла &#39;users.xml&#39;, который определяет квоты.

```xml
<!-- Quotas -->
<quotas>
    <!-- Quota name. -->
    <default>
        <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
        <interval>
            <!-- Length of the interval. -->
            <duration>3600</duration>

            <!-- Unlimited. Just collect data for the specified time interval. -->
            <queries>0</queries>
            <query_selects>0</query_selects>
            <query_inserts>0</query_inserts>
            <errors>0</errors>
            <result_rows>0</result_rows>
            <read_rows>0</read_rows>
            <execution_time>0</execution_time>
        </interval>
    </default>
```

По умолчанию квота отслеживает потребление ресурсов почасово, не ограничивая использование.
Потребление ресурсов, рассчитанное для каждого интервала, выводится в журнал сервера после каждого запроса.

```xml
<statbox>
    <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
    <interval>
        <!-- Length of the interval. -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <written_bytes>5000000</written_bytes>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</read_rows>
        <execution_time>900</execution_time>
        <failed_sequential_authentications>5</failed_sequential_authentications>
    </interval>

    <interval>
        <duration>86400</duration>

        <queries>10000</queries>
        <query_selects>10000</query_selects>
        <query_inserts>10000</query_inserts>
        <errors>1000</errors>
        <result_rows>5000000000</result_rows>
        <result_bytes>160000000000</result_bytes>
        <read_rows>500000000000</read_rows>
        <result_bytes>16000000000000</result_bytes>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

Для квоты &#39;statbox&#39; ограничения задаются на каждый час и на каждые 24 часа (86 400 секунд). Отсчет интервала ведется от некоторого фиксированного, зависящего от реализации момента времени. Другими словами, 24-часовой интервал не обязательно начинается в полночь.

Когда интервал заканчивается, все накопленные значения обнуляются. Для следующего часа вычисление квоты начинается заново.

Вот значения, для которых могут быть заданы ограничения:

`queries` – Общее количество запросов.

`query_selects` – Общее количество запросов SELECT.

`query_inserts` – Общее количество запросов INSERT.

`errors` – Количество запросов, которые завершились с исключением.

`result_rows` – Общее количество строк, возвращенных в результате.

`result_bytes` - Общий размер строк, возвращенных в результате.

`read_rows` – Общее количество исходных строк, прочитанных из таблиц для выполнения запроса на всех удаленных серверах.

`read_bytes` - Общий размер данных, прочитанных из таблиц для выполнения запроса на всех удаленных серверах.

`written_bytes` - Общий объем записанных данных.

`execution_time` – Общее время выполнения запроса в секундах (реальное &quot;настенное&quot; время, wall time).

`failed_sequential_authentications` - Общее количество последовательных ошибок аутентификации.

Если лимит превышен хотя бы для одного временного интервала, генерируется исключение с текстом о том, какое ограничение было превышено, для какого интервала и когда начинается новый интервал (когда запросы можно отправлять снова).

Квоты могут использовать механизм «quota key» для раздельного учета использования ресурсов по нескольким ключам. Вот пример этого:

```xml
<!-- For the global reports designer. -->
<web_global>
    <!-- keyed – The quota_key "key" is passed in the query parameter,
            and the quota is tracked separately for each key value.
        For example, you can pass a username as the key,
            so the quota will be counted separately for each username.
        Using keys makes sense only if quota_key is transmitted by the program, not by a user.

        You can also write <keyed_by_ip />, so the IP address is used as the quota key.
        (But keep in mind that users can change the IPv6 address fairly easily.)
    -->
    <keyed />
```

Квота назначается пользователям в разделе конфигурации &#39;users&#39;. См. раздел &quot;Права доступа&quot;.

При распределённой обработке запросов накопленные значения хранятся на сервере, с которого был отправлен запрос. Поэтому, если пользователь перейдёт на другой сервер, квота там будет &quot;начинаться заново&quot;.

При перезапуске сервера квоты сбрасываются.

## Связанные материалы {#related-content}

- Статья в блоге: [Создание одностраничных веб-приложений с ClickHouse](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
