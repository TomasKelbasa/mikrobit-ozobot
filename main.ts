console.log("hello!")
pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
let strip = neopixel.create(DigitalPin.P8, 8, NeoPixelMode.RGB)
strip.showRainbow()
let colors = {
    "red" : [20, 350],
    "yellow" : [70, 80],
    "green" : [120, 140],
    "blue" : [210, 225],
}

let hysteresis = 10
let white_lightness = 1000
let black_lightness = 65
let is_line_white = true
let speed = 30
//  max 100
let tracking_dir = 1
//  tracking_dir: 0 = left line border, 1 = center, 2 = right line border
let stop = false
let pouzeJizda = false
let potvrzeno = false
function play_note(tone: number, ms: number) {
    control.inBackground(function fn() {
        music.playTone(tone, ms)
    })
}

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
    let hl: number;
    let hue: number;
    let lightness: number;
    let line_direction: any;
    
    let t1 = control.millis()
    // console.log_value("line", track_line(False))
    // console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    // console.log_value("hue",PlanetX_RGBsensor.read_color())
    // console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    // basic.pause(200)
    // lightness = PlanetX_RGBsensor.get_color_point()
    if (!pouzeJizda) {
        if (TPBot.sonarReturn(TPBot.SonarUnit.Centimeters, 300) > 15) {
            stop = false
        } else {
            TPBot.stopCar()
            stop = true
        }
        
        // přečte zároveň hue a lightness a sloučí hodnoty do jednoho čísla
        hl = PlanetX_RGBsensor.readGeekHLColor()
        // rozložení hodnot
        hue = Math.floor(hl / 100)
        lightness = hl - hue * 100
        console.logValue("hue", hue)
        console.logValue("lightness", lightness)
        strip.showColor(neopixel.hsl(hue, 100, 50))
        if (lightness + 500 < white_lightness && lightness - 15 > black_lightness) {
            if (colors["red"][0] >= hue || colors["red"][1] - 30 <= hue) {
                // červená
                // 180° STUPŇŮ
                play_note(Note.C, 100)
                TPBot.setTravelTime(TPBot.DriveDirection.Left, 50, 1.05)
                potvrzeno = false
            } else if (colors["yellow"][0] - 10 < hue && hue < colors["yellow"][1] + 10) {
                // žlutá
                // ROVNĚ
                play_note(Note.E, 100)
                // TPBot.set_travel_time(TPBot.DriveDirection.FORWARD, speed, 1)
                potvrzeno = false
            } else if (colors["green"][0] < hue && hue < colors["green"][1] + 10) {
                // zelená
                // VPRAVO
                if (potvrzeno) {
                    play_note(Note.G, 100)
                    TPBot.setTravelTime(TPBot.DriveDirection.Forward, speed, 0.5)
                    TPBot.setTravelTime(TPBot.DriveDirection.Right, 50, 0.55)
                    potvrzeno = false
                } else {
                    TPBot.setWheels(speed, speed)
                    potvrzeno = true
                    basic.pause(50)
                }
                
            } else if (colors["blue"][0] < hue && hue < colors["blue"][1]) {
                // modrá
                // VLEVO
                if (potvrzeno) {
                    play_note(Note.FSharp5, 100)
                    TPBot.setTravelTime(TPBot.DriveDirection.Forward, speed, 0.5)
                    TPBot.setTravelTime(TPBot.DriveDirection.Left, 50, 0.55)
                    potvrzeno = false
                } else {
                    TPBot.setWheels(speed, speed)
                    potvrzeno = true
                    basic.pause(100)
                }
                
            } else {
                potvrzeno = false
            }
            
        }
        
    }
    
    if (!stop) {
        line_direction = track_line(is_line_white)
        if (line_direction == 3) {
            TPBot.setWheels(speed, speed)
        } else if (line_direction == 2) {
            while (track_line(is_line_white) == 2) {
                TPBot.setTravelTime(TPBot.DriveDirection.Left, speed, 0.01)
            }
        } else if (line_direction == 1) {
            // TPBot.set_wheels(0, speed+10)
            while (track_line(is_line_white) == 1) {
                TPBot.setTravelTime(TPBot.DriveDirection.Right, speed, 0.01)
            }
        } else if (line_direction == 0) {
            // TPBot.set_wheels(speed+10, 0)
            TPBot.setWheels(speed, speed)
        } else {
            play_note(Note.A, music.beat(8))
        }
        
    }
    
    console.logValue("time", control.millis() - t1)
})
// přepínání barvy čáry
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
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
// kalibrace lightness černé barvy
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    play_note(Note.D, 5)
    black_lightness = PlanetX_RGBsensor.getColorPoint()
    basic.showNumber(black_lightness)
})
// kalibrace lightness bílé barvy
input.onLogoEvent(TouchButtonEvent.Pressed, function on_logo_event_pressed() {
    
    play_note(Note.D, 5)
    white_lightness = PlanetX_RGBsensor.getColorPoint()
    basic.showNumber(white_lightness)
})
