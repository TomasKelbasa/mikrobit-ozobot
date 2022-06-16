console.log("hello!")
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
let white_lightness = 500
let black_lightness = 30
let is_line_white = true
let speed = 25
let rovne = false
let stop = false
let pouzeJizda = true
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

function kalibruj(): any[] {
    let pole = []
    for (let a = 0; a < 20; a++) {
        pole.push(PlanetX_RGBsensor.readColor())
    }
    let Rmax = pole[0]
    let Rmin = pole[0]
    for (let b = 0; b < 10; b++) {
        if (pole[b] < Rmin) {
            Rmin = pole[b]
        } else if (pole[b] > Rmax) {
            Rmax = pole[b]
        }
        
    }
    return [Rmin, Rmax]
}

input.onLogoEvent(TouchButtonEvent.Pressed, function on_logo_event_pressed() {
    
    play_note(Note.A, 5)
    white_lightness = PlanetX_RGBsensor.getColorPoint()
})
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    let pausa = 4000
    let reds = []
    let greens = []
    let blues = []
    let yellows = []
    stop = true
    basic.pause(1000)
    TPBot.setWheels(0, 0)
    strip.showColor(neopixel.colors(NeoPixelColors.Red))
    basic.pause(pausa)
    let hodnotyR = kalibruj()
    colors["red"][0] = hodnotyR[0]
    colors["red"][1] = hodnotyR[1]
    music.playTone(500, 10)
    strip.showColor(neopixel.colors(NeoPixelColors.Green))
    basic.pause(pausa)
    let hodnotyG = kalibruj()
    colors["green"][0] = hodnotyG[0]
    colors["green"][1] = hodnotyG[1]
    music.playTone(500, 10)
    strip.showColor(neopixel.colors(NeoPixelColors.Blue))
    basic.pause(pausa)
    let hodnotyB = kalibruj()
    colors["blue"][0] = hodnotyB[0]
    colors["blue"][1] = hodnotyB[1]
    music.playTone(500, 10)
    strip.showColor(neopixel.colors(NeoPixelColors.Yellow))
    basic.pause(pausa)
    let hodnotyY = kalibruj()
    colors["yellow"][0] = hodnotyY[0]
    colors["yellow"][1] = hodnotyY[1]
    music.playTone(500, 10)
    strip.clear()
    stop = false
})
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
    if (!stop && !pouzeJizda) {
        hl = PlanetX_RGBsensor.readGeekHLColor()
        hue = Math.floor(hl / 100)
        lightness = hl - hue * 100
        console.logValue("hue", hue)
        console.logValue("lightness", lightness)
        strip.showColor(neopixel.hsl(hue, 100, 50))
        if (lightness + 100 < white_lightness && lightness - 20 > black_lightness) {
            if (colors["red"][0] + 5 >= hue || colors["red"][1] - 5 <= hue) {
                // červená
                // 180° STUPŇŮ
                play_note(Note.C, 100)
                TPBot.setTravelTime(TPBot.DriveDirection.Left, 50, 1.4)
                potvrzeno = false
            } else if (colors["yellow"][0] - 5 < hue && hue < colors["yellow"][1] + 5) {
                // žlutá
                // ROVNĚ
                play_note(Note.E, 100)
                TPBot.setTravelTime(TPBot.DriveDirection.Forward, speed, 1)
                potvrzeno = false
            } else if (colors["green"][0] - 5 < hue && hue < colors["green"][1] + 5) {
                // zelená
                // VPRAVO
                play_note(Note.G, 100)
                TPBot.setTravelTime(TPBot.DriveDirection.Forward, 40, 0.5)
                TPBot.setTravelTime(TPBot.DriveDirection.Right, 50, 0.7)
                play_note(Note.E, 100)
            } else if (colors["blue"][0] - 5 < hue && hue < colors["blue"][1] + 5) {
                // modrá
                // VLEVO
                if (potvrzeno) {
                    play_note(Note.FSharp5, 100)
                    TPBot.setTravelTime(TPBot.DriveDirection.Forward, 40, 1)
                    TPBot.setTravelTime(TPBot.DriveDirection.Left, 50, 0.4)
                    potvrzeno = false
                } else {
                    TPBot.setWheels(speed, speed)
                    potvrzeno = true
                    basic.pause(100)
                }
                
            }
            
        }
        
    }
    
    if (!stop && !rovne) {
        line_direction = track_line(is_line_white)
        if (line_direction == 3) {
            TPBot.setWheels(speed, speed)
        } else if (line_direction == 2) {
            while (track_line(is_line_white) == 2) {
                TPBot.setTravelTime(TPBot.DriveDirection.Left, speed, 0.01)
            }
        } else if (line_direction == 1) {
            while (track_line(is_line_white) == 1) {
                TPBot.setTravelTime(TPBot.DriveDirection.Right, speed, 0.01)
            }
        } else if (line_direction == 0) {
            TPBot.setWheels(speed, speed)
        } else {
            play_note(Note.A, music.beat(8))
        }
        
    }
    
    console.logValue("time", control.millis() - t1)
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
input.onButtonPressed(Button.AB, function on_button_pressed_ab() {
    
    play_note(Note.D, 5)
    black_lightness = PlanetX_RGBsensor.getColorPoint()
})
