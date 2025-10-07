---
'sidebar_label': 'Управление API ключами'
'slug': '/cloud/manage/openapi'
'title': 'Управление API ключами'
'description': 'ClickHouse Cloud предоставляет API, использующий OpenAPI, который
  позволяет вам программно управлять вашей учетной записью и аспектами ваших услуг.'
'doc_type': 'guide'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# Управление ключами API

ClickHouse Cloud предоставляет API с использованием OpenAPI, который позволяет вам программно управлять своей учетной записью и аспектами ваших услуг.

:::note
Этот документ охватывает API ClickHouse Cloud. Для конечных точек API базы данных смотрите [Cloud Endpoints API](/cloud/get-started/query-endpoints)
:::

1. Вы можете использовать вкладку **API Keys** в левом меню для создания и управления вашими ключами API.

  <Image img={image_01} size="sm" alt="Вкладка API Keys" border/>

2. На странице **API Keys** изначально отобразится приглашение создать ваш первый ключ API, как показано ниже. После создания вашего первого ключа вы можете создавать новые ключи с помощью кнопки `New API Key`, которая появится в правом верхнем углу.

  <Image img={image_02} size="md" alt="Страница API Keys" border/>
  
3. Чтобы создать ключ API, укажите имя ключа, права доступа для ключа и срок действия, затем нажмите `Generate API Key`.
<br/>
:::note
Права доступа соответствуют [предопределенным ролям](/cloud/security/cloud-access-management/overview#console-users-and-roles) ClickHouse Cloud. Роль разработчика имеет только права на чтение для назначенных услуг, а роль администратора имеет полные права на чтение и запись.
:::

  <Image img={image_03} size="md" alt="Форма создания ключа API" border/>

4. На следующем экране будут отображены ваш идентификатор ключа и секретный ключ. Скопируйте эти значения и сохраните их в безопасном месте, таком как хранилище. Значения не будут отображаться после того, как вы покинете этот экран.

  <Image img={image_04} size="md" alt="Детали ключа API" border/>

5. API ClickHouse Cloud использует [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) для проверки действительности ваших ключей API. Вот пример использования ваших ключей API для отправки запросов к API ClickHouse Cloud с помощью `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Вернувшись на страницу **API Keys**, вы увидите имя ключа, последние четыре символа идентификатора ключа, права доступа, статус, дату окончания действия и создателя. Вы можете редактировать имя ключа, права доступа и срок действия с этого экрана. Ключи также могут быть отключены или удалены с этого экрана.
<br/>
:::note
Удаление ключа API — это постоянное действие. Все услуги, использующие ключ, немедленно потеряют доступ к ClickHouse Cloud.
:::

  <Image img={image_05} size="md" alt="Страница управления ключами API" border/>

## Конечные точки {#endpoints}

Для получения подробной информации о конечных точках обратитесь к [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger). 
Используйте ваш API Key и API Secret с базовым URL `https://api.clickhouse.cloud/v1`.
