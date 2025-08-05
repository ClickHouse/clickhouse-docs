---
title: '課金'
slug: '/cloud/manage/jan-2025-faq/billing'
keywords:
- 'new pricing'
- 'billing'
description: '新しい価格層の課金詳細'
---



## Billing {#billing}

### 使用量の測定と請求に変更はありますか？ {#are-there-any-changes-to-how-usage-is-metered-and-charged}

計算およびストレージの次元ごとの単価が変更され、データ転送および ClickPipes 使用量を考慮するための二つの追加の次元があります。

いくつかの注目すべき変更点：

- TB あたりのストレージ価格が引き下げられ、ストレージコストにバックアップは含まれなくなります（バックアップは別途請求し、一つのバックアップのみが必要になります）。ストレージコストは全てのティアにおいて同じで、地域やクラウドサービスプロバイダーによって異なります。
- 計算コストはティア、地域、クラウドサービスプロバイダーによって異なります。
- データ転送に対する新しい料金次元は、地域間および公共インターネット上でのデータエグレスにのみ適用されます。
- ClickPipes 使用に対する新しい料金次元があります。

### 既存のコミットされた支出契約を持つユーザーには何が起こりますか？ {#what-happens-to-users-with-existing-committed-spend-contracts}

アクティブなコミットされた支出契約を持つユーザーは、契約が終了するまで、新しい次元ごとの単価に影響を受けません。ただし、データ転送および ClickPipes に対する新しい料金次元は 2025 年 3 月 24 日から適用されます。ほとんどの顧客は、これらの新しい次元から月次請求が大幅に増加することはありません。

### ClickHouse とのコミットされた支出契約のあるユーザーは、古いプランでサービスを起動し続けることができますか？ {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

はい、ユーザーは契約の終了日まで開発および生産サービスを起動し続けることができます。更新時には新しい料金プランが反映されます。

契約を変更する必要がある場合や、これらの変更が将来どのように影響するかについて質問がある場合は、サポートチームまたは営業担当者にお問い合わせください。

### ユーザーが契約の終了前にクレジットを使い果たし PAYG に移行した場合はどうなりますか？ {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

コミット支出契約でクレジットが更新日より前に使い果たされた場合、私たちは現在の料金で更新まで請求します（現在のポリシーに従って）。

### 月次 PAYG のユーザーには何が起こりますか？ {#what-happens-to-users-on-the-monthly-payg}

月次 PAYG プランのユーザーは、開発および生産サービスに対して古い料金プランを使用して請求され続けます。彼らは 2025 年 7 月 23 日までに新しいプランへ自己移行することができます。そうでない場合、この日にすべてがスケール構成に移行され、新しいプランに基づいて請求されます。

### 過去のプランを参照するにはどこを見ることができますか？ {#where-can-i-reference-legacy-plans}

過去のプランは [こちら](https://clickhouse.com/pricing?legacy=true) で参照可能です。

## Marketplaces {#marketplaces}

### CSP マーケットプレイスを通じたユーザーへの請求方法に変更はありますか？ {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

CSP マーケットプレイスを通じて ClickHouse Cloud にサインアップしたユーザーは、CHCs (ClickHouse Cloud Credits) という形で使用量が発生します。この挙動は変更されていません。ただし、クレジット使用の基盤となる構成は、ここで概説された料金およびパッケージの変更に沿うものとなり、データ転送の使用量と ClickPipes に対する請求が含まれますが、これらが稼働した後です。
