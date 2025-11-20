---
sidebar_label: 'Настройка параметров'
slug: /manage/settings
title: 'Настройка параметров'
description: 'Как настроить параметры сервиса ClickHouse Cloud для конкретного пользователя или роли'
keywords: ['ClickHouse Cloud', 'settings configuration', 'cloud settings', 'user settings', 'role settings']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# Настройка параметров

Чтобы задать параметры для сервиса ClickHouse Cloud для конкретного [пользователя](/operations/access-rights#user-account-management) или [роли](/operations/access-rights#role-management), необходимо использовать [SQL‑управляемые профили настроек](/operations/access-rights#settings-profiles-management). Применение профилей настроек гарантирует сохранение заданных параметров даже при остановке, простое и обновлении сервисов. Подробнее о профилях настроек см. [на этой странице](/operations/settings/settings-profiles.md).

Обратите внимание, что XML‑основанные профили настроек и [файлы конфигурации](/operations/configuration-files.md) в настоящее время не поддерживаются в ClickHouse Cloud.

Чтобы узнать больше о параметрах, которые можно задать для сервиса ClickHouse Cloud, ознакомьтесь со всеми доступными параметрами по категориям в [нашей документации](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Боковая панель настроек Cloud" border/>