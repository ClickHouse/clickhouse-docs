---
title: 'BYOC AWS プライベートネットワーキングのセットアップ'
slug: /cloud/reference/byoc/onboarding/network-aws
sidebar_label: 'AWS プライベートネットワーキングのセットアップ'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'aws', 'privatelink']
description: 'AWS 上の BYOC 向けに VPC Peering または PrivateLink をセットアップする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

AWS 上の ClickHouse BYOC では、VPC ピアリングと AWS PrivateLink という 2 つのプライベート接続オプションを利用できます。

## 前提条件 \{#common-prerequisites\}

VPCピアリングとPrivateLinkの両方で必要となる共通の手順です。

### ClickHouse BYOC でプライベートロードバランサーを有効にするには \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

プライベートロードバランサーを有効にするには、ClickHouse Supportにお問い合わせください。

## VPC ピアリングをセットアップする \{#aws-vpc-peering\}

ClickHouse BYOC の VPC ピアリングを作成または削除するには、次の手順に従ってください。

<VerticalStepper headerLevel="h3">
  ### ピアリング接続を作成する \{#step-1-create-a-peering-connection\}

  1. ClickHouse BYOC アカウントの VPC ダッシュボードに移動します。
  2. Peering Connections を選択します。
  3. Create Peering Connection をクリックします。
  4. VPC Requester を ClickHouse の VPC ID に設定します。
  5. VPC Accepter を対象の VPC ID に設定します。 (必要に応じて別のアカウントを選択します)
  6. Create Peering Connection をクリックします。

  <Image img={byoc_vpcpeering} size="lg" alt="BYOC ピアリング接続を作成" border />

  ### ピアリング接続リクエストを承認する \{#step-2-accept-the-peering-connection-request\}

  ピアリング先のアカウントで、(VPC -&gt; Peering connections -&gt; Actions -&gt; Accept request) ページに移動し、この VPC ピアリングリクエストを承認します。

  <Image img={byoc_vpcpeering2} size="lg" alt="BYOC ピアリング接続を承認" border />

  ### ClickHouse VPC のルートテーブルに宛先を追加する \{#step-3-add-destination-to-clickhouse-vpc-route-tables\}

  ClickHouse BYOC アカウントで、

  1. VPC ダッシュボードで Route Tables を選択します。
  2. ClickHouse の VPC ID を検索します。プライベートサブネットに関連付けられている各ルートテーブルを編集します。
  3. Routes タブの Edit ボタンをクリックします。
  4. Add another route をクリックします。
  5. Destination に対象 VPC の CIDR 範囲を入力します。
  6. Target に「Peering Connection」とピアリング接続の ID を選択します。

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC ルートテーブルを追加" border />

  ### 対象 VPC のルートテーブルに宛先を追加する \{#step-4-add-destination-to-the-target-vpc-route-tables\}

  ピアリング先の AWS アカウントで、

  1. VPC ダッシュボードで Route Tables を選択します。
  2. 対象の VPC ID を検索します。
  3. Routes タブの Edit ボタンをクリックします。
  4. Add another route をクリックします。
  5. Destination に ClickHouse VPC の CIDR 範囲を入力します。
  6. Target に「Peering Connection」とピアリング接続の ID を選択します。

  <Image img={byoc_vpcpeering4} size="lg" alt="BYOC ルートテーブルを追加" border />

  ### ピアリングした VPC からのアクセスを許可するようにセキュリティグループを編集する \{#step-5-edit-security-group-to-allow-peered-vpc-access\}

  ClickHouse BYOC アカウントでは、ピアリングした VPC からのトラフィックを許可するために Security Group の設定を更新する必要があります。ピアリングした VPC の CIDR 範囲を含むインバウンドルールの追加を依頼するには、ClickHouse Support にお問い合わせください。

  ***

  これで、ClickHouse サービスにピアリングした VPC からアクセスできるようになります。
</VerticalStepper>

ClickHouse にプライベートにアクセスするため、ユーザーのピアリングした VPC から安全に接続できるよう、プライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、パブリックエンドポイントの形式に `-private` サフィックスを付けたものです。例:

* **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
* **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

必要に応じて、ピアリングが正しく機能していることを確認した後、ClickHouse BYOC のパブリックロードバランサーの削除をリクエストできます。

## PrivateLink をセットアップする \{#setup-privatelink\}

AWS PrivateLink を使用すると、VPC ピアリングやインターネットゲートウェイを必要とせずに、ClickHouse BYOC サービスへ安全なプライベート接続を確立できます。トラフィックはすべて AWS ネットワーク内を流れ、パブリックインターネットを経由することはありません。

