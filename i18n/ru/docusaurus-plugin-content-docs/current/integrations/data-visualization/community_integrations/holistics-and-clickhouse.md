---
sidebar_label: 'Holistics'
slug: /integrations/holistics
keywords: ['clickhouse', 'Holistics', 'AI', 'integrate', 'bi', 'data visualization']
description: 'Holistics — это платформа на основе ИИ для самообслуживания в BI и встраиваемой аналитики, которая помогает всем принимать более обоснованные решения, используя управляемые и легко доступные метрики.'
title: 'Подключение ClickHouse к Holistics'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import holistics_01 from '@site/static/images/integrations/data-visualization/holistics_01.png';
import holistics_02 from '@site/static/images/integrations/data-visualization/holistics_02.png';
import holistics_03 from '@site/static/images/integrations/data-visualization/holistics_03.png';
import holistics_04 from '@site/static/images/integrations/data-visualization/holistics_04.png';
import holistics_05 from '@site/static/images/integrations/data-visualization/holistics_05.png';
import holistics_06 from '@site/static/images/integrations/data-visualization/holistics_06.png';


# Подключение ClickHouse к Holistics \{#connecting-clickhouse-to-holistics\}

<CommunityMaintainedBadge/>

[Holistics](https://www.holistics.io/) — это изначально ориентированная на ИИ self-service BI‑платформа с программируемым семантическим слоем, обеспечивающим единые и достоверные метрики.

Подключив ClickHouse к Holistics, ваши команды получают быструю и надежную среду самообслуживания с поддержкой ИИ, основанную на кодовом семантическом слое. Бизнес-пользователи смогут уверенно исследовать данные с помощью drag-and-drop и ИИ, а вы сохраните определения метрик многократно используемыми, легко комбинируемыми и находящимися под управлением версий в Git.

## Предварительные требования \\{#prerequisites\\}

Перед подключением убедитесь, что выполнены следующие условия:

- **Права доступа:** вы должны иметь роль Admin в Holistics, чтобы добавлять новые источники данных.
- **Сетевой доступ:** ваш сервер ClickHouse должен быть доступен с [IP-адресов Holistics](https://docs.holistics.io/docs/connect/ip-whitelisting).
- **Пользователь базы данных:** создайте для Holistics отдельного пользователя с правами только на чтение, вместо использования учетной записи администратора.

### Рекомендуемые привилегии \{#recommended-privileges\}

Специальному пользователю необходимы привилегии `SELECT` на таблицы, из которых вы планируете выполнять запросы, а также на системные таблицы `system` (для определения схемы).

```sql
-- Example: Grant read access to a specific database
GRANT SELECT ON my_database.* TO holistics_user;

-- Grant access to system metadata
GRANT SELECT ON system.* TO holistics_user;
```

<VerticalStepper headerLevel="h2">
  ## Сбор параметров подключения

  Для подключения к ClickHouse по HTTP(S) вам понадобится следующая информация:

  | **Параметр**      | **Описание**                                                                                   |
  | ----------------- | ---------------------------------------------------------------------------------------------- |
  | **Host**          | Имя хоста вашего сервера ClickHouse (например, `mz322.eu-central-1.aws.clickhouse.cloud`).     |
  | **Port**          | **8443** для ClickHouse Cloud (SSL/TLS). **8123** для самоуправляемых экземпляров без SSL.     |
  | **Database Name** | Имя базы данных, к которой вы хотите подключиться. По умолчанию обычно используется `default`. |
  | **Username**      | Пользователь базы данных. По умолчанию используется `default`.                                 |
  | **Password**      | Пароль пользователя базы данных.                                                               |

  Вы можете найти эти параметры, нажав кнопку **Connect** в консоли ClickHouse Cloud и выбрав **HTTPS**.

  <Image size="md" img={holistics_01} alt="Расположение кнопки Connect в консоли ClickHouse Cloud" border />

  ## Настройка сетевого доступа

  Поскольку Holistics — это облачное приложение, его серверы должны иметь доступ к вашей базе данных. У вас есть два варианта:

  1. **Прямое подключение (рекомендуется):** Добавьте IP-адреса Holistics в allowlist в вашем файрволе или в ClickHouse Cloud IP Access List. Список IP-адресов приведён в [руководстве по IP Whitelisting](https://docs.holistics.io/docs/connect/ip-whitelisting).

     <Image size="md" img={holistics_02} alt="Пример allowlisting IP-адресов в ClickHouse Cloud" border />

  2. **Обратный SSH-туннель (Reverse SSH Tunnel):** Если ваша база данных находится в частной сети (VPC) и не может быть открыта в общий доступ, используйте [Reverse SSH Tunnel](https://docs.holistics.io/docs/connect/connect-tunnel).

  ## Добавление источника данных в Holistics

  1. В Holistics перейдите в **Settings → Data Sources**.

     <Image size="md" img={holistics_03} alt="Переход к Data Sources в настройках Holistics" border />

  2. Нажмите **New Data Source** и выберите **ClickHouse**.

     <Image size="md" img={holistics_04} alt="Выбор ClickHouse из списка новых источников данных" border />

  3. Заполните форму параметрами, собранными на шаге 1.

     | **Поле**          | **Настройка**                                                                                   |
     | ----------------- | ----------------------------------------------------------------------------------------------- |
     | **Host**          | Имя хоста вашего ClickHouse                                                                     |
     | **Port**          | `8443` (или `8123`)                                                                             |
     | **Require SSL**   | Переключите в положение **ON**, если используется порт 8443 (обязательно для ClickHouse Cloud). |
     | **Database Name** | `default` (или ваша конкретная база данных)                                                     |

     <Image size="md" img={holistics_05} alt="Заполнение параметров подключения к ClickHouse в Holistics" border />

  4. Нажмите **Test Connection**.

     <Image size="md" img={holistics_06} alt="Успешное тестовое подключение к ClickHouse в Holistics" border />

     * **Успех:** нажмите **Save**.
     * **Ошибка:** проверьте ваш логин/пароль и убедитесь, что [IP-адреса Holistics добавлены в allowlist](https://docs.holistics.io/docs/connect/ip-whitelisting).
</VerticalStepper>


## Известные ограничения \\{#known-limitations\\}

Holistics поддерживает большинство стандартных функций SQL в ClickHouse, за следующими исключениями:

- **Накопительный итог (Running Total):** В настоящее время эта аналитическая функция ограниченно поддерживается в ClickHouse.
- **Вложенные типы данных:** Глубоко вложенные структуры JSON или Array могут потребовать преобразования в плоский вид с помощью SQL-моделей перед визуализацией.

Полный список поддерживаемых возможностей и ограничений приведён на странице [Database-specific Limitations](https://docs.holistics.io/docs/connect/faqs/clickhouse-limitations).