---
sidebar_label: 'アップグレード'
slug: /manage/updates
title: 'アップグレード'
description: 'ClickHouse Cloud を利用すれば、パッチ適用やアップグレードの心配は不要です。修正、新機能、パフォーマンス向上を含むアップグレードを、定期的に適用します。'
doc_type: 'guide'
keywords: ['アップグレード', 'バージョン管理', 'クラウド機能', 'メンテナンス', '更新']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# アップグレード

ClickHouse Cloud を利用すると、パッチ適用やアップグレードについて心配する必要はありません。修正、新機能、パフォーマンス向上を含むアップグレードを定期的にロールアウトしています。ClickHouse の最新の変更点の一覧については、[Cloud changelog](/whats-new/cloud) を参照してください。

:::note
新しいアップグレードメカニズムとして、「make before break」（MBB）というコンセプトを導入しています。この新しいアプローチでは、アップグレード処理の際に古いレプリカを削除する前に、更新済みのレプリカを追加します。これにより、実行中のワークロードへの影響を抑えつつ、よりシームレスなアップグレードが可能になります。

この変更の一環として、過去の system テーブルのデータは、アップグレードイベントに関連して最大 30 日間保持されます。さらに、AWS または GCP 上のサービスにおける 2024 年 12 月 19 日より前の system テーブルデータ、および Azure 上のサービスにおける 2025 年 1 月 14 日より前の system テーブルデータは、新しい組織ティアへの移行に伴い保持されません。
:::



## バージョン互換性 {#version-compatibility}

