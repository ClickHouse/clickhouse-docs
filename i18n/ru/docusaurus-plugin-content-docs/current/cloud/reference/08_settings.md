---
'sidebar_label': 'Настройка параметров'
'slug': '/manage/settings'
'title': 'Настройка параметров'
'description': 'Как настроить параметры для вашего ClickHouse Cloud сервиса для конкретного
  пользователя или роли'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# Настройка параметров

Чтобы указать параметры для вашего сервиса ClickHouse Cloud для конкретного [пользователя](/operations/access-rights#user-account-management) или [роли](/operations/access-rights#role-management), вы должны использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management). Применение Профилей Настроек гарантирует, что настроенные вами параметры сохранятся, даже когда ваши сервисы останавливаются, находятся в простое или обновляются. Чтобы узнать больше о Профилях Настроек, пожалуйста, смотрите [эту страницу](/operations/settings/settings-profiles.md).

Обратите внимание, что профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files.md) в данный момент не поддерживаются для ClickHouse Cloud.

Чтобы узнать больше о параметрах, которые вы можете указать для вашего сервиса ClickHouse Cloud, пожалуйста, ознакомьтесь со всеми возможными параметрами по категориям в [нашей документации](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Боковая панель настроек облака" border/>