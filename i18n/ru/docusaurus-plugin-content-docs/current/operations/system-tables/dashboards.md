---
description: 'Содержит запросы, используемые на странице `/dashboard`, доступной через [HTTP интерфейс](/interfaces/http.md). Полезно для мониторинга и устранения неполадок.'
slug: /operations/system-tables/dashboards
title: 'system.dashboards'
keywords: ['system table', 'dashboards', 'monitoring', 'troubleshooting']
---

Содержит запросы, используемые на странице `/dashboard`, доступной через [HTTP интерфейс](/interfaces/http.md). Эта таблица может быть полезна для мониторинга и устранения неполадок. Таблица содержит строку для каждого графика на панели мониторинга.

:::note
Страница `/dashboard` может отображать запросы не только из `system.dashboards`, но и из любой таблицы с той же схемой. Это может быть полезно для создания пользовательских панелей мониторинга.
:::

Пример:

``` sql
SELECT *
FROM system.dashboards
WHERE title ILIKE '%CPU%'
```

``` text
Row 1:
──────
dashboard: overview
title:     CPU Usage (cores)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUVirtualTimeMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

Row 2:
──────
dashboard: overview
title:     CPU Wait
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUWaitMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

Row 3:
──────
dashboard: overview
title:     OS CPU Usage (Userspace)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSUserTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

Row 4:
──────
dashboard: overview
title:     OS CPU Usage (Kernel)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSSystemTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}
```

Колонки:

- `dashboard` (`String`) - Имя панели мониторинга.
- `title` (`String`) - Название графика.
- `query` (`String`) - Запрос для получения данных для отображения.
