---
description: 'Управление поведением при перегрузке процессора сервера.'
sidebar_label: 'Перегрузка сервера'
slug: /operations/settings/server-overload
title: 'Перегрузка сервера'
doc_type: 'reference'
---



# Перегрузка сервера



## Обзор {#overview}

Иногда сервер может оказаться перегруженным по различным причинам. Для определения текущей перегрузки процессора
сервер ClickHouse вычисляет отношение времени ожидания процессора (метрика `OSCPUWaitMicroseconds`) ко времени его занятости
(метрика `OSCPUVirtualTimeMicroseconds`). Когда сервер перегружен выше определённого порога,
целесообразно отклонять некоторые запросы или даже отклонять запросы на подключение, чтобы не увеличивать нагрузку ещё больше.

Существует настройка сервера `os_cpu_busy_time_threshold`, которая определяет минимальное время занятости, при котором процессор
считается выполняющим полезную работу. Если текущее значение метрики `OSCPUVirtualTimeMicroseconds` ниже этого значения,
перегрузка процессора считается равной 0.


## Отклонение запросов {#rejecting-queries}

Поведение отклонения запросов контролируется настройками уровня запроса `min_os_cpu_wait_time_ratio_to_throw` и
`max_os_cpu_wait_time_ratio_to_throw`. Если эти настройки заданы и `min_os_cpu_wait_time_ratio_to_throw` меньше,
чем `max_os_cpu_wait_time_ratio_to_throw`, то запрос отклоняется и генерируется ошибка `SERVER_OVERLOADED`
с определённой вероятностью, если коэффициент перегрузки достигает как минимум `min_os_cpu_wait_time_ratio_to_throw`. Вероятность
определяется путём линейной интерполяции между минимальным и максимальным коэффициентами. Например, если `min_os_cpu_wait_time_ratio_to_throw = 2`,
`max_os_cpu_wait_time_ratio_to_throw = 6` и `cpu_overload = 4`, то запрос будет отклонён с вероятностью `0.5`.


## Разрыв соединений {#dropping-connections}

Разрыв соединений контролируется настройками уровня сервера `min_os_cpu_wait_time_ratio_to_drop_connection` и
`max_os_cpu_wait_time_ratio_to_drop_connection`. Эти настройки можно изменять без перезапуска сервера. Принцип работы
этих настроек аналогичен принципу отклонения запросов. Единственное отличие заключается в том, что при перегрузке сервера
попытка установить соединение будет отклонена на стороне сервера.


## Предупреждения о перегрузке ресурсов {#resource-overload-warnings}

ClickHouse также записывает предупреждения о перегрузке процессора и памяти в таблицу `system.warnings` при перегрузке сервера. Эти пороговые значения можно настроить в конфигурации сервера.

**Пример**

```xml

<resource_overload_warnings>
    <cpu_overload_warn_ratio>0.9</cpu_overload_warn_ratio>
    <cpu_overload_clear_ratio>0.8</cpu_overload_clear_ratio>
    <cpu_overload_duration_seconds>600</cpu_overload_duration_seconds>
    <memory_overload_warn_ratio>0.9</memory_overload_warn_ratio>
    <memory_overload_clear_ratio>0.8</memory_overload_clear_ratio>
    <memory_overload_duration_seconds>600</memory_overload_duration_seconds>
</resource_overload_warnings>
```
