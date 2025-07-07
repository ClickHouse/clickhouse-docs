---
'sidebar_label': 'アップグレード'
'slug': '/manage/updates'
'title': 'Upgrades'
'description': 'ClickHouse Cloudを使用すると、パッチ適用とアップグレードの心配はありません。定期的に修正、新機能、パフォーマンスの改善を含むアップグレードを展開します。'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# アップグレード

ClickHouse Cloudでは、パッチやアップグレードについて心配する必要はありません。修正、新機能、パフォーマンスの改善を含むアップグレードを定期的に展開します。ClickHouseの新機能の完全なリストについては、[Cloudの変更履歴](/cloud/reference/changelog.md)を参照してください。

:::note
新しいアップグレードメカニズム「make before break」（またはMBB）を導入します。この新しいアプローチでは、アップグレード操作中に古いレプリカを削除する前に、更新されたレプリカを追加します。これにより、稼働中のワークロードに対する中断が少ない、よりシームレスなアップグレードが実現します。

この変更の一環として、歴史的なシステムテーブルデータは、アップグレードイベントの一環として最大30日間保持されます。また、AWSまたはGCP上のサービスにおいては2024年12月19日以前、Azure上のサービスにおいては2025年1月14日以前のシステムテーブルデータは、新しい組織ティアへの移行の一部として保持されません。
:::

## バージョン互換性 {#version-compatibility}

サービスを作成すると、[`compatibility`](/operations/settings/settings#compatibility) 設定は、サービスが最初にプロビジョニングされた時点でClickHouse Cloudが提供する最新のClickHouseバージョンに設定されます。

`compatibility`設定を使用すると、以前のバージョンからの設定のデフォルト値を使用できます。サービスが新しいバージョンにアップグレードされるとき、`compatibility`設定に指定されているバージョンは変更されません。これは、サービスを最初に作成したときに存在した設定のデフォルト値は変更されないことを意味しています（すでにデフォルト値を上書きしている場合は、その場合でもアップグレード後に持続します）。

サービスの`compatibility`設定を管理することはできません。`compatibility`設定のバージョンを変更したい場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。

## メンテナンスモード {#maintenance-mode}

時には、サービスを更新する必要があり、そのためにスケーリングやアイドルなどの特定の機能を無効にする必要がある場合があります。珍しいケースとして、問題を経験しているサービスに対してアクションを取る必要があり、サービスを健康な状態に戻す必要があります。そのようなメンテナンス中は、「メンテナンス進行中」というバナーがサービスページに表示されます。この間でもクエリとしてサービスを使用できる場合があります。

サービスがメンテナンスを受けている間は、料金は発生しません。_メンテナンスモード_は珍しいケースであり、通常のサービスアップグレードと混同しないでください。

## リリースチャネル（アップグレードスケジュール） {#release-channels-upgrade-schedule}

特定のリリースチャネルに登録することにより、ClickHouse Cloudサービスのアップグレードスケジュールを指定できます。

### ファストリリースチャネル（早期アップグレード） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="ファストリリースチャネル"/>

通常のアップグレードスケジュールに加えて、サービスが通常のリリーススケジュールの前に更新を受け取ることを希望する場合、**ファストリリース**チャネルを提供しています。

具体的には、サービスは以下を行います：

- 最新のClickHouseリリースを受信する
- 新しいリリースがテストされると、より頻繁にアップグレードが行われる

サービスのリリーススケジュールは、下記のCloudコンソールで変更できます。

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="プランの選択" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="プランの選択" border/>
</div>
<br/>

この**ファストリリース**チャネルは、重要でない環境で新機能をテストするために適しています。**厳格な稼働時間と信頼性の要件を持つ本番ワークロードには推奨されません。**

### レギュラーリリースチャネル {#regular-release-channel}

リリースチャネルやアップグレードスケジュールが設定されていないすべてのスケールおよびエンタープライズティアサービスについては、アップグレードはレギュラーチャネルリリースの一部として実施されます。これは本番環境に推奨されます。

レギュラーリリースチャネルへのアップグレードは、通常**ファストリリースチャネル**の2週間後に実施されます。

:::note
ベーシックティアのサービスは、ファストリリースチャネルの直後にアップグレードされます。
:::

## スケジュールされたアップグレード {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="スケジュールされたアップグレード" linking_verb_are="true"/>

ユーザーは、エンタープライズティアのサービスに対してアップグレードウィンドウを設定できます。

アップグレードスケジュールを指定したいサービスを選択し、左側のメニューから`設定`を選択します。`スケジュールされたアップグレード`までスクロールします。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="スケジュールされたアップグレード" border/>
</div>
<br/>

このオプションを選択すると、ユーザーはデータベースおよびクラウドのアップグレードの曜日/時間帯を選択できます。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="スケジュールされたアップグレードウィンドウ" border/>
</div>
<br/>
:::note
スケジュールされたアップグレードは定義されたスケジュールに従いますが、重要なセキュリティパッチおよび脆弱性修正については例外が適用されます。緊急のセキュリティ問題が特定された場合、スケジュールされたウィンドウ外でアップグレードが行われる場合があります。そのような例外については、必要に応じて顧客に通知されます。
:::
