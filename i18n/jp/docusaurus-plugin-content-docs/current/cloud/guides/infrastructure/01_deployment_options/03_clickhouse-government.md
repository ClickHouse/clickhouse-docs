---
title: 'ClickHouse Government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['政府', 'fips', 'fedramp', '政府クラウド']
description: 'ClickHouse Government 提供サービスの概要'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概要 \\{#overview\\}

ClickHouse Government は、ClickHouse Cloud 上で動作するものと同じプロプライエタリ版の ClickHouse と、コンピュートとストレージの分離に対応し、政府機関および公共部門の組織の厳格な要件を満たすよう強化された ClickHouse Operator で構成される、セルフデプロイ型パッケージです。S3 互換ストレージを備えた Kubernetes 環境にデプロイされます。

このパッケージは現在 AWS 向けに提供されており、ベアメタル環境へのデプロイは近日提供予定です。

:::note Note
ClickHouse Government は、政府機関、公共部門の組織、またはそれらの機関・組織向けにクラウドソフトウェアを提供する企業を対象とし、それぞれの専用インフラストラクチャーに対する完全な制御と管理を提供するよう設計されています。このオプションは、[こちらからお問い合わせ](https://clickhouse.com/government) いただいた場合にのみご利用になれます。
:::



## オープンソースに対するメリット \\{#benefits-over-os\\}

以下の機能により、ClickHouse Government は自己管理のオープンソースデプロイメントとは一線を画します。

<VerticalStepper headerLevel="h3">

### 強化されたパフォーマンス \\{#enhanced-performance\\}
- コンピュートとストレージのネイティブな分離
- [shared merge tree](/cloud/reference/shared-merge-tree) や [warehouse](/cloud/reference/warehouses) の機能などの独自のクラウド機能

### 多様なユースケースおよび条件下で実証済み \\{#tested-proven\\}
- ClickHouse Cloud で完全にテストおよび検証されています

### コンプライアンスパッケージ \\{#compliance-package\\}
- Authorization to Operate (ATO) の取得を加速するための [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) ドキュメント

### 新機能が定期的に追加される充実したロードマップ \\{#full-featured-roadmap\\}
今後追加予定の機能には次のものが含まれます:
- リソースをプログラム的に管理するための API
  - 自動バックアップ
  - 自動的な垂直スケーリングの実行
- アイデンティティプロバイダーとの統合

</VerticalStepper>



## アーキテクチャ \\{#architecture\\}

ClickHouse Government は、デプロイ環境内で完全に自己完結して動作し、Kubernetes 上で管理されるコンピュートリソースと、S3 互換ストレージソリューション上のストレージから構成されています。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government アーキテクチャ" background='black'/>

<br />



## オンボーディングプロセス \\{#onboarding-process\\}

お客様は、[こちら](https://clickhouse.com/government)からお問い合わせいただくことで、オンボーディングを開始できます。条件を満たしたお客様には、詳細な環境構築ガイドと、デプロイ用のイメージおよび Helm チャートへのアクセスを提供します。



## 一般要件 \\{#general-requirements\\}

このセクションでは、ClickHouse Government をデプロイするために必要なリソースの概要を示します。具体的なデプロイメントガイドはオンボーディング時に提供されます。インスタンス／サーバーの種類とサイズはユースケースによって異なります。

### AWS 上の ClickHouse Government \\{#clickhouse-government-aws\\}

必要なリソース：
- イメージおよび Helm チャートを受け取るための [ECR](https://docs.aws.amazon.com/ecr/)
- FIPS 準拠の証明書を生成可能な認証局 (Certificate Authority)
- [CNI](https://github.com/aws/amazon-vpc-cni-k8s)、[EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)、[DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html)、[Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)、認証用の [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)、および [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) プロバイダーを備えた [EKS](https://docs.aws.amazon.com/eks/) クラスター
- サーバーノードは Amazon Linux を実行していること
- Operator には x86 ノードグループが必要
- EKS クラスターと同じリージョン内の S3 バケット
- イングレスが必要な場合は、NLB も構成すること
- ClickHouse クラスターごとに 1 つの AWS ロール（clickhouse-server/keeper の操作用）
