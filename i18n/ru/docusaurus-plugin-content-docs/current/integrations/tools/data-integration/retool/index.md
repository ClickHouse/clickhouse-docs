---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'connect', 'integrate', 'ui', 'admin', 'panel', 'dashboard', 'nocode', 'no-code']
description: 'Быстро создавайте веб и мобильные приложения с богатыми пользовательскими интерфейсами, автоматизируйте сложные задачи и интегрируйте ИИ — всё на основе ваших данных.'
title: 'Подключение Retool к ClickHouse'
---

import ConnectionDetails from '@site/i18n/ru/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Retool к ClickHouse

<CommunityMaintainedBadge/>

## 1. Соберите данные о вашем подключении {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте ресурс ClickHouse {#2-create-a-clickhouse-resource}

Войдите в ваш аккаунт Retool и перейдите на вкладку _Ресурсы_. Выберите "Создать новый" -> "Ресурс":

<Image img={retool_01} size="lg" border alt="Создание нового ресурса" />
<br/>

Выберите "JDBC" из списка доступных коннекторов:

<Image img={retool_02} size="lg" border alt="Выбор коннектора JDBC" />
<br/>

В мастере настройки убедитесь, что вы выбрали `com.clickhouse.jdbc.ClickHouseDriver` в качестве "Имени драйвера":

<Image img={retool_03} size="lg" border alt="Выбор правильного драйвера" />
<br/>

Заполните свои учетные данные ClickHouse в следующем формате: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`.
Если ваш экземпляр требует SSL или вы используете ClickHouse Cloud, добавьте `&ssl=true` к строке подключения, чтобы она выглядела как `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="Указание ваших учетных данных" />
<br/>

После этого протестируйте ваше подключение:

<Image img={retool_05} size="lg" border alt="Тестирование вашего подключения" />
<br/>

Теперь вы должны иметь возможность продолжить работу с вашим приложением, используя ресурс ClickHouse.
