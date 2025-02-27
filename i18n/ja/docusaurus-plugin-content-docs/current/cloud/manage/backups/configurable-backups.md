---
sidebar_label: 設定可能なバックアップ
slug: /cloud/manage/backups/configurable-backups
description: 設定可能なバックアップ
title: 設定可能なバックアップ
keywords: [バックアップ, クラウドバックアップ, 復元]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';

<ScalePlanFeatureBadge feature="設定可能なバックアップ" linking_verb_are="True"/>

ClickHouse Cloudでは、**Scale**および**Enterprise**ティアのサービスに対してバックアップのスケジュールを設定できます。バックアップは、ビジネスニーズに基づいて以下の次元で設定できます。

- **保持期間**: 各バックアップが保持される日数の期間。保持期間は最低1日から始まり、最大30日まで、いくつかの中間値を選択することができます。
- **頻度**: 頻度は、連続するバックアップの間の時間の間隔を指定できます。たとえば、「12時間ごと」という頻度は、バックアップが12時間間隔で行われることを意味します。頻度は「6時間ごと」から「48時間ごと」まで、以下の時間単位の増分で設定できます: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **開始時間**: 各日バックアップをスケジュールしたい開始時間。開始時間を指定すると、バックアップの「頻度」はデフォルトで24時間ごとになります。ClickHouse Cloudは、指定された開始時間の1時間以内にバックアップを開始します。

:::note
カスタムスケジュールは、指定されたサービスのClickHouse Cloudにおけるデフォルトのバックアップポリシーを上書きします。
:::

サービスのバックアップスケジュールを設定するには、コンソールの**設定**タブに移動し、**バックアップ設定の変更**をクリックします。

<div class="eighty-percent">
![バックアップ設定を構成](../images/backup-settings.png)
</div>
<br/>

右側にタブが開き、保持期間、頻度、開始時間の値を選択できます。選択した設定を保存することで、設定が有効になります。

<div class="eighty-percent">
![バックアップの保持期間と頻度を選択](../images/backup-configuration-form.png)
</div>
<br/>

:::note
開始時間と頻度は相互に排他的です。開始時間が優先されます。
:::

:::note
バックアップスケジュールを変更すると、いくつかのバックアップがサービスのデフォルトのバックアップに含まれないため、ストレージの月額料金が高くなる場合があります。以下のセクション「[バックアップコストの理解](./overview.md/#understanding-backup-cost)」を参照してください。
:::
