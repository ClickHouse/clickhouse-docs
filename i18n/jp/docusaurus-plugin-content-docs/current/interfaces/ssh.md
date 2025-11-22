---
description: 'ClickHouse の SSH インターフェースに関するドキュメント'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH インターフェース'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH インターフェース'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# PTY 付き SSH インターフェイス

<ExperimentalBadge/>
<CloudNotSupportedBadge/>



## はじめに {#preface}

ClickHouseサーバーは、SSHプロトコルを使用して直接接続することができます。任意のクライアントが利用可能です。

[SSHキーで識別されるデータベースユーザー](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)を作成した後:

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

このキーを使用してClickHouseサーバーに接続できます。接続すると、clickhouse-clientの対話型セッションを持つ疑似端末(PTY)が開きます。

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

SSH経由でのコマンド実行(非対話モード)もサポートされています:

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## サーバー設定 {#server-configuration}

SSHサーバー機能を有効にするには、`config.xml`に以下のセクションを追加するか、コメントを解除する必要があります：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

ホストキーはSSHプロトコルの重要な構成要素です。このキーの公開鍵部分はクライアント側の`~/.ssh/known_hosts`ファイルに保存され、中間者攻撃を防ぐために必要となります。サーバーに初めて接続する際、以下のメッセージが表示されます：

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

これは実際には「このホストの公開鍵を記憶して接続を続行しますか？」という意味です。

オプションを指定することで、SSHクライアントにホストの検証をスキップするよう指示できます：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```


## 組み込みクライアントの設定 {#configuring-embedded-client}

通常の`clickhouse-client`と同様に組み込みクライアントにオプションを渡すことができますが、いくつかの制限があります。
SSHプロトコルを使用しているため、ターゲットホストにパラメータを渡す唯一の方法は環境変数を経由することです。

例えば、`format`の設定は次のように行います:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

この方法で任意のユーザーレベル設定を変更でき、さらに通常の`clickhouse-client`オプションのほとんどを渡すことができます(この設定では意味をなさないものを除く)。

重要:

`query`オプションとSSHコマンドの両方が渡された場合、後者が実行するクエリのリストに追加されます:

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
