---
'sidebar_label': 'アップグレード'
'slug': '/manage/updates'
'title': 'アップグレード'
'description': 'ClickHouse Cloudを使用すると、パッチやアップグレードを心配する必要はありません。定期的に修正、新機能、パフォーマンスの改善を含むアップグレードを展開します。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# アップグレード

ClickHouse Cloudを使用すると、パッチやアップグレードを心配する必要はありません。修正、新機能、パフォーマンス改善を含むアップグレードを定期的に展開します。ClickHouseの新機能の完全なリストについては、当社の[Cloud changelog](/whats-new/cloud)を参照してください。

:::note
新しいアップグレードメカニズム、"make before break" (MBB) と呼ばれる概念を導入しています。この新しいアプローチでは、アップグレード操作中に古いレプリカを削除する前に、更新されたレプリカを追加します。これにより、稼働中のワークロードへの影響が少ない、よりシームレスなアップグレードが実現します。

この変更の一環として、過去のシステムテーブルデータはアップグレードイベントの一部分として最大30日間保持されます。また、2024年12月19日以前のAWSやGCP上のサービスのシステムテーブルデータと、2025年1月14日以前のAzure上のサービスのシステムテーブルデータは、新しい組織階層への移行の一部として保持されません。
:::

## バージョン互換性 {#version-compatibility}

