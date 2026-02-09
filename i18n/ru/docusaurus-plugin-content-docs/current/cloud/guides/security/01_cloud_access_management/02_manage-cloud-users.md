---
sidebar_label: 'Управление пользователями облака'
slug: /cloud/security/manage-cloud-users
title: 'Управление пользователями облака'
description: 'На этой странице описывается, как администраторам добавлять пользователей, управлять назначениями и удалять их'
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

Это руководство предназначено для пользователей с ролью Organization Admin в ClickHouse Cloud.


## Добавление пользователей в организацию \{#add-users\}

### Приглашение пользователей \{#invite-users\}

Администраторы могут приглашать до трёх (3) пользователей одновременно и назначать им роли уровня организации и сервиса в момент приглашения. 

Чтобы пригласить пользователей:
1. Выберите название организации в левом нижнем углу
2. Нажмите `Users and roles`
3. Выберите `Invite members` в левом верхнем углу
4. Введите адреса электронной почты (до трёх) новых пользователей
5. Выберите роли уровня организации и сервиса, которые будут назначены пользователям
6. Нажмите `Send invites`

Пользователи получат электронное письмо, из которого они смогут присоединиться к организации. Дополнительные сведения о принятии приглашений см. в разделе [Управление учётной записью](/cloud/security/manage-my-account).

### Добавление пользователей через поставщика удостоверений SAML \{#add-users-via-saml\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

Если ваша организация настроена для [SAML SSO](/cloud/security/saml-setup), выполните следующие шаги, чтобы добавить пользователей в организацию.

1. Добавьте пользователей в приложение SAML у вашего поставщика удостоверений; пользователи не появятся в ClickHouse, пока не выполнят хотя бы один вход
2. Когда пользователь входит в ClickHouse Cloud, ему автоматически назначается роль `Member`, которая позволяет только вход в систему и не предоставляет никаких других прав доступа
3. Чтобы предоставить разрешения, выполните инструкции в разделе `Manage user role assignments` ниже

### Принудительное использование аутентификации только через SAML \{#enforce-saml\}

После того как в организации будет как минимум один пользователь SAML с ролью Organization Admin, удалите из организации пользователей, использующих другие методы аутентификации, чтобы обеспечить использование в организации только аутентификации SAML.



## Управление назначениями ролей пользователей \{#manage-role-assignments\}

Пользователи с ролью Organization Admin могут в любое время обновлять разрешения для других пользователей.

<VerticalStepper headerLevel="h3">

### Доступ к настройкам организации \{#access-organization-settings\}

На странице сервисов выберите название вашей организации:

<Image img={step_1} size="md"/>

### Доступ к пользователям и ролям \{#access-users-and-roles\}

Выберите пункт `Users and roles` во всплывающем меню.

<Image img={step_2} size="md"/>

### Выбор пользователя для обновления \{#select-user-to-update\}

Выберите пункт меню в конце строки пользователя, для которого вы хотите изменить доступ:

<Image img={step_3} size="lg"/>

### Выберите `edit` \{#select-edit\}

<Image img={step_4} size="lg"/>

Справа на странице отобразится вкладка:

<Image img={step_5} size="lg"/>

### Обновление разрешений \{#update-permissions\}

Выберите значения в раскрывающихся списках, чтобы настроить глобальные разрешения доступа к консоли и указать, к каким функциям пользователь может получать доступ из консоли ClickHouse. Список ролей и связанных с ними разрешений см. в разделе [Console roles and permissions](/cloud/security/console-roles).

Выберите значения в раскрывающихся списках, чтобы настроить область доступа сервисной роли выбранного пользователя. При выборе `Specific services` вы можете управлять ролью пользователя для каждого сервиса.

<Image img={step_6} size="md"/>

### Сохранение изменений \{#save-changes\}

Сохраните изменения с помощью кнопки `Save changes` внизу вкладки:

<Image img={step_7} size="md"/>

</VerticalStepper>



## Удаление пользователя \{#remove-user\}
:::note Удаление пользователей SAML
Пользователи SAML, для которых в вашем провайдере идентификации была отменена привязка к приложению ClickHouse, не могут войти в ClickHouse Cloud. При этом учетная запись не удаляется из консоли и должна быть удалена вручную.
:::

Выполните следующие шаги, чтобы удалить пользователя. 

1. Выберите имя организации в левом нижнем углу консоли
2. Нажмите `Users and roles`
3. Нажмите на три точки рядом с именем пользователя и выберите `Remove`
4. Подтвердите действие, нажав кнопку `Remove user`