<VerticalStepper headerLevel="h3">
  ### PrivateLink のセットアップをリクエストする \{#step-1-request-privatelink-setup\}

  BYOC デプロイメント向けに PrivateLink のセットアップをリクエストするには、[ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) までお問い合わせください。この段階では、特別な情報を用意する必要はありません。PrivateLink 接続をセットアップしたい旨を伝えるだけで十分です。

  ClickHouse Support が、**プライベートロードバランサー** や **PrivateLink サービスエンドポイント** を含む、必要なインフラコンポーネントを有効化します。

  ### VPC にエンドポイントを作成する \{#step-2-create-endpoint\}

  ClickHouse Support 側で PrivateLink が有効化されたら、ClickHouse PrivateLink サービスに接続するため、クライアントアプリケーションの VPC に VPC エンドポイントを作成する必要があります。

  1. **エンドポイントサービス名を取得する**:
     * ClickHouse Support からエンドポイントサービス名が提供されます
     * AWS VPC コンソールの「Endpoint Services」でも確認できます (サービス名で絞り込むか、ClickHouse のサービスを探してください)

  <Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink サービスエンドポイント" border />

  2. **VPC エンドポイントを作成する**:
     * AWS VPC コンソール → Endpoints → Create Endpoint に移動します
     * 「Find service by name」を選択し、ClickHouse Support から提供されたエンドポイントサービス名を入力します
     * VPC を選択し、サブネットを選択します (アベイラビリティゾーンごとに 1 つを推奨)
     * **重要**: エンドポイントの「Private DNS names」を有効にしてください。これは DNS 名前解決を正しく機能させるために必要です
     * エンドポイント用のセキュリティグループを選択または作成します
     * 「Create Endpoint」をクリックします

  :::important
  **DNS 要件**:

  * VPC エンドポイントの作成時に「Private DNS names」を有効にします
  * VPC で「DNS Hostnames」が有効になっていることを確認します (VPC Settings → DNS resolution and DNS hostnames)

  これらの設定は、PrivateLink DNS を正しく機能させるために必要です。
  :::

  3. **エンドポイント接続を承認する**:
     * エンドポイントを作成したら、接続リクエストを承認する必要があります
     * VPC コンソールで「Endpoint Connections」に移動します
     * ClickHouse からの接続リクエストを見つけ、「Accept」をクリックして承認します

  <Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink 承認" border />

  ### サービスの許可リストにエンドポイント ID を追加する \{#step-3-add-endpoint-id-allowlist\}

  VPC エンドポイントを作成して接続が承認されたら、PrivateLink 経由でアクセスする各 ClickHouse サービスについて、許可リストにエンドポイント ID を追加する必要があります。

  1. **エンドポイント ID を取得する**:
     * AWS VPC コンソールで Endpoints に移動します
     * 新しく作成したエンドポイントを選択します
     * エンドポイント ID をコピーします (`vpce-xxxxxxxxxxxxxxxxx` のような形式です)

  2. **ClickHouse Support に連絡する**:
     * エンドポイント ID を ClickHouse Support に伝えます
     * このエンドポイントからのアクセスを許可する ClickHouse サービスを指定します
     * ClickHouse Support が、サービスの許可リストにエンドポイント ID を追加します

  ### PrivateLink 経由で ClickHouse に接続する \{#step-4-connect-via-privatelink\}

  エンドポイント ID が許可リストに追加されると、PrivateLink エンドポイントを使用して ClickHouse サービスに接続できます。

  PrivateLink エンドポイントの形式はパブリックエンドポイントと似ていますが、`vpce` サブドメインが含まれます。例:

  * **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
  * **PrivateLink エンドポイント**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

  VPC 内の DNS 名前解決では、`vpce` サブドメイン形式を使用すると、トラフィックは自動的に PrivateLink エンドポイント経由にルーティングされます。
</VerticalStepper>

### PrivateLink のアクセス制御 \{#privatelink-access-control\}

PrivateLink 経由で ClickHouse サービスにアクセスする際の制御は、次の 2 つのレベルで行われます。

1. **Istio Authorization Policy**: ClickHouse Cloud のサービスレベルの認可ポリシー
2. **VPC Endpoint Security Group**: VPC エンドポイントに関連付けられたセキュリティグループ。VPC 内のどのリソースがそのエンドポイントを使用できるかを制御します

:::note
プライベートロードバランサーの &quot;Enforce inbound rules on PrivateLink traffic&quot; 機能は無効になっているため、アクセスは Istio の認可ポリシーと VPC エンドポイントのセキュリティグループによってのみ制御されます。
:::

### PrivateLink DNS \{#privatelink-dns\}

BYOC エンドポイント向けの PrivateLink DNS (`*.vpce.{subdomain}` 形式を使用) は、AWS PrivateLink に組み込まれている「Private DNS names」機能を利用します。Route53 レコードは不要で、以下の条件を満たすと DNS 解決は自動的に行われます。

* VPC エンドポイントで「Private DNS names」が有効になっている
* VPC で「DNS Hostnames」が有効になっている

これにより、`vpce` サブドメインを使用する接続は、追加の DNS 設定を行わなくても、自動的に PrivateLink エンドポイント経由でルーティングされます。