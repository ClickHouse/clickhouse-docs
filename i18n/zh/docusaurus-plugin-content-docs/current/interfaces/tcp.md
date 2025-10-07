---
'description': 'ClickHouse 中本地 TCP 接口的文档'
'sidebar_label': '本地接口 (TCP)'
'sidebar_position': 18
'slug': '/interfaces/tcp'
'title': '本地接口 (TCP)'
'doc_type': 'reference'
---


# 原生接口 (TCP)

原生协议用于 [命令行客户端](../interfaces/cli.md)、在分布式查询处理期间的服务器间通信，以及其他 C++ 程序中。不幸的是，原生 ClickHouse 协议尚未正式规范，但可以通过反向工程从 ClickHouse 源代码中获取（大约从 [这里](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client) 开始）和/或通过拦截和分析 TCP 流量来获得。
