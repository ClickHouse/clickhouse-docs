---
sidebar_label: 'Управление API-ключами'
slug: /cloud/manage/openapi
title: 'Управление API-ключами'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';


# Управление API-ключами

ClickHouse Cloud предоставляет API, использующее OpenAPI, которое позволяет вам программно управлять вашей учетной записью и аспектами ваших услуг.

:::note
В этом документе рассматривается API ClickHouse Cloud. Для конечных точек API базы данных, пожалуйста, смотрите [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)
:::

1. Вы можете использовать вкладку **API Keys** в левом меню для создания и управления вашими API-ключами.

  <img src={image_01} width="50%"/>

2. Страница **API Keys** изначально отобразит подсказку для создания вашего первого API-ключа, как показано ниже. После создания вашего первого ключа, вы сможете создавать новые ключи, используя кнопку `New API Key`, которая появится в правом верхнем углу.

  <img src={image_02} width="100%"/>
  
3. Чтобы создать API-ключ, укажите имя ключа, права доступа для ключа и время истечения, затем нажмите `Generate API Key`.
<br/>
:::note
Права доступа соответствуют [предопределенным ролям](/cloud/security/cloud-access-management/overview#predefined-roles) ClickHouse Cloud. Роль разработчика имеет права только на чтение, а роль администратора имеет полномочия на полный доступ для чтения и записи.
:::

  <img src={image_03} width="100%"/>

4. На следующем экране отобразятся ваш Идентификатор ключа и Секрет ключа. Скопируйте эти значения и сохраните их в безопасном месте, например, в хранилище. Значения не будут показаны после того, как вы покинете этот экран.

  <img src={image_04} width="100%"/>

5. API ClickHouse Cloud использует [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) для проверки подлинности ваших API-ключей. Вот пример того, как использовать ваши API-ключи для отправки запросов к API ClickHouse Cloud с помощью `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Вернувшись на страницу **API Keys**, вы увидите имя ключа, последние четыре символа Идентификатора ключа, права доступа, статус, дату истечения и создателя. Вы можете редактировать имя ключа, права доступа и время истечения с этого экрана. Ключи также могут быть отключены или удалены с этого экрана.
<br/>
:::note
Удаление API-ключа — это необратимое действие. Любые услуги, использующие ключ, немедленно потеряют доступ к ClickHouse Cloud.
:::

  <img src={image_05} width="100%"/>

## Endpoints {#endpoints}

[Документация по конечным точкам находится здесь](/cloud/manage/api/invitations-api-reference.md). Используйте ваш API Key и API Secret с базовым URL `https://api.clickhouse.cloud/v1`.
