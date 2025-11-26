---
sidebar_label: 'HIPAA オンボーディング'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'HIPAA オンボーディング'
description: 'HIPAA 準拠サービスの利用を開始する方法について詳しく学びます'
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

ClickHouse は、1996 年の Health Insurance Portability and Accountability Act (HIPAA) の Security Rule に準拠したサービスを提供しています。お客様は、Business Associate Agreement (BAA) を締結し、準拠リージョンにサービスをデプロイすることで、これらのサービス内で保護対象医療情報 (PHI) を処理できます。

ClickHouse のコンプライアンスプログラムおよびサードパーティ監査レポートの提供状況については、[コンプライアンス概要](/cloud/security/compliance-overview) および [Trust Center](https://trust.clickhouse.com) を参照してください。加えて、お客様はワークロードに対して適切なセキュリティコントロールを選択・実装するために、[セキュリティ機能](/cloud/security) ページも確認してください。

本ページでは、ClickHouse Cloud において HIPAA 準拠サービスのデプロイを有効にするための手順について説明します。


## HIPAA 準拠サービスを有効にしてデプロイする {#enable-hipaa-compliant-services}

<VerticalStepper headerLevel="h3">

### Enterprise サービスに申し込む {#sign-up-for-enterprise}

1. コンソール左下の組織名を選択します。
2. **Billing** をクリックします。
3. 左上の **Plan** を確認します。
4. **Plan** が **Enterprise** の場合は次のセクションに進みます。そうでない場合は **Change plan** をクリックします。
5. **Switch to Enterprise** を選択します。

### 組織で HIPAA を有効化する {#enable-hipaa}

1. コンソール左下の組織名を選択します。
2. **Organization details** をクリックします。
3. **Enable HIPAA** をオンに切り替えます。

<br />

<Image img={hipaa1} size="md" alt="HIPAA 有効化のリクエスト" background='black'/>

<br />

4. 画面上の手順に従い、BAA 締結のためのリクエストを送信します。

<br />

<Image img={hipaa2} size="md" alt="BAA リクエストの送信" background='black'/>

<br />

5. BAA が完了すると、その組織で HIPAA が有効になります。

<br />

<Image img={hipaa3} size="md" alt="HIPAA が有効化された状態" background='black'/>

<br />

### HIPAA 準拠リージョンにサービスをデプロイする {#deploy-hippa-services}

1. コンソールのホーム画面左上で **New service** を選択します。
2. **Region type** を **HIPAA compliant** に変更します。

<br />

<Image img={hipaa4} size="md" alt="HIPAA リージョンへのデプロイ" background='black'/>

<br />

3. サービス名および残りの情報を入力します。

HIPAA 準拠クラウドプロバイダーおよびサービスの一覧については、[Supported cloud regions](/cloud/reference/supported-regions) ページを参照してください。

</VerticalStepper>



## 既存のサービスを移行する {#migrate-to-hipaa}

必要に応じて、お客様には法令・規制要件に準拠した環境へサービスをデプロイすることを強く推奨します。標準リージョンから HIPAA 準拠リージョンへのサービス移行プロセスでは、バックアップからの復元を行う必要があり、多少のダウンタイムが発生する可能性があります。

標準リージョンから HIPAA 準拠リージョンへの移行が必要な場合は、以下の手順に従ってセルフサービスで移行を実施してください。

1. 移行するサービスを選択します。
2. 左側の **Backups** をクリックします。
3. 復元対象のバックアップの左側にある三点メニューを選択します。
4. **Region type** を選択し、バックアップの復元先として HIPAA 準拠リージョンを指定します。
5. 復元が完了したら、いくつかクエリを実行して、スキーマおよびレコード件数が想定どおりであることを確認します。
6. 旧サービスを削除します。

:::info Restrictions
サービスは同一クラウドプロバイダーおよび同一地理的リージョン内にとどまる必要があります。このプロセスでは、同一クラウドプロバイダーかつ同一リージョン内の準拠環境へサービスを移行します。
:::
