console.log("hello!")
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

white_lightness = 500
black_lightness = 30

is_line_white = True
speed = 25

rovne = False
stop = False

pouzeJizda = True

potvrzeno = False

def play_note(tone, ms):
    def fn():
        music.play_tone(tone, ms)
    
    control.in_background(fn)

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
            Rmin = pole[b]
        elif pole[b] > Rmax:
            Rmax = pole[b]
    return [Rmin, Rmax]
        
def on_forever():

    global speed,colors, stop, white_lightness, black_lightness, potvrzeno

    t1 = control.millis()

    #console.log_value("line", track_line(False))
    #console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    #console.log_value("hue",PlanetX_RGBsensor.read_color())
    #console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    #basic.pause(200)
    #lightness = PlanetX_RGBsensor.get_color_point()

    if not stop and not pouzeJizda:
        hl = PlanetX_RGBsensor.read_geek_hl_color()

        hue = Math.floor(hl / 100)
        lightness = hl - (hue * 100)

        console.log_value("hue", hue)
        console.log_value("lightness", lightness)

        strip.show_color(neopixel.hsl(hue, 100, 50))
        
        if (lightness+100 < white_lightness) and (lightness-20 > black_lightness):
            if (colors["red"][0] + 5 >= hue) or (colors["red"][1] - 5 <= hue):
                #červená
                #180° STUPŇŮ
                play_note(Note.C, 100)
                TPBot.set_travel_time(TPBot.DriveDirection.LEFT, 50, 1.4)
                potvrzeno = False
            elif (colors["yellow"][0]-5 < hue) and (hue < colors["yellow"][1]+5):
                #žlutá
                #ROVNĚ
                play_note(Note.E, 100)
                TPBot.set_travel_time(TPBot.DriveDirection.FORWARD, speed, 1)
                potvrzeno = False
            elif (colors["green"][0]-5 < hue) and (hue < colors["green"][1]+5):
                #zelená
                #VPRAVO
                play_note(Note.G, 100)
                TPBot.set_travel_time(TPBot.DriveDirection.FORWARD, 40, 0.5)
                TPBot.set_travel_time(TPBot.DriveDirection.RIGHT, 50, 0.7)
                play_note(Note.E, 100)
            elif (colors["blue"][0]-5 < hue) and (hue < colors["blue"][1]+5):
                #modrá
                #VLEVO
                if potvrzeno:
                    play_note(Note.FSHARP5, 100)
                    TPBot.set_travel_time(TPBot.DriveDirection.FORWARD, 40, 1)
                    TPBot.set_travel_time(TPBot.DriveDirection.LEFT, 50, 0.4)
                    potvrzeno = False
                else:
                    TPBot.set_wheels(speed, speed)
                    potvrzeno = True
                    basic.pause(100)
    
    if not stop and not rovne:
        line_direction = track_line(is_line_white)
        if line_direction == 3:
            TPBot.set_wheels(speed, speed)
        elif line_direction == 2:
            while track_line(is_line_white) == 2:
                TPBot.set_travel_time(TPBot.DriveDirection.LEFT, speed, 0.01)
        elif line_direction == 1:
            while track_line(is_line_white) == 1:
                TPBot.set_travel_time(TPBot.DriveDirection.RIGHT, speed, 0.01)
        elif line_direction == 0:
            TPBot.set_wheels(speed, speed)
        else:
            play_note(Note.A, music.beat(8))

    console.log_value("time", control.millis() - t1)

def on_logo_event_pressed():
    global white_lightness
    play_note(Note.A, 5)
    white_lightness = PlanetX_RGBsensor.get_color_point()
input.on_logo_event(TouchButtonEvent.PRESSED, on_logo_event_pressed)

def on_button_pressed_a():
    global stop, colors
    pausa = 4000
    reds = []
    greens = []
    blues = []
    yellows = []

    stop = True
    basic.pause(1000)
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
    strip.clear()
    stop = False

input.on_button_pressed(Button.A, on_button_pressed_a)

basic.forever(on_forever)

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

def on_button_pressed_ab():
    global black_lightness
    play_note(Note.D, 5)
    black_lightness = PlanetX_RGBsensor.get_color_point()
input.on_button_pressed(Button.AB, on_button_pressed_ab)