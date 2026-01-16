---
sidebar_label: 'アップグレード'
slug: /manage/updates
title: 'アップグレード'
description: 'ClickHouse Cloud を利用すれば、パッチ適用やアップグレードについて心配する必要はありません。修正、新機能、パフォーマンス向上を含むアップグレードを、定期的に順次適用しています。'
doc_type: 'guide'
keywords: ['アップグレード', 'バージョン管理', 'クラウド機能', 'メンテナンス', 'アップデート']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# アップグレード \\{#upgrades\\}

ClickHouse Cloud を利用すると、パッチ適用やアップグレードについて心配する必要はありません。修正、新機能、パフォーマンス向上を含むアップグレードを定期的に実施します。ClickHouse における新機能の一覧については、[Cloud changelog](/whats-new/cloud) を参照してください。

:::note
新しいアップグレードメカニズムとして、「make before break」（MBB）というコンセプトを導入しています。この新しいアプローチでは、アップグレード処理中に古いレプリカを削除する前に、更新されたレプリカを追加します。これにより、実行中のワークロードへの影響が小さい、よりシームレスなアップグレードが可能になります。

この変更の一環として、システムテーブルの履歴データは、アップグレードイベントの一部として最大 30 日間保持されます。さらに、AWS または GCP 上のサービスについては 2024 年 12 月 19 日より前、Azure 上のサービスについては 2025 年 1 月 14 日より前のシステムテーブルデータは、新しい組織ティアへの移行の一部として保持されません。
:::

## バージョン互換性 \\{#version-compatibility\\}

