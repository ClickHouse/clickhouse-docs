---
sidebar_label: "PCIオンボーディング"
slug: /cloud/security/compliance/pci-onboarding
title: "PCIオンボーディング"
description: "PCI準拠サービスへのオンボーディング方法について説明します"
doc_type: "guide"
keywords:
  ["pci", "compliance", "payment security", "data protection", "security"]
---

import BetaBadge from "@theme/badges/BetaBadge"
import EnterprisePlanFeatureBadge from "@theme/badges/EnterprisePlanFeatureBadge"

import Image from "@theme/IdealImage"
import pci1 from "@site/static/images/cloud/security/compliance/pci_1.png"
import pci2 from "@site/static/images/cloud/security/compliance/pci_2.png"
import pci3 from "@site/static/images/cloud/security/compliance/pci_3.png"

<EnterprisePlanFeatureBadge feature='PCI compliance' />

ClickHouseは、Payment Card Industry Data Security Standard（PCI-DSS）に準拠したサービスを提供しており、Level 1サービスプロバイダー要件に基づいて監査されています。お客様は、この機能を有効にし、準拠リージョンにサービスをデプロイすることで、これらのサービス内でプライマリアカウント番号（PAN）を処理することができます。

ClickHouseのコンプライアンスプログラムおよびサードパーティ監査レポートの入手可能性に関する詳細については、[コンプライアンス概要](/cloud/security/compliance-overview)をご確認ください。PCI共同責任文書のコピーについては、[Trust Center](https://trust.clickhouse.com)をご覧ください。また、お客様は[セキュリティ機能](/cloud/security)ページを確認し、ワークロードに適したセキュリティコントロールを選択および実装してください。

このページでは、ClickHouse CloudでPCI準拠サービスのデプロイを有効にする手順について説明します。

<VerticalStepper headerLevel="h3">

### Enterpriseサービスへの登録 {#sign-up-for-enterprise}

1. コンソールの左下隅にある組織名を選択します。
2. **請求**をクリックします。
3. 左上隅の**プラン**を確認します。
4. **プラン**が**Enterprise**の場合は、次のセクションに進みます。そうでない場合は、**プランを変更**をクリックします。
5. **Enterpriseに切り替え**を選択します。

### 組織のPCIを有効化 {#enable-hipaa}

1. コンソールの左下隅にある組織名を選択します。
2. **組織の詳細**をクリックします。
3. **PCIを有効化**をオンに切り替えます。

<br />

<Image img={pci1} size='md' alt='Enable PCI' background='black' />

<br />

4. 有効化すると、組織内でPCIサービスをデプロイできるようになります。

<br />

<Image img={pci2} size='md' alt='PCI enabled' background='black' />

<br />

### PCI準拠リージョンへのサービスのデプロイ {#deploy-pci-regions}

1. コンソールのホーム画面の左上隅にある**新規サービス**を選択します
2. **リージョンタイプ**を**HIPAA準拠**に変更します

<br />

<Image img={pci3} size='md' alt='Deploy to PCI region' background='black' />

<br />

3. サービスの名前を入力し、残りの情報を入力します

PCI準拠のクラウドプロバイダーとサービスの完全なリストについては、[サポートされているクラウドリージョン](/cloud/reference/supported-regions)ページをご確認ください。

</VerticalStepper>


## 既存サービスの移行 {#migrate-to-hipaa}

必要に応じて、コンプライアンス環境へのサービスのデプロイを強く推奨します。標準リージョンからPCI準拠リージョンへサービスを移行するプロセスには、バックアップからの復元が含まれ、ダウンタイムが発生する可能性があります。

標準リージョンからPCI準拠リージョンへの移行が必要な場合は、以下の手順に従ってセルフサービス移行を実行してください。

1. 移行するサービスを選択します。
2. 左側の**Backups**をクリックします。
3. 復元するバックアップの左側にある3点リーダーを選択します。
4. **Region type**を選択して、バックアップをPCI準拠リージョンに復元します。
5. 復元が完了したら、いくつかのクエリを実行して、スキーマとレコード数が想定通りであることを確認します。
6. 古いサービスを削除します。

:::info 制限事項
サービスは同じクラウドプロバイダーおよび地理的リージョン内に留まる必要があります。このプロセスは、同じクラウドプロバイダーおよびリージョン内の準拠環境にサービスを移行します。
:::
