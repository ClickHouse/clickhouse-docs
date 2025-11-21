---
sidebar_label: 'Управление API-ключами'
slug: /cloud/manage/openapi
title: 'Управление API-ключами'
description: 'ClickHouse Cloud предоставляет API на базе OpenAPI, который позволяет программно управлять вашей учетной записью и различными параметрами ваших сервисов.'
doc_type: 'guide'
keywords: ['api', 'openapi', 'rest api', 'documentation', 'cloud management']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# Управление ключами API

ClickHouse Cloud предоставляет API на основе OpenAPI, который позволяет программно управлять вашей учетной записью и различными аспектами ваших сервисов.

:::note
В этом документе рассматривается API ClickHouse Cloud. Для конечных точек API базы данных см. [Cloud Endpoints API](/cloud/get-started/query-endpoints)
:::

1. Вы можете использовать вкладку **API Keys** в левом меню для создания и управления своими ключами API.

<Image img={image_01} size="sm" alt="Вкладка API Keys" border />

2. Страница **API Keys** изначально отобразит предложение создать ваш первый ключ API, как показано ниже. После создания первого ключа вы сможете создавать новые ключи с помощью кнопки `New API Key`, которая появляется в правом верхнем углу.

<Image img={image_02} size="md" alt="Страница API Keys" border />

3. Чтобы создать ключ API, укажите имя ключа, права доступа для ключа и срок действия, затем нажмите `Generate API Key`.

<br />

:::note
Права доступа соответствуют [предопределенным ролям](/cloud/security/console-roles) ClickHouse Cloud. Роль developer имеет права только на чтение для назначенных сервисов, а роль admin имеет полные права на чтение и запись.
:::

:::tip Query API Endpoints
Чтобы использовать ключи API с [Query API Endpoints](/cloud/get-started/query-endpoints), установите для Organization Role значение `Member` (минимум) и предоставьте доступ Service Role к `Query Endpoints`.
:::

<Image img={image_03} size="md" alt="Форма создания ключа API" border />

4. На следующем экране будут показаны ваш Key ID и Key secret. Скопируйте эти значения и сохраните их в надёжном месте, например в хранилище. После того как вы покинете этот экран, значения больше не будут отображаться.

<Image img={image_04} size="md" alt="Сведения о ключе API" border />

5. API ClickHouse Cloud использует [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) для проверки действительности ваших ключей API. Ниже приведён пример использования ключей API для отправки запросов к API ClickHouse Cloud с помощью `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Вернувшись на страницу **API Keys**, вы увидите имя ключа, последние четыре символа идентификатора ключа (Key ID), права доступа, статус, дату истечения срока действия и создателя. На этом экране вы можете редактировать имя ключа, права доступа и срок действия. Ключи также можно отключить или удалить с этого экрана.

<br />

:::note
Удаление API-ключа — необратимое действие. Все сервисы, использующие этот ключ, немедленно потеряют доступ к ClickHouse Cloud.
:::

<Image img={image_05} size="md" alt="Страница управления API-ключами" border />


## Конечные точки {#endpoints}

Подробную информацию о конечных точках см. в [справочнике API](https://clickhouse.com/docs/cloud/manage/api/swagger).
Используйте ваш ключ API и секрет API с базовым URL `https://api.clickhouse.cloud/v1`.
