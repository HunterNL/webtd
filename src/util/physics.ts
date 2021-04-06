export function changeVelocityDistance(currentSpeed: number, targetSpeed: number, acceleration: number) {
    const speedDifference = Math.abs(targetSpeed) - currentSpeed;
    const accelerationDuration = speedDifference / acceleration;

    return distanceTraveled(Math.min(currentSpeed,targetSpeed), accelerationDuration) + distanceTraveled(speedDifference, accelerationDuration) / 2
}

export function stoppingDistance(speed: number, acceleration: number): number {
    const accelerationDuration = speed / acceleration;

    return distanceTraveled(speed, accelerationDuration) / 2;
}

export function distanceTraveled(speed: number, time: number): number { // m/s,s : m
    return speed * time;
}