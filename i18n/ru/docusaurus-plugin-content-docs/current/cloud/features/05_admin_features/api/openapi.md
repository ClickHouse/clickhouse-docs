---
sidebar_label: 'Управление API-ключами'
slug: /cloud/manage/openapi
title: 'Управление API-ключами'
description: 'ClickHouse Cloud предоставляет API на основе OpenAPI, который позволяет программно управлять вашей учетной записью и параметрами ваших сервисов.'
doc_type: 'guide'
keywords: ['api', 'openapi', 'rest api', 'documentation', 'cloud management']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# Управление API-ключами

ClickHouse Cloud предоставляет API на основе OpenAPI, которое позволяет программно управлять вашей учетной записью и параметрами ваших сервисов.

:::note
В этом документе описывается API ClickHouse Cloud. О конечных точках API базы данных см. [Cloud Endpoints API](/cloud/get-started/query-endpoints)
:::

1. Вы можете использовать вкладку **API Keys** в левом меню, чтобы создавать и управлять своими API-ключами.

<Image img={image_01} size="sm" alt="Вкладка API Keys" border />

2. На странице **API Keys** изначально будет отображаться предложение создать ваш первый API-ключ, как показано ниже. После создания первого ключа вы сможете создавать новые ключи с помощью кнопки `New API Key`, которая появится в правом верхнем углу.

<Image img={image_02} size="md" alt="Страница API Keys" border />

3. Чтобы создать API-ключ, укажите имя ключа, права доступа для ключа и срок действия, затем нажмите `Generate API Key`.

<br />

:::note
Права доступа соответствуют [предопределенным ролям](/cloud/security/console-roles) ClickHouse Cloud. Роль developer имеет права только на чтение для назначенных сервисов, а роль admin имеет полные права на чтение и запись.
:::

:::tip Query API Endpoints
Чтобы использовать API-ключи с [Query API Endpoints](/cloud/get-started/query-endpoints), установите для Organization Role значение `Member` (минимум) и предоставьте Service Role доступ к `Query Endpoints`.
:::

<Image img={image_03} size="md" alt="Форма создания API-ключа" border />

4. На следующем экране будут отображены ваш Key ID и Key secret. Скопируйте эти значения и сохраните их в надежном месте, например в хранилище (vault). После того как вы покинете этот экран, значения больше не будут отображаться.

<Image img={image_04} size="md" alt="Параметры API-ключа" border />

5. API ClickHouse Cloud использует [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) для проверки действительности ваших API-ключей. Ниже приведен пример того, как использовать API-ключи для отправки запросов к API ClickHouse Cloud с помощью `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Вернувшись на страницу **API Keys**, вы увидите имя ключа, последние четыре символа `Key ID`, права доступа, статус, срок действия и создателя. На этом экране вы можете изменить имя ключа, права доступа и срок действия. Здесь же ключи можно отключать или удалять.

<br />

:::note
Удаление API-ключа — необратимое действие. Любые сервисы, использующие этот ключ, немедленно потеряют доступ к ClickHouse Cloud.
:::

<Image img={image_05} size="md" alt="Страница управления API-ключами" border />


## Конечные точки {#endpoints}

Подробную информацию о конечных точках см. в [справочнике API](https://clickhouse.com/docs/cloud/manage/api/swagger).
Используйте ваш ключ API (API Key) и секрет API (API Secret) с базовым URL `https://api.clickhouse.cloud/v1`.
