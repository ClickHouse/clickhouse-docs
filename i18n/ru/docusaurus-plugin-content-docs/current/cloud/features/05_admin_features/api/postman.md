---
slug: /cloud/manage/postman
sidebar_label: 'Программный доступ к API с помощью Postman'
title: 'Программный доступ к API с помощью Postman'
description: 'Это руководство поможет вам протестировать ClickHouse Cloud API с помощью Postman'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', 'cloud management', 'integration']
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman6 from '@site/static/images/cloud/manage/postman/postman6.png';
import postman7 from '@site/static/images/cloud/manage/postman/postman7.png';
import postman8 from '@site/static/images/cloud/manage/postman/postman8.png';
import postman9 from '@site/static/images/cloud/manage/postman/postman9.png';
import postman10 from '@site/static/images/cloud/manage/postman/postman10.png';
import postman11 from '@site/static/images/cloud/manage/postman/postman11.png';
import postman12 from '@site/static/images/cloud/manage/postman/postman12.png';
import postman13 from '@site/static/images/cloud/manage/postman/postman13.png';
import postman14 from '@site/static/images/cloud/manage/postman/postman14.png';
import postman15 from '@site/static/images/cloud/manage/postman/postman15.png';
import postman16 from '@site/static/images/cloud/manage/postman/postman16.png';
import postman17 from '@site/static/images/cloud/manage/postman/postman17.png';

Это руководство поможет вам протестировать ClickHouse Cloud API с помощью [Postman](https://www.postman.com/product/what-is-postman/). 
Приложение Postman доступно как в веб-интерфейсе, так и в виде десктопного приложения.

### Создайте учетную запись {#create-an-account}

* Бесплатные учетные записи доступны на сайте [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Сайт Postman" border/>

### Создайте рабочее пространство {#create-a-workspace}

* Задайте имя рабочему пространству и уровень видимости. 

<Image img={postman2} size="md" alt="Create workspace" border/>

### Создание коллекции {#create-a-collection}

* В меню слева вверху под "Explore" нажмите "Import": 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* Появится модальное окно:

<Image img={postman4} size="md" alt="API URL entry" border/>

* Введите адрес API: "https://api.clickhouse.cloud/v1" и нажмите клавишу Enter:

* Выберите "Postman Collection", нажав кнопку "Import":

<Image img={postman6} size="md" alt="Collection > Import" border/>

### Взаимодействие со спецификацией API ClickHouse Cloud {#interface-with-the-clickhouse-cloud-api-spec}

* «API spec for ClickHouse Cloud» теперь отобразится в разделе «Collections» (левая панель навигации).

<Image img={postman7} size="md" alt="Import your API" border/>

* Нажмите «API spec for ClickHouse Cloud». В средней панели выберите вкладку `Authorization`:

<Image img={postman8} size="md" alt="Import complete" border/>

### Настройте авторизацию {#set-authorization}

* В выпадающем списке выберите «Basic Auth»:

<Image img={postman9} size="md" alt="Basic auth" border/>

* Введите имя пользователя (Username) и пароль (Password), полученные при создании ключей API в ClickHouse Cloud:

<Image img={postman10} size="md" alt="credentials" border/>

### Включите переменные {#enable-variables}

* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют сохранять и повторно использовать значения в Postman, что упрощает тестирование API.

#### Установите идентификатор организации и Service ID {#set-the-organization-id-and-service-id}

* Внутри "Collection" перейдите на вкладку "Variable" в средней панели (значение Base URL уже было установлено при предыдущем импорте API):
* Под `baseURL` в открытом поле "Add new value" подставьте свой идентификатор организации и Service ID:

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## Проверка возможностей API ClickHouse Cloud {#test-the-clickhouse-cloud-api-functionalities}

### Тест «GET list of available organizations» {#test-get-list-of-available-organizations}

* В разделе «OpenAPI spec for ClickHouse Cloud» разверните папку > V1 > organizations
* Нажмите «GET list of available organizations» и затем синюю кнопку «Send» справа:

<Image img={postman12} size="md" alt="Test retrieval of organizations" border/>

* В ответе должны быть указаны сведения о вашей организации со «status»: 200. (Если вы получили «status» 400 без информации об организации, ваша конфигурация настроена неверно).

<Image img={postman13} size="md" alt="Status" border/>

### Тестирование "GET organizational details" {#test-get-organizational-details}

* В папке `organizationid` перейдите к "GET organizational details":
* В средней панели в меню Params требуется указать `organizationid`.

<Image img={postman14} size="md" alt="Тестирование получения сведений об организации" border/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (поскольку это значение было задано ранее, в меню появится соответствующий вариант):

<Image img={postman15} size="md" alt="Отправка тестового запроса" border/>

* После нажатия кнопки "Save" нажмите синюю кнопку "Send" в правом верхнем углу экрана.

<Image img={postman16} size="md" alt="Возвращаемое значение" border/>

* Возвращённый результат должен содержать сведения о вашей организации со "status": 200. (Если вы получаете "status" 400 без информации об организации, ваша конфигурация настроена неверно).

### Тестирование метода "GET service details" {#test-get-service-details}

* Нажмите "GET service details".
* Измените значения `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
* Нажмите "Save", затем синюю кнопку "Send" справа.

<Image img={postman17} size="md" alt="List of services" border/>

* В возвращённых результатах должен быть список ваших сервисов и их деталей со значением `"status": 200`. (Если вы получаете `"status": 400` без информации о сервисах, ваша конфигурация настроена некорректно).