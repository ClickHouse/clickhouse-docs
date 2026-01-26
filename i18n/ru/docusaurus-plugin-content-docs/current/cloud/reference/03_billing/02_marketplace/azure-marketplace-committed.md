---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Договор с обязательствами по потреблению в Azure Marketplace'
description: 'Оформление подписки на ClickHouse Cloud через Azure Marketplace (договор с обязательствами по потреблению)'
keywords: ['Microsoft', 'Azure', 'marketplace', 'биллинг', 'обязательства по потреблению', 'договор с обязательствами по потреблению']
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

Начните работу с ClickHouse Cloud в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps), оформив контракт с обязательствами. Такой контракт, также известный как Private Offer (частное предложение), позволяет клиентам заранее обязаться потратить определённую сумму на ClickHouse Cloud в течение заданного периода времени.


## Предварительные требования \{#prerequisites\}

- Индивидуальное предложение от ClickHouse с особыми условиями контракта.



## Шаги для регистрации \{#steps-to-sign-up\}

1. Вы должны были получить электронное письмо со ссылкой для просмотра и принятия приватного предложения.

<br />

<Image img={azure_marketplace_committed_1} size="md" alt="Письмо Azure Marketplace с приватным предложением" border/>

<br />

2. Нажмите ссылку **Review Private Offer** в электронном письме. Вы будете перенаправлены на страницу Azure Marketplace с деталями приватного предложения.

<br />

<Image img={azure_marketplace_committed_2} size="md" alt="Детали приватного предложения Azure Marketplace" border/>

<br />

3. После принятия предложения вы будете перенаправлены на экран **Private Offer Management**. Подготовка предложения к покупке в Azure может занять некоторое время.

<br />

<Image img={azure_marketplace_committed_3} size="md" alt="Страница управления приватным предложением Azure Marketplace" border/>

<br />

<Image img={azure_marketplace_committed_4} size="md" alt="Загрузка страницы управления приватным предложением Azure Marketplace" border/>

<br />

4. Через несколько минут обновите страницу. Предложение должно быть готово к покупке (**Purchase**).

<br />

<Image img={azure_marketplace_committed_5} size="md" alt="Страница управления приватным предложением Azure Marketplace, покупка доступна" border/>

<br />

5. Нажмите **Purchase** — откроется выдвижная панель. Выполните следующие действия:

<br />

- Подписка и группа ресурсов (Subscription and resource group)
- Укажите имя для SaaS-подписки
- Выберите тарифный план, для которого у вас есть приватное предложение. Только срок, для которого было создано приватное предложение (например, 1 год), будет иметь ненулевую сумму. Другие варианты сроков оплаты будут с суммой $0. 
- Выберите, нужна ли вам регулярная (recurring) оплата или нет. Если регулярная оплата не выбрана, контракт завершится в конце расчетного периода, а ресурсы будут выведены из эксплуатации.
- Нажмите **Review + subscribe**.

<br />

<Image img={azure_marketplace_committed_6} size="md" alt="Форма подписки Azure Marketplace" border/>

<br />

6. На следующем экране проверьте все данные и нажмите **Subscribe**.

<br />

<Image img={azure_marketplace_committed_7} size="md" alt="Подтверждение подписки Azure Marketplace" border/>

<br />

7. На следующем экране вы увидите сообщение **Your SaaS subscription in progress**.

<br />

<Image img={azure_marketplace_committed_8} size="md" alt="Страница отправки подписки Azure Marketplace" border/>

<br />

8. Когда все будет готово, вы можете нажать **Configure account now**. Обратите внимание, что это критически важный шаг, который привязывает подписку Azure к организации ClickHouse Cloud для вашего аккаунта. Без этого шага ваша подписка Marketplace не будет завершена.

<br />

<Image img={azure_marketplace_committed_9} size="md" alt="Кнопка Azure Marketplace Configure account now" border/>

<br />

9. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете либо зарегистрировать новый аккаунт, либо войти с использованием существующего. После входа будет создана новая организация, готовая к использованию и оплате через Azure Marketplace.

10. Перед продолжением вам нужно будет ответить на несколько вопросов — указать адрес и сведения о компании.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="Форма ввода информации при регистрации в ClickHouse Cloud" border/>

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="Форма ввода информации при регистрации в ClickHouse Cloud 2" border/>

<br />

11. После нажатия **Complete sign up** вы будете перенаправлены в вашу организацию в ClickHouse Cloud, где вы сможете просмотреть страницу биллинга, чтобы убедиться, что оплата производится через Azure Marketplace, а также создавать сервисы.

<br />

<br />

<Image img={azure_marketplace_payg_11} size="sm" alt="Форма ввода информации при регистрации в ClickHouse Cloud" border/>

<br />

<br />

<Image img={azure_marketplace_payg_12} size="md" alt="Форма ввода информации при регистрации в ClickHouse Cloud" border/>

<br />

Если у вас возникнут какие-либо проблемы, пожалуйста, свяжитесь с [нашей службой поддержки](https://clickhouse.com/support/program).
