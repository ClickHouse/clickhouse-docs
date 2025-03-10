---
slug: /interfaces/ssh
sidebar_label: SSH接口
sidebar_position: 60
keywords: ['client', 'ssh', 'putty']
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 带有PTY的SSH接口

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## 前言 {#preface}

ClickHouse服务器允许使用SSH协议直接连接到自身。任何客户端都被允许。

在创建了一个[通过SSH密钥识别的数据库用户](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)后：
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

您可以使用此密钥连接到ClickHouse服务器。这将打开一个伪终端（PTY）并启动clickhouse-client的交互式会话。

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

也支持通过SSH执行命令（非交互模式）：

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## 服务器配置 {#server-configuration}

为了启用SSH服务器功能，您需要取消注释或将以下部分放入您的`config.xml`中：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

主机密钥是SSH协议的一个关键部分。此密钥的公钥部分存储在客户端的`~/.ssh/known_hosts`文件中，通常需要防止中间人攻击。当首次连接到服务器时，您将看到以下消息：

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

这实际上意味着：“您是否想要记住此主机的公钥并继续连接？”。

您可以通过传递一个选项，告诉您的SSH客户端不要验证主机：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 配置嵌入式客户端 {#configuring-embedded-client}

您可以类似于普通的`clickhouse-client`，向嵌入式客户端传递选项，但有一些限制。
由于这是一个SSH协议，唯一的向目标主机传递参数的方式是通过环境变量。

例如，可以通过以下方式设置`format`：

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

您可以通过这种方式更改任何用户级设置，并附加传递大多数普通的`clickhouse-client`选项（除了在此设置中没有意义的选项）。

重要提示：

如果同时传递`query`选项和SSH命令，后者将添加到要执行的查询列表中：

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
