---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: 'Управление назначениями ролей в SQL-консоли'
title: 'Управление назначениями ролей в SQL-консоли'
description: 'Руководство по управлению назначениями ролей в SQL-консоли'
doc_type: 'guide'
keywords: ['sql console', 'role assignments', 'access management', 'permissions', 'security']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# Настройка назначения ролей в SQL-консоли

> Это руководство показывает, как настроить назначение ролей в SQL-консоли, которые
> определяют права доступа на уровне консоли и функции, доступные пользователю
> в консоли Cloud.

<VerticalStepper headerLevel="h3">

### Доступ к настройкам сервиса {#access-service-settings}

На странице сервисов нажмите на меню в правом верхнем углу сервиса, для которого необходимо настроить параметры доступа к SQL-консоли.

<Image img={step_1} size='lg' />

Выберите `settings` из всплывающего меню.

<Image img={step_2} size='lg' />

### Настройка доступа к SQL-консоли {#adjust-sql-console-access}

В разделе «Security» найдите область «SQL console access»:

<Image img={step_3} size='md' />

### Обновление настроек для Service Admin {#update-settings-for-service-admin}

Выберите выпадающее меню для Service Admin, чтобы изменить настройки управления доступом для ролей Service Admin:

<Image img={step_4} size='md' />

Вы можете выбрать одну из следующих ролей:

| Роль          |
| ------------- |
| `No access`   |
| `Read only`   |
| `Full access` |

### Обновление настроек для Service Read Only {#update-settings-for-service-read-only}

Выберите выпадающее меню для Service Read Only, чтобы изменить настройки управления доступом для ролей Service Read Only:

<Image img={step_5} size='md' />

Вы можете выбрать одну из следующих ролей:

| Роль          |
| ------------- |
| `No access`   |
| `Read only`   |
| `Full access` |

### Просмотр пользователей с доступом {#review-users-with-access}

Обзор пользователей сервиса можно просмотреть, нажав на количество пользователей:

<Image img={step_6} size='md' />

Справа от страницы откроется вкладка с общим количеством пользователей и их ролями:

<Image img={step_7} size='md' />

</VerticalStepper>
