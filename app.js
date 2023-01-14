require('dotenv').config();
const Telegraf = require('telegraf');
const axios = require('axios');
const currency_codes = require('currency-codes');
const Markup = require('telegraf/markup');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.start((ctx) => ctx.reply(
  `Привіт ${ctx.message.from.first_name}!
   Цей Чат-Бот надає оновлені дані про *курси валют* в режимі реального часу зі сторінок Банків України також ти зможеш отримати на поточну дату актуальний курс металів Національного Банку України
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
        let usdNum = data3[24];
        let eurNum = data3[31];
        let czkNum = data3[21];
        let chfNum = data3[3];

        let usdSum = parseFloat(JSON.stringify(usdNum.rate))*enteredInt;  
        let eurSum = parseFloat(JSON.stringify(eurNum.rate))*enteredInt;  
        let czkSum = parseFloat(JSON.stringify(czkNum.rate))*enteredInt;  
        let chfSum = parseFloat(JSON.stringify(chfNum.rate))*enteredInt;  

        let usdName = JSON.stringify(usdNum.cc);
        let eurName = JSON.stringify(eurNum.cc);
        let czkName = JSON.stringify(czkNum.cc);
        let chfName = JSON.stringify(chfNum.cc);

      formatInfo = `Курс НБУ на *${JSON.stringify(data3[25].exchangedate)}*    

        ${enteredInt} ${usdName} -> 🇺🇦 *${usdSum.toFixed(2)}*
        ${enteredInt} ${eurName} -> 🇺🇦 *${eurSum.toFixed(2)}*
        ${enteredInt} ${czkName} -> 🇺🇦 *${czkSum.toFixed(2)}*
        ${enteredInt} ${chfName} -> 🇺🇦 *${chfSum.toFixed(2)}*
        `
        console.log('',formatInfo)
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
            let monoRate = foundCurrencyMonoBank.rateBuy;
            let monoSale = foundCurrencyMonoBank.rateSell;
            let privRate = parseFloat(foundCurrencPrivateBank.buy);
            let privSale = parseFloat(foundCurrencPrivateBank.sale);
            formatInfo =
            `
            Валюта: *💶${currency.code}/UAH*, 
              Купівля / Продаж
            **Monobank  ** ⋅ *${monoRate.toFixed(2)}* / 🇺🇦*${monoSale.toFixed(2)}* 
            **ПриватБанк** ⋅ *${privRate.toFixed(2)}* / 🇺🇦*${privSale.toFixed(2)}*
            `   
        }
        
        if(enteredText == 'USD'){
          let monoRate = foundCurrencyMonoBank.rateBuy;
          let monoSale = foundCurrencyMonoBank.rateSell;
          let privRate = parseFloat(foundCurrencPrivateBank.buy);
          let privSale = parseFloat(foundCurrencPrivateBank.sale);
          formatInfo =
            ` Валюта: *💵${currency.code}/UAH*, 
              Купівля / Продаж
            **Monobank  ** ⋅ *${monoRate.toFixed(2)}* / 🇺🇦*${monoSale.toFixed(2)}* 
            **ПриватБанк** ⋅ *${privRate.toFixed(2)}* / 🇺🇦*${privSale.toFixed(2)}*
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
              let usdNum = data[24];
              let eurNum = data[31];
              let czkNum = data[21];
              let chfNum = data[3];

            formatInfo = `Курс НБУ на *${JSON.stringify(data[25].exchangedate)}*
              ${JSON.stringify(usdNum.cc)} 🇺🇸 -> 🇺🇦*${parseFloat(JSON.stringify(usdNum.rate)).toFixed(2)}*
              ${JSON.stringify(eurNum.cc)} 🇪🇺 -> 🇺🇦*${parseFloat(JSON.stringify(eurNum.rate)).toFixed(2)}*
              ${JSON.stringify(czkNum.cc)} 🇨🇭 -> 🇺🇦*${parseFloat(JSON.stringify(czkNum.rate)).toFixed(2)}*
              ${JSON.stringify(chfNum.cc)} 🇨🇿 -> 🇺🇦*${parseFloat(JSON.stringify(chfNum.rate)).toFixed(2)}*
            `

            return ctx.replyWithMarkdown(formatInfo);
          })         
          .catch(error => console.log(error))
    }

    if (ctx.message.text == 'Метали'){
      const dataMetal = await fetch(process.env.NBY)
      .then(res => res.json())
      .then(data => {
        let gold = data[57];
        let silver = data[58];
        let platium = data[59];
        let palladium = data[60];

        formatInfo = `*Курс банківських металів* НБУ станом на *${JSON.stringify(data[25].exchangedate)}* за 1 Oz (1 тройська унція = 31.10348 грам)     
          ${JSON.stringify(gold.txt)} -> *${JSON.stringify(gold.rate)}* UAH
          ${JSON.stringify(silver.txt)} -> *${JSON.stringify(silver.rate)}* UAH
          ${JSON.stringify(platium.txt)} -> *${JSON.stringify(platium.rate)}* UAH
          ${JSON.stringify(palladium.txt)} -> *${JSON.stringify(palladium.rate)}* UAH   
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