サービスを作成すると、[`compatibility`](/operations/settings/settings#compatibility) 設定は、サービスが最初にプロビジョニングされた時点でClickHouse Cloudで提供されている最新のClickHouseバージョンに設定されます。

`compatibility` 設定を使用すると、以前のバージョンからの設定のデフォルト値を使用できます。サービスが新しいバージョンにアップグレードされると、`compatibility` 設定で指定されたバージョンは変更されません。これは、サービスを最初に作成したときに存在していた設定のデフォルト値は変更されないことを意味します（既にそのデフォルト値を上書きしている場合を除き、その場合、アップグレード後もその値は保持されます）。

サービスのレベルのデフォルト`compatibility`設定を管理することはできません。サービスのデフォルト`compatibility`設定のバージョンを変更したい場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。ただし、通常のClickHouseの設定メカニズムを使用して、ユーザー、ロール、プロファイル、クエリ、またはセッションレベルで`compatibility`設定を上書きすることができます。たとえば、セッションで`SET compatibility = '22.3'`や、クエリで`SETTINGS compatibility = '22.3'`とすることで変更できます。

## メンテナンスモード {#maintenance-mode}

サービスの更新が必要な場合、スケーリングやアイドルなどの特定の機能を無効にする必要があるかもしれません。稀に、問題が発生しているサービスに対してアクションを取る必要があり、そのサービスを健康な状態に戻す必要があります。そのようなメンテナンス中は、「メンテナンス進行中」と書かれたバナーがサービスページに表示されます。この間にクエリ用にサービスを使用できる場合があります。

メンテナンス中は、サービスの利用に対して料金は請求されません。_メンテナンスモード_は稀な発生であり、通常のサービスアップグレードとは混同しないでください。

## リリースチャネル (アップグレードスケジュール) {#release-channels-upgrade-schedule}

ユーザーは、特定のリリースチャネルにサブスクリプションを行うことで、ClickHouse Cloudサービスのアップグレードスケジュールを指定できます。リリースチャネルは3つあり、ユーザーはアップグレードの曜日と時間を**スケジュールされたアップグレード**機能で設定可能です。

三つのリリースチャネルは次のとおりです：
- [**ファストリリースチャネル**](#fast-release-channel-early-upgrades)は、アップグレードの早期アクセス用です。
- [**レギュラーリリースチャネル**](#regular-release-channel)はデフォルトのもので、このチャネルでのアップグレードはファストリリースチャネルのアップグレードの2週間後に始まります。もし、スケールとエンタープライズ階層のサービスにリリースチャネルが設定されていない場合のデフォルトはレギュラーリリースチャネルです。
- [**スロウリリースチャネル**](#slow-release-channel-deferred-upgrades)は、延期されたリリース用です。このチャネルでのアップグレードはレギュラーリリースチャネルのアップグレードの2週間後に行われます。

:::note
基本階層のサービスは自動的にファストリリースチャネルに参加します。
:::

### ファストリリースチャネル (早期アップグレード) {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="The fast release channel"/>

通常のアップグレードスケジュールに加えて、サービスがレギュラーリリーススケジュールの前にアップデートを受け取ることを希望する場合は、**ファストリリース**チャネルを提供します。

具体的には、サービスは次のようになります：

- 最新のClickHouseリリースを受け取る
- 新しいリリースがテストされると、より頻繁にアップグレードされる

Cloudコンソールでサービスのリリーススケジュールを以下のように変更できます：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="Select Plan" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="Select Plan" border/>
</div>
<br/>

この**ファストリリース**チャネルは、クリティカルでない環境で新機能をテストするのに適しています。**要求される高い稼働時間と信頼性を持つプロダクションワークロードには推奨されません。**

### レギュラーリリースチャネル {#regular-release-channel}

リリースチャネルやアップグレードスケジュールが設定されていないスケールとエンタープライズ階層のすべてのサービスについては、レギュラーリリースチャネルとしてアップグレードが行われます。これはプロダクション環境に推奨されます。

レギュラーリリースチャネルへのアップグレードは通常、**ファストリリースチャネル**の2週間後に行われます。

:::note
基本階層のサービスは、ファストリリースチャネルの後、すぐにアップグレードされます。
:::

### スロウリリースチャネル (延期されたアップグレード) {#slow-release-channel-deferred-upgrades}

<EnterprisePlanFeatureBadge feature="The slow release channel"/>

もし、サービスがレギュラーリリーススケジュールの後にアップグレードを受け取ることを望む場合は、**スロウリリース**チャネルを提供します。

具体的には、サービスは次のようになります：

- ファストとレギュラーリリースチャネルの展開が完了した後にアップグレードされる
- レギュラーリリースの約2週間後にClickHouseのリリースを受け取る
- プロダクションアップグレードの前にクリティカルでない環境でClickHouseのリリースをテストしたい顧客向け。プロダクションでない環境はテストと検証のためにファストまたはレギュラーリリースチャネルのアップグレードを受けることができます。

:::note
いつでもリリースチャネルを変更できます。ただし、特定の場合では、変更は将来のリリースにのみ適用されます。
- より早いチャネルに移動すると、サービスはすぐにアップグレードされます。つまり、スロウからレギュラー、レギュラーからファスト
- より遅いチャネルに移動すると、サービスはダウングレードせず、現在のバージョンに留まり、そのチャネルで新しいバージョンが利用可能になるまで維持されます。つまり、レギュラーからスロウ、ファストからレギュラーまたはスロウ
:::

## スケジュールされたアップグレード {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="Scheduled upgrades" linking_verb_are="true"/>

ユーザーは、エンタープライズ階層のサービスに対してアップグレードウィンドウを設定できます。

アップグレードのスケジュールを指定したいサービスを選択し、左メニューから `Settings` を選択します。`Scheduled upgrades`までスクロールします。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="Scheduled upgrades" border/>
</div>
<br/>

このオプションを選択すると、データベースとクラウドのアップグレードの曜日/時間ウィンドウをユーザーが選択できるようになります。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="Scheduled upgrade window" border/>
</div>
<br/>
:::note
スケジュールされたアップグレードは定義されたスケジュールに従いますが、クリティカルなセキュリティパッチや脆弱性修正に例外が適用されます。緊急のセキュリティ問題が特定された場合、スケジュールされたウィンドウ外でアップグレードが行われる可能性があります。顧客には必要に応じてそのような例外が通知されます。
:::
