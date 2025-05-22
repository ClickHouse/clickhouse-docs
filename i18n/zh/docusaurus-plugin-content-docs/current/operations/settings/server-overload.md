---
'description': '控制服务器CPU过载时的行为。'
'sidebar_label': '服务器过载'
'slug': '/operations/settings/server-overload'
'title': '服务器过载'
---


# 服务器过载

## 概述 {#overview}

有时，服务器可能因不同原因而变得过载。为了确定当前的 CPU 过载情况，
ClickHouse 服务器计算 CPU 等待时间（`OSCPUWaitMicroseconds` 指标）与忙碌时间
（`OSCPUVirtualTimeMicroseconds` 指标）的比率。当服务器超出某个比率过载时，
丢弃某些查询或甚至拒绝连接请求是有意义的，以避免进一步增加负载。

有一个服务器设置 `os_cpu_busy_time_threshold`，它控制考虑 CPU
正在进行一些有用工作的最小忙碌时间。如果当前的 `OSCPUVirtualTimeMicroseconds` 指标值低于此值，
则假定 CPU 过载为 0。

## 拒绝查询 {#rejecting-queries}

拒绝查询的行为由查询级别设置 `min_os_cpu_wait_time_ratio_to_throw` 和
`max_os_cpu_wait_time_ratio_to_throw` 控制。如果这些设置被设置且 `min_os_cpu_wait_time_ratio_to_throw` 小于
`max_os_cpu_wait_time_ratio_to_throw`，那么查询将被拒绝，并抛出 `SERVER_OVERLOADED` 错误，
如果过载比率至少为 `min_os_cpu_wait_time_ratio_to_throw`，则会以某种概率发生这种情况。
该概率由最小和最大比率之间的线性插值确定。例如，如果 `min_os_cpu_wait_time_ratio_to_throw = 2`，
`max_os_cpu_wait_time_ratio_to_throw = 6`，且 `cpu_overload = 4`，则查询将以 `0.5` 的概率被拒绝。

## 拒绝连接 {#dropping-connections}

拒绝连接由服务器级别设置 `min_os_cpu_wait_time_ratio_to_drop_connection` 和
`max_os_cpu_wait_time_ratio_to_drop_connection` 控制。这些设置可以在不重启服务器的情况下更改。
这些设置的理念与拒绝查询的理念相似。唯一的区别在于，如果服务器过载，
连接尝试将从服务器端被拒绝。
