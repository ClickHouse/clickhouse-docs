---
description: 'CPU 過負荷時のサーバー動作の制御。'
sidebar_label: 'サーバー過負荷'
slug: /operations/settings/server-overload
title: 'サーバー過負荷'
doc_type: 'reference'
---



# サーバー過負荷



## 概要 {#overview}

サーバーはさまざまな理由により過負荷状態になることがあります。現在のCPU過負荷を判定するため、
ClickHouseサーバーはCPU待機時間(`OSCPUWaitMicroseconds`メトリック)とビジー時間
(`OSCPUVirtualTimeMicroseconds`メトリック)の比率を計算します。サーバーが特定の比率を超えて過負荷状態になった場合、
負荷をさらに増加させないために、一部のクエリを破棄するか、接続リクエストをドロップすることが適切です。

サーバー設定`os_cpu_busy_time_threshold`は、CPUが有用な作業を実行していると見なすための最小ビジー時間を制御します。`OSCPUVirtualTimeMicroseconds`メトリックの現在値がこの値を下回る場合、
CPU過負荷は0と見なされます。


## クエリの拒否 {#rejecting-queries}

クエリの拒否動作は、クエリレベルの設定`min_os_cpu_wait_time_ratio_to_throw`および`max_os_cpu_wait_time_ratio_to_throw`によって制御されます。これらの設定が指定されており、かつ`min_os_cpu_wait_time_ratio_to_throw`が`max_os_cpu_wait_time_ratio_to_throw`より小さい場合、過負荷率が少なくとも`min_os_cpu_wait_time_ratio_to_throw`以上であれば、クエリは一定の確率で拒否され、`SERVER_OVERLOADED`エラーがスローされます。この確率は、最小値と最大値の比率間の線形補間によって決定されます。例えば、`min_os_cpu_wait_time_ratio_to_throw = 2`、`max_os_cpu_wait_time_ratio_to_throw = 6`、`cpu_overload = 4`の場合、クエリは`0.5`の確率で拒否されます。


## 接続の切断 {#dropping-connections}

接続の切断は、サーバーレベルの設定 `min_os_cpu_wait_time_ratio_to_drop_connection` および
`max_os_cpu_wait_time_ratio_to_drop_connection` によって制御されます。これらの設定は、サーバーを再起動せずに変更できます。これらの設定の考え方は、クエリの拒否と同様です。この場合の唯一の違いは、サーバーが過負荷状態の場合、接続試行がサーバー側で拒否されることです。


## リソース過負荷警告 {#resource-overload-warnings}

ClickHouseは、サーバーが過負荷状態になった際に、CPUおよびメモリの過負荷警告を`system.warnings`テーブルに記録します。これらの閾値は、サーバー設定でカスタマイズできます。

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
