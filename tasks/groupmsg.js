const Beanstalk = require('beanstalk-promises')
const wxhelper = require('../helpers/wx');
let client = new Beanstalk();
let handlers = {
};

function handler(job,next) {
    if(job.data && job.data.op){
        let h = handlers[job.data.op];
        if(h){
            return h(job,next);
        }
    }
    return false;
}
async function main(next) {
    await client.connect('127.0.0.1', 11300, 1000)
    await client.watchTube('group_msg');
    let job;
    try {
        job = await client.getJob();        
        if(!handler(job,next)){
            await client.deleteJob(job);
            next();
        }
    } catch (e) {
        if (job) {
            await client.deleteJob(job);
        }
    }
    client.quit();
}
module.exports = main;
handlers.start_group = async function(job,next){       
    console.log(job.data);
    if(job.data && job.data.time){
        let passedSeconds = parseInt((new Date().getTime()/1000 - job.data.time)); 
        if(passedSeconds > 5){ // after 5 seconds
            client.deleteJob(job);
            next();                
            console.debug('delete job'+job.id);
            return true;
        }
        next();     
        return true;
    }else{
        client.deleteJob(job);
        next();               
        console.debug('delete job'+job.id);
        return true;
    }
    return false;
};