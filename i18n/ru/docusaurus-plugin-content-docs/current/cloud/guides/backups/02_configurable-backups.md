---
sidebar_label: 'Настройка расписаний резервного копирования'
slug: /cloud/manage/backups/configurable-backups
description: 'Руководство по настройке расписаний резервного копирования'
title: 'Настройка расписаний резервного копирования'
keywords: ['backups', 'cloud backups', 'restore']
doc_type: 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True" />

Чтобы настроить расписание резервного копирования для сервиса, перейдите на вкладку **Settings** в консоли и нажмите **Change backup configuration**.

<Image img={backup_settings} size="lg" alt="Настройка параметров резервного копирования" border />

Справа откроется вкладка, где вы сможете задать значения для периода хранения, частоты и времени начала. Чтобы изменения вступили в силу, необходимо сохранить выбранные настройки.

<Image img={backup_configuration_form} size="lg" alt="Выбор периода хранения и частоты резервного копирования" border />

:::note
Время начала и частота взаимоисключают друг друга. Приоритет имеет время начала.
:::

:::note
Изменение расписания резервного копирования может привести к увеличению ежемесячных расходов на хранилище, так как часть резервных копий может не входить в стандартные резервные копии для сервиса. См. раздел [&quot;Понимание стоимости резервного копирования&quot;](/cloud/manage/backups/overview#understanding-backup-cost) ниже.
:::
