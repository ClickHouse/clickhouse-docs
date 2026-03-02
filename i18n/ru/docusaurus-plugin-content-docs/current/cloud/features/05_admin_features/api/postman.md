---
slug: /cloud/manage/postman
sidebar_label: 'Программный доступ к API с помощью Postman'
title: 'Программный доступ к API с помощью Postman'
description: 'Это руководство поможет вам протестировать ClickHouse Cloud API с помощью Postman'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', 'управление Cloud', 'интеграция']
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
Приложением Postman можно пользоваться в веб-браузере или установить его на рабочий компьютер.


### Создайте учётную запись \{#create-an-account\}

* Бесплатные учётные записи доступны по адресу [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Сайт Postman" border/>

### Создайте рабочее пространство \{#create-a-workspace\}

* Задайте имя рабочему пространству и уровень его видимости. 

<Image img={postman2} size="md" alt="Create workspace" border/>

### Создание коллекции \{#create-a-collection\}

* В верхнем левом меню под пунктом «Explore» нажмите «Import»: 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* Откроется диалоговое окно:

<Image img={postman4} size="md" alt="API URL entry" border/>

* Введите адрес API: `https://api.clickhouse.cloud/v1` и нажмите клавишу Enter:

* Выберите «Postman Collection», нажав кнопку «Import»:

<Image img={postman6} size="md" alt="Collection > Import" border/>

### Взаимодействие со спецификацией API ClickHouse Cloud \{#interface-with-the-clickhouse-cloud-api-spec\}

* «API spec for ClickHouse Cloud» теперь появится в разделе «Collections» (левая панель навигации).

<Image img={postman7} size="md" alt="Импортируйте API" border/>

* Нажмите «API spec for ClickHouse Cloud». На средней панели выберите вкладку «Authorization»:

<Image img={postman8} size="md" alt="Импорт завершён" border/>

### Настройте авторизацию \{#set-authorization\}

* Раскройте выпадающее меню и выберите «Basic Auth»:

<Image img={postman9} size="md" alt="Basic auth" border/>

* Введите Username и Password, полученные при создании ключей API ClickHouse Cloud:

<Image img={postman10} size="md" alt="credentials" border/>

### Включение переменных \{#enable-variables\}

* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют сохранять значения в Postman и повторно их использовать, что упрощает тестирование API.

#### Установите идентификатор организации и идентификатор сервиса \{#set-the-organization-id-and-service-id\}

* Внутри «Collection» нажмите вкладку «Variable» в средней панели (Base URL был задан при предыдущем импорте API):
* Под `baseURL` нажмите на поле «Add new value» и подставьте свой идентификатор организации и идентификатор сервиса:

<Image img={postman11} size="md" alt="Organization ID and Service ID" border/>

## Проверьте возможности API ClickHouse Cloud \{#test-the-clickhouse-cloud-api-functionalities\}

### Тестирование запроса "GET list of available organizations" \{#test-get-list-of-available-organizations\}

* В разделе "OpenAPI spec for ClickHouse Cloud" разверните папку > V1 > organizations
* Нажмите "GET list of available organizations" и затем синюю кнопку "Send" справа:

<Image img={postman12} size="md" alt="Тест получения списка организаций" border/>

* В полученных результатах должны быть указаны сведения о вашей организации со "status": 200. (Если вы получаете "status" 400 без информации об организации, ваша конфигурация настроена некорректно).

<Image img={postman13} size="md" alt="Статус" border/>

### Тестирование "GET organizational details" \{#test-get-organizational-details\}

* В папке `organizationid` перейдите к "GET organizational details".
* В средней панели в меню Params параметр `organizationid` является обязательным.

<Image img={postman14} size="md" alt="Тест извлечения информации об организации" border/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (поскольку вы задавали это значение ранее, появится меню с этим значением):

<Image img={postman15} size="md" alt="Отправка теста" border/>

* После нажатия кнопки "Save" нажмите синюю кнопку "Send" в правом верхнем углу экрана.

<Image img={postman16} size="md" alt="Возвращаемое значение" border/>

* В возвращённых результатах должна быть информация о вашей организации со "status": 200. (Если вы получили "status": 400 без информации об организации, ваша конфигурация настроена неправильно).

### Тест «GET service details» \{#test-get-service-details\}

* Нажмите «GET service details».
* Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
* Нажмите «Save», затем синюю кнопку «Send» справа.

<Image img={postman17} size="md" alt="List of services" border/>

* В ответе должен вернуться список ваших сервисов и их параметров со статусом 200. (Если вы получаете статус 400 без информации о сервисах, ваша конфигурация настроена некорректно).