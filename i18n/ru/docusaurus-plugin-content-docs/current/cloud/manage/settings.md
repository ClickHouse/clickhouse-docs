---
sidebar_label: 'Конфигурация настроек'
slug: /manage/settings
title: 'Конфигурация настроек'
description: 'Как настроить параметры для вашего сервиса ClickHouse Cloud для конкретного пользователя или роли'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# Конфигурация настроек

Чтобы указать настройки для вашего сервиса ClickHouse Cloud для конкретного [пользователя](/operations/access-rights#user-account-management) или [роли](/operations/access-rights#role-management), вы должны использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management). Применение профилей настроек гарантирует, что настроенные вами параметры сохранятся, даже когда ваши сервисы остановлены, находятся в бездействии или обновляются. Чтобы узнать больше о профилях настроек, пожалуйста, посмотрите [эту страницу](/operations/settings/settings-profiles.md).

Обратите внимание, что профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files.md) в настоящее время не поддерживаются для ClickHouse Cloud.

Чтобы узнать больше о настройках, которые вы можете указать для вашего сервиса ClickHouse Cloud, пожалуйста, посмотрите все возможные настройки по категориям в [нашей документации](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Боковая панель настроек облака" border/>
