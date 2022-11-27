

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

bot.hears(/^[A-Z]+$/i, async (ctx) => {
  const enteredText = ctx.message.text;
  const currency = currency_codes.code(enteredText) 
  if(!currency){
    return ctx.reply('Валюту не знайдено')
  }
  try {
    const currencyObj = await axios.get(process.env.API_MONOBANK)
    const foundCurrency = currencyObj.data.find((cur)=>{
      return cur.currencyCodeA.toString() === currency.number;
    }) 
    if(!foundCurrency){
      return ctx.reply('Валюту не знайдено')
    }
     //return ctx.reply(foundCurrency)

     return ctx.replyWithMarkdown(`
     Валюта: *${currency.code}*,
     Продаж: *${foundCurrency.rateSell}*,
     Купівля: *${foundCurrency.rateBuy}*,
     
     `)
  } catch (error) {
    console.log(error)
    return ctx.reply('Спробуй ще раз')
  }

})

bot.on('text', async (ctx) => {});
 
bot.launch();

console.log('Бот старт');