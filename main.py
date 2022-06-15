pins.set_pull(DigitalPin.P13, PinPullMode.PULL_NONE)
pins.set_pull(DigitalPin.P14, PinPullMode.PULL_NONE)

strip = neopixel.create(DigitalPin.P8, 8, NeoPixelMode.RGB)

colors = {
    "red": [20, 350],
    "yellow": [70, 80],
    "green": [120, 140],
    "blue": [210, 225]
}


strip.show_rainbow()

hysteresis = 10

is_line_white = True
speed = 20

stop = False

TPBot.set_travel_speed(TPBot.DriveDirection.FORWARD, 50)

def track_line(white_line):
    left_tracking = pins.digital_read_pin(DigitalPin.P13);
    right_tracking = pins.digital_read_pin(DigitalPin.P14);
    if left_tracking == 0 and right_tracking == 0:
        return 3 if white_line else 0
    elif left_tracking == 1 and right_tracking == 0:
        return 2 if white_line else 1
    elif left_tracking == 0 and right_tracking == 1:
        return 1 if white_line else 2
    elif left_tracking == 1 and right_tracking == 1:
        return 0 if white_line else 3
    else:
        return -1;

def kalibruj():
    pole = []

    for a in range(0, 20):
            pole.append(PlanetX_RGBsensor.read_color())
    Rmax = pole[0]
    Rmin = pole[0]
    for b in range(0, 10):
        if pole[b] < Rmin:
            pole = pole[b]
        elif pole[b] > Rmax:
            Rmax = pole[b]
    return [Rmin, Rmax]
        
def on_forever():

    global speed,colors, stop

    #console.log_value("line", track_line(False))
    console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    console.log_value("hue",PlanetX_RGBsensor.read_color())
    #console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    #basic.pause(200)
    #lightness = PlanetX_RGBsensor.get_color_point()
    
    if input.button_is_pressed(Button.A):
        pausa = 4000

        reds = []
        greens = []
        blues = []
        yellows = []

        stop = True
        TPBot.set_wheels(0,0)

        strip.show_color(neopixel.colors(NeoPixelColors.RED))
        basic.pause(pausa)
        hodnotyR = kalibruj()
        colors["red"][0] = hodnotyR[0]
        colors["red"][1] = hodnotyR[1]
        music.play_tone(500, 10)
        strip.show_color(neopixel.colors(NeoPixelColors.GREEN))
        basic.pause(pausa)
        hodnotyG = kalibruj()
        colors["green"][0] = hodnotyG[0]
        colors["green"][1] = hodnotyG[1]
        music.play_tone(500, 10)
        strip.show_color(neopixel.colors(NeoPixelColors.BLUE))
        basic.pause(pausa)
        hodnotyB = kalibruj()
        colors["blue"][0] = hodnotyB[0]
        colors["blue"][1] = hodnotyB[1]
        music.play_tone(500, 10)
        strip.show_color(neopixel.colors(NeoPixelColors.YELLOW))
        basic.pause(pausa)
        hodnotyY = kalibruj()
        colors["yellow"][0] = hodnotyY[0]
        colors["yellow"][1] = hodnotyY[1]
        music.play_tone(500, 10)

        stop = False
        strip.clear()

    if not stop:
        line_direction = track_line(is_line_white)
        if line_direction == 3:
            TPBot.set_wheels(speed, speed)
        elif line_direction == 2:
            TPBot.set_wheels(0, speed)
        elif line_direction == 1:
            TPBot.set_wheels(speed, 0)
        elif line_direction == 0:
            TPBot.set_wheels(speed, speed)
        else:
            music.play_tone(Note.A, music.beat(8))

    


def onIn_background():
    global colors,stop
    while True:
        if not stop:
            hue = PlanetX_RGBsensor.read_color()
            strip.show_color(neopixel.hsl(hue, 100, 30))
            if (hue <= 20) or (hue >= 350):
                #červená
                music.play_tone(Note.C, 100)
                pass
            elif colors["yellow"][0]-5 < hue < colors["yellow"][1]+5:
                #žlutá
                music.play_tone(Note.E, 100)
                pass
            elif colors["green"][0]-5 < hue < colors["green"][1]+5:
                #zelená
                music.play_tone(Note.G, 100)
                pass
            elif colors["blue"][0]-5 < hue < colors["blue"][1]+5:
                #modrá
                music.play_tone(Note.FSHARP5, 100)
                pass
control.in_background(onIn_background)

def on_button_pressed_b():
    global is_line_white

    if is_line_white:
        basic.show_leds("""
        . . # . .
        . . # . .
        . . # . .
        . . # . .
        . . # . .
        """)
    else:
        basic.show_leds("""
        # # . # #
        # # . # #
        # # . # #
        # # . # #
        # # . # #
        """, 0)
    is_line_white = not is_line_white
input.on_button_pressed(Button.B, on_button_pressed_b) 