---
sidebar_label: '支払いしきい値'
slug: /cloud/billing/payment-thresholds
title: '支払いしきい値'
description: 'ClickHouse Cloud の支払いしきい値と自動請求書発行について。'
keywords: ['請求', '支払いしきい値', '自動請求書発行', '請求書']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import billing_1 from '@site/static/images/cloud/reference/billing_payment_threshhold.png';
import billing_2 from '@site/static/images/cloud/reference/billing_payment_threshhold_2.png';


## 支払いしきい値 \{#threshholds\}

従量課金制の顧客で、ClickHouse Cloud の 1 請求期間内の支払金額が 10,000 USD（または同等額）に達した場合、組織に設定されている支払い方法に対して自動的に決済が行われます。

:::tip
このデフォルトの支払いしきい値は 10,000 USD 未満に調整できます。
変更を希望する場合は、[サポートにお問い合わせ](support@clickhouse.com)ください。
:::

決済が失敗した場合、14 日間の猶予期間後にサービスは一時停止されます。
1 つの請求期間内に複数の請求書を受け取った場合、それらはすべて受領時点で支払期日となり、ClickHouse Cloud 組織を[コンプライアンス準拠](/manage/clickhouse-cloud-billing-compliance)の状態に保つためにはすべて支払いを行う必要があります。

自動支払いでの決済が失敗した場合、設定されているクレジットカードに問題があるか、クレジットカードに対して e-mandate を設定していないか、またはクレジットカードがインド準備銀行 (RBI) による定期的なオンライン取引のための e-mandate 処理に関するフレームワークに準拠していない可能性があります。
クレジットカードが RBI に準拠していない場合は、RBI 準拠の新しい支払い方法を追加するか、カードに対して e-mandate を設定できるようになるまで手動での支払いを継続する必要があります。

以下の例では、Cloud コンソール内の Billing UI を示しています。

<Image img={billing_1} size="sm" alt="UI で Billing を確認できる場所"/>

<Image img={billing_2} size="lg" alt="請求書"/>

上記の例から分かるように、2 月 28 日〜 3 月 31 日の請求期間中にしきい値に達したタイミングで請求書が送付され、その後、同じ請求期間内で 10,000 USD を超過した利用分に対して別の請求書が送付されています。

## 支払いしきい値の通知 \{#threshholds-notifications\}

組織の利用額が支払いしきい値の 90% に達し、その請求期間の途中でしきい値を超える見込みがある場合、その組織に紐づく請求担当者のメールアドレス宛に通知メールが送信されます。
しきい値を超えた時点でも、通知メールおよび請求書が送信されます。