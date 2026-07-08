---
slug: /cloud/managed-postgres/monitoring/dashboard
sidebar_label: '仪表板'
title: 'Managed Postgres 监控仪表板'
description: 'Cloud Console 中用于 Managed Postgres 服务的内置监控仪表板'
keywords: ['Managed Postgres', '监控', '仪表板', 'Cloud Console', 'cpu', '内存', 'iops']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import dashboard from '@site/static/images/managed-postgres/monitoring/dashboard.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-dashboard-beta" />

实例左侧边栏中的 **监控** 选项卡会显示
所选时间范围内资源使用情况和数据库活动的
实时图表。

<Image img={dashboard} alt="监控仪表板显示 IOPS、CPU 使用率、内存、磁盘、网络流量、数据库大小、连接数、吞吐量、事务、缓存命中率和死锁" size="lg" border />

## 面板 \{#panels\}

仪表板将指标分为以下面板：

* **IOPS** — 每秒磁盘读取和写入操作数
* **CPU 使用率** — 按 `user`、`system`、`iowait`、`softirq`
  和 `steal` 分项显示
* **内存使用情况** — 已用内存以及缓存和缓冲区占总量的百分比
* **磁盘使用情况** — 文件系统已用空间占分配给服务的存储空间的百分比
* **网络流量** — 接收和发送的字节数
* **数据库大小** — 每个数据库的字节数 (包括默认的 `postgres`
  以及任何用户创建的数据库)
* **连接数** — 活动连接和空闲连接
* **操作处理量** — 每秒拉取、插入、更新和删除的次数
* **事务** — 每秒提交和回滚的次数
* **缓存命中率** — 从缓冲区缓存而非磁盘中读取的块所占百分比
* **死锁** — 由服务器检测到的死锁

## 时间范围 \{#time-period\}

使用 **时间范围** 选择器可切换到过去一小时、一天、
一周或自定义时间范围。

## 相关页面 \{#related\}

* [Prometheus 端点](/cloud/managed-postgres/monitoring/prometheus) — 将同一组指标抓取到您自己的可观测性堆栈
* [指标参考](/cloud/managed-postgres/monitoring/metrics) — 指标完整列表，包含类型和标签