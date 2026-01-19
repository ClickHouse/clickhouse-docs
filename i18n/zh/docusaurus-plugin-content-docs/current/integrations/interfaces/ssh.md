---
description: 'ClickHouse 中 SSH 接口文档'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH 接口'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH 接口'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 支持 PTY 的 SSH 接口 \{#ssh-interface-with-pty\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

## 前言 \{#preface\}

ClickHouse 服务器支持通过 SSH 协议直接连接到自身，任何客户端都可以使用该方式连接。

在创建了[通过 SSH 密钥标识的数据库用户](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)之后：

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

你可以使用该密钥连接到 ClickHouse 服务器。它会打开一个伪终端（PTY），并提供一个交互式的 clickhouse-client 会话。

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse embedded version 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

Query id: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1 row in set. Elapsed: 0.002 sec.
```

同样支持通过 SSH 执行命令（非交互模式）：

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## 服务器配置 \{#server-configuration\}

要启用 SSH 服务器功能，需要在 `config.xml` 中取消注释或添加以下配置片段：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

主机密钥是 SSH 协议中不可或缺的一部分。该密钥的公钥部分存储在客户端的 `~/.ssh/known_hosts` 文件中，通常用于防止中间人攻击。首次连接到服务器时，您会看到如下所示的消息：

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

这实际上意味着：“是否要记住此主机的公钥并继续连接？”。

你可以通过传递一个选项，告诉 SSH 客户端不要验证主机：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 配置嵌入式客户端 \{#configuring-embedded-client\}

你可以像使用普通的 `clickhouse-client` 一样向嵌入式客户端传递选项，但存在一些限制。
由于这里使用的是 SSH 协议，向目标主机传递参数的唯一方式是通过环境变量。

例如，可以通过以下方式设置 `format`：

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

你可以通过这种方式修改任意用户级别的设置，并且还可以额外传递大多数常规的 `clickhouse-client` 选项（除了那些在此场景下不适用的选项）。

重要说明：

如果同时传递了 `query` 选项和 SSH 命令，后者会被追加到要执行的查询列表中：

```bash
ubuntu ip-10-1-13-116@~$ ssh -o SetEnv="format=Pretty query=\"SELECT 2;\"" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 2 ┃
   ┡━━━┩
1. │ 2 │
   └───┘
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```
