---
title: 'BYOC GCP プライベートネットワークのセットアップ'
slug: /cloud/reference/byoc/onboarding/network-gcp
sidebar_label: 'GCP プライベートネットワークのセットアップ'
keywords: ['BYOC', 'クラウド', '自社クラウド環境', 'VPC ピアリング', 'gcp', 'private service connect']
description: 'GCP 上の BYOC 向けに VPC ピアリングまたは Private Service Connect をセットアップする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-3.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-2.png';
import byoc_privatelink_3 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-3.png';
import byoc_privatelink_4 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-4.png';
import byoc_privatelink_5 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-5.png';
import byoc_privatelink_6 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-6.png';

GCP 上の ClickHouse BYOC では、VPC ピアリングと Private Service Connect の 2 つのプライベート接続オプションをサポートしています。トラフィックは GCP ネットワーク内のみを流れ、パブリックインターネットを経由しません。

## 前提条件 \{#common-prerequisites\}

VPC ピアリングと Private Service Connect の両方で必要となる共通の手順です。

### ClickHouse BYOC でプライベートロードバランサーを有効にするには \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

プライベートロードバランサーを有効にするには、ClickHouse Support にお問い合わせください。

## VPC ピアリングをセットアップする \{#gcp-vpc-peering\}

まず、[GCP VPC ピアリング機能](https://docs.cloud.google.com/vpc/docs/vpc-peering)を確認し、VPC ピアリングの制限事項 (たとえば、ピアリングされた VPC ネットワーク間でサブネットの IP 範囲を重複させることはできません) を把握してください。ClickHouse BYOC では、ピアリング経由で ClickHouse サービスへのネットワーク接続を可能にするために、プライベートロードバランサーを使用します。

ClickHouse BYOC の VPC ピアリングを作成または削除するには、以下の手順に従ってください。

:::note
以下の手順はシンプルなシナリオを前提とした例です。オンプレミス接続とのピアリングなど、より高度なシナリオでは調整が必要になる場合があります。
:::

<VerticalStepper headerLevel="h3">
  ### ピアリング接続を作成する \{#step-1-create-a-peering-connection\}

  この例では、BYOC VPC ネットワークと別の既存の VPC ネットワークの間でピアリングをセットアップします。

  1. ClickHouse BYOC の Google Cloud プロジェクトで「VPC Network」に移動します。
  2. 「VPC network peering」を選択します。
  3. 「Create connection」をクリックします。
  4. 要件に応じて必要な項目を入力します。以下は、同じ GCP プロジェクト内でピアリングを作成する場合のスクリーンショットです。

  <Image img={byoc_vpcpeering} size="md" alt="BYOC ピアリング接続を作成" border />

  GCP VPC ピアリングを機能させるには、2 つのネットワーク間に 2 つの接続が必要です (つまり、BYOC ネットワークから既存の VPC ネットワークへの接続と、既存の VPC ネットワークから BYOC ネットワークへの接続です) 。そのため、同様に逆方向の接続をもう 1 つ作成する必要があります。以下は、2 つ目のピアリング接続を作成する際のスクリーンショットです。

  <Image img={byoc_vpcpeering2} size="md" alt="BYOC ピアリング接続を承認" border />

  両方の接続を作成したら、Google Cloud Console の Web ページを更新すると、2 つの接続のステータスは「Active」になります。

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC ピアリング接続を承認" border />

  これで、ClickHouse サービスにピアリングされた VPC からアクセスできるようになります。

  ### ピアリング接続経由で ClickHouse サービスにアクセスする \{#step-2-access-ch-service-via-peering\}

  ClickHouse にプライベートにアクセスするために、ユーザーのピアリング済み VPC から安全に接続できるよう、プライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、パブリックエンドポイントの形式に `-private` サフィックスを付けたものです。例:

  * **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
  * **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
</VerticalStepper>

## PSC (Private Service Connect) をセットアップする \{#gcp-psc\}

GCP PSC (Private Service Connect) を使用すると、VPC ピアリングやインターネットゲートウェイを必要とせずに、ClickHouse BYOC サービスへ安全なプライベート接続を確立できます。

<VerticalStepper headerLevel="h3">
  ### PSC サービスのセットアップを依頼する \{#step-1-request-psc-setup\}

  BYOC デプロイメント向けの PSC サービスのセットアップを依頼するには、[ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) に連絡してください。この段階では特別な情報は必要ありません。PSC 接続をセットアップしたい旨を伝えるだけで十分です。

  ClickHouse Support が、**プライベートロードバランサー** や **PSC Service** など,必要なインフラストラクチャコンポーネントを有効化します。

  ### GCP PSC サービス名と DNS 名を取得する \{#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect\}

  ClickHouse Support から PSC Service 名が提供されます。また、ClickHouse Cloud コンソールの &quot;Organization&quot; -&gt; &quot;Infrastructure&quot; でインフラ名をクリックし、詳細画面から確認することもできます。

  <Image img={byoc_privatelink_1} size="lg" alt="BYOC PSC エンドポイント" border />

  <Image img={byoc_privatelink_2} size="lg" alt="BYOC PSC エンドポイント" border />

  PSC サービス名は、GCP Private Service Connect コンソールの &quot;Published services&quot; でも確認できます (サービス名で絞り込むか、ClickHouse のサービスを探してください) 。

  <Image img={byoc_privatelink_3} size="lg" alt="BYOC PSC エンドポイント" border />

  <Image img={byoc_privatelink_4} size="lg" alt="BYOC PSC エンドポイント" border />

  ### ネットワーク内に PSC エンドポイントを作成する \{#step-3-create-endpoint\}

  ClickHouse Support 側で PSC サービスが有効化されたら、ClickHouse PSC サービスに接続するため、クライアントアプリケーションのネットワーク内に PSC エンドポイントを作成する必要があります。

  1. **PSC エンドポイントを作成する**:

  * GCP Console -&gt; Network Services → Private Service Connect → Connect Endpoint に移動します
  * &quot;Target&quot; で &quot;Published service&quot; を選択し、前の手順で取得した PSC サービス名を &quot;Target details&quot; に入力します
  * 有効なエンドポイント名を入力します
  * ネットワークを選択し、サブネットを選択します (これはクライアントアプリケーションの接続元となるネットワークです)
  * エンドポイント用の IP アドレスを選択するか、新しく作成します。この IP アドレスは手順 [エンドポイントのプライベート DNS 名を設定する](#step-4-set-private-dns-name-for-endpoint) で使用します
  * &quot;Add Endpoint&quot; をクリックし、エンドポイントが作成されるまでしばらく待ちます
  * エンドポイントのステータスは &quot;Accepted&quot; になるはずです。自動的に承認されない場合は ClickHouse Support に連絡してください

  <Image img={byoc_privatelink_5} size="lg" alt="BYOC PSC エンドポイントの作成" border />

  2. **PSC Connection ID を取得する**:

  * エンドポイントの詳細を開き、手順 [エンドポイントの PSC Connection ID をサービスの許可リストに追加する](#step-5-add-endpoint-id-allowlist) で使用する &quot;PSC Connection ID&quot; を取得します

  <Image img={byoc_privatelink_6} size="lg" alt="BYOC PSC エンドポイントの詳細" border />

  ### エンドポイントのプライベート DNS 名を設定する \{#step-4-set-private-dns-name-for-endpoint\}

  :::note
  DNS の設定方法はいくつかあります。ご利用のユースケースに応じて DNS をセットアップしてください。
  :::

  [GCP PSC サービス名と DNS 名を取得する](#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 手順で取得した &quot;DNS name&quot; のすべてのサブドメイン (ワイルドカード) が GCP PSC エンドポイントの IP アドレスを指すように設定する必要があります。これにより、VPC/Network 内のサービスやコンポーネントが正しく名前解決できるようになります。

  ### エンドポイントの PSC Connection ID をサービスの許可リストに追加する \{#step-5-add-endpoint-id-allowlist\}

  PSC エンドポイントが作成され、ステータスが &quot;Accepted&quot; になったら、PSC 経由でアクセスしたい**各 ClickHouse サービス**について、エンドポイントの PSC Connection ID を許可リストに追加する必要があります。

  **ClickHouse Support に連絡してください**:

  * エンドポイントの PSC Connection ID を ClickHouse Support に共有します
  * このエンドポイントからのアクセスを許可する ClickHouse サービスを指定します
  * ClickHouse Support がエンドポイントの PSC Connection ID をサービスの許可リストに追加します

  ### PSC 経由で ClickHouse に接続する \{#step-6-connect-via-psc-endpoint\}

  エンドポイントの Connection ID が許可リストに追加されると、PSC エンドポイントを使用して ClickHouse サービスに接続できます。

  PSC エンドポイントの形式はパブリックエンドポイントに似ていますが、`p` サブドメインが含まれます。例:

  * **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
  * **PSC エンドポイント**: `h5ju65kv87.p.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
</VerticalStepper>