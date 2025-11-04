---
'sidebar_label': '設定可能なバックアップ'
'slug': '/cloud/manage/backups/configurable-backups'
'description': '設定可能なバックアップ'
'title': '設定可能なバックアップ'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'doc_type': 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloudでは、**Scale**および**Enterprise**ティアサービス用のバックアップスケジュールを構成できます。バックアップは、ビジネスニーズに応じて以下の次元に基づいて構成できます。

- **Retention**: 各バックアップが保持される期間（日数）。保持期間は最短1日から最長30日まで指定でき、その間のいくつかの値を選択できます。
- **Frequency**: この頻度により、次のバックアップとの間隔を指定できます。たとえば、「12時間ごと」という頻度は、バックアップが12時間ごとに行われることを意味します。頻度は「6時間ごと」から「48時間ごと」までで、以下の時間間隔で設定できます： `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **Start Time**: 毎日バックアップをスケジュールする開始時間。開始時間を指定すると、バックアップの「Frequency」は24時間ごとに1回がデフォルトとなります。ClickHouse Cloudは、指定された開始時間の1時間以内にバックアップを開始します。

:::note
カスタムスケジュールは、指定されたサービスのClickHouse Cloudにおけるデフォルトのバックアップポリシーを上書きします。
:::

:::note
稀なシナリオでは、バックアップスケジューラーがバックアップのために指定された**Start Time**を尊重しない場合があります。具体的には、現在スケジュールされたバックアップの時刻から24時間未満の時間で成功したバックアップがトリガーされた場合に発生します。これは、バックアップのために実装されているリトライメカニズムによるものです。このような場合、スケジューラーは当日のバックアップをスキップし、翌日にスケジュールされた時間にバックアップをリトライします。
:::

サービスのバックアップスケジュールを構成するには、コンソールの**Settings**タブに移動し、**Change backup configuration**をクリックします。

<Image img={backup_settings} size="lg" alt="バックアップ設定の構成" border/>

これにより、右側にタブが開き、保持期間、頻度、および開始時間の値を選択できます。選択した設定は、効果を発揮させるために保存する必要があります。

<Image img={backup_configuration_form} size="lg" alt="バックアップ保持期間と頻度の選択" border/>

:::note
開始時間と頻度は相互排他的です。開始時間が優先されます。
:::

:::note
バックアップスケジュールを変更すると、サービスのデフォルトのバックアップに含まれないバックアップがいくつか発生する可能性があるため、ストレージの月額料金が高くなることがあります。下のセクション["バックアップコストの理解"](./overview.md/#understanding-backup-cost)を参照してください。
:::
