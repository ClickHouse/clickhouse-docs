---
'slug': '/cloud/manage/postman'
'sidebar_label': 'Программный доступ к API с Postman'
'title': 'Программный доступ к API с Postman'
'description': 'Этот гид поможет вам протестировать ClickHouse Cloud API с помощью
  Postman'
'doc_type': 'guide'
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

Этот гид поможет вам протестировать ClickHouse Cloud API с использованием [Postman](https://www.postman.com/product/what-is-postman/). 
Приложение Postman доступно для использования в веб-браузере или может быть загружено на настольный компьютер.

### Создание учетной записи {#create-an-account}

* Бесплатные учетные записи доступны на [https://www.postman.com](https://www.postman.com).

<Image img={postman1} size="md" alt="Сайт Postman" border/>

### Создание рабочей области {#create-a-workspace}

* Назовите вашу рабочую область и установите уровень видимости. 

<Image img={postman2} size="md" alt="Создание рабочей области" border/>

### Создание коллекции {#create-a-collection}

* В меню в верхнем левом углу нажмите "Импорт": 

<Image img={postman3} size="md" alt="Изучить > Импорт" border/>

* Появится модальное окно:

<Image img={postman4} size="md" alt="Ввод URL API" border/>

* Введите адрес API: "https://api.clickhouse.cloud/v1" и нажмите 'Enter':

<Image img={postman5} size="md" alt="Импорт" border/>

* Выберите "Postman Collection", нажав кнопку "Импорт":

<Image img={postman6} size="md" alt="Коллекция > Импорт" border/>

### Интерфейс спецификации ClickHouse Cloud API {#interface-with-the-clickhouse-cloud-api-spec}
* Теперь "API спецификация для ClickHouse Cloud" появится в разделе "Коллекции" (Левая навигация).

<Image img={postman7} size="md" alt="Импорт вашего API" border/>

* Нажмите на "API спецификация для ClickHouse Cloud." В центральной панели выберите вкладку 'Authorization':

<Image img={postman8} size="md" alt="Импорт завершен" border/>

### Установка авторизации {#set-authorization}
* Включите выпадающее меню, чтобы выбрать "Basic Auth":

<Image img={postman9} size="md" alt="Основная аутентификация" border/>

* Введите имя пользователя и пароль, полученные при настройке ключей API ClickHouse Cloud:

<Image img={postman10} size="md" alt="учетные данные" border/>

### Включение переменных {#enable-variables}

* [Переменные](https://learning.postman.com/docs/sending-requests/variables/) позволяют сохранять и повторно использовать значения в Postman, что упрощает тестирование API.

#### Установка идентификатора организации и идентификатора службы {#set-the-organization-id-and-service-id}

* Внутри "Коллекции" нажмите вкладку "Переменная" в центральной панели (Базовый URL будет установлен ранее при импорте API):
* Под `baseURL` нажмите на открытое поле "Добавить новое значение" и замените ваш идентификатор организации и идентификатор службы:

<Image img={postman11} size="md" alt="Идентификатор организации и идентификатор службы" border/>

## Тестирование функциональности ClickHouse Cloud API {#test-the-clickhouse-cloud-api-functionalities}

### Тест "GET список доступных организаций" {#test-get-list-of-available-organizations}

* В разделе "OpenAPI спецификация для ClickHouse Cloud" разверните папку > V1 > organizations
* Нажмите "GET список доступных организаций" и нажмите синюю кнопку "Send" справа:

<Image img={postman12} size="md" alt="Тестирование получения организаций" border/>

* Возвращенные результаты должны предоставить данные о вашей организации с "status": 200. (Если вы получите "status" 400 без информации о организации, ваша конфигурация неверна).

<Image img={postman13} size="md" alt="Статус" border/>

### Тест "GET детали организации" {#test-get-organizational-details}

* В папке `organizationid` перейдите к "GET детали организации":
* В меню центральной панели под Params требуется `organizationid`.

<Image img={postman14} size="md" alt="Тестирование получения деталей организации" border/>

* Измените это значение на `orgid` в фигурных скобках `{{orgid}}` (при установлении этого значения ранее появится меню с значением):

<Image img={postman15} size="md" alt="Отправить тест" border/>

* После нажатия кнопки "Сохранить" нажмите синюю кнопку "Send" в правом верхнем углу экрана.

<Image img={postman16} size="md" alt="Возвращаемое значение" border/>

* Возвращенные результаты должны предоставить данные о вашей организации с "status": 200. (Если вы получите "status" 400 без информации о организации, ваша конфигурация неверна).

### Тест "GET детали службы" {#test-get-service-details}

* Нажмите "GET детали службы"
* Измените значения для `organizationid` и `serviceid` на `{{orgid}}` и `{{serviceid}}` соответственно.
* Нажмите "Сохранить", а затем синюю кнопку "Send" справа.

<Image img={postman17} size="md" alt="Список служб" border/>

* Возвращенные результаты должны предоставить список ваших служб и их деталей с "status": 200. (Если вы получите "status" 400 без информации о службах, ваша конфигурация неверна).
