---
'description': '在服务器 CPU 过载时控制行为。'
'sidebar_label': '服务器负载过重'
'slug': '/operations/settings/server-overload'
'title': 'Server overload'
---




# 服务器过载

## 概述 {#overview}

有时服务器可能会由于不同原因而变得过载。为了确定当前的 CPU 过载情况，ClickHouse 服务器计算 CPU 等待时间（`OSCPUWaitMicroseconds` 指标）与忙碌时间（`OSCPUVirtualTimeMicroseconds` 指标）的比率。当服务器的过载超过某个比率时，丢弃某些查询或甚至拒绝连接请求是有意义的，以避免进一步增加负载。

有一个服务器设置 `os_cpu_busy_time_threshold` 用于控制考虑 CPU 在进行有效工作时的最小忙碌时间。如果当前 `OSCPUVirtualTimeMicroseconds` 指标的值低于此值，则认为 CPU 过载为 0。

## 拒绝查询 {#rejecting-queries}

拒绝查询的行为由查询级设置 `min_os_cpu_wait_time_ratio_to_throw` 和 `max_os_cpu_wait_time_ratio_to_throw` 控制。如果设置了这些参数，并且 `min_os_cpu_wait_time_ratio_to_throw` 小于 `max_os_cpu_wait_time_ratio_to_throw`，则在过载比率至少为 `min_os_cpu_wait_time_ratio_to_throw` 的情况下，查询将被拒绝，并抛出 `SERVER_OVERLOADED` 错误，且拒绝的概率是根据最小与最大比率之间的线性插值来确定的。例如，如果 `min_os_cpu_wait_time_ratio_to_throw = 2`，`max_os_cpu_wait_time_ratio_to_throw = 6`，而 `cpu_overload = 4`，则查询将以 `0.5` 的概率被拒绝。

## 拒绝连接 {#dropping-connections}

拒绝连接由服务器级设置 `min_os_cpu_wait_time_ratio_to_drop_connection` 和 `max_os_cpu_wait_time_ratio_to_drop_connection` 控制。这些设置可以在不重启服务器的情况下更改。这些设置背后的理念与拒绝查询的理念类似。唯一的不同之处在于，如果服务器过载，连接尝试将从服务器端被拒绝。
