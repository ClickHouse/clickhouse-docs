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


# 带有 PTY 的 SSH 接口

<ExperimentalBadge/>
<CloudNotSupportedBadge/>



## 前言 {#preface}

ClickHouse 服务器允许使用 SSH 协议直接连接。任何客户端均可使用。

创建[通过 SSH 密钥进行身份验证的数据库用户](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)后:

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

您可以使用此密钥连接到 ClickHouse 服务器。连接后将打开一个伪终端(PTY),并启动 clickhouse-client 的交互式会话。

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

同时也支持通过 SSH 执行命令(非交互模式):

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## 服务器配置 {#server-configuration}

要启用 SSH 服务器功能,需要在 `config.xml` 中取消注释或添加以下配置段:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

主机密钥是 SSH 协议不可或缺的组成部分。该密钥的公钥部分存储在客户端的 `~/.ssh/known_hosts` 文件中,用于防止中间人攻击。首次连接服务器时,将显示以下消息:

```shell
无法确认主机 '[localhost]:9022 ([127.0.0.1]:9022)' 的真实性。
RSA 密钥指纹为 SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do。
此密钥没有其他已知名称
确定要继续连接吗(yes/no/[fingerprint])?
```

这实际上的含义是:"是否要记住此主机的公钥并继续连接?"。

可以通过传递选项来指示 SSH 客户端不验证主机:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```


## 配置嵌入式客户端 {#configuring-embedded-client}

您可以向嵌入式客户端传递选项,类似于普通的 `clickhouse-client`,但有一些限制。
由于使用的是 SSH 协议,向目标主机传递参数的唯一方式是通过环境变量。

例如,设置 `format` 可以通过以下方式完成:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

您可以通过这种方式更改任何用户级设置,并且还可以传递大多数普通 `clickhouse-client` 选项(在此场景中不适用的选项除外)。

重要提示:

如果同时传递了 `query` 选项和 SSH 命令,后者会被添加到要执行的查询列表中:

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
