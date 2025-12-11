---
sidebar_label: 'Retool'
slug: /integrations/retool
keywords: ['clickhouse', 'retool', 'подключение', 'интеграция', 'ui', 'админ', 'панель', 'дашборд', 'nocode', 'no-code']
description: 'Быстро создавайте веб- и мобильные приложения с продвинутыми пользовательскими интерфейсами, автоматизируйте сложные задачи и интегрируйте ИИ — всё на основе ваших данных.'
title: 'Подключение Retool к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Подключение Retool к ClickHouse {#connecting-retool-to-clickhouse}

<PartnerBadge/>

## 1. Соберите сведения о подключении {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте ресурс ClickHouse {#2-create-a-clickhouse-resource}

Войдите в свой аккаунт Retool и перейдите на вкладку _Resources_. Выберите «Create New» → «Resource»:

<Image img={retool_01} size="lg" border alt="Создание нового ресурса" />
<br/>

Выберите «JDBC» из списка доступных коннекторов:

<Image img={retool_02} size="lg" border alt="Выбор коннектора JDBC" />
<br/>

В мастере настройки убедитесь, что в поле «Driver name» выбран `com.clickhouse.jdbc.ClickHouseDriver`:

<Image img={retool_03} size="lg" border alt="Выбор правильного драйвера" />
<br/>

Укажите учетные данные ClickHouse в следующем формате: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`.
Если для вашего экземпляра требуется SSL или вы используете ClickHouse Cloud, добавьте `&ssl=true` к строке подключения, чтобы она выглядела так: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="Указание учетных данных" />
<br/>

После этого протестируйте подключение:

<Image img={retool_05} size="lg" border alt="Тестирование подключения" />
<br/>

Теперь вы можете перейти к работе в приложении, используя ресурс ClickHouse.
