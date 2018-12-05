let tasks = [];

function _next(){
    this.started = false;
}
function _innerTask() {
    tasks.forEach((el) => {
        if(el.started){
           return; 
        }
        el.started = true;
        el.task && el.task(_next.bind(el));
    });
    setTimeout(_innerTask, 3000);
}

exports.addTask = function (task) {
    tasks.push({
        task: task,
        started: false
    });
    return this;
};

exports.start = function () {
    _innerTask();
};