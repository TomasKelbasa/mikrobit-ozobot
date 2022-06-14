pins.set_pull(DigitalPin.P13, PinPullMode.PULL_NONE)
pins.set_pull(DigitalPin.P14, PinPullMode.PULL_NONE)
pins.set_pull(DigitalPin.P16, PinPullMode.PULL_NONE)

colors = {
    "red": [20, 350],
    "yellow": [70, 80],
    "green": [120, 140],
    "blue": [210, 225]
}
hysteresis = 10

black_lightness = 20
white_lightness = 400
is_line_white = True
speed = 40

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
        
def on_forever():
    global speed

    #console.log_value("line", track_line(False))
    #console.log_value("lightness",PlanetX_RGBsensor.get_color_point())
    console.log_value("hue",PlanetX_RGBsensor.read_color())
    #console.log_value("dist", TPBot.sonar_return(TPBot.SonarUnit.CENTIMETERS, 300))
    #basic.pause(200)
    #lightness = PlanetX_RGBsensor.get_color_point()

    #hue = PlanetX_RGBsensor.get_color_point()
    #if 120 < hue < 140:
     #   music.play_tone(Note.E, music.beat(10)) 
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

basic.forever(on_forever)

def onIn_background():
    global white_lightness
    while True:
        hue = PlanetX_RGBsensor.read_color()
        console.log_value("hue", hue)
        if (hue <= 20) or (hue >= 350):
            #červená
            music.play_tone(Note.C, 100)
            pass
        elif 70 < hue < 80:
            #žlutá
            music.play_tone(Note.E, 100)
            pass
        elif 120 < hue < 140:
            #zelená
            music.play_tone(Note.G, 100)
            pass
        elif 210 < hue < 225:
            #modrá
            music.play_tone(Note.FSHARP5, 100)
            pass
#control.in_background(onIn_background)

def on_button_pressed_a():
    global black_lightness
    black_lightness = PlanetX_RGBsensor.get_color_point()
input.on_button_pressed(Button.A, on_button_pressed_a)


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