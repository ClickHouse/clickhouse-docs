---
slug: /cloud/manage/postman
sidebar_label: "Программный доступ к API через Postman"
title: "Программный доступ к API через Postman"
description: "Данное руководство поможет вам протестировать API ClickHouse Cloud с помощью Postman"
doc_type: "guide"
keywords: ["api", "postman", "rest api", "cloud management", "integration"]
---

import Image from "@theme/IdealImage"
import postman1 from "@site/static/images/cloud/manage/postman/postman1.png"
import postman2 from "@site/static/images/cloud/manage/postman/postman2.png"
import postman3 from "@site/static/images/cloud/manage/postman/postman3.png"
import postman4 from "@site/static/images/cloud/manage/postman/postman4.png"
import postman5 from "@site/static/images/cloud/manage/postman/postman5.png"
import postman6 from "@site/static/images/cloud/manage/postman/postman6.png"
import postman7 from "@site/static/images/cloud/manage/postman/postman7.png"
import postman8 from "@site/static/images/cloud/manage/postman/postman8.png"
import postman9 from "@site/static/images/cloud/manage/postman/postman9.png"
import postman10 from "@site/static/images/cloud/manage/postman/postman10.png"
import postman11 from "@site/static/images/cloud/manage/postman/postman11.png"
import postman12 from "@site/static/images/cloud/manage/postman/postman12.png"
import postman13 from "@site/static/images/cloud/manage/postman/postman13.png"
import postman14 from "@site/static/images/cloud/manage/postman/postman14.png"
import postman15 from "@site/static/images/cloud/manage/postman/postman15.png"
import postman16 from "@site/static/images/cloud/manage/postman/postman16.png"
import postman17 from "@site/static/images/cloud/manage/postman/postman17.png"

Данное руководство поможет вам протестировать API ClickHouse Cloud с помощью [Postman](https://www.postman.com/product/what-is-postman/).
Приложение Postman доступно для использования в веб-браузере или может быть установлено на компьютер.

### Создание учетной записи {#create-an-account}

- Бесплатные учетные записи доступны на сайте [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size='md' alt='Сайт Postman' border />

### Создание рабочего пространства {#create-a-workspace}

- Задайте имя рабочего пространства и установите уровень видимости.

<Image img={postman2} size='md' alt='Создание рабочего пространства' border />

### Создание коллекции {#create-a-collection}

- В верхнем левом меню под пунктом "Explore" нажмите "Import":

<Image img={postman3} size='md' alt='Explore > Import' border />

- A modal will appear:

<Image img={postman4} size='md' alt='Ввод URL API' border />

- Введите адрес API: "https://api.clickhouse.cloud/v1" и нажмите 'Enter':

<Image img={postman5} size='md' alt='Импорт' border />

- Выберите "Postman Collection", нажав на кнопку "Import":

<Image img={postman6} size='md' alt='Collection > Import' border />

### Работа со спецификацией API ClickHouse Cloud {#interface-with-the-clickhouse-cloud-api-spec}

- Теперь "API spec for ClickHouse Cloud" появится в разделе "Collections" (левая панель навигации).

<Image img={postman7} size='md' alt='Импорт вашего API' border />

- Нажмите на "API spec for ClickHouse Cloud". В центральной панели выберите вкладку 'Authorization':

<Image img={postman8} size='md' alt='Импорт завершен' border />

### Настройка авторизации {#set-authorization}

- Откройте выпадающее меню и выберите "Basic Auth":

<Image img={postman9} size='md' alt='Базовая аутентификация' border />

- Введите имя пользователя и пароль, полученные при настройке ключей API ClickHouse Cloud:

<Image img={postman10} size='md' alt='учетные данные' border />

### Включение переменных {#enable-variables}

- [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют сохранять и повторно использовать значения в Postman, что упрощает тестирование API.

#### Установка идентификатора организации и идентификатора сервиса {#set-the-organization-id-and-service-id}

- В разделе "Collection" нажмите на вкладку "Variable" в центральной панели (базовый URL будет установлен при импорте API):
- Под `baseURL` нажмите на открытое поле "Add new value" и укажите идентификатор вашей организации и идентификатор сервиса:

<Image img={postman11} size='md' alt='Идентификатор организации и идентификатор сервиса' border />


## Тестирование функциональности API ClickHouse Cloud {#test-the-clickhouse-cloud-api-functionalities}

### Тестирование "GET list of available organizations" {#test-get-list-of-available-organizations}

- В разделе "OpenAPI spec for ClickHouse Cloud" разверните папку > V1 > organizations
- Нажмите "GET list of available organizations" и нажмите синюю кнопку "Send" справа:

<Image img={postman12} size='md' alt='Тестирование получения списка организаций' border />

- Возвращенные результаты должны содержать данные вашей организации со статусом "status": 200. (Если вы получили "status" 400 без информации об организации, ваша конфигурация настроена неправильно).

<Image img={postman13} size='md' alt='Статус' border />

### Тестирование "GET organizational details" {#test-get-organizational-details}

- В папке `organizationid` перейдите к "GET organizational details":
- В меню средней панели в разделе Params необходимо указать `organizationid`.

<Image
  img={postman14}
  size='md'
  alt='Тестирование получения данных организации'
  border
/>

- Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (После установки этого значения ранее появится меню с этим значением):

<Image img={postman15} size='md' alt='Отправка теста' border />

- После нажатия кнопки "Save" нажмите синюю кнопку "Send" в правом верхнем углу экрана.

<Image img={postman16} size='md' alt='Возвращаемое значение' border />

- Возвращенные результаты должны содержать данные вашей организации со статусом "status": 200. (Если вы получили "status" 400 без информации об организации, ваша конфигурация настроена неправильно).

### Тестирование "GET service details" {#test-get-service-details}

- Нажмите "GET service details"
- Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
- Нажмите "Save", а затем синюю кнопку "Send" справа.

<Image img={postman17} size='md' alt='Список сервисов' border />

- Возвращенные результаты должны содержать список ваших сервисов и их данные со статусом "status": 200. (Если вы получили "status" 400 без информации о сервисах, ваша конфигурация настроена неправильно).
