---
sidebar_label: 'Приглашение новых пользователей'
slug: /cloud/security/inviting-new-users
title: 'Приглашение новых пользователей'
description: 'Эта страница описывает, как администраторы могут приглашать новых пользователей в свою организацию и назначать им роли'
---

import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

Администраторы могут приглашать других в организацию, назначая им роли `Developer`, `Admin` или `Billing Admin`.

:::note
Администраторы и разработчики отличаются от пользователей базы данных. Чтобы создать пользователей базы данных и роли, пожалуйста, используйте SQL консоль. Чтобы узнать больше, посетите нашу документацию о [Пользователях и ролях](/cloud/security/cloud-access-management).
:::

Чтобы пригласить пользователя, выберите организацию и нажмите `Пользователи и роли`:

<Image img={users_and_roles} size="md" alt="Страница пользователей и ролей ClickHouse Cloud" />

<br />

Выберите `Пригласить участников` и введите адрес электронной почты до 3 новых пользователей сразу, выбирая роль для каждого.

<Image img={invite_user} size="md" alt="Страница приглашения пользователя ClickHouse Cloud" />

<br />

Нажмите `Отправить приглашения`. Пользователи получат письмо, из которого смогут присоединиться к организации.