サービスを作成すると、[`compatibility`](/operations/settings/settings#compatibility)設定は、サービスが最初にプロビジョニングされた時点でClickHouse Cloudで提供されている最新のClickHouseバージョンに設定されます。

`compatibility`設定を使用すると、以前のバージョンの設定のデフォルト値を利用できます。サービスが新しいバージョンにアップグレードされても、`compatibility`設定で指定されたバージョンは変更されません。つまり、サービスを最初に作成した時点で存在していた設定のデフォルト値は変更されません(既にそれらのデフォルト値を上書きしている場合は、アップグレード後もその値が保持されます)。

サービスレベルのデフォルト`compatibility`設定を管理することはできません。サービスのデフォルト`compatibility`設定に設定されているバージョンを変更する場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。ただし、セッション内で`SET compatibility = '22.3'`を実行したり、クエリ内で`SETTINGS compatibility = '22.3'`を指定したりするなど、標準的なClickHouseの設定メカニズムを使用して、ユーザー、ロール、プロファイル、クエリ、またはセッションレベルで`compatibility`設定を上書きすることは可能です。


## メンテナンスモード {#maintenance-mode}

サービスの更新が必要になることがあり、その際にスケーリングやアイドリングなどの特定の機能を一時的に無効化する場合があります。まれに、問題が発生しているサービスに対処し、正常な状態に復旧させる必要が生じることもあります。このようなメンテナンス中は、サービスページに _"Maintenance in progress"_ というバナーが表示されます。メンテナンス中でもクエリの実行にサービスを使用できる場合があります。

メンテナンス中の時間については課金されません。_メンテナンスモード_ はまれに発生するものであり、通常のサービスアップグレードとは異なります。


## リリースチャネル(アップグレードスケジュール) {#release-channels-upgrade-schedule}

ユーザーは特定のリリースチャネルを選択することで、ClickHouse Cloudサービスのアップグレードスケジュールを指定できます。リリースチャネルは3種類あり、**スケジュールアップグレード**機能を使用して、アップグレードを実行する曜日と時刻を設定できます。

3つのリリースチャネルは以下の通りです:

- [**Fastリリースチャネル**](#fast-release-channel-early-upgrades) - アップグレードへの早期アクセスを提供します。
- [**Regularリリースチャネル**](#regular-release-channel) - デフォルトのチャネルで、Fastリリースチャネルのアップグレードから2週間後にアップグレードが開始されます。ScaleおよびEnterpriseティアのサービスでリリースチャネルが設定されていない場合、デフォルトでRegularリリースチャネルが適用されます。
- [**Slowリリースチャネル**](#slow-release-channel-deferred-upgrades) - 遅延リリース用のチャネルです。このチャネルでのアップグレードは、Regularリリースチャネルのアップグレードから2週間後に実行されます。

:::note
Basicティアのサービスは自動的にFastリリースチャネルに登録されます
:::

### Fastリリースチャネル(早期アップグレード) {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature='Fastリリースチャネル' />

通常のアップグレードスケジュールに加えて、通常のリリーススケジュールより先にサービスをアップデートしたい場合は、**Fastリリース**チャネルを提供しています。

具体的には、サービスは以下のようになります:

- 最新のClickHouseリリースを受け取ります
- 新しいリリースがテストされるため、より頻繁にアップグレードされます

以下に示すように、Cloudコンソールでサービスのリリーススケジュールを変更できます:

<div class='eighty-percent'>
  <Image img={fast_release} size='lg' alt='プランを選択' border />
</div>
<br />

<div class='eighty-percent'>
  <Image img={enroll_fast_release} size='lg' alt='プランを選択' border />
</div>
<br />

この**Fastリリース**チャネルは、重要度の低い環境で新機能をテストするのに適しています。**厳格な稼働時間と信頼性の要件がある本番ワークロードには推奨されません。**

### Regularリリースチャネル {#regular-release-channel}

リリースチャネルまたはアップグレードスケジュールが設定されていないすべてのScaleおよびEnterpriseティアのサービスでは、Regularチャネルリリースの一部としてアップグレードが実行されます。これは本番環境に推奨されます。

Regularリリースチャネルへのアップグレードは、通常、**Fastリリースチャネル**の2週間後に実行されます。

:::note
Basicティアのサービスは、Fastリリースチャネルの直後にアップグレードされます。
:::

### Slowリリースチャネル(遅延アップグレード) {#slow-release-channel-deferred-upgrades}

<EnterprisePlanFeatureBadge feature='Slowリリースチャネル' />

通常のリリーススケジュールの後にサービスをアップグレードしたい場合は、**Slowリリース**チャネルを提供しています。

具体的には、サービスは以下のようになります:

- FastおよびRegularリリースチャネルのロールアウトが完了した後にアップグレードされます
- Regularリリースの約2週間後にClickHouseリリースを受け取ります
- 本番環境のアップグレード前に、非本番環境でClickHouseリリースをテストする追加の時間が必要な顧客向けです。非本番環境では、テストと検証のためにFastまたはRegularリリースチャネルでアップグレードを受けることができます。

:::note
リリースチャネルはいつでも変更できます。ただし、特定の場合、変更は将来のリリースにのみ適用されます。

- より高速なチャネルに移行すると、サービスは直ちにアップグレードされます。例: SlowからRegular、RegularからFast
- より低速なチャネルに移行しても、サービスはダウングレードされず、そのチャネルで新しいバージョンが利用可能になるまで現在のバージョンが維持されます。例: RegularからSlow、FastからRegularまたはSlow
  :::


## スケジュールアップグレード {#scheduled-upgrades}

<EnterprisePlanFeatureBadge
  feature='スケジュールアップグレード'
  linking_verb_are='true'
/>

Enterpriseティアのサービスでは、アップグレードウィンドウを設定できます。

アップグレードスケジュールを指定するサービスを選択し、左側のメニューから`Settings`を選択します。`Scheduled upgrades`までスクロールしてください。

<div class='eighty-percent'>
  <Image img={scheduled_upgrades} size='lg' alt='スケジュールアップグレード' border />
</div>
<br />

このオプションを選択すると、データベースおよびクラウドのアップグレードを実行する曜日と時間帯を指定できます。

<div class='eighty-percent'>
  <Image
    img={scheduled_upgrade_window}
    size='lg'
    alt='スケジュールアップグレードウィンドウ'
    border
  />
</div>
<br />
:::note スケジュールアップグレードは定義されたスケジュールに従いますが、重大なセキュリティパッチや脆弱性修正については例外が適用されます。緊急のセキュリティ問題が特定された場合、スケジュールされたウィンドウ外でアップグレードが実行されることがあります。このような例外については、必要に応じてお客様に通知いたします。 :::
