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

ClickHouse 专为可直接面向外部用户的实时分析型应用而设计。它可以在 PB 级数据库上以低延迟（小于 10 毫秒）和高并发（每秒超过 10,000 个查询）执行分析查询，并同时处理历史数据和实时写入的数据。

这得益于高效的索引结构、灵活的缓存机制，以及如 projections 和 materialized views 等配置选项。

内置的基于角色的访问控制、资源使用配额、可配置的查询复杂度防护机制以及工作负载调度器，使 ClickHouse 成为构建分析数据之上的服务层的理想选择。