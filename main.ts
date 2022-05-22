pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
let colors = {
    "red" : [20, 350],
    "yellow" : [70, 80],
    "green" : [120, 140],
    "blue" : [210, 225],
}

let hysteresis = 10
let black_lightness = 20
function track_line(white_line: boolean = true) {
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
    // console.log_value("line", track_line(False))
    console.logValue("lightness", PlanetX_RGBsensor.getColorPoint())
    // console.log_value("hue",PlanetX_RGBsensor.read_color())
    console.logValue("dist", TPBot.sonarReturn(TPBot.SonarUnit.Centimeters, 300))
    // basic.pause(200)
    let lightness = PlanetX_RGBsensor.getColorPoint()
    if (TPBot.sonarReturn(TPBot.SonarUnit.Centimeters, 300) < 30) {
        TPBot.stopCar()
    } else if (lightness < black_lightness + 20) {
        TPBot.setTravelSpeed(TPBot.DriveDirection.Forward, 0)
    } else {
        TPBot.setTravelSpeed(TPBot.DriveDirection.Forward, 70)
    }
    
})
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    black_lightness = PlanetX_RGBsensor.getColorPoint()
})
