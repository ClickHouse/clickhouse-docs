---
title: '標準オンボーディング'
slug: /cloud/reference/byoc/onboarding/standard
sidebar_label: '標準プロセス'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding']
description: '自社のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_onboarding_1 from '@site/static/images/cloud/reference/byoc-onboarding-1.png'
import byoc_onboarding_2 from '@site/static/images/cloud/reference/byoc-onboarding-2.png'
import byoc_onboarding_3 from '@site/static/images/cloud/reference/byoc-onboarding-3.png'
import byoc_new_service_1 from '@site/static/images/cloud/reference/byoc-new-service-1.png'


## Standard Onboarding とは何ですか？ \{#what-is-standard-onboarding\}

**Standard onboarding** は、BYOC を使用してお客様自身のクラウドアカウントに ClickHouse をデプロイするための、デフォルトのガイド付きワークフローです。このアプローチでは、ClickHouse Cloud が、お客様の AWS アカウント／GCP プロジェクト内に、デプロイメントに必要な主要なクラウドリソース（VPC、サブネット、セキュリティグループ、Kubernetes（EKS/GKE）クラスター、およびそれを支える IAM ロール／サービスアカウントなど）をプロビジョニングします。これにより、一貫性があり安全な構成が保証され、チーム側で必要となる手作業を最小限に抑えることができます。

Standard onboarding では、お客様は専用の AWS アカウント／GCP プロジェクトを用意し、CloudFormation または Terraform で初期スタックを実行して、ClickHouse Cloud が以降のセットアップをオーケストレーションするために必要な最小限の IAM 権限と信頼ポリシーを作成するだけです。その後のすべての手順（インフラストラクチャのプロビジョニングやサービスの起動を含む）は、ClickHouse Cloud の Web コンソールを通じて管理されます。

お客様には、権限およびリソースのアイソレーションを高めるために、ClickHouse BYOC デプロイメントをホストするための **専用の** AWS アカウントまたは GCP プロジェクトを準備することを強く推奨します。ClickHouse は、お客様のアカウント内に、専用のクラウドリソースセット（VPC、Kubernetes クラスター、IAM ロール、S3 バケットなど）をデプロイします。

よりカスタマイズされたセットアップ（たとえば既存の VPC へのデプロイ）が必要な場合は、[Customized Onboarding](/cloud/reference/byoc/onboarding/customization) のドキュメントを参照してください。

## アクセスを申請する \{#request-access\}

オンボーディングを開始するには、[こちらからお問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。ClickHouse チームが BYOC の要件についてご案内し、最適なデプロイメントオプションの選定を支援し、お使いのアカウントを許可リスト（allowlist）に追加します。

## 導入 \{#onboarding-process\}

### AWS アカウント / GCP プロジェクトの準備 \{#prepare-an-aws-account\}

組織配下で新規の AWS アカウントまたは GCP プロジェクトを用意してください。セットアップを続行するには、ウェブコンソール https://console.clickhouse.cloud/byocOnboarding にアクセスします。 

<VerticalStepper headerLevel="h3">

### Cloud プロバイダーの選択 \{#choose-cloud-provider\}

<Image img={byoc_onboarding_1} size="lg" alt="BYOC で CSP を選択" background='black'/>

### アカウント / プロジェクトのセットアップ \{#account-setup\}

初期の BYOC セットアップは、[CloudFormation テンプレート (AWS)](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) または [Terraform モジュール (GCP)](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/gcp) のいずれかを使用して実行できます。これにより高権限の IAM ロールが作成され、ClickHouse Cloud 上の BYOC コントローラーがお使いのインフラストラクチャを管理できるようになります。 

<Image img={byoc_onboarding_2} size="lg" alt="BYOC アカウント初期化" background='black'/>

:::note
ClickHouse を実行するために必要なストレージバケット、VPC、Kubernetes クラスター、およびコンピュートリソースは、この初期セットアップには含まれません。これらは次のステップでプロビジョニングされます。
:::
#### AWS 向け代替 Terraform モジュール \{#terraform-module-aws\}

AWS でのデプロイメントにおいて CloudFormation の代わりに Terraform を使用したい場合は、[AWS 向け Terraform モジュール](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) も提供しています。

使用方法:
```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

### BYOC インフラストラクチャのセットアップ \{#setup-byoc-infrastructure\}

ClickHouse Cloud コンソールから、S3 バケット、VPC、および Kubernetes クラスターを含むインフラストラクチャのセットアップを行うよう求められます。この段階で一部の設定は後から変更できないため、ここで確定させる必要があります。具体的には次のとおりです。

- **Region**: [supported regions](https://clickhouse.com/docs/cloud/reference/supported-regions) ドキュメントに記載されているすべての **パブリックリージョン** を BYOC デプロイメントで利用できます。プライベートリージョンは現在サポートされていません。

- **VPC CIDR 範囲**: デフォルトでは、BYOC VPC の CIDR 範囲として `10.0.0.0/16` を使用します。別アカウントとの VPC ピアリングを利用する場合は、CIDR 範囲が重複しないようにしてください。必要なワークロードを収容できるよう、BYOC 用に最小 `/22` 以上の適切な CIDR 範囲を割り当ててください。

- **アベイラビリティーゾーン**: VPC ピアリングを利用する予定がある場合、送信元アカウントと BYOC アカウント間でアベイラビリティーゾーンを揃えることで、AZ 間トラフィックコストを削減できます。たとえば AWS では、アベイラビリティーゾーンのサフィックス (`a`、`b`、`c`) が、アカウントごとに異なる物理ゾーン ID を表す場合があります。詳細は [AWS ガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) を参照してください。

<Image img={byoc_onboarding_3} size="lg" alt="BYOC インフラのセットアップ" background='black'/>

</VerticalStepper>

### 最初の BYOC ClickHouse サービスを作成する \{#create-clickhouse-service\}

BYOC インフラストラクチャのプロビジョニングが完了したら、最初の ClickHouse サービスを起動する準備が整います。ClickHouse Cloud コンソールを開き、BYOC 環境を選択し、案内に従って新しいサービスを作成します。

<Image img={byoc_new_service_1} size="md" alt="BYOC create new service"/>

サービスの作成時には、次のオプションを構成します。

- **Service name**: ClickHouse サービスの目的が明確に分かる、わかりやすい名前を入力します。
- **BYOC infrastructure**: サービスを実行するクラウドアカウントおよびリージョンを含む BYOC 環境を選択します。
- **Resource configuration**: ClickHouse のレプリカに割り当てる CPU とメモリの量を選択します。
- **Replica count**: 高可用性を強化するためのレプリカ数を指定します。