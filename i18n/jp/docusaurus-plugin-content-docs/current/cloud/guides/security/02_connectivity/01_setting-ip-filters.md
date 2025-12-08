---
sidebar_label: 'IP フィルタの設定'
slug: /cloud/security/setting-ip-filters
title: 'IP フィルタの設定'
description: 'このページでは、ClickHouse Cloud で ClickHouse サービスへのアクセスを制御する IP フィルタの設定方法を説明します。'
doc_type: 'guide'
keywords: ['IP フィルタ', 'IP アクセスリスト']
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## IP フィルターの設定 {#setting-ip-filters}

IP アクセスリストは、どの送信元アドレスからの接続を許可するかを指定することで、ClickHouse の各種サービスまたは API キーへのトラフィックを制限します。これらのリストは、サービスごとおよび API キーごとに設定できます。リストは、サービスや API キーの作成時だけでなく、作成後にも設定・変更できます。

:::important
ClickHouse Cloud サービスに対して IP アクセスリストを作成しなかった場合、そのサービスには一切のトラフィックが許可されません。ClickHouse サービスの IP アクセスリストを `Allow from anywhere` に設定していると、パブリック IP を探索するインターネットクローラーやスキャナーによって、アイドル状態からアクティブ状態へサービスが定期的に移行させられる可能性があり、その結果として、少額ではあるものの想定外のコストが発生することがあります。
:::

## 準備 {#prepare}

開始する前に、アクセスリストに追加すべき IP アドレスまたは IP アドレス範囲を整理しておいてください。リモートワーカー、オンコール時の待機場所、VPN なども考慮に入れてください。IP アクセスリストのユーザーインターフェイスは、単一のアドレスおよび CIDR 表記のいずれも受け付けます。

Classless Inter-domain Routing (CIDR) 表記を使用すると、従来の Class A、B、C (8、16、24) のサブネットマスクサイズよりも小さい IP アドレス範囲を指定できます。[ARIN](https://account.arin.net/public/cidrCalculator) をはじめとする複数の組織が CIDR 計算機を提供しており、必要に応じて利用できます。CIDR 表記の詳細については、[Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC を参照してください。

## IP アクセスリストを作成または変更する {#create-or-modify-an-ip-access-list}

:::note PrivateLink の外側からの接続にのみ適用
IP アクセスリストは、[PrivateLink](/cloud/security/connectivity/private-networking) の外側、パブリックインターネットからの接続にのみ適用されます。
トラフィックを PrivateLink のみからのものに制限したい場合は、IP Allow list を `DenyAll` に設定します。
:::

<details>
  <summary>ClickHouse サービス用の IP アクセスリスト</summary>

  ClickHouse サービスを作成するとき、IP allow list のデフォルト設定は「Allow from nowhere.」です。 
  
  ClickHouse Cloud のサービス一覧から対象のサービスを選択し、**Settings** を選択します。**Security** セクションの下に IP アクセスリストが表示されるので、**Add IPs** ボタンをクリックします。
  
  サイドバーが表示され、次のオプションを設定できます:
  
- サービスへの受信トラフィックを任意の場所から許可する
- サービスへのアクセスを特定の場所からのみ許可する
- サービスへのすべてのアクセスを拒否する
  
</details>
<details>
  <summary>API キー用の IP アクセスリスト</summary>

  API キーを作成するとき、IP allow list のデフォルト設定は「Allow from anywhere.」です。
  
  API キー一覧で、対象の API キーの **Actions** 列にある縦三点アイコンをクリックし、**Edit** を選択します。画面の下部に IP アクセスリストと、その設定オプションが表示されます:

- サービスへの受信トラフィックを任意の場所から許可する
- サービスへのアクセスを特定の場所からのみ許可する
- サービスへのすべてのアクセスを拒否する
  
</details>

次のスクリーンショットは、「NY Office range」という説明付きで、IP アドレス範囲からのトラフィックを許可するアクセスリストを示しています。
  
<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloud における既存のアクセスリスト" border/>

### 実行可能な操作 {#possible-actions}

1. 追加のエントリを追加するには、**+ Add new IP** を使用します。

  次の例では、`London server` という説明付きで、単一の IP アドレスを追加しています:

<Image img={ip_filter_add_single_ip} size="md" alt="ClickHouse Cloud のアクセスリストに単一 IP を追加する画面" border/>

2. 既存のエントリを削除する

  × アイコンをクリックするとエントリを削除できます。

3. 既存のエントリを編集する

  エントリを直接編集します。

4. **Anywhere** からのアクセスを許可する設定に切り替える

  これは推奨されませんが、設定することは可能です。ClickHouse を基盤として構築したアプリケーションのみをパブリックに公開し、バックエンドの ClickHouse Cloud サービスへのアクセスは制限することを推奨します。

行った変更を適用するには、**Save** をクリックする必要があります。

## 検証 {#verification}

フィルターを作成したら、その範囲内からサービスへ接続できることを確認し、許可された範囲外からの接続が拒否されることも確認してください。 簡単な `curl` コマンドを使用して検証できます：

```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
curl: (35) error:02FFF036:system library:func(4095):接続がピアによってリセットされました
```

または

```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="Attempt permitted from inside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
Ok.
```

## 制限事項 {#limitations}

- 現在、IP アクセスリストは IPv4 のみをサポートしています
