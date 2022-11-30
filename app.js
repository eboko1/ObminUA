

require('dotenv').config();
const Telegraf = require('telegraf');
const axios = require('axios');
const currency_codes = require('currency-codes');
const timestamp = require('unix-timestamp');

//const Markup = require('telegraf/markup');
//const Сurency_LIST = require('./constants');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx =>{
  return ctx.reply('Обмін валют')
});


bot.help((ctx) => ctx.reply(COUNTRIES_LIST));

bot.hears(/^[A-Z][a-z]+$/i, async (ctx) => {
  const enteredText = ctx.message.text;
  const currency = currency_codes.code(enteredText) 
  if(!currency){
    return ctx.reply('Валюту не знайдено')
  }
  try {
    const currencyObjMonoBank = await axios.get(process.env.API_MONOBANK)
    const currencyObjPrivateBank = await axios.get(process.env.API_PRIVATEBANK)
  
    const foundCurrencyMonoBank = currencyObjMonoBank.data.find((cur)=>{
      return cur.currencyCodeA.toString() === currency.number;
    }) 

    const foundCurrencPrivateBank = currencyObjPrivateBank.data.find((cur)=>{
      return cur.ccy === enteredText;
    }) 

    if(!foundCurrencyMonoBank ){
      return ctx.reply('Валюту не знайдено')
    }
     return ctx.replyWithMarkdown(`
     Валюта: *${currency.code}/UAH*, 
     **Monobank** ⋅ *${foundCurrencyMonoBank.rateBuy}*/*${foundCurrencyMonoBank.rateSell}*
     **ПриватБанк** ⋅ *${foundCurrencPrivateBank.buy}*/*${foundCurrencPrivateBank.sale}*
     `)
  } catch (error) {
    console.log(error)
    return ctx.reply('Спробуй ввести ще раз')
  }

})

bot.on('text', async (ctx) => {

});
 
bot.launch();

console.log('Бот старт');