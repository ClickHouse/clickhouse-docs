---
description: 'Коллекция настроек, сгруппированных под одним именем.'
sidebar_label: 'Профили Настроек'
sidebar_position: 61
slug: /operations/settings/settings-profiles
title: 'Профили Настроек'
---


# Профили Настроек

Профиль настроек — это коллекция настроек, сгруппированных под одним именем.

:::note
ClickHouse также поддерживает [SQL-ориентированный рабочий процесс](/operations/access-rights#access-control-usage) для управления профилями настроек. Мы рекомендуем использовать его.
:::

Профиль может иметь любое имя. Вы можете указать один и тот же профиль для разных пользователей. Самое важное, что вы можете записать в профиль настроек, — это `readonly=1`, что обеспечивает доступ только для чтения.

Профили настроек могут наследовать друг от друга. Для использования наследования укажите одно или несколько настроек `profile` перед другими настройками, которые перечислены в профиле. В случае, если одно и то же значение определяется в различных профилях, используется последнее определенное значение.

Чтобы применить все настройки в профиле, установите настройку `profile`.

Пример:

Установите профиль `web`.

```sql
SET profile = 'web'
```

Профили настроек объявляются в файле конфигурации пользователей. Обычно это `users.xml`.

Пример:

```xml
<!-- Профили настроек -->
<profiles>
    <!-- Настройки по умолчанию -->
    <default>
        <!-- Максимальное количество потоков при выполнении одного запроса. -->
        <max_threads>8</max_threads>
    </default>

    <!-- Настройки для запросов из пользовательского интерфейса -->
    <web>
        <max_rows_to_read>1000000000</max_rows_to_read>
        <max_bytes_to_read>100000000000</max_bytes_to_read>

        <max_rows_to_group_by>1000000</max_rows_to_group_by>
        <group_by_overflow_mode>any</group_by_overflow_mode>

        <max_rows_to_sort>1000000</max_rows_to_sort>
        <max_bytes_to_sort>1000000000</max_bytes_to_sort>

        <max_result_rows>100000</max_result_rows>
        <max_result_bytes>100000000</max_result_bytes>
        <result_overflow_mode>break</result_overflow_mode>

        <max_execution_time>600</max_execution_time>
        <min_execution_speed>1000000</min_execution_speed>
        <timeout_before_checking_execution_speed>15</timeout_before_checking_execution_speed>

        <max_columns_to_read>25</max_columns_to_read>
        <max_temporary_columns>100</max_temporary_columns>
        <max_temporary_non_const_columns>50</max_temporary_non_const_columns>

        <max_subquery_depth>2</max_subquery_depth>
        <max_pipeline_depth>25</max_pipeline_depth>
        <max_ast_depth>50</max_ast_depth>
        <max_ast_elements>100</max_ast_elements>

        <max_sessions_for_user>4</max_sessions_for_user>

        <readonly>1</readonly>
    </web>
</profiles>
```

В примере указаны два профиля: `default` и `web`.

Профиль `default` имеет специальное назначение: он должен всегда присутствовать и применяется при запуске сервера. Другими словами, профиль `default` содержит настройки по умолчанию.

Профиль `web` является обычным профилем, который можно установить с помощью запроса `SET` или с помощью параметра URL в HTTP-запросе.
