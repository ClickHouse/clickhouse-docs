---
title: 'ClickHouse Government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['government', 'fips', 'fedramp', 'gov cloud']
description: 'ClickHouse Government 提供サービスの概要'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概要 {#overview}

ClickHouse Governmentは、ClickHouse Cloudで稼働しているものと同じプロプライエタリ版のClickHouseと当社のClickHouse Operatorで構成されるセルフデプロイパッケージです。コンピュートとストレージの分離が構成されており、政府機関や公共部門組織の厳格な要件を満たすよう強化されています。S3互換ストレージを備えたKubernetes環境にデプロイされます。

このパッケージは現在AWSで利用可能で、ベアメタルデプロイメントは近日提供予定です。

:::note 注記
ClickHouse Governmentは、政府機関、公共部門組織、またはこれらの機関や組織に販売を行うクラウドソフトウェア企業向けに設計されており、専用インフラストラクチャの完全な制御と管理を提供します。このオプションは[お問い合わせ](https://clickhouse.com/government)によってのみご利用いただけます。
:::


## オープンソースに対する利点 {#benefits-over-os}

以下の機能により、ClickHouse Governmentはセルフマネージド型オープンソースデプロイメントと差別化されています:

<VerticalStepper headerLevel="h3">

### パフォーマンスの強化 {#enhanced-performance}

- コンピュートとストレージのネイティブ分離
- [shared merge tree](/cloud/reference/shared-merge-tree)や[warehouse](/cloud/reference/warehouses)機能などの独自のクラウド機能

### 多様なユースケースと条件での実証済み {#tested-proven}

- ClickHouse Cloudで完全にテストおよび検証済み

### コンプライアンスパッケージ {#compliance-package}

- 運用認可(ATO)を加速するための[NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf)ドキュメント

### 定期的に新機能が追加される充実したロードマップ {#full-featured-roadmap}

近日追加予定の追加機能には以下が含まれます:

- リソースをプログラムで管理するためのAPI
  - 自動バックアップ
  - 自動垂直スケーリング操作
- IDプロバイダー統合

</VerticalStepper>


## アーキテクチャ {#architecture}

ClickHouse Governmentは、デプロイメント環境内で完全に自己完結しており、Kubernetes内で管理されるコンピュートと、S3互換ストレージソリューション内のストレージで構成されています。

<br />

<Image
  img={private_gov_architecture}
  size='md'
  alt='ClickHouse Governmentアーキテクチャ'
  background='black'
/>

<br />


## オンボーディングプロセス {#onboarding-process}

オンボーディングを開始するには、[弊社](https://clickhouse.com/government)までお問い合わせください。条件を満たすお客様には、詳細な環境構築ガイドと、デプロイメント用のイメージおよびHelmチャートへのアクセスを提供いたします。


## 一般要件 {#general-requirements}

このセクションでは、ClickHouse Governmentのデプロイに必要なリソースの概要を説明します。具体的なデプロイメントガイドは、オンボーディングの一環として提供されます。インスタンス/サーバーのタイプとサイズは、ユースケースに応じて異なります。

### AWS上のClickHouse Government {#clickhouse-government-aws}

必要なリソース:

- イメージとHelmチャートを受信するための[ECR](https://docs.aws.amazon.com/ecr/)
- FIPS準拠の証明書を生成可能な認証局
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、認証用の[IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)、および[OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)プロバイダーを備えた[EKS](https://docs.aws.amazon.com/eks/)クラスター
- サーバーノードはAmazon Linuxで実行
- Operatorにはx86ノードグループが必要
- EKSクラスターと同じリージョンのS3バケット
- ingressが必要な場合は、NLBも設定
- clickhouse-server/keeper操作用に、ClickHouseクラスターごとに1つのAWSロール
