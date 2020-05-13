const Gpio = require('onoff').Gpio
const fs = require('fs')
const path = require('path')

fs.readFile(path.join(__dirname,'settings.json'), (err, content)=> {
  	if(err){
  		throw err
  	} else {
    		const ports = JSON.parse(content)['ports_out']['ports']
    		console.log(ports)
	    var states = {};
	    [,,command,...out_state] = process.argv 
	    if(command=='set'){
		out_state.forEach(e => {
			let gpio_idx = ports[e.split(':')[0]]
			let gpio_val = e.split(':')[1]=='on' ? 1 : 0
			states[gpio_idx] = gpio_val
		})
		for(port in states){
			console.log(port, states[port])
			const p = new Gpio(port, 'out')
			p.writeSync(states[port])
		}
	    } else
	    if(command == 'on'){
			for(port in ports){
				const p = new Gpio(ports[port],'out')
				p.writeSync(1)
			}
	    } else
	    if(command == 'off'){
		for(port in ports){
			const p = new Gpio(ports[port],'out')
			p.writeSync(0)
			}
	    } else {
		console.log(`Unknown command
			     use:
			     node index on // all ON
			     node index off // all OFF
			     node index set 1:on 2:off 3:on 4:off`)
		}
  }

})







