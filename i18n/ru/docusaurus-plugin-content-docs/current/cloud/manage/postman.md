---
slug: /cloud/manage/postman
sidebar_label: 'Программный доступ к API с Postman'
title: 'Программный доступ к API с Postman'
description: 'Этот гид поможет вам протестировать API ClickHouse Cloud с использованием Postman'
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

Этот гид поможет вам протестировать API ClickHouse Cloud с использованием [Postman](https://www.postman.com/product/what-is-postman/). 
Приложение Postman доступно для использования в веб-браузере или может быть загружено на рабочий стол.

### Создайте учетную запись {#create-an-account}
* Бесплатные аккаунты доступны на [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Сайт Postman" border/>

### Создайте рабочее пространство {#create-a-workspace}
* Назовите ваше рабочее пространство и установите уровень видимости. 

<Image img={postman2} size="md" alt="Создание рабочего пространства" border/>

### Создайте коллекцию {#create-a-collection}
* В левом верхнем меню ниже "Explore" нажмите "Import": 

<Image img={postman3} size="md" alt="Explore > Import" border/>

* Появится модальное окно:

<Image img={postman4} size="md" alt="Ввод URL API" border/>

* Введите адрес API: "https://api.clickhouse.cloud/v1" и нажмите 'Enter':

<Image img={postman5} size="md" alt="Импорт" border/>

* Выберите "Postman Collection", нажав на кнопку "Import":

<Image img={postman6} size="md" alt="Collection > Import" border/>

### Интерфейс с API ClickHouse Cloud {#interface-with-the-clickhouse-cloud-api-spec}
* Теперь "API spec for ClickHouse Cloud" появится в разделе "Collections" (Левая навигация).

<Image img={postman7} size="md" alt="Импорт вашего API" border/>

* Нажмите на "API spec for ClickHouse Cloud". В средней панели выберите вкладку 'Authorization':

<Image img={postman8} size="md" alt="Импорт завершен" border/>

### Установка авторизации {#set-authorization}
* Выберите из выпадающего меню "Basic Auth":

<Image img={postman9} size="md" alt="Базовая аутентификация" border/>

* Введите имя пользователя и пароль, которые вы получили при настройке ключей API ClickHouse Cloud:

<Image img={postman10} size="md" alt="учетные данные" border/>

### Включить переменные {#enable-variables}
* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют сохранять и повторно использовать значения в Postman, что упрощает тестирование API.
#### Установите идентификатор организации и идентификатор сервиса {#set-the-organization-id-and-service-id}
* В "Collection" нажмите на вкладку "Variable" в средней панели (Базовый URL уже был установлен ранее при импорте API):
* Под `baseURL` нажмите открытое поле "Add new value" и замените ваш идентификатор организации и идентификатор сервиса:

<Image img={postman11} size="md" alt="Идентификатор организации и идентификатор сервиса" border/>


## Тестирование функциональности API ClickHouse Cloud {#test-the-clickhouse-cloud-api-functionalities}
### Тест "GET список доступных организаций" {#test-get-list-of-available-organizations}
* В разделе "OpenAPI spec for ClickHouse Cloud" раскройте папку > V1 > organizations
* Нажмите "GET список доступных организаций" и нажмите синюю кнопку "Send" справа:

<Image img={postman12} size="md" alt="Тестирование получения организаций" border/>

* Вернувшиеся результаты должны предоставить данные о вашей организации с "status": 200. (Если вы получите "status" 400 без информации об организации, ваша конфигурация неверна).

<Image img={postman13} size="md" alt="Статус" border/>

### Тест "GET данные организации" {#test-get-organizational-details}
* В папке `organizationid` перейдите к "GET данные организации":
* В меню средней панели в разделе Params требуется `organizationid`.

<Image img={postman14} size="md" alt="Тестирование получения данных организации" border/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (после установки этого значения появится меню с этим значением):

<Image img={postman15} size="md" alt="Отправка теста" border/>

* После нажатия кнопки "Save", нажмите синюю кнопку "Send" в верхнем правом углу экрана.

<Image img={postman16} size="md" alt="Возвращаемое значение" border/>

* Вернувшиеся результаты должны предоставить данные о вашей организации с "status": 200. (Если вы получите "status" 400 без информации об организации, ваша конфигурация неверна).

### Тест "GET данные сервиса" {#test-get-service-details}
* Нажмите "GET данные сервиса"
* Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
* Нажмите "Save", а затем синюю кнопку "Send" справа.

<Image img={postman17} size="md" alt="Список сервисов" border/>

* Вернувшиеся результаты должны предоставить список ваших сервисов и их данные с "status": 200. (Если вы получите "status" 400 без информации о сервисах, ваша конфигурация неверна).
