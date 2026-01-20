---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'Быстрый старт'
title: 'Быстрый старт'
description: 'Создайте свою первую базу данных Managed Postgres и изучите панель управления экземпляром'
keywords: ['managed postgres', 'быстрый старт', 'начало работы', 'создание базы данных']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge />


## Создание базы данных \{#create-database\}

Чтобы создать новую управляемую базу данных PostgreSQL, выберите пункт PostgreSQL в боковой панели Cloud Console.

{/* TODO(kaushik-ubi): Снимок экрана боковой панели консоли Cloud с выделенным пунктом PostgreSQL
    Path: /static/images/cloud/managed-postgres/console-sidebar.png */}

Нажмите **New PostgreSQL database**, чтобы открыть страницу настройки. Введите имя сервера базы данных и выберите тип экземпляра в зависимости от требований к нагрузке. Надёжный пароль будет автоматически сгенерирован.

{/* TODO(kaushik-ubi): Снимок экрана формы создания базы данных
    Path: /static/images/cloud/managed-postgres/create-database.png */}

После выбора типа инстанса нажмите **Create**. Через несколько минут ваш экземпляр Managed Postgres будет развернут и готов к использованию.


## Обзор экземпляра \{#instance-overview\}

Страница «Обзор экземпляра» предоставляет комплексное представление о текущем состоянии вашего экземпляра PostgreSQL, включая его статус и показатели работоспособности, тип экземпляра и конфигурацию ресурсов, сведения о расположении и зоне доступности, настройки высокой доступности, а также метрики использования CPU и диска в режиме реального времени.

{/* TODO(kaushik-ubi): Скриншот обзорной панели экземпляра
    Path: /static/images/cloud/managed-postgres/instance-overview.png */}

На этой странице вы можете просмотреть [параметры подключения](/cloud/managed-postgres/connection), настроить опции [высокой доступности](/cloud/managed-postgres/high-availability), управлять [репликами для чтения](/cloud/managed-postgres/read-replicas) и отслеживать производительность вашей базы данных со временем.


## Доступность \{#availability\}

Managed Postgres в настоящее время доступен в 10 регионах AWS с более чем 50 конфигурациями на базе NVMe, от 2 vCPU с 8 ГБ оперативной памяти и 118 ГБ хранилища до 96 vCPU с 768 ГБ оперативной памяти и 60 ТБ хранилища. Планируется поддержка GCP и Azure.

Сервис включает встроенный [PgBouncer](/cloud/managed-postgres/connection#pgbouncer) для организации пула подключений, обновления мажорных версий и всех стандартных возможностей управляемого сервиса.