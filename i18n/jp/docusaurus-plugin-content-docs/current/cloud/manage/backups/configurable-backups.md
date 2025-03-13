---
sidebar_label: 設定可能なバックアップ
slug: /cloud/manage/backups/configurable-backups
description: 設定可能なバックアップ
title: 設定可能なバックアップ
keywords: [バックアップ, クラウドバックアップ, 復元]
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';

<ScalePlanFeatureBadge feature="設定可能なバックアップ" linking_verb_are="True"/>

ClickHouse Cloudでは、**Scale**および**Enterprise**ティアサービスのバックアップスケジュールを設定することができます。バックアップは、ビジネスニーズに基づいて以下の次元で設定可能です。

- **保持期間**: 各バックアップが保持される日数の期間。保持期間は最短1日から最長30日まで、間のいくつかの値を指定できます。
- **頻度**: 頻度では、次のバックアップまでの時間間隔を指定できます。たとえば、「12時間ごと」の頻度は、バックアップが12時間ごとに行われることを意味します。頻度は「6時間ごと」から「48時間ごと」まで、次の時間間隔で指定できます: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **開始時間**: 毎日バックアップをスケジュールしたい開始時間。開始時間を指定すると、バックアップの「頻度」は自動的に24時間ごとになります。ClickHouse Cloudは、指定された開始時間の1時間以内にバックアップを開始します。

:::note
カスタムスケジュールは、特定のサービスに対するClickHouse Cloudのデフォルトバックアップポリシーを上書きします。
:::

サービスのバックアップスケジュールを設定するには、コンソールの**設定**タブに移動し、**バックアップ設定の変更**をクリックします。

<div class="eighty-percent">
    <img src={backup_settings}
        alt="バックアップ設定を構成する"
        class="image"
    />
</div>
<br/>

これにより、右側に保持期間、頻度、開始時間の値を選択できるタブが開きます。選択した設定を保存する必要があります。

<div class="eighty-percent">
    <img src={backup_configuration_form}
        alt="バックアップ保持期間と頻度を選択"
        class="image"
    />
</div>
<br/>

:::note
開始時間と頻度は相互に排他的です。開始時間が優先されます。
:::

:::note
バックアップスケジュールを変更すると、優先デフォルトバックアップに含まれないバックアップがあるため、ストレージの月額料金が上がる可能性があります。以下のセクション ["バックアップコストの理解"](./overview.md/#understanding-backup-cost) を参照してください。
:::

