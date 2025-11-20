---
title: 'ClickHouse 是否支持高频并发查询？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/concurrency
description: 'ClickHouse 支持高 QPS 和高并发'
doc_type: 'reference'
keywords: ['concurrency', 'QPS']
---

# ClickHouse 是否支持高频并发查询？

ClickHouse 专为可直接面向外部用户的实时分析型应用而设计。它能够在拍字节级数据库上，以低延迟（小于 10 毫秒）和高并发（每秒超过 10,000 次查询）处理分析查询，并在同一系统中结合历史数据与实时写入的数据。

这得益于其高效的索引结构、灵活的缓存机制，以及诸如投影（projections）和物化视图（materialized views）等可用配置。

内置的基于角色的访问控制、资源使用配额、可配置的查询复杂度防护机制以及工作负载调度器，使 ClickHouse 成为构建分析数据服务层的理想选择。