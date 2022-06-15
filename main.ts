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
let speed = 20
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

basic.forever(function on_forever() {
    let pausa: number;
    let reds: any[];
    let greens: any[];
    let blues: any[];
    let yellows: any[];
    let hodnotyR: any[];
    let hodnotyG: any[];
    let hodnotyB: any[];
    let hodnotyY: any[];
    let line_direction: any;
    
    // console.log_value("line", track_line(False))
    // console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    // console.log_value("hue",PlanetX_RGBsensor.read_color())
    // console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    // basic.pause(200)
    // lightness = PlanetX_RGBsensor.get_color_point()
    if (input.buttonIsPressed(Button.A)) {
        pausa = 4000
        reds = []
        greens = []
        blues = []
        yellows = []
        stop = true
        TPBot.setWheels(0, 0)
        strip.showColor(neopixel.colors(NeoPixelColors.Red))
        basic.pause(pausa)
        hodnotyR = kalibruj()
        colors["red"][0] = hodnotyR[0]
        colors["red"][1] = hodnotyR[1]
        music.playTone(500, 10)
        strip.showColor(neopixel.colors(NeoPixelColors.Green))
        basic.pause(pausa)
        hodnotyG = kalibruj()
        colors["green"][0] = hodnotyG[0]
        colors["green"][1] = hodnotyG[1]
        music.playTone(500, 10)
        strip.showColor(neopixel.colors(NeoPixelColors.Blue))
        basic.pause(pausa)
        hodnotyB = kalibruj()
        colors["blue"][0] = hodnotyB[0]
        colors["blue"][1] = hodnotyB[1]
        music.playTone(500, 10)
        strip.showColor(neopixel.colors(NeoPixelColors.Yellow))
        basic.pause(pausa)
        hodnotyY = kalibruj()
        colors["yellow"][0] = hodnotyY[0]
        colors["yellow"][1] = hodnotyY[1]
        music.playTone(500, 10)
        stop = false
        strip.clear()
        control.inBackground(function onIn_Background() {
            let hue: number;
            while (true) {
                hue = PlanetX_RGBsensor.readColor()
                if (hue <= 20 || hue >= 350) {
                    // červená
                    music.playTone(Note.C, 100)
                    // otočení
                    
                } else if (colors["yellow"][0] - 10 < hue && hue < colors["yellow"][1] + 10) {
                    // žlutá
                    music.playTone(Note.E, 100)
                    // pokračuje rovně
                    
                } else if (colors["green"][0] - 10 < hue && hue < colors["green"][1] + 10) {
                    // zelená
                    music.playTone(Note.G, 100)
                    // zahne vpravo
                    // za
                    
                } else if (colors["blue"][0] - 10 < hue && hue < colors["blue"][1] + 10) {
                    // modrá
                    music.playTone(Note.FSharp5, 100)
                    // zahne vlevo
                    
                }
                
            }
        })
    }
    
    if (!stop) {
        line_direction = track_line(is_line_white)
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
        
    }
    
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
