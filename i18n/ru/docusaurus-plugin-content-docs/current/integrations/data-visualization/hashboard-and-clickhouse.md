---
sidebar_label: 'Хэшборд'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Хэшборд', 'подключение', 'интеграция', 'интерфейс', 'аналитика']
description: 'Хэшборд — это мощная аналитическая платформа, которую можно легко интегрировать с ClickHouse для анализа данных в реальном времени.'
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';


# Подключение ClickHouse к Хэшборду

[Хэшборд](https://hashboard.com) — это интерактивный инструмент для исследования данных, который позволяет любому сотруднику вашей организации отслеживать метрики и находить практические инсайты. Хэшборд отправляет живые SQL запросы к вашей базе данных ClickHouse и особенно полезен для самообслуживания и спонтанного исследования данных.

<img src={hashboard_01} class="image" alt="Hashboard data explorer" />  

<br/>

Этот гид проведет вас через шаги по подключению Хэшборда к вашему экземпляру ClickHouse. Эта информация также доступна в [документации по интеграции ClickHouse Хэшборда](https://docs.hashboard.com/docs/database-connections/clickhouse).

## Предварительные требования {#pre-requisites}

- База данных ClickHouse, размещенная на вашей инфраструктуре или на [ClickHouse Cloud](https://clickhouse.com/).
- [Учетная запись Хэшборда](https://hashboard.com/getAccess) и проект.

## Шаги по подключению Хэшборда к ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Добавьте новое соединение с базой данных в Хэшборде {#2-add-a-new-database-connection-in-hashboard}

1. Перейдите к вашему [проекту Хэшборда](https://hashboard.com/app).
2. Откройте страницу настроек, нажав на значок шестеренки в боковой навигационной панели.
3. Нажмите `+ Новое соединение с базой данных`.
4. В модальном окне выберите "ClickHouse".
5. Заполните поля **Имя соединения**, **Хост**, **Порт**, **Имя пользователя**, **Пароль** и **База данных** информацией, собранной ранее.
6. Нажмите "Тест", чтобы проверить, правильно ли настроено соединение.
7. Нажмите "Добавить".

Теперь ваша база данных ClickHouse подключена к Хэшборду, и вы можете продолжить создание [м modelos dan datos](https://docs.hashboard.com/docs/data-modeling/add-data-model), [исследований](https://docs.hashboard.com/docs/visualizing-data/explorations), [метрик](https://docs.hashboard.com/docs/metrics) и [панелей мониторинга](https://docs.hashboard.com/docs/dashboards). См. соответствующую документацию Хэшборда для получения дополнительной информации о этих функциях.

## Узнайте больше {#learn-more}

Для получения более продвинутых функций и устранения неполадок посетите [документацию Хэшборда](https://docs.hashboard.com/).
