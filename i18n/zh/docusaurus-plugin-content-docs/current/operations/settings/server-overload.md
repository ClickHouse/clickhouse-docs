---
'description': '控制服务器 CPU 过载时的行为。'
'sidebar_label': '服务器过载'
'slug': '/operations/settings/server-overload'
'title': '服务器过载'
'doc_type': 'reference'
---


# 服务器过载

## 概述 {#overview}

有时服务器可能因各种原因变得过载。为了确定当前的 CPU 过载情况，ClickHouse 服务器计算 CPU 等待时间（`OSCPUWaitMicroseconds` 指标）与忙碌时间（`OSCPUVirtualTimeMicroseconds` 指标）的比值。当服务器的过载超过某个比率时，舍弃一些查询或者甚至丢弃连接请求是有意义的，以免进一步增加负载。

有一个服务器设置 `os_cpu_busy_time_threshold` 控制考虑 CPU 从事某些有用工作的最小忙碌时间。如果当前的 `OSCPUVirtualTimeMicroseconds` 指标值低于此值，则假定 CPU 过载为 0。

## 拒绝查询 {#rejecting-queries}

拒绝查询的行为由查询级别设置 `min_os_cpu_wait_time_ratio_to_throw` 和 `max_os_cpu_wait_time_ratio_to_throw` 控制。如果这些设置被配置且 `min_os_cpu_wait_time_ratio_to_throw` 小于 `max_os_cpu_wait_time_ratio_to_throw`，那么在过载比率至少达到 `min_os_cpu_wait_time_ratio_to_throw` 的情况下查询会被拒绝，并且抛出 `SERVER_OVERLOADED` 错误。拒绝的概率通过最小和最大比率之间的线性插值确定。例如，如果 `min_os_cpu_wait_time_ratio_to_throw = 2`，`max_os_cpu_wait_time_ratio_to_throw = 6`，且 `cpu_overload = 4`，那么查询将以 `0.5` 的概率被拒绝。

## 丢弃连接 {#dropping-connections}

丢弃连接由服务器级别设置 `min_os_cpu_wait_time_ratio_to_drop_connection` 和 `max_os_cpu_wait_time_ratio_to_drop_connection` 控制。这些设置可以在不重启服务器的情况下进行更改。这些设置背后的理念与拒绝查询的类似。唯一的区别在于，如果服务器过载，连接尝试将从服务器端被拒绝。

## 资源过载警告 {#resource-overload-warnings}

当服务器过载时，ClickHouse 还会将 CPU 和内存过载警告记录到 `system.warnings` 表中。您可以通过服务器配置自定义这些阈值。

**示例**

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
