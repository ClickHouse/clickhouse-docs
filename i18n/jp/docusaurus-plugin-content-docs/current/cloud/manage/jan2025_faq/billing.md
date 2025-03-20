---
title: 課金
slug: /cloud/manage/jan-2025-faq/billing
keywords: [新価格, 課金]
description: 新しい価格帯に関する課金の詳細
---

## 課金 {#billing}

### 使用量の測定および請求方法に変更はありますか？ {#are-there-any-changes-to-how-usage-is-metered-and-charged}

計算およびストレージの次元ごとの単価が変更され、データ転送と ClickPipes の使用量を考慮するための 2 つの追加の次元が追加されました。

特筆すべき変更点:

- TB あたりのストレージ価格が引き下げられ、ストレージコストにはバックアップが含まれなくなります（バックアップは別途請求し、1 回のバックアップのみが必要になります）。ストレージコストはティアに関係なく同じで、地域とクラウドサービスプロバイダーによって異なります。
- 計算コストはティア、地域、クラウドサービスプロバイダーによって異なります。
- データ転送の新しい価格次元は、地域間および公共インターネット上でのデータエグレスに対してのみ適用されます。
- ClickPipes の使用に対する新しい価格次元。

### 既存のコミット支出契約を持つユーザーにはどのような影響がありますか？ {#what-happens-to-users-with-existing-committed-spend-contracts}

アクティブなコミット支出契約を持つユーザーは、契約が期限切れになるまで、計算およびストレージの新しい次元ごとの単価の価格には影響されません。しかし、データ転送および ClickPipes の新しい価格次元は 2025 年 3 月 24 日から適用されます。ほとんどの顧客は、これらの新しい次元からの月次請求額の大幅な増加を見ないでしょう。

### ClickHouse とコミット支出契約を結んでいるユーザーは、旧プランでサービスを立ち上げ続けることができますか？ {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

はい、ユーザーは契約の終了日まで開発および本番サービスを立ち上げられることができます。更新時には新しい価格プランが反映されます。

契約を変更する必要がある場合や、これらの変更が将来にどのように影響するかについて質問がある場合は、サポートチームまたは営業担当者にお問い合わせください。

### ユーザーが契約の終了前にクレジットを使い果たして PAYG に移行した場合はどうなりますか？ {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

コミット支出契約が更新日より前にクレジットを使い果たした場合、現在の料金で請求されます（現在のポリシーに従う）。

### 月次 PAYG プランのユーザーにはどのような影響がありますか？ {#what-happens-to-users-on-the-monthly-payg}

月次 PAYG プランのユーザーは、開発および本番サービスに関して旧価格プランに基づいて請求され続けます。2025 年 7 月 23 日までに新プランにセルフサービスで移行する必要があります。それまでに移行しなかった場合、当日にすべてがスケール構成に移行され、新プランに基づいて請求されます。

### レガシープランの参照はどこでできますか？ {#where-can-i-reference-legacy-plans}

レガシープランは [こちら](https://clickhouse.com/pricing?legacy=true) で参照できます。

## マーケットプレイス {#marketplaces}

### CSP マーケットプレイスを通じたユーザーの請求方法に変更はありますか？ {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

CSP マーケットプレイスを通じて ClickHouse Cloud にサインアップしたユーザーは、CHC（ClickHouse Cloud Credits）に関して使用量を発生させます。この動作には変更はありません。ただし、クレジット使用の根本的な構成は、ここに示された価格とパッケージの変更に沿い、データ転送使用量と ClickPipes に関する料金が含まれることになります。それらが稼働するようになると。
