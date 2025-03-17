---
slug: /interfaces/ssh
sidebar_label: SSHインターフェース
sidebar_position: 60
keywords: [クライアント, ssh, putty]
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SSHインターフェースとPTY

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## 前書き {#preface}

ClickHouseサーバーは、SSHプロトコルを使用して直接接続することを許可しています。任意のクライアントが許可されます。

[SSHキーで識別されたデータベースユーザーを作成](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)した後:
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

このキーを使用してClickHouseサーバーに接続できます。これは、clickhouse-clientのインタラクティブセッションを開く仮想端末（PTY）を開きます。

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse embedded version 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

クエリID: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1 行がセットに含まれています。経過時間: 0.002秒。
```

SSH経由でのコマンド実行（非インタラクティブモード）もサポートされています：

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## サーバー設定 {#server-configuration}

SSHサーバー機能を有効にするには、`config.xml`に以下のセクションをコメント解除するか追加する必要があります：

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

ホストキーはSSHプロトコルの重要な部分です。このキーの公開部分は、クライアント側の`~/.ssh/known_hosts`ファイルに保存され、主に中間者攻撃を防ぐために必要です。サーバーに初めて接続する際には、以下のメッセージが表示されます：

```shell
ホスト '[localhost]:9022 ([127.0.0.1]:9022)' の信頼性を確認できません。
RSAキーのフィンガープリントはSHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Doです。
このキーは他の名前で知られていません
接続を続けますか（yes/no/[fingerprint])?
```

これは実際には「このホストの公開キーを記憶して接続を続けますか？」を意味します。

SSHクライアントにホストを検証しないよう指示するには、オプションを渡します：

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 埋め込みクライアントの設定 {#configuring-embedded-client}

埋め込みクライアントに対して、通常の`clickhouse-client`のようにオプションを渡すことができますが、いくつかの制限があります。このSSHプロトコルでは、ターゲットホストにパラメーターを渡す唯一の方法は環境変数を通じてです。

たとえば、`format`を設定するには次のようにします：

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

この方法で任意のユーザーレベルの設定を変更でき、さらにほとんどの一般的な`clickhouse-client`オプションを渡すことができます（この設定では意味のないものを除く）。

重要：

`query`オプションとSSHコマンドの両方が渡された場合、後者は実行すべきクエリのリストに追加されます：

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
