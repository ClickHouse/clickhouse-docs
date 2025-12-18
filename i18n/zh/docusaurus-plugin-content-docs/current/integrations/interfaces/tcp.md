---
description: 'ClickHouse 原生 TCP 接口的文档'
sidebar_label: '原生接口（TCP）'
sidebar_position: 18
slug: /interfaces/tcp
title: '原生接口（TCP）'
doc_type: 'reference'
---

# 原生接口（TCP） {#native-interface-tcp}

原生协议用于[命令行客户端](/interfaces/cli)、在分布式查询处理过程中进行服务器之间的通信，以及其他 C++ 程序中。不幸的是，ClickHouse 原生协议目前还没有正式规范，但可以通过对 ClickHouse 源代码进行逆向工程（从[这里附近](https://github.com/ClickHouse/ClickHouse/tree/master/src/Client)开始）和/或拦截并分析 TCP 流量来加以还原和理解。