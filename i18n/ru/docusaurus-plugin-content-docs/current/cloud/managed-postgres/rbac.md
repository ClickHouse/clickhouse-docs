---
slug: /cloud/managed-postgres/rbac
sidebar_label: 'RBAC'
title: 'Ролевое управление доступом в Managed Postgres'
description: 'Узнайте о ролевом управлении доступом (RBAC) в ClickHouse Managed Postgres'
keywords: ['Managed Postgres RBAC', 'управление доступом', 'роли', 'привилегии', 'разрешения']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import usersAndRoles from '@site/static/images/managed-postgres/rbac/usersandroles.png';
import postgresEntity from '@site/static/images/managed-postgres/rbac/postgresentity.png';
import newPostgresPerms from '@site/static/images/managed-postgres/rbac/newpostgresperms.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.rbac-beta" />

ClickHouse Cloud поддерживает ролевое управление доступом (RBAC) для сервисов Managed Postgres. Вы можете создавать пользовательские роли с определёнными разрешениями и назначать их участникам организации, чтобы определять, кто может просматривать сервисы Postgres и управлять ими.

## Доступные разрешения \{#available-permissions\}

Managed Postgres в настоящее время поддерживает два разрешения:

| Разрешение                        | Описание                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------ |
| **Просмотр сервисов Postgres**    | Позволяет пользователю видеть сервис Postgres и сведения о нём.                |
| **Управление сервисами Postgres** | Позволяет пользователю изменять, масштабировать и настраивать сервис Postgres. |

Для создания нового сервиса Postgres требуется уже имеющееся разрешение **Organization manage**. Указанные выше разрешения применяются только к существующим сервисам.

:::note
Более детальные разрешения станут доступны в одном из будущих релизов.
:::

## Создание пользовательской роли \{#creating-a-custom-role\}

1. Нажмите на название своей организации на левой панели и выберите **Пользователи и роли**.

<Image img={usersAndRoles} alt="Меню 'Пользователи и роли'" size="md" border />

2. Перейдите на вкладку **Roles** и нажмите **Создать роль**.
3. Введите имя роли, затем нажмите **+ Allow** и выберите **Сервис Postgres** из списка сущностей.

<Image img={postgresEntity} alt="Выбор сущности 'Сервис Postgres'" size="md" border />

4. Выберите сервис Postgres, для которого будет действовать роль, затем выберите разрешения, которые нужно выдать.

<Image img={newPostgresPerms} alt="Настройка разрешений Postgres для роли" size="md" border />

5. Нажмите **Создать роль**, чтобы сохранить изменения.

## Назначение роли \{#assigning-a-role\}

После создания роли назначьте её пользователям на вкладке **Пользователи** на той же странице **Пользователи и роли**. У пользователя может быть несколько ролей, и их можно комбинировать, чтобы получить именно тот профиль доступа, который вам нужен.