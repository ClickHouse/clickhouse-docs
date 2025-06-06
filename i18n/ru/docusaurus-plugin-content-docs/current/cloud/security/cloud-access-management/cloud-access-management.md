---
sidebar_label: 'Обзор'
slug: /cloud/security/cloud-access-management/overview
title: 'Управление доступом в облаке'
description: 'Описывает, как работает контроль доступа в ClickHouse Cloud, включая информацию о типах ролей'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';


# Контроль доступа в ClickHouse Cloud {#access-control-in-clickhouse-cloud}
ClickHouse управляет доступом пользователей в двух местах: через консоль и через базу данных. Доступ к консоли управляется через пользовательский интерфейс clickhouse.cloud. Доступ к базе данных управляется через учетные записи пользователей базы данных и роли. Кроме того, пользователям консоли могут быть предоставлены роли в базе данных, которые позволяют пользователю консоли взаимодействовать с базой данных через нашу SQL консоль.

## Пользователи консоли и роли {#console-users-and-roles}
Настройте назначения ролей Организации и Сервиса на странице Консоли > Пользователи и роли. Настройте назначения ролей SQL консоли на странице настроек для каждого сервиса.

Пользователи должны быть назначены на роль уровня организации и могут дополнительно назначаться на сервисные роли для одного или нескольких сервисов. Сервисные роли могут быть дополнительно настроены для доступа пользователей к SQL консоли на странице настроек сервиса.
- Пользователи, назначенные на роль Администратора Организации, по умолчанию получают роль Администратора Сервиса.
- Пользователи, добавленные в организацию через интеграцию SAML, автоматически получают роль Члена.
- Администратору Сервиса по умолчанию назначается роль администратора SQL консоли. Права доступа к SQL консоли могут быть удалены на странице настроек сервиса.

| Контекст      | Роль                   | Описание                                      |
|:-------------|:-----------------------|:-------------------------------------------------|
| Организация | Администратор          | Выполнять все административные действия для организации и контролировать все настройки. Присваивается первому пользователю в организации по умолчанию. |
| Организация | Разработчик           | Видеть доступ ко всему, кроме Сервисов, возможность генерировать ключи API только для чтения. |
| Организация | Биллинг               | Видеть использование и счета, а также управлять методами оплаты. |
| Организация | Член                  | Только вход с возможностью управлять настройками личного профиля. Присваивается пользователям SAML SSO по умолчанию. |
| Сервис      | Администратор Сервиса | Управлять настройками сервиса.                        |
| Сервис      | Только для чтения     | Видеть сервисы и настройки.                     |
| SQL консоль | Администратор SQL консоли | Административный доступ к базам данных в рамках сервиса, эквивалентный роли по умолчанию для базы данных. |
| SQL консоль | Только для чтения SQL консоли | Доступ только для чтения к базам данных в рамках сервиса |
| SQL консоль | Пользовательская       | Настроить с использованием SQL [`GRANT`](/sql-reference/statements/grant) заявления; назначить роль пользователю SQL консоли, назвав роль в честь пользователя |

Чтобы создать пользовательскую роль для пользователя SQL консоли и предоставить ей общую роль, выполните следующие команды. Адрес электронной почты должен совпадать с адресом электронной почты пользователя в консоли.

1. Создайте роль database_developer и предоставьте разрешения `SHOW`, `CREATE`, `ALTER` и `DELETE`.

    ```sql
    CREATE ROLE OR REPLACE database_developer;
    GRANT SHOW ON * TO database_developer;
    GRANT CREATE ON * TO database_developer;
    GRANT ALTER ON * TO database_developer;
    GRANT DELETE ON * TO database_developer;
    ```

2. Создайте роль для пользователя SQL консоли my.user@domain.com и назначьте ей роль database_developer.

    ```sql
    CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
    GRANT database_developer TO `sql-console-role:my.user@domain.com`;
    ```

### Безпарольная аутентификация в SQL консоли {#sql-console-passwordless-authentication}
Пользователи SQL консоли создаются для каждой сессии и аутентифицируются с использованием сертификатов X.509, которые автоматически вращаются. Пользователь удаляется при завершении сессии. При создании списков доступа для аудитов перейдите на вкладку Настройки для сервиса в консоли и обратите внимание на доступ к SQL консоли, в дополнение к пользователям базы данных, которые существуют в базе данных. Если настроены пользовательские роли, доступ пользователя будет указан в роли, заканчивающейся именем пользователя.

