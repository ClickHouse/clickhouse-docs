---
sidebar_label: 'アップグレード'
slug: /manage/updates
title: 'アップグレード'
description: 'ClickHouse Cloud では、パッチやアップグレードについて心配する必要はありません。修正、新機能、パフォーマンス改善を含むアップグレードを定期的に展開しています。'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# アップグレード

ClickHouse Cloud では、パッチやアップグレードについて心配する必要はありません。修正、新機能、パフォーマンス改善を含むアップグレードを定期的に展開しています。ClickHouse の新機能の完全なリストについては、[Cloud 変更ログ](/cloud/reference/changelog.md)を参照してください。

:::note
新しいアップグレードメカニズム、「make before break」（MBB）という概念を導入します。この新しいアプローチでは、アップグレード操作中に古いレプリカを削除する前に、更新されたレプリカを追加します。これにより、実行中のワークロードに対して中断が少ない、よりシームレスなアップグレードが実現します。

この変更の一環として、アップグレードイベントの際、過去のシステムテーブルデータは最大30日間保持されます。さらに、AWSまたはGCPのサービスに対しては2024年12月19日より古いシステムテーブルデータ、Azureのサービスに対しては2025年1月14日より古いデータは新しい組織ティアへの移行の一環として保持されません。
:::

## バージョン互換性 {#version-compatibility}

サービスを作成すると、[`compatibility`](/operations/settings/settings#compatibility)設定は、サービスが最初にプロビジョニングされた時点でのClickHouse Cloudが提供する最新のClickHouseバージョンに設定されます。

`compatibility`設定を使用すると、以前のバージョンからの設定のデフォルト値を使用できます。サービスが新しいバージョンにアップグレードされても、`compatibility`設定で指定されたバージョンは変更されません。つまり、サービスを最初に作成したときに存在した設定のデフォルト値は変更されず（すでにそれらのデフォルト値が上書きされている場合を除く）、アップグレード後もそのまま保持されます。

サービスの`compatibility`設定を管理することはできません。`compatibility`設定のバージョンを変更したい場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。

## メンテナンスモード {#maintenance-mode}

時には、サービスを更新する必要があり、その際にスケーリングやアイドル状態などの特定の機能を無効にする必要がある場合があります。稀に、問題が発生しているサービスに対してアクションを取る必要があり、正常な状態に戻すこともあります。そのようなメンテナンス中には、サービスページに「_メンテナンス進行中_」というバナーが表示されます。この時間中も、クエリ用にサービスを使用できる場合があります。

メンテナンス中の時間には料金は発生しません。_メンテナンスモード_は稀な現象であり、通常のサービスアップグレードと混同しないでください。

## リリースチャンネル（アップグレードスケジュール） {#release-channels-upgrade-schedule}

特定のリリースチャンネルに登録することで、ClickHouse Cloudサービスのアップグレードスケジュールを指定できます。

### ファストリリースチャンネル（早期アップグレード） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="ファストリリースチャンネル"/>

定期的なアップグレードスケジュールに加えて、**ファストリリース** チャンネルを提供しており、サービスが定期的なリリーススケジュールの前に更新を受け取ることができます。

具体的には、サービスは以下を受け取ります：

- 最新のClickHouseリリース
- 新しいリリースがテストされる際の、より頻繁なアップグレード

Cloudコンソールでサービスのリリーススケジュールを次のように変更できます：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="プランの選択" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="プランの選択" border/>
</div>
<br/>

この**ファストリリース**チャンネルは、重要でない環境で新機能をテストするのに適しています。**活動時間や信頼性の要件が厳しい本番環境には推奨されません。**

### 通常のリリースチャンネル {#regular-release-channel}

リリースチャンネルやアップグレードスケジュールが設定されていないすべてのスケールおよびエンタープライズティアサービスは、通常のチャンネルリリースの一部としてアップグレードが実施されます。これは本番環境に推奨されます。

通常のリリースチャンネルへのアップグレードは、通常**ファストリリースチャンネル**の2週間後に実施されます。

:::note
ベーシックティアのサービスは、ファストリリースチャンネルの後にすぐアップグレードされます。
:::

## スケジュールされたアップグレード {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="スケジュールされたアップグレード" linking_verb_are="true"/>

ユーザーは、エンタープライズティアのサービスに対してアップグレードウィンドウを設定できます。

アップグレードを指定したいサービスを選択し、左メニューから`設定`を選択してください。`スケジュールされたアップグレード`までスクロールします。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="スケジュールされたアップグレード" border/>
</div>
<br/>

このオプションを選択すると、データベースおよびクラウドのアップグレードに対して曜日/時間帯を選択できます。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="スケジュールされたアップグレードウィンドウ" border/>
</div>
<br/>
:::note
スケジュールされたアップグレードは、定義されたスケジュールに従いますが、重要なセキュリティパッチや脆弱性修正の場合は例外があります。緊急のセキュリティ問題が特定された場合、スケジュールされたウィンドウの外でアップグレードが実施されることがあります。そのような例外については、お客様に必要に応じて通知されます。
:::
