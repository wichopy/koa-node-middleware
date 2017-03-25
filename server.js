const koa = require('koa');
const app = new koa();
const http = require('http');

var rp = require('request-promise');

app.use(async(ctx, next) => {
    // Step 1: Log start date
    const start = new Date;
    console.log(`Started at: ${start}`);

    await next(); // Step 2:  Go to the next middleware, the execution of the next two lines is paused
    // Step 7: Do stuff after body is set and Step 6 
    console.log('Back at top of middleware flow.')
    const ms = new Date - start;
    console.log(`Method: ${ctx.method}, URL: ${ctx.url} - Elapsed: ${ms}ms`);
});

// Step 3: Do stuff
//grab ip location and weather info
app.use(async(ctx, next) => {
    const ipInfo = await rp('http://ip-api.com/json')
    var parsedIpInfo = JSON.parse(ipInfo)
    var lat = parsedIpInfo.lat
    var lon = parsedIpInfo.lon
    ctx.request.lat = lat
    ctx.request.lon = lon
    const weatherInfo = await rp(`https://api.wunderground.com/api/825fab01f5420319/forecast/geolookup/conditions/q/${lat},${lon}.json`)
    ctx.body = JSON.parse(weatherInfo);
    console.log('found ip and set weather.')
    await next(); // Step 4: Go to the next middleware, the execution of the next line is paused
    // Step 6: Do stuff after body is set
    console.log('Bubbling up');
});

app.use(async(ctx) => {
    // Step 5: Body is set, "bubble" up, since there are no more next() calls
    console.log('End of middleware chain');
});

app.listen(3000);