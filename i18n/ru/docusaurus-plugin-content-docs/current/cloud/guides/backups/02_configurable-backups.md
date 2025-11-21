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

<Image img={backup_settings} size="lg" alt="Настройка параметров резервного копирования" border />

Справа откроется панель, где вы сможете выбрать значения для периода хранения, частоты и времени начала. Для применения настроек необходимо их сохранить.

<Image img={backup_configuration_form} size="lg" alt="Выбор периода хранения и частоты резервного копирования" border />

:::note
Параметры времени начала и частоты являются взаимоисключающими. Время начала имеет приоритет.
:::

:::note
Изменение расписания резервного копирования может привести к увеличению ежемесячных расходов на хранилище, так как часть резервных копий может не подпадать под действие резервных копий по умолчанию для сервиса. См. раздел [«Понимание стоимости резервного копирования»](/cloud/manage/backups/overview#understanding-backup-cost) ниже.
:::
