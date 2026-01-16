---
title: 'ClickHouse 是否支持频繁并发查询？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/concurrency
description: 'ClickHouse 支持高 QPS 和高并发'
doc_type: 'reference'
keywords: ['并发', 'QPS']
---

# ClickHouse 是否支持高频并发查询？ \{#does-clickhouse-support-frequent-concurrent-queries\}

ClickHouse 专为可直接对外服务的实时分析型应用而设计。它可以在 PB 级数据库上，将历史数据与实时写入相结合，以低延迟（小于 10 毫秒）和高并发（每秒超过 10,000 次查询）处理分析查询。

这得益于高效的索引结构、灵活的缓存机制，以及如 projections 和物化视图等配置选项。

内置的基于角色的访问控制、资源使用配额、可配置的查询复杂度防护机制以及工作负载调度器等功能，使 ClickHouse 非常适合作为分析数据之上的服务层。