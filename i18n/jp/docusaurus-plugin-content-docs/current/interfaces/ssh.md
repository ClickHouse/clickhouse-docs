---
'description': 'ClickHouse の SSH インターフェースに関する Documentation'
'keywords':
- 'client'
- 'ssh'
- 'putty'
'sidebar_label': 'SSH インターフェース'
'sidebar_position': 60
'slug': '/interfaces/ssh'
'title': 'SSH インターフェース'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SSH インターフェースと PTY

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

## はじめに {#preface}

ClickHouse サーバーは、SSH プロトコルを使用して直接接続することを許可します。任意のクライアントが許可されています。

[SSH キーで認証されたデータベースユーザーを作成した後](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):
```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<REDACTED>' TYPE 'ssh-ed25519';
```

このキーを使用して、ClickHouse サーバーに接続できます。これにより、clickhouse-client のインタラクティブ セッションを持つ擬似端末 (PTY) が開きます。

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

SSH 経由でのコマンド実行 (非インタラクティブモード) もサポートされています:

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## サーバー構成 {#server-configuration}

SSH サーバー機能を有効にするには、`config.xml` に次のセクションをアンコメントするか、配置する必要があります:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>path-to-the-key</host_rsa_key>
   <!--host_ecdsa_key>path-to-the-key</host_ecdsa_key-->
   <!--host_ed25519_key>path-to-the-key</host_ed25519_key-->
</ssh_server>
```

ホストキーは SSH プロトコルの不可欠な部分です。このキーの公開部分は、クライアント側の `~/.ssh/known_hosts` ファイルに保存され、通常は中間者型攻撃を防ぐために必要です。サーバーに初めて接続する際には、以下のメッセージが表示されます:

```shell
The authenticity of host '[localhost]:9022 ([127.0.0.1]:9022)' can't be established.
RSA key fingerprint is SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

これは、実際には「このホストの公開鍵を記憶して接続を続けますか？」という意味です。

SSH クライアントにホストを検証しないよう指示するためには、以下のオプションを渡すことができます:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## 組み込みクライアントの設定 {#configuring-embedded-client}

普通の `clickhouse-client` と同様に、組み込みクライアントにオプションを渡すことができますが、いくつかの制限があります。
SSH プロトコルであるため、ターゲットホストにパラメータを渡す唯一の方法は環境変数を通じてです。

例えば、`format` を設定するには、次のように行います:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

この方法でユーザーレベルの設定を変更でき、さらに普通の `clickhouse-client` オプションのほとんどを渡すことができます (このセットアップでは意味を成さないオプションは除きます)。

重要:

`query` オプションと SSH コマンドの両方が渡された場合、後者は実行するクエリのリストに追加されます:

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
