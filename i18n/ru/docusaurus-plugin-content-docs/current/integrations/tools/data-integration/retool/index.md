---
sidebar_label: Retool
slug: /integrations/retool
keywords: [clickhouse, retool, connect, integrate, ui, admin, panel, dashboard, nocode, no-code]
description: Быстро создавайте веб- и мобильные приложения с богатым пользовательским интерфейсом, автоматизируйте сложные задачи и интегрируйте ИИ — все на основе ваших данных.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';


# Подключение Retool к ClickHouse

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создайте ресурс ClickHouse {#2-create-a-clickhouse-resource}

Войдите в свой аккаунт Retool и перейдите на вкладку _Ресурсы_. Выберите "Создать новый" -> "Ресурс":

<img src={retool_01} className="image" alt="Создание нового ресурса" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Выберите "JDBC" из списка доступных коннекторов:

<img src={retool_02} className="image" alt="Выбор JDBC коннектора" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

В мастере настройки убедитесь, что вы выбрали `com.clickhouse.jdbc.ClickHouseDriver` в качестве "Имя драйвера":

<img src={retool_03} className="image" alt="Выбор правильного драйвера" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Заполните свои учетные данные ClickHouse в следующем формате: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`. 
Если ваша инстанция требует SSL или вы используете ClickHouse Cloud, добавьте `&ssl=true` к строке подключения, так что она будет выглядеть как `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<img src={retool_04} className="image" alt="Указание ваших учетных данных" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

После этого протестируйте ваше соединение:

<img src={retool_05} className="image" alt="Тестирование вашего соединения" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Теперь вы сможете перейти к вашему приложению, используя ресурс ClickHouse.
