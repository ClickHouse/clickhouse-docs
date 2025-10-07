---
'slug': '/cloud/guides/sql-console/config-sql-console-role-assignments'
'sidebar_label': 'Настройка назначений ролей консоли SQL'
'title': 'Настройка назначений ролей консоли SQL'
'description': 'Руководство, показывающее, как настраивать назначения ролей консоли
  SQL'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# Настройка назначений ролей SQL консоли

> В этом руководстве показано, как настраивать назначения ролей SQL консоли, которые определяют разрешения доступа по всей консоли и функции, к которым пользователь может получить доступ в облачной консоли.

<VerticalStepper>

## Настройки доступа к сервису {#access-service-settings}

На странице сервисов нажмите на меню в правом верхнем углу сервиса, для которого вы хотите изменить настройки доступа к SQL консоли.

<Image img={step_1} size="lg"/>

Выберите `settings` из всплывающего меню.

<Image img={step_2} size="lg"/>

## Настройка доступа к SQL консоли {#adjust-sql-console-access}

В разделе "Безопасность" найдите область "Доступ к SQL консоли":

<Image img={step_3} size="md"/>

Выберите выпадающее меню для роли Service Admin, чтобы изменить настройки контроля доступа для ролей Service Admin:

<Image img={step_4} size="md"/>

Вы можете выбрать из следующих ролей:

| Роль          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

Выберите выпадающее меню для роли Service Read Only, чтобы изменить настройки контроля доступа для ролей Service Read Only:

<Image img={step_5} size="md"/>

Вы можете выбрать из следующих ролей:

| Роль          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

Обзор пользователей для сервиса можно увидеть, выбрав количество пользователей:

<Image img={step_6} size="md"/>

Откроется вкладка справа от страницы, показывающая общее количество пользователей и их роли:

<Image img={step_7} size="md"/>

</VerticalStepper>