サービスを作成すると、その時点で ClickHouse Cloud 上で提供されている最新の ClickHouse バージョンが、そのサービスの [`compatibility`](/operations/settings/settings#compatibility) 設定として指定されます。

`compatibility` 設定により、過去バージョンの設定デフォルト値を利用できます。サービスが新しいバージョンにアップグレードされても、`compatibility` 設定に指定されているバージョンは変更されません。これは、サービスを最初に作成した時点で存在していた設定のデフォルト値が変更されないことを意味します（すでにそれらのデフォルト値を上書きしている場合は、その値がアップグレード後も維持されます）。

サービスレベルのデフォルト `compatibility` 設定を自分で変更することはできません。サービスのデフォルト `compatibility` 設定に指定されているバージョンを変更したい場合は、[サポートに連絡](https://clickhouse.com/support/program)する必要があります。ただし、ユーザー、ロール、プロファイル、クエリ、またはセッションのレベルでは、`SET compatibility = '22.3'` をセッション内で実行したり、クエリ内で `SETTINGS compatibility = '22.3'` を指定したりするなど、標準的な ClickHouse の設定メカニズムを使用して `compatibility` 設定を上書きできます。

## メンテナンスモード \\{#maintenance-mode\\}

サービスを更新する必要が生じる場合があり、その際にはスケーリングや自動休止などの一部機能を無効化する必要が生じることがあります。まれに、不具合が発生しているサービスに対して作業を行い、正常な状態に戻す必要が生じることもあります。このようなメンテナンス中は、サービスページに _"Maintenance in progress"_（メンテナンス中）というバナーが表示されます。この期間中でも、クエリの実行にはサービスを利用できる場合があります。

サービスがメンテナンス中の時間について、料金が発生することはありません。_メンテナンスモード_ はまれにしか行われず、通常のサービスアップグレードと混同しないでください。

## リリースチャネル（アップグレードスケジュール） \\{#release-channels-upgrade-schedule\\}

ユーザーは、特定のリリースチャネルに登録することで、自身の ClickHouse Cloud サービスのアップグレードスケジュールを指定できます。リリースチャネルは 3 種類あり、**スケジュール済みアップグレード**機能を使って、アップグレードを実行する曜日と時間を設定できます。

3 種類のリリースチャネルは次のとおりです:
- [**高速リリースチャネル**](#fast-release-channel-early-upgrades) — アップグレードへの早期アクセス用です。
- [**通常リリースチャネル**](#regular-release-channel) — デフォルトのチャネルで、このチャネルでのアップグレードは高速リリースチャネルでのアップグレードの 2 週間後に開始されます。Scale および Enterprise ティアのサービスでリリースチャネルが設定されていない場合、デフォルトで通常リリースチャネルになります。
- [**スローリリースチャネル**](#slow-release-channel-deferred-upgrades) — リリースを遅らせるためのチャネルです。このチャネルでのアップグレードは、通常リリースチャネルでのアップグレードの 2 週間後に実施されます。

:::note
Basic ティアのサービスは自動的に高速リリースチャネルに登録されます。
:::

### 高速リリースチャネル（早期アップグレード） \\{#fast-release-channel-early-upgrades\\}

<ScalePlanFeatureBadge feature="高速リリースチャネル"/>

通常のアップグレードスケジュールに加えて、サービスを通常リリーススケジュールよりも早くアップデートしたい場合に利用できる **高速リリース**チャネルを提供しています。

具体的には、サービスは次のようになります:

- 最新の ClickHouse リリースを受け取ります
- 新しいリリースがテストされるたびに、より頻繁にアップグレードされます

Cloud コンソールから、以下のようにサービスのリリーススケジュールを変更できます:

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="Select Plan" border/>
</div>

<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="Select Plan" border/>
</div>

<br/>

この **高速リリース**チャネルは、クリティカルではない環境で新機能をテストする用途に適しています。**厳格な稼働時間および信頼性要件を持つ本番ワークロードには推奨されません。**

### 通常リリースチャネル \\{#regular-release-channel\\}

リリースチャネルやアップグレードスケジュールが設定されていないすべての Scale および Enterprise ティアのサービスでは、アップグレードは通常リリースチャネルのリリースの一環として実行されます。これは本番環境に推奨される設定です。

通常リリースチャネルへのアップグレードは、通常 **高速リリースチャネル**の 2 週間後に実施されます。

:::note
Basic ティアのサービスは、高速リリースチャネルの直後にアップグレードされます。
:::

### スローリリースチャネル（遅延アップグレード） \\{#slow-release-channel-deferred-upgrades\\}

<EnterprisePlanFeatureBadge feature="スローリリースチャネル"/>

通常リリーススケジュールより後にサービスをアップグレードしたい場合に利用できる **スローリリース**チャネルを提供しています。

具体的には、サービスは次のようになります:

- 高速リリースチャネルおよび通常リリースチャネルのロールアウト完了後にアップグレードされます
- 通常リリースの約 2 週間後に ClickHouse リリースを受け取ります
- 本番アップグレードの前に、本番以外の環境で ClickHouse リリースのテストに追加の時間を確保したいお客様向けです。本番以外の環境では、テストと検証のために高速または通常リリースチャネルでアップグレードを受けることができます。

:::note
リリースチャネルはいつでも変更できます。ただし、場合によっては、その変更は今後のリリースにのみ適用されます。 

- より高速なチャネルへ移行すると、サービスは直ちにアップグレードされます（例: スローから通常、通常から高速）。
- より低速なチャネルへ移行してもサービスがダウングレードされることはなく、そのチャネルで新しいバージョンが利用可能になるまで現在のバージョンのまま維持されます（例: 通常からスロー、高速から通常またはスロー）。
:::

## 予定されたアップグレード \\{#scheduled-upgrades\\}

<EnterprisePlanFeatureBadge feature="Scheduled upgrades" linking_verb_are="true"/>

Enterprise ティアのサービスに対して、アップグレードの実行時間帯を設定できます。

アップグレードスケジュールを指定したいサービスを選択し、左側メニューから `Settings` を選択します。`Scheduled upgrades` セクションまでスクロールします。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="Scheduled upgrades" border/>
</div>

<br/>

このオプションを選択すると、データベースおよびクラウドのアップグレードを行う曜日と時間帯を指定できます。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="Scheduled upgrade window" border/>
</div>

<br/>

:::note
予定されたアップグレードは定義されたスケジュールに従って実行されますが、重要なセキュリティパッチや脆弱性修正については例外が適用されます。緊急性の高いセキュリティ問題が特定された場合は、予定された時間帯以外でアップグレードが実施されることがあります。そのような例外が発生する場合は、必要に応じてお客様に通知されます。
:::