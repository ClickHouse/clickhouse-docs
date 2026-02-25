---
title: 'BYOC 権限'
slug: /cloud/reference/byoc/reference/privilege
sidebar_label: '権限'
keywords: ['BYOC', 'クラウド', '自前クラウド', '権限']
description: '自前のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

## CloudFormation 用 IAM ロール \{#cloudformation-iam-roles\}

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