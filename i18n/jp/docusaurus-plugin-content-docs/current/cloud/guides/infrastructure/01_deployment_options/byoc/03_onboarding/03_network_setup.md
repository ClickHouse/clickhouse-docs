---
title: 'プライベートネットワークのセットアップ'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: 'プライベートネットワークのセットアップ'
keywords: ['BYOC', 'Cloud', 'bring your own cloud', 'vpc peering', 'privatelink']
description: '自身の Cloud インフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

ClickHouse BYOC は、セキュリティを強化し、自社サービスとの直接接続を可能にするため、さまざまなプライベートネットワーキングオプションをサポートしています。このガイドでは、自社の AWS または GCP アカウント内の ClickHouse Cloud デプロイメントを、社内アプリケーションや分析ツールなどの他のネットワークやサービスに安全に接続するための推奨アプローチを順を追って説明します。ここでは、VPC Peering、AWS PrivateLink、GCP Private Service Connect などのオプションを取り上げ、それぞれの主な手順と考慮事項を概説します。

ClickHouse BYOC デプロイメントへのプライベートネットワーク接続が必要な場合は、このガイドの手順に従うか、より高度なシナリオについては ClickHouse Support にお問い合わせください。


## VPC ピアリングをセットアップする (AWS) \{#aws-vpc-peering\}

ClickHouse BYOC 用の VPC ピアリングを作成または削除するには、次の手順に従います。

<VerticalStepper headerLevel="h3">

### ClickHouse BYOC 用のプライベートロードバランサーを有効化する \{#step-1-enable-private-load-balancer-for-clickhouse-byoc\}
ClickHouse サポートに連絡して、Private Load Balancer を有効化してください。

### ピアリング接続を作成する \{#step-2-create-a-peering-connection\}
1. ClickHouse BYOC アカウントで VPC ダッシュボードに移動します。
2. 「Peering Connections」を選択します。
3. 「Create Peering Connection」をクリックします。
4. VPC Requester に ClickHouse の VPC ID を設定します。
5. VPC Accepter に対象 VPC ID を設定します（必要に応じて別アカウントを選択）。
6. 「Create Peering Connection」をクリックします。

<Image img={byoc_vpcpeering} size="lg" alt="BYOC ピアリング接続の作成" border />

### ピアリング接続要求を承認する \{#step-3-accept-the-peering-connection-request\}
ピアリング先のアカウントで、(VPC -> Peering connections -> Actions -> Accept request) ページに移動し、この VPC ピアリング要求を承認します。

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC ピアリング接続の承認" border />

### ClickHouse VPC のルートテーブルに宛先を追加する \{#step-4-add-destination-to-clickhouse-vpc-route-tables\}
ClickHouse BYOC アカウントで、
1. VPC ダッシュボードの「Route Tables」を選択します。
2. ClickHouse の VPC ID を検索し、プライベートサブネットに関連付けられている各ルートテーブルを編集します。
3. 「Routes」タブの「Edit」ボタンをクリックします。
4. 「Add another route」をクリックします。
5. 宛先 (Destination) に対象 VPC の CIDR 範囲を入力します。
6. ターゲット (Target) として「Peering Connection」と、そのピアリング接続の ID を選択します。

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC ルートテーブルの追加" border />

### 対象 VPC のルートテーブルに宛先を追加する \{#step-5-add-destination-to-the-target-vpc-route-tables\}
ピアリング先の AWS アカウントで、
1. VPC ダッシュボードの「Route Tables」を選択します。
2. 対象 VPC ID を検索します。
3. 「Routes」タブの「Edit」ボタンをクリックします。
4. 「Add another route」をクリックします。
5. 宛先 (Destination) に ClickHouse VPC の CIDR 範囲を入力します。
6. ターゲット (Target) として「Peering Connection」と、そのピアリング接続の ID を選択します。

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC ルートテーブルの追加" border />

### セキュリティグループを編集してピアリング先 VPC アクセスを許可する \{#step-6-edit-security-group-to-allow-peered-vpc-access\}

ClickHouse BYOC アカウントで、ピアリング先 VPC からのトラフィックを許可するように Security Group 設定を更新する必要があります。ピアリング先 VPC の CIDR 範囲を含むインバウンドルールの追加を依頼するため、ClickHouse サポートに連絡してください。

---
これで、ピアリングされた VPC から ClickHouse サービスへアクセスできるようになります。
</VerticalStepper>

ClickHouse へプライベートにアクセスするために、ユーザーのピアリング先 VPC から安全に接続するためのプライベートロードバランサーおよびエンドポイントがプロビジョニングされます。プライベートエンドポイントは、パブリックエンドポイントの形式に `-private` サフィックスを付けたものになります。例:

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

任意ですが、ピアリングが正常に動作していることを確認した後、ClickHouse BYOC 用のパブリックロードバランサーの削除を依頼することもできます。

## PrivateLink のセットアップ (AWS) \{#setup-privatelink\}

AWS PrivateLink は、VPC ピアリングやインターネットゲートウェイを必要とせずに、ClickHouse BYOC サービスへの安全でプライベートな接続を提供します。トラフィックは完全に AWS ネットワーク内で流れ、パブリックインターネットを経由しません。

<VerticalStepper headerLevel="h3">

### PrivateLink セットアップの申請 \{#step-1-request-privatelink-setup\}

[ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) に連絡して、BYOC デプロイメント向けの PrivateLink セットアップを申請してください。この段階で特別な情報は不要で、PrivateLink 接続を設定したい旨を伝えるだけで構いません。

ClickHouse Support は、**プライベートロードバランサー** や **PrivateLink サービスエンドポイント** を含む必要なインフラストラクチャコンポーネントを有効にします。

### お使いの VPC にエンドポイントを作成する \{#step-2-create-endpoint\}

ClickHouse Support 側で PrivateLink が有効化されたら、クライアントアプリケーションの VPC 内に、ClickHouse PrivateLink サービスへ接続するための VPC エンドポイントを作成する必要があります。

1. **エンドポイントサービス名を取得する**:
   - ClickHouse Support からエンドポイントサービス名が提供されます
   - また、AWS VPC コンソールの「Endpoint Services」で確認することもできます（サービス名でフィルタするか、ClickHouse のサービスを探してください）

<Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink サービスエンドポイント" border />

2. **VPC エンドポイントを作成する**:
   - AWS VPC コンソール → Endpoints → Create Endpoint に移動します
   - 「Find service by name」を選択し、ClickHouse Support から提供されたエンドポイントサービス名を入力します
   - VPC を選択し、サブネットを選択します（アベイラビリティゾーンごとに 1 つを推奨）
   - **重要**: エンドポイントで「Private DNS names」を有効化します — DNS 解決が正しく機能するために必須です
   - エンドポイント用のセキュリティグループを選択または作成します
   - 「Create Endpoint」をクリックします

:::important
**DNS 要件**: 
- VPC エンドポイント作成時に「Private DNS names」を有効化してください
- VPC で「DNS Hostnames」が有効になっていることを確認してください（VPC Settings → DNS resolution および DNS hostnames）

これらの設定は、PrivateLink 用の DNS が正しく動作するために必要です。
:::

3. **エンドポイント接続を承認する**:
   - エンドポイント作成後、接続リクエストを承認する必要があります
   - VPC コンソールで「Endpoint Connections」に移動します
   - ClickHouse からの接続リクエストを見つけ、「Accept」をクリックして承認します

<Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink 承認" border />

### サービスの許可リストに Endpoint ID を追加する \{#step-3-add-endpoint-id-allowlist\}

VPC エンドポイントが作成され、接続が承認されたら、PrivateLink 経由でアクセスしたい各 ClickHouse サービスの許可リストに Endpoint ID を追加する必要があります。

1. **Endpoint ID を取得する**:
   - AWS VPC コンソールで Endpoints に移動します
   - 新しく作成したエンドポイントを選択します
   - Endpoint ID をコピーします（`vpce-xxxxxxxxxxxxxxxxx` のような形式です）

2. **ClickHouse Support に連絡する**:
   - Endpoint ID（複数ある場合はすべて）を ClickHouse Support に提供します
   - このエンドポイントからのアクセスを許可すべき ClickHouse サービスを指定します
   - ClickHouse Support がサービスの許可リストに Endpoint ID を追加します

### PrivateLink 経由で ClickHouse に接続する \{#step-4-connect-via-privatelink\}

Endpoint ID が許可リストに追加されたら、PrivateLink エンドポイントを使用して ClickHouse サービスに接続できます。

PrivateLink エンドポイントの形式はパブリックエンドポイントに似ていますが、`vpce` サブドメインが含まれます。例えば:

- **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink エンドポイント**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

VPC 内の DNS 解決により、`vpce` サブドメイン形式を使用した場合、自動的にトラフィックが PrivateLink エンドポイント経由にルーティングされます。

</VerticalStepper>

### PrivateLink アクセス制御 \{#privatelink-access-control\}

PrivateLink 経由で ClickHouse サービスへアクセスする際の制御は、次の 2 つのレイヤーで行われます。

1. **Istio Authorization Policy**: ClickHouse Cloud のサービスレベルの認可ポリシー
2. **VPC エンドポイントのセキュリティグループ**: VPC エンドポイントに関連付けられたセキュリティグループで、VPC 内のどのリソースがそのエンドポイントを利用できるかを制御します

:::note
プライベートロードバランサーの「Enforce inbound rules on PrivateLink traffic」機能は無効化されているため、アクセスは Istio の認可ポリシーと VPC エンドポイントのセキュリティグループのみによって制御されます。
:::

### PrivateLink DNS \{#privatelink-dns\}

BYOC エンドポイントの PrivateLink DNS（`*.vpce.{subdomain}` 形式）では、AWS PrivateLink の組み込み機能である「Private DNS names」を利用します。Route 53 レコードは不要で、次の条件を満たすと DNS 解決は自動的に行われます：

- VPC エンドポイントで「Private DNS names」が有効になっていること
- VPC で「DNS Hostnames」が有効になっていること

これにより、`vpce` サブドメインを使用する接続は、追加の DNS 設定を行わなくても、自動的に PrivateLink エンドポイント経由でルーティングされます。

## VPC Peering (GCP) および Private Service Connect (GCP) \{#setup-gcp\}

GCP VPC Peering と Private Service Connect は、GCP ベースの BYOC デプロイメントに対して同様のプライベート接続を提供します。この機能は現在開発中です。GCP BYOC デプロイメントで VPC Peering または Private Service Connect が必要な場合は、提供状況およびセットアップ要件について [ClickHouse Support にお問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。