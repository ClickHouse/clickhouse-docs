---
description: "/dashboardページから取得されるクエリを含んでいます。HTTPインターフェースを通じてアクセス可能で、監視やトラブルシューティングに有用です。"
slug: /operations/system-tables/dashboards
title: "ダッシュボード"
keywords: ["システムテーブル", "ダッシュボード", "監視", "トラブルシューティング"]
---

`/dashboard`ページから取得されるクエリを含んでおり、[HTTPインターフェース](/interfaces/http.md)を通じてアクセス可能です。このテーブルは、監視やトラブルシューティングに有用です。このテーブルには、ダッシュボード内の各チャートに対して行が含まれています。

:::note
`/dashboard`ページは、`system.dashboards`からだけでなく、同じスキーマを持つ任意のテーブルからクエリをレンダリングできます。これにより、カスタムダッシュボードを作成するのに有用です。
:::

例：

``` sql
SELECT *
FROM system.dashboards
WHERE title ILIKE '%CPU%'
```

``` text
行 1:
──────
ダッシュボード: 概要
タイトル:     CPU使用率 (コア)
クエリ:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUVirtualTimeMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

行 2:
──────
ダッシュボード: 概要
タイトル:     CPU待機
クエリ:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(ProfileEvent_OSCPUWaitMicroseconds) / 1000000
FROM system.metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32}
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

行 3:
──────
ダッシュボード: 概要
タイトル:     OS CPU使用率 (ユーザースペース)
クエリ:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSUserTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}

行 4:
──────
ダッシュボード: 概要
タイトル:     OS CPU使用率 (カーネル)
クエリ:     SELECT toStartOfInterval(event_time, INTERVAL {rounding:UInt32} SECOND)::INT AS t, avg(value)
FROM system.asynchronous_metric_log
WHERE event_date >= toDate(now() - {seconds:UInt32}) AND event_time >= now() - {seconds:UInt32} AND metric = 'OSSystemTimeNormalized'
GROUP BY t
ORDER BY t WITH FILL STEP {rounding:UInt32}
```

カラム:

- `dashboard` (`String`) - ダッシュボードの名前。
- `title` (`String`) - チャートのタイトル。
- `query` (`String`) - 表示するデータを取得するためのクエリ。
