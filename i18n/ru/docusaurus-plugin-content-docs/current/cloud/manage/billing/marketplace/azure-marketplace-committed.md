---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Коммированный контракт Azure Marketplace'
description: 'Подпишитесь на ClickHouse Cloud через Azure Marketplace (Коммированный контракт)'
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

Начните работу с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через коммированный контракт. Коммированный контракт, также известный как Личное предложение, позволяет клиентам обязаться потратить определенную сумму на ClickHouse Cloud за определенный период времени.


## Предварительные условия {#prerequisites}

- Личное предложение от ClickHouse на основе конкретных условий контракта.

## Шаги для регистрации {#steps-to-sign-up}

1. Вы должны были получить электронное письмо со ссылкой для просмотра и принятия вашего личного предложения.

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Электронное письмо с личным предложением от Azure Marketplace" border/>

<br />

2. Нажмите на ссылку **Просмотреть личное предложение** в электронном письме. Это должно перенести вас на страницу вашего GCP Marketplace с деталями личного предложения.

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Детали личного предложения Azure Marketplace" border/>

<br />

3. После того как вы примете предложение, вы перейдете на экран **Управление личными предложениями**. Azure может потребовать некоторое время для подготовки предложения к покупке.

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Страница управления личным предложением Azure Marketplace" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Страница управления личным предложением Azure Marketplace загружается" border/>

<br />

4. Подождите несколько минут, обновите страницу. Предложение должно быть готово к **Покупке**.

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Страница управления личным предложением Azure Marketplace, покупка включена" border/>

<br />

5. Нажмите на **Покупка** — вы увидите появляющееся окно. Заполните следующие поля:

<br />

- Подписка и группа ресурсов
- Укажите имя для подписки SaaS
- Выберите план оплаты, для которого у вас есть личное предложение. Только срок, на который было создано личное предложение (например, 1 год), будет иметь сумму против него. Другие варианты сроков оплаты будут с суммами $0.
- Выберите, хотите ли вы повторяющиеся платежи или нет. Если повторяющиеся платежи не выбраны, контракт завершится в конце расчетного периода, и ресурсы будут переведены в статус вывода из эксплуатации.
- Нажмите на **Просмотреть + подписаться**.

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Форма подписки Azure Marketplace" border/>

<br />

6. На следующем экране проверьте все детали и нажмите **Подписаться**.

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Подтверждение подписки Azure Marketplace" border/>

<br />

7. На следующем экране вы увидите **Ваша подписка SaaS в процессе**.

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Страница отправки подписки Azure Marketplace" border/>

<br />

8. Когда будет готово, вы можете нажать на **Настроить учетную запись сейчас**. Обратите внимание, что это критический шаг, который связывает подписку Azure с организацией ClickHouse Cloud для вашей учетной записи. Без этого шага ваша подписка Marketplace не завершена.

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Кнопка настроить учетную запись Azure Marketplace сейчас" border/>

<br />

9. Вы будете перенаправлены на страницу регистрации или входа в систему ClickHouse Cloud. Вы можете либо зарегистрироваться с помощью новой учетной записи, либо войти в систему с помощью существующей учетной записи. После входа в систему будет создана новая организация, которая готова к использованию и выставлению счетов через Azure Marketplace.

10. Вам потребуется ответить на несколько вопросов - адрес и данные компании - перед тем как вы сможете продолжить.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма информации для регистрации ClickHouse Cloud 2" border/>

<br />

11. После того как вы нажмете **Завершить регистрацию**, вы перейдете в вашу организацию в ClickHouse Cloud, где сможете увидеть экран выставления счетов, чтобы убедиться, что вам выставляется счет через Azure Marketplace и вы можете создавать сервисы.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма информации для регистрации ClickHouse Cloud" border/>

<br />

Если у вас возникли какие-либо проблемы, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
