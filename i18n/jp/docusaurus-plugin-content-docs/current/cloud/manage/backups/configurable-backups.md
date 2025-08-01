---
sidebar_label: '設定可能なバックアップ'
slug: '/cloud/manage/backups/configurable-backups'
description: '設定可能なバックアップ'
title: '設定可能なバックアップ'
keywords:
- 'backups'
- 'cloud backups'
- 'restore'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloudでは、**Scale**および**Enterprise**ティアサービスのバックアップスケジュールを設定することができます。バックアップは、ビジネスニーズに基づいて以下の側面で設定できます。

- **Retention**: 各バックアップが保持される日数の期間。保持期間は最短1日から最長30日まで指定でき、その間にいくつかの値を選択できます。
- **Frequency**: 周期は、次のバックアップの間隔を指定できるようにします。例えば、"12時間ごと"の頻度は、バックアップが12時間の間隔で行われることを意味します。頻度は、次の時間間隔で「6時間ごと」から「48時間ごと」まで、`6`、`8`、`12`、`16`、`20`、`24`、`36`、`48`の範囲で設定できます。
- **Start Time**: 毎日バックアップをスケジュールしたい開始時刻。開始時間を指定すると、バックアップの「Frequency」は自動的に24時間ごと1回になります。Clickhouse Cloudは、指定した開始時間の1時間以内にバックアップを開始します。

:::note
カスタムスケジュールは、指定されたサービスのClickHouse Cloudにおけるデフォルトのバックアップポリシーを上書きします。
:::

サービスのバックアップスケジュールを設定するには、コンソールの**Settings**タブに移動し、**Change backup configuration**をクリックします。

<Image img={backup_settings} size="lg" alt="バックアップ設定を構成" border/>

これにより、右側にバックアップの保持期間、頻度、開始時間を選択するためのタブが開きます。選択した設定を保存する必要があります。

<Image img={backup_configuration_form} size="lg" alt="バックアップの保持と頻度を選択" border/>

:::note
開始時間と頻度は相互排他的です。開始時間が優先されます。
:::

:::note
バックアップスケジュールを変更すると、デフォルトのバックアップに含まれない可能性のあるバックアップのため、ストレージに対する月額料金が高くなる可能性があります。以下の「["Understanding backup cost"](./overview.md/#understanding-backup-cost)」セクションを参照してください。
:::
