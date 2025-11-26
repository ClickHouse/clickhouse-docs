---
description: 'ClickHouse 原生 TCP 接口文档'
sidebar_label: '原生接口（TCP）'
sidebar_position: 18
slug: /interfaces/tcp
title: '原生接口（TCP）'
doc_type: 'reference'
---

# 原生接口（TCP）

原生协议用于[命令行客户端](../interfaces/cli.md)、分布式查询处理期间的服务器间通信，以及其他 C++ 程序。不幸的是，ClickHouse 原生协议目前还没有正式规范，但可以通过对 ClickHouse 源码进行逆向分析（从[此处附近](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)开始）和/或拦截并分析 TCP 流量来加以还原。