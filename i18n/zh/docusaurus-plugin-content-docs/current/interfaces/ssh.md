import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SSH 接口与 PTY

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## 前言 {#preface}

ClickHouse 服务器允许通过 SSH 协议直接连接到自身。任何客户端均可连接。

在创建了一个由 SSH 密钥识别的 [数据库用户](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

您可以使用此密钥连接到 ClickHouse 服务器。它将打开一个伪终端 (PTY) 与 clickhouse-client 的交互会话。

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

也支持通过 SSH 执行命令（非交互模式）：

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## 服务器配置 {#server-configuration}

为启用 SSH 服务器能力，您需要在 `config.xml` 中取消注释或添加以下部分：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

主机密钥是 SSH 协议的重要组成部分。此密钥的公钥部分存储在客户端的 `~/.ssh/known_hosts` 文件中，通常需要用于防止中间人攻击。当您第一次连接到服务器时，您将看到以下消息：

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

这实际上意味着：“您想记住此主机的公钥并继续连接吗？”。

您可以告诉 SSH 客户端不验证主机，通过传递一个选项：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 配置嵌入式客户端 {#configuring-embedded-client}

您可以将参数传递给嵌入式客户端，类似于普通的 `clickhouse-client`，但有一些限制。由于这是 SSH 协议，传递参数到目标主机的唯一方法是通过环境变量。

例如，可以这样设置 `format`：

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

您可以通过这种方式更改任何用户级设置，并额外传递大多数普通的 `clickhouse-client` 选项（除了在此设置中没有意义的选项）。

重要提示：

如果同时传递 `query` 选项和 SSH 命令，则后者将被添加到要执行的查询列表中：

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
