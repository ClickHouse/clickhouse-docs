---
sidebar_label: 'Управление ключами API'
slug: /cloud/manage/openapi
title: 'Управление ключами API'
description: 'ClickHouse Cloud предоставляет API, использующее OpenAPI и позволяющее программно управлять вашей учетной записью и различными параметрами ваших сервисов.'
doc_type: 'guide'
keywords: ['api', 'openapi', 'rest api', 'документация', 'управление облаком']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# Управление ключами API {#managing-api-keys}

ClickHouse Cloud предоставляет API на основе OpenAPI, который позволяет программно управлять вашей учетной записью и различными параметрами ваших сервисов.

:::note
В этом документе рассматривается ClickHouse Cloud API. Об API-эндпойнтах базы данных см. [Cloud Endpoints API](/cloud/get-started/query-endpoints)
:::

1. Вы можете использовать вкладку **API Keys** в левом меню для создания и управления своими ключами API.

<Image img={image_01} size="sm" alt="Вкладка API Keys" border />

2. Страница **API Keys** изначально отображает предложение создать ваш первый ключ API, как показано ниже. После создания первого ключа вы можете создавать новые ключи с помощью кнопки `New API Key`, которая появится в правом верхнем углу.

<Image img={image_02} size="md" alt="Страница API Keys" border />

3. Чтобы создать ключ API, укажите имя ключа, права доступа для ключа и время истечения срока действия, затем нажмите `Generate API Key`.

<br />

:::note
Права доступа соответствуют [предопределенным ролям](/cloud/security/console-roles) ClickHouse Cloud. Роль developer имеет права только на чтение для назначенных сервисов, а роль admin имеет полные права на чтение и запись.
:::

:::tip Запрос к конечным точкам API
Чтобы использовать ключи API с [Query API Endpoints](/cloud/get-started/query-endpoints), установите для Organization Role значение `Member` (минимальное) и предоставьте Service Role доступ к `Query Endpoints`.
:::

<Image img={image_03} size="md" alt="Форма создания ключа API" border />

4. На следующем экране будут отображены ваш Key ID и секрет ключа (Key secret). Скопируйте эти значения и сохраните их в надежном месте, например в хранилище секретов. После перехода с этого экрана значения больше не будут отображаться.

<Image img={image_04} size="md" alt="Сведения о ключе API" border />

5. ClickHouse Cloud API использует [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) для проверки действительности ваших ключей API. Ниже приведен пример использования ключей API для отправки запросов в ClickHouse Cloud API с помощью `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Вернувшись на страницу **API Keys**, вы увидите имя ключа, последние четыре символа идентификатора ключа (Key ID), права доступа, статус, дату истечения срока действия и создателя. На этом экране вы можете изменить имя ключа, права доступа и срок действия. Здесь же ключи можно отключать или удалять.

<br />

:::note
Удаление API-ключа — необратимое действие. Любые сервисы, использующие этот ключ, немедленно потеряют доступ к ClickHouse Cloud.
:::

<Image img={image_05} size="md" alt="Страница управления API-ключами" border />


## Конечные точки {#endpoints}

Подробную информацию о конечных точках API см. в [справочнике по API](https://clickhouse.com/docs/cloud/manage/api/swagger). 
Используйте свой API Key и API Secret с базовым URL `https://api.clickhouse.cloud/v1`.
