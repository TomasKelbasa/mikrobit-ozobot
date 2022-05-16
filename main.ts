pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
let colors = {
    "red" : [20, 350],
    "yellow" : [70, 80],
    "green" : [120, 140],
    "blue" : [210, 225],
}

let hysteresis = 10
function track_line(white_line: boolean = false) {
    let left_tracking = pins.digitalReadPin(DigitalPin.P13)
    let right_tracking = pins.digitalReadPin(DigitalPin.P14)
    if (left_tracking == 0 && right_tracking == 0) {
        return white_line ? 3 : 0
    } else if (left_tracking == 1 && right_tracking == 0) {
        return white_line ? 2 : 1
    } else if (left_tracking == 0 && right_tracking == 1) {
        return white_line ? 1 : 2
    } else if (left_tracking == 1 && right_tracking == 1) {
        return white_line ? 0 : 3
    } else {
        return -1
    }
    
}

basic.forever(function on_forever() {
    console.logValue("line", track_line(false))
    console.logValue("lightness", PlanetX_RGBsensor.getColorPoint())
    console.logValue("hue", PlanetX_RGBsensor.readColor())
    console.logValue("dist", TPBot.sonarReturn(TPBot.SonarUnit.Centimeters, 300))
    basic.pause(200)
})
