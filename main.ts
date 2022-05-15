pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
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
    // console.log_value("line", track_line(False))
    // console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    // console.log_value("hue",PlanetX_RGBsensor.read_color())
    // console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    basic.pause(200)
})
