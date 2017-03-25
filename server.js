const koa = require('koa');
const app = new koa();
const rp = require('request-promise');

//put my middleware function in the middle (haha) of three middleware functions. Will be called when you visit localhost:4000
app.use(async(ctx, next) => {
    const start = new Date;
    console.log(`Started at: ${start}`);
    await next();
    console.log('Back at top of middleware flow.')
        //output response for viewing.
    ctx.body = {
        lat: ctx.request.lat,
        lon: ctx.request.lon,
        weather_icon: ctx.request.weather_icon,
        weather_temp_C: ctx.request.temp_in_C
    }
    const ms = new Date - start;
    console.log(`Method: ${ctx.method}, URL: ${ctx.url} - Elapsed: ${ms}ms`);
});

app.use(async(ctx, next) => {
    const ipInfo = await rp('http://ip-api.com/json')
    var parsedIpInfo = JSON.parse(ipInfo)
    var lat = parsedIpInfo.lat
    var lon = parsedIpInfo.lon
    const weatherInfo = await rp(`https://api.wunderground.com/api/825fab01f5420319/forecast/geolookup/conditions/q/${lat},${lon}.json`)
    const parsedWeatherInfo = JSON.parse(weatherInfo);
    ctx.request.lat = lat;
    ctx.request.lon = lon;
    ctx.request.weather_icon = parsedWeatherInfo.forecast.txt_forecast.forecastday[0].icon
    ctx.request.temp_in_C = parsedWeatherInfo.forecast.simpleforecast.forecastday[0].high.celsius
    console.log('found ip and set weather.')
    await next();
    console.log('Bubbling up');
});

app.use(async(ctx) => {
    console.log('End of middleware chain');
});

const PORT = 4000;
console.log(`Listening on port ${PORT}`);
app.listen(PORT);