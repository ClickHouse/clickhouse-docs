---
'description': 'Контроль поведения при перезагрузке CPU сервера.'
'sidebar_label': 'Перезагрузка сервера'
'slug': '/operations/settings/server-overload'
'title': 'Перезагрузка сервера'
'doc_type': 'reference'
---
# Перегрузка сервера

## Обзор {#overview}

Иногда сервер может стать перегруженным по различным причинам. Для определения текущей нагрузки на ЦП
сервер ClickHouse вычисляет соотношение времени ожидания ЦП (`OSCPUWaitMicroseconds` метрика) к времени загрузки
(`OSCPUVirtualTimeMicroseconds` метрика). Когда сервер перегружен выше определенного соотношения,
имеет смысл отвергнуть некоторые запросы или даже отключить запросы на подключение, чтобы не увеличивать нагрузку еще больше.

Существует настройка сервера `os_cpu_busy_time_threshold`, которая контролирует минимальное время загрузки, чтобы считать ЦП
выполняющим какую-то полезную работу. Если текущее значение метрики `OSCPUVirtualTimeMicroseconds` ниже этого значения,
нагрузка на ЦП считается равной 0.

## Отклонение запросов {#rejecting-queries}

Поведение отклонения запросов контролируется настройками уровня запроса `min_os_cpu_wait_time_ratio_to_throw` и
`max_os_cpu_wait_time_ratio_to_throw`. Если эти настройки заданы и `min_os_cpu_wait_time_ratio_to_throw` меньше
чем `max_os_cpu_wait_time_ratio_to_throw`, тогда запрос будет отклонен, и будет выброшена ошибка `SERVER_OVERLOADED`
с некоторой вероятностью, если соотношение нагрузки по ЦП составляет как минимум `min_os_cpu_wait_time_ratio_to_throw`. Вероятность
определяется как линейная интерполяция между минимальным и максимальным соотношениями. Например, если `min_os_cpu_wait_time_ratio_to_throw = 2`,
`max_os_cpu_wait_time_ratio_to_throw = 6`, и `cpu_overload = 4`, тогда запрос будет отклонен с вероятностью `0.5`.

## Отключение подключений {#dropping-connections}

Отключение подключений контролируется настройками уровня сервера `min_os_cpu_wait_time_ratio_to_drop_connection` и
`max_os_cpu_wait_time_ratio_to_drop_connection`. Эти настройки можно изменить без перезапуска сервера. Идея этих
настроек аналогична идее отклонения запросов. Единственное различие в этом случае состоит в том, что если сервер перегружен,
попытка подключения будет отклонена со стороны сервера.

## Предупреждения о перегрузке ресурсов {#resource-overload-warnings}

ClickHouse также записывает предупреждения о перегрузке ЦП и памяти в таблицу `system.warnings`, когда сервер перегружен. Вы можете
настроить эти пороги через конфигурацию сервера.

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