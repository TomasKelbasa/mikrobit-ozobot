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
let is_line_white = true
let stop = false
TPBot.setTravelSpeed(TPBot.DriveDirection.Forward, 50)
function track_line(white_line: boolean) {
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
    // basic.pause(200)
    let lightness = PlanetX_RGBsensor.getColorPoint()
    let line_direction = track_line(is_line_white)
    if (line_direction == 3) {
        
    } else if (line_direction == 2) {
        TPBot.setWheels(30, 20)
    } else if (line_direction == 1) {
        TPBot.setWheels(20, 30)
    } else if (line_direction == 0) {
        
    } else {
        music.playTone(Note.A, music.beat(8))
    }
    
})
function onIn_background() {
    
    while (true) {
        if (TPBot.sonarReturn(TPBot.SonarUnit.Centimeters, 300) < 25) {
            stop = true
            TPBot.stopCar()
        } else {
            stop = false
            TPBot.setTravelSpeed(TPBot.DriveDirection.Forward, 50)
        }
        
        control.waitMicros(1000)
        console.logValue("stop", stop)
    }
}

// control.in_background(onIn_background)
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    black_lightness = PlanetX_RGBsensor.getColorPoint()
})
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    if (is_line_white) {
        basic.showLeds(`
        . . # . .
        . . # . .
        . . # . .
        . . # . .
        . . # . .
        `, 0)
    } else {
        basic.showLeds(`
        # # . # #
        # # . # #
        # # . # #
        # # . # #
        
        # # . # #
        `, 0)
    }
    
    is_line_white = !is_line_white
})
