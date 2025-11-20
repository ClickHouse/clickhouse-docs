---
sidebar_label: 'HIPAA オンボーディング'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'HIPAA オンボーディング'
description: 'HIPAA 準拠サービスを利用開始する手順について詳しく説明します'
doc_type: 'guide'
keywords: ['hipaa', 'compliance', 'healthcare', 'security', 'data protection']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import hipaa1 from '@site/static/images/cloud/security/compliance/hipaa_1.png';
import hipaa2 from '@site/static/images/cloud/security/compliance/hipaa_2.png';
import hipaa3 from '@site/static/images/cloud/security/compliance/hipaa_3.png';
import hipaa4 from '@site/static/images/cloud/security/compliance/hipaa_4.png';

<EnterprisePlanFeatureBadge feature="HIPAA" />

ClickHouse は、1996 年制定の Health Information Portability and Accountability Act (HIPAA) の Security Rule に準拠したサービスを提供します。お客様は、Business Associate Agreement (BAA) を締結し、準拠リージョンにサービスをデプロイした後、これらのサービス内で保護対象医療情報 (PHI) を処理できます。

ClickHouse のコンプライアンスプログラムおよび第三者監査報告書の提供状況についての詳細は、[コンプライアンス概要](/cloud/security/compliance-overview)および [Trust Center](https://trust.clickhouse.com) を参照してください。さらに、お客様のワークロードに適したセキュリティコントロールを選択・実装するために、[セキュリティ機能](/cloud/security) ページも確認してください。

このページでは、ClickHouse Cloud で HIPAA 準拠サービスのデプロイを有効化する手順について説明します。


## HIPAA準拠サービスの有効化とデプロイ {#enable-hipaa-compliant-services}

<VerticalStepper headerLevel="h3">

### Enterpriseサービスへの登録 {#sign-up-for-enterprise}

1. コンソールの左下隅にある組織名を選択します。
2. **Billing**をクリックします。
3. 左上隅の**Plan**を確認します。
4. **Plan**が**Enterprise**の場合は、次のセクションに進みます。そうでない場合は、**Change plan**をクリックします。
5. **Switch to Enterprise**を選択します。

### 組織でHIPAAを有効化 {#enable-hipaa}

1. コンソールの左下隅にある組織名を選択します。
2. **Organization details**をクリックします。
3. **Enable HIPAA**をオンに切り替えます。

<br />

<Image
  img={hipaa1}
  size='md'
  alt='HIPAA有効化のリクエスト'
  background='black'
/>

<br />

4. 画面の指示に従って、BAA締結のリクエストを送信します。

<br />

<Image img={hipaa2} size='md' alt='BAAリクエストの送信' background='black' />

<br />

5. BAAが完了すると、組織でHIPAAが有効化されます。

<br />

<Image img={hipaa3} size='md' alt='HIPAA有効化済み' background='black' />

<br />

### HIPAA準拠リージョンへのサービスのデプロイ {#deploy-hippa-services}

1. コンソールのホーム画面の左上隅にある**New service**を選択します
2. **Region type**を**HIPAA compliant**に変更します

<br />

<Image img={hipaa4} size='md' alt='HIPAAリージョンへのデプロイ' background='black' />

<br />

3. サービスの名前を入力し、残りの情報を入力します

HIPAA準拠のクラウドプロバイダーとサービスの完全なリストについては、[サポートされているクラウドリージョン](/cloud/reference/supported-regions)ページをご確認ください。

</VerticalStepper>


## 既存サービスの移行 {#migrate-to-hipaa}

必要に応じて、準拠環境へのサービスのデプロイを強く推奨します。標準リージョンからHIPAA準拠リージョンへサービスを移行するプロセスには、バックアップからの復元が含まれ、ある程度のダウンタイムが発生する可能性があります。

標準リージョンからHIPAA準拠リージョンへの移行が必要な場合は、以下の手順に従ってセルフサービス移行を実行してください:

1. 移行するサービスを選択します。
2. 左側の**バックアップ**をクリックします。
3. 復元するバックアップの左側にある3点リーダーを選択します。
4. **リージョンタイプ**を選択して、バックアップをHIPAA準拠リージョンに復元します。
5. 復元が完了したら、いくつかのクエリを実行して、スキーマとレコード数が期待通りであることを確認します。
6. 古いサービスを削除します。

:::info 制限事項
サービスは同じクラウドプロバイダーおよび地理的リージョン内に留まる必要があります。このプロセスは、同じクラウドプロバイダーおよびリージョン内の準拠環境にサービスを移行します。
:::
