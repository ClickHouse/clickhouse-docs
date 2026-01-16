---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['プライベート', 'オンプレミス']
description: 'ClickHouse Private 提供の概要'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概要 \{#overview\}

ClickHouse Private は、ClickHouse Cloud 上で動作しているものと同じプロプライエタリ版の ClickHouse と、コンピュートとストレージの分離向けに構成された ClickHouse Operator で構成されるセルフホスト型パッケージです。S3 互換ストレージを用いた Kubernetes 環境にデプロイされます。

このパッケージは現在、AWS および IBM Cloud 向けに提供されており、ベアメタル環境へのデプロイメントも近日中に提供予定です。

:::note 注記
ClickHouse Private は、最も厳格なコンプライアンス要件を持つ大企業向けに設計されており、専用インフラストラクチャに対する完全な制御と管理を提供します。このオプションは、[お問い合わせ](https://clickhouse.com/company/contact?loc=nav) を通じてのみご利用いただけます。
:::



## オープンソースに対する利点 \{#benefits-over-os\}

以下の機能により、自己管理型のオープンソースデプロイメントと比較して、ClickHouse Private は優位性を発揮します。

<VerticalStepper headerLevel="h3">

### 強化されたパフォーマンス \{#enhanced-performance\}
- コンピュートとストレージのネイティブな分離
- [shared merge tree](/cloud/reference/shared-merge-tree) や [warehouse](/cloud/reference/warehouses) 機能などの独自クラウド機能

### 多様なユースケースや条件下での検証・実証済み \{#tested-proven-through-variety-of-use-cases\}
- ClickHouse Cloud での十分なテストおよび検証

### 新機能が定期的に追加される充実したロードマップ \{#full-featured-roadmap\}
今後追加予定の機能には、次のようなものが含まれます:
- リソースをプログラムから管理するための API
  - 自動バックアップ
  - 自動的な垂直スケーリング操作
- アイデンティティプロバイダーとの統合

</VerticalStepper>



## アーキテクチャ \{#architecture\}

ClickHouse Private は、お使いのデプロイ環境内で完結しており、Kubernetes 上で管理されるコンピュートと、S3 互換ストレージソリューション上のストレージで構成されます。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private のアーキテクチャ" background='black'/>

<br />



## オンボーディングプロセス \{#onboarding-process\}

お客様は、[こちら](https://clickhouse.com/company/contact?loc=nav)からお問い合わせいただくことで、オンボーディングを開始できます。要件を満たすお客様には、詳細な環境構築ガイドと、デプロイメント用のイメージおよび Helm チャートへのアクセスを提供します。



## 一般要件 \{#general-requirements\}

このセクションでは、ClickHouse Private をデプロイするために必要なリソースの概要を示します。具体的なデプロイメントガイドはオンボーディングの一部として提供されます。インスタンス/サーバーの種類とサイズはユースケースによって異なります。

### AWS 上の ClickHouse Private \{#clickhouse-private-aws\}

必要なリソース：
- イメージと Helm チャートを受け取るための [ECR](https://docs.aws.amazon.com/ecr/)
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、認証用の [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)、および [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) プロバイダーを備えた [EKS](https://docs.aws.amazon.com/eks/) クラスター
- サーバーノードは Amazon Linux を実行していること
- オペレーターは x86 ノードグループが必要
- EKS クラスターと同じリージョン内の S3 バケット
- イングレスが必要な場合は、NLB も設定すること
- clickhouse-server/keeper の運用のために、ClickHouse クラスターごとに 1 つの AWS ロール

### IBM Cloud 上の ClickHouse Private \{#clickhouse-private-ibm-cloud\}

必要なリソース：
- イメージと Helm チャートを受け取るための [Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started)
- [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model)、[Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block)、[Cloud DNS](https://www.ibm.com/products/dns)、および [Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable) を備えた [Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started)
- サーバーノードは Ubuntu を実行していること
- オペレーターは x86 ノードグループが必要
- Cloud Kubernetes Service クラスターと同じリージョン内の [Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage)
- イングレスが必要な場合は、NLB も設定すること
- clickhouse-server/keeper の運用のために、ClickHouse クラスターごとに 1 つのサービスアカウント
