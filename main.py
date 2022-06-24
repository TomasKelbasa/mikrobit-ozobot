console.log("hello!")
pins.set_pull(DigitalPin.P13, PinPullMode.PULL_NONE)
pins.set_pull(DigitalPin.P14, PinPullMode.PULL_NONE)

strip = neopixel.create(DigitalPin.P8, 8, NeoPixelMode.RGB)
strip.show_rainbow()

colors = {
    "red": [20, 350],
    "yellow": [70, 80],
    "green": [120, 140],
    "blue": [210, 225]
}

hysteresis = 10

white_lightness = 1000
black_lightness = 65
is_line_white = True
speed = 30
# max 100


stop = False

pouzeJizda = False

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

def on_forever():

    global speed,colors, stop, potvrzeno

    t1 = control.millis()

    #console.log_value("line", track_line(False))
    #console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    #console.log_value("hue",PlanetX_RGBsensor.read_color())
    #console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    #basic.pause(200)
    #lightness = PlanetX_RGBsensor.get_color_point()

    if not pouzeJizda:

        if TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300) > 15:
            stop = False
        else:
            TPBot.stop_car()
            stop = True

        #přečte zároveň hue a lightness a sloučí hodnoty do jednoho čísla
        hl = PlanetX_RGBsensor.read_geek_hl_color()

        #rozložení hodnot
        hue = Math.floor(hl / 100)
        lightness = hl - (hue * 100)

        console.log_value("hue", hue)
        console.log_value("lightness", lightness)

        strip.show_color(neopixel.hsl(hue, 100, 50))
        
        if (lightness+500 < white_lightness) and (lightness-15 > black_lightness):
            if (colors["red"][0] >= hue) or (colors["red"][1]-30 <= hue):
                #červená
                #180° STUPŇŮ
                play_note(Note.C, 100)
                TPBot.set_travel_time(TPBot.DriveDirection.LEFT, 50, 1.05)
                potvrzeno = False
            elif (colors["yellow"][0]-10 < hue) and (hue < colors["yellow"][1]+10):
                #žlutá
                #VLEVO
                play_note(Note.E, 100)
                TPBot.set_travel_time(TPBot.DriveDirection.FORWARD, speed, 0.5)
                TPBot.set_travel_time(TPBot.DriveDirection.LEFT, 50, 0.55)
                potvrzeno = False
            elif (colors["green"][0] < hue) and (hue < colors["green"][1]+10):
                #zelená
                #VPRAVO
                if potvrzeno:
                    play_note(Note.G, 100)
                    TPBot.set_travel_time(TPBot.DriveDirection.FORWARD, speed, 0.5)
                    TPBot.set_travel_time(TPBot.DriveDirection.RIGHT, 50, 0.55)
                    potvrzeno = False
                else:
                    TPBot.set_wheels(speed, speed)
                    potvrzeno = True
                    basic.pause(50)
            elif (colors["blue"][0] < hue) and (hue < colors["blue"][1]):
                #modrá
                #ROVNĚ
                pass
            else:   
                potvrzeno = False
    
    if not stop:
        line_direction = track_line(is_line_white)
        if line_direction == 3:
            TPBot.set_wheels(speed, speed)
        elif line_direction == 2:
            while track_line(is_line_white) == 2:
                TPBot.set_travel_time(TPBot.DriveDirection.LEFT, speed, 0.01)
                #TPBot.set_wheels(0, speed+10)
        elif line_direction == 1:
            while track_line(is_line_white) == 1:
                TPBot.set_travel_time(TPBot.DriveDirection.RIGHT, speed, 0.01)
                #TPBot.set_wheels(speed+10, 0)
        elif line_direction == 0:
            TPBot.set_wheels(speed, speed)
        else:
            play_note(Note.A, music.beat(8))

    console.log_value("time", control.millis() - t1)

basic.forever(on_forever)

#přepínání barvy čáry
def on_button_pressed_a():
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
input.on_button_pressed(Button.A, on_button_pressed_a)

#kalibrace lightness černé barvy
def on_button_pressed_b():
    global black_lightness
    play_note(Note.D, 5)
    black_lightness = PlanetX_RGBsensor.get_color_point()
    basic.show_number(black_lightness)
input.on_button_pressed(Button.B, on_button_pressed_b)

#kalibrace lightness bílé barvy
def on_logo_event_pressed():
    global white_lightness
    play_note(Note.D, 5)
    white_lightness = PlanetX_RGBsensor.get_color_point()
    basic.show_number(white_lightness)
input.on_logo_event(TouchButtonEvent.PRESSED, on_logo_event_pressed)