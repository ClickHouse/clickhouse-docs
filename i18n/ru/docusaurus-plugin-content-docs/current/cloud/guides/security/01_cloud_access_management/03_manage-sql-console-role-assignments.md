---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: 'Управление назначениями ролей в SQL-консоли'
title: 'Управление назначениями ролей в SQL-консоли'
description: 'Руководство по управлению назначениями ролей в SQL-консоли'
doc_type: 'guide'
keywords: ['SQL-консоль', 'назначения ролей', 'управление доступом', 'разрешения', 'безопасность']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# Настройка назначений ролей для SQL-консоли

> В этом руководстве описано, как настроить назначения ролей для SQL-консоли, которые определяют глобальные права доступа к консоли и функции, доступные пользователю в консоли Cloud.

<VerticalStepper headerLevel="h3">

### Доступ к настройкам сервиса {#access-service-settings}

На странице сервисов нажмите на меню в правом верхнем углу карточки того сервиса, для которого вы хотите изменить настройки доступа к SQL-консоли.

<Image img={step_1} size="lg"/>

Выберите `settings` во всплывающем меню.

<Image img={step_2} size="lg"/>

### Настройка доступа к SQL-консоли {#adjust-sql-console-access}

В разделе `Security` найдите область `SQL console access`:

<Image img={step_3} size="md"/>

### Обновление настроек для Service Admin {#update-settings-for-service-admin}

Выберите раскрывающееся меню для `Service Admin`, чтобы изменить настройки контроля доступа для ролей `Service Admin`:

<Image img={step_4} size="md"/>

Вы можете выбрать одну из следующих ролей:

| Роль          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### Обновление настроек для Service Read Only {#update-settings-for-service-read-only}

Выберите раскрывающееся меню для `Service Read Only`, чтобы изменить настройки контроля доступа для ролей `Service Read Only`:

<Image img={step_5} size="md"/>

Вы можете выбрать одну из следующих ролей:

| Роль          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### Просмотр пользователей с доступом {#review-users-with-access}

Обзор пользователей для сервиса можно открыть, нажав на счётчик пользователей:

<Image img={step_6} size="md"/>

Справа от страницы откроется вкладка, на которой показано общее количество пользователей и их роли:

<Image img={step_7} size="md"/>

</VerticalStepper>
