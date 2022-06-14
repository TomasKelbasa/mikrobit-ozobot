pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
pins.setPull(DigitalPin.P16, PinPullMode.PullNone)
let colors = {
    "red" : [20, 350],
    "yellow" : [70, 80],
    "green" : [120, 140],
    "blue" : [210, 225],
}

let hysteresis = 10
let black_lightness = 20
let white_lightness = 400
let is_line_white = true
let speed = 40
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
    console.logValue("hue", PlanetX_RGBsensor.readColor())
    // console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    // basic.pause(200)
    // lightness = PlanetX_RGBsensor.get_color_point()
    // hue = PlanetX_RGBsensor.get_color_point()
    // if 120 < hue < 140:
    //    music.play_tone(Note.E, music.beat(10)) 
    let line_direction = track_line(is_line_white)
    if (line_direction == 3) {
        TPBot.setWheels(speed, speed)
    } else if (line_direction == 2) {
        TPBot.setWheels(0, speed)
    } else if (line_direction == 1) {
        TPBot.setWheels(speed, 0)
    } else if (line_direction == 0) {
        TPBot.setWheels(speed, speed)
    } else {
        music.playTone(Note.A, music.beat(8))
    }
    
})
function onIn_background() {
    let hue: number;
    
    while (true) {
        hue = PlanetX_RGBsensor.readColor()
        console.logValue("hue", hue)
        if (hue <= 20 || hue >= 350) {
            // červená
            music.playTone(Note.C, 100)
            
        } else if (70 < hue && hue < 80) {
            // žlutá
            music.playTone(Note.E, 100)
            
        } else if (120 < hue && hue < 140) {
            // zelená
            music.playTone(Note.G, 100)
            
        } else if (210 < hue && hue < 225) {
            // modrá
            music.playTone(Note.FSharp5, 100)
            
        }
        
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
        `)
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
