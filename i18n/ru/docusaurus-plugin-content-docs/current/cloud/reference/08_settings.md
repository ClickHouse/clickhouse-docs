---
sidebar_label: 'Настройка параметров'
slug: /manage/settings
title: 'Настройка параметров'
description: 'Как настроить параметры сервиса ClickHouse Cloud для конкретного пользователя или роли'
keywords: ['ClickHouse Cloud', 'настройка параметров', 'параметры облака', 'параметры пользователя', 'параметры роли']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';

# Настройка параметров \{#configuring-settings\}

Чтобы задать настройки для сервиса ClickHouse Cloud для конкретного [пользователя](/operations/access-rights#user-account-management) или [роли](/operations/access-rights#role-management), необходимо использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management). Применение профилей настроек гарантирует, что настроенные вами параметры сохранятся, даже когда ваши сервисы останавливаются, простаивают или обновляются. Чтобы узнать больше о профилях настроек, см. [эту страницу](/operations/settings/settings-profiles.md).

Обратите внимание, что профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files.md) в настоящее время не поддерживаются для ClickHouse Cloud.

Чтобы узнать больше о параметрах, которые вы можете задать для сервиса ClickHouse Cloud, ознакомьтесь со всеми возможными настройками по категориям в [нашей документации](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Боковая панель настроек Cloud" border />