---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['private', 'on-prem']
description: 'ClickHouse Private オファリングの概要'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概要 {#overview}

ClickHouse Privateは、ClickHouse Cloudで稼働しているものと同じプロプライエタリ版のClickHouseと、コンピュートとストレージを分離するように構成されたClickHouse Operatorで構成される、セルフデプロイ型パッケージです。S3互換ストレージを備えたKubernetes環境にデプロイされます。

このパッケージは現在AWSとIBM Cloudで利用可能で、ベアメタルデプロイメントも近日中に提供予定です。

:::note 注記
ClickHouse Privateは、最も厳格なコンプライアンス要件を持つ大企業向けに設計されており、専用インフラストラクチャを完全に制御・管理できます。このオプションは[お問い合わせ](https://clickhouse.com/company/contact?loc=nav)いただくことでのみご利用いただけます。
:::


## オープンソースに対する利点 {#benefits-over-os}

以下の機能により、ClickHouse Privateはセルフマネージド型のオープンソースデプロイメントと差別化されています：

<VerticalStepper headerLevel="h3">

### パフォーマンスの強化 {#enhanced-performance}

- コンピュートとストレージのネイティブ分離
- [shared merge tree](/cloud/reference/shared-merge-tree)や[warehouse](/cloud/reference/warehouses)機能などの独自クラウド機能

### 多様なユースケースと条件下でテスト済み・実証済み {#tested-proven-through-variety-of-use-cases}

- ClickHouse Cloudで完全にテストおよび検証済み

### 新機能を定期的に追加する充実したロードマップ {#full-featured-roadmap}

近日追加予定の追加機能：

- リソースをプログラムで管理するためのAPI
  - 自動バックアップ
  - 自動垂直スケーリング操作
- IDプロバイダー統合

</VerticalStepper>


## アーキテクチャ {#architecture}

ClickHouse Privateは、お客様のデプロイメント環境内で完全に自己完結しており、Kubernetes内で管理されるコンピュートリソースと、S3互換ストレージソリューション内のストレージで構成されています。

<br />

<Image
  img={private_gov_architecture}
  size='md'
  alt='ClickHouse Privateアーキテクチャ'
  background='black'
/>

<br />


## オンボーディングプロセス {#onboarding-process}

オンボーディングを開始するには、[弊社](https://clickhouse.com/company/contact?loc=nav)までお問い合わせください。条件を満たすお客様には、詳細な環境構築ガイドと、デプロイメント用のイメージおよびHelmチャートへのアクセスを提供いたします。


## 一般要件 {#general-requirements}

このセクションでは、ClickHouse Privateのデプロイに必要なリソースの概要を説明します。具体的なデプロイメントガイドは、オンボーディングの一環として提供されます。インスタンス/サーバーのタイプとサイズは、ユースケースによって異なります。

### AWS上のClickHouse Private {#clickhouse-private-aws}

必要なリソース:

- イメージとHelmチャートを受信するための[ECR](https://docs.aws.amazon.com/ecr/)
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、認証用の[IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)、および[OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)プロバイダーを備えた[EKS](https://docs.aws.amazon.com/eks/)クラスター
- サーバーノードはAmazon Linuxで実行
- Operatorにはx86ノードグループが必要
- EKSクラスターと同じリージョンのS3バケット
- Ingressが必要な場合は、NLBも設定
- clickhouse-server/keeper操作用に、ClickHouseクラスターごとに1つのAWSロール

### IBM Cloud上のClickHouse Private {#clickhouse-private-ibm-cloud}

必要なリソース:

- イメージとHelmチャートを受信するための[Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started)
- [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model)、[Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block)、[Cloud DNS](https://www.ibm.com/products/dns)、および[Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable)を備えた[Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started)
- サーバーノードはUbuntuで実行
- Operatorにはx86ノードグループが必要
- Cloud Kubernetes Serviceクラスターと同じリージョンの[Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage)
- Ingressが必要な場合は、NLBも設定
- clickhouse-server/keeper操作用に、ClickHouseクラスターごとに1つのサービスアカウント
