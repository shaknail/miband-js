'use strict';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function test_all(miband, log) {
	var lat = "";
	var lon = "";
	function getLocation() {
	  if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	  } 
	}

	function showPosition(position) {
	  lat =  position.coords.latitude;
	  lon = position.coords.longitude; 
	}
	getLocation();
	var socket = new WebSocket("wss://miband.ru.com:8083");
	const name = document.querySelector('#name');
const userName = name.value;
  let info = {
    time:     await miband.getTime(),
    battery:  await miband.getBatteryInfo(),
    hw_ver:   await miband.getHwRevision(),
    sw_ver:   await miband.getSwRevision(),
    serial:   await miband.getSerial()
	
  }

  log(`HW ver: ${info.hw_ver}  SW ver: ${info.sw_ver}`);
  info.serial && log(`Serial: ${info.serial}`);
  log(`Battery: ${info.battery.level}%`);
  log(`Time: ${info.time.toLocaleString()}`);

	let result = await miband.getPedometerStats();
  log('Heart Rate Monitor (continuous for 30 sec)...')
  miband.on('heart_rate', (rate) => {
	try {
    log('Heart Rate:', rate);
	log('Steps:', result.steps);
	log(JSON.stringify({id:userName, rate:rate, steps: result.steps, action:"monitoring", lat:lat, lon:lon}));
	socket.send(JSON.stringify({id:userName, rate:rate, steps: result.steps, action:"monitoring", lat:lat, lon:lon}));
	} 
	catch (e) {
		log(e);
	}
  })
  await miband.hrmStart();
  
  while (true) {
	  result = await miband.getPedometerStats();
	  await delay(10000);
  }

  //log('RAW data (no decoding)...')
  //miband.rawStart();
  //await delay(30000);
  //miband.rawStop();

  log('Finished.')
}

module.exports = test_all;
