---
sidebar_label: 'Управление пользователями облака'
slug: /cloud/security/manage-cloud-users
title: 'Управление пользователями облака'
description: 'На этой странице описано, как администраторам добавлять и удалять пользователей, а также управлять их назначениями'
doc_type: 'guide'
keywords: ['пользователи облака', 'управление доступом', 'безопасность', 'права доступа', 'управление командой']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

Это руководство предназначено для пользователей с ролью Organization Admin (администратор организации) в ClickHouse Cloud.


## Добавление пользователей в организацию {#add-users}

### Приглашение пользователей {#invite-users}

Администраторы могут пригласить до трёх (3) пользователей одновременно и назначить роли на уровне организации и сервиса при отправке приглашения.

Чтобы пригласить пользователей:

1. Выберите название организации в левом нижнем углу
2. Нажмите `Users and roles`
3. Выберите `Invite members` в левом верхнем углу
4. Введите адреса электронной почты до 3 новых пользователей
5. Выберите роли организации и сервиса, которые будут назначены пользователям
6. Нажмите `Send invites`

Пользователи получат электронное письмо, с помощью которого смогут присоединиться к организации. Дополнительную информацию о принятии приглашений см. в разделе [Управление моей учётной записью](/cloud/security/manage-my-account).

### Добавление пользователей через провайдер идентификации SAML {#add-users-via-saml}

<EnterprisePlanFeatureBadge feature='SAML SSO' />

Если ваша организация настроена для [SAML SSO](/cloud/security/saml-setup), выполните следующие шаги для добавления пользователей в организацию.

1. Добавьте пользователей в ваше приложение SAML у провайдера идентификации. Пользователи не появятся в ClickHouse до первого входа в систему
2. При входе в ClickHouse Cloud пользователю автоматически будет назначена роль `Member`, которая позволяет только войти в систему и не предоставляет других прав доступа
3. Следуйте инструкциям в разделе `Manage user role assignments` ниже для предоставления разрешений

### Принудительное использование только SAML-аутентификации {#enforce-saml}

После того как в организации появится хотя бы один пользователь SAML с назначенной ролью Organization Admin, удалите из организации пользователей с другими методами аутентификации, чтобы обеспечить использование только SAML-аутентификации для организации.


## Управление назначением ролей пользователей {#manage-role-assignments}

Пользователи с ролью администратора организации могут в любое время изменять разрешения для других пользователей.

<VerticalStepper headerLevel="h3">

### Доступ к настройкам организации {#access-organization-settings}

На странице сервисов выберите название вашей организации:

<Image img={step_1} size='md' />

### Доступ к пользователям и ролям {#access-users-and-roles}

Выберите пункт меню `Users and roles` во всплывающем меню.

<Image img={step_2} size='md' />

### Выбор пользователя для изменения {#select-user-to-update}

Выберите пункт меню в конце строки для пользователя, права доступа которого вы хотите изменить:

<Image img={step_3} size='lg' />

### Выберите `edit` {#select-edit}

<Image img={step_4} size='lg' />

Справа на странице отобразится панель:

<Image img={step_5} size='lg' />

### Изменение разрешений {#update-permissions}

Выберите пункты выпадающего меню для настройки разрешений доступа ко всей консоли и функций, доступных пользователю в консоли ClickHouse. Список ролей и связанных с ними разрешений см. в разделе [Console roles and permissions](/cloud/security/console-roles).

Выберите пункты выпадающего меню для настройки области доступа сервисной роли выбранного пользователя. При выборе `Specific services` вы можете управлять ролью пользователя для каждого сервиса.

<Image img={step_6} size='md' />

### Сохранение изменений {#save-changes}

Сохраните изменения с помощью кнопки `Save changes` в нижней части панели:

<Image img={step_7} size='md' />

</VerticalStepper>


## Удаление пользователя {#remove-user}

:::note Удаление пользователей SAML
Пользователи SAML, у которых был отозван доступ к приложению ClickHouse в вашем провайдере идентификации, не смогут войти в ClickHouse Cloud. Учетная запись не удаляется из консоли автоматически и должна быть удалена вручную.
:::

Чтобы удалить пользователя, выполните следующие действия:

1. Выберите название организации в левом нижнем углу
2. Нажмите `Users and roles`
3. Нажмите на три точки рядом с именем пользователя и выберите `Remove`
4. Подтвердите действие, нажав кнопку `Remove user`
