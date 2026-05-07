---
sidebar_label: 'PCI オンボーディング'
slug: /cloud/security/compliance/pci-onboarding
title: 'PCI オンボーディング'
description: 'PCI 準拠サービスの利用開始方法について詳しく説明します'
doc_type: 'guide'
keywords: ['pci', 'compliance', 'payment security', 'data protection', 'security']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import pci1 from '@site/static/images/cloud/security/compliance/pci_1.png';
import pci2 from '@site/static/images/cloud/security/compliance/pci_2.png';
import pci3 from '@site/static/images/cloud/security/compliance/pci_3.png';

<EnterprisePlanFeatureBadge feature="PCI 準拠" />

ClickHouse は、Payment Card Industry Data Security Standard（PCI-DSS）に準拠したサービスを提供しており、レベル 1 サービスプロバイダー要件に基づく監査を受けています。お客様は、この機能を有効にし、準拠リージョンにサービスをデプロイすることで、これらのサービス内でプライマリアカウント番号（PAN）を処理できます。

ClickHouse のコンプライアンスプログラムおよび第三者監査レポートの提供状況の詳細については、[コンプライアンス概要](/cloud/security/compliance-overview)をご確認ください。PCI 共有責任ドキュメントのコピーについては、[Trust Center](https://trust.clickhouse.com) を参照してください。あわせて、お客様はワークロードに対して適切なセキュリティコントロールを選択・実装するために、[セキュリティ機能](/cloud/security)ページも確認してください。

このページでは、ClickHouse Cloud で PCI 準拠サービスをデプロイ可能にする手順について説明します。

<VerticalStepper headerLevel="h3">
  ### Enterprise サービスにサインアップする

  1. コンソール左下にある自分の組織名を選択します。
  2. **Billing** をクリックします。
  3. 左上にある **Plan** を確認します。
  4. **Plan** が **Enterprise** の場合は次のセクションに進みます。そうでない場合は **Change plan** をクリックします。
  5. **Switch to Enterprise** を選択します。

  ### 組織に対して PCI を有効化する

  1. コンソール左下にある自分の組織名を選択します。
  2. **Organization details** をクリックします。
  3. **Enable PCI** をオンに切り替えます。

  <br />

  <Image img={pci1} size="md" alt="PCI を有効化" background="black" />

  <br />

  4. 有効化されると、組織内で PCI 準拠サービスをデプロイできるようになります。

  <br />

  <Image img={pci2} size="md" alt="PCI が有効化された状態" background="black" />

  <br />

  ### PCI 準拠リージョンへのサービスのデプロイ

  1. コンソールのホーム画面左上で **New service** を選択します。
  2. **Region type** を **HIPAA compliant** に変更します。

  <br />

  <Image img={pci3} size="md" alt="PCI リージョンへのデプロイ" background="black" />

  <br />

  3. サービス名を入力し、残りの情報を入力します。

  PCI 準拠クラウドプロバイダーおよびサービスの一覧については、[対応クラウドリージョン](/cloud/reference/supported-regions)ページを参照してください。
</VerticalStepper>


## 既存のサービスを移行する {#migrate-to-hipaa}

必要に応じて、準拠環境へサービスをデプロイすることを強く推奨します。標準リージョンから PCI 準拠リージョンへサービスを移行するプロセスには、バックアップからのリストアが含まれ、一定のダウンタイムを要する場合があります。

標準リージョンから PCI 準拠リージョンへの移行が必要な場合は、以下の手順に従ってセルフサービスで移行を行ってください。

1. 移行対象のサービスを選択します。
2. 左側の **Backups** をクリックします。
3. リストア対象のバックアップの左側にある三点リーダーアイコンを選択します。
4. バックアップのリストア先として PCI 準拠リージョンを指定するため、**Region type** を選択します。
5. リストアが完了したら、いくつかクエリを実行し、スキーマおよびレコード件数が想定どおりであることを確認します。
6. 旧サービスを削除します。

:::info 制約事項
サービスは同一のクラウドプロバイダーおよび地理的リージョン内にとどまる必要があります。このプロセスでは、同一のクラウドプロバイダーおよびリージョン内の準拠環境へサービスを移行します。
:::
