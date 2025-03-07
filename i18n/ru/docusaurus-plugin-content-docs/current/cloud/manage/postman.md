---
slug: /cloud/manage/postman
sidebar_label: Программный доступ к API с помощью Postman
title: Программный доступ к API с помощью Postman
---

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

Данное руководство поможет вам протестировать API ClickHouse Cloud с помощью [Postman](https://www.postman.com/product/what-is-postman/). 
Приложение Postman доступно для использования в веб-браузере или его можно скачать на рабочий стол.

### Создайте учетную запись {#create-an-account}
* Бесплатные учетные записи доступны на [https://www.postman.com](https://www.postman.com).

<img src={postman1} alt="Сайт Postman"/>

### Создайте Рабочую область {#create-a-workspace}
* Назовите вашу рабочую область и установите уровень видимости. 

<img src={postman2} alt="Создать рабочую область"/>

### Создайте Коллекцию {#create-a-collection}
* В верхнем левом меню под "Исследовать" нажмите "Импорт": 

<img src={postman3} alt="Исследовать > Импорт"/>

* Появится модальное окно:

<img src={postman4} alt="Ввод URL API"/>

* Введите адрес API: "https://api.clickhouse.cloud/v1" и нажмите 'Enter':

<img src={postman5} alt="Импортировать"/>

* Выберите "Postman Collection", нажав кнопку "Импорт":

<img src={postman6} alt="Коллекция > Импорт"/>

### Взаимодействие со спецификацией ClickHouse Cloud API {#interface-with-the-clickhouse-cloud-api-spec}
* Спецификация "API для ClickHouse Cloud" теперь появится в "Коллекциях" (Левая навигация).

<img src={postman7} alt="Импортируйте ваш API"/>

* Нажмите на "Спецификация API для ClickHouse Cloud." В среднем окне выберите вкладку ‘Authorization’:

<img src={postman8} alt="Импорт завершен"/>

### Установите Авторизацию {#set-authorization}
* Включите выпадающее меню, чтобы выбрать "Basic Auth":

<img src={postman9} alt="Базовая аутентификация"/>

* Введите Имя пользователя и Пароль, которые вы получили при настройке ключей API ClickHouse Cloud:

<img src={postman10} alt="учетные данные"/>

### Включите Переменные {#enable-variables}
* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют хранить и повторно использовать значения в Postman, что упрощает тестирование API.
#### Установите ID Организации и ID Сервиса {#set-the-organization-id-and-service-id}
* Внутри "Коллекции" нажмите на вкладку "Переменная" в среднем окне (Базовый URL уже будет установлен при предыдущем импорте API):
* Под `baseURL` нажмите открытое поле "Добавить новое значение" и подставьте ваш ID организации и ID сервиса:

<img src={postman11} alt="ID Организации и ID Сервиса"/>


## Протестируйте функционал ClickHouse Cloud API {#test-the-clickhouse-cloud-api-functionalities}
### Протестировать "GET список доступных организаций" {#test-get-list-of-available-organizations}
* В разделе "Спецификация OpenAPI для ClickHouse Cloud" разверните папку > V1 > organizations
* Нажмите "GET список доступных организаций" и нажмите голубую кнопку "Отправить" справа:

<img src={postman12} alt="Тестирование получения организаций"/>

* Возвращенные результаты должны содержать информацию о вашей организации с "status": 200. (Если вы получите "status" 400 без информации о организации, ваша конфигурация неверна).

<img src={postman13} alt="Статус"/>

### Протестировать "GET детали организации" {#test-get-organizational-details}
* В папке `organizationid` перейдите к "GET детали организации":
* В меню среднего окна в разделе Params требуется `organizationid`.

<img src={postman14} alt="Тестирование получения деталей организации"/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (При установке этого значения ранее появится меню с значением):

<img src={postman15} alt="Подтвердить тест"/>

* После нажатия кнопки "Сохранить" нажмите голубую кнопку "Отправить" в верхнем правом углу экрана.

<img src={postman16} alt="Возвращаемое значение"/>

* Возвращенные результаты должны содержать информацию о вашей организации с "status": 200. (Если вы получите "status" 400 без информации о организации, ваша конфигурация неверна).

### Протестировать "GET детали сервиса" {#test-get-service-details}
* Нажмите "GET детали сервиса"
* Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}`, соответственно.
* Нажмите "Сохранить", а затем голубую кнопку "Отправить" справа.

<img src={postman17} alt="Список сервисов"/>

* Возвращенные результаты должны содержать список ваших сервисов и их детали с "status": 200. (Если вы получите "status" 400 без информации о сервисах ваша конфигурация неверна).
