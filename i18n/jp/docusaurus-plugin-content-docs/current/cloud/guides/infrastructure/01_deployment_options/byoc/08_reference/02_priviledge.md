---
title: 'BYOC 権限'
slug: /cloud/reference/byoc/reference/privilege
sidebar_label: '権限'
keywords: ['BYOC', 'クラウド', '自前クラウド', '権限']
description: '自前のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

## AWS 用 IAM ロール \{#aws-iam-roles\}

### ブートストラップ IAM ロール \{#bootstrap-iam-role\}

ブートストラップ IAM ロールには、以下の権限があります。

- **EC2 および VPC 操作**: VPC と EKS クラスターを構成するために必要です。
- **S3 操作（例: `s3:CreateBucket`）**: ClickHouse の BYOC ストレージ用バケットを作成するために必要です。
- **IAM 操作（例: `iam:CreatePolicy`）**: コントローラーが追加のロールを作成するために必要です（詳細は次のセクションを参照してください）。
- **EKS 操作**: 名前が `clickhouse-cloud` プレフィックスで始まるリソースに対してのみ許可されます。

### コントローラーによって作成される追加の IAM ロール \{#additional-iam-roles-created-by-the-controller\}

CloudFormation によって作成される `ClickHouseManagementRole` に加えて、コントローラーはいくつかの追加ロールを作成します。

これらのロールは、顧客の EKS クラスター内で動作するアプリケーションによって引き受けられます：

- **State Exporter Role**
  - サービスのヘルス情報を ClickHouse Cloud に送信する ClickHouse コンポーネント。
  - ClickHouse Cloud が所有する SQS キューへの書き込み権限が必要です。
- **Load-Balancer Controller**
  - 標準的な AWS Load Balancer Controller。
  - ClickHouse サービス向けのボリュームを管理する EBS CSI Controller。
- **External-DNS**
  - DNS 設定を Route 53 に伝播します。
- **Cert-Manager**
  - BYOC サービスドメイン向けに TLS 証明書をプロビジョニングします。
- **Cluster Autoscaler**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane** ロールと **k8s-worker** ロールは、AWS EKS サービスによって引き受けられることを想定しています。

最後に、**`data-plane-mgmt`** は、`ClickHouseCluster` や Istio Virtual Service/Gateway などの必要なカスタムリソースをリコンシル（整合）するための権限を、ClickHouse Cloud Control Plane コンポーネントに付与します。

## GCP のサービスアカウント \{#gcp-service-accounts\}

### ブートストラップ サービス アカウント \{#bootstrap-service-account\}

ブートストラップ サービス アカウントには、プロジェクト単位のカスタム ロールとして、次の権限が付与されます。

* **Common**: 基本的な読み取り権限と認証関連の権限。
* **VPC**: BYOC インフラストラクチャをホストする VPC、サブネット、ルーティング、および Private Service Connect アタッチメントを管理します。
* **Cluster**: GKE クラスターとクラスター内のリソースを管理します。
* **Storage**: ClickHouse のバックアップ、共有状態、監視データに使用される Cloud ストレージ バケットを管理するために使用されます。
* **IAM ロール**: プロジェクト内のサービス アカウントとカスタム ロールを管理します。このロールには、サービス アカウントの秘密鍵を作成したり、組織ポリシーを関連付けたり、他のプロジェクト内のリソースを操作したりする権限は含まれません。

### コントローラーによって作成される追加のサービスアカウント \{#additional-service-accounts-created-by-the-controller\}

オンボーディングの一環として Terraform 経由で作成される `clickhouse-management` サービスアカウントに加え、最初の BYOC サービスをプロビジョニングすると、ClickHouse のコントロールプレーン (`clickhouse-management` として認証) が、クラスター内の特定のワークロード向けにプロジェクト内へ追加のサービスアカウントを作成します。これらはそれぞれ、限定的な単一用途の権限セットで作成されます。

* **GKE ノードランタイム ID**
  * BYOC クラスター内のすべての GKE ノード仮想マシンに関連付けられます。
  * キューブレット、ノードローカルのエージェント、Cloud Operations の collector がログとメトリクスを送信するために使用され、コンテナーイメージのダウンロードにも使われます。
* **課金 scraper ID**
  * スタンドアロン scraper ワークロードが課金テレメトリーを収集するために使用されます。
* **監視 ID**
  * クラスター内で稼働する監視スタックの対象 ID です。このデプロイメント専用の GCS バケットにある長期メトリクスストレージの読み書きに使用されます。
* **ClickHouse ランタイム管理 ID**
  * ClickHouse のランタイムデータプレーン管理コントローラーで使用されます。このコントローラーは、Private Service Connect エンドポイントの管理、バケットライフサイクルの調整、サービスアカウントのローテーションなどの day-2 オペレーションを処理します。