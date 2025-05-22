---
'description': 'Contains queries used by `/dashboard` page accessible though the HTTP
  interface. useful for monitoring and troubleshooting.'
'keywords':
- 'system table'
- 'dashboards'
- 'monitoring'
- 'troubleshooting'
'slug': '/operations/system-tables/dashboards'
'title': 'system.dashboards'
---



Contains queries used by `/dashboard` page accessible though [HTTP interface](/interfaces/http.md).
このテーブルは監視およびトラブルシューティングに役立つことがあります。テーブルは、ダッシュボード内の各チャートに対して行を含んでいます。

:::note
`/dashboard` ページは `system.dashboards` だけでなく、同じスキーマを持つ任意のテーブルからクエリをレンダリングできます。
これはカスタムダッシュボードを作成するのに役立ちます。
:::

例:

```sql
SELECT *
FROM system.dashboards
WHERE title ILIKE '%CPU%'
```

```text
Row 1:
──────
dashboard: overview
title:     CPU 使用率 (コア)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUVirtualTimeMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

Row 2:
──────
dashboard: overview
title:     CPU 待機
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUWaitMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

Row 3:
──────
dashboard: overview
title:     OS CPU 使用率 (ユーザ空間)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSUserTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

Row 4:
──────
dashboard: overview
title:     OS CPU 使用率 (カーネル)
query:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSSystemTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}
```

列:

- `dashboard` (`String`) - ダッシュボードの名前。
- `title` (`String`) - チャートのタイトル。
- `query` (`String`) - 表示するデータを取得するためのクエリ。