## Права доступа к базе данных {#database-permissions}
Настройте следующее в сервисах и базах данных с использованием SQL [GRANT](/sql-reference/statements/grant) заявления.

| Роль                  | Описание                                                                   |
|:----------------------|:------------------------------------------------------------------------------|
| По умолчанию          | Полный административный доступ к сервисам                                        |
| Пользовательская      | Настроить с использованием SQL [`GRANT`](/sql-reference/statements/grant) заявления |

- Роли базы данных являются аддитивными. Это означает, что если пользователь состоит в двух ролях, у пользователя будет максимальный доступ, предоставленный двум ролям. Они не теряют доступ, добавляя роли.
- Роли базы данных могут быть предоставлены другим ролям, в результате чего возникает иерархическая структура. Роли наследуют все права доступа ролей, членом которых они являются.
- Роли базы данных уникальны для каждого сервиса и могут применяться к нескольким базам данных в рамках одного и того же сервиса.

Иллюстрация ниже показывает различные способы, которыми пользователю могут быть предоставлены права доступа.

<Image img={user_grant_permissions_options} alt='Иллюстрация, показывающая различные способы, которыми пользователю могут быть предоставлены права доступа' size="md" background="black"/>

### Начальные настройки {#initial-settings} 
Базы данных имеют учетную запись с именем `default`, которая автоматически добавляется и получает роль default_role при создании сервиса. Пользователь, который создает сервис, получает автоматически сгенерированный, случайный пароль, который присваивается учетной записи `default`, когда сервис создается. Пароль не отображается после первоначальной настройки, но может быть изменен любым пользователем с разрешениями Администратора Сервиса в консоли позже. Эта учетная запись или учетная запись с привилегиями Администратора Сервиса в консоли могут настраивать дополнительные пользователи базы данных и роли в любое время.

:::note
Чтобы изменить пароль, назначенный учетной записи `default` в консоли, перейдите в меню Сервисы слева, выберите сервис, перейдите на вкладку Настройки и нажмите кнопку Сбросить пароль.
:::

Рекомендуем создать новую учетную запись пользователя, связанную с конкретным человеком, и предоставить пользователю роль default_role. Это позволит идентифицировать действия, выполняемые пользователями, по их идентификаторам пользователей, а учетная запись `default` оставить для экстренных действий.

  ```sql
  CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
  GRANT default_role to userID;
  ```

Пользователи могут использовать генератор SHA256 или кодовую функцию, такую как `hashlib` в Python, чтобы преобразовать пароль длиной более 12 символов с соответствующей сложностью в строку SHA256, которую следует предоставить системному администратору в качестве пароля. Это гарантирует, что администратор не увидит и не обработает пароли в открытом виде.

### Списки доступа к базе данных для пользователей SQL консоли {#database-access-listings-with-sql-console-users}
Следующий процесс можно использовать для генерации полного списка доступа через SQL консоль и базы данных в вашей организации.

1. Выполните следующие запросы, чтобы получить список всех предоставленных прав в базе данных. 

    ```sql
    SELECT grants.user_name,
      grants.role_name,
      users.name AS role_member,
      grants.access_type,
      grants.database,
      grants.table
    FROM system.grants LEFT OUTER JOIN system.role_grants ON grants.role_name = role_grants.granted_role_name
      LEFT OUTER JOIN system.users ON role_grants.user_name = users.name
    
    UNION ALL
    
    SELECT grants.user_name,
      grants.role_name,
      role_grants.role_name AS role_member,
      grants.access_type,
      grants.database,
      grants.table
    FROM system.role_grants LEFT OUTER JOIN system.grants ON role_grants.granted_role_name = grants.role_name
    WHERE role_grants.user_name is null;
    ```

2. Свяжите этот список с пользователями консоли, имеющими доступ к SQL консоли.
   
    a. Перейдите в Консоль.

    b. Выберите соответствующий сервис.

    c. Выберите Настройки слева.

    d. Прокрутите вниз до раздела доступа к SQL консоли.

    e. Щелкните по ссылке для количества пользователей с доступом к базе данных `There are # users with access to this service.`, чтобы увидеть список пользователей.
