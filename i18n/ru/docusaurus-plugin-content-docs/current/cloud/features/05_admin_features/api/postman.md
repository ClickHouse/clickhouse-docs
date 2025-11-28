---
slug: /cloud/manage/postman
sidebar_label: 'Программный доступ к API с помощью Postman'
title: 'Программный доступ к API с помощью Postman'
description: 'Это руководство поможет вам протестировать API ClickHouse Cloud с помощью Postman'
doc_type: 'guide'
keywords: ['api', 'postman', 'rest api', 'cloud management', 'integration']
---

import Image from '@theme/IdealImage';
import postman1 from '@site/static/images/cloud/manage/postman/postman1.png';
import postman2 from '@site/static/images/cloud/manage/postman/postman2.png';
import postman3 from '@site/static/images/cloud/manage/postman/postman3.png';
import postman4 from '@site/static/images/cloud/manage/postman/postman4.png';
import postman5 from '@site/static/images/cloud/manage/postman/postman5.png';
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
Приложение Postman доступно в веб-браузере или его можно загрузить на рабочий компьютер.

### Создайте учетную запись

* Бесплатные учетные записи доступны по адресу [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Сайт Postman" border />

### Создайте рабочее пространство

* Укажите имя рабочего пространства и установите уровень видимости.

<Image img={postman2} size="md" alt="Создание рабочего пространства" border />

### Создайте коллекцию

* Под пунктом «Explore» в верхнем левом меню нажмите «Import»:

<Image img={postman3} size="md" alt="Explore > Import" border />

* Появится модальное окно:

<Image img={postman4} size="md" alt="Ввод URL API" border />

* Введите адрес API: «[https://api.clickhouse.cloud/v1](https://api.clickhouse.cloud/v1)» и нажмите Enter:

<Image img={postman5} size="md" alt="Import" border />

* Выберите «Postman Collection», нажав кнопку «Import»:

<Image img={postman6} size="md" alt="Collection > Import" border />

### Работа со спецификацией ClickHouse Cloud API

* «API spec for ClickHouse Cloud» теперь появится в разделе «Collections» (левая панель навигации).

<Image img={postman7} size="md" alt="Импорт вашего API" border />

* Нажмите «API spec for ClickHouse Cloud». В средней панели выберите вкладку «Authorization»:

<Image img={postman8} size="md" alt="Импорт завершен" border />

### Настройте авторизацию

* Разверните выпадающее меню и выберите «Basic Auth»:

<Image img={postman9} size="md" alt="Basic auth" border />

* Введите имя пользователя и пароль, полученные при настройке ключей ClickHouse Cloud API:

<Image img={postman10} size="md" alt="учетные данные" border />

### Включите переменные

* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют хранить и повторно использовать значения в Postman, что упрощает тестирование API.

#### Установите идентификатор организации и идентификатор сервиса

* В коллекции нажмите вкладку «Variables» в средней панели (Base URL был задан при предыдущем импорте API).
* Под `baseURL` нажмите на поле «Add new value» и подставьте свои идентификатор организации и идентификатор сервиса:

<Image img={postman11} size="md" alt="Идентификатор организации и идентификатор сервиса" border />


## Тестирование возможностей ClickHouse Cloud API {#test-the-clickhouse-cloud-api-functionalities}

### Тест «GET list of available organizations» {#test-get-list-of-available-organizations}

* В разделе «OpenAPI spec for ClickHouse Cloud» разверните папку > V1 > organizations
* Нажмите «GET list of available organizations» и затем синюю кнопку «Send» справа:

<Image img={postman12} size="md" alt="Тестирование получения списка организаций" border/>

* В возвращённом результате должны быть сведения о вашей организации со значением "status": 200. (Если вы получаете "status" 400 без информации об организации, конфигурация указана неверно).

<Image img={postman13} size="md" alt="Статус" border/>

### Тест «GET organizational details» {#test-get-organizational-details}

* В папке `organizationid` перейдите к «GET organizational details»:
* В центральной области в меню Params требуется указать `organizationid`.

<Image img={postman14} size="md" alt="Тестирование получения сведений об организации" border/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (так как это значение было задано ранее, появится меню с этим значением):

<Image img={postman15} size="md" alt="Отправка теста" border/>

* После нажатия кнопки «Save» нажмите синюю кнопку «Send» в правом верхнем углу экрана.

<Image img={postman16} size="md" alt="Возвращаемое значение" border/>

* В возвращённом результате должны быть сведения о вашей организации со значением "status": 200. (Если вы получаете "status" 400 без информации об организации, конфигурация указана неверно).

### Тест «GET service details» {#test-get-service-details}

* Нажмите «GET service details»
* Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
* Нажмите «Save», а затем синюю кнопку «Send» справа.

<Image img={postman17} size="md" alt="Список сервисов" border/>

* В возвращённом результате должен быть список ваших сервисов и сведения о них со значением "status": 200. (Если вы получаете "status" 400 без информации о сервисах, конфигурация указана неверно).
