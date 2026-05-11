---
sidebar_label: 'ClickPipes 向け AWS PrivateLink'
description: 'AWS PrivateLink を使用して、ClickPipes とデータソース間のセキュアな接続を確立します。'
slug: /integrations/clickpipes/aws-privatelink
title: 'ClickPipes 向け AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes セキュリティ', 'vpc endpoint', 'プライベート接続', 'vpc リソース']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_rpe_select from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_select.png';
import cp_rpe_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step0.png';
import cp_rpe_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step1.png';
import cp_rpe_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step2.png';
import cp_rpe_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step3.png';
import cp_rpe_settings0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings0.png';
import cp_rpe_settings1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings1.png';
import Image from '@theme/IdealImage';


# ClickPipes 向け AWS PrivateLink \{#aws-privatelink-for-clickpipes\}

[AWS PrivateLink](https://aws.amazon.com/privatelink/) を使用すると、トラフィックをパブリックインターネットに公開することなく、
VPC、AWS サービス、オンプレミスシステム、および ClickHouse Cloud 間に安全な接続を確立できます。

このドキュメントでは、AWS PrivateLink VPC エンドポイントをセットアップするための
ClickPipes のリバースプライベートエンドポイント機能について概要を説明します。

## サポートされている ClickPipes データソース \{#supported-sources\}

ClickPipes のリバース PrivateLink エンドポイントの機能は、次の
データソース種別にのみ対応しています。

- Kafka
- Postgres
- MySQL
- MongoDB

## サポートされている AWS PrivateLink エンドポイントタイプ \{#aws-privatelink-endpoint-types\}

ClickPipes のリバースプライベートエンドポイントは、次のいずれかの AWS PrivateLink 方式で構成できます：

- [VPC リソース](#vpc-resource)
- [MSK ClickPipe 用の MSK 複数 VPC 接続](#msk-multi-vpc)
- [VPC エンドポイントサービス](#vpc-endpoint-service)

### VPC リソース \{#vpc-resource\}

:::info
リージョン間（cross-region）はサポートされていません。
:::

VPC リソースには、[PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html) を使用して ClickPipes からアクセスできます。この方法では、データソースの前段にロードバランサーを設定する必要はありません。

リソース設定では、特定のホストまたは RDS クラスター ARN を対象として指定できます。

RDS クラスターから Postgres の CDC データを取り込む場合に推奨される方法です。

VPC リソースに対して PrivateLink をセットアップするには、次の手順を実行します。

1. リソースゲートウェイを作成する
2. リソース設定を作成する
3. リソース共有を作成する

<VerticalStepper headerLevel="h4">
  #### リソースゲートウェイを作成する

  リソースゲートウェイは、VPC 内で指定したリソース向けのトラフィックを受信するポイントです。

  :::note
  リソースゲートウェイにアタッチするサブネットには、十分な数の IP アドレスが確保されていることが推奨されます。
  各サブネットについて、少なくとも `/26` のサブネットマスクを使用することを推奨します。

  VPC エンドポイント(各 Reverse Private Endpoint)ごとに、AWS はサブネットごとに連続した 16 個の IP アドレスブロック(`/28` サブネットマスク)を要求します。
  この要件を満たしていない場合、Reverse Private Endpoint は失敗状態に遷移します。
  :::

  [AWS コンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)から、または次のコマンドを使用してリソースゲートウェイを作成できます。

  ```bash
  aws vpc-lattice create-resource-gateway \
      --vpc-identifier <VPC_ID> \
      --subnet-ids <SUBNET_IDS> \
      --security-group-ids <SG_IDs> \
      --name <RESOURCE_GATEWAY_NAME>
  ```

  出力にはリソースゲートウェイ ID が含まれます。この ID は次のステップで必要になります。

  先に進む前に、リソースゲートウェイが `Active` 状態になるまで待つ必要があります。状態は次のコマンドで確認できます。

  ```bash
  aws vpc-lattice get-resource-gateway \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
  ```

  #### VPC Resource-Configuration を作成する

  Resource-Configuration はリソースゲートウェイに関連付けられ、リソースへのアクセスを可能にします。

  [AWS コンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)から、または次のコマンドを使用して Resource-Configuration を作成できます。

  ```bash
  aws vpc-lattice create-resource-configuration \
      --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
      --type <RESOURCE_CONFIGURATION_TYPE> \
      --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
      --name <RESOURCE_CONFIGURATION_NAME>
  ```

  最も単純な[リソース構成タイプ](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)は、単一の Resource-Configuration です。ARN を直接指定するか、パブリックに名前解決可能な IP アドレスまたはドメイン名を共有して構成できます。

  例として、RDS クラスターの ARN で構成する場合は次のようになります。

  ```bash
  aws vpc-lattice create-resource-configuration \
      --name my-rds-cluster-config \
      --type ARN \
      --resource-gateway-identifier rgw-0bba03f3d56060135 \
      --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
  ```

  :::note
  パブリックアクセス可能なクラスターに対しては、リソース構成を作成できません。
  クラスターがパブリックアクセス可能な場合、リソース構成を作成する前に
  クラスターをプライベートに変更するか、
  代わりに [IP アローリスト](/integrations/clickpipes#list-of-static-ips) を使用する必要があります。
  詳細については、[AWS のドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)を参照してください。
  :::

  出力には Resource-Configuration ARN が含まれ、これは次のステップで必要になります。また、Resource-Configuration ID も含まれており、VPC リソースを用いた ClickPipe 接続の設定時に必要です。

  #### Resource-Share を作成する

  リソースを共有するには Resource-Share が必要です。これは Resource Access Manager (RAM) を通じて行われます。

  :::note
  Resource-Share は単一の Reverse Private Endpoint に対してのみ使用でき、再利用することはできません。
  同じ Resource-Configuration を複数の Reverse Private Endpoint で使用する必要がある場合は、
  エンドポイントごとに個別の Resource-Share を作成する必要があります。
  Resource-Share は Reverse Private Endpoint が削除された後も AWS アカウントに残るため、
  不要になった場合は手動で削除する必要があります。
  :::

  [AWS コンソール](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)を使用するか、ClickPipes アカウント ID `072088201116`(arn:aws:iam::072088201116:root)を指定して次のコマンドを実行することで、Resource-Configuration を Resource-Share に追加できます。

  ```bash
  aws ram create-resource-share \
      --principals 072088201116 \
      --resource-arns <RESOURCE_CONFIGURATION_ARN> \
      --name <RESOURCE_SHARE_NAME>
  ```

  出力には Resource-Share ARN が含まれており、これは VPC リソースを用いた ClickPipe 接続の設定時に必要です。

  これで、VPC リソースを使用して[Reverse private endpoint を利用した ClickPipe を作成](#creating-clickpipe)する準備ができました。次の設定を行う必要があります。

  * `VPC endpoint type` を `VPC Resource` に設定します。
  * `Resource configuration ID` を、ステップ 2 で作成した Resource-Configuration の ID に設定します。
  * `Resource share ARN` を、ステップ 3 で作成した Resource-Share の ARN に設定します。

  VPC リソースと組み合わせた PrivateLink の詳細については、[AWS ドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を参照してください。
</VerticalStepper>

### MSK マルチ VPC 接続 {#msk-multi-vpc}

[Multi-VPC connectivity](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) は、複数の VPC を 1 つの MSK クラスターに接続できる AWS MSK の組み込み機能です。
プライベート DNS は標準でサポートされており、追加の設定は不要です。
クロスリージョン接続には対応していません。

これは、MSK 向け ClickPipes で推奨されるオプションです。
詳細は [getting started](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) ガイドを参照してください。

:::info
MSK クラスターのポリシーを更新し、MSK クラスターで許可されたプリンシパルの一覧に `072088201116` を追加してください。
詳細は、AWS の [attaching a cluster policy](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) ガイドを参照してください。
:::

接続のセットアップ方法については、[ClickPipes 向け MSK セットアップガイド](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes) を参照してください。

### VPC エンドポイントサービス {#vpc-endpoint-service}

[VPC エンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) は、データソースを ClickPipes と共有するためのもう 1 つの方法です。
データソースの前段に NLB（Network Load Balancer）を設定し、
その NLB を使用するように VPC エンドポイントサービスを構成する必要があります。

VPC エンドポイントサービスは [プライベート DNS を用いて構成](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html) でき、ClickPipes 用の VPC 内からアクセス可能になります。

次のような用途に適しています。

- プライベート DNS サポートが必要なオンプレミスの Kafka セットアップ
- [Postgres CDC のクロスリージョン接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK クラスターのクロスリージョン接続。サポートが必要な場合は ClickHouse サポートチームまでお問い合わせください。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) ガイドを参照してください。

:::info
ClickPipes のアカウント ID `072088201116` を、VPC エンドポイントサービスの許可プリンシパルに追加してください。
詳細については、AWS の [アクセス許可の管理](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) ガイドを参照してください。
:::

:::info
[クロスリージョンアクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
は ClickPipes に対して構成できます。お使いの VPC エンドポイントサービスの許可リージョンに、[ClickPipe のリージョン](#aws-privatelink-regions) を追加してください。
:::

## リバースプライベートエンドポイントを使用した ClickPipe の作成 {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. ClickHouse Cloud サービスの SQL Console にアクセスします。

<Image img={cp_service} alt="ClickPipes サービス" size="md" border/>

2. 左側メニューで `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. データソースとして Kafka または Postgres のいずれかを選択します。

<Image img={cp_rpe_select} alt="データソースの選択" size="lg" border/>

4. `Reverse private endpoint` オプションを選択します。

<Image img={cp_rpe_step0} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

5. 既存のリバースプライベートエンドポイントのいずれかを選択するか、新しく作成します。

:::info
RDS へのリージョンをまたぐアクセスが必要な場合は、VPC エンドポイントサービスを作成する必要があり、
[このガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) がセットアップを始めるうえでの良い出発点になります。

同一リージョン内でのアクセスには、VPC Resource を作成する方法が推奨されます。
:::

<Image img={cp_rpe_step1} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

6. 選択したエンドポイントタイプに必要なパラメータを入力します。

<Image img={cp_rpe_step2} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

    - VPC resource の場合は、configuration share ARN と configuration ID を指定します。
    - MSK multi-VPC の場合は、クラスター ARN と、作成したエンドポイントで使用する認証方式を指定します。
    - VPC endpoint service の場合は、サービス名を指定します。

7. `Create` をクリックし、リバースプライベートエンドポイントの準備が完了するまで待ちます。

   新しいエンドポイントを作成する場合、エンドポイントのセットアップに時間がかかることがあります。
   エンドポイントの準備ができると、ページは自動的に更新されます。
   VPC endpoint service の場合は、AWS コンソールで接続リクエストを承諾する必要がある場合があります。

<Image img={cp_rpe_step3} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

8. エンドポイントの準備が完了したら、その DNS 名を使用してデータソースに接続できます。

   エンドポイントの一覧で、利用可能なエンドポイントの DNS 名を確認できます。
   これは、ClickPipes が内部的にプロビジョニングした DNS 名、または PrivateLink サービスから提供されたプライベート DNS 名のいずれかになります。
   DNS 名は完全なネットワークアドレスではありません。
   データソースに応じてポート番号を追加してください。

   MSK の接続文字列は AWS コンソールから参照できます。

   DNS 名の一覧全体は、ClickHouse Cloud サービスの設定から確認できます。

</VerticalStepper>

## 既存のリバースプライベートエンドポイントの管理 {#managing-existing-endpoints}

ClickHouse Cloud のサービス設定で、既存のリバースプライベートエンドポイントを管理できます:

<VerticalStepper headerLevel="list">

1. サイドバーの `Settings` ボタンをクリックします。

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. `ClickPipe reverse private endpoints` セクション内の `Reverse private endpoints` をクリックします。

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

   リバースプライベートエンドポイントの詳細情報がフライアウトパネルに表示されます。

   ここからエンドポイントを削除できます。削除すると、このエンドポイントを使用しているすべての ClickPipes に影響します。

</VerticalStepper>

## サポートされている AWS リージョン {#aws-privatelink-regions}

AWS PrivateLink のサポートは、ClickPipes 向けには特定の AWS リージョンに限定されています。
利用可能なリージョンについては、[ClickPipes のリージョン一覧](/integrations/clickpipes#list-of-static-ips) を参照してください。

この制限は、リージョン間接続を有効化した PrivateLink VPC エンドポイントサービスには適用されません。

## 制限事項 \{#limitations\}

ClickHouse Cloud で作成された ClickPipes 用の AWS PrivateLink エンドポイントが、
ClickHouse Cloud サービスと同じ AWS リージョン内に作成されることは保証されません。

現在のところ、VPC エンドポイントサービスのみが
リージョンをまたぐ接続をサポートしています。

プライベートエンドポイントは特定の ClickHouse サービスに関連付けられており、サービス間で付け替えることはできません。
1 つの ClickHouse サービスに対する複数の ClickPipes では、同じエンドポイントを再利用できます。

AWS MSK は、認証タイプ（SASL_IAM または SASL_SCRAM）ごとに、MSK クラスターあたり 1 つの PrivateLink（VPC エンドポイント）のみをサポートします。その結果、複数の ClickHouse Cloud サービスまたは組織が、同じ認証タイプを使用して同一の MSK クラスターに対して個別の PrivateLink 接続を作成することはできません。

### 非アクティブなエンドポイントの自動クリーンアップ {#automatic-cleanup}

終了状態のまま残っている reverse private endpoint は、定義された猶予期間の後に自動的に削除されます。
これにより、未使用または誤って構成されたエンドポイントが無期限に残り続けることを防ぎます。

エンドポイントのステータスごとの猶予期間は次のとおりです。

| Status | Grace Period | Description |
|---|---|---|
| **Failed** | 7 days | エンドポイントのプロビジョニング中にエラーが発生しました。 |
| **Pending Acceptance** | 1 day | エンドポイント接続がサービス所有者によってまだ承諾されていません。 |
| **Rejected** | 1 day | エンドポイント接続はサービス所有者によって拒否されました。 |
| **Expired** | Immediate | エンドポイントは既に有効期限切れであり、直ちに削除されます。 |

猶予期間が経過すると、エンドポイントと関連するすべてのリソースは自動的に削除されます。

自動削除を防ぐには、猶予期間が切れる前に根本的な問題を解消してください。
たとえば、AWS コンソールで保留中の接続要求を承諾するか、
Failed 状態になったエンドポイントを再作成します。