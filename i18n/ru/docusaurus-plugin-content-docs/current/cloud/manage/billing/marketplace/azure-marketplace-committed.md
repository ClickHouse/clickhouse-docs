---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Обязательный контракт на Azure Marketplace'
description: 'Подпишитесь на ClickHouse Cloud через Azure Marketplace (обязательный контракт)'
keywords: ['Microsoft', 'Azure', 'marketplace', 'billing', 'committed', 'committed contract']
---

import Image from '@theme/IdealImage';
import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Начните работать с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через обязательный контракт. Обязательный контракт, также известный как Частное Предложение, позволяет клиентам обязаться потратить определенную сумму на ClickHouse Cloud в течение определенного времени.

## Предварительные условия {#prerequisites}

- Частное предложение от ClickHouse на основе конкретных условий контракта.

## Шаги для подписки {#steps-to-sign-up}

1. Вы должны были получить электронное письмо с ссылкой для просмотра и принятия вашего частного предложения.

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Электронное письмо с частным предложением Azure Marketplace" border/>

<br />

2. Нажмите на ссылку **Review Private Offer** в электронном письме. Это должно перенести вас на вашу страницу GCP Marketplace с деталями частного предложения.

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Детали частного предложения Azure Marketplace" border/>

<br />

3. После того как вы примете предложение, вы попадете на экран **Управление частным предложением**. Azure может потребовать некоторое время для подготовки предложения к покупке.

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Страница управления частным предложением Azure Marketplace" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Загрузка страницы управления частным предложением Azure Marketplace" border/>

<br />

4. Через несколько минут обновите страницу. Предложение должно быть готово к **Покупке**.

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Страница управления частным предложением Azure Marketplace, покупка доступна" border/>

<br />

5. Нажмите на **Purchase** - вы увидите открывающееся меню. Заполните следующие поля:

<br />

- Подписка и группа ресурсов 
- Укажите название для SaaS подписки
- Выберите тарифный план, для которого у вас есть частное предложение. Только тот срок, для которого было создано частное предложение (например, 1 год), будет иметь сумму против него. Другие варианты тарифных планов будут с суммами $0. 
- Выберите, хотите ли вы повторяющуюся биллинг или нет. Если повторяющаяся биллинг не выбрана, контракт закончится в конце расчетного периода, и ресурсы будут переведены в статус завершенных.
- Нажмите на **Review + subscribe**.

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Форма подписки Azure Marketplace" border/>

<br />

6. На следующем экране проверьте все детали и нажмите **Subscribe**.

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Подтверждение подписки Azure Marketplace" border/>

<br />

7. На следующем экране вы увидите **Ваша SaaS подписка в процессе**.

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Страница отправки подписки Azure Marketplace" border/>

<br />

8. Когда все будет готово, вы можете нажать на **Настроить аккаунт сейчас**. Обратите внимание, что это критически важный шаг, который связывает подписку Azure с организацией ClickHouse Cloud для вашего аккаунта. Без этого шага ваша подписка на Marketplace не будет завершена.

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Кнопка настроить аккаунт сейчас на Azure Marketplace" border/>

<br />

9. Вы будете переадресованы на страницу регистрации или входа в ClickHouse Cloud. Вы можете либо зарегистрироваться с помощью новой учетной записи, либо войти в систему с помощью существующей учетной записи. После входа в систему будет создана новая организация, готовая к использованию и биллингу через Azure Marketplace.

10. Вам нужно будет ответить на несколько вопросов - адрес и данные компании - прежде чем вы сможете продолжить.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации ClickHouse Cloud 2" border/>

<br />

11. После нажатия на **Complete sign up** вы попадете в вашу организацию в ClickHouse Cloud, где сможете просмотреть экран биллинга, чтобы убедиться, что выBills: выполнения запросов по Azure Marketplace и создания сервисов.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

Если у вас возникли какие-либо проблемы, пожалуйста, не стесняйтесь обратиться в [нашу службу поддержки](https://clickhouse.com/support/program).
