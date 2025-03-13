---
sidebar_label: アップグレード
slug: /manage/updates
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# アップグレード

ClickHouse Cloudを使用すれば、パッチ適用やアップグレードについて心配する必要はありません。定期的に修正、新機能、およびパフォーマンス向上を含むアップグレードを展開します。ClickHouseの新機能の完全なリストについては、[Cloudの変更ログ](/cloud/reference/changelog.md)を参照してください。

:::note
新しいアップグレードメカニズム、「make before break」（MBB）と呼ばれる概念を導入します。この新しいアプローチでは、アップグレード操作中に古いレプリカを削除する前に、更新されたレプリカを追加します。これにより、実行中のワークロードへの影響が少ない、よりシームレスなアップグレードが実現します。

この変更の一環として、歴史的なシステムテーブルデータはアップグレードイベントの一部として最大30日間保持されます。また、AWSまたはGCPのサービスに対しては2024年12月19日以前のシステムテーブルデータ、Azureのサービスに対しては2025年1月14日以前のデータは、新しい組織ティアへの移行の一環として保持されません。
:::

## バージョン互換性 {#version-compatibility}

サービスを作成するとき、[`compatibility`](/operations/settings/settings#compatibility)設定は、サービスが初めてプロビジョニングされた時点でClickHouse Cloudで提供されている最新のClickHouseバージョンに設定されます。

`compatibility`設定を使用すると、以前のバージョンの設定からのデフォルト値を使用できます。サービスが新しいバージョンにアップグレードされると、`compatibility`設定に指定されたバージョンは変更されません。これは、サービスを最初に作成したときに存在していた設定のデフォルト値は変更されないことを意味します（すでにこれらのデフォルト値を上書きしている場合を除き、その場合はアップグレード後も持続します）。

サービスの`compatibility`設定を管理することはできません。`compatibility`設定のバージョンを変更したい場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。

## メンテナンスモード {#maintenance-mode}

時には、サービスを更新する必要がある場合があり、その際にスケーリングやアイドルなどの特定の機能を無効にする必要があるかもしれません。稀に、問題が発生しているサービスに対して行動を取り、それを健康な状態に戻す必要がある場合もあります。このようなメンテナンスの間、サービスページには「メンテナンス中」というバナーが表示されます。この間もクエリの使用は可能です。

メンテナンス中はサービスに対して料金は請求されません。_メンテナンスモード_はまれな事象であり、通常のサービスアップグレードと混同しないでください。

## リリースチャネル（アップグレードスケジュール） {#release-channels-upgrade-schedule}

特定のリリースチャネルにサブスクライブすることで、ClickHouse Cloudサービスのアップグレードスケジュールを指定できます。

### ファストリリースチャネル（早期アップグレード） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="ファストリリースチャネル"/>

通常のアップグレードスケジュールに加えて、**ファストリリース**チャネルを提供しており、通常のリリーススケジュールの前にサービスに更新を受け取ってほしい場合にご利用いただけます。

具体的には、サービスは以下の内容を受け取ります：

- 最新のClickHouseリリース
- 新しいリリースがテストされるたびに、より頻繁なアップグレード

サービスのリリーススケジュールは、Cloudコンソールで以下のように変更できます：

<div class="eighty-percent">
    <img alt="プランの選択" src={fast_release} />
</div>
<br/>

<div class="eighty-percent">
    <img alt="プランの選択" src={enroll_fast_release} />
</div>
<br/>

この**ファストリリース**チャネルは、重要でない環境で新機能をテストするのに適しています。**厳格な稼働時間と信頼性要件のある本番ワークロードには推奨されません。**

### 通常リリースチャネル {#regular-release-channel}

リリースチャネルやアップグレードスケジュールが設定されていないすべてのScaleおよびEnterpriseティアサービスについて、アップグレードは通常チャネルのリリースの一部として実施されます。これは本番環境に推奨されます。

通常リリースチャネルへのアップグレードは、通常**ファストリリースチャネル**の2週間後に実施されます。

:::note
Basicティアサービスは、ファストリリースチャネルの直後にアップグレードされます。
:::

## スケジュールされたアップグレード {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="スケジュールされたアップグレード" linking_verb_are="true"/>

ユーザーは、Enterpriseティアのサービスに対してアップグレードウィンドウを設定できます。

アップグレードスケジュールを指定したいサービスを選択し、左のメニューから`設定`を選択します。`スケジュールされたアップグレード`までスクロールします。

<div class="eighty-percent">
    <img alt="スケジュールされたアップグレード" src={scheduled_upgrades} />
</div>
<br/>

このオプションを選択すると、データベースおよびクラウドアップグレードのための曜日/時間ウィンドウを選択できるようになります。

<div class="eighty-percent">
    <img alt="スケジュールアップグレードウィンドウ" src={scheduled_upgrade_window} />
</div>
<br/>
:::note
スケジュールされたアップグレードは定義されたスケジュールに従いますが、重要なセキュリティパッチや脆弱性修正に対しては例外が適用されます。緊急のセキュリティ問題が特定された場合、アップグレードは予定されたウィンドウの外で実施されることがあります。そのような例外については、必要に応じて顧客に通知されます。
:::
