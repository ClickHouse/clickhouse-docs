---
sidebar_label: 'アップグレード'
slug: /manage/updates
title: 'アップグレード'
description: 'ClickHouse Cloud では、パッチ適用やアップグレードを気にする必要はありません。修正、新機能、パフォーマンス向上を含むアップグレードを定期的に展開しています。'
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

ClickHouse Cloud を利用すれば、パッチ適用やアップグレードについて心配する必要はありません。修正、新機能、パフォーマンス向上を含むアップグレードを定期的にロールアウトしています。ClickHouse に追加された新機能の一覧については、[Cloud changelog](/whats-new/cloud) を参照してください。

:::note
現在、新しいアップグレードメカニズムとして「make before break」（略して MBB）というコンセプトを導入しています。この新しいアプローチでは、アップグレード処理の際、古いレプリカを削除する前に更新済みのレプリカを追加します。これにより、実行中のワークロードへの影響が少ない、よりシームレスなアップグレードが可能になります。

この変更の一環として、アップグレードイベントに関連する履歴の system テーブルデータは、最大 30 日間保持されます。さらに、AWS または GCP 上のサービスについては 2024 年 12 月 19 日以前、Azure 上のサービスについては 2025 年 1 月 14 日以前の system テーブルデータは、新しい組織階層への移行に伴い保持されません。
:::



## バージョン互換性 {#version-compatibility}

サービスを作成すると、[`compatibility`](/operations/settings/settings#compatibility) 設定は、サービスが最初にプロビジョニングされた時点で ClickHouse Cloud が提供する最新の ClickHouse バージョンに設定されます。

`compatibility` 設定を使用すると、以前のバージョンの設定のデフォルト値を使用できます。サービスが新しいバージョンにアップグレードされても、`compatibility` 設定で指定されたバージョンは変更されません。つまり、サービスを最初に作成した時点で存在していた設定のデフォルト値は変更されません(既にそれらのデフォルト値を上書きしている場合は、アップグレード後もその値が保持されます)。

サービスレベルのデフォルト `compatibility` 設定を管理することはできません。サービスのデフォルト `compatibility` 設定のバージョンを変更したい場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。ただし、セッション内で `SET compatibility = '22.3'` を使用したり、クエリ内で `SETTINGS compatibility = '22.3'` を使用したりするなど、標準的な ClickHouse の設定メカニズムを使用して、ユーザー、ロール、プロファイル、クエリ、またはセッションレベルで `compatibility` 設定を上書きすることができます。


## メンテナンスモード {#maintenance-mode}

サービスの更新が必要となる場合があり、その際にスケーリングやアイドリングなどの特定の機能を一時的に無効化する必要が生じることがあります。まれに、問題が発生しているサービスに対処を行い、正常な状態に復旧させる必要がある場合があります。このようなメンテナンス中は、サービスページに _"Maintenance in progress"_ というバナーが表示されます。この間もクエリの実行にサービスを使用できる場合があります。

メンテナンス中の時間については課金されません。_メンテナンスモード_ はまれに発生するものであり、通常のサービスアップグレードとは異なります。


## リリースチャネル(アップグレードスケジュール) {#release-channels-upgrade-schedule}

ユーザーは特定のリリースチャネルを選択することで、ClickHouse Cloudサービスのアップグレードスケジュールを指定できます。リリースチャネルは3種類あり、**スケジュールアップグレード**機能を使用して、アップグレードを実行する曜日と時刻を設定できます。

3つのリリースチャネルは以下の通りです:

- [**高速リリースチャネル**](#fast-release-channel-early-upgrades) - アップグレードへの早期アクセスを提供します。
- [**通常リリースチャネル**](#regular-release-channel) - デフォルトのチャネルで、このチャネルでのアップグレードは高速リリースチャネルのアップグレードから2週間後に開始されます。ScaleおよびEnterpriseティアのサービスでリリースチャネルが設定されていない場合、デフォルトで通常リリースチャネルが適用されます。
- [**低速リリースチャネル**](#slow-release-channel-deferred-upgrades) - 遅延リリース用のチャネルです。このチャネルでのアップグレードは、通常リリースチャネルのアップグレードから2週間後に実行されます。

:::note
Basicティアのサービスは自動的に高速リリースチャネルに登録されます
:::

### 高速リリースチャネル(早期アップグレード) {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature='高速リリースチャネル' />

通常のアップグレードスケジュールに加えて、通常のリリーススケジュールより先にサービスの更新を受け取りたい場合は、**高速リリース**チャネルを提供しています。

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

この**高速リリース**チャネルは、重要度の低い環境で新機能をテストするのに適しています。**厳格な稼働時間と信頼性の要件がある本番ワークロードには推奨されません。**

### 通常リリースチャネル {#regular-release-channel}

リリースチャネルまたはアップグレードスケジュールが設定されていないすべてのScaleおよびEnterpriseティアのサービスについては、通常チャネルリリースの一環としてアップグレードが実行されます。本番環境に推奨されます。

通常リリースチャネルへのアップグレードは、通常**高速リリースチャネル**の2週間後に実行されます。

:::note
Basicティアのサービスは高速リリースチャネルの直後にアップグレードされます。
:::

### 低速リリースチャネル(遅延アップグレード) {#slow-release-channel-deferred-upgrades}

<EnterprisePlanFeatureBadge feature='低速リリースチャネル' />

通常のリリーススケジュールの後にサービスのアップグレードを受け取りたい場合は、**低速リリース**チャネルを提供しています。

具体的には、サービスは以下のようになります:

- 高速および通常リリースチャネルのロールアウトが完了した後にアップグレードされます
- 通常リリースの約2週間後にClickHouseリリースを受け取ります
- 本番環境のアップグレード前に、非本番環境でClickHouseリリースをテストするための追加時間が必要なお客様を対象としています。非本番環境では、テストと検証のために高速または通常リリースチャネルでアップグレードを受けることができます。

:::note
リリースチャネルはいつでも変更できます。ただし、特定の場合には、変更は将来のリリースにのみ適用されます。

- より高速なチャネルに移行すると、サービスは直ちにアップグレードされます。例: 低速から通常、通常から高速
- より低速なチャネルに移行しても、サービスはダウングレードされず、そのチャネルで新しいバージョンが利用可能になるまで現在のバージョンが維持されます。例: 通常から低速、高速から通常または低速
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
