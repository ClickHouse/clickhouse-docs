sidebar_label: 'Приглашение новых пользователей'
slug: /cloud/security/inviting-new-users
title: 'Приглашение новых пользователей'
```

import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

Администраторы могут приглашать других в организацию, назначая им роли `Developer`, `Admin` или `Billing Admin`.

:::note
Администраторы и разработчики отличаются от пользователей базы данных. Чтобы создать пользователей баз данных и роли, используйте SQL-консоль. Чтобы узнать больше, посетите нашу документацию о [Пользователях и ролях](/cloud/security/cloud-access-management).
:::

Чтобы пригласить пользователя, выберите организацию и нажмите `Users and roles`:

<img src={users_and_roles} alt="Страница пользователей и ролей ClickHouse Cloud" style={{width: '300px'}} />

<br />

Выберите `Invite members` и введите адрес электронной почты до 3 новых пользователей одновременно, выбрав для каждого роль.

<img src={invite_user} alt="Страница приглашения пользователя ClickHouse Cloud" style={{width: '1000px'}} />

<br />

Нажмите `Send invites`. Пользователи получат электронное письмо, из которого они могут присоединиться к организации.
