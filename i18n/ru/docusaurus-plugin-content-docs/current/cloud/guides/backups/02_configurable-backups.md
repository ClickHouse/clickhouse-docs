---
sidebar_label: 'Настройка расписаний резервного копирования'
slug: /cloud/manage/backups/configurable-backups
description: 'Руководство по настройке расписаний резервного копирования'
title: 'Настройка расписаний резервного копирования'
keywords: ['резервные копии', 'облачные резервные копии', 'восстановление']
doc_type: 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True" />

Чтобы настроить расписание резервного копирования для сервиса, перейдите на вкладку **Settings** в консоли и нажмите **Change backup configuration**.

<Image img={backup_settings} size="lg" alt="Configure backup settings" border />

Справа откроется вкладка, где вы можете выбрать значения для срока хранения, частоты и времени начала. Вам нужно будет сохранить выбранные настройки, чтобы они вступили в силу.

<Image img={backup_configuration_form} size="lg" alt="Select backup retention and frequency" border />

:::note
Время начала и частота взаимоисключающими. Время начала имеет приоритет.
:::

:::note
Изменение расписания резервного копирования может привести к увеличению ежемесячных затрат на хранилище, поскольку некоторые резервные копии могут не входить в набор резервных копий по умолчанию для сервиса. См. раздел [&quot;Understanding backup cost&quot;](/cloud/manage/backups/overview#understanding-backup-cost) ниже.
:::
