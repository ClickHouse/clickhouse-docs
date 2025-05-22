---
'description': 'ClickHouse 中原生TCP接口的文档'
'sidebar_label': '原生接口 (TCP)'
'sidebar_position': 18
'slug': '/interfaces/tcp'
'title': '原生接口 (TCP)'
---


# 原生接口 (TCP)

原生协议用于 [命令行客户端](../interfaces/cli.md)、在分布式查询处理期间的服务器间通信，以及其他 C++ 程序。不幸的是，原生 ClickHouse 协议尚未正式规范，但可以从 ClickHouse 源代码中进行逆向工程（从 [这里开始](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)）和/或通过拦截和分析 TCP 流量。
