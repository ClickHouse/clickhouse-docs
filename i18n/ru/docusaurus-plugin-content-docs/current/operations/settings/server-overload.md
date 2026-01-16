---
description: 'Управление поведением при перегрузке процессора сервера.'
sidebar_label: 'Перегрузка сервера'
slug: /operations/settings/server-overload
title: 'Перегрузка сервера'
doc_type: 'reference'
---

# Перегрузка сервера \\{#server-overload\\}

## Обзор \\{#overview\\}

Иногда сервер может оказаться перегружен по разным причинам. Чтобы определить текущую перегрузку CPU,
сервер ClickHouse вычисляет отношение времени ожидания CPU (метрика `OSCPUWaitMicroseconds`) ко времени его занятости
(метрика `OSCPUVirtualTimeMicroseconds`). Когда полученное соотношение превышает определённый порог,
имеет смысл отбросить часть запросов или даже отклонять новые подключения, чтобы не увеличивать нагрузку ещё больше.

Существует серверная настройка `os_cpu_busy_time_threshold`, которая задаёт минимальное время занятости, чтобы считать,
что CPU выполняет полезную работу. Если текущее значение метрики `OSCPUVirtualTimeMicroseconds` ниже этого значения,
считается, что перегрузка CPU равна нулю.

## Отклонение запросов \\{#rejecting-queries\\}

Поведение при отклонении запросов контролируется настройками на уровне запроса `min_os_cpu_wait_time_ratio_to_throw` и
`max_os_cpu_wait_time_ratio_to_throw`. Если эти настройки заданы и `min_os_cpu_wait_time_ratio_to_throw` меньше,
чем `max_os_cpu_wait_time_ratio_to_throw`, то запрос отклоняется и ошибка `SERVER_OVERLOADED` генерируется
с некоторой вероятностью, если коэффициент перегрузки не менее `min_os_cpu_wait_time_ratio_to_throw`. Вероятность
определяется как линейная интерполяция между минимальным и максимальным значениями коэффициента. Например, если `min_os_cpu_wait_time_ratio_to_throw = 2`,
`max_os_cpu_wait_time_ratio_to_throw = 6` и `cpu_overload = 4`, то запрос будет отклонён с вероятностью `0.5`.

## Сброс соединений \\{#dropping-connections\\}

Сброс соединений контролируется серверными параметрами `min_os_cpu_wait_time_ratio_to_drop_connection` и
`max_os_cpu_wait_time_ratio_to_drop_connection`. Эти параметры можно изменять без перезапуска сервера. Идея этих
параметров аналогична параметрам для отклонения запросов. Единственное отличие в данном случае состоит в том, что если сервер перегружен,
попытка установления соединения будет отклонена сервером.

## Предупреждения о перегрузке ресурсов \\{#resource-overload-warnings\\}

ClickHouse также записывает в таблицу `system.warnings` предупреждения о перегрузке CPU и памяти при перегрузке сервера. Вы можете
настроить эти пороги в конфигурации сервера.

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
