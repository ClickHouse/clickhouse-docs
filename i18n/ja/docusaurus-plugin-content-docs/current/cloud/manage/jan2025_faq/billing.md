---
title: 請求
slug: /cloud/manage/jan-2025-faq/billing
keywords: [新しい価格設定, 請求]
description: 新しい価格帯に関する請求の詳細
---

## 請求 {#billing}

### 使用量の測定と請求方法に変更はありますか？ {#are-there-any-changes-to-how-usage-is-metered-and-charged}

計算とストレージの単位コストが変更され、データ転送およびClickPipesの使用を考慮するための2つの追加の次元があります。

いくつかの注目すべき変更点：

- TBあたりのストレージ価格が引き下げられ、ストレージコストにバックアップは含まれなくなります（バックアップは別途請求し、必要なバックアップは1つのみとします）。ストレージコストはすべてのティアで同じで、地域およびクラウドサービスプロバイダーによって異なります。
- 計算コストはティア、地域、クラウドサービスプロバイダーによって異なります。
- データ転送の新しい価格設定次元は、地域間および公共インターネット上のデータエグレスに適用されます。
- ClickPipes使用の新しい価格設定次元があります。

### 既存のコミット支出契約を持つユーザーには何が起こりますか？ {#what-happens-to-users-with-existing-committed-spend-contracts}

アクティブなコミット支出契約を持つユーザーは、その契約が失効するまで新しい計算およびストレージの単位コストの価格に影響されることはありません。ただし、データ転送およびClickPipesの新しい価格設定次元は2025年3月24日から適用されます。ほとんどの顧客は、これらの新しい次元から月額請求が大幅に増加することはないでしょう。

### ClickHouseとのコミット支出契約を持つユーザーは、旧プランでサービスを立ち上げ続けられますか？ {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

はい、ユーザーは契約の終了日まで開発および本番サービスを立ち上げることができます。契約の更新は新しい価格設定プランを反映します。

契約を変更する必要がある場合や、これらの変更が将来どのように影響するかについて質問がある場合は、サポートチームまたは営業担当者にお問い合わせください。

### ユーザーが契約の終了前にクレジットを使い果たしてPAYGに移行した場合はどうなりますか？ {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

コミット支出契約が更新日より前にクレジットを使い果たした場合、現在の料金で請求されます（現在のポリシーに従います）。

### 月額PAYGのユーザーには何が起こりますか？ {#what-happens-to-users-on-the-monthly-payg}

月額PAYGプランのユーザーは、開発および本番サービスに対して旧価格設定プランに基づいて請求され続けます。彼らは2025年7月23日までに新しいプランに移行することができ、移行しなかった場合はこの日にすべてScale構成に移行され、新しいプランに基づいて請求されます。

### 旧プランはどこで参照できますか？ {#where-can-i-reference-legacy-plans}

旧プランは[こちら](https://clickhouse.com/pricing?legacy=true)で参照できます。

## マーケットプレイス {#marketplaces}

### CSPマーケットプレイス経由での課金方法に変更はありますか？ {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

CSPマーケットプレイスを通じてClickHouse Cloudにサインアップしたユーザーは、CHCs（ClickHouse Cloud Credits）を使用して料金が発生します。この動作は変更されていません。ただし、クレジット使用の基盤となる構成は、ここで示されている価格設定およびパッケージの変更に合わせて調整され、データ転送の使用やClickPipesに対する料金が含まれるようになります。
