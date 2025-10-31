---
'description': '包含通过 HTTP 接口访问的 `/dashboard` 页面使用的查询。用于监控和故障排除。'
'keywords':
- 'system table'
- 'dashboards'
- 'monitoring'
- 'troubleshooting'
'slug': '/operations/system-tables/dashboards'
'title': 'system.dashboards'
'doc_type': 'reference'
---

包含通过 [HTTP 接口](/interfaces/http.md) 访问的 `/dashboard` 页面使用的查询。 该表对监控和故障排除很有用。 表中为仪表板中的每个图表包含一行。

:::note
`/dashboard` 页面不仅可以渲染来自 `system.dashboards` 的查询，还可以渲染任何具有相同模式的表中的查询。 这对于创建自定义仪表板非常有用。
:::

示例：

```sql
SELECT *
FROM system.dashboards
WHERE title ILIKE '%CPU%'
```

```text
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

列：

- `dashboard` (`String`) - 仪表板名称。
- `title` (`String`) - 图表标题。
- `query` (`String`) - 用于获取要显示的数据的查询。
