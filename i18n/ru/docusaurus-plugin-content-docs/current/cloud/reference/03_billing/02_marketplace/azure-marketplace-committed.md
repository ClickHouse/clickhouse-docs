---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Контракт с обязательствами в Azure Marketplace'
description: 'Оформление подписки на ClickHouse Cloud через Azure Marketplace (контракт с обязательствами)'
keywords: ['Microsoft', 'Azure', 'marketplace', 'billing', 'committed', 'committed contract']
doc_type: 'guide'
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

Начните работу с ClickHouse Cloud в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) по контракту с фиксированными обязательствами. Такой контракт, также известный как Private Offer, позволяет клиентам заранее взять на себя обязательство потратить определённую сумму на ClickHouse Cloud в течение определённого периода времени.


## Предварительные условия {#prerequisites}

- Индивидуальное предложение от ClickHouse на основе конкретных условий договора.


## Шаги для регистрации {#steps-to-sign-up}

1. Вы должны были получить письмо со ссылкой для просмотра и принятия вашего персонального предложения.

<br />

<Image
  img={azure_marketplace_committed_1}
  size='md'
  alt='Письмо с персональным предложением Azure Marketplace'
  border
/>

<br />

2. Нажмите на ссылку **Review Private Offer** в письме. Вы будете перенаправлены на страницу Azure Marketplace с деталями персонального предложения.

<br />

<Image
  img={azure_marketplace_committed_2}
  size='md'
  alt='Детали персонального предложения Azure Marketplace'
  border
/>

<br />

3. После принятия предложения вы будете перенаправлены на экран **Private Offer Management**. Azure может потребоваться некоторое время для подготовки предложения к покупке.

<br />

<Image
  img={azure_marketplace_committed_3}
  size='md'
  alt='Страница управления персональными предложениями Azure Marketplace'
  border
/>

<br />

<Image
  img={azure_marketplace_committed_4}
  size='md'
  alt='Загрузка страницы управления персональными предложениями Azure Marketplace'
  border
/>

<br />

4. Через несколько минут обновите страницу. Предложение должно быть готово к **покупке**.

<br />

<Image
  img={azure_marketplace_committed_5}
  size='md'
  alt='Страница управления персональными предложениями Azure Marketplace с доступной покупкой'
  border
/>

<br />

5. Нажмите **Purchase** — откроется всплывающая панель. Заполните следующие поля:

<br />

- Подписка и группа ресурсов
- Укажите имя для SaaS-подписки
- Выберите тарифный план, для которого у вас есть персональное предложение. Только срок, на который было создано персональное предложение (например, 1 год), будет иметь указанную сумму. Другие варианты сроков оплаты будут иметь нулевую стоимость.
- Выберите, хотите ли вы включить периодическое выставление счетов. Если периодическое выставление счетов не выбрано, контракт завершится в конце расчетного периода, а ресурсы будут выведены из эксплуатации.
- Нажмите **Review + subscribe**.

<br />

<Image
  img={azure_marketplace_committed_6}
  size='md'
  alt='Форма подписки Azure Marketplace'
  border
/>

<br />

6. На следующем экране проверьте все детали и нажмите **Subscribe**.

<br />

<Image
  img={azure_marketplace_committed_7}
  size='md'
  alt='Подтверждение подписки Azure Marketplace'
  border
/>

<br />

7. На следующем экране вы увидите **Your SaaS subscription in progress**.

<br />

<Image
  img={azure_marketplace_committed_8}
  size='md'
  alt='Страница отправки подписки Azure Marketplace'
  border
/>

<br />

8. Когда все будет готово, нажмите **Configure account now**. Обратите внимание, что это критически важный шаг, который связывает подписку Azure с организацией ClickHouse Cloud для вашей учетной записи. Без этого шага ваша подписка Marketplace не будет завершена.

<br />

<Image
  img={azure_marketplace_committed_9}
  size='md'
  alt='Кнопка настройки учетной записи Azure Marketplace'
  border
/>

<br />

9. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете зарегистрироваться с новой учетной записью или войти с существующей. После входа будет создана новая организация, готовая к использованию и выставлению счетов через Azure Marketplace.

10. Перед продолжением вам необходимо ответить на несколько вопросов — указать адрес и данные компании.

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='Форма регистрационной информации ClickHouse Cloud'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='Форма регистрационной информации ClickHouse Cloud 2'
  border
/>

<br />

11. После нажатия **Complete sign up** вы будете перенаправлены в вашу организацию в ClickHouse Cloud, где сможете просмотреть экран выставления счетов, чтобы убедиться, что счета выставляются через Azure Marketplace, и создать сервисы.

<br />

<br />

<Image
  img={azure_marketplace_payg_11}
  size='sm'
  alt='Форма регистрационной информации ClickHouse Cloud'
  border
/>

<br />

<br />

<Image
  img={azure_marketplace_payg_12}
  size='md'
  alt='Форма регистрационной информации ClickHouse Cloud'
  border
/>

<br />

Если у вас возникнут какие-либо проблемы, не стесняйтесь обращаться к [нашей команде поддержки](https://clickhouse.com/support/program).
