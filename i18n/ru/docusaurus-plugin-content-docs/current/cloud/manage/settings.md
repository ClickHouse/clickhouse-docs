---
sidebar_label: 'Настройка параметров'
slug: /manage/settings
title: 'Настройка параметров'
description: 'Как настроить параметры для вашего сервиса ClickHouse Cloud для конкретного пользователя или роли'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# Настройка параметров

Чтобы указать параметры для вашего сервиса ClickHouse Cloud для конкретного [пользователя](/operations/access-rights#user-account-management) или [роли](/operations/access-rights#role-management), вы должны использовать [Профили настроек на основе SQL](/operations/access-rights#settings-profiles-management). Применение Профилей настроек гарантирует, что заданные вами параметры сохранятся, даже если ваши сервисы остановятся, будут бездействовать или обновляться. Чтобы узнать больше о Профилях настроек, пожалуйста, смотрите [эту страницу](/operations/settings/settings-profiles.md).

Обратите внимание, что Профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files.md) в настоящее время не поддерживаются для ClickHouse Cloud.

Чтобы узнать больше о параметрах, которые вы можете указать для вашего сервиса ClickHouse Cloud, пожалуйста, смотрите все возможные параметры по категориям в [нашей документации](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Боковая панель настроек облака" border/>
