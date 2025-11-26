---
description: 'Начало работы с Moose Stack — подход code-first к разработке поверх ClickHouse с типобезопасными схемами данных и локальной средой разработки'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Разработка на ClickHouse с использованием Moose OLAP'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Разработка на ClickHouse с использованием Moose OLAP

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) — это основной модуль [Moose Stack](https://docs.fiveonefour.com/moose), набора инструментов с открытым исходным кодом для разработчиков, предназначенного для создания аналитических бекендов в режиме реального времени на TypeScript и Python. 

Moose OLAP предоставляет удобные для разработчиков абстракции и ORM-подобную функциональность, изначально созданную для ClickHouse.



## Ключевые возможности Moose OLAP {#key-features}

- **Схемы как код**: Определяйте таблицы ClickHouse на TypeScript или Python с типобезопасностью и автодополнением в IDE
- **Типобезопасные запросы**: Пишите SQL-запросы с проверкой типов и поддержкой автодополнения
- **Локальная разработка**: Разрабатывайте и тестируйте на локальных экземплярах ClickHouse, не затрагивая продуктивную среду
- **Управление миграциями**: Ведите версионирование изменений схем и управляйте миграциями программно
- **Потоковая обработка в реальном времени**: Встроенная поддержка связки ClickHouse с Kafka или Redpanda для потокового приёма
- **REST API**: Легко генерируйте полноценно задокументированные REST API-интерфейсы поверх таблиц и представлений ClickHouse



## Начало работы менее чем за 5 минут {#getting-started}

Актуальные руководства по установке и началу работы см. в [документации Moose Stack](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse).

Или следуйте этому руководству, чтобы запустить Moose OLAP на существующем развертывании ClickHouse или ClickHouse Cloud менее чем за 5 минут.

### Предварительные требования {#prerequisites}

- **Node.js 20+** ИЛИ **Python 3.12+** — требуется для разработки на TypeScript или Python
- **Docker Desktop** — для локальной среды разработки
- **macOS/Linux** — Windows работает через WSL2

<VerticalStepper headerLevel="h3">

### Установите Moose {#step-1-install-moose}

Установите Moose CLI глобально в систему:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### Настройте проект {#step-2-set-up-project}

#### Вариант A: Используйте собственное развертывание ClickHouse {#option-a-use-own-clickhouse}

**Важно**: Ваш продакшн-экземпляр ClickHouse останется нетронутым. Эта команда только инициализирует новый проект Moose OLAP с моделями данных, созданными на основе ваших таблиц ClickHouse.


```bash
# TypeScript
moose init my-project --from-remote <СТРОКА_ПОДКЛЮЧЕНИЯ_К_CLICKHOUSE> --language typescript
```


# Python

moose init my-project --from-remote <ВАША_СТРОКА_ПОДКЛЮЧЕНИЯ_CLICKHOUSE> --language python

````

Строка подключения к ClickHouse должна иметь следующий формат:

```bash
https://username:password@host:port/?database=database_name
````

#### Вариант Б: использование тестовой среды ClickHouse {#option-b-use-clickhouse-playground}

ClickHouse еще не развернут? Используйте тестовую среду ClickHouse Playground для ознакомления с Moose OLAP!


```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript
```


# Python

moose init my-project --from-remote [https://explorer:@play.clickhouse.com:443/?database=default](https://explorer:@play.clickhouse.com:443/?database=default) --language python

```

### Установите зависимости {#step-3-install-dependencies}
```


```bash
# TypeScript
cd my-project
npm install
```


# Python

cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

````

Вы должны увидеть: `Successfully generated X models from ClickHouse tables`

### Изучите сгенерированные модели {#step-4-explore-models}

Moose CLI автоматически генерирует интерфейсы TypeScript или модели Python Pydantic из существующих таблиц ClickHouse.

Проверьте новые модели данных в файле `app/index.ts`.

### Начните разработку {#step-5-start-development}

Запустите сервер разработки для развёртывания локального экземпляра ClickHouse со всеми производственными таблицами, автоматически воссозданными из определений в коде:

```bash
moose dev
````

**Важно**: Ваш производственный экземпляр ClickHouse останется нетронутым. Это создаёт локальную среду разработки.

### Заполните локальную базу данных {#step-6-seed-database}

Загрузите данные в локальный экземпляр ClickHouse:

#### Из собственного экземпляра ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### Из тестовой среды ClickHouse {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Разработка с Moose OLAP {#step-7-building-with-moose-olap}

Теперь, когда таблицы определены в коде, вы получаете те же преимущества, что и модели данных ORM в веб-приложениях — типобезопасность и автодополнение при создании API и материализованных представлений на основе аналитических данных. В качестве следующего шага можно попробовать:

- Создать REST API с помощью [Moose API](https://docs.fiveonefour.com/moose/apis)
- Выполнить приём или преобразование данных с помощью [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) или [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)
- Изучить переход в производственную среду с помощью [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) и [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)

</VerticalStepper>


## Получите помощь и оставайтесь на связи {#get-help-stay-connected}
- **Эталонное приложение**: Ознакомьтесь с эталонным приложением с открытым исходным кодом [Area Code](https://github.com/514-labs/area-code) — стартовым репозиторием со всеми необходимыми строительными блоками для функционально насыщенного, готового к работе на уровне enterprise приложения, требующего специализированной инфраструктуры. Доступны два примерных приложения: «User Facing Analytics» и «Operational Data Warehouse».
- **Сообщество в Slack**: Свяжитесь с мейнтейнерами Moose Stack [в Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) для получения поддержки и обмена отзывами.
- **Смотрите обучающие материалы**: Видео‑руководства, демо и детальные разборы возможностей Moose Stack [на YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw).
- **Внесите вклад**: Ознакомьтесь с кодом, внесите вклад в Moose Stack и сообщайте о проблемах [на GitHub](https://github.com/514-labs/moose).
