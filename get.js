const fs = require('fs')
const path = require('path')
const Gpio = require('onoff').Gpio
const ZabbixSender = require('node-zabbix-sender')




function getParams(){
	return new Promise((res, rej) => {
		fs.readFile(path.join(__dirname, 'settings.json'), (err, content) => {
			if(err) {
				rej(err)
			} else {
				res(JSON.parse(content))
			}
		})
	})
}



function runHooks(params, sender){
	let gpios = []
	for(let param in params['ports_in']['ports']){
		
		gpio_in = new Gpio(params['ports_in']['ports'][param], 'in', 'both', {debounceTimeout: params["ports_in"]["debounceTimeout"]})
		gpio_in.read((err, value) => {
			if(err){
				console.log('Error in initial read')
				console.log(err)
			} else {
				sender.addItem(params.zabbix.host, `input_${param}`, value).send((err, res) => {
					console.log('Reading and sending initial values')
					if(err) {
						console.log(err)
					} else {
						console.log(res)
					}
				})
			}

		})
		gpio_in.watch((err, value) => {
			if(err) {
				throw err
			} else {
				console.log(`${param} : ${value}`)

				sender.addItem(params.zabbix.host,`input_${param}`, value).send((err, res) => {
					if(err){
						console.log(err)
					} else {
						console.log(res)
					}

				})
			}
		
		})
		gpios.push(gpio_in)
	
	}
	return gpios
}

function initialSend(sender){

}


getParams()
	.then(params => {
		const sender = new ZabbixSender({
			host : params.zabbix.server
		})
		
		initialSend(sender)

		const gpios  = runHooks(params, sender)
		console.log(gpios)
		process.on('SIGINT', _ => {
			for(gp in gpios){
				gpios[gp].unexport()
				console.log(`${gp} unexported`)
			}
		})


	})
	.catch(error => {
		console.log(error)
	})








