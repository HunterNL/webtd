

export function createGameLoop(updateInterval:number, loop: (dt:number) => any) {
    let lastLoopTime: number
    let intervalHandle: number;

    function loopWrapper() {
        const currentDate = Date.now();
        const dt = currentDate - lastLoopTime;
        lastLoopTime = currentDate;
        loop(dt/1000) //ms -> s
    }

    function start() {
        lastLoopTime = Date.now();
        intervalHandle = window.setInterval(loopWrapper,updateInterval)
    }

    function stop() {
        window.clearInterval(intervalHandle);
    }

    return {
        start,stop
    }
}