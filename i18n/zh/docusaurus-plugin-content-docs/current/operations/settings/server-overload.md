---
description: '控制服务器在 CPU 过载时的行为。'
sidebar_label: '服务器过载'
slug: /operations/settings/server-overload
title: '服务器过载'
doc_type: 'reference'
---

# 服务器过载 \\{#server-overload\\}

## 概览 \\{#overview\\}

有时服务器可能会由于各种原因而过载。为了判断当前的 CPU 过载情况，
ClickHouse 服务器会计算 CPU 等待时间（`OSCPUWaitMicroseconds` 指标）与忙碌时间
（`OSCPUVirtualTimeMicroseconds` 指标）的比值。当服务器的过载程度超过某个比值阈值时，
丢弃部分查询，甚至拒绝新的连接请求，以避免进一步增加负载，是合理的。

服务器有一个配置项 `os_cpu_busy_time_threshold`，用于控制将 CPU 视为在执行有用工作时所需的最小忙碌时间。
如果 `OSCPUVirtualTimeMicroseconds` 指标的当前值低于该阈值，
则认为当前不存在 CPU 过载。

## 拒绝查询 \\{#rejecting-queries\\}

拒绝查询的行为由查询级别设置 `min_os_cpu_wait_time_ratio_to_throw` 和
`max_os_cpu_wait_time_ratio_to_throw` 控制。如果设置了这些参数，并且 `min_os_cpu_wait_time_ratio_to_throw` 小于
`max_os_cpu_wait_time_ratio_to_throw`，则当过载比例至少达到 `min_os_cpu_wait_time_ratio_to_throw` 时，查询会按一定概率被拒绝，并抛出 `SERVER_OVERLOADED` 错误。
该概率通过在最小和最大比例之间进行线性插值计算得到。例如，如果 `min_os_cpu_wait_time_ratio_to_throw = 2`、
`max_os_cpu_wait_time_ratio_to_throw = 6`，并且 `cpu_overload = 4`，则查询将以 `0.5` 的概率被拒绝。

## 丢弃连接 \\{#dropping-connections\\}

丢弃连接由服务器级别设置 `min_os_cpu_wait_time_ratio_to_drop_connection` 和
`max_os_cpu_wait_time_ratio_to_drop_connection` 控制。这些设置可以在不重启服务器的情况下进行更改。这些设置背后的思路与拒绝查询类似。唯一的区别在于，在这种情况下，如果服务器过载，新的连接尝试会在服务器端被拒绝。

## 资源过载警告 \\{#resource-overload-warnings\\}

当服务器过载时，ClickHouse 还会将 CPU 和内存过载警告记录到 `system.warnings` 表中。您可以
通过服务器配置来自定义这些阈值。

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
