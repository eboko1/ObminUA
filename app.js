require('dotenv').config();
const Telegraf = require('telegraf');
const axios = require('axios');
const currency_codes = require('currency-codes');
const Markup = require('telegraf/markup');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start((ctx) => ctx.reply(
  `Привіт ${ctx.message.from.first_name}!
   Цей Чат-Бот надає оновлені дані про *курси валют* в режимі реального часу зі 
   сторінок Банків України також ти зможеш отримати на поточну дату актуальний 
   курс металів Національного Банку України
   `,
   Markup.keyboard([
           ['EUR','USD'], 
           ['НБУ', 'Метали'],
           ['Калькулятор 🧮']
       ])
       .resize()
       .extra()
  
  ));
  
  bot.hears((/[0-9]+$/i), async (ctx) => {
    const enteredInt = parseInt(ctx.message.text);
    const dataK = await fetch(process.env.NBY)
    .then(res => res.json())
    .then(data3 => {


      let usd = parseFloat(JSON.stringify(data3[25].rate))*enteredInt;
      let eur = parseFloat(JSON.stringify(data3[32].rate))*enteredInt;
      let czk = parseFloat(JSON.stringify(data3[22].rate))*enteredInt;
      let chf = parseFloat(JSON.stringify(data3[4].rate))*enteredInt;

      formatInfo = `Курс НБУ на *${JSON.stringify(data3[25].exchangedate)}*     

            ${enteredInt} ${JSON.stringify(data3[25].cc)} -> 🇺🇦 *${usd.toFixed(2)}*
            ${enteredInt} ${JSON.stringify(data3[32].cc)} -> 🇺🇦 *${eur.toFixed(2)}*
            ${enteredInt} ${JSON.stringify(data3[22].cc)} -> 🇺🇦 *${czk.toFixed(2)}*
            ${enteredInt}${JSON.stringify(data3[4].cc)} -> 🇺🇦 *${chf.toFixed(2)}*
                `
      return ctx.replyWithMarkdown(formatInfo);

    })         
    .catch(error => console.log(error))
  })

   bot.on('text', async (ctx) => { //// bot.hears(/^[A-Z][a-z]+$/i, async (ctx) => {
    let formatInfo = '';
    const enteredText = ctx.message.text;
   
    
    if((enteredText == 'EUR') || (enteredText == 'USD') ){ // 💶  💵
      const currency = currency_codes.code(enteredText) 
        try {
          const currencyObjMonoBank = await axios.get(process.env.API_MONOBANK)
          const currencyObjPrivateBank = await axios.get(process.env.API_PRIVATEBANK)
   
          const foundCurrencyMonoBank = currencyObjMonoBank.data.find((cur)=>{
              return cur.currencyCodeA.toString() === currency.number;
          }) 
          // get data with PrіvateBank
          const foundCurrencPrivateBank = currencyObjPrivateBank.data.find((cur)=>{
            return cur.ccy === enteredText;
          }) 
         
          if(enteredText == 'EUR'){
            formatInfo =`
            Валюта: *${currency.code}💶/UAH*, 
                         Купівля / Продаж
            **Monobank** ⋅ *${foundCurrencyMonoBank.rateBuy}* / *${foundCurrencyMonoBank.rateSell}* 🇺🇦
            **ПриватБанк** ⋅ *${foundCurrencPrivateBank.buy}* / *${foundCurrencPrivateBank.sale}* 🇺🇦
            `   
          } else{
            formatInfo =`
            Валюта: *${currency.code}💵/UAH*,
                          Купівля / Продаж
            **Monobank** ⋅ *${foundCurrencyMonoBank.rateBuy}* / *${foundCurrencyMonoBank.rateSell}* 🇺🇦
            **ПриватБанк** ⋅ *${foundCurrencPrivateBank.buy}* / *${foundCurrencPrivateBank.sale}* 🇺🇦
            `  
          }
          ctx.replyWithMarkdown(formatInfo);
      } catch (error) {
          ctx.reply('Спробуйте пізніше! Рекомендовано до 10 запитів');
          console.log(error)
      }

    }

    if (ctx.message.text == 'НБУ'){

      const data = await fetch(process.env.NBY)
          .then(res => res.json())
          .then(data => {

            formatInfo = `Курс НБУ на *${JSON.stringify(data[25].exchangedate)}*

             ${JSON.stringify(data[25].cc)} 🇺🇸 -> 🇺🇦*${JSON.stringify(data[25].rate)}*
             ${JSON.stringify(data[32].cc)} 🇪🇺 -> 🇺🇦*${JSON.stringify(data[32].rate)}*
             ${JSON.stringify(data[22].cc)} 🇨🇭 -> 🇺🇦*${JSON.stringify(data[22].rate)}*
             ${JSON.stringify(data[4].cc)} 🇨🇿 -> 🇺🇦*${JSON.stringify(data[4].rate)}*
                          `
            return ctx.replyWithMarkdown(formatInfo);
          })         
          .catch(error => console.log(error))
    }

    if (ctx.message.text == 'Метали'){
      const dataMetal = await fetch(process.env.NBY)
      .then(res => res.json())
      .then(dataM => {
        formatInfo = `*Курс банківських металів* НБУ станом на *${JSON.stringify(dataM[25].exchangedate)}* за 1 Oz (1 тройська унція = 31.10348 грам)
                 
                ${JSON.stringify(dataM[58].txt)} -> *${JSON.stringify(dataM[58].rate)}* UAH
                ${JSON.stringify(dataM[59].txt)} -> *${JSON.stringify(dataM[59].rate)}* UAH
                ${JSON.stringify(dataM[60].txt)} -> *${JSON.stringify(dataM[60].rate)}* UAH
                ${JSON.stringify(dataM[61].txt)} -> *${JSON.stringify(dataM[61].rate)}* UAH   
                `
        return ctx.replyWithMarkdown(formatInfo);
      })         
      .catch(error => console.log(error))
       
    }
    
    if (ctx.message.text == 'Калькулятор 🧮'){
      try {
        const formatInfo =`
                          ✅ Введіть кількість валюти для розрахунку: 
                          `  
       return  ctx.reply(formatInfo);
      }
      catch (error){
      }
     
    }
  }); 

  bot.help((ctx) => ctx.reply(HELP_LIST));

  bot.launch();

  console.log('Бот старт');
