---
'sidebar_label': 'Приглашение новых пользователей'
'slug': '/cloud/security/inviting-new-users'
'title': 'Приглашение новых пользователей'
'description': 'Эта страница описывает, как администраторы могут приглашать новых
  пользователей в свою организацию и назначать им роли'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import users_and_roles from '@site/static/images/cloud/security/users_and_roles.png';
import invite_user from '@site/static/images/cloud/security/invite-user.png';

Администраторы могут приглашать других в организацию, назначая им роль `Developer`, `Admin` или `Billing Admin`.

:::note
Администраторы и разработчики отличаются от пользователей баз данных. Чтобы создать пользователей баз данных и роли, пожалуйста, используйте SQL консоль. Чтобы узнать больше, посетите нашу документацию о [Пользователях и ролях](/cloud/security/cloud-access-management).
:::

Чтобы пригласить пользователя, выберите организацию и нажмите `Users and roles`:

<Image img={users_and_roles} size="md" alt="Страница пользователей и ролей ClickHouse Cloud" />

<br />

Выберите `Invite members` и введите адрес электронной почты до 3 новых пользователей сразу, выбирая роль для каждого.

<Image img={invite_user} size="md" alt="Страница приглашения пользователя ClickHouse Cloud" />

<br />

Нажмите `Send invites`. Пользователи получат электронное письмо, из которого они смогут присоединиться к организации.