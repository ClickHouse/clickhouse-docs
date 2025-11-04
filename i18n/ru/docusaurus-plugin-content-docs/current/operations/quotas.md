---
slug: '/operations/quotas'
sidebar_label: Квоты
sidebar_position: 51
description: 'Руководство по настройке и управлению квотами использования ресурсов'
title: Квоты
doc_type: guide
---
:::note Квоты в ClickHouse Cloud
Квоты поддерживаются в ClickHouse Cloud, но должны создаваться с использованием [DDL-синтаксиса](/sql-reference/statements/create/quota). Подход с конфигурацией XML, описанный ниже, **не поддерживается**.
:::

Квоты позволяют ограничивать использование ресурсов в течение определенного периода времени или отслеживать использование ресурсов. 
Квоты настраиваются в конфигурации пользователя, которая обычно является 'users.xml'.

В системе также есть функция для ограничения сложности одного запроса. См. раздел [Ограничения на сложность запросов](../operations/settings/query-complexity.md).

В отличие от ограничений сложности запросов, квоты:

- Накладывают ограничения на набор запросов, которые могут быть выполнены в течение определенного времени, вместо ограничения одного запроса.
- Учитывают ресурсы, затраченные на всех удалённых серверах для распределенной обработки запросов.

Давайте посмотрим на часть файла 'users.xml', которая определяет квоты.

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

По умолчанию квота отслеживает потребление ресурсов каждый час, не ограничивая использование. 
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

Для квоты 'statbox' ограничения устанавливаются для каждого часа и для каждых 24 часов (86 400 секунд). Временной интервал считается, начиная с фиксированного момента времени, заданного реализацией. Другими словами, 24-часовой интервал не обязательно начинается в полночь.

Когда интервал заканчивается, все собранные значения очищаются. Для следующего часа расчёт квоты начинается заново.

Вот суммы, которые могут быть ограничены:

`queries` – Общее количество запросов.

`query_selects` – Общее количество запросов select.

`query_inserts` – Общее количество запросов insert.

`errors` – Количество запросов, которые вызвали исключение.

`result_rows` – Общее количество строк, выданных в результате.

`result_bytes` - Общий размер строк, выданных в результате.

`read_rows` – Общее количество исходных строк, прочитанных из таблиц для выполнения запроса на всех удалённых серверах.

`read_bytes` - Общий размер, прочитанный из таблиц для выполнения запроса на всех удалённых серверах.

`written_bytes` - Общий размер операции записи. 

`execution_time` – Общее время выполнения запроса в секундах (реальное время).

`failed_sequential_authentications` - Общее количество последовательных ошибок аутентификации. 

Если лимит превышен хотя бы для одного временного интервала, выбрасывается исключение с текстом о том, какое ограничение было превышено, для какого интервала и когда начинается новый интервал (когда запросы могут быть отправлены снова).

Квоты могут использовать функцию "quota key" для отчета о ресурсах для нескольких ключей независимо. Вот пример этого:

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

Квота назначается пользователям в разделе 'users' конфигурации. См. раздел "Права доступа".

Для распределенной обработки запросов накопленные суммы хранятся на сервере запросов. Таким образом, если пользователь переходит на другой сервер, квота там "начинается заново".

Когда сервер перезагружается, квоты сбрасываются.

## Связанный контент {#related-content}

- Блог: [Создание одностраничных приложений с ClickHouse](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)