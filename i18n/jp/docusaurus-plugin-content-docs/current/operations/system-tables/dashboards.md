---
'description': '`/dashboard` ページで使用されるクエリを含む。HTTP インターフェースを介してアクセス可能。監視およびトラブルシューティングに役立ちます。'
'keywords':
- 'system table'
- 'dashboards'
- 'monitoring'
- 'troubleshooting'
'slug': '/operations/system-tables/dashboards'
'title': 'system.dashboards'
'doc_type': 'reference'
---

含まれているクエリは、[HTTPインターフェース](/interfaces/http.md)を通じてアクセス可能な `/dashboard` ページによって使用されます。 このテーブルは、モニタリングとトラブルシューティングに役立ちます。 テーブルには、ダッシュボード内の各チャートの行が含まれています。

:::note
`/dashboard` ページは、`system.dashboards` だけでなく、同じスキーマを持つ任意のテーブルからクエリをレンダリングできます。 これはカスタムダッシュボードを作成するのに役立ちます。
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

カラム:

- `dashboard` (`String`) - ダッシュボード名。
- `title` (`String`) - チャートのタイトル。
- `query` (`String`) - 表示するデータを取得するためのクエリ。
