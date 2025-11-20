---
'sidebar_label': '백업 일정 구성'
'slug': '/cloud/manage/backups/configurable-backups'
'description': '백업을 구성하는 방법을 보여주는 가이드'
'title': '백업 일정 구성'
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

서비스의 백업 일정을 설정하려면 콘솔에서 **Settings** 탭으로 이동하여 **Change backup configuration**을 클릭하십시오.

<Image img={backup_settings} size="lg" alt="Configure backup settings" border/>

이것은 오른쪽에 탭을 열어 보존 기간, 빈도 및 시작 시간을 선택할 수 있게 합니다. 선택한 설정을 저장해야 효과가 발생합니다.

<Image img={backup_configuration_form} size="lg" alt="Select backup retention and frequency" border/>

:::note
시작 시간과 빈도는 상호 배타적입니다. 시작 시간이 우선합니다.
:::

:::note
백업 일정을 변경하면 기본 백업에 포함되지 않을 수 있는 백업으로 인해 저장소에 대한 월별 요금이 증가할 수 있습니다. 아래의 ["Understanding backup cost"](/cloud/manage/backups/overview#understanding-backup-cost) 섹션을 참조하십시오.
:::
