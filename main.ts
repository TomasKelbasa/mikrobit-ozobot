pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
let strip = neopixel.create(DigitalPin.P8, 8, NeoPixelMode.RGB)
let colors = {
    "red" : [20, 350],
    "yellow" : [70, 80],
    "green" : [120, 140],
    "blue" : [210, 225],
}

strip.showRainbow()
let hysteresis = 10
let is_line_white = true
let speed = 10
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


basic.forever(
)
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
