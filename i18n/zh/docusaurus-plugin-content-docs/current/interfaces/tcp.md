---
slug: /interfaces/tcp
sidebar_position: 18
sidebar_label: 原生接口 (TCP)
---


# 原生接口 (TCP)

原生协议用于 [命令行客户端](../interfaces/cli.md)、在分布式查询处理期间的服务器间通信，以及其他 C++ 程序。不幸的是，原生 ClickHouse 协议尚未有正式规范，但可以通过反向工程 ClickHouse 源代码（从 [这里开始](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)）和/或通过拦截和分析 TCP 流量来获取。
