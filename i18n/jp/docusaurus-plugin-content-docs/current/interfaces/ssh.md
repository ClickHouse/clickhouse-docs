---
description: 'ClickHouseにおけるSSHインターフェースのドキュメント'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSHインターフェース'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSHインターフェース'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# PTYを使用したSSHインターフェース

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## 前書き {#preface}

ClickHouseサーバーは、SSHプロトコルを使用して直接接続することを許可しています。任意のクライアントが許可されます。

[SSHキーで識別されるデータベースユーザーを作成した後](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

このキーを使用してClickHouseサーバーに接続できます。これにより、clickhouse-clientのインタラクティブセッションを持つ擬似端末（PTY）が開かれます。

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse組み込みバージョン 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

クエリID: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1行がセットに含まれています。経過時間: 0.002秒。
```

SSH経由でのコマンド実行（非インタラクティブモード）もサポートされています：

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## サーバー設定 {#server-configuration}

SSHサーバー機能を有効にするには、次のセクションを`config.xml`にコメント解除または配置する必要があります：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>keyのパス</host_rsa_key>
   <!--host_ecdsa_key>keyのパス</host_ecdsa_key-->
   <!--host_ed25519_key>keyのパス</host_ed25519_key-->
</ssh_server>
```

ホストキーはSSHプロトコルの重要な部分です。このキーの公開部分は、クライアント側の`~/.ssh/known_hosts`ファイルに保存され、通常は中間者攻撃を防ぐために必要です。初めてサーバーに接続すると、以下のメッセージが表示されます：

```shell
ホスト '[localhost]:9022 ([127.0.0.1]:9022)' の信頼性を確立できません。
RSAキーのフィンガープリントはSHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Doです。
このキーは他の名前では知られていません
接続を続行しますか（yes/no/[fingerprint]）？
```

これは、実際には「このホストの公開キーを記憶して接続を続けますか？」という意味です。

SSHクライアントにホストを検証させないようにするには、オプションを渡すことができます：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 組み込みクライアントの設定 {#configuring-embedded-client}

組み込みクライアントにオプションを渡すことができますが、通常の`clickhouse-client`とはいくつかの制限があります。
これはSSHプロトコルであるため、ターゲットホストにパラメータを渡す唯一の方法は環境変数を通じてです。

例えば、`format`を設定する場合は次のようにします：

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

この方法で任意のユーザーレベルの設定を変更したり、大部分の通常の`clickhouse-client`オプションを渡したりできます（このセットアップでは意味を成さないオプションを除く）。

重要：

`query`オプションとSSHコマンドの両方が渡された場合、後者は実行するクエリのリストに追加されます：

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
