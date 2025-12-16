---
description: 'サーバー CPU 過負荷時の挙動制御'
sidebar_label: 'サーバー過負荷'
slug: /operations/settings/server-overload
title: 'サーバー過負荷'
doc_type: 'reference'
---

# サーバー過負荷 {#server-overload}

## 概要 {#overview}

サーバーはさまざまな要因により過負荷状態になることがあります。現在の CPU の過負荷状況を判断するために、
ClickHouse サーバーは CPU の待ち時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間
（`OSCPUVirtualTimeMicroseconds` メトリクス）の比率を計算します。サーバーの負荷が一定の比率を超えて過負荷と判断された場合、
負荷をこれ以上増やさないように、一部のクエリを破棄したり、接続要求自体を拒否したりすることが妥当です。

サーバー設定 `os_cpu_busy_time_threshold` により、CPU が有用な処理を行っていると見なすための最小ビジー時間が制御されます。
現在の `OSCPUVirtualTimeMicroseconds` メトリクスの値がこの値を下回っている場合、
CPU の過負荷率は 0 と見なされます。

## クエリの拒否 {#rejecting-queries}

クエリを拒否する動作は、クエリレベルの設定である `min_os_cpu_wait_time_ratio_to_throw` と
`max_os_cpu_wait_time_ratio_to_throw` によって制御されます。これらの設定が指定されていて、かつ `min_os_cpu_wait_time_ratio_to_throw` が
`max_os_cpu_wait_time_ratio_to_throw` より小さい場合、CPU の過負荷比率が少なくとも `min_os_cpu_wait_time_ratio_to_throw` に
達しているときに、ある確率でクエリが拒否され、`SERVER_OVERLOADED` エラーがスローされます。この確率は、
最小比と最大比の間の線形補間として決定されます。例えば、`min_os_cpu_wait_time_ratio_to_throw = 2`、
`max_os_cpu_wait_time_ratio_to_throw = 6`、`cpu_overload = 4` の場合、クエリは `0.5` の確率で拒否されます。

## 接続のドロップ {#dropping-connections}

接続のドロップは、サーバーレベルの設定である `min_os_cpu_wait_time_ratio_to_drop_connection` と
`max_os_cpu_wait_time_ratio_to_drop_connection` によって制御されます。これらの設定はサーバーを再起動せずに変更できます。これらの設定の意図は、クエリ拒否に関する設定と同様です。この場合に唯一異なる点は、サーバーが過負荷状態のときに、サーバー側で接続試行が拒否されることです。

## リソース過負荷警告 {#resource-overload-warnings}

サーバーが過負荷になった際、ClickHouse は CPU とメモリの過負荷警告を `system.warnings` テーブルにも記録します。これらのしきい値はサーバー設定でカスタマイズできます。

**例**

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
