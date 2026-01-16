---
description: 'ClickHouse の SSH インターフェイスに関するドキュメント'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH インターフェイス'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH インターフェイス'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# PTY 対応 SSH インターフェース \{#ssh-interface-with-pty\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

## 序文 \{#preface\}

ClickHouse サーバーは、SSH プロトコルを使って自身への直接接続を受け付けます。任意のクライアントから接続できます。

[SSH キーで識別されるデータベースユーザー](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys) を作成した後、次のように接続できます。

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

このキーを使って ClickHouse サーバーに接続できます。このキーを使用すると、clickhouse-client の対話型セッションが動作する疑似端末 (PTY) が開きます。

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

SSH 経由でのコマンド実行（非対話モード）にも対応しています。

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## サーバー設定 \{#server-configuration\}

SSH サーバー機能を有効にするには、`config.xml` 内で次のセクションのコメントアウトを解除するか、追加する必要があります。

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

ホスト鍵は SSH プロトコルにおいて不可欠な要素です。この鍵の公開鍵部分はクライアント側の `~/.ssh/known_hosts` ファイルに保存され、通常は中間者攻撃を防ぐために用いられます。サーバーに初めて接続すると、次のようなメッセージが表示されます。

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

これは実際には「このホストの公開鍵を記憶して、接続を続行しますか？」という意味です。

オプションを指定することで、SSH クライアントにホストの検証を行わないよう指示できます。

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 組み込みクライアントの設定 \{#configuring-embedded-client\}

通常の `clickhouse-client` と同様に、組み込みクライアントにもオプションを渡すことができますが、いくつか制限があります。
これは SSH プロトコルで動作するため、ターゲットホストにパラメータを渡す方法は環境変数経由しかありません。

たとえば、`format` を設定するには次のようにします。

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

この方法で任意のユーザーレベルの設定を変更でき、さらに通常の `clickhouse-client` オプションのほとんどを指定できます（この構成で意味をなさないものを除きます）。

重要:

`query` オプションと SSH コマンドの両方が指定された場合、後者の SSH コマンドも実行するクエリのリストに追加されます。

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
