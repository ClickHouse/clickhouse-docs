---
sidebar_label: 'Управление ключами API'
slug: /cloud/manage/openapi
title: 'Управление ключами API'
description: 'ClickHouse Cloud предоставляет API с использованием OpenAPI, который позволяет вам программно управлять вашей учетной записью и аспектами ваших услуг.'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# Управление ключами API

ClickHouse Cloud предоставляет API с использованием OpenAPI, который позволяет вам программно управлять вашей учетной записью и аспектами ваших услуг.

:::note
Этот документ охватывает API ClickHouse Cloud. Для конечных точек API базы данных смотрите [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)
:::

1. Вы можете использовать вкладку **API Keys** в левом меню для создания и управления вашими ключами API.

  <Image img={image_01} size="sm" alt="Вкладка ключей API" border/>

2. Страница **API Keys** изначально отобразит подсказку для создания вашего первого ключа API, как показано ниже. После создания вашего первого ключа вы можете создавать новые ключи, используя кнопку `New API Key`, которая появится в правом верхнем углу.

  <Image img={image_02} size="md" alt="Страница ключей API" border/>
  
3. Чтобы создать ключ API, укажите имя ключа, разрешения для ключа и время истечения, затем нажмите `Generate API Key`.
<br/>
:::note
Разрешения соответствуют [предопределенным ролям](/cloud/security/cloud-access-management/overview#predefined-roles) ClickHouse Cloud. Роль разработчика имеет разрешения только на чтение, а роль администратора имеет полные разрешения на чтение и запись.
:::

  <Image img={image_03} size="md" alt="Форма создания ключа API" border/>

4. На следующем экране будут отображены ваш Key ID и ключевой секрет. Скопируйте эти значения и сохраните их в безопасном месте, например, в хранилище. Значения не будут отображены после того, как вы покинете этот экран.

  <Image img={image_04} size="md" alt="Детали ключа API" border/>

5. API ClickHouse Cloud использует [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) для проверки действительности ваших ключей API. Вот пример того, как использовать ваши ключи API для отправки запросов к API ClickHouse Cloud с использованием `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Вернувшись на страницу **API Keys**, вы увидите имя ключа, последние четыре символа Key ID, разрешения, статус, дату истечения и создателя. Вы можете редактировать имя ключа, разрешения и время истечения с этого экрана. Ключи также могут быть отключены или удалены с этого экрана.
<br/>
:::note
Удаление ключа API — это необратимое действие. Любые услуги, использующие ключ, немедленно потеряют доступ к ClickHouse Cloud.
:::

  <Image img={image_05} size="md" alt="Страница управления ключами API" border/>

## Endpoints {#endpoints}

Документация по [конечным точкам здесь](/cloud/manage/api/invitations-api-reference.md). Используйте ваш API Key и API Secret с базовым URL `https://api.clickhouse.cloud/v1`.
