---
sidebar_label: 'バックアップスケジュールの設定'
slug: /cloud/manage/backups/configurable-backups
description: 'バックアップスケジュールの設定方法を説明するガイド'
title: 'バックアップスケジュールの設定'
keywords: ['バックアップ', 'クラウドバックアップ', 'リストア']
doc_type: 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True" />

サービスのバックアップスケジュールを設定するには、コンソールの **Settings** タブに移動し、**Change backup configuration** をクリックします。

<Image img={backup_settings} size="lg" alt="バックアップ設定を変更する" border />

画面右側にパネルが表示され、保持期間、頻度、開始時刻の値を選択できます。選択した設定を反映するには、保存する必要があります。

<Image img={backup_configuration_form} size="lg" alt="バックアップの保持期間と頻度を選択する" border />

:::note
開始時刻と頻度は同時に指定できません。開始時刻が優先されます。
:::

:::note
バックアップスケジュールを変更すると、一部のバックアップがサービスのデフォルトバックアップに含まれず、ストレージの月額料金が高くなる場合があります。下記の [&quot;Understanding backup cost&quot;](/cloud/manage/backups/overview#understanding-backup-cost) セクションを参照してください。
:::
