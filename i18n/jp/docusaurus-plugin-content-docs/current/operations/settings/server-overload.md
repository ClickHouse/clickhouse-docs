---
description: 'サーバーのCPU過負荷時の挙動の制御'
sidebar_label: 'サーバー過負荷'
slug: '/operations/settings/server-overload'
title: 'サーバーの過負荷'
---




# サーバーの過負荷

## 概要 {#overview}

サーバーはさまざまな理由で過負荷になることがあります。現在のCPUの過負荷を判断するために、ClickHouseサーバーはCPU待機時間（`OSCPUWaitMicroseconds`メトリック）とビジー時間（`OSCPUVirtualTimeMicroseconds`メトリック）の比率を計算します。サーバーが特定の比率を超えて過負荷になると、一部のクエリを破棄したり、接続要求を拒否してさらに負荷が増加しないようにすることが理にかなります。

`os_cpu_busy_time_threshold`というサーバー設定があり、これはCPUが有用な作業を行っていると見なすための最小ビジー時間を制御します。`OSCPUVirtualTimeMicroseconds`メトリックの現在の値がこの値未満の場合、CPUの過負荷は0と見なされます。

## クエリの拒否 {#rejecting-queries}

クエリの拒否の挙動は、クエリレベルの設定`min_os_cpu_wait_time_ratio_to_throw`と`max_os_cpu_wait_time_ratio_to_throw`によって制御されます。これらの設定が設定されていて、`min_os_cpu_wait_time_ratio_to_throw`が`max_os_cpu_wait_time_ratio_to_throw`より小さい場合、クエリは拒否され、過負荷比率が少なくとも`min_os_cpu_wait_time_ratio_to_throw`であるときに`SERVER_OVERLOADED`エラーが一定の確率でスローされます。確率は、最小比率と最大比率の間で線形補間として決定されます。たとえば、`min_os_cpu_wait_time_ratio_to_throw = 2`、`max_os_cpu_wait_time_ratio_to_throw = 6`、`cpu_overload = 4`の場合、クエリは`0.5`の確率で拒否されます。

## 接続の拒否 {#dropping-connections}

接続の拒否は、サーバーレベルの設定`min_os_cpu_wait_time_ratio_to_drop_connection`と`max_os_cpu_wait_time_ratio_to_drop_connection`によって制御されます。これらの設定は、サーバーを再起動せずに変更できます。これらの設定の背後にある考え方は、クエリの拒否と同様です。この場合の唯一の違いは、サーバーが過負荷の場合、接続試行がサーバー側で拒否されることです。
