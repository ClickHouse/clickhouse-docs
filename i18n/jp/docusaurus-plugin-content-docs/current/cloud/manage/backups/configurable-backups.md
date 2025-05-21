---
sidebar_label: '設定可能なバックアップ'
slug: /cloud/manage/backups/configurable-backups
description: '設定可能なバックアップ'
title: '設定可能なバックアップ'
keywords: ['バックアップ', 'クラウドバックアップ', '復元']
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="設定可能なバックアップ" linking_verb_are="True"/>

ClickHouse Cloudでは、**Scale**および**Enterprise**ティアサービスのバックアップスケジュールを設定できます。バックアップは、ビジネスニーズに基づいて以下の次元で構成できます。

- **保持期間**: 各バックアップが保持される日数の期間。保持期間は最低1日から最高30日まで指定でき、間にいくつかの値を選ぶことができます。
- **頻度**: 頻度では、次回のバックアップまでの時間間隔を指定できます。たとえば、「12時間ごと」という頻度は、バックアップが12時間ごとに行われることを意味します。頻度は「6時間ごと」から「48時間ごと」までの以下の時間間隔で設定できます: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **開始時刻**: 毎日バックアップをスケジュールする開始時刻。開始時刻を指定すると、バックアップの「頻度」はデフォルトで24時間ごとになります。Clickhouse Cloudは、指定された開始時刻の1時間以内にバックアップを開始します。

:::note
カスタムスケジュールは、指定されたサービスのClickHouse Cloudにおけるデフォルトのバックアップポリシーを上書きします。
:::

サービスのバックアップスケジュールを構成するには、コンソールの**設定**タブに移動し、**バックアップ設定の変更**をクリックします。

<Image img={backup_settings} size="lg" alt="バックアップ設定の構成" border/>

これにより、右側に保持期間、頻度、および開始時刻の値を選択できるタブが開きます。選択した設定を保存する必要があります。

<Image img={backup_configuration_form} size="lg" alt="バックアップの保持期間と頻度の選択" border/>

:::note
開始時刻と頻度は相互排他的です。開始時刻が優先されます。
:::

:::note
バックアップスケジュールを変更すると、一部のバックアップがサービスのデフォルトバックアップに含まれない可能性があるため、ストレージの月額料金が増加することがあります。以下の["バックアップコストの理解"](./overview.md/#understanding-backup-cost)セクションを参照してください。
:::

