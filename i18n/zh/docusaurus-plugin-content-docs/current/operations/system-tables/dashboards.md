---
description: '包含通过 HTTP 接口访问的 `/dashboard` 页面使用的查询。对于监控和故障排除非常有用。'
slug: /operations/system-tables/dashboards
title: 'system.dashboards'
keywords: ['系统表', '仪表板', '监控', '故障排除']
---

包含通过 [HTTP 接口](/interfaces/http.md) 访问的 `/dashboard` 页面使用的查询。该表对于监控和故障排除非常有用。该表包含仪表板中每个图表的行。

:::note
`/dashboard` 页面不仅可以呈现来自 `system.dashboards` 的查询，还可以来自任何具有相同模式的表。这对于创建自定义仪表板非常有用。
:::

示例：

``` sql
SELECT *
FROM system.dashboards
WHERE title ILIKE '%CPU%'
```

``` text
行 1:
──────
dashboard: overview
title:     CPU 使用率 (核心)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUVirtualTimeMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

行 2:
──────
dashboard: overview
title:     CPU 等待
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUWaitMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

行 3:
──────
dashboard: overview
title:     操作系统 CPU 使用率 (用户空间)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSUserTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

行 4:
──────
dashboard: overview
title:     操作系统 CPU 使用率 (内核)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSSystemTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}
```

列：

- `dashboard` (`String`) - 仪表板名称。
- `title` (`String`) - 图表标题。
- `query` (`String`) - 获取要显示的数据的查询。
