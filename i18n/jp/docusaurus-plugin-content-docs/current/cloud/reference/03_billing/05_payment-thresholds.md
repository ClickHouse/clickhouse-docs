---
sidebar_label: '支払いしきい値'
slug: /cloud/billing/payment-thresholds
title: '支払いしきい値'
description: 'ClickHouse Cloud における支払いしきい値と自動請求。'
keywords: ['billing', 'payment thresholds', 'automatic invoicing', 'invoice']
doc_type: 'guide'
---

# 支払いしきい値

ClickHouse Cloud の請求期間におけるご請求金額が 10,000 米ドル（または同等額）に達すると、ご登録のお支払い方法に自動的に請求が行われます。請求が失敗した場合は、猶予期間の後にサービスが一時停止または終了されます。 

:::note
この支払いしきい値は、ClickHouse とコミットメント契約やその他の個別の契約を締結しているお客様には適用されません。
:::

組織のご請求金額が支払いしきい値の 90% に達し、このままでは請求期間の途中でしきい値を超える見込みである場合、その組織に関連付けられている請求先メールアドレス宛に通知メールが送信されます。支払いしきい値を超えた際には、通知メールに加えて請求書も送付されます。

これらの支払いしきい値は、お客様からのご要望、または ClickHouse Finance チームの判断により、10,000 米ドル未満に調整することができます。ご不明な点がありましたら、詳細については support@clickhouse.com までお問い合わせください。