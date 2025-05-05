---
slug: /cloud/manage/postman
sidebar_label: 'Программный доступ к API с помощью Postman'
title: 'Программный доступ к API с помощью Postman'
description: 'Этот гайд поможет вам протестировать API ClickHouse Cloud с помощью Postman'
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

Этот гайд поможет вам протестировать API ClickHouse Cloud с помощью [Postman](https://www.postman.com/product/what-is-postman/). 
Приложение Postman доступно для использования в веб-браузере или может быть загружено на настольный компьютер.

### Создание аккаунта {#create-an-account}
* Бесплатные аккаунты доступны на [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Сайт Postman" border/>

### Создание рабочего пространства {#create-a-workspace}
* Назовите ваше рабочее пространство и установите уровень видимости. 

<Image img={postman2} size="md" alt="Создание рабочего пространства" border/>

### Создание коллекции {#create-a-collection}
* Ниже "Изучить" в верхнем левом меню нажмите "Импорт": 

<Image img={postman3} size="md" alt="Изучить > Импорт" border/>

* Появится модальное окно:

<Image img={postman4} size="md" alt="Ввод URL API" border/>

* Введите адрес API: "https://api.clickhouse.cloud/v1" и нажмите 'Enter':

<Image img={postman5} size="md" alt="Импорт" border/>

* Выберите "Postman Collection", нажав кнопку "Импорт":

<Image img={postman6} size="md" alt="Коллекция > Импорт" border/>

### Интерфейс со спецификацией API ClickHouse Cloud {#interface-with-the-clickhouse-cloud-api-spec}
* "Спецификация API для ClickHouse Cloud" теперь появится в разделе "Коллекции" (Левая навигация).

<Image img={postman7} size="md" alt="Импорт вашего API" border/>

* Нажмите на "Спецификация API для ClickHouse Cloud". В среднем окне выберите вкладку 'Authorization':

<Image img={postman8} size="md" alt="Импорт завершен" border/>

### Установите авторизацию {#set-authorization}
* Переключите выпадающее меню, чтобы выбрать "Basic Auth":

<Image img={postman9} size="md" alt="Базовая аутентификация" border/>

* Введите Имя пользователя и Пароль, полученные при настройке ключей API ClickHouse Cloud:

<Image img={postman10} size="md" alt="учетные данные" border/>

### Включить переменные {#enable-variables}
* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют хранить и повторно использовать значения в Postman, упрощая тестирование API.
#### Установите ID Организации и ID Сервиса {#set-the-organization-id-and-service-id}
* Внутри "Коллекции" нажмите вкладку "Переменная" в среднем окне (Базовый URL будет установлен при предыдущем импорте API):
* Ниже `baseURL` нажмите открытое поле "Добавить новое значение" и замените на ваш ID организации и ID сервиса:

<Image img={postman11} size="md" alt="ID Организации и ID Сервиса" border/>


## Протестируйте функционал API ClickHouse Cloud {#test-the-clickhouse-cloud-api-functionalities}
### Протестируйте "GET список доступных организаций" {#test-get-list-of-available-organizations}
* В разделе "Спецификация OpenAPI для ClickHouse Cloud" разверните папку > V1 > organizations
* Нажмите "GET список доступных организаций" и нажмите синюю кнопку "Отправить" справа:

<Image img={postman12} size="md" alt="Проверка получения организаций" border/>

* Возвратимые результаты должны содержать данные вашей организации с "status": 200. (Если вы получите "status" 400 без информации об организации, ваша конфигурация некорректна).

<Image img={postman13} size="md" alt="Статус" border/>

### Протестируйте "GET детали организации" {#test-get-organizational-details}
* В разделе `organizationid` перейдите к "GET детали организации":
* В меню среднего фрейма в разделе Params требуется `organizationid`.

<Image img={postman14} size="md" alt="Проверка получения деталей организации" border/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (После установки этого значения появится меню с этим значением):

<Image img={postman15} size="md" alt="Отправить тест" border/>

* После нажатия кнопки "Сохранить" нажмите синюю кнопку "Отправить" в верхнем правом углу экрана.

<Image img={postman16} size="md" alt="Возвращаемое значение" border/>

* Возвратимые результаты должны содержать данные вашей организации с "status": 200. (Если вы получите "status" 400 без информации об организации, ваша конфигурация некорректна).

### Протестируйте "GET детали сервиса" {#test-get-service-details}
* Нажмите "GET детали сервиса"
* Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
* Нажмите "Сохранить", а затем синюю кнопку "Отправить" справа.

<Image img={postman17} size="md" alt="Список сервисов" border/>

* Возвратимые результаты должны содержать список ваших сервисов и их детали с "status": 200. (Если вы получите "status" 400 без информации о сервисах, ваша конфигурация некорректна).
