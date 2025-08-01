---
description: 'ClickHouseにおけるSSHインターフェースのドキュメント'
keywords:
- 'client'
- 'ssh'
- 'putty'
sidebar_label: 'SSH インターフェース'
sidebar_position: 60
slug: '/interfaces/ssh'
title: 'SSH Interface'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SSHインターフェースとPTY

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## 前書き {#preface}

ClickHouseサーバーは、SSHプロトコルを使用して直接接続することを許可しています。すべてのクライアントが許可されています。


[SSHキーで識別されたデータベースユーザーを作成した後](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

このキーを使用してClickHouseサーバーに接続できます。これにより、clickhouse-clientのインタラクティブセッションを持つ擬似端末（PTY）が開かれます。

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse 埋め込みバージョン 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

クエリID: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1行がセットにあります。経過時間: 0.002秒。
```

SSH経由でのコマンド実行（非インタラクティブモード）もサポートされています：

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```


## サーバー設定 {#server-configuration}

SSHサーバー機能を有効にするには、`config.xml`に以下のセクションをコメント解除または追加する必要があります：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

ホストキーはSSHプロトコルの重要な部分です。このキーの公開部分はクライアント側の`~/.ssh/known_hosts`ファイルに保存され、通常、中間者攻撃を防ぐために必要です。サーバーに初めて接続する際には、以下のメッセージが表示されます：

```shell
ホスト '[localhost]:9022 ([127.0.0.1]:9022)' の信頼性を確認できません。
RSAキーのフィンガープリントは SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do です。
このキーは他の名前では知られていません
接続を続けますか (yes/no/[fingerprint])?
```

これは実際には「このホストの公開キーを記憶し、接続を続けますか？」という意味です。

SSHクライアントにホストを検証させないようにするには、オプションを渡すことができます：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 組み込みクライアントの設定 {#configuring-embedded-client}

組み込みクライアントに普通の`clickhouse-client`と同様のオプションを渡すことができますが、いくつかの制限があります。このSSHプロトコルのため、ターゲットホストにパラメータを渡す唯一の方法は環境変数を通じて行うことです。

例えば、`format`を設定するには次のようにします：

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

この方法で任意のユーザーレベルの設定を変更することができ、さらにほとんどの一般的な`clickhouse-client`オプション（このセットアップでは意味を成さないオプションを除く）を渡すことができます。

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
