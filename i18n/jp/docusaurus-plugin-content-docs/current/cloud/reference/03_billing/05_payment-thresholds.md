---
sidebar_label: '支払いしきい値'
slug: /cloud/billing/payment-thresholds
title: '支払いしきい値'
description: 'ClickHouse Cloud における支払いしきい値と自動請求について。'
keywords: ['billing', 'payment thresholds', 'automatic invoicing', 'invoice']
doc_type: 'guide'
---

# 支払いしきい値

ClickHouse Cloud の請求期間におけるご利用残高が 10,000 米ドルまたは同等額に達すると、登録済みのお支払い方法に対して自動的に課金が行われます。課金に失敗した場合、猶予期間経過後にサービスが一時停止または終了されることがあります。 

:::note
この支払いしきい値は、コミット済み利用契約やその他の個別に合意された契約を ClickHouse と締結しているお客様には適用されません。
:::

組織の利用額が支払いしきい値の 90% に達し、このまま請求期間の途中でしきい値を超える見込みがある場合、その組織に紐づく請求先メールアドレス宛に通知メールが送信されます。実際に支払いしきい値を超えた際には、通知メールおよび請求書が送信されます。

これらの支払いしきい値は、お客様からのご要望、または ClickHouse Finance チームの判断により、10,000 米ドル未満に調整することができます。ご不明な点がありましたら、support@clickhouse.com までお問い合わせください